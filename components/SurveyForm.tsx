"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pregunta } from "@/lib/types";

type Val = number | string | string[];

function visible(p: Pregunta, answers: Record<string, Val>): boolean {
  if (!p.condicion) return true;
  const a = answers[p.condicion.preguntaId];
  if (a == null) return false;
  const v = p.condicion.valor;
  const an = Number(a), vn = Number(v);
  switch (p.condicion.op) {
    case "eq": return String(a) === v;
    case "neq": return String(a) !== v;
    case "lte": return !isNaN(an) && an <= vn;
    case "gte": return !isNaN(an) && an >= vn;
  }
}

export default function SurveyForm({ eventId, nombre, fecha, preguntas }: { eventId: string; nombre: string; fecha: string; preguntas: Pregunta[] }) {
  const [answers, setAnswers] = useState<Record<string, Val>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  const set = (id: string, v: Val) => { setAnswers((a) => ({ ...a, [id]: v })); setErr(false); };
  const toggleMulti = (id: string, opt: string) => setAnswers((a) => {
    const cur = (a[id] as string[]) || [];
    return { ...a, [id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] };
  });

  const vis = useMemo(() => preguntas.filter((p) => visible(p, answers)), [preguntas, answers]);

  const submit = async () => {
    // requerir las preguntas visibles que no sean de texto
    const faltan = vis.some((p) => p.tipo !== "texto" && (answers[p.id] == null || (Array.isArray(answers[p.id]) && (answers[p.id] as string[]).length === 0)));
    if (faltan) { setErr(true); return; }
    setBusy(true);
    const payload: Record<string, Val> = {};
    vis.forEach((p) => { if (answers[p.id] != null) payload[p.id] = answers[p.id]; });
    await fetch("/api/responses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId, answers: payload }) });
    setBusy(false); setSent(true);
  };

  if (sent) {
    return (
      <div className="grid min-h-[100svh] place-items-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full text-3xl" style={{ background: "var(--lavanda-claro)" }}>💜</div>
          <h1 className="text-2xl font-bold">¡Gracias por tu opinión!</h1>
          <p className="mt-3 max-w-sm text-[var(--slate)]">Tu respuesta nos ayuda a mejorar cada clase. Nos vemos pronto.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-xl flex-col px-5 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/brand/simbolo-color.svg" alt="Habi" width={36} height={36} className="h-9 w-9" />
        <div>
          <p className="label text-[var(--violeta)]">Encuesta de satisfacción</p>
          <h1 className="text-lg font-bold leading-tight">{nombre}</h1>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <AnimatePresence initial={false}>
          {vis.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-[var(--stone)] bg-white p-6">
              <h2 className="text-lg font-semibold">{p.titulo}</h2>
              {p.ayuda && <p className="mt-1 text-sm text-[var(--slate)]">{p.ayuda}</p>}
              <div className="mt-5">
                {(p.tipo === "escala" || p.tipo === "nps") && (
                  <>
                    <div className="flex flex-wrap justify-between gap-2">
                      {Array.from({ length: (p.max ?? 5) - (p.min ?? 1) + 1 }, (_, k) => (p.min ?? 1) + k).map((n) => (
                        <button key={n} onClick={() => set(p.id, n)}
                          className={`flex h-12 min-w-[2.6rem] flex-1 items-center justify-center rounded-xl text-base font-bold transition-all ${answers[p.id] === n ? "scale-105 text-white shadow-lg" : "border border-[var(--stone)] bg-white text-[var(--ink)] hover:border-[var(--lavanda)]"}`}
                          style={answers[p.id] === n ? { background: "var(--violeta)" } : {}}>{n}</button>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-[var(--slate)]"><span>{p.tipo === "nps" ? "Nada probable" : "Mala"}</span><span>{p.tipo === "nps" ? "Muy probable" : "Excelente"}</span></div>
                  </>
                )}
                {p.tipo === "si_no" && (
                  <div className="flex gap-3">
                    {["Sí", "No"].map((o) => (
                      <button key={o} onClick={() => set(p.id, o)}
                        className={`flex-1 rounded-xl py-3 font-semibold transition-all ${answers[p.id] === o ? "text-white" : "border border-[var(--stone)] bg-white hover:border-[var(--lavanda)]"}`}
                        style={answers[p.id] === o ? { background: "var(--violeta)" } : {}}>{o}</button>
                    ))}
                  </div>
                )}
                {p.tipo === "opcion" && (
                  <div className="space-y-2">
                    {(p.opciones || []).map((o) => (
                      <button key={o} onClick={() => set(p.id, o)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${answers[p.id] === o ? "border-[var(--violeta)] bg-[var(--lavanda-claro)]" : "border-[var(--stone)] hover:border-[var(--lavanda)]"}`}>
                        <span className={`grid h-5 w-5 place-items-center rounded-full border ${answers[p.id] === o ? "border-[var(--violeta)]" : "border-[var(--slate)]"}`}>{answers[p.id] === o && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--violeta)" }} />}</span>
                        {o}
                      </button>
                    ))}
                  </div>
                )}
                {p.tipo === "multi" && (
                  <div className="space-y-2">
                    {(p.opciones || []).map((o) => {
                      const on = ((answers[p.id] as string[]) || []).includes(o);
                      return (
                        <button key={o} onClick={() => toggleMulti(p.id, o)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${on ? "border-[var(--violeta)] bg-[var(--lavanda-claro)]" : "border-[var(--stone)] hover:border-[var(--lavanda)]"}`}>
                          <span className={`grid h-5 w-5 place-items-center rounded-md border ${on ? "border-[var(--violeta)] bg-[var(--violeta)] text-white" : "border-[var(--slate)]"}`}>{on && "✓"}</span>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}
                {p.tipo === "texto" && (
                  <textarea value={(answers[p.id] as string) || ""} onChange={(e) => set(p.id, e.target.value)} rows={4}
                    placeholder="Escribe aquí (opcional)…" className="w-full resize-y rounded-xl border border-[var(--stone)] p-3 text-sm outline-none focus:border-[var(--violeta)]" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {err && <p className="mt-4 text-center text-sm text-[var(--coral)]">Responde las preguntas para continuar.</p>}
      <button onClick={submit} disabled={busy}
        className="mt-6 w-full rounded-full py-4 font-semibold text-white transition-opacity disabled:opacity-40" style={{ background: "var(--violeta)" }}>
        {busy ? "Enviando…" : "Enviar respuesta"}
      </button>
      <p className="mt-3 text-center text-xs text-[var(--slate)]">{fecha} · Habi</p>
    </div>
  );
}
