import { NextResponse } from "next/server";
import { readEventos, writeEventos, deleteEventoResponses } from "@/lib/store";
import type { Evento } from "@/lib/types";
export const dynamic = "force-dynamic";

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function POST(req: Request) {
  const { nombre, fecha, tipo } = await req.json();
  if (!nombre || !fecha) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  const eventos = await readEventos();
  const id = slug(nombre) + "-" + Math.random().toString(36).slice(2, 6);
  const ev: Evento = { id, nombre, fecha, tipo: tipo === "evento" ? "evento" : "clase", createdAt: new Date().toISOString() };
  await writeEventos([ev, ...eventos]);
  return NextResponse.json(ev);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const eventos = await readEventos();
  await writeEventos(eventos.filter((e) => e.id !== id));
  await deleteEventoResponses(id);
  return NextResponse.json({ ok: true });
}
