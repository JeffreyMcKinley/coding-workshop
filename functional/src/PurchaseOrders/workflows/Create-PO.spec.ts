// https://github.com/gigobyte/ts-react-express-starter/blob/main/server/src/features/auth/LoginService.ts
import { UUID } from "../../utilities/uuid";
import { isUuid } from "../../utilities/uuid";
import { constructPORepository } from "../domain/PORepistory";
import { isPurchaseOrder } from "../domain/PurchaseOrder";
import { createPO } from "./Create-PO";
import { Left, Right } from "purify-ts";


describe("Create PO Workflow", () => {
  it("is callable", () => {
    const repo = constructPORepository();
    createPO({ PORepo: repo });
  });

  it("returns a uuid", async () => {
    const repo = constructPORepository();
    const poResult = await createPO({ PORepo: repo })([], "synapse");
    const id = poResult.unsafeCoerce() as UUID;
    expect(poResult.isRight()).toBeTruthy();
    expect(isUuid(id)).toBeTruthy();
  });

  it("saves a purchase order to a repository", async () => {
    const repo = constructPORepository();
    const result = await createPO({ PORepo: repo })([], "synapse");
    expect(result.isRight()).toBeTruthy();
    expect(isUuid(result.unsafeCoerce())).toBeTruthy();
    const id = result.unsafeCoerce() as UUID;
    const poRes = (await repo.fetch(id).chain(async (maybePO) =>
      maybePO.caseOf({
        Just: (_) => Right(maybePO),
        Nothing: () => Left(null),
      })
    )).unsafeCoerce().unsafeCoerce();

    expect(isPurchaseOrder(poRes)).toBeTruthy();
    if (isPurchaseOrder(poRes)) {
      expect(id).toEqual(poRes.id);
      expect(poRes.poNumber).toEqual("syn-000001");
    }
  });

  it("saves the line items passed into the initial purchase order creation to that po", async () => {
    const repo = constructPORepository();
    const plantPotOrder = {
      itemNumber: "111111",
      price: 4.99,
      description: "plant pot",
      quantity: 4000,
    };
    const result = (await createPO({ PORepo: repo })([plantPotOrder], "synapse"));
    const id = result.unsafeCoerce() as UUID;

    const poRes = (await repo.fetch(id).chain(async (maybePO) =>
      maybePO.caseOf({
        Just: (_) => Right(maybePO),
        Nothing: () => Left(null),
      })
    )).unsafeCoerce().unsafeCoerce();

    expect(isPurchaseOrder(poRes)).toBeTruthy();
    expect(id).toEqual(poRes.id);
    expect(poRes.lineItems).toEqual(
      expect.arrayContaining([expect.objectContaining(plantPotOrder)])
    );
  });
});
