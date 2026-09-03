import type {
  CreateListItemPayload,
  ListItem,
} from "@dafesta/types";
import type { User } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { getCurrentUser } from "./auth.ts";
import {
  addDocToCollection,
  updateDocInCollection,
  deleteDocFromCollection,
} from "./firestore.ts";

const LIST_ITEMS_COLLECTION = "listItems";

export function getUserName(user?: User | null): string {
  const currentUser = user ?? getCurrentUser();
  if (currentUser?.displayName) {
    return currentUser.displayName;
  }
  if (currentUser?.email) {
    return currentUser.email.split("@")[0] || "Convidado";
  }
  return "Convidado";
}

function getClaimant(user?: User | null): { userId: string; name: string } {
  const currentUser = user ?? getCurrentUser();
  return {
    userId: currentUser?.uid ?? `guest-${Date.now().toString(36)}`,
    name: getUserName(user),
  };
}

export interface AddListItemResult {
  id: string;
  data: ListItem;
}

export async function addListItem(
  eventId: string,
  payload: Omit<CreateListItemPayload, "eventId">,
  user?: User | null
): Promise<AddListItemResult> {
  const now = serverTimestamp();
  const id = await addDocToCollection<Record<string, unknown>>(
    LIST_ITEMS_COLLECTION,
    {
      eventId,
      title: payload.title,
      category: payload.category,
      quantity: payload.quantity,
      claimedByUserId: null,
      claimedByName: null,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    }
  );

  return {
    id,
    data: {
      id,
      eventId,
      title: payload.title,
      category: payload.category,
      quantity: payload.quantity,
      claimedByUserId: null,
      claimedByName: null,
      isCompleted: false,
      createdAt: "",
      updatedAt: "",
    },
  };
}

export async function claimListItem(
  eventId: string,
  itemId: string,
  user?: User | null
): Promise<void> {
  const claimant = getClaimant(user);
  await updateDocInCollection<Record<string, unknown>>(
    LIST_ITEMS_COLLECTION,
    itemId,
    {
      eventId,
      claimedByUserId: claimant.userId,
      claimedByName: claimant.name,
      isCompleted: true,
      updatedAt: serverTimestamp(),
    }
  );
}

export async function releaseListItem(
  eventId: string,
  itemId: string,
  user?: User | null
): Promise<void> {
  const currentUser = user ?? getCurrentUser();
  const ownerUserId = currentUser?.uid ?? null;

  await updateDocInCollection<Record<string, unknown>>(
    LIST_ITEMS_COLLECTION,
    itemId,
    {
      eventId,
      claimedByUserId: null,
      claimedByName: null,
      isCompleted: false,
      updatedAt: serverTimestamp(),
    }
  );
}

export async function deleteListItem(itemId: string): Promise<void> {
  await deleteDocFromCollection(LIST_ITEMS_COLLECTION, itemId);
}
