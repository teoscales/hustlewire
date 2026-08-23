import { get, put } from "@vercel/blob";

const PATH = "hustlewire-desk.json";

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function blobGetDesk() {
  if (!blobConfigured()) return null;
  try {
    const result = await get(PATH, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return await new Response(result.stream).text();
  } catch {
    return null;
  }
}

export async function blobSetDesk(body: string) {
  if (!blobConfigured()) return;
  await put(PATH, body, {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}
