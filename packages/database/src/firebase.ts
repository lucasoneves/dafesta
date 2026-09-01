import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import type { FirebaseConfig, FirebaseInitOptions } from "./firebase-config.ts";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initFirebase(
  options: FirebaseInitOptions | FirebaseConfig
): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (app) {
    return { app, auth: auth!, db: db! };
  }

  const config = "config" in options ? options.config : options;
  const authPersistence =
    "authPersistence" in options ? options.authPersistence : undefined;

  app = getApps().length > 0 ? getApp() : initializeApp(config);

  if (authPersistence) {
    auth = initializeAuth(app, { persistence: authPersistence });
  } else {
    auth = getAuth(app);
  }

  db = getFirestore(app);

  return { app, auth, db };
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error(
      "[dafesta/database] Firebase não inicializado. Chame initFirebase() primeiro."
    );
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error(
      "[dafesta/database] Firebase não inicializado. Chame initFirebase() primeiro."
    );
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    throw new Error(
      "[dafesta/database] Firebase não inicializado. Chame initFirebase() primeiro."
    );
  }
  return db;
}
