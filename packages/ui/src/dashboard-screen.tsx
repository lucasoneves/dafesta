"use client";

import type { UserEvent } from "@dafesta/database";
import { Button } from "./button.tsx";
import { EventCard } from "./event-card.tsx";
import { EmptyState } from "./empty-state.tsx";
import { EventCardSkeleton } from "./skeleton.tsx";
import { cn } from "./cn.ts";

interface DashboardUser {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

interface DashboardScreenProps {
  user?: DashboardUser | null;
  events: UserEvent[];
  loading?: boolean;
  error?: string | null;
  onLogout: () => void;
  onNewEvent: () => void;
  onSelectEvent?: (event: UserEvent) => void;
  className?: string;
}

export function DashboardScreen({
  user,
  events,
  loading = false,
  error = null,
  onLogout,
  onNewEvent,
  onSelectEvent,
  className,
}: DashboardScreenProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <h1 className="font-headline text-headline-md font-bold text-on-surface">
          Dafesta
        </h1>
        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="h-10 w-10 rounded-full"
            />
          )}
          <div className="hidden flex-col items-end sm:flex">
            <span className="font-label text-label-md text-on-surface">
              {user?.displayName ?? "Usuário"}
            </span>
            {user?.email && (
              <span className="font-label text-label-sm text-on-surface-variant">
                {user.email}
              </span>
            )}
          </div>
          <Button variant="ghost" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-24 pt-10 sm:px-10">
        <div className="flex flex-col gap-2">
          <p className="font-label text-label-sm uppercase tracking-wide text-primary">
            Painel de eventos
          </p>
          <h2 className="text-center font-headline text-headline-lg font-bold text-on-surface sm:text-left">
            Seus eventos
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {loading ? (
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : error ? (
            <EmptyState
              title="Não foi possível carregar seus eventos"
              description={error}
              actionLabel="Tentar novamente"
              onAction={() => window.location.reload()}
            />
          ) : events.length === 0 ? (
            <EmptyState
              title="Nenhuma festa por aqui"
              description="Você ainda não criou nem participa de nenhuma festa. Que tal começar agora?"
              actionLabel="Criar minha primeira festa"
              onAction={onNewEvent}
            />
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={onSelectEvent ? () => onSelectEvent(event) : undefined}
              />
            ))
          )}
        </div>
      </main>

      <Button
        size="lg"
        onClick={onNewEvent}
        className="fixed bottom-6 right-6 z-10 shadow-fab"
      >
        + Nova festa
      </Button>
    </div>
  );
}
