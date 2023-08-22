import { IPORepository } from "../domain/IPORepository";
import {
  PurchaseOrder,
  createPurchaseOrder,
  addLineItemToPO,
} from "../domain/PurchaseOrder";
import { createItem } from "../domain/Item";
import { EitherAsync } from "purify-ts";
import { v4 } from "uuid";
import { UUID } from "../../utilities/uuid";

type LineItemDTO = {
  itemNumber: string;
  price: number;
  description: string;
  quantity: number;
}[];

type PurcahserDTO = {
  firstName: string;
  lastName: string;
};

export const createPO =
  ({ PORepo }: { PORepo: IPORepository }) =>
  async (
    lineItems: LineItemDTO,
    organizationName: string,
    purchaser: PurcahserDTO
  ) => {
    const addLineItemsToPO = AddLineItemsToPO(lineItems);
    return EitherAsync.liftEither(
      createPurchaseOrder({
        lastPONumber: null,
        organizationName,
        purchaser: { id: v4() as UUID, ...purchaser },
      })
    ).chain((po) => {
      const poWithLineItems = addLineItemsToPO(po);
      return PORepo.save(poWithLineItems);
    });
  };

const AddLineItemsToPO =
  (lineItems: LineItemDTO) => (purchaseOrder: PurchaseOrder) =>
    addLineItemsToPOIterative({ purchaseOrder, lineItems }, 0);

function addLineItemsToPOIterative(
  order: { purchaseOrder: PurchaseOrder; lineItems: LineItemDTO },
  iterator: number
): PurchaseOrder {
  if (iterator === order.lineItems.length) return order.purchaseOrder;
  if (!order.lineItems[iterator]) return order.purchaseOrder;

  const { quantity, ...lineItem } = order.lineItems[iterator];
  const item = createItem(
    lineItem.itemNumber,
    lineItem.price,
    lineItem.description
  );
  const purchaseOrder = addLineItemToPO({
    PO: order.purchaseOrder,
    item,
    quantity,
  });

  return addLineItemsToPOIterative(
    { purchaseOrder, lineItems: order.lineItems },
    iterator + 1
  );
}
