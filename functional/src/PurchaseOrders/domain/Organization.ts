import { createUuid, UUID, isUuid } from "../../utilities/uuid";
import { Item } from "./Item";

export type Organization = { id: UUID; name: string };

export const createOrganization = (name: string) => ({
  id: createUuid(),
  name,
});
