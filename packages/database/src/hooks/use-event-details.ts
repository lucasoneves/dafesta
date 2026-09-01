"use client";

import { useState, useEffect } from "react";
import type { Event, EventParticipant, ListItem } from "@dafesta/types";
import {
  onSnapshot,
  doc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase.ts";

export interface EventWithId extends Event {
  id: string;
}

export interface StoredParticipant extends EventParticipant {
  id: string;
}

export interface StoredListItem extends ListItem {
  id: string;
}

interface UseEventDetailsState {
  event: EventWithId | null;
  participants: StoredParticipant[];
  listItems: StoredListItem[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
}

const EVENTS_COLLECTION = "events";
const PARTICIPANTS_COLLECTION = "eventParticipants";
const LIST_ITEMS_COLLECTION = "listItems";

export function useEventDetails(eventId?: string | null): UseEventDetailsState {
  const [state, setState] = useState<UseEventDetailsState>({
    event: null,
    participants: [],
    listItems: [],
    loading: true,
    notFound: false,
    error: null,
  });

  useEffect(() => {
    if (!eventId) {
      setState({
        event: null,
        participants: [],
        listItems: [],
        loading: false,
        notFound: true,
        error: null,
      });
      return;
    }

    const db = getFirebaseDb();
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const participantsQuery = query(
      collection(db, PARTICIPANTS_COLLECTION),
      where("eventId", "==", eventId)
    );
    const listItemsQuery = query(
      collection(db, LIST_ITEMS_COLLECTION),
      where("eventId", "==", eventId)
    );

    const unsubscribers: (() => void)[] = [];

    const unsubscribeEvent = onSnapshot(
      eventRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setState((prev) => ({
            ...prev,
            event: null,
            loading: false,
            notFound: true,
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          event: {
            id: snapshot.id,
            ...(snapshot.data() as Omit<Event, "id">),
          },
          loading: false,
          notFound: false,
        }));
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    );
    unsubscribers.push(unsubscribeEvent);

    const unsubscribeParticipants = onSnapshot(
      participantsQuery,
      (snapshot) => {
        const participants: StoredParticipant[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<EventParticipant, "id">),
        }));
        setState((prev) => ({ ...prev, participants }));
      },
      (err) => {
        setState((prev) => ({ ...prev, error: err.message }));
      }
    );
    unsubscribers.push(unsubscribeParticipants);

    const unsubscribeListItems = onSnapshot(
      listItemsQuery,
      (snapshot) => {
        const listItems: StoredListItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ListItem, "id">),
        }));
        setState((prev) => ({ ...prev, listItems }));
      },
      (err) => {
        setState((prev) => ({ ...prev, error: err.message }));
      }
    );
    unsubscribers.push(unsubscribeListItems);

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [eventId]);

  return state;
}

export type { UseEventDetailsState };
