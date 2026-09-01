import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import type { CreateEventPayload } from "@dafesta/types";

interface EventFormProps {
  onSubmit: (payload: CreateEventPayload) => Promise<unknown>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
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
    } else if (date < todayISOString()) {
      nextErrors.date = "A data não pode estar no passado.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
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
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass =
    "h-14 w-full rounded-md border-2 bg-surface-container-low px-4 font-body text-body-md text-on-surface";

  return (
    <View className="w-full gap-5">
      <View>
        <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
          Nome da festa *
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex.: Aniversário da Ana"
          placeholderTextColor="#8c7078"
          editable={!isSubmitting}
          className={`${fieldClass} ${errors.title ? "border-error" : "border-transparent"}`}
        />
        {errors.title ? (
          <Text className="mt-1.5 font-label text-label-sm text-error">
            {errors.title}
          </Text>
        ) : null}
      </View>

      <View>
        <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
          Data *
        </Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="AAAA-MM-DD"
          placeholderTextColor="#8c7078"
          editable={!isSubmitting}
          className={`${fieldClass} ${errors.date ? "border-error" : "border-transparent"}`}
        />
        {errors.date ? (
          <Text className="mt-1.5 font-label text-label-sm text-error">
            {errors.date}
          </Text>
        ) : null}
      </View>

      <View>
        <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
          Local (opcional)
        </Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Ex.: Salão da casa da Maria"
          placeholderTextColor="#8c7078"
          editable={!isSubmitting}
          className={`${fieldClass} border-transparent`}
        />
      </View>

      <View>
        <Text className="mb-1.5 font-label text-label-sm font-medium text-on-surface-variant">
          Descrição (opcional)
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="O que vai rolar? Adicione os detalhes..."
          placeholderTextColor="#8c7078"
          editable={!isSubmitting}
          multiline
          className="min-h-24 w-full rounded-md border-2 border-transparent bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface"
        />
      </View>

      {submitError ? (
        <View className="rounded-md border border-error-container bg-error-container p-3">
          <Text className="font-label text-label-sm text-on-error-container">
            {submitError}
          </Text>
        </View>
      ) : null}

      <View className="gap-3">
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex-row items-center justify-center rounded-full bg-primary py-3.5 shadow-card active:scale-[0.98]"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-label text-label-md font-semibold text-on-primary">
              {submitLabel}
            </Text>
          )}
        </Pressable>
        {onCancel ? (
          <Pressable
            onPress={onCancel}
            disabled={isSubmitting}
            className="w-full items-center rounded-full py-3 active:bg-surface-container-high"
          >
            <Text className="font-label text-label-md font-medium text-on-surface-variant">
              {cancelLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function todayISOString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
