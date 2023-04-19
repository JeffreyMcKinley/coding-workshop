import { isUuid, UUID } from "../../utilities/uuid";
import { createItem } from "./Item";
import { addLineItemToPO, createPurchaseOrder } from "./PurchaseOrder";

describe("Purcase Order Entity", () => {
  it("does it", () => {
    const PO = createPurchaseOrder();
    expect(isUuid(PO.id)).toBeTruthy();
  });

  it('adds a line item', () => {
    const PO = createPurchaseOrder();
    const item = createItem('125535', 4.99, 'box of wing nuts');
    const POWithLineItems = addLineItemToPO({PO, item, quantity: 5});
    expect(POWithLineItems).toMatchObject({
      id: expect(isUuid(PO.id)).toBeTruthy(),
      lineItems: expect.arrayContaining([expect.objectContaining({
        itemNumber: '125535',
        price:  4.99,
        description: 'box of wing nuts',
        quantity: 5,
        id: expect(isUuid(PO.id)).toBeTruthy(),
      })])
    });
  })
});
