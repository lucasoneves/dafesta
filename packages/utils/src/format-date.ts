export function formatDate(dateString: string, locale = "pt-BR"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string, locale = "pt-BR"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(timeString: string, locale = "pt-BR"): string {
  const [hours = 0, minutes = 0] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isPastDate(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

export function daysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
