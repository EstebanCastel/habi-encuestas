import { NextResponse } from "next/server";
import { putEvento, getEvento, deleteEvento } from "@/lib/store";
import { defaultPreguntas, type Evento, type Pregunta } from "@/lib/types";
export const dynamic = "force-dynamic";

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function POST(req: Request) {
  const { nombre, fecha, tipo } = await req.json();
  if (!nombre || !fecha) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  const id = (slug(nombre) || "evento") + "-" + Math.random().toString(36).slice(2, 6);
  const ev: Evento = { id, nombre, fecha, tipo: tipo === "evento" ? "evento" : "clase", preguntas: defaultPreguntas(), createdAt: new Date().toISOString() };
  await putEvento(ev);
  return NextResponse.json(ev);
}

export async function PUT(req: Request) {
  const { id, nombre, fecha, preguntas } = await req.json();
  const ev = await getEvento(id);
  if (!ev) return NextResponse.json({ error: "No existe" }, { status: 404 });
  if (nombre != null) ev.nombre = nombre;
  if (fecha != null) ev.fecha = fecha;
  if (Array.isArray(preguntas)) ev.preguntas = preguntas as Pregunta[];
  await putEvento(ev);
  return NextResponse.json(ev);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await deleteEvento(id);
  return NextResponse.json({ ok: true });
}
