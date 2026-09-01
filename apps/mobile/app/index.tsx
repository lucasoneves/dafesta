import { useRouter, Redirect } from "expo-router";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { LoginScreen } from "../components/LoginScreen";
import { useAuth, signInWithGoogleCredential, signOut } from "@dafesta/database";

const WEBClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;
const IOSClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!;

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "dafesta",
  path: "oauth",
});

export default function LoginHomeScreen() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [, , promptAsync] = useIdTokenAuthRequest({
    clientId: WEBClientId,
    iosClientId: IOSClientId,
    redirectUri,
  });

  if (!loading && isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  async function loginWithGoogle() {
    const result = await promptAsync({ showInRecents: true });

    if (result.type !== "success") {
      throw new Error(`Login cancelado: ${result.type}`);
    }

    const { id_token } = result.params as { id_token?: string };
    if (!id_token) {
      throw new Error("Nenhum id_token recebido do Google");
    }

    return signInWithGoogleCredential(id_token);
  }

  return (
    <LoginScreen
      authLoading={loading}
      isAuthenticated={isAuthenticated}
      user={
        user
          ? {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            }
          : null
      }
      onLogin={loginWithGoogle}
      onLogout={async () => {
        await signOut();
        router.replace("/");
      }}
    />
  );
}
