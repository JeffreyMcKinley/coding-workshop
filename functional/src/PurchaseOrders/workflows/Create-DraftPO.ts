import { EitherAsync } from "purify-ts/EitherAsync";
import { IPORepository } from "../domain/IPORepository";
import {
  DraftPurchaseOrder,
  addLineItemToPO,
  createDraftPurchaseOrder,
  isDraftPurchaseOrder,
} from "../domain/PurchaseOrder";
import { v4 } from "uuid";
import { UUID } from "../../utilities/uuid";
import { createItem } from "../domain/Item";

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
export const createDraftPO =
  ({ DraftPORepo }: { DraftPORepo: IPORepository }) =>
  async (
    lineItems: LineItemDTO,
    organizationName: string,
    purchaser: PurcahserDTO
  ) => {
    const addLineItemsToPO = AddLineItemsToPO(lineItems);
    return EitherAsync.liftEither(
      createDraftPurchaseOrder({
        organizationName,
        purchaser: { id: v4() as UUID, ...purchaser },
      })
    ).chain((draft) => {
      const draftWithLineItems = addLineItemsToPO(draft);
      return DraftPORepo.save(draftWithLineItems);
    });
  };

const AddLineItemsToPO =
  (lineItems: LineItemDTO) => (draftPurchaseOrder: DraftPurchaseOrder) =>
    addLineItemsToPOIterative({ draftPurchaseOrder, lineItems }, 0);

function addLineItemsToPOIterative(
  order: { draftPurchaseOrder: DraftPurchaseOrder; lineItems: LineItemDTO },
  iterator: number
): DraftPurchaseOrder {
  if (iterator === order.lineItems.length) return order.draftPurchaseOrder;
  if (!order.lineItems[iterator]) return order.draftPurchaseOrder;

  const { quantity, ...lineItem } = order.lineItems[iterator];
  const item = createItem(
    lineItem.itemNumber,
    lineItem.price,
    lineItem.description
  );
  const draftPurchaseOrder = addLineItemToPO({
    PO: order.draftPurchaseOrder,
    item,
    quantity,
  });

  if (!isDraftPurchaseOrder(draftPurchaseOrder))
    throw new Error("Draft purchase order type got converted here");

  return addLineItemsToPOIterative(
    { draftPurchaseOrder, lineItems: order.lineItems },
    iterator + 1
  );
}
