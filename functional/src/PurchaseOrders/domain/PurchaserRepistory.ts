import { UUID } from "../../utilities/uuid";
import { IPORepository } from "./IPurchaserRepository";
import { EitherAsync, Maybe } from "purify-ts";
import { Purchaser } from "./Purchaser";

class PORepository implements IPORepository {
  purchasers: Purchaser[] = [];

  save(purchaser: Purchaser): EitherAsync<Error, UUID> {
    return EitherAsync(async () => {
      try {
        this.purchasers.push(purchaser);
        return purchaser.id;
      } catch (e) {
        throw new Error(e.message);
      }
    });
  }

  fetch(id: UUID): EitherAsync<Error, Maybe<Purchaser>> {
    return EitherAsync(async () => {
      try {
        return Maybe.of(this.purchasers.find((p) => p.id === id));
      } catch (e) {
        throw new Error(e.message);
      }
    });
  }
}
export const constructPORepository = () => new PORepository();
