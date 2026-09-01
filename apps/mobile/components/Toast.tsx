import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

export type ToastTone = "success" | "warning" | "error";

export interface ToastData {
  type: ToastTone;
  text: string;
}

interface ToastProps {
  toast: ToastData | null;
  duration?: number;
  onDismiss?: () => void;
}

const toneBackground: Record<ToastTone, string> = {
  success: "bg-green-600",
  warning: "bg-yellow-500",
  error: "bg-red-600",
};

const toneText: Record<ToastTone, string> = {
  success: "text-white",
  warning: "text-yellow-950",
  error: "text-white",
};

export function Toast({ toast, duration = 4000, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onDismiss]);

  if (!toast) return null;

  return (
    <View
      className={`absolute bottom-8 left-6 right-6 flex-row items-center rounded-full px-5 py-3 shadow-modal ${toneBackground[toast.type]}`}
      pointerEvents="box-none"
    >
      <Text
        className={`flex-1 font-label text-label-md font-semibold ${toneText[toast.type]}`}
        numberOfLines={2}
      >
        {toast.text}
      </Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8} className="ml-3 p-1">
          <Text className={`font-label text-label-md font-bold ${toneText[toast.type]}`}>
            ✕
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}