"use client";

import { useState } from "react";
import { Button } from "./button.tsx";
import { cn } from "./cn.ts";

interface LoginScreenProps {
  onLogin: () => Promise<unknown>;
  onLogout?: () => Promise<unknown>;
  isAuthenticated?: boolean;
  user?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  authLoading?: boolean;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
}

export function LoginScreen({
  onLogin,
  onLogout,
  isAuthenticated = false,
  user = null,
  authLoading = false,
  title = "Dafesta",
  subtitle = "Organize suas festas e compartilhe listas de forma colaborativa.",
  imageUrl,
  className,
}: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setIsLoading(true);
    try {
      await onLogin();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setError(null);
    setIsLoading(true);
    try {
      await onLogout?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-lg bg-surface-container-low p-8 shadow-card",
          className
        )}
      >
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary-fixed-dim" />
        <p className="text-body-md text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center",
        className
      )}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="mb-8 w-56 max-w-full rounded-lg shadow-card sm:w-72"
        />
      )}

      <div className="flex w-full flex-col items-center rounded-lg bg-surface-container-lowest p-8 text-center shadow-card">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary transition-transform duration-150 active:scale-[0.95]">
          <span className="text-headline-md font-bold text-on-primary">D</span>
        </div>

        <h1 className="font-headline text-headline-lg font-bold text-on-surface">
          {title}
        </h1>
        <p className="mt-2 max-w-xs text-body-md text-on-surface-variant">
          {subtitle}
        </p>

        <div className="mt-8 w-full">
          {isAuthenticated && user ? (
            <div className="flex flex-col items-center gap-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-14 w-14 rounded-full"
                />
              )}
              <div>
                <p className="font-label text-label-md font-semibold text-on-surface">
                  {user.displayName ?? "Usuário"}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {user.email}
                </p>
              </div>
              {onLogout && (
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Saindo..." : "Sair"}
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  "Entrando..."
                ) : (
                  <>
                    <GoogleIcon />
                    Entrar com o Google
                  </>
                )}
              </span>
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-4 w-full rounded-md border border-error-container bg-error-container p-3 text-left">
            <p className="break-all text-label-sm text-on-error-container">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.4 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.4 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.3 35.7 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}
