export interface ListItem {
  id: string;
  eventId: string;
  title: string;
  category: ItemCategory;
  quantity: number;
  claimedByUserId: string | null;
  claimedByName: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ItemCategory =
  | "food"
  | "drink"
  | "decoration"
  | "utensils"
  | "entertainment"
  | "other";

export type CreateListItemPayload = Omit<
  ListItem,
  | "id"
  | "claimedByUserId"
  | "claimedByName"
  | "isCompleted"
  | "createdAt"
  | "updatedAt"
>;
