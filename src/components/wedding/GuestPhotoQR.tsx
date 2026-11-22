import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";

const photoPageUrl = () =>
  typeof window === "undefined" ? "/photos" : `${window.location.origin}/photos`;

const GuestPhotoQR = () => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const url = photoPageUrl();

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "QR_guest_photos.png";
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm leading-relaxed text-slate-600">
        Imbas QR ini untuk buka kamera guest, ambil gambar atau pilih dari galeri telefon anda.
      </p>

      <div
        ref={qrRef}
        className="mx-auto inline-block rounded-[22px] border border-[#e2d9c7] bg-white p-4 shadow-sm"
      >
        <QRCodeCanvas
          value={url}
          size={512}
          level="H"
          includeMargin={false}
          fgColor="#3f4a5f"
          bgColor="#ffffff"
          style={{ width: 172, height: 172 }}
        />
      </div>

      <div>
        <p className="font-display text-lg text-slate-700">Kongsi gambar anda</p>
        <p className="mt-1 break-all font-mono text-[10px] text-slate-500">{url}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#72809c] px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#64728e]"
        >
          <Download className="h-3.5 w-3.5" />
          Simpan QR
        </button>
        <a
          href={url}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/75 px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Buka page
        </a>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Link disalin" : "Salin link"}
      </button>

      <p className="rounded-[16px] bg-white/45 px-4 py-3 font-serif text-xs italic leading-relaxed text-slate-500">
        Tip: simpan QR ini dan letakkan di atas meja majlis supaya semua tetamu boleh berkongsi
        gambar mereka.
      </p>
    </div>
  );
};

export default GuestPhotoQR;
