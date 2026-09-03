"use client";

import { useMemo, useState } from "react";
import type { StoredListItem } from "@dafesta/database";
import type { ItemCategory } from "@dafesta/types";
import { Button } from "./button.tsx";
import { Input } from "./input.tsx";
import { Toast } from "./toast.tsx";
import { EmptyState } from "./empty-state.tsx";
import { cn } from "./cn.ts";

export const LIST_CATEGORY_LABEL: Record<ItemCategory, string> = {
  food: "Comida",
  drink: "Bebida",
  decoration: "Decoração",
  utensils: "Utensílios",
  entertainment: "Entretenimento",
  other: "Outros",
};

export const LIST_CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: "food", label: "Comida" },
  { value: "drink", label: "Bebida" },
  { value: "decoration", label: "Decoração" },
  { value: "utensils", label: "Utensílios" },
  { value: "entertainment", label: "Entretenimento" },
  { value: "other", label: "Outros" },
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
  className?: string;
}

type GroupMode = "category" | "status";

export function CollaborativeList({
  items,
  currentUserId,
  onAdd,
  onClaim,
  onRelease,
  onDelete,
  isAdding = false,
  pendingItemId = null,
  className,
}: CollaborativeListProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ItemCategory>("food");
  const [quantity, setQuantity] = useState("1");
  const [groupMode, setGroupMode] = useState<GroupMode>("category");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const total = items.length;
  const claimedCount = items.filter((i) => i.claimedByUserId !== null).length;

  const grouped = useMemo(() => {
    if (groupMode === "status") {
      const claimed = items.filter((i) => i.claimedByUserId !== null);
      const open = items.filter((i) => i.claimedByUserId === null);
      return [
        { key: "open", label: "Abertos", groups: open },
        { key: "claimed", label: "Reivindicados", groups: claimed },
      ];
    }

    return LIST_CATEGORY_OPTIONS.map((cat) => ({
      key: cat.value,
      label: cat.label,
      groups: items.filter((item) => item.category === cat.value),
    })).filter((group) => group.groups.length > 0);
  }, [items, groupMode]);

  function resetForm() {
    setTitle("");
    setCategory("food");
    setQuantity("1");
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!title.trim()) {
      setError("Informe o nome do item.");
      return;
    }
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    try {
      await onAdd({
        title: title.trim(),
        category,
        quantity: qty,
      });
      resetForm();
      setShowForm(false);
      setSuccess("Item adicionado à lista!");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (items.length === 0) {
    return (
      <section className={cn("flex flex-col gap-5", className)}>
        {!showForm ? (
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => setShowForm(true)}
          >
            Adicionar item
          </Button>
        ) : (
          <AddItemForm
            title={title}
            category={category}
            quantity={quantity}
            isAdding={isAdding}
            onTitleChange={setTitle}
            onCategoryChange={setCategory}
            onQuantityChange={setQuantity}
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        )}

        <EmptyState
          title="A lista está vazia"
          description="Adicione itens e marque quem vai levar o quê. Clique em 'Adicionar item' para começar."
        />

        {(success || error) && (
          <Toast
            tone={error ? "error" : "success"}
            message={(error ?? success) ?? ""}
            onDismiss={() => {
              setError(null);
              setSuccess(null);
            }}
          />
        )}
      </section>
    );
  }

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <SummaryChip label="Itens" value={total} />
          <SummaryChip label="Levo eu" value={claimedCount} />
        </div>
        <div className="flex gap-1 rounded-full bg-surface-container-high p-1">
          <GroupToggle
            active={groupMode === "category"}
            onClick={() => setGroupMode("category")}
          >
            Categoria
          </GroupToggle>
          <GroupToggle
            active={groupMode === "status"}
            onClick={() => setGroupMode("status")}
          >
            Status
          </GroupToggle>
        </div>
      </div>

      {!showForm ? (
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setShowForm(true)}
        >
          Adicionar item
        </Button>
      ) : (
        <AddItemForm
          title={title}
          category={category}
          quantity={quantity}
          isAdding={isAdding}
          onTitleChange={setTitle}
          onCategoryChange={setCategory}
          onQuantityChange={setQuantity}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {grouped.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          <h3 className="font-label text-label-sm uppercase tracking-wide text-on-surface-variant">
            {group.label}
            <span className="ml-1.5 rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm">
              {group.groups.length}
            </span>
          </h3>
          <div className="flex flex-col gap-3">
            {group.groups.map((item) => {
              const isMine = item.claimedByUserId === currentUserId;
              const isPending = pendingItemId === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-lg bg-surface-container-lowest p-4 shadow-card",
                    item.claimedByUserId !== null && "opacity-80"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate font-label text-label-md font-semibold text-on-surface",
                          item.claimedByUserId !== null && "line-through"
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="font-label text-label-sm capitalize text-on-surface-variant">
                        {LIST_CATEGORY_LABEL[item.category] ?? item.category} ·{" "}
                        {item.quantity > 0 ? `x${item.quantity}` : "1"}
                      </p>
                      {item.claimedByName && (
                        <p className="mt-1 font-label text-label-sm font-medium text-secondary">
                          {isMine ? "Levo eu ✓" : `${item.claimedByName} leva`}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <button
                        type="button"
                        aria-label="Remover item"
                        disabled={isPending || isAdding}
                        onClick={() => onDelete(item.id)}
                        className={cn(
                          "font-label text-label-sm text-on-surface-variant opacity-70 transition-opacity",
                          "hover:text-error focus:text-error",
                          "disabled:opacity-40"
                        )}
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {item.claimedByUserId === null ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onClaim(item.id)}
                        className={cn(
                          "flex flex-1 items-center justify-center rounded-full px-3 py-2 font-label text-label-sm font-semibold transition-all duration-150",
                          "disabled:opacity-60",
                          "bg-secondary text-on-secondary hover:bg-secondary/90"
                        )}
                      >
                        {isPending ? "..." : "Eu levo"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onRelease(item.id)}
                        className={cn(
                          "flex flex-1 items-center justify-center rounded-full px-3 py-2 font-label text-label-sm font-semibold transition-all duration-150",
                          "disabled:opacity-60",
                          isMine
                            ? "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-low"
                            : "bg-transparent text-on-surface-variant"
                        )}
                      >
                        {isPending ? "..." : "Desmarcar"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {(success || error) && (
        <Toast
          tone={error ? "error" : "success"}
          message={(error ?? success) ?? ""}
          onDismiss={() => {
            setError(null);
            setSuccess(null);
          }}
        />
      )}
    </section>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full bg-surface-container-high px-3 py-1 font-label text-label-sm font-semibold text-on-surface-variant">
      {label}: {value}
    </span>
  );
}

function GroupToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 font-label text-label-sm font-semibold transition-all duration-150",
        active
          ? "bg-primary text-on-primary shadow-card"
          : "text-on-surface-variant hover:bg-surface-container-low"
      )}
    >
      {children}
    </button>
  );
}

interface AddItemFormProps {
  title: string;
  category: ItemCategory;
  quantity: string;
  isAdding: boolean;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: ItemCategory) => void;
  onQuantityChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function AddItemForm({
  title,
  category,
  quantity,
  isAdding,
  onTitleChange,
  onCategoryChange,
  onQuantityChange,
  onSubmit,
  onCancel,
}: AddItemFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-card"
    >
      <p className="font-label text-label-md font-semibold text-on-surface">
        Adicionar item
      </p>
      <Input
        label="Item *"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Ex.: Refrigerante, salgadinhos, decoração..."
        disabled={isAdding}
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <span className="mb-1.5 block font-label text-label-sm font-medium text-on-surface-variant">
            Categoria
          </span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as ItemCategory)}
            disabled={isAdding}
            className="h-14 w-full rounded-md border-2 border-transparent bg-surface-container-low px-4 text-body-md text-on-surface outline-none transition-all focus:border-secondary"
          >
            {LIST_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-28">
          <Input
            label="Qtde"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            disabled={isAdding}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="sm:flex-1" disabled={isAdding}>
          {isAdding ? "Adicionando..." : "Adicionar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="sm:flex-1"
          onClick={onCancel}
          disabled={isAdding}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
