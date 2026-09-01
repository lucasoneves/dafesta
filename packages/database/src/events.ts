import type { Event, CreateEventPayload } from "@dafesta/types";
import type { User } from "firebase/auth";
import { getCurrentUser } from "./auth.ts";
import { addDocToCollection, fetchDocs, where } from "./firestore.ts";
import { serverTimestamp, type Timestamp } from "firebase/firestore";

const EVENTS_COLLECTION = "events";

export interface StoredEvent extends Omit<Event, "createdAt"> {
  createdAt: Timestamp;
}

export type CreateEventResult = {
  id: string;
  data: Event;
};

function getOwnerId(user?: User | null): string {
  const currentUser = user ?? getCurrentUser();
  if (!currentUser) {
    throw new Error(
      "[dafesta/database] Usuário não autenticado. Faça login para criar um evento."
    );
  }
  return currentUser.uid;
}

export async function createEvent(
  payload: CreateEventPayload,
  user?: User | null
): Promise<CreateEventResult> {
  const ownerId = getOwnerId(user);
  const now = serverTimestamp();
  const id = await addDocToCollection<Record<string, unknown>>(EVENTS_COLLECTION, {
    ...payload,
    ownerId,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    data: {
      ...payload,
      id,
      ownerId,
      status: "draft",
      createdAt: "",
      updatedAt: "",
    },
  };
}

export async function listEvents(
  user?: User | null
): Promise<(StoredEvent & { id: string })[]> {
  const ownerId = getOwnerId(user);
  return fetchDocs<StoredEvent>(EVENTS_COLLECTION, where("ownerId", "==", ownerId));
}
