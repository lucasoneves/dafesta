import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Share,
} from "react-native";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import {
  useAuth,
  useEventDetails,
  addParticipant,
  updateRsvpStatus,
} from "@dafesta/database";
import type {
  EventWithId,
  StoredParticipant,
  StoredListItem,
} from "@dafesta/database";
import type { EventParticipantStatus } from "@dafesta/types";
import { formatDate } from "@dafesta/utils";

type TabId = "resumo" | "convidados" | "lista";

const RSVP_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  declined: "Recusado",
  pending: "Pendente",
};

const CATEGORY_LABEL: Record<string, string> = {
  food: "Comida",
  drink: "Bebida",
  decoration: "Decoração",
  utensils: "Utensílios",
  entertainment: "Entretenimento",
  other: "Outros",
};

const TABS: { id: TabId; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "convidados", label: "Convidados" },
  { id: "lista", label: "Lista" },
];

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Array.isArray(id) ? id[0] : id;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { event, participants, listItems, loading, notFound, error } =
    useEventDetails(eventId);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("resumo");
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingParticipantId, setIsUpdatingParticipantId] = useState<
    string | null
  >(null);
  const [rsvpMessage, setRsvpMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#af0062" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  async function handleShare() {
    if (!event) return;
    try {
      await Share.share({
        title: event.title,
        message: `Confira o evento "${event.title}" no Dafesta!`,
      });
    } catch {
      // usuário cancelou
    }
  }

  async function handleAddParticipant(input: { name: string; email?: string }) {
    if (!eventId) return;
    setRsvpMessage(null);
    setIsAdding(true);
    try {
      await addParticipant(eventId, input, user);
      setRsvpMessage({ type: "success", text: "Convidado adicionado com sucesso!" });
    } catch (err) {
      setRsvpMessage({
        type: "error",
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdateStatus(
    participantId: string,
    status: EventParticipantStatus
  ) {
    if (!eventId) return;
    setRsvpMessage(null);
    setIsUpdatingParticipantId(participantId);
    try {
      await updateRsvpStatus(eventId, participantId, status);
      setRsvpMessage({ type: "success", text: "Status de presença atualizado." });
    } catch (err) {
      setRsvpMessage({
        type: "error",
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsUpdatingParticipantId(null);
    }
  }

  function Header() {
    return (
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="font-headline text-headline-md font-bold text-on-surface">
          Dafesta
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-transparent px-4 py-2 active:bg-surface-container-high"
        >
          <Text className="font-label text-label-md font-medium text-on-surface-variant">
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <Header />
        <View className="gap-4 px-6 pt-8">
          <View className="h-8 w-2/3 rounded-md bg-surface-container-high" />
          <View className="h-4 w-1/2 rounded-md bg-surface-container-high" />
          <View className="h-4 w-1/3 rounded-md bg-surface-container-high" />
          <View className="mt-4 h-12 w-full rounded-full bg-surface-container-high" />
          <View className="mt-4 h-6 w-full rounded-full bg-surface-container-high" />
          <View className="h-28 w-full rounded-lg bg-surface-container-high" />
        </View>
      </View>
    );
  }

  if (notFound || !event) {
    return (
      <View className="flex-1 bg-background">
        <Header />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-headline text-headline-md font-semibold text-on-surface">
            Festa não encontrada
          </Text>
          <Text className="mt-2 text-center font-body text-body-md text-on-surface-variant">
            Não encontramos este evento. Ele pode ter sido removido ou o link
            está incorreto.
          </Text>
          <Pressable
            onPress={() => router.replace("/dashboard")}
            className="mt-6 rounded-full bg-primary px-8 py-3.5 shadow-card"
          >
            <Text className="font-label text-label-md font-semibold text-on-primary">
              Voltar para o painel
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <Header />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-headline text-headline-md font-semibold text-on-surface">
            Falha ao carregar o evento
          </Text>
          <Text className="mt-2 text-center font-body text-body-md text-on-surface-variant">
            {error}
          </Text>
        </View>
      </View>
    );
  }

  const dateLabel = event.date ? formatDate(event.date) : "Data não definida";

  return (
    <View className="flex-1 bg-background">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
      >
        <View>
          <Text className="font-label text-label-sm uppercase tracking-wide text-primary">
            Detalhes da festa
          </Text>
          <Text className="mt-2 font-headline text-headline-lg font-bold text-on-surface">
            {event.title}
          </Text>
          <Text className="mt-1 font-body text-body-md text-on-surface-variant">
            {dateLabel}
          </Text>
          {event.location ? (
            <Text className="mt-1 font-body text-body-md text-on-surface-variant">
              <Text className="font-semibold text-on-surface">Local: </Text>
              {event.location}
            </Text>
          ) : null}

          <Pressable
            onPress={handleShare}
            className="mt-6 w-full items-center rounded-full border-2 border-secondary py-3.5 active:bg-secondary/10"
          >
            <Text className="font-label text-label-md font-semibold text-secondary">
              Compartilhar link
            </Text>
          </Pressable>
        </View>

        <View className="mt-8 flex-row gap-1 rounded-full bg-surface-container-high p-1">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`flex-1 items-center rounded-full py-2.5 ${
                  isActive ? "bg-primary" : "active:bg-surface-container-low"
                }`}
              >
                <Text
                  className={`font-label text-label-md font-semibold ${
                    isActive ? "text-on-primary" : "text-on-surface-variant"
                  }`}
                >
                  {tab.label}
                  {tab.id === "convidados"
                    ? ` (${participants.length})`
                    : tab.id === "lista"
                    ? ` (${listItems.length})`
                    : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6">
          {activeTab === "resumo" && <SummaryTab event={event} />}
          {activeTab === "convidados" && (
            <GuestsTab
              participants={participants}
              onAddParticipant={handleAddParticipant}
              onUpdateStatus={handleUpdateStatus}
              isUpdatingParticipantId={isUpdatingParticipantId}
              isAdding={isAdding}
              message={rsvpMessage}
            />
          )}
          {activeTab === "lista" && <ListTab listItems={listItems} />}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryTab({ event }: { event: EventWithId }) {
  return (
    <View className="gap-4">
      <View className="rounded-lg bg-surface-container-lowest p-6 shadow-card">
        <Text className="font-headline text-headline-md font-semibold text-on-surface">
          {event.title}
        </Text>
        <View className="mt-4 gap-3">
          <DetailRow
            label="Data"
            value={event.date ? formatDate(event.date) : "Não definida"}
          />
          {event.location ? (
            <DetailRow label="Local" value={event.location} />
          ) : null}
          <DetailRow
            label="Status"
            value={event.status ? event.status : "Não definido"}
          />
        </View>
      </View>
      {event.description ? (
        <View className="rounded-lg bg-surface-container-lowest p-6 shadow-card">
          <Text className="font-label text-label-md font-semibold text-on-surface">
            Descrição
          </Text>
          <Text className="mt-2 font-body text-body-md text-on-surface-variant">
            {event.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="font-label text-label-sm text-on-surface-variant">
        {label}
      </Text>
      <Text className="font-body text-body-md font-medium capitalize text-on-surface">
        {value}
      </Text>
    </View>
  );
}

const STATUS_OPTIONS: EventParticipantStatus[] = ["confirmed", "pending", "declined"];

interface GuestsTabProps {
  participants: StoredParticipant[];
  onAddParticipant: (input: { name: string; email?: string }) => Promise<void>;
  onUpdateStatus: (
    participantId: string,
    status: EventParticipantStatus
  ) => Promise<void>;
  isUpdatingParticipantId: string | null;
  isAdding: boolean;
  message: { type: "success" | "error"; text: string } | null;
}

function GuestsTab({
  participants,
  onAddParticipant,
  onUpdateStatus,
  isUpdatingParticipantId,
  isAdding,
  message,
}: GuestsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const confirmed = participants.filter((p) => p.status === "confirmed").length;
  const pending = participants.filter((p) => p.status === "pending").length;
  const declined = participants.filter((p) => p.status === "declined").length;

  async function handleAdd() {
    setLocalError(null);
    if (!name.trim()) {
      setLocalError("Informe o nome do convidado.");
      return;
    }
    await onAddParticipant({ name: name.trim(), email: email.trim() || undefined });
    setName("");
    setEmail("");
    setShowForm(false);
  }

  return (
    <View className="gap-5">
      {message ? (
        <View
          className={`rounded-md border p-3 ${
            message.type === "success"
              ? "border-secondary-container bg-secondary-container"
              : "border-error-container bg-error-container"
          }`}
        >
          <Text
            className={`font-label text-label-sm ${
              message.type === "success"
                ? "text-on-secondary-container"
                : "text-on-error-container"
            }`}
          >
            {message.text}
          </Text>
        </View>
      ) : null}
      {localError ? (
        <View className="rounded-md border border-error-container bg-error-container p-3">
          <Text className="font-label text-label-sm text-on-error-container">
            {localError}
          </Text>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <SummaryStat label="Confirmados" value={confirmed} tone="success" />
        <SummaryStat label="Pendentes" value={pending} tone="pending" />
        <SummaryStat label="Recusados" value={declined} tone="error" />
      </View>

      {!showForm ? (
        <Pressable
          onPress={() => setShowForm(true)}
          className="w-full items-center rounded-full border-2 border-secondary py-3.5 active:bg-secondary/10"
        >
          <Text className="font-label text-label-md font-semibold text-secondary">
            Convidar participante
          </Text>
        </Pressable>
      ) : (
        <View className="rounded-lg bg-surface-container-lowest p-4 shadow-card">
          <Text className="font-label text-label-md font-semibold text-on-surface">
            Adicionar convidado
          </Text>
          <View className="mt-3 gap-3">
            <View>
              <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
                Nome *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Maria Silva"
                placeholderTextColor="#8c7078"
                editable={!isAdding}
                className="h-14 w-full rounded-md border-2 border-transparent bg-surface-container-low px-4 font-body text-body-md text-on-surface"
              />
            </View>
            <View>
              <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
                E-mail (opcional)
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="maria@email.com"
                placeholderTextColor="#8c7078"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isAdding}
                className="h-14 w-full rounded-md border-2 border-transparent bg-surface-container-low px-4 font-body text-body-md text-on-surface"
              />
            </View>
            <View className="gap-2">
              <Pressable
                onPress={handleAdd}
                disabled={isAdding}
                className="w-full items-center rounded-full bg-primary py-3.5 active:scale-[0.98]"
              >
                {isAdding ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="font-label text-label-md font-semibold text-on-primary">
                    Adicionar
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => setShowForm(false)}
                disabled={isAdding}
                className="w-full items-center rounded-full py-2 active:bg-surface-container-high"
              >
                <Text className="font-label text-label-md font-medium text-on-surface-variant">
                  Cancelar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {participants.length === 0 ? (
        <View className="items-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-10">
          <Text className="text-center font-headline text-headline-md font-semibold text-on-surface">
            Nenhum convidado ainda
          </Text>
          <Text className="mt-2 text-center font-body text-body-md text-on-surface-variant">
            Adicione convidados e controle o status de presença.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {participants.map((participant) => {
            const isUpdating = isUpdatingParticipantId === participant.id;
            return (
              <View
                key={participant.id}
                className="rounded-lg bg-surface-container-lowest p-4 shadow-card"
              >
                <View className="flex-row items-center justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-label text-label-md font-semibold text-on-surface"
                    >
                      {participant.name || participant.userId}
                    </Text>
                    {participant.email ? (
                      <Text
                        numberOfLines={1}
                        className="font-label text-label-sm text-on-surface-variant"
                      >
                        {participant.email}
                      </Text>
                    ) : null}
                  </View>
                  <StatusBadge status={participant.status} />
                </View>

                <View className="mt-3 flex-row gap-2">
                  {STATUS_OPTIONS.map((status) => {
                    const isActive = participant.status === status;
                    return (
                      <Pressable
                        key={status}
                        disabled={isUpdating}
                        onPress={() => onUpdateStatus(participant.id, status)}
                        className={`flex-1 items-center rounded-full px-2 py-2 ${
                          isActive
                            ? "bg-primary"
                            : "bg-surface-container-high active:bg-surface-container-low"
                        }`}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#af0062" />
                        ) : (
                          <Text
                            className={`font-label text-label-sm font-semibold ${
                              isActive
                                ? "text-on-primary"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {RSVP_LABEL[status]}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function StatusBadge({ status }: { status: EventParticipantStatus }) {
  return (
    <View
      className={`rounded-full px-3 py-1 ${
        status === "confirmed"
          ? "bg-primary-container"
          : status === "declined"
          ? "bg-error-container"
          : "bg-surface-container-high"
      }`}
    >
      <Text
        className={`font-label text-label-sm font-medium ${
          status === "confirmed"
            ? "text-on-primary-container"
            : status === "declined"
            ? "text-on-error-container"
            : "text-on-surface-variant"
        }`}
      >
        {RSVP_LABEL[status] ?? status}
      </Text>
    </View>
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
    <View className="flex-1 items-center rounded-lg bg-surface-container-lowest p-4 shadow-card">
      <Text
        className={`font-headline text-headline-lg font-bold ${
          tone === "success"
            ? "text-secondary"
            : tone === "pending"
            ? "text-primary"
            : "text-error"
        }`}
      >
        {value}
      </Text>
      <Text className="mt-1 text-center font-label text-label-sm text-on-surface-variant">
        {label}
      </Text>
    </View>
  );
}

function ListTab({ listItems }: { listItems: StoredListItem[] }) {
  if (listItems.length === 0) {
    return (
      <View className="items-center rounded-lg border border-dashed border-outline-variant px-6 py-12">
        <Text className="text-center font-headline text-headline-md font-semibold text-on-surface">
          A lista está vazia
        </Text>
        <Text className="mt-2 text-center font-body text-body-md text-on-surface-variant">
          Os itens da lista colaborativa aparecerão aqui. Em breve será possível
          adicionar e marcar o que você vai levar.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {listItems.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-card"
        >
          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="font-label text-label-md font-semibold text-on-surface"
            >
              {item.title}
            </Text>
            <Text className="font-label text-label-sm capitalize text-on-surface-variant">
              {CATEGORY_LABEL[item.category] ?? item.category}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-primary-container px-2.5 py-1">
              <Text className="font-label text-label-sm font-semibold text-on-primary-container">
                {item.quantity > 0 ? `x${item.quantity}` : "1"}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
