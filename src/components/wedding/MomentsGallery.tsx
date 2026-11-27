import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImageOff, Loader2, QrCode, RefreshCw, X } from "lucide-react";

const photoApiUrl = (import.meta.env.VITE_PHOTO_API_URL as string | undefined)?.replace(/\/$/, "");

type GuestPhoto = {
  id: string;
  guest_name: string | null;
  message: string | null;
  image_url: string;
  created_at: string;
};

type MomentItem = {
  id: string;
  src: string;
  guestName?: string | null;
  message?: string | null;
  isGuest?: boolean;
};

const MomentsGallery = ({ images }: { images: string[] }) => {
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([]);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(photoApiUrl));
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [active, setActive] = useState<MomentItem | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!photoApiUrl) {
      setLoading(false);
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    setError("");

    void fetch(`${photoApiUrl}/api/photos`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Photo API returned ${response.status}`);
        return (await response.json()) as { photos: GuestPhoto[] };
      })
      .then(({ photos: items }) => {
        if (requestId !== requestRef.current) return;
        setGuestPhotos(items);
        setError("");
      })
      .catch((fetchError: unknown) => {
        if (requestId !== requestRef.current) return;
        console.error("Failed to load guest photos in Moments:", fetchError);
        setError("Gambar tetamu belum dapat dimuatkan.");
      })
      .finally(() => {
        if (requestId !== requestRef.current) return;
        setLoading(false);
      });
  }, [refreshKey]);

  const visibleGuestPhotos = guestPhotos.filter((photo) => !failedIds.includes(photo.id));
  const moments: MomentItem[] = images.map((src, index) => ({
    id: `moment-${index}`,
    src,
    isGuest: false,
  }));

  const markFailed = (id: string) =>
    setFailedIds((current) => (current.includes(id) ? current : [...current, id]));

  const refresh = () => {
    setFailedIds([]);
    setRefreshKey((key) => key + 1);
  };

  const allGuestImagesFailed = guestPhotos.length > 0 && visibleGuestPhotos.length === 0;

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">
              Gambar tetamu
            </p>
            <p className="mt-0.5 font-display text-sm text-slate-700">
              {loading && visibleGuestPhotos.length === 0
                ? "Memuatkan gambar…"
                : visibleGuestPhotos.length > 0
                  ? `${visibleGuestPhotos.length} gambar dikongsi`
                  : allGuestImagesFailed
                    ? "Gambar gagal dimuatkan"
                    : "Belum ada gambar"}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/60 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition-colors hover:bg-white"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading && visibleGuestPhotos.length === 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="aspect-[4/5] animate-pulse rounded-[18px] bg-white/45"
              />
            ))}
          </div>
        ) : visibleGuestPhotos.length === 0 ? (
          <div className="mt-3 rounded-[20px] bg-white/60 px-5 py-6 text-center">
            <Camera className="mx-auto h-6 w-6 text-[#72809c]/70" />
            <p className="mt-2 text-sm font-medium text-slate-600">
              {error ||
                (allGuestImagesFailed
                  ? "Gambar tetamu belum dapat dimuatkan. Sila tekan Refresh."
                  : "Gambar yang tetamu kongsi akan muncul di sini.")}
            </p>
            <Link
              to="/photos"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#72809c] px-4 py-2 text-[11px] font-medium text-white transition-colors hover:bg-[#64728e]"
            >
              <QrCode className="h-3.5 w-3.5" />
              Scan QR &amp; kongsi gambar
            </Link>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {visibleGuestPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() =>
                  setActive({
                    id: photo.id,
                    src: photo.image_url,
                    guestName: photo.guest_name,
                    message: photo.message,
                    isGuest: true,
                  })
                }
                className="group relative overflow-hidden rounded-[18px] bg-white/60 text-left shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
              >
                <img
                  src={photo.image_url}
                  alt={`Gambar daripada ${photo.guest_name || "tetamu"}`}
                  loading="lazy"
                  onError={() => markFailed(photo.id)}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-slate-900/75 to-transparent px-2.5 pb-2 pt-6 text-[10px] font-medium text-white">
                  {photo.guest_name || "Tetamu"}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">
            Aidit &amp; Athirah
          </p>
          <span className="h-px flex-1 bg-slate-300/70" />
        </div>

        {moments.length === 0 ? (
          <div className="mt-3 rounded-[20px] bg-white/60 px-5 py-8 text-center">
            <ImageOff className="mx-auto h-7 w-7 text-[#72809c]/70" />
            <p className="mt-2 text-sm font-medium text-slate-600">Belum ada gambar lagi.</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {moments.map((moment, index) => (
              <button
                key={moment.id}
                type="button"
                onClick={() => setActive(moment)}
                className={`group relative overflow-hidden rounded-[18px] bg-white/60 text-left shadow-sm transition-transform duration-300 hover:-translate-y-0.5 ${
                  index === 0 ? "col-span-2 h-44" : "h-32"
                }`}
              >
                <img
                  src={moment.src}
                  alt={`Wedding moment ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {loading && visibleGuestPhotos.length > 0 && (
        <p className="flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Memuatkan gambar tetamu
        </p>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
              aria-label="Tutup gambar"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[380px]"
            >
              <img
                src={active.src}
                alt={active.guestName ? `Gambar daripada ${active.guestName}` : "Wedding moment"}
                className="max-h-[66svh] w-full rounded-[20px] bg-black object-contain"
              />
              <div className="mt-3 text-center text-white">
                <p className="font-display text-lg">{active.guestName || "Aidit & Athirah"}</p>
                {active.message && (
                  <p className="mx-auto mt-1 max-w-[320px] font-serif text-sm italic leading-relaxed text-white/75">
                    “{active.message}”
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MomentsGallery;
