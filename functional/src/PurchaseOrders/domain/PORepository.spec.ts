import { createUuid } from "../../utilities/uuid";
import { constructPORepository } from "./PORepository";
import { PURCHASE_ORDER_STATUS } from "./PurchaseOrder";

describe("PORepository", () => {
  it("fetches a list of pending approval purchase orders", async () => {
    const repo = constructPORepository();

    const purchaser = {
      id: createUuid(),
      firstName: "Parker",
      lastName: "Barrows",
    };
    const draftPurchaseOrder = {
      id: createUuid(),
      purchaser,
      poNumber: null,
      lineItems: [],
      status: PURCHASE_ORDER_STATUS.DRAFT,
      organizationName: "synapse",
    };
    const pendingPurchaseOrders = [
      {
        id: createUuid(),
        purchaser,
        poNumber: "syn000002",
        lineItems: [],
        status: PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
        organizationName: "synapse",
      },
      {
        id: createUuid(),
        purchaser,
        poNumber: "syn000003",
        lineItems: [],
        status: PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
        organizationName: "synapse",
      },
    ];
    const approvedPurchaseOrder = {
      id: createUuid(),
      purchaser,
      poNumber: "syn000001",
      lineItems: [],
      status: PURCHASE_ORDER_STATUS.APPROVED,
      organizationName: "synapse",
    };

    await repo.save(approvedPurchaseOrder);
    for (let pending of pendingPurchaseOrders) {
        await repo.save(pending);
    }
    await repo.save(draftPurchaseOrder);

    const packedResults = await repo.fetchAllPendingApproval();
    const results = packedResults.unsafeCoerce().unsafeCoerce();

    expect(results.length).toBe(2);
    expect(results[0].poNumber).toBe("syn000002");
    expect(results[1].poNumber).toBe("syn000003");
  });
});
