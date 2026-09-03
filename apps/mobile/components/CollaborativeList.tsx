import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import type { StoredListItem } from "@dafesta/database";
import type { ItemCategory } from "@dafesta/types";

export const LIST_CATEGORY_LABEL: Record<ItemCategory, string> = {
  food: "Comida",
  drink: "Bebida",
  decoration: "Decoração",
  utensils: "Utensílios",
  entertainment: "Entretenimento",
  other: "Outros",
};

const CATEGORY_OPTIONS: ItemCategory[] = [
  "food",
  "drink",
  "decoration",
  "utensils",
  "entertainment",
  "other",
];

export interface AddListItemInput {
  title: string;
  category: ItemCategory;
  quantity: number;
}

interface CollaborativeListProps {
  items: StoredListItem[];
  currentUserId: string;
  onAdd: (input: AddListItemInput) => Promise<void>;
  onClaim: (itemId: string) => Promise<void>;
  onRelease: (itemId: string) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  isAdding?: boolean;
  pendingItemId?: string | null;
  onNotify: (
    toast: { type: "success" | "error"; text: string } | null
  ) => void;
}

const FIELD_CLASS =
  "h-14 w-full rounded-md border-2 bg-surface-container-low px-4 font-body text-body-md text-on-surface";

export function CollaborativeList({
  items,
  currentUserId,
  onAdd,
  onClaim,
  onRelease,
  onDelete,
  isAdding = false,
  pendingItemId = null,
  onNotify,
}: CollaborativeListProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ItemCategory>("food");
  const [quantity, setQuantity] = useState("1");
  const [groupMode, setGroupMode] = useState<"category" | "status">("category");

  const total = items.length;
  const claimedCount = items.filter((i) => i.claimedByUserId !== null).length;

  const grouped = useMemo(() => {
    if (groupMode === "status") {
      return [
        {
          key: "open",
          label: "Abertos",
          groups: items.filter((i) => i.claimedByUserId === null),
        },
        {
          key: "claimed",
          label: "Reivindicados",
          groups: items.filter((i) => i.claimedByUserId !== null),
        },
      ];
    }
    return CATEGORY_OPTIONS
      .map((cat) => ({
        key: cat,
        label: LIST_CATEGORY_LABEL[cat],
        groups: items.filter((i) => i.category === cat),
      }))
      .filter((g) => g.groups.length > 0);
  }, [items, groupMode]);

  async function handleAdd() {
    if (!title.trim()) {
      onNotify({ type: "error", text: "Informe el item." });
      return;
    }
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    try {
      await onAdd({ title: title.trim(), category, quantity: qty });
      setTitle("");
      setQuantity("1");
      setCategory("food");
      setShowForm(false);
    } catch (err) {
      onNotify({
        type: "error",
        text: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row gap-2">
          <View className="rounded-full bg-surface-container-high px-3 py-1">
            <Text className="font-label text-label-sm font-semibold text-on-surface-variant">
              Itens: {total}
            </Text>
          </View>
          <View className="rounded-full bg-surface-container-high px-3 py-1">
            <Text className="font-label text-label-sm font-semibold text-on-surface-variant">
              Levo eu: {claimedCount}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-1 rounded-full bg-surface-container-high p-1">
          <Pressable
            onPress={() => setGroupMode("category")}
            className={`rounded-full px-3 py-1.5 ${
              groupMode === "category" ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`font-label text-label-sm font-semibold ${
                groupMode === "category"
                  ? "text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              Categoria
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setGroupMode("status")}
            className={`rounded-full px-3 py-1.5 ${
              groupMode === "status" ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`font-label text-label-sm font-semibold ${
                groupMode === "status"
                  ? "text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              Status
            </Text>
          </Pressable>
        </View>
      </View>

      {!showForm ? (
        <Pressable
          onPress={() => setShowForm(true)}
          className="w-full items-center rounded-full border-2 border-secondary py-3.5 active:bg-secondary/10"
        >
          <Text className="font-label text-label-md font-semibold text-secondary">
            Adicionar item
          </Text>
        </Pressable>
      ) : (
        <View className="rounded-lg bg-surface-container-lowest p-4 shadow-card">
          <Text className="font-label text-label-md font-semibold text-on-surface">
            Adicionar item
          </Text>
          <View className="mt-3 gap-3">
            <View>
              <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
                Item *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex.: Refrigerante, salgadinhos..."
                placeholderTextColor="#8c7078"
                editable={!isAdding}
                className={`${FIELD_CLASS} border-transparent`}
              />
            </View>
            <View>
              <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
                Categoria
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      disabled={isAdding}
                      className={`rounded-full px-3 py-1.5 ${
                        isActive ? "bg-primary" : "bg-surface-container-high"
                      }`}
                    >
                      <Text
                        className={`font-label text-label-sm font-semibold ${
                          isActive ? "text-on-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {LIST_CATEGORY_LABEL[cat]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View>
              <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
                Qtde
              </Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                editable={!isAdding}
                className={`${FIELD_CLASS} border-transparent`}
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

      {grouped.map((group) => (
        <View key={group.key} className="gap-2">
          <View className="flex-row items-center gap-1.5">
            <Text className="font-label text-label-sm uppercase tracking-wide text-on-surface-variant">
              {group.label}
            </Text>
            <View className="rounded-full bg-surface-container-high px-2 py-0.5">
              <Text className="font-label text-label-sm text-on-surface-variant">
                {group.groups.length}
              </Text>
            </View>
          </View>
          <View className="gap-3">
            {group.groups.map((item) => {
              const isMine = item.claimedByUserId === currentUserId;
              const isPending = pendingItemId === item.id;
              return (
                <View
                  key={item.id}
                  className={`rounded-lg bg-surface-container-lowest p-4 shadow-card ${
                    item.claimedByUserId !== null ? "opacity-80" : ""
                  }`}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1">
                      <Text
                        numberOfLines={1}
                        className={`font-label text-label-md font-semibold text-on-surface ${
                          item.claimedByUserId !== null ? "line-through" : ""
                        }`}
                      >
                        {item.title}
                      </Text>
                      <Text className="font-label text-label-sm capitalize text-on-surface-variant">
                        {LIST_CATEGORY_LABEL[item.category] ?? item.category} ·{" "}
                        {item.quantity > 0 ? `x${item.quantity}` : "1"}
                      </Text>
                      {item.claimedByName ? (
                        <Text className="mt-1 font-label text-label-sm font-medium text-secondary">
                          {isMine ? "Levo eu ✓" : `${item.claimedByName} leva`}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => onDelete(item.id)}
                      disabled={isPending || isAdding}
                      hitSlop={8}
                    >
                      <Text className="font-label text-label-sm text-on-surface-variant opacity-70">
                        Remover
                      </Text>
                    </Pressable>
                  </View>

                  <View className="mt-3 flex-row gap-2">
                    {item.claimedByUserId === null ? (
                      <Pressable
                        onPress={() => onClaim(item.id)}
                        disabled={isPending}
                        className="flex-1 items-center rounded-full bg-secondary py-2.5 active:bg-secondary/90"
                      >
                        {isPending ? (
                          <ActivityIndicator size="small" color="#1259c3" />
                        ) : (
                          <Text className="font-label text-label-sm font-semibold text-on-secondary">
                            Eu levo
                          </Text>
                        )}
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => onRelease(item.id)}
                        disabled={isPending}
                        className={`flex-1 items-center rounded-full py-2.5 ${
                          isMine
                            ? "bg-surface-container-high active:bg-surface-container-low"
                            : "active:bg-surface-container-high"
                        }`}
                      >
                        {isPending ? (
                          <ActivityIndicator size="small" color="#8c7078" />
                        ) : (
                          <Text className="font-label text-label-sm font-semibold text-on-surface-variant">
                            Desmarcar
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}