import { UUID } from "../../utilities/uuid";
import { IPORepository } from "./IPORepository";
import {
  PendingApprovalPurchaseOrder,
  PurchaseOrder,
  isPendingPurchaseOrder,
} from "./PurchaseOrder";
import { EitherAsync, Maybe } from "purify-ts";

class PORepository implements IPORepository {
  purchaseOrders: PurchaseOrder[] = [];

  save(po: PurchaseOrder): EitherAsync<Error, UUID> {
    return EitherAsync(async () => {
      try {
        this.purchaseOrders.push(po);
        return po.id;
      } catch (e) {
        throw new Error(e.message);
      }
    });
  }

  fetch(id: UUID): EitherAsync<Error, Maybe<PurchaseOrder>> {
    return EitherAsync(async () => {
      try {
        return Maybe.of(this.purchaseOrders.find((p) => p.id === id));
      } catch (e) {
        throw new Error(e.message);
      }
    });
  }

  fetchAllPendingApproval(): EitherAsync<
    Error,
    Maybe<PendingApprovalPurchaseOrder[]>
  > {
    return EitherAsync(async () => {
      return Maybe.of(
        this.purchaseOrders.filter(isPendingPurchaseOrder)
      );
    });
  }
}
export const constructPORepository = () => new PORepository();
