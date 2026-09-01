"use client";

import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, getCurrentUser } from "../auth.ts";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setState({
        user: currentUser,
        loading: false,
        isAuthenticated: true,
      });
    }

    const unsubscribe = onAuthStateChanged((user) => {
      setState({
        user,
        loading: false,
        isAuthenticated: !!user,
      });
    });

    return () => unsubscribe();
  }, []);

  return state;
}
