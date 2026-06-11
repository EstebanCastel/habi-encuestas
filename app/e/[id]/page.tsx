import { notFound } from "next/navigation";
import { getEvento } from "@/lib/store";
import SurveyForm from "@/components/SurveyForm";
export const dynamic = "force-dynamic";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ev = await getEvento(id);
  if (!ev) notFound();
  return <SurveyForm eventId={ev.id} nombre={ev.nombre} fecha={ev.fecha} preguntas={ev.preguntas} />;
}
