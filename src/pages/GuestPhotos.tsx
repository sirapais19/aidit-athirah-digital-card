import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Check,
  Heart,
  ImagePlus,
  Loader2,
  RefreshCw,
  Share2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import GuestPhotoCamera, { type PhotoFilterId } from "@/components/wedding/GuestPhotoCamera";

const MAX_FILE_MB = 15;
const photoApiUrl = (import.meta.env.VITE_PHOTO_API_URL as string | undefined)?.replace(/\/$/, "");

type GuestPhoto = {
  id: string;
  guest_name: string | null;
  message: string | null;
  image_url: string;
  created_at: string;
};

type PendingPhoto = {
  blob: Blob;
  previewUrl: string;
};

const compressImage = async (input: Blob): Promise<Blob> => {
  let source: ImageBitmap | HTMLImageElement;
  let objectUrl = "";

  try {
    source = await createImageBitmap(input);
  } catch {
    objectUrl = URL.createObjectURL(input);
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
      image.src = objectUrl;
    });
  }

  try {
    const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    const maxDimension = 1600;
    const ratio = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * ratio));
    const height = Math.max(1, Math.round(sourceHeight * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Gambar tidak dapat diproses.");

    context.drawImage(source, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Gambar tidak dapat diproses."))),
        "image/jpeg",
        0.85,
      );
    });
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (source instanceof ImageBitmap) source.close();
  }
};

type UploadResult = { ok: boolean; status: number; body: string };

const uploadPhoto = (
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<UploadResult> =>
  new Promise((resolve, reject) => {
    if (!photoApiUrl) {
      reject(new Error("Photo API belum disambungkan."));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${photoApiUrl}/api/photos`);
    xhr.timeout = 45000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        body: xhr.responseText,
      });
    };
    xhr.onerror = () => reject(new Error("Rangkaian bermasalah. Pastikan API foto sedang berjalan."));
    xhr.ontimeout = () => reject(new Error("Upload ambil masa terlalu lama. Sila cuba lagi."));
    xhr.send(formData);
  });

const GuestPhotos = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [justUploaded, setJustUploaded] = useState(false);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePhoto, setActivePhoto] = useState<GuestPhoto | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get("to") || params.get("guest");
    if (guest) setName(guest);
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Guest Photos · Aidit & Athirah";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!photoApiUrl) {
      setGalleryLoading(false);
      setPhotos([]);
      setGalleryError("Photo sharing belum disambungkan ke Cloudflare.");
      return () => {
        active = false;
      };
    }

    setGalleryLoading(true);
    setGalleryError("");

    void fetch(`${photoApiUrl}/api/photos`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Photo API returned ${response.status}`);
        return (await response.json()) as { photos: GuestPhoto[] };
      })
      .then(({ photos: items }) => {
        if (!active) return;
        setPhotos(items);
        setGalleryError("");
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Failed to load guest photos:", error);
        setGalleryError("Galeri belum tersedia. Cuba refresh sebentar lagi.");
      })
      .finally(() => {
        if (!active) return;
        setGalleryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const photoUrl = (photo: GuestPhoto) => photo.image_url;

  const chooseFile = () => fileInputRef.current?.click();

  const replacePending = (next: PendingPhoto) => {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(next);
    setFormError("");
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Sila pilih fail gambar sahaja.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFormError(`Saiz gambar mesti kurang daripada ${MAX_FILE_MB}MB.`);
      return;
    }

    replacePending({ blob: file, previewUrl: URL.createObjectURL(file) });
  };

  const handleCameraCapture = (blob: Blob, _filter: PhotoFilterId) => {
    replacePending({ blob, previewUrl: URL.createObjectURL(blob) });
    setCameraOpen(false);
  };

  const closePending = () => {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setFormError("");
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pending) return;

    if (!photoApiUrl) {
      setFormError("Photo sharing belum disambungkan ke Cloudflare. Sila hubungi tuan rumah.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setFormError("");

    try {
      const uploadBlob = await compressImage(pending.blob);
      const formData = new FormData();
      formData.append("photo", uploadBlob, "guest-photo.jpg");
      formData.append("guest_name", name.trim() || "Tetamu");
      formData.append("message", message.trim());

      const result = await uploadPhoto(formData, setUploadProgress);
      if (!result.ok) {
        let messageFromServer = `Photo API returned ${result.status}`;
        try {
          const parsed = JSON.parse(result.body) as { error?: string } | null;
          if (parsed?.error) messageFromServer = parsed.error;
        } catch {
          // Response was not JSON; keep the fallback message.
        }
        throw new Error(messageFromServer);
      }

      URL.revokeObjectURL(pending.previewUrl);
      setPending(null);
      setName("");
      setMessage("");
      setJustUploaded(true);
      setRefreshKey((key) => key + 1);
      window.setTimeout(() => setJustUploaded(false), 6500);
    } catch (error) {
      console.error("Failed to upload guest photo:", error);
      const detail = error instanceof Error ? error.message : "";
      setFormError(detail || "Gambar gagal dihantar. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const activeLightboxUrl = activePhoto ? photoUrl(activePhoto) : "";

  return (
    <main className="min-h-[100svh] bg-[#eef0f4] text-slate-800">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.92),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(114,128,156,0.22),transparent_32%),linear-gradient(180deg,#eef0f4,#f7f3ed)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(15,23,42,0.8)_1px,transparent_1px)] [background-size:26px_26px]" />

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[460px] items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kad Jemputan
          </Link>
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-400">
            Aidit &amp; Athirah
          </p>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-[460px] px-4 pb-24 pt-5">
        <section className="relative overflow-hidden rounded-[30px] border border-white/85 bg-[#f9f7f1]/95 px-5 pb-6 pt-7 text-center shadow-[0_24px_80px_rgba(80,88,110,0.16)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#c7d0e4]/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#e6dcc8]/50 blur-2xl" />

          <div className="relative">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#72809c]/12 text-[#72809c]">
              <Camera className="h-5 w-5" />
            </span>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400">
              24 Disember 2026
            </p>
            <h1 className="mt-1.5 font-display text-[2rem] leading-tight text-slate-700">
              Share your moments
            </h1>
            <p className="mx-auto mt-2 max-w-[300px] font-serif text-[15px] italic leading-relaxed text-slate-500">
              Abadikan detik manis anda di majlis kami. Setiap gambar akan jadi memori yang kami
              simpan selamanya.
            </p>

            <div className="mt-5 grid gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setCameraOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#72809c] px-5 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#64728e]"
              >
                <Camera className="h-4 w-4" />
                Buka kamera
              </button>
              <button
                type="button"
                onClick={chooseFile}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d7dbea] bg-white/80 px-5 py-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white"
              >
                <ImagePlus className="h-4 w-4 text-[#72809c]" />
                Pilih dari galeri telefon
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </section>

        {!photoApiUrl && (
          <p className="mt-4 rounded-[18px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-center text-xs leading-relaxed text-amber-800">
            Photo sharing belum disambungkan. Tetapkan
            <span className="font-mono"> VITE_PHOTO_API_URL</span> kepada URL Cloudflare photo API.
          </p>
        )}

        <AnimatePresence>
          {justUploaded && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex items-start gap-3 rounded-[20px] border border-emerald-200 bg-emerald-50/95 px-4 py-3.5 text-left"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Terima kasih!</p>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
                  Gambar anda dah masuk galeri. Kongsikan QR ini dengan tetamu lain juga.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-400">
                Guest gallery
              </p>
              <h2 className="mt-1 font-display text-2xl text-slate-700">Galeri kenangan</h2>
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-[10px] font-medium text-slate-500 transition-colors hover:bg-white"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>

          {galleryLoading ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="aspect-[4/5] animate-pulse rounded-[18px] border border-white/70 bg-white/60"
                />
              ))}
            </div>
          ) : galleryError ? (
            <div className="mt-4 rounded-[22px] border border-white/80 bg-white/65 px-5 py-8 text-center">
              <Camera className="mx-auto h-8 w-8 text-[#72809c]/70" />
              <p className="mt-3 text-sm font-medium text-slate-600">{galleryError}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="mt-3 text-xs font-medium text-[#72809c] underline underline-offset-4"
              >
                Cuba lagi
              </button>
            </div>
          ) : photos.length === 0 ? (
            <div className="mt-4 rounded-[22px] border border-white/80 bg-white/65 px-5 py-9 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-[#72809c]/70" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                Belum ada gambar lagi.
              </p>
              <p className="mt-1 font-serif text-sm italic text-slate-500">
                Jadilah orang pertama yang kongsi memori anda!
              </p>
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#72809c] px-4 py-2.5 text-xs font-medium text-white"
              >
                <Camera className="h-3.5 w-3.5" />
                Ambil gambar pertama
              </button>
            </div>
          ) : (
            <>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                {photos.length} gambar dikongsi
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setActivePhoto(photo)}
                    className="group overflow-hidden rounded-[18px] border border-white/85 bg-white p-1.5 text-left shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <div className="overflow-hidden rounded-[13px] bg-[#e9e2d3]">
                      <img
                        src={photoUrl(photo)}
                        alt={`Gambar daripada ${photo.guest_name || "tetamu"}`}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="truncate px-1.5 pb-1 pt-2 text-xs font-semibold text-slate-600">
                      {photo.guest_name || "Tetamu"}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="mt-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/70">
            <Heart className="h-4 w-4 fill-[#c9a86a]/25 text-[#c9a86a]" />
          </div>
          <p className="mt-3 font-serif text-sm italic text-slate-500">
            With love, Aidit &amp; Athirah
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 underline underline-offset-4"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke kad jemputan
          </Link>
        </footer>
      </div>

      <AnimatePresence>
        {cameraOpen && (
          <GuestPhotoCamera onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={closePending}
          >
            <motion.div
              initial={{ y: 32, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[92svh] w-full max-w-[420px] overflow-y-auto rounded-t-[28px] border border-white/80 bg-[#f9f7f1] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]"
            >
              <button
                type="button"
                onClick={closePending}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-500"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-slate-400">
                Share a memory
              </p>
              <h2 className="mt-1 font-display text-2xl text-slate-700">Hantar gambar anda</h2>

              <form onSubmit={handleUpload} className="mt-4 space-y-3.5">
                <div className="overflow-hidden rounded-[18px] bg-black/5">
                  <img
                    src={pending.previewUrl}
                    alt="Preview gambar"
                    className="max-h-[34svh] w-full object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closePending();
                      setCameraOpen(true);
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#d7dbea] bg-white/80 px-3 py-2 text-[11px] font-medium text-slate-600"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Ambil semula
                  </button>
                  <button
                    type="button"
                    onClick={chooseFile}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#d7dbea] bg-white/80 px-3 py-2 text-[11px] font-medium text-slate-600"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Pilih lain
                  </button>
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-slate-500">
                    Nama anda
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Contoh: Pakcik Din & Keluarga"
                    className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#72809c]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-slate-500">
                    Ucapan &amp; doa (pilihan)
                  </span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={3}
                    placeholder="Tahniah pengantin baru..."
                    className="w-full resize-none rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#72809c]"
                  />
                </label>

                {formError && (
                  <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-center text-xs text-rose-700">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#72809c] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#64728e] disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploadProgress !== null && uploadProgress < 100
                        ? `Menghantar... ${uploadProgress}%`
                        : "Memproses gambar..."}
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Hantar ke galeri
                    </>
                  )}
                </button>

                <p className="text-center font-serif text-[11px] italic leading-relaxed text-slate-400">
                  Gambar akan muncul dalam galeri serta-merta.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setActivePhoto(null)}
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
              aria-label="Tutup gambar"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[420px]"
            >
              <img
                src={activeLightboxUrl}
                alt={`Gambar daripada ${activePhoto.guest_name || "tetamu"}`}
                className="max-h-[68svh] w-full rounded-[20px] bg-black object-contain"
              />
              <div className="mt-3 text-center text-white">
                <p className="font-display text-lg">{activePhoto.guest_name || "Tetamu"}</p>
                {activePhoto.message && (
                  <p className="mx-auto mt-1 max-w-[320px] font-serif text-sm italic leading-relaxed text-white/75">
                    “{activePhoto.message}”
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default GuestPhotos;
