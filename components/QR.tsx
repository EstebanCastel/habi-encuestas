"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QR({ url, label }: { url: string; label: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 600, margin: 2, color: { dark: "#2D1259", light: "#FFFFFF" }, errorCorrectionLevel: "M" })
      .then(setDataUrl).catch(() => {});
  }, [url]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `qr-${label}.png`; a.click();
  };

  if (!dataUrl) return <div className="h-40 w-40 animate-pulse rounded-xl bg-[var(--stone)]" />;
  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="QR" className="h-40 w-40 rounded-xl border border-[var(--stone)]" />
      <button onClick={download} className="text-xs font-medium text-[var(--violeta)] hover:underline">Descargar QR ↓</button>
    </div>
  );
}
