import { Either, Left, Right } from "purify-ts/Either";

import { createUuid, UUID, isUuid } from "../../utilities/uuid";
import { Item } from "./Item";
import { Purchaser } from "./Purchaser";

type state = "draft" | "submitted";
export type PurchaseOrder = {
  id: UUID;
  purchaser: Purchaser;
  poNumber: string;
  lineItems: LineItem[];
  state: state;
};
export type LineItem = Item & { quantity: number };
export type createPurchaseOrder = ({
  lastPONumber,
  organizationName,
  purchaser,
}: {
  lastPONumber: string | null;
  organizationName?: string | null;
  purchaser: Purchaser;
}) => Either<Error, PurchaseOrder>;

export const createPurchaseOrder: createPurchaseOrder = ({
  lastPONumber,
  organizationName = null,
  purchaser,
}: {
  lastPONumber: string | null;
  organizationName?: string | null;
  purchaser: Purchaser;
}) => {
  if (lastPONumber === null) {
    if (organizationName === null)
      return Left(
        new Error("Cannot initialize first PO with company signature")
      );

    return Right({
      id: createUuid(),
      purchaser,
      poNumber: `${organizationName.slice(0, 3).toLocaleLowerCase()}-000001`,
      state: 'submitted',
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
    state: 'submitted',
    purchaser,
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
    ...PO,
    lineItems: [...PO.lineItems, { ...item, quantity }],
  };
};
