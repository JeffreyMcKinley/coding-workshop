import { v4 } from "uuid";
import { UUID, isUuid } from "../../utilities/uuid";
import { createItem } from "./Item";
import { createPurchaser } from "./Purchaser";

describe("Purcaser Entity", () => {
  it("does it", () => {
    const purchaser = createPurchaser({
      firstName: "Dave",
      lastName: "Farley",
    });
    expect(isUuid(purchaser.id)).toBeTruthy();
    expect(purchaser).toStrictEqual(
      expect.objectContaining({ firstName: "Dave", lastName: "Farley" })
    );
  });
});
