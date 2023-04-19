import { flow } from 'lodash/fp'
import { IPORepository } from "../domain/IPORepository";
import { PurchaseOrder, createPurchaseOrder, addLineItemToPO } from "../domain/PurchaseOrder";
import { createItem } from '../domain/Item';

type LineItemDTO = { itemNumber: string, price: number, description: string, quantity: number }[];

export const createPO =
  ({ PORepo }: { PORepo: IPORepository }) =>
  async (lineItems: LineItemDTO) => {
    const addLineItemsToPO = AddLineItemsToPO(lineItems);
    const purchaseOrder = flow(
        createPurchaseOrder,
        addLineItemsToPO,
    )();
    const res = await PORepo.save(purchaseOrder);
    return res.map(() => purchaseOrder.id);
  };

const AddLineItemsToPO = (lineItems: LineItemDTO) => (purchaseOrder: PurchaseOrder) => addLineItemsToPOIterative({ purchaseOrder, lineItems}, 0)


function addLineItemsToPOIterative(order: {purchaseOrder: PurchaseOrder, lineItems: LineItemDTO}, iterator: number): PurchaseOrder {
  if (iterator === order.lineItems.length) return order.purchaseOrder;
  if (!order.lineItems[iterator]) return order.purchaseOrder;

  const { quantity, ...lineItem} = order.lineItems[iterator];
  const item = createItem(lineItem.itemNumber, lineItem.price, lineItem.description);
  const purchaseOrder = addLineItemToPO({ PO: order.purchaseOrder, item, quantity });

  return addLineItemsToPOIterative({purchaseOrder, lineItems: order.lineItems}, iterator + 1);
}
