const allowedHosts = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "tiktok.com",
  "www.tiktok.com",
  "vm.tiktok.com",
  "instagram.com",
  "www.instagram.com",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "vimeo.com",
  "www.vimeo.com",
];

export type VideoLink = {
  url: string;
  platform: string;
  embedUrl: string | null;
};

function hostOf(hostname: string) {
  return hostname.replace(/^www\./, "");
}

export function parseVideoLink(raw: string): VideoLink | null {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!allowedHosts.includes(parsed.hostname.toLowerCase())) return null;

  const host = hostOf(parsed.hostname.toLowerCase());
  const url = parsed.toString();

  if (host === "youtu.be") {
    const id = parsed.pathname.replace("/", "").slice(0, 16);
    return id
      ? { url, platform: "YouTube", embedUrl: `https://www.youtube.com/embed/${id}` }
      : { url, platform: "YouTube", embedUrl: null };
  }

  if (host === "youtube.com") {
    const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean)[1];
    if (id && (parsed.pathname.startsWith("/watch") || parsed.pathname.startsWith("/shorts") || parsed.pathname.startsWith("/embed"))) {
      const clean = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16);
      return { url, platform: "YouTube", embedUrl: `https://www.youtube.com/embed/${clean}` };
    }
    return { url, platform: "YouTube", embedUrl: null };
  }

  if (host === "vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id)
      ? { url, platform: "Vimeo", embedUrl: `https://player.vimeo.com/video/${id}` }
      : { url, platform: "Vimeo", embedUrl: null };
  }

  if (host === "tiktok.com") return { url, platform: "TikTok", embedUrl: null };
  if (host === "instagram.com") return { url, platform: "Instagram", embedUrl: null };
  return { url, platform: "X", embedUrl: null };
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
