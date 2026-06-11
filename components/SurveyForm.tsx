"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SurveyForm({ eventId, nombre, fecha }: { eventId: string; nombre: string; fecha: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setBusy(true);
    const body = { eventId, rating, mejora: rating < 5 ? texto : "", comentario: rating === 5 ? texto : "" };
    await fetch("/api/responses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false); setSent(true);
  };

  if (sent) {
    return (
      <div className="grid min-h-[100svh] place-items-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full text-3xl" style={{ background: "var(--lavanda-claro)" }}>💜</div>
          <h1 className="text-2xl font-bold">¡Gracias por tu opinión!</h1>
          <p className="mt-3 max-w-sm text-[var(--slate)]">Tu respuesta nos ayuda a mejorar cada clase. Nos vemos el próximo miércoles.</p>
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

      <div className="flex-1 space-y-8">
        {/* Pregunta 1 */}
        <div className="rounded-2xl border border-[var(--stone)] bg-white p-6">
          <h2 className="text-lg font-semibold">¿Cómo evalúas la calidad de la clase de hoy?</h2>
          <p className="mt-1 text-sm text-[var(--slate)]">Escala de 1 a 5.</p>
          <div className="mt-5 flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}
                className={`flex h-14 flex-1 items-center justify-center rounded-xl text-lg font-bold transition-all ${rating === n ? "scale-105 text-white shadow-lg" : "border border-[var(--stone)] bg-white text-[var(--ink)] hover:border-[var(--lavanda)]"}`}
                style={rating === n ? { background: "var(--violeta)" } : {}}>
                {n}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-[var(--slate)]"><span>Mala</span><span>Excelente</span></div>
        </div>

        {/* Pregunta 2 condicional */}
        <AnimatePresence>
          {rating != null && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-[var(--stone)] bg-white p-6">
              {rating === 5 ? (
                <>
                  <h2 className="text-lg font-semibold">¡Nos encanta que te guste tanto como a nosotros! 💜</h2>
                  <p className="mt-1 text-sm text-[var(--slate)]">¿Tienes algún comentario adicional o recomendación?</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">¿Cómo podríamos hacer mejor este programa?</h2>
                  <p className="mt-1 text-sm text-[var(--slate)]">Tus comentarios nos ayudan a mejorar la próxima clase.</p>
                </>
              )}
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4}
                placeholder="Escribe aquí (opcional)…"
                className="mt-4 w-full resize-y rounded-xl border border-[var(--stone)] p-3 text-sm outline-none focus:border-[var(--violeta)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={submit} disabled={!rating || busy}
        className="mt-8 w-full rounded-full py-4 font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ background: "var(--violeta)" }}>
        {busy ? "Enviando…" : "Enviar respuesta"}
      </button>
      <p className="mt-3 text-center text-xs text-[var(--slate)]">{fecha} · Habi</p>
    </div>
  );
}
