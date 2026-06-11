import { NextResponse } from "next/server";
import { readEventos, addRespuesta } from "@/lib/store";
import type { Respuesta } from "@/lib/types";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { eventId, answers } = await req.json();
  if (!eventId || typeof answers !== "object" || answers == null) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const eventos = await readEventos();
  if (!eventos.some((e) => e.id === eventId)) return NextResponse.json({ error: "Evento no existe" }, { status: 404 });
  const resp: Respuesta = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    eventId, answers, createdAt: new Date().toISOString(),
  };
  await addRespuesta(resp);
  return NextResponse.json({ ok: true });
}
