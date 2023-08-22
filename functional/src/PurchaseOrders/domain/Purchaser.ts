import { v4 } from "uuid";
import { UUID } from "../../utilities/uuid";

export type Purchaser = {
  id: UUID;
  firstName: string;
  lastName: string;
};

type createPurchaser = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => Purchaser;

export const createPurchaser: createPurchaser = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  return {
    id: v4() as UUID,
    firstName,
    lastName,
  };
};
