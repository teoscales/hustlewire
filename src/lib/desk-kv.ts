const KEY = "hustlewire-desk";

function kvConfig() {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL
  )?.replace(/\/$/, "");
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export function kvConfigured() {
  return Boolean(kvConfig());
}

async function kvCommand(command: unknown[]) {
  const kv = kvConfig();
  if (!kv) return null;
  const res = await fetch(kv.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kv.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: unknown };
  return data.result ?? null;
}

export async function kvGetDesk() {
  try {
    const result = await kvCommand(["GET", KEY]);
    return typeof result === "string" ? result : null;
  } catch {
    return null;
  }
}

export async function kvSetDesk(body: string) {
  try {
    await kvCommand(["SET", KEY, body]);
  } catch {
    // Keep going; /tmp is the fallback on this instance.
  }
}
