"use client";

import { useRouter } from "next/navigation";
import { useAuth, signOut, useUserEvents } from "@dafesta/database";
import { DashboardScreen } from "@dafesta/ui/dashboard-screen";

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { events, loading, error } = useUserEvents(user);
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-body-md text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-body-md text-on-surface-variant">
          Você não está logado.
        </p>
        <button
          className="rounded-full bg-secondary px-6 py-3 font-label font-semibold text-on-secondary"
          onClick={() => router.replace("/")}
        >
          Fazer login
        </button>
      </div>
    );
  }

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  return (
    <DashboardScreen
      user={user}
      events={events}
      loading={loading}
      error={error}
      onLogout={handleLogout}
      onNewEvent={() => router.push("/events/new")}
      onSelectEvent={(event) => router.push(`/events/${event.id}`)}
    />
  );
}
