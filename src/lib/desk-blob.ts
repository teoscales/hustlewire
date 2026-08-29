import { get, put } from "@vercel/blob";

const PATH = "hustlewire-desk.json";

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export type BlobDeskRead =
  | { status: "ok"; body: string }
  | { status: "missing" }
  | { status: "error"; message: string };

export async function blobGetDesk(): Promise<BlobDeskRead> {
  if (!blobConfigured()) return { status: "missing" };
  try {
    const result = await get(PATH, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return { status: "missing" };
    return { status: "ok", body: await new Response(result.stream).text() };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Desk storage is unavailable",
    };
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
