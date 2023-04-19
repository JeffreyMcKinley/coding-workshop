import { match } from "oxide.ts";
import { isUuid } from "../../utilities/uuid";
import { constructPORepository } from "../domain/PORepistory";
import { isPurchaseOrder } from "../domain/PurchaseOrder";
import { createPO } from "./Create-PO";

describe("Create PO Workflow", () => {
  it("is callable", () => {
    const repo = constructPORepository();
    createPO({ PORepo: repo });
  });

  it("returns a uuid", async () => {
    const repo = constructPORepository();
    const poResult = await createPO({ PORepo: repo })([]);
    const id = poResult.unwrap();
    expect(poResult.isOk()).toBeTruthy();
    expect(isUuid(id)).toBeTruthy();
  });

  it("saves a purchase order to a repository", async () => {
    const repo = constructPORepository();
    const result = await createPO({ PORepo: repo })([]);
    const id = result.unwrap();
    const poRes = await repo.fetch(id);
    const output = match(poRes, {
      Ok: {
        Some: (result) => result,
        None: () => "No results for that search.",
      },
      Err: (err) => `Error: ${err}.`,
    });

    expect(isPurchaseOrder(output)).toBeTruthy();
    if (isPurchaseOrder(output)) {
      expect(id).toEqual(output.id);
    }
  });

  it("saves the line items passed into the initial purchase order creation to that po", async () => {
    const repo = constructPORepository();
    const plantPotOrder = {
      itemNumber: '111111',
      price: 4.99,
      description: 'plant pot',
      quantity: 4000
    };
    const result = await createPO({ PORepo: repo })([plantPotOrder]);
    const id = result.unwrap();
    const poRes = await repo.fetch(id);
    const output = match(poRes, {
      Ok: {
        Some: (result) => result,
        None: () => "No results for that search.",
      },
      Err: (err) => `Error: ${err}.`,
    });

    expect(isPurchaseOrder(output)).toBeTruthy();
    if (isPurchaseOrder(output)) {
      expect(id).toEqual(output.id);
      expect(output.lineItems).toEqual(expect.arrayContaining([expect.objectContaining(plantPotOrder)]))
    }
  });
});
