export type EventoTipo = "clase" | "evento";
export type Evento = {
  id: string;
  nombre: string;
  fecha: string;      // YYYY-MM-DD
  tipo: EventoTipo;
  createdAt: string;
};
export type Respuesta = {
  id: string;
  eventId: string;
  rating: number;     // 1..5
  mejora: string;     // si no fue 5
  comentario: string; // si fue 5
  createdAt: string;
};
export type DB = { eventos: Evento[]; respuestas: Respuesta[] };

export const EMPTY: DB = { eventos: [], respuestas: [] };

// Evento de la clase ya dictada (semilla), para tener la encuesta lista.
export const SEED: DB = {
  eventos: [
    { id: "ia-brokers-jun", nombre: "Clase: IA para Brokers Inmobiliarios", fecha: "2026-06-11", tipo: "clase", createdAt: "2026-06-11T12:00:00.000Z" },
  ],
  respuestas: [],
};
