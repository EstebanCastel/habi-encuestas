export type EventoTipo = "clase" | "evento";
export type PreguntaTipo = "escala" | "nps" | "si_no" | "opcion" | "multi" | "texto";

export type Condicion = { preguntaId: string; op: "eq" | "neq" | "lte" | "gte"; valor: string };

export type Pregunta = {
  id: string;
  tipo: PreguntaTipo;
  titulo: string;
  ayuda?: string;
  opciones?: string[];   // para opcion / multi
  min?: number;          // para escala (default 1)
  max?: number;          // para escala (default 5)
  condicion?: Condicion; // mostrar solo si se cumple
};

export type Evento = {
  id: string;
  nombre: string;
  fecha: string;
  tipo: EventoTipo;
  preguntas: Pregunta[];
  createdAt: string;
};

export type Respuesta = {
  id: string;
  eventId: string;
  answers: Record<string, number | string | string[]>;
  createdAt: string;
};

export type DB = { eventos: Evento[]; respuestas: Respuesta[] };

const pid = () => Math.random().toString(36).slice(2, 9);

// Plantilla por defecto de una clase (replica el flujo original).
export function defaultPreguntas(): Pregunta[] {
  const q1 = pid();
  return [
    { id: q1, tipo: "escala", titulo: "¿Cómo evalúas la calidad de la clase de hoy?", ayuda: "Escala de 1 a 5.", min: 1, max: 5 },
    { id: pid(), tipo: "texto", titulo: "¿Cómo podríamos hacer mejor este programa?", ayuda: "Tus comentarios nos ayudan a mejorar.", condicion: { preguntaId: q1, op: "neq", valor: "5" } },
    { id: pid(), tipo: "texto", titulo: "¡Nos encanta que te guste tanto como a nosotros! ¿Tienes algún comentario adicional o recomendación?", condicion: { preguntaId: q1, op: "eq", valor: "5" } },
  ];
}

// Pool de preguntas predeterminadas que el admin puede agregar con un clic.
export type Plantilla = { etiqueta: string; build: () => Pregunta };
export const POOL: Plantilla[] = [
  { etiqueta: "Escala 1–5 · Calidad", build: () => ({ id: pid(), tipo: "escala", titulo: "¿Cómo evalúas la calidad de la clase de hoy?", ayuda: "Escala de 1 a 5.", min: 1, max: 5 }) },
  { etiqueta: "Escala 1–5 · Personalizable", build: () => ({ id: pid(), tipo: "escala", titulo: "Califica este aspecto", min: 1, max: 5 }) },
  { etiqueta: "NPS 0–10 · Recomendación", build: () => ({ id: pid(), tipo: "nps", titulo: "¿Qué tan probable es que recomiendes esta clase a un colega?", ayuda: "0 = nada probable, 10 = muy probable.", min: 0, max: 10 }) },
  { etiqueta: "Sí / No", build: () => ({ id: pid(), tipo: "si_no", titulo: "¿Aplicarás lo aprendido hoy?" }) },
  { etiqueta: "Opción única", build: () => ({ id: pid(), tipo: "opcion", titulo: "¿Qué fue lo más valioso de la clase?", opciones: ["El contenido", "Los ejemplos", "El instructor", "Las herramientas"] }) },
  { etiqueta: "Opción múltiple", build: () => ({ id: pid(), tipo: "multi", titulo: "¿Qué temas te gustaría ver a futuro?", opciones: ["IA para contenido", "Captación de clientes", "Cierre de ventas", "Marca personal"] }) },
  { etiqueta: "Texto abierto", build: () => ({ id: pid(), tipo: "texto", titulo: "Comentarios y sugerencias" }) },
];

export const EMPTY: DB = { eventos: [], respuestas: [] };

export function seedEventos(): Evento[] {
  return [{ id: "clase-ia-brokers", nombre: "Clase: IA para Brokers Inmobiliarios", fecha: "2026-06-11", tipo: "clase", preguntas: defaultPreguntas(), createdAt: "2026-06-11T12:00:00.000Z" }];
}
