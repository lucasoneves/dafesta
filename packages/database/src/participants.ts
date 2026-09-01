import type {
  EventParticipant,
  EventParticipantStatus,
  InviteParticipantPayload,
} from "@dafesta/types";
import type { User } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { getCurrentUser } from "./auth.ts";
import {
  addDocToCollection,
  updateDocInCollection,
} from "./firestore.ts";

const PARTICIPANTS_COLLECTION = "eventParticipants";

export interface AddParticipantResult {
  id: string;
  data: EventParticipant;
}

export function getGuestUserId(user?: User | null): string {
  const currentUser = user ?? getCurrentUser();
  if (currentUser) {
    return currentUser.uid;
  }
  return `guest-${Date.now().toString(36)}`;
}

export async function addParticipant(
  eventId: string,
  payload: InviteParticipantPayload,
  user?: User | null
): Promise<AddParticipantResult> {
  const now = serverTimestamp();
  const userId = getGuestUserId(user);
  const id = await addDocToCollection<Record<string, unknown>>(
    PARTICIPANTS_COLLECTION,
    {
      eventId,
      userId,
      name: payload.name,
      email: payload.email,
      status: "pending",
      role: payload.role ?? "guest",
      createdAt: now,
      updatedAt: now,
    }
  );

  return {
    id,
    data: {
      eventId,
      userId,
      name: payload.name,
      email: payload.email,
      status: "pending",
      role: payload.role ?? "guest",
      createdAt: "",
      updatedAt: "",
    },
  };
}

export async function updateRsvpStatus(
  eventId: string,
  participantId: string,
  newStatus: EventParticipantStatus
): Promise<void> {
  await updateDocInCollection<Record<string, unknown>>(
    PARTICIPANTS_COLLECTION,
    participantId,
    {
      eventId,
      status: newStatus,
      updatedAt: serverTimestamp(),
    }
  );
}
