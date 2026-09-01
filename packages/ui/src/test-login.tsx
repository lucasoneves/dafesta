"use client";

import { useState } from "react";
import { useAuth } from "@dafesta/database/hooks/use-auth";
import { signOut } from "@dafesta/database/auth";
import { Button } from "./button.tsx";
import { cn } from "./cn.ts";

interface TestLoginProps {
  onLogin: () => Promise<unknown>;
  className?: string;
}

export function TestLogin({ onLogin, className }: TestLoginProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogin() {
    setError(null);
    try {
      await onLogin();
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code ?? "";
      const message = e?.message ?? String(err);
      setError(code ? `${code}: ${message}` : message);
    }
  }

  async function handleLogout() {
    setError(null);
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[TestLogin] Erro no logout:", message);
      setError(message);
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg bg-surface-container-low p-6 shadow-card",
          className
        )}
      >
        <p className="text-body-md text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-surface-container-lowest p-6 shadow-card",
        className
      )}
    >
      <h2 className="mb-4 font-headline text-headline-md font-semibold text-on-surface">
        Teste de Login
      </h2>

      {isAuthenticated && user ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <p className="font-label text-label-md font-medium text-on-surface">
                {user.displayName ?? "Sem nome"}
              </p>
              <p className="text-label-sm text-on-surface-variant">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            onPress={handleLogout}
            disabled={signingOut}
            className="w-full"
            variant="ghost"
          >
            {signingOut ? "Saindo..." : "Sair"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-body-md text-on-surface-variant">Não logado</p>
          <Button onPress={handleLogin} className="w-full">
            Login com Google
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-error-container bg-error-container p-3">
          <p className="font-label text-label-sm break-all text-on-error-container">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
