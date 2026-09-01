"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "@dafesta/ui/login-screen";
import { Button } from "@dafesta/ui/button";
import { useAuth, signInWithGoogleWeb, signOut } from "@dafesta/database";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
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
        imageUrl="/dafesta-home-image.png"
        onLogin={signInWithGoogleWeb}
        onLogout={async () => {
          await signOut();
          router.replace("/");
        }}
      />
      {!loading && !isAuthenticated && (
        <div className="mt-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            Ver dashboard (demo)
          </Button>
        </div>
      )}
    </div>
  );
}
