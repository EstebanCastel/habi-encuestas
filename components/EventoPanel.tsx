"use client";

import { useMemo, useState } from "react";
import QR from "@/components/QR";
import { POOL, type Evento, type Pregunta, type PreguntaTipo, type Respuesta } from "@/lib/types";

const pid = () => Math.random().toString(36).slice(2, 9);
const TIPO_LABEL: Record<PreguntaTipo, string> = { escala: "Escala", nps: "NPS 0–10", si_no: "Sí / No", opcion: "Opción única", multi: "Opción múltiple", texto: "Texto abierto" };

export default function EventoPanel({ ev, resp, link, onSaved, onDelete }: {
  ev: Evento; resp: Respuesta[]; link: string; onSaved: () => void; onDelete: () => void;
}) {
  const [tab, setTab] = useState<"compartir" | "encuesta" | "resultados">("compartir");
  return (
    <div className="border-t border-[var(--stone)] bg-[var(--cloud)]">
      <div className="flex gap-1 px-5 pt-3">
        {([["compartir", "Compartir · QR"], ["encuesta", "Editar encuesta"], ["resultados", `Resultados (${resp.length})`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === k ? "bg-white text-[var(--charcoal)]" : "text-[var(--slate)] hover:text-[var(--charcoal)]"}`}>{l}</button>
        ))}
      </div>
      <div className="bg-white p-5">
        {tab === "compartir" && <Compartir ev={ev} link={link} />}
        {tab === "encuesta" && <Editor ev={ev} onSaved={onSaved} />}
        {tab === "resultados" && <Dashboard ev={ev} resp={resp} />}
      </div>
      <div className="px-5 pb-4">
        <button onClick={onDelete} className="rounded-lg border border-[var(--stone)] px-4 py-2 text-xs font-medium text-[var(--coral)] hover:bg-[#fdecec]">🗑 Eliminar evento</button>
      </div>
    </div>
  );
}

function Compartir({ ev, link }: { ev: Evento; link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--stone)] p-4">
        <QR url={link} label={ev.id} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="label text-[var(--slate)]">Enlace de la encuesta</p>
        <code className="mt-1 block w-full break-all rounded-lg bg-[var(--cloud)] px-3 py-2 text-sm text-[var(--ink)]">{link}</code>
        <div className="mt-3 flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white" style={{ background: "var(--violeta)" }}>{copied ? "✓ Copiado" : "Copiar enlace"}</button>
          <a href={link} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--stone)] px-5 py-2 text-sm font-medium hover:bg-[var(--cloud)]">Abrir encuesta ↗</a>
        </div>
        <p className="mt-3 text-xs text-[var(--slate)]">Comparte el enlace o descarga el QR para proyectarlo en clase.</p>
      </div>
    </div>
  );
}

function Editor({ ev, onSaved }: { ev: Evento; onSaved: () => void }) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>(ev.preguntas);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const upd = (id: string, patch: Partial<Pregunta>) => setPreguntas((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const move = (i: number, dir: -1 | 1) => setPreguntas((ps) => { const a = [...ps]; const j = i + dir; if (j < 0 || j >= a.length) return ps; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const remove = (id: string) => setPreguntas((ps) => ps.filter((p) => p.id !== id));
  const addFromPool = (idx: number) => setPreguntas((ps) => [...ps, POOL[idx].build()]);

  const save = async () => {
    setSaving(true);
    await fetch("/api/events", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ev.id, preguntas }) });
    setSaving(false); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 1800); onSaved();
  };

  return (
    <div>
      <div className="space-y-3">
        {preguntas.map((p, i) => (
          <div key={p.id} className="rounded-xl border border-[var(--stone)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1">
                <button onClick={() => move(i, -1)} className="text-xs text-[var(--slate)] hover:text-[var(--violeta)]">▲</button>
                <button onClick={() => move(i, 1)} className="text-xs text-[var(--slate)] hover:text-[var(--violeta)]">▼</button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <select value={p.tipo} onChange={(e) => upd(p.id, { tipo: e.target.value as PreguntaTipo })}
                    className="rounded-lg border border-[var(--stone)] px-2 py-1 text-xs font-semibold">
                    {(Object.keys(TIPO_LABEL) as PreguntaTipo[]).map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
                  </select>
                  {(p.tipo === "escala" || p.tipo === "nps") && (
                    <span className="flex items-center gap-1 text-xs text-[var(--slate)]">de
                      <input type="number" value={p.min ?? 1} onChange={(e) => upd(p.id, { min: Number(e.target.value) })} className="w-12 rounded border border-[var(--stone)] px-1 py-0.5" /> a
                      <input type="number" value={p.max ?? 5} onChange={(e) => upd(p.id, { max: Number(e.target.value) })} className="w-12 rounded border border-[var(--stone)] px-1 py-0.5" />
                    </span>
                  )}
                  <button onClick={() => remove(p.id)} className="ml-auto text-xs text-[var(--slate)] hover:text-[var(--coral)]">✕ quitar</button>
                </div>
                <input value={p.titulo} onChange={(e) => upd(p.id, { titulo: e.target.value })} placeholder="Texto de la pregunta"
                  className="w-full rounded-lg border border-[var(--stone)] px-3 py-2 text-sm font-medium outline-none focus:border-[var(--violeta)]" />
                {(p.tipo === "opcion" || p.tipo === "multi") && (
                  <textarea value={(p.opciones || []).join("\n")} onChange={(e) => upd(p.id, { opciones: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                    rows={Math.max(2, (p.opciones || []).length)} placeholder="Una opción por línea"
                    className="mt-2 w-full resize-y rounded-lg border border-[var(--stone)] px-3 py-2 text-sm outline-none focus:border-[var(--violeta)]" />
                )}
                {/* Condición */}
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-[var(--slate)]">{p.condicion ? "Condición activa ▾" : "Mostrar solo si… (opcional) ▸"}</summary>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span>Mostrar si la respuesta a</span>
                    <select value={p.condicion?.preguntaId || ""} onChange={(e) => upd(p.id, { condicion: e.target.value ? { preguntaId: e.target.value, op: p.condicion?.op || "eq", valor: p.condicion?.valor || "5" } : undefined })}
                      className="rounded border border-[var(--stone)] px-2 py-1">
                      <option value="">— ninguna —</option>
                      {preguntas.filter((q) => q.id !== p.id).map((q, k) => <option key={q.id} value={q.id}>P{k + 1}: {q.titulo.slice(0, 24)}</option>)}
                    </select>
                    {p.condicion && (<>
                      <select value={p.condicion.op} onChange={(e) => upd(p.id, { condicion: { ...p.condicion!, op: e.target.value as "eq" | "neq" | "lte" | "gte" } })} className="rounded border border-[var(--stone)] px-2 py-1">
                        <option value="eq">es igual a</option><option value="neq">es distinta de</option><option value="lte">es ≤</option><option value="gte">es ≥</option>
                      </select>
                      <input value={p.condicion.valor} onChange={(e) => upd(p.id, { condicion: { ...p.condicion!, valor: e.target.value } })} className="w-16 rounded border border-[var(--stone)] px-2 py-1" />
                    </>)}
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pool de preguntas */}
      <div className="mt-4 rounded-xl border border-dashed border-[var(--lavanda)] bg-[var(--lavanda-claro)]/40 p-4">
        <p className="label mb-2 text-[var(--violeta)]">Agregar pregunta del pool</p>
        <div className="flex flex-wrap gap-2">
          {POOL.map((pl, i) => (
            <button key={pl.etiqueta} onClick={() => addFromPool(i)}
              className="rounded-full border border-[var(--lavanda)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--purple)] hover:bg-[var(--lavanda-claro)]">+ {pl.etiqueta}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--violeta)" }}>{saving ? "Guardando…" : "Guardar encuesta"}</button>
        {savedMsg && <span className="text-sm text-[var(--green)]">✓ Guardado</span>}
      </div>
    </div>
  );
}

function Dashboard({ ev, resp }: { ev: Evento; resp: Respuesta[] }) {
  if (resp.length === 0) return <p className="text-sm text-[var(--slate)]">Aún no hay respuestas. Comparte el QR en la clase.</p>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-[var(--stone)] px-5 py-3"><p className="text-3xl font-bold" style={{ color: "var(--violeta)" }}>{resp.length}</p><p className="text-xs text-[var(--slate)]">respuestas</p></div>
      </div>
      {ev.preguntas.map((p) => <PreguntaResultado key={p.id} p={p} resp={resp} />)}
    </div>
  );
}

function PreguntaResultado({ p, resp }: { p: Pregunta; resp: Respuesta[] }) {
  const vals = resp.map((r) => r.answers[p.id]).filter((v) => v != null);
  const stats = useMemo(() => {
    if (p.tipo === "escala" || p.tipo === "nps") {
      const nums = vals.map(Number).filter((n) => !isNaN(n));
      const min = p.min ?? 1, max = p.max ?? 5;
      const dist: Record<number, number> = {};
      for (let i = min; i <= max; i++) dist[i] = 0;
      nums.forEach((n) => { if (dist[n] != null) dist[n]++; });
      const avg = nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
      return { kind: "num" as const, dist, avg, count: nums.length, maxBar: Math.max(1, ...Object.values(dist)) };
    }
    if (p.tipo === "opcion" || p.tipo === "si_no" || p.tipo === "multi") {
      const counts: Record<string, number> = {};
      vals.forEach((v) => { (Array.isArray(v) ? v : [String(v)]).forEach((o) => { counts[o] = (counts[o] || 0) + 1; }); });
      return { kind: "cat" as const, counts, maxBar: Math.max(1, ...Object.values(counts)) };
    }
    return { kind: "text" as const, list: vals.map(String).filter((s) => s.trim()) };
  }, [p, vals]);

  return (
    <div className="rounded-xl border border-[var(--stone)] p-4">
      <p className="font-semibold">{p.titulo}</p>
      <p className="label mb-3 mt-0.5 text-[var(--slate)]">{TIPO_LABEL[p.tipo]} · {vals.length} respuestas</p>
      {stats.kind === "num" && (
        <>
          <p className="mb-2 text-sm">Promedio: <b style={{ color: "var(--violeta)" }}>{stats.avg.toFixed(2)}</b></p>
          <div className="space-y-1.5">
            {Object.entries(stats.dist).reverse().map(([n, c]) => (
              <div key={n} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-right font-medium">{n}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--stone)]"><div className="h-full rounded-full" style={{ width: `${(c / stats.maxBar) * 100}%`, background: "var(--violeta)" }} /></div>
                <span className="w-6 text-xs text-[var(--slate)]">{c}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {stats.kind === "cat" && (
        <div className="space-y-1.5">
          {Object.entries(stats.counts).sort((a, b) => b[1] - a[1]).map(([o, c]) => (
            <div key={o} className="flex items-center gap-2 text-sm">
              <span className="w-32 shrink-0 truncate">{o}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--stone)]"><div className="h-full rounded-full" style={{ width: `${(c / stats.maxBar) * 100}%`, background: "var(--lavanda)" }} /></div>
              <span className="w-6 text-xs text-[var(--slate)]">{c}</span>
            </div>
          ))}
        </div>
      )}
      {stats.kind === "text" && (
        stats.list.length === 0 ? <p className="text-sm text-[var(--slate)]">Sin comentarios.</p> :
        <div className="max-h-52 space-y-2 overflow-y-auto">
          {stats.list.map((t, i) => <div key={i} className="rounded-lg bg-[var(--cloud)] p-3 text-sm">{t}</div>)}
        </div>
      )}
    </div>
  );
}
