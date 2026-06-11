import Image from "next/image";

export default function Home() {
  return (
    <main className="grad-purple grid min-h-[100svh] place-items-center px-6 text-center text-white">
      <div>
        <Image src="/brand/simbolo-color.svg" alt="Habi" width={56} height={56} className="mx-auto mb-6 h-14 w-14" />
        <p className="label text-white/60">Habi · Formación</p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">Encuestas de satisfacción</h1>
        <p className="mx-auto mt-4 max-w-md text-white/80">
          Si llegaste aquí desde una clase o evento, abre el enlace o escanea el QR que te compartimos para responder la encuesta.
        </p>
      </div>
    </main>
  );
}
