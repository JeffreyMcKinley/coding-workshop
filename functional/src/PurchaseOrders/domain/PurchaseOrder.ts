import { createUuid, UUID, isUuid } from "../../utilities/uuid";
import { Item } from "./Item";

export type PurchaseOrder = { id: UUID, lineItems: LineItem[] };
export type LineItem = Item & { quantity: number };
export type createPurchaseOrder = () => PurchaseOrder;

export const createPurchaseOrder: createPurchaseOrder = () => ({
  id: createUuid(),
  lineItems: []
});
export const isPurchaseOrder = (s: any): s is PurchaseOrder => {
  if (typeof s !== "object") return false;

  const po = s as PurchaseOrder;
  if (!po.id) return false;
  if (!isUuid(po.id)) return false;
  if (!po.lineItems) return false;
  if (!Array.isArray(po.lineItems)) return false;
  return true;
};
export const addLineItemToPO = ({PO, item, quantity}: {PO: PurchaseOrder, item: Item, quantity: number}): PurchaseOrder => {
  return {
    id: PO.id,
    lineItems: [...PO.lineItems, {...item, quantity}]
  }
}
