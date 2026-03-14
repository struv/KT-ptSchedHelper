import { list, put } from "@vercel/blob";
import type { AppData } from "./types";

let cachedBlobUrl: string | null = null;

export async function getData(): Promise<AppData> {
  // Try cached URL first to avoid the list() API call
  if (cachedBlobUrl) {
    try {
      const response = await fetch(cachedBlobUrl, { cache: "no-store" });
      if (response.ok) return await response.json();
    } catch {
      // URL stale or invalid, fall through to list()
    }
    cachedBlobUrl = null;
  }

  const { blobs } = await list({ prefix: "data.json", limit: 1 });

  if (blobs.length === 0) {
    return { providers: [], staff: [], offices: [] };
  }

  cachedBlobUrl = blobs[0].url;
  const response = await fetch(cachedBlobUrl, { cache: "no-store" });
  return await response.json();
}

export async function saveData(data: AppData): Promise<void> {
  const blob = await put("data.json", JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  cachedBlobUrl = blob.url;
}
