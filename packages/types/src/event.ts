export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  coverUrl?: string;
  status: EventStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "finished";

export type CreateEventPayload = Omit<
  Event,
  "id" | "status" | "ownerId" | "createdAt" | "updatedAt"
>;
