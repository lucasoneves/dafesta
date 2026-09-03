export type { FirebaseConfig, FirebaseInitOptions } from "./firebase-config.ts";
export {
  initFirebase,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDb,
} from "./firebase.ts";
export {
  signInWithGoogleWeb,
  signInWithGoogleRedirect,
  signInWithGoogleCredential,
  signOut,
  onAuthStateChanged,
  getCurrentUser,
} from "./auth.ts";
export {
  getCollection,
  getDocRef,
  fetchDoc,
  fetchDocs,
  addDocToCollection,
  updateDocInCollection,
  deleteDocFromCollection,
  query,
  where,
  orderBy,
  limit,
} from "./firestore.ts";
export type {
  DocumentData,
  QueryConstraint,
} from "./firestore.ts";
export { useAuth } from "./hooks/use-auth.ts";
export type { AuthState } from "./hooks/use-auth.ts";
export { createEvent, listEvents } from "./events.ts";
export type { StoredEvent, CreateEventResult } from "./events.ts";
export {
  addParticipant,
  updateRsvpStatus,
  getGuestUserId,
} from "./participants.ts";
export type { AddParticipantResult } from "./participants.ts";
export { useUserEvents } from "./hooks/use-user-events.ts";
export type { UserEvent, UseUserEventsState } from "./hooks/use-user-events.ts";
export { useEventDetails } from "./hooks/use-event-details.ts";
export type {
  EventWithId,
  StoredParticipant,
  StoredListItem,
  UseEventDetailsState,
} from "./hooks/use-event-details.ts";

export {
  addListItem,
  claimListItem,
  releaseListItem,
  deleteListItem,
  getUserName,
} from "./list-items.ts";
export type { AddListItemResult } from "./list-items.ts";

export {
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
