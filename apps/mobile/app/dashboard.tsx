import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useAuth, signOut, useUserEvents } from "@dafesta/database";
import type { UserEvent } from "@dafesta/database";
import { formatDate } from "@dafesta/utils";

export default function DashboardScreen() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { events, loading, refreshing, error, refresh } = useUserEvents(user);
  const router = useRouter();

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

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  function renderEvent({ item }: { item: UserEvent }) {
    const dateLabel = item.date
      ? formatDate(item.date)
      : "Data não definida";
    return (
      <Pressable
        className="w-full rounded-lg bg-surface-container-lowest p-5 shadow-card active:scale-[0.98]"
        onPress={() =>
          router.push({ pathname: "/event-details", params: { id: item.id } })
        }
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-headline text-headline-md font-semibold text-on-surface"
            >
              {item.title}
            </Text>
            {item.location ? (
              <Text
                numberOfLines={1}
                className="mt-1 font-body text-body-md text-on-surface-variant"
              >
                {item.location}
              </Text>
            ) : null}
          </View>
          <View className="rounded-full bg-primary-container px-3 py-1">
            <Text className="font-label text-label-sm font-medium text-on-primary-container">
              {dateLabel}
            </Text>
          </View>
        </View>
        {item.description ? (
          <Text
            numberOfLines={2}
            className="mt-3 font-body text-body-md text-on-surface-variant"
          >
            {item.description}
          </Text>
        ) : null}
      </Pressable>
    );
  }

  function renderSkeleton() {
    return (
      <View className="rounded-lg bg-surface-container-lowest p-5 shadow-card">
        <View className="h-6 w-2/3 rounded-md bg-surface-container-high" />
        <View className="mt-3 h-4 w-1/2 rounded-md bg-surface-container-high" />
        <View className="mt-4 h-4 w-full rounded-md bg-surface-container-high" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="font-headline text-headline-md font-bold text-on-surface">
          Dafesta
        </Text>
        <View className="flex-row items-center gap-3">
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} className="h-10 w-10 rounded-full" />
          ) : null}
          <View className="items-end">
            <Text className="font-label text-label-md text-on-surface">
              {user?.displayName ?? "Usuário"}
            </Text>
            {user?.email ? (
              <Text
                numberOfLines={1}
                className="font-label text-label-sm text-on-surface-variant"
              >
                {user.email}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={handleLogout}
            className="rounded-full bg-transparent px-4 py-2 active:bg-surface-container-high"
          >
            <Text className="font-label text-label-md font-medium text-on-surface-variant">
              Sair
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="px-6 pt-6">
        <Text className="font-label text-label-sm uppercase tracking-wide text-primary">
          Painel de eventos
        </Text>
        <Text className="mt-2 font-headline text-headline-lg font-bold text-on-surface">
          Seus eventos
        </Text>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-headline text-headline-md font-semibold text-on-surface">
            Não foi possível carregar seus eventos
          </Text>
          <Text className="mt-2 text-center font-body text-body-md text-on-surface-variant">
            {error}
          </Text>
        </View>
      ) : loading ? (
        <View className="gap-4 px-6 pt-6">
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 120,
            gap: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={["#af0062"]}
              tintColor="#af0062"
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-16">
              <Text className="text-center font-headline text-headline-md font-semibold text-on-surface">
                Nenhuma festa por aqui
              </Text>
              <Text className="mt-2 text-center font-body text-body-md text-on-surface-variant">
                Você ainda não criou nem participa de nenhuma festa. Que tal
                começar agora?
              </Text>
              <Pressable
                onPress={() => router.push("/new-event")}
                className="mt-6 rounded-full bg-primary px-8 py-3.5 shadow-card active:scale-[0.98]"
              >
                <Text className="font-label text-label-md font-semibold text-on-primary">
                  Criar minha primeira festa
                </Text>
              </Pressable>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => router.push("/new-event")}
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-fab active:scale-90"
      >
        <Text className="text-headline-lg font-bold text-on-primary">+</Text>
      </Pressable>
    </View>
  );
}
