import { Either, Left, Right } from "purify-ts/Either";

import { createUuid, UUID, isUuid } from "../../utilities/uuid";
import { Item } from "./Item";
import { Purchaser } from "./Purchaser";

export const PURCHASE_ORDER_STATUS = {
  DRAFT: "draft" as const,
  PENDING_APPROVAL: "pending_approval" as const,
  APPROVED: "approved" as const,
};
type PurchaseOrderStatus = "draft" | "pending_approval" | "approved";

export type BasePurchaseOrder<status, poNumberState> = {
  id: UUID;
  purchaser: Purchaser;
  poNumber: poNumberState;
  lineItems: LineItem[];
  status: status;
  organizationName: string | null;
};
export type DraftPurchaseOrder = BasePurchaseOrder<"draft", null>;
type PendingApprovalPurchaseOrder = BasePurchaseOrder<
  "pending_approval",
  string
>;
type ApprovedPurchaseOrder = BasePurchaseOrder<"approved", string>;
export type PurchaseOrder =
  | DraftPurchaseOrder
  | PendingApprovalPurchaseOrder
  | ApprovedPurchaseOrder;
export type LineItem = Item & { quantity: number };
export type createDraftPurchaseOrder = ({
  purchaser,
  organizationName,
}: {
  purchaser: Purchaser;
  organizationName: string;
}) => Either<Error, DraftPurchaseOrder>;
export type createPurchaseOrder = ({
  lastPONumber,
  organizationName,
  purchaser,
}: {
  lastPONumber: string | null;
  organizationName?: string | null;
  purchaser: Purchaser;
}) => Either<Error, ApprovedPurchaseOrder>;
export type submitPurchaseOrder = (
  draftPO: DraftPurchaseOrder,
  lastPONumber: string | null
) => Either<Error, PendingApprovalPurchaseOrder>;
// draft po is assigned a po number
export const createDraftPurchaseOrder: createDraftPurchaseOrder = ({
  purchaser,
  organizationName,
}: {
  purchaser: Purchaser;
  organizationName: string;
}) => {
  if (organizationName.length === 0) {
    return Left(new Error("organization cannot be blank"));
  }

  return Right({
    id: createUuid(),
    organizationName,
    poNumber: null,
    purchaser,
    lineItems: [],
    status: PURCHASE_ORDER_STATUS.DRAFT,
  });
};

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
      lineItems: [],
      status: PURCHASE_ORDER_STATUS.APPROVED,
      organizationName: null,
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
    purchaser,
    lineItems: [],
    status: PURCHASE_ORDER_STATUS.APPROVED,
    organizationName: null,
  });
};

export const submitPurchaseOrder: submitPurchaseOrder = (
  draftPO: DraftPurchaseOrder,
  lastPONumber
) => {
  if (lastPONumber === null) {
    return Right({
      ...draftPO,
      poNumber: `${draftPO.organizationName
        .slice(0, 3)
        .toLocaleLowerCase()}-000001`,
      status: PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
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
    ...draftPO,
    poNumber: [
      lastPONumberSections[0],
      String(parseInt(lastPONumberSections[1]) + 1).padStart(6, "0"),
    ].join("-"),
    status: PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
  });
};

export const addLineItemToPO = <T extends PurchaseOrder>({
  PO,
  item,
  quantity,
}: {
  PO: T;
  item: Item;
  quantity: number;
}): T => {
  return {
    ...PO,
    lineItems: [...PO.lineItems, { ...item, quantity }],
  };
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

export const isDraftPurchaseOrder = (s: any): s is DraftPurchaseOrder => {
  if (typeof s !== "object") return false;

  const draftPO = s as DraftPurchaseOrder;
  if (!draftPO.id) return false;
  if (!isUuid(draftPO.id)) return false;
  if (!draftPO.lineItems) return false;
  if (!Array.isArray(draftPO.lineItems)) return false;
  if (draftPO.poNumber !== null) return false;
  if (draftPO.status !== PURCHASE_ORDER_STATUS.DRAFT) return false;
  return true;
};
