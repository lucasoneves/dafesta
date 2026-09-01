"use client";

import { useState, useEffect, useCallback } from "react";
import type { Event } from "@dafesta/types";
import {
  onSnapshot,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase.ts";
import { getCurrentUser } from "../auth.ts";
import type { User } from "firebase/auth";

export interface UserEvent extends Event {
  id: string;
}

interface UseUserEventsState {
  events: UserEvent[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EVENTS_COLLECTION = "events";
const PARTICIPANTS_COLLECTION = "eventParticipants";

function toUserEvent(doc: {
  id: string;
  data(): Record<string, unknown>;
}): UserEvent {
  return {
    id: doc.id,
    ...(doc.data() as Omit<Event, "id">),
  };
}

export function useUserEvents(user?: User | null): UseUserEventsState {
  const [state, setState] = useState<UseUserEventsState>({
    events: [],
    loading: true,
    refreshing: false,
    error: null,
    refresh: async () => {},
  });

  const refresh = useCallback(async (): Promise<void> => {
    const currentUser = user ?? getCurrentUser();
    if (!currentUser) return;

    const db = getFirebaseDb();
    try {
      const [ownedSnap, participantsSnap] = await Promise.all([
        getDocs(query(collection(db, EVENTS_COLLECTION), where("ownerId", "==", currentUser.uid))),
        getDocs(query(collection(db, PARTICIPANTS_COLLECTION), where("userId", "==", currentUser.uid))),
      ]);

      const owned = ownedSnap.docs.map(toUserEvent);
      const participantIds = participantsSnap.docs
        .map((d) => d.data().eventId as string)
        .filter(Boolean);

      const participantDocs = await Promise.all(
        participantIds.map((id) =>
          getDoc(doc(db, EVENTS_COLLECTION, id)).then((snap) =>
            snap.exists() ? toUserEvent(snap) : null
          )
        )
      );

      const events = mergeEvents(
        owned,
        participantDocs.filter((e): e is UserEvent => e !== null)
      );
      setState((prev) => ({
        ...prev,
        events,
        loading: false,
        refreshing: false,
        error: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState((prev) => ({
        ...prev,
        refreshing: false,
        error: message,
      }));
    }
  }, [user]);

  useEffect(() => {
    const currentUser = user ?? getCurrentUser();
    if (!currentUser) {
      setState((prev) => ({
        ...prev,
        events: [],
        loading: false,
        error: null,
      }));
      return;
    }

    const db = getFirebaseDb();
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const ownedQuery = query(
      eventsRef,
      where("ownerId", "==", currentUser.uid)
    );
    const participantsRef = collection(db, PARTICIPANTS_COLLECTION);
    const participantsQuery = query(
      participantsRef,
      where("userId", "==", currentUser.uid)
    );

    let active = true;

    async function loadParticipantEvents(participantIds: string[]) {
      const participantDocs = await Promise.all(
        participantIds.map((id) =>
          getDoc(doc(db, EVENTS_COLLECTION, id)).then((snap) =>
            snap.exists() ? toUserEvent(snap) : null
          )
        )
      );
      return participantDocs.filter((e): e is UserEvent => e !== null);
    }

    // Owned events: real-time listener
    const unsubscribeOwned = onSnapshot(
      ownedQuery,
      (snapshot) => {
        const owned = snapshot.docs.map(toUserEvent);
        setState((prev) => ({
          ...prev,
          events: owned,
          loading: false,
          error: null,
        }));
      },
      (err) => {
        setState((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    );

    // Participant events: real-time membership + fetch of the referenced events
    const unsubscribeParticipants = onSnapshot(
      participantsQuery,
      async (snapshot) => {
        const participantIds = snapshot.docs
          .map((d) => d.data().eventId as string)
          .filter(Boolean);
        try {
          const participantEvents = await loadParticipantEvents(participantIds);
          if (!active) return;
          setState((prev) => {
            const merged = mergeEvents(prev.events, participantEvents);
            return { ...prev, events: merged, error: null };
          });
        } catch (err) {
          if (!active) return;
          const message = err instanceof Error ? err.message : String(err);
          setState((prev) => ({ ...prev, error: message }));
        }
      },
      (err) => {
        if (!active) return;
        setState((prev) => ({ ...prev, error: err.message }));
      }
    );

    return () => {
      active = false;
      unsubscribeOwned();
      unsubscribeParticipants();
    };
  }, [user]);

  return { ...state, refresh };
}

function mergeEvents(...groups: UserEvent[][]): UserEvent[] {
  const byId = new Map<string, UserEvent>();
  for (const group of groups) {
    for (const event of group) {
      byId.set(event.id, event);
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    String(a.date ?? "").localeCompare(String(b.date ?? ""))
  );
}

export type { UseUserEventsState };
