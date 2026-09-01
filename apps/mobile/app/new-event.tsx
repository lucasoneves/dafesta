import { View, Text, Pressable } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useAuth, createEvent } from "@dafesta/database";
import { EventForm } from "../components/EventForm";

export default function NewEventScreen() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-body text-body-md text-on-surface-variant">
          Carregando...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex-1 bg-background">
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

      <View className="items-center px-6 pt-8">
        <Text className="font-label text-label-sm uppercase tracking-wide text-primary">
          Nova festa
        </Text>
        <Text className="mt-2 text-center font-headline text-headline-lg font-bold text-on-surface">
          Crie seu evento
        </Text>
        <Text className="mt-2 text-center font-body text-body-md text-on-surface-variant">
          Preencha os dados abaixo para começar a organizar.
        </Text>
      </View>

      <View className="mt-8 flex-1 rounded-t-lg bg-surface-container-lowest px-6 py-6 shadow-card">
        <EventForm
          onCancel={() => router.back()}
          onSubmit={async (payload) => {
            await createEvent(payload, user);
            router.replace("/dashboard");
          }}
        />
      </View>
    </View>
  );
}
