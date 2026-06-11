import { list, put, del } from "@vercel/blob";
import { SEED, type DB, type Evento, type Respuesta } from "./types";

const EVENTOS_KEY = "encuestas/eventos.json";
const RESP_PREFIX = "encuestas/resp/";

// ── Eventos: un solo JSON (lo edita el admin, poco frecuente) ────────────────
export async function readEventos(): Promise<Evento[]> {
  try {
    const { blobs } = await list({ prefix: EVENTOS_KEY });
    const b = blobs.find((x) => x.pathname === EVENTOS_KEY);
    if (!b) return SEED.eventos; // primera vez: clase semilla
    const r = await fetch(b.url, { cache: "no-store" });
    if (!r.ok) return SEED.eventos;
    return (await r.json()) as Evento[];
  } catch {
    return SEED.eventos;
  }
}

export async function writeEventos(eventos: Evento[]): Promise<void> {
  await put(EVENTOS_KEY, JSON.stringify(eventos), {
    access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true,
  });
}

// ── Respuestas: un blob por respuesta (append-only, sin condiciones de carrera) ──
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

export async function deleteEventoResponses(eventId: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix: `${RESP_PREFIX}${eventId}/`, limit: 1000 });
    if (blobs.length) await del(blobs.map((b) => b.url));
  } catch {}
}

export async function readDB(): Promise<DB> {
  const [eventos, respuestas] = await Promise.all([readEventos(), readRespuestas()]);
  return { eventos, respuestas };
}
