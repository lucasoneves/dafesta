"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@dafesta/ui/event-form";
import { Button } from "@dafesta/ui/button";
import { useAuth, createEvent } from "@dafesta/database";

export default function NewEventPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-body-md text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <h1 className="font-headline text-headline-md font-bold text-on-surface">
          Dafesta
        </h1>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          Voltar
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col items-center px-6 pt-10">
        <p className="font-label text-label-sm uppercase tracking-wide text-primary">
          Nova festa
        </p>
        <h2 className="mt-2 text-center font-headline text-headline-lg font-bold text-on-surface">
          Crie seu evento
        </h2>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          Preencha os dados abaixo para começar a organizar.
        </p>

        <div className="mt-8 w-full rounded-lg bg-surface-container-lowest p-6 shadow-card">
          <EventForm
            onCancel={() => router.push("/dashboard")}
            onSubmit={async (payload) => {
              await createEvent(payload, user);
              router.replace("/dashboard");
            }}
          />
        </div>
      </main>
    </div>
  );
}
