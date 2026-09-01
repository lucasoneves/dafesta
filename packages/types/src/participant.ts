export type EventParticipantStatus = "confirmed" | "declined" | "pending";

export type EventRole = "owner" | "guest";

export interface EventParticipant {
  eventId: string;
  userId: string;
  name: string;
  email?: string;
  status: EventParticipantStatus;
  role: EventRole;
  createdAt: string;
  updatedAt: string;
}

export type InviteParticipantPayload = {
  name: string;
  email?: string;
  role?: EventRole;
};

export type CreateEventParticipantPayload = Omit<
  EventParticipant,
  "id" | "createdAt" | "updatedAt"
>;
