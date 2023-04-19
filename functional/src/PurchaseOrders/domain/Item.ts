import { createUuid, UUID, isUuid } from "../../utilities/uuid";

export type Item = { id: UUID, itemNumber: string, price: number, description: string };
export type createItem = (itemNumber: string, price: number, description: string) => Item;

export const createItem: createItem = (itemNumber: string, price: number, description: string) => ({
  id: createUuid(),
  itemNumber,
  price,
  description,
});
export const isItem = (s: any): s is Item => {
  if (typeof s !== "object") return false;

  const it = s as Item;
  if (!it.id) return false;
  if (!isUuid(it.id)) return false;
  if (!it.price) return false;
  if (typeof it.price !== 'number') return false;
  if (!it.itemNumber) return false;
  if (typeof it.itemNumber !== 'string') return false;
  if (!it.description) return false;
  if (typeof it.description !== 'string') return false;

  return true;
};
