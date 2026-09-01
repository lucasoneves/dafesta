"use client";

import { useState } from "react";
import type {
  EventParticipantStatus,
} from "@dafesta/types";
import type { StoredParticipant } from "@dafesta/database";
import { Button } from "./button.tsx";
import { Input } from "./input.tsx";
import { cn } from "./cn.ts";

export interface InviteParticipantInput {
  name: string;
  email?: string;
}

interface RsvpPanelProps {
  participants: StoredParticipant[];
  onAddParticipant: (input: InviteParticipantInput) => Promise<void>;
  onUpdateStatus: (
    participantId: string,
    status: EventParticipantStatus
  ) => Promise<void>;
  isUpdatingParticipantId?: string | null;
  isAdding?: boolean;
  className?: string;
}

const RSVP_LABEL: Record<EventParticipantStatus, string> = {
  confirmed: "Confirmado",
  declined: "Recusado",
  pending: "Pendente",
};

const STATUS_OPTIONS: EventParticipantStatus[] = [
  "confirmed",
  "pending",
  "declined",
];

export function RsvpPanel({
  participants,
  onAddParticipant,
  onUpdateStatus,
  isUpdatingParticipantId = null,
  isAdding = false,
  className,
}: RsvpPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const confirmed = participants.filter((p) => p.status === "confirmed").length;
  const pending = participants.filter((p) => p.status === "pending").length;
  const declined = participants.filter((p) => p.status === "declined").length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError("Informe o nome do convidado.");
      return;
    }
    try {
      await onAddParticipant({ name: name.trim(), email: email.trim() || undefined });
      setName("");
      setEmail("");
      setShowForm(false);
      setSuccess("Convidado adicionado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleUpdateStatus(participantId: string, status: EventParticipantStatus) {
    setError(null);
    setSuccess(null);
    try {
      await onUpdateStatus(participantId, status);
      setSuccess("Status de presença atualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      {success && (
        <div className="rounded-md border border-secondary-container bg-secondary-container p-3">
          <p className="font-label text-label-sm text-on-secondary-container">{success}</p>
        </div>
      )}
      {error && (
        <div className="rounded-md border border-error-container bg-error-container p-3">
          <p className="font-label text-label-sm text-on-error-container">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <SummaryStat label="Confirmados" value={confirmed} tone="success" />
        <SummaryStat label="Pendentes" value={pending} tone="pending" />
        <SummaryStat label="Recusados" value={declined} tone="error" />
      </div>

      {!showForm ? (
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setShowForm(true);
          }}
        >
          Convidar participante
        </Button>
      ) : (
        <form
          onSubmit={handleAdd}
          noValidate
          className="flex flex-col gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-card"
        >
          <p className="font-label text-label-md font-semibold text-on-surface">
            Adicionar convidado
          </p>
          <Input
            label="Nome *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Maria Silva"
            disabled={isAdding}
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maria@email.com"
            disabled={isAdding}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              className="sm:flex-1"
              disabled={isAdding}
            >
              {isAdding ? "Adicionando..." : "Adicionar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="sm:flex-1"
              onClick={() => setShowForm(false)}
              disabled={isAdding}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {participants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-10 text-center">
          <p className="font-headline text-headline-md font-semibold text-on-surface">
            Nenhum convidado ainda
          </p>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            Adicione convidados e controle o status de presença.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="rounded-lg bg-surface-container-lowest p-4 shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-label text-label-md font-semibold text-on-surface">
                    {participant.name || participant.userId}
                  </p>
                  {participant.email && (
                    <p className="truncate font-label text-label-sm text-on-surface-variant">
                      {participant.email}
                    </p>
                  )}
                </div>
                <CurrentStatusBadge status={participant.status} />
              </div>

              <div className="mt-3 flex gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const isActive = participant.status === status;
                  const isUpdating = isUpdatingParticipantId === participant.id;
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(participant.id, status)}
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-full px-2 py-1.5 font-label text-label-sm font-semibold transition-all duration-150",
                        "disabled:opacity-60",
                        isActive
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-low"
                      )}
                    >
                      {isUpdating ? "..." : RSVP_LABEL[status]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "pending" | "error";
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-surface-container-lowest p-4 shadow-card">
      <span
        className={cn(
          "font-headline text-headline-lg font-bold",
          tone === "success" && "text-secondary",
          tone === "pending" && "text-primary",
          tone === "error" && "text-error"
        )}
      >
        {value}
      </span>
      <span className="mt-1 text-center font-label text-label-sm text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

function CurrentStatusBadge({ status }: { status: EventParticipantStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 font-label text-label-sm font-medium",
        status === "confirmed" && "bg-primary-container text-on-primary-container",
        status === "declined" && "bg-error-container text-on-error-container",
        status === "pending" && "bg-surface-container-high text-on-surface-variant"
      )}
    >
      {RSVP_LABEL[status]}
    </span>
  );
}
