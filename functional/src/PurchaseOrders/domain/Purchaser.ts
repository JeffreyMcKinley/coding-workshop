import { UUID, createUuid } from "../../utilities/uuid";

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
    id: createUuid(),
    firstName,
    lastName,
  };
};
