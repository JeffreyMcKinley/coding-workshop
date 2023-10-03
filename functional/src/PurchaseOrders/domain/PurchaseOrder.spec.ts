import { v4 } from "uuid";
import { UUID, isUuid } from "../../utilities/uuid";
import { createItem } from "./Item";
import {
  addLineItemToPO,
  submitPurchaseOrder,
  createDraftPurchaseOrder,
  createPurchaseOrder,
  PURCHASE_ORDER_STATUS,
} from "./PurchaseOrder";

describe("Purcase Order Entity", () => {
  it("does it", () => {
    const purchaser = {
      id: v4() as UUID,
      firstName: "Dave",
      lastName: "Farley",
    };
    const PO = createPurchaseOrder({
      lastPONumber: null,
      organizationName: "synapse",
      purchaser,
    });
    expect(PO.isRight()).toBeTruthy();
    const po = PO.unsafeCoerce();
    expect(isUuid(po.id)).toBeTruthy();
  });

  it("adds a line item", () => {
    const purchaser = {
      id: v4() as UUID,
      firstName: "Dave",
      lastName: "Farley",
    };
    const PO = createPurchaseOrder({
      lastPONumber: null,
      organizationName: "synapse",
      purchaser,
    });
    expect(PO.isRight()).toBeTruthy();
    const po = PO.unsafeCoerce();
    const item = createItem("125535", 4.99, "box of wing nuts");
    const POWithLineItems = addLineItemToPO({ PO: po, item, quantity: 5 });
    expect(POWithLineItems).toMatchObject({
      id: po.id,
      poNumber: "syn-000001",
      lineItems: expect.arrayContaining([
        expect.objectContaining({
          itemNumber: "125535",
          price: 4.99,
          description: "box of wing nuts",
          quantity: 5,
          id: item.id,
        }),
      ]),
    });
  });

  it("increments a PO number", () => {
    const purchaser = {
      id: v4() as UUID,
      firstName: "Dave",
      lastName: "Farley",
    };
    const PO = createPurchaseOrder({ lastPONumber: "syn-000001", purchaser });
    expect(PO.isRight()).toBeTruthy();
    const po = PO.unsafeCoerce();
    expect(po.poNumber).toBe("syn-000002");
  });

  it("saves the purchaser to the PO", () => {
    const purchaser = {
      id: v4() as UUID,
      firstName: "Dave",
      lastName: "Farley",
    };
    const PO = createPurchaseOrder({
      lastPONumber: null,
      organizationName: "synapse",
      purchaser,
    });
    expect(PO.isRight).toBeTruthy();
    const po = PO.unsafeCoerce();
    expect(po.purchaser).toEqual(purchaser);
  });

  it("creats a draft po", () => {
    const purchaser = {
      id: v4() as UUID,
      firstName: "Parker",
      lastName: "Barrows",
    };
    const PO = createDraftPurchaseOrder({
      organizationName: "synapse",
      purchaser,
    });
    expect(PO.isRight()).toBeTruthy();
    const po = PO.unsafeCoerce();
    expect(isUuid(po.id)).toBeTruthy();
    expect(po.status).toEqual(PURCHASE_ORDER_STATUS.DRAFT);
    expect(po.poNumber).toBe(null);
  });

  it("converts a draft po to a po pending approval", () => {
    const purchaser = {
      id: v4() as UUID,
      firstName: "Parker",
      lastName: "Barrows",
    };
    const DraftPO = createDraftPurchaseOrder({
      organizationName: "synapse",
      purchaser,
    });
    const item = createItem("125535", 4.99, "box of wing nuts");
    const draftPO = DraftPO.unsafeCoerce();
    const DraftPOWithLineItems = addLineItemToPO({
      PO: draftPO,
      item,
      quantity: 5,
    });
    const POForApproval = submitPurchaseOrder(DraftPOWithLineItems, null);
    const poForApproval = POForApproval.unsafeCoerce();
    expect(poForApproval.status).toEqual(
      PURCHASE_ORDER_STATUS.PENDING_APPROVAL
    );
  });
});
