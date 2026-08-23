const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const shortFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function formatWireDate(iso: string) {
  return dateFmt.format(new Date(iso));
}

export function formatShortDate(iso: string) {
  return shortFmt.format(new Date(iso));
}

export function todayMasthead(now = new Date()) {
  return dateFmt.format(now).toUpperCase();
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWhen(iso: string) {
  return shortFmt.format(new Date(iso));
}

export function formatTimeLeft(iso: string, now = Date.now()) {
  const ms = Math.max(0, Date.parse(iso) - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return "less than an hour";
}

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const clock = [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
  return days > 0 ? `${days}d ${clock}` : clock;
}
