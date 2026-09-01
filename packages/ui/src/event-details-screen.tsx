"use client";

import { useState } from "react";
import type {
  EventWithId,
  StoredParticipant,
  StoredListItem,
} from "@dafesta/database";
import type { EventParticipantStatus } from "@dafesta/types";
import { formatDate } from "@dafesta/utils";
import { Button } from "./button.tsx";
import { Tabs } from "./tabs.tsx";
import { EmptyState } from "./empty-state.tsx";
import { Skeleton } from "./skeleton.tsx";
import { RsvpPanel, type InviteParticipantInput } from "./rsvp-panel.tsx";
import { cn } from "./cn.ts";

type TabId = "resumo" | "convidados" | "lista";

interface EventDetailsScreenProps {
  event: EventWithId | null;
  participants: StoredParticipant[];
  listItems: StoredListItem[];
  loading?: boolean;
  notFound?: boolean;
  error?: string | null;
  shareUrl?: string;
  onBack: () => void;
  onShare?: (event: EventWithId) => void;
  onAddParticipant?: (input: InviteParticipantInput) => Promise<void>;
  onUpdateStatus?: (
    participantId: string,
    status: EventParticipantStatus
  ) => Promise<void>;
  isUpdatingParticipantId?: string | null;
  isAdding?: boolean;
  className?: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  food: "Comida",
  drink: "Bebida",
  decoration: "Decoração",
  utensils: "Utensílios",
  entertainment: "Entretenimento",
  other: "Outros",
};

async function noopAddParticipant(): Promise<void> {}
async function noopUpdateStatus(): Promise<void> {}

export function EventDetailsScreen({
  event,
  participants,
  listItems,
  loading = false,
  notFound = false,
  error = null,
  shareUrl,
  onBack,
  onShare,
  onAddParticipant,
  onUpdateStatus,
  isUpdatingParticipantId = null,
  isAdding = false,
  className,
}: EventDetailsScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("resumo");

  async function handleShare() {
    if (!event) return;
    if (onShare) {
      onShare(event);
      return;
    }
    const url = shareUrl ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Confira o evento "${event.title}" no Dafesta!`,
          url,
        });
      } catch {
        // usuário cancelou o compartilhamento
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }

  if (loading) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <DetailsHeader onBack={onBack} />
        <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-8 sm:px-10">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-2 h-4 w-1/3" />
          <Skeleton className="mt-8 h-12 w-full rounded-full" />
          <Skeleton className="mt-6 h-28 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <DetailsHeader onBack={onBack} />
        <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-16">
          <EmptyState
            title="Festa não encontrada"
            description="Não encontramos este evento. Ele pode ter sido removido ou o link está incorreto."
            actionLabel="Voltar para o painel"
            onAction={onBack}
          />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <DetailsHeader onBack={onBack} />
        <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-16">
          <EmptyState
            title="Falha ao carregar o evento"
            description={error}
            actionLabel="Voltar para o painel"
            onAction={onBack}
          />
        </main>
      </div>
    );
  }

  const dateLabel = event.date ? formatDate(event.date) : "Data não definida";

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <DetailsHeader onBack={onBack} />

      <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-8 sm:px-10">
        <p className="font-label text-label-sm uppercase tracking-wide text-primary">
          Detalhes da festa
        </p>
        <h1 className="mt-2 font-headline text-headline-lg font-bold text-on-surface">
          {event.title}
        </h1>
        <p className="mt-1 font-body text-body-md text-on-surface-variant">
          {dateLabel}
        </p>
        {event.location && (
          <p className="mt-1 font-body text-body-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">Local:</span>{" "}
            {event.location}
          </p>
        )}

        <Button
          className="mt-6 w-full bg-secondary hover:bg-secondary-container"
          size="lg"
          onClick={handleShare}
        >
          Compartilhar link
        </Button>

        <div className="mt-8">
          <Tabs
            items={[
              { id: "resumo", label: "Resumo" },
              { id: "convidados", label: "Convidados", count: participants.length },
              { id: "lista", label: "Lista", count: listItems.length },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
          />
        </div>

        <div className="mt-6">
          {activeTab === "resumo" && <SummaryTab event={event} />}
          {activeTab === "convidados" && (
            <RsvpPanel
              participants={participants}
              onAddParticipant={onAddParticipant ?? noopAddParticipant}
              onUpdateStatus={onUpdateStatus ?? noopUpdateStatus}
              isUpdatingParticipantId={isUpdatingParticipantId}
              isAdding={isAdding}
            />
          )}
          {activeTab === "lista" && <ListTab listItems={listItems} />}
        </div>
      </main>
    </div>
  );
}

function DetailsHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 sm:px-10">
      <h1 className="font-headline text-headline-md font-bold text-on-surface">
        Dafesta
      </h1>
      <Button variant="ghost" onClick={onBack}>
        Voltar
      </Button>
    </header>
  );
}

function SummaryTab({ event }: { event: EventWithId }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-lg bg-surface-container-lowest p-6 shadow-card">
        <h2 className="font-headline text-headline-md font-semibold text-on-surface">
          {event.title}
        </h2>
        <dl className="mt-4 flex flex-col gap-3">
          <DetailRow label="Data" value={event.date ? formatDate(event.date) : "Não definida"} />
          {event.location && <DetailRow label="Local" value={event.location} />}
          <DetailRow
            label="Status"
            value={event.status ? event.status : "Não definido"}
          />
        </dl>
      </div>
      {event.description ? (
        <div className="rounded-lg bg-surface-container-lowest p-6 shadow-card">
          <h3 className="font-label text-label-md font-semibold text-on-surface">
            Descrição
          </h3>
          <p className="mt-2 whitespace-pre-wrap font-body text-body-md text-on-surface-variant">
            {event.description}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-label text-label-sm text-on-surface-variant">{label}</dt>
      <dd className="font-body text-body-md font-medium capitalize text-on-surface">
        {value}
      </dd>
    </div>
  );
}

function ListTab({ listItems }: { listItems: StoredListItem[] }) {
  if (listItems.length === 0) {
    return (
      <EmptyState
        title="A lista está vazia"
        description="Os itens da lista colaborativa aparecerão aqui. Em breve será possível adicionar e marcar o que você vai levar."
      />
    );
  }

  return (
    <section className="flex flex-col gap-3">
      {listItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-card"
        >
          <div className="min-w-0">
            <p className="truncate font-label text-label-md font-semibold text-on-surface">
              {item.title}
            </p>
            <p className="font-label text-label-sm capitalize text-on-surface-variant">
              {CATEGORY_LABEL[item.category] ?? item.category}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-primary-container px-2.5 py-1 font-label text-label-sm font-semibold text-on-primary-container">
              {item.quantity > 0 ? `x${item.quantity}` : "1"}
            </span>
            {item.isCompleted ? (
              <span className="rounded-full bg-secondary/15 px-2.5 py-1 font-label text-label-sm font-semibold text-secondary">
                Levo eu
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
