import { createUuid, UUID, isUuid } from "../../utilities/uuid";
import { Item } from "./Item";
import { Either, Left, Right } from 'purify-ts/Either'

export type PurchaseOrder = {
  id: UUID;
  poNumber: string;
  lineItems: LineItem[];
};
export type LineItem = Item & { quantity: number };
export type createPurchaseOrder = ({
  lastPONumber,
  organizationName,
}: {
  lastPONumber: string | null;
  organizationName?: string | null;
}) => Either<Error, PurchaseOrder>;


export const createPurchaseOrder: createPurchaseOrder = ({
  lastPONumber,
  organizationName = null,
}: {
  lastPONumber: string | null;
  organizationName?: string | null;
}) => {
  if (lastPONumber === null) {
    if (organizationName === null)
      return Left(new Error("Cannot initialize first PO with company signature"));

    return Right({
      id: createUuid(),
      poNumber: `${organizationName.slice(0, 3).toLocaleLowerCase()}-000001`,
      lineItems: [],
    });
  }

  const lastPONumberSections: string[] = lastPONumber.split("-");
  if (
    lastPONumberSections.length !== 2 ||
    Number.isNaN(parseInt(lastPONumberSections[1]))
  ) {
    return Left(new Error("not a valid previous PO number"));
  }

  return Right({
    id: createUuid(),
    poNumber: [
      lastPONumberSections[0],
      String(parseInt(lastPONumberSections[1]) + 1).padStart(6, "0"),
    ].join("-"),
    lineItems: [],
  });
};

export const isPurchaseOrder = (s: any): s is PurchaseOrder => {
  if (typeof s !== "object") return false;

  const po = s as PurchaseOrder;
  if (!po.id) return false;
  if (!isUuid(po.id)) return false;
  if (!po.lineItems) return false;
  if (!Array.isArray(po.lineItems)) return false;
  return true;
};

export const addLineItemToPO = ({
  PO,
  item,
  quantity,
}: {
  PO: PurchaseOrder;
  item: Item;
  quantity: number;
}): PurchaseOrder => {
  return {
    id: PO.id,
    poNumber: PO.poNumber,
    lineItems: [...PO.lineItems, { ...item, quantity }],
  };
};
