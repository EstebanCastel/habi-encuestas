import { notFound } from "next/navigation";
import { readDB } from "@/lib/store";
import SurveyForm from "@/components/SurveyForm";

export const dynamic = "force-dynamic";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const ev = db.eventos.find((e) => e.id === id);
  if (!ev) notFound();
  return <SurveyForm eventId={ev.id} nombre={ev.nombre} fecha={ev.fecha} />;
}
