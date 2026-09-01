import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase.ts";

export function getCollection(collectionName: string) {
  const db = getFirebaseDb();
  return collection(db, collectionName);
}

export function getDocRef(collectionName: string, docId: string) {
  const db = getFirebaseDb();
  return doc(db, collectionName, docId);
}

export async function fetchDoc<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const docRef = getDocRef(collectionName, docId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

export async function fetchDocs<T extends DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const col = getCollection(collectionName);
  const q = query(col, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as T & { id: string })
  );
}

export async function addDocToCollection<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const col = getCollection(collectionName);
  const docRef = await addDoc(col, data);
  return docRef.id;
}

export async function updateDocInCollection<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const docRef = getDocRef(collectionName, docId);
  await updateDoc(docRef, data as DocumentData);
}

export async function deleteDocFromCollection(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = getDocRef(collectionName, docId);
  await deleteDoc(docRef);
}

export { query, where, orderBy, limit };
export type { DocumentData, QueryConstraint };
