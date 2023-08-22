import { IPORepository } from "../domain/IPORepository";
import {
  PurchaseOrder,
  createPurchaseOrder,
  addLineItemToPO,
} from "../domain/PurchaseOrder";
import { createItem } from "../domain/Item";
import { Codec, EitherAsync, GetType, Right, number, string } from "purify-ts";

type LineItemDTO = {
  itemNumber: string;
  price: number;
  description: string;
  quantity: number;
}[];

const LineITemBody = Codec.interface({
  itemNumber: string,
  price: number,
  description: string,
  quantity: number,
});

type LineITemBody = GetType<typeof LineITemBody>;

export const createPO =
  ({ PORepo }: { PORepo: IPORepository }) =>
  async (lineItems: LineItemDTO, organizationName: string) => {
    const addLineItemsToPO = AddLineItemsToPO(lineItems);
    return EitherAsync.liftEither(
      createPurchaseOrder({ lastPONumber: null, organizationName })
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

// const po = addLineItemsToPO(
//   createPurchaseOrder({ lastPONumber: null, organizationName })
// );
// () => ({ lastPONumber: null, organizationName })
//   .chain(createPurchaseOrder)
//   .chain(addLineItemsToPO)
// .map<string>((po) => po.id));
// const purchaseOrder = flow(
//   () => ({ lastPONumber: null, organizationName }),
//   createPurchaseOrder,
//   addLineItemsToPO,
//   PORepo.save
// )();
// const res = await purchaseOrder;
// return res.map(() => purchaseOrder.id);
