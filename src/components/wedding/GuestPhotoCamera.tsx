import { useEffect, useRef, useState } from "react";
import { Camera, Check, FlipHorizontal, Loader2, RefreshCw, X } from "lucide-react";

export type PhotoFilterId = "original" | "warm" | "bw";

const filters: Array<{ id: PhotoFilterId; name: string; css: string }> = [
  { id: "original", name: "Original", css: "none" },
  { id: "warm", name: "Warm film", css: "sepia(28%) saturate(125%) contrast(108%) brightness(1.03)" },
  { id: "bw", name: "Black & white", css: "grayscale(100%) contrast(122%)" },
];

const GuestPhotoCamera = ({
  onCapture,
  onClose,
}: {
  onCapture: (blob: Blob, filter: PhotoFilterId) => void;
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [filter, setFilter] = useState<PhotoFilterId>("warm");
  const [captured, setCaptured] = useState<{ blob: Blob; url: string } | null>(null);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startCamera = async (mode: "environment" | "user") => {
    stopCamera();
    setStarting(true);
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => undefined);
      }
    } catch (cameraError) {
      console.warn("Guest camera unavailable:", cameraError);
      setError(
        "Kamera tidak dapat dibuka pada peranti ini. Anda boleh terus ambil gambar menggunakan kamera telefon atau pilih dari galeri.",
      );
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    void startCamera(facingMode);

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const activeFilter = filters.find((item) => item.id === filter) ?? filters[0];

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const targetRatio = video.clientWidth && video.clientHeight ? video.clientWidth / video.clientHeight : width / height;

    // Crop the sensor frame to the same aspect ratio the guest sees in the viewfinder.
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = width;
    let sourceHeight = height;
    if (width / height > targetRatio) {
      sourceWidth = height * targetRatio;
      sourceX = (width - sourceWidth) / 2;
    } else {
      sourceHeight = width / targetRatio;
      sourceY = (height - sourceHeight) / 2;
    }

    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);

    const context = canvas.getContext("2d");
    if (!context) return;

    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);

    context.save();
    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    if (activeFilter.css !== "none") context.filter = activeFilter.css;
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    context.restore();

    // Small analog date stamp, just like a disposable camera.
    const now = new Date();
    const stamp = `'${String(now.getFullYear()).slice(-2)} ${String(now.getMonth() + 1).padStart(2, "0")} ${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    context.save();
    context.font = `bold ${Math.max(14, Math.round(canvas.width * 0.028))}px "Courier New", monospace`;
    context.textAlign = "right";
    context.fillStyle = "#ff9a4d";
    context.shadowColor = "rgba(120, 45, 0, 0.7)";
    context.shadowBlur = Math.max(2, Math.round(canvas.width * 0.005));
    context.fillText(stamp, canvas.width - canvas.width * 0.045, canvas.height - canvas.height * 0.045);
    context.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        setCaptured({ blob, url: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleRetake = () => {
    if (captured) URL.revokeObjectURL(captured.url);
    setCaptured(null);
    void startCamera(facingMode);
  };

  const handleFallbackFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onCapture(file, filter);
  };

  return (
    <div className="fixed inset-0 z-[95] flex select-none flex-col bg-[#151515] p-3 text-white sm:p-5">
      <div className="z-20 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60"
          aria-label="Tutup kamera"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-[#d9a45b]/60 bg-[#1a1a1a] px-4 py-1.5 shadow-inner">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0b35f]">
            Guest camera
          </span>
        </div>

        {!captured && !error ? (
          <button
            type="button"
            onClick={() => setFacingMode((mode) => (mode === "environment" ? "user" : "environment"))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="Tukar kamera"
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>
        ) : (
          <span className="h-10 w-10" />
        )}
      </div>

      <div className="relative my-3 flex flex-1 items-center justify-center overflow-hidden rounded-[26px] border-4 border-[#2a2a2a] bg-black shadow-2xl">
        {flash && <div className="absolute inset-0 z-40 bg-white" />}

        {captured ? (
          <img
            src={captured.url}
            alt="Preview gambar"
            className="h-full w-full object-cover"
          />
        ) : error ? (
          <div className="max-w-sm space-y-4 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[#e9b26f]">
              <Camera className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl">Kamera peranti</h3>
            <p className="text-xs leading-relaxed text-white/70">{error}</p>
            <input
              ref={fallbackInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFallbackFile}
            />
            <button
              type="button"
              onClick={() => fallbackInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c9a06a] px-5 py-3.5 text-sm font-semibold text-[#28231d]"
            >
              <Camera className="h-5 w-5" />
              Buka kamera telefon
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
              style={{ filter: activeFilter.css }}
            />
            {starting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <Loader2 className="h-7 w-7 animate-spin text-white/80" />
              </div>
            )}
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!captured && !error && (
        <div className="z-20 mb-2 overflow-x-auto">
          <div className="flex justify-center gap-2 py-1">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
                  filter === item.id
                    ? "scale-105 border-[#e9b26f] bg-[#c9a06a] text-[#241f18]"
                    : "border-white/15 bg-black/50 text-white/85 hover:bg-black/70"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="z-20 flex items-center justify-around py-3">
        {captured ? (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center gap-2 rounded-2xl bg-white/20 px-6 py-3 text-xs font-semibold text-white hover:bg-white/30"
            >
              <RefreshCw className="h-4 w-4" />
              Ambil semula
            </button>
            <button
              type="button"
              onClick={() => onCapture(captured.blob, filter)}
              className="flex items-center gap-2 rounded-2xl bg-[#c9a06a] px-8 py-3 text-sm font-bold text-[#241f18] shadow-xl active:scale-95"
            >
              <Check className="h-4 w-4" />
              Guna foto ini
            </button>
          </>
        ) : !error ? (
          <div className="flex w-full flex-col items-center gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={starting}
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#e5e7eb] bg-[#c9a06a] p-1.5 shadow-2xl transition-transform hover:brightness-110 active:scale-90 disabled:opacity-60"
              title="Ambil gambar"
            >
              <span className="h-full w-full rounded-full border-2 border-white/60 bg-[#c9a06a] shadow-inner" />
            </button>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
              {activeFilter.name}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GuestPhotoCamera;
