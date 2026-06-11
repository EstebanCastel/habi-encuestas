import { NextResponse } from "next/server";
import { readEventos, addRespuesta } from "@/lib/store";
import type { Respuesta } from "@/lib/types";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { eventId, rating, mejora, comentario } = await req.json();
  const r = Number(rating);
  if (!eventId || !(r >= 1 && r <= 5)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const eventos = await readEventos();
  if (!eventos.some((e) => e.id === eventId)) return NextResponse.json({ error: "Evento no existe" }, { status: 404 });
  const resp: Respuesta = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), eventId, rating: r,
    mejora: String(mejora || "").slice(0, 2000), comentario: String(comentario || "").slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  await addRespuesta(resp);
  return NextResponse.json({ ok: true });
}
