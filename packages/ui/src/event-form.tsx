"use client";

import { useState } from "react";
import type { CreateEventPayload } from "@dafesta/types";
import { Button } from "./button.tsx";
import { Input } from "./input.tsx";
import { cn } from "./cn.ts";

interface EventFormProps {
  onSubmit: (payload: CreateEventPayload) => Promise<unknown>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
}

interface FormErrors {
  title?: string;
  date?: string;
}

export function EventForm({
  onSubmit,
  submitLabel = "Criar festa",
  cancelLabel = "Cancelar",
  onCancel,
  className,
}: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!title.trim()) {
      nextErrors.title = "O nome da festa é obrigatório.";
    }
    if (!date) {
      nextErrors.date = "A data é obrigatória.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        location: location.trim() || undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("flex w-full flex-col gap-5", className)}
    >
      <Input
        label="Nome da festa *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex.: Aniversário da Ana"
        error={errors.title}
        disabled={isSubmitting}
      />

      <Input
        label="Data *"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        disabled={isSubmitting}
      />

      <Input
        label="Local (opcional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Ex.: Salão da casa da Maria"
        disabled={isSubmitting}
      />

      <Input
        label="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="O que vai rolar? Adicione os detalhes..."
        disabled={isSubmitting}
      />

      {submitError && (
        <div className="rounded-md border border-error-container bg-error-container p-3 text-left">
          <p className="break-all text-label-sm text-on-error-container">
            {submitError}
          </p>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          className="sm:flex-1"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            className="sm:flex-1"
            size="lg"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
