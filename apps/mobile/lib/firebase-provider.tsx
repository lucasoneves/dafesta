import { type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initFirebase } from "@dafesta/database";
import { getReactNativePersistence } from "./firebase-rn-auth";
import Constants from "expo-constants";

function initializeOnce() {
  const extra = Constants.expoConfig?.extra ?? {};
  const env = extra.firebase ?? {};

  initFirebase({
    config: {
      apiKey: env.apiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
      authDomain: env.authDomain ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: env.projectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket:
        env.storageBucket ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId:
        env.messagingSenderId ??
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: env.appId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
      measurementId:
        env.measurementId ?? process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    authPersistence: getReactNativePersistence(AsyncStorage),
  });
}

// Chama sincronamente no topo do módulo — antes de qualquer render
initializeOnce();

export function FirebaseProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
