"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import QR from "@/components/QR";
import type { DB, Evento, Respuesta } from "@/lib/types";

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
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    if (localStorage.getItem("habi-admin-ok") === "1") setAuthed(true);
    const today = new Date().toISOString().slice(0, 10);
    setFecha(today);
  }, []);

  const load = () => fetch("/api/data").then((r) => r.json()).then(setDb);
  useEffect(() => { if (authed) load(); }, [authed]);

  const tryAuth = () => {
    if (pass === PASS) { localStorage.setItem("habi-admin-ok", "1"); setAuthed(true); }
    else alert("Clave incorrecta");
  };

  const crear = async () => {
    if (!nombre || !fecha) return;
    const r = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre, fecha, tipo }) });
    const ev = await r.json();
    setNombre("");
    await load();
    setOpenId(ev.id);
  };

  const borrar = async (id: string) => {
    if (!confirm("¿Eliminar este evento y sus respuestas?")) return;
    await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  };

  const link = (id: string) => `${origin}/e/${id}`;
  const copy = (id: string) => { navigator.clipboard.writeText(link(id)); setCopied(id); setTimeout(() => setCopied(null), 1500); };

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
            <div><h1 className="text-lg font-bold leading-tight">Gestión de encuestas</h1><p className="label text-white/60">Eventos · Links · QR · Resultados</p></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        {/* Crear evento */}
        <div className="mb-8 rounded-2xl border border-[var(--stone)] bg-white p-5">
          <h2 className="mb-4 font-bold">Crear evento</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_160px_140px_auto]">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre (ej. Clase: IA para Brokers)" className="rounded-xl border border-[var(--stone)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violeta)]" />
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="rounded-xl border border-[var(--stone)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violeta)]" />
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-xl border border-[var(--stone)] px-4 py-2.5 text-sm outline-none">
              <option value="clase">Clase</option><option value="evento">Evento</option>
            </select>
            <button onClick={crear} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--violeta)" }}>+ Crear</button>
          </div>
        </div>

        {/* Lista de eventos */}
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
                      <p className="label text-[var(--violeta)]">{ev.tipo} · {ev.fecha}</p>
                      <h3 className="truncate text-lg font-bold">{ev.nombre}</h3>
                      <p className="mt-1 text-sm text-[var(--slate)]">{resp.length} respuesta{resp.length === 1 ? "" : "s"}{resp.length ? ` · promedio ${(resp.reduce((s, r) => s + r.rating, 0) / resp.length).toFixed(2)} / 5` : ""}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => copy(ev.id)} className="rounded-full border border-[var(--stone)] px-4 py-2 text-xs font-medium hover:bg-[var(--cloud)]">{copied === ev.id ? "✓ Copiado" : "Copiar link"}</button>
                      <button onClick={() => setOpenId(open ? null : ev.id)} className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: "var(--violeta)" }}>{open ? "Cerrar" : "Ver QR y resultados"}</button>
                    </div>
                  </div>

                  {open && <EventoPanel ev={ev} resp={resp} link={link(ev.id)} onDelete={() => borrar(ev.id)} />}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function EventoPanel({ ev, resp, link, onDelete }: { ev: Evento; resp: Respuesta[]; link: string; onDelete: () => void }) {
  const stats = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    resp.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    const avg = resp.length ? resp.reduce((s, r) => s + r.rating, 0) / resp.length : 0;
    const max = Math.max(1, ...dist);
    return { dist, avg, max };
  }, [resp]);
  const comentarios = resp.filter((r) => (r.mejora || r.comentario).trim());

  return (
    <div className="grid gap-6 border-t border-[var(--stone)] bg-[var(--cloud)] p-5 md:grid-cols-[220px_1fr]">
      {/* Link + QR */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--stone)] bg-white p-4">
        <QR url={link} label={ev.id} />
        <code className="w-full truncate rounded-lg bg-[var(--cloud)] px-2 py-1.5 text-center text-[11px] text-[var(--slate)]">{link}</code>
      </div>

      {/* Dashboard */}
      <div>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-xl border border-[var(--stone)] bg-white px-5 py-3">
            <p className="text-3xl font-bold" style={{ color: "var(--violeta)" }}>{resp.length}</p>
            <p className="text-xs text-[var(--slate)]">respuestas</p>
          </div>
          <div className="rounded-xl border border-[var(--stone)] bg-white px-5 py-3">
            <p className="text-3xl font-bold" style={{ color: "var(--violeta)" }}>{stats.avg ? stats.avg.toFixed(2) : "—"}</p>
            <p className="text-xs text-[var(--slate)]">promedio / 5</p>
          </div>
        </div>

        <p className="label mb-2 text-[var(--slate)]">Distribución de calificaciones</p>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = stats.dist[n - 1];
            return (
              <div key={n} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right font-medium">{n}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--stone)]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(c / stats.max) * 100}%`, background: n >= 4 ? "var(--green)" : n === 3 ? "var(--amber)" : "var(--coral)" }} />
                </div>
                <span className="w-6 text-xs text-[var(--slate)]">{c}</span>
              </div>
            );
          })}
        </div>

        <p className="label mb-2 mt-5 text-[var(--slate)]">Comentarios ({comentarios.length})</p>
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {comentarios.length === 0 ? <p className="text-sm text-[var(--slate)]">Sin comentarios aún.</p> :
            comentarios.map((r) => (
              <div key={r.id} className="rounded-xl border border-[var(--stone)] bg-white p-3 text-sm">
                <span className="mr-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: r.rating >= 4 ? "var(--green)" : r.rating === 3 ? "var(--amber)" : "var(--coral)" }}>{r.rating}/5</span>
                {r.mejora || r.comentario}
              </div>
            ))}
        </div>

        <button onClick={onDelete} className="mt-5 text-xs text-[var(--slate)] hover:text-[var(--coral)]">Eliminar evento</button>
      </div>
    </div>
  );
}
