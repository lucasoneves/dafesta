import { useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";

interface LoginScreenProps {
  onLogin: () => Promise<unknown>;
  onLogout?: () => Promise<unknown>;
  isAuthenticated?: boolean;
  authLoading?: boolean;
  user?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
}

export function LoginScreen({
  onLogin,
  onLogout,
  isAuthenticated = false,
  authLoading = false,
  user = null,
}: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setIsLoading(true);
    try {
      await onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setError(null);
    setIsLoading(true);
    try {
      await onLogout?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <ActivityIndicator size="large" color="#af0062" />
        <Text className="mt-4 font-body text-body-md text-on-surface-variant">
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <View className="w-full max-w-md items-center rounded-lg bg-surface-container-lowest px-8 py-8 shadow-card">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Text className="font-headline text-headline-md font-bold text-on-primary">
            D
          </Text>
        </View>

        <Text className="font-headline text-headline-lg font-bold text-on-surface">
          Dafesta
        </Text>
        <Text className="mt-2 max-w-xs text-center font-body text-body-md text-on-surface-variant">
          Organize suas festas e compartilhe listas de forma colaborativa.
        </Text>

        <View className="mt-8 w-full">
          {isAuthenticated && user ? (
            <View className="items-center gap-4">
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} className="h-14 w-14 rounded-full" />
              ) : null}
              <View className="items-center">
                <Text className="font-label text-label-md font-semibold text-on-surface">
                  {user.displayName ?? "Usuário"}
                </Text>
                <Text className="font-label text-label-sm text-on-surface-variant">
                  {user.email}
                </Text>
              </View>
              {onLogout ? (
                <Pressable
                  onPress={handleLogout}
                  disabled={isLoading}
                  className="w-full items-center rounded-full border-2 border-secondary py-3 active:bg-secondary/10"
                >
                  <Text className="font-label text-label-md font-semibold text-secondary">
                    {isLoading ? "Saindo..." : "Sair"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-3.5 shadow-card active:scale-[0.98]"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : null}
              <Text className="font-label text-label-md font-semibold text-on-primary">
                {isLoading ? "Entrando..." : "Entrar com o Google"}
              </Text>
            </Pressable>
          )}
        </View>

        {error ? (
          <View className="mt-4 w-full rounded-md border border-error-container bg-error-container p-3">
            <Text className="font-label text-label-sm text-on-error-container">
              {error}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
