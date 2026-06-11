import { list, put } from "@vercel/blob";
import { EMPTY, SEED, type DB } from "./types";

const KEY = "encuestas/data.json";

export async function readDB(): Promise<DB> {
  try {
    const { blobs } = await list({ prefix: KEY });
    const b = blobs.find((x) => x.pathname === KEY);
    if (!b) return SEED; // primera vez: arranca con la clase semilla
    const r = await fetch(b.url, { cache: "no-store" });
    if (!r.ok) return EMPTY;
    return (await r.json()) as DB;
  } catch {
    return SEED;
  }
}

export async function writeDB(db: DB): Promise<void> {
  await put(KEY, JSON.stringify(db), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
