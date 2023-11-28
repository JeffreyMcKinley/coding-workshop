import { Either, EitherAsync, Maybe } from "purify-ts";
import { UUID } from "../../utilities/uuid";
import { PendingApprovalPurchaseOrder, PurchaseOrder } from "./PurchaseOrder";

export interface IPORepository {
  save: (po: PurchaseOrder) => EitherAsync<Error, UUID>;
  fetch: (id: UUID) => EitherAsync<Error, Maybe<PurchaseOrder>>;
  fetchAllPendingApproval: () => EitherAsync<
    Error,
    Maybe<PendingApprovalPurchaseOrder[]>
  >;
}
