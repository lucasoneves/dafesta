"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAuth,
  useEventDetails,
  addParticipant,
  updateRsvpStatus,
} from "@dafesta/database";
import type { EventParticipantStatus } from "@dafesta/types";
import { EventDetailsScreen } from "@dafesta/ui/event-details-screen";
import type { InviteParticipantInput } from "@dafesta/ui/rsvp-panel";

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const eventId = typeof params?.id === "string" ? params.id : undefined;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { event, participants, listItems, loading, notFound, error } =
    useEventDetails(eventId);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingParticipantId, setIsUpdatingParticipantId] = useState<
    string | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-body-md text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

  async function handleAddParticipant(input: InviteParticipantInput) {
    if (!eventId) return;
    setIsAdding(true);
    try {
      await addParticipant(eventId, input, user);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdateStatus(
    participantId: string,
    status: EventParticipantStatus
  ) {
    if (!eventId) return;
    setIsUpdatingParticipantId(participantId);
    try {
      await updateRsvpStatus(eventId, participantId, status);
    } finally {
      setIsUpdatingParticipantId(null);
    }
  }

  return (
    <EventDetailsScreen
      event={event}
      participants={participants}
      listItems={listItems}
      loading={loading}
      notFound={notFound}
      error={error}
      shareUrl={
        typeof window !== "undefined"
          ? window.location.href
          : `/events/${eventId}`
      }
      onBack={() => router.push("/dashboard")}
      onAddParticipant={handleAddParticipant}
      onUpdateStatus={handleUpdateStatus}
      isUpdatingParticipantId={isUpdatingParticipantId}
      isAdding={isAdding}
    />
  );
}
