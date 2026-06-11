import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/store";
import type { Evento } from "@/lib/types";
export const dynamic = "force-dynamic";

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function POST(req: Request) {
  const { nombre, fecha, tipo } = await req.json();
  if (!nombre || !fecha) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  const db = await readDB();
  let id = slug(nombre) + "-" + Math.random().toString(36).slice(2, 6);
  const ev: Evento = { id, nombre, fecha, tipo: tipo === "evento" ? "evento" : "clase", createdAt: new Date().toISOString() };
  db.eventos.unshift(ev);
  await writeDB(db);
  return NextResponse.json(ev);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const db = await readDB();
  db.eventos = db.eventos.filter((e) => e.id !== id);
  db.respuestas = db.respuestas.filter((r) => r.eventId !== id);
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
