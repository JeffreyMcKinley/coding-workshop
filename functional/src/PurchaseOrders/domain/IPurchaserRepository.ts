import { EitherAsync, Maybe } from "purify-ts";
import { UUID } from "../../utilities/uuid";
import { Purchaser } from "./Purchaser";

export interface IPORepository {
  save: (po: Purchaser) => EitherAsync<Error, UUID>;
  fetch: (id: UUID) => EitherAsync<Error, Maybe<Purchaser>>;
}
