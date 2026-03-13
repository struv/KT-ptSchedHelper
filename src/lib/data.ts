import { list, put } from "@vercel/blob";
import type { AppData } from "./types";

export async function getData(): Promise<AppData> {
  const { blobs } = await list({ prefix: "data.json" });

  if (blobs.length === 0) {
    return { providers: [], staff: [], offices: [] };
  }

  const response = await fetch(blobs[0].url);
  return await response.json();
}

export async function saveData(data: AppData): Promise<void> {
  await put("data.json", JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}
