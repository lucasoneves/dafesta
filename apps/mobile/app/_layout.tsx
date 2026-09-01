import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans";
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro";
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro";
import { FirebaseProvider } from "../lib/firebase-provider";
import "../global.css";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans: PlusJakartaSans_800ExtraBold,
    PlusJakartaSans_600: PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700: PlusJakartaSans_700Bold,
    BeVietnamPro: BeVietnamPro_500Medium,
    BeVietnamPro_600: BeVietnamPro_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FirebaseProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="new-event" options={{ headerShown: false }} />
        <Stack.Screen name="event-details" options={{ headerShown: false }} />
      </Stack>
    </FirebaseProvider>
  );
}
