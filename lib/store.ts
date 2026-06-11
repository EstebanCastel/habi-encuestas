import { list, put, del, head } from "@vercel/blob";
import type { DB, Evento, Respuesta } from "./types";

const EV_PREFIX = "encuestas/evento/";
const RESP_PREFIX = "encuestas/resp/";

// ── Eventos: un blob por evento (sin JSON compartido → sin condiciones de carrera) ──
export async function putEvento(ev: Evento): Promise<void> {
  await put(`${EV_PREFIX}${ev.id}.json`, JSON.stringify(ev), {
    access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true,
  });
}

export async function getEvento(id: string): Promise<Evento | null> {
  try {
    const h = await head(`${EV_PREFIX}${id}.json`);
    if (!h) return null;
    const r = await fetch(h.url + "?_=" + Date.now(), { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as Evento;
  } catch {
    return null;
  }
}

export async function readEventos(): Promise<Evento[]> {
  try {
    const { blobs } = await list({ prefix: EV_PREFIX, limit: 1000 });
    const datas = await Promise.all(
      blobs.map((b) => fetch(b.url + "?_=" + Date.now(), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null))
    );
    const evs = datas.filter(Boolean) as Evento[];
    return evs.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch {
    return [];
  }
}

export async function deleteEvento(id: string): Promise<void> {
  try { await del(`${EV_PREFIX}${id}.json`); } catch {}
  try {
    const { blobs } = await list({ prefix: `${RESP_PREFIX}${id}/`, limit: 1000 });
    if (blobs.length) await del(blobs.map((b) => b.url));
  } catch {}
}

// ── Respuestas: un blob por respuesta ───────────────────────────────────────
export async function addRespuesta(r: Respuesta): Promise<void> {
  await put(`${RESP_PREFIX}${r.eventId}/${r.id}.json`, JSON.stringify(r), {
    access: "public", contentType: "application/json", addRandomSuffix: false,
  });
}

export async function readRespuestas(): Promise<Respuesta[]> {
  try {
    const { blobs } = await list({ prefix: RESP_PREFIX, limit: 1000 });
    const datas = await Promise.all(
      blobs.map((b) => fetch(b.url, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null))
    );
    return datas.filter(Boolean) as Respuesta[];
  } catch {
    return [];
  }
}

export async function readDB(): Promise<DB> {
  const [eventos, respuestas] = await Promise.all([readEventos(), readRespuestas()]);
  return { eventos, respuestas };
}
