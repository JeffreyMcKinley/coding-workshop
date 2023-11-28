// https://github.com/gigobyte/ts-react-express-starter/blob/main/server/src/features/auth/LoginService.ts
import { Left, Right } from "purify-ts";
import { UUID } from "../../utilities/uuid";
import { isUuid } from "../../utilities/uuid";
import { constructPORepository } from "../domain/PORepository";
import { createDraftPO } from "./Create-DraftPO";
import { isDraftPurchaseOrder } from "../domain/PurchaseOrder";

describe("Create DraftPO Workflow", () => {
  it("is callable", () => {
    const repo = constructPORepository();
    createDraftPO({ DraftPORepo: repo });
  });

  it("returns a uuid", async () => {
    const purchaser = {
      firstName: "Parker",
      lastName: "Barrows",
    };
    const repo = constructPORepository();
    const draftPOResult = await createDraftPO({ DraftPORepo: repo })(
      [],
      "synapse",
      purchaser
    );
    const id = draftPOResult.unsafeCoerce() as UUID;
    expect(draftPOResult.isRight()).toBeTruthy();
    expect(isUuid(id)).toBeTruthy();
  });

  it("saves a purchase order to a repository", async () => {
    const purchaser = {
      firstName: "Parker",
      lastName: "Barrows",
    };
    const repo = constructPORepository();
    const result = await createDraftPO({ DraftPORepo: repo })(
      [],
      "synapse",
      purchaser
    );
    expect(result.isRight()).toBeTruthy();
    expect(isUuid(result.unsafeCoerce())).toBeTruthy();
    const id = result.unsafeCoerce() as UUID;
    const draftPOResult = (
      await repo.fetch(id).chain(async (maybePO) =>
        maybePO.caseOf({
          Just: (_) => Right(maybePO),
          Nothing: () => Left(null),
        })
      )
    )
      .unsafeCoerce()
      .unsafeCoerce();

    expect(isDraftPurchaseOrder(draftPOResult)).toBeTruthy();
    if (isDraftPurchaseOrder(draftPOResult)) {
      expect(id).toEqual(draftPOResult.id);
      expect(draftPOResult.organizationName).toEqual("synapse");
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
    const purchaser = {
      firstName: "Parker",
      lastName: "Barrows",
    };
    const result = await createDraftPO({ DraftPORepo: repo })(
      [plantPotOrder],
      "synapse",
      purchaser
    );
    const id = result.unsafeCoerce() as UUID;

    const draftPORes = (
      await repo.fetch(id).chain(async (maybePO) =>
        maybePO.caseOf({
          Just: (_) => Right(maybePO),
          Nothing: () => Left(null),
        })
      )
    )
      .unsafeCoerce()
      .unsafeCoerce();

    expect(isDraftPurchaseOrder(draftPORes)).toBeTruthy();
    expect(id).toEqual(draftPORes.id);
    expect(draftPORes.lineItems).toEqual(
      expect.arrayContaining([expect.objectContaining(plantPotOrder)])
    );
  });

  it("saves purchaser info on initial purchase order creation", async () => {
    const repo = constructPORepository();
    const plantPotOrder = {
      itemNumber: "111111",
      price: 4.99,
      description: "plant pot",
      quantity: 4000,
    };
    const purchaser = {
      firstName: "Parker",
      lastName: "Barrows",
    };
    const result = await createDraftPO({ DraftPORepo: repo })(
      [plantPotOrder],
      "synapse",
      purchaser
    );
    const id = result.unsafeCoerce() as UUID;

    const draftPORes = (
      await repo.fetch(id).chain(async (maybePO) =>
        maybePO.caseOf({
          Just: (_) => Right(maybePO),
          Nothing: () => Left(null),
        })
      )
    )
      .unsafeCoerce()
      .unsafeCoerce();

    expect(isDraftPurchaseOrder(draftPORes)).toBeTruthy();
    expect(id).toEqual(draftPORes.id);
    expect(draftPORes.purchaser).toEqual(expect.objectContaining(purchaser));
  });
});
