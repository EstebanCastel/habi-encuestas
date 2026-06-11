"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import EventoPanel from "@/components/EventoPanel";
import type { DB } from "@/lib/types";

const PASS = "habi2026";

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [db, setDb] = useState<DB | null>(null);
  const [origin, setOrigin] = useState("");
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("clase");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    if (localStorage.getItem("habi-admin-ok") === "1") setAuthed(true);
    setFecha(new Date().toISOString().slice(0, 10));
  }, []);

  const load = () => fetch("/api/data").then((r) => r.json()).then(setDb);
  useEffect(() => { if (authed) load(); }, [authed]);

  const tryAuth = () => { if (pass === PASS) { localStorage.setItem("habi-admin-ok", "1"); setAuthed(true); } else alert("Clave incorrecta"); };

  const crear = async () => {
    if (!nombre || !fecha) return;
    const r = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre, fecha, tipo }) });
    const ev = await r.json();
    setNombre(""); await load(); setOpenId(ev.id);
  };

  const borrar = async (id: string) => {
    if (!confirm("¿Eliminar este evento y todas sus respuestas? Esta acción no se puede deshacer.")) return;
    await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setOpenId(null); await load();
  };

  const link = (id: string) => `${origin}/e/${id}`;

  if (!authed) {
    return (
      <div className="grad-purple grid min-h-[100svh] place-items-center px-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <Image src="/brand/simbolo-color.svg" alt="Habi" width={44} height={44} className="mx-auto mb-4 h-11 w-11" />
          <h1 className="text-xl font-bold">Gestión de encuestas</h1>
          <p className="mt-1 text-sm text-[var(--slate)]">Ingresa la clave para administrar eventos.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryAuth()}
            placeholder="Clave" className="mt-5 w-full rounded-xl border border-[var(--stone)] px-4 py-3 text-center outline-none focus:border-[var(--violeta)]" />
          <button onClick={tryAuth} className="mt-3 w-full rounded-full py-3 font-semibold text-white" style={{ background: "var(--violeta)" }}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh]">
      <header className="grad-purple text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <Image src="/brand/simbolo-color.svg" alt="Habi" width={34} height={34} className="h-8 w-8" />
            <div><h1 className="text-lg font-bold leading-tight">Gestión de encuestas</h1><p className="label text-white/60">Eventos · Encuestas personalizables · QR · Resultados</p></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        <div className="mb-8 rounded-2xl border border-[var(--stone)] bg-white p-5">
          <h2 className="mb-4 font-bold">Crear evento</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_160px_140px_auto]">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre (ej. Clase: IA para Brokers)" className="rounded-xl border border-[var(--stone)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violeta)]" />
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="rounded-xl border border-[var(--stone)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violeta)]" />
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-xl border border-[var(--stone)] px-4 py-2.5 text-sm outline-none"><option value="clase">Clase</option><option value="evento">Evento</option></select>
            <button onClick={crear} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--violeta)" }}>+ Crear</button>
          </div>
          <p className="mt-2 text-xs text-[var(--slate)]">Cada evento nace con la encuesta estándar de clase. Luego puedes personalizar sus preguntas.</p>
        </div>

        {!db ? <p className="text-[var(--slate)]">Cargando…</p> : db.eventos.length === 0 ? (
          <p className="text-[var(--slate)]">Aún no hay eventos. Crea el primero arriba.</p>
        ) : (
          <div className="space-y-4">
            {db.eventos.map((ev) => {
              const resp = db.respuestas.filter((r) => r.eventId === ev.id);
              const open = openId === ev.id;
              return (
                <div key={ev.id} className="overflow-hidden rounded-2xl border border-[var(--stone)] bg-white">
                  <div className="flex items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="label text-[var(--violeta)]">{ev.tipo} · {ev.fecha} · {ev.preguntas.length} preguntas</p>
                      <h3 className="truncate text-lg font-bold">{ev.nombre}</h3>
                      <p className="mt-1 text-sm text-[var(--slate)]">{resp.length} respuesta{resp.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => borrar(ev.id)} className="rounded-full border border-[var(--stone)] px-3 py-2 text-xs font-medium text-[var(--coral)] hover:bg-[#fdecec]" title="Eliminar evento">🗑</button>
                      <button onClick={() => setOpenId(open ? null : ev.id)} className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: "var(--violeta)" }}>{open ? "Cerrar" : "Abrir"}</button>
                    </div>
                  </div>
                  {open && <EventoPanel ev={ev} resp={resp} link={link(ev.id)} onSaved={load} onDelete={() => borrar(ev.id)} />}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
