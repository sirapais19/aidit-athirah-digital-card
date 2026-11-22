import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Heart, MapPin, Plane, X } from "lucide-react";
import { milestones } from "@/data/milestones";
import MilestoneGallery from "@/components/wedding/MilestoneGallery";
import WeddingLogo from "@/components/wedding/WeddingLogo";

const roadPath =
  "M 170 -20 C 10 90, 10 220, 170 300 C 330 380, 330 500, 170 580 C 10 660, 10 780, 170 860 C 330 940, 330 1060, 170 1140 C 10 1220, 10 1320, 170 1420";

const MemoryJourney = ({ onClose }: { onClose: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    setHasScrolled(el.scrollTop > 30);
  };

  return (
    <motion.section
      role="dialog"
      aria-modal="true"
      aria-label="Memory journey Aidit dan Athirah"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#f9f7f1] text-slate-700"
    >
      {/* Paper texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(196,173,140,0.22),transparent_30%),radial-gradient(circle_at_12%_78%,rgba(160,174,163,0.2),transparent_34%),linear-gradient(180deg,#fbf9f3,#f5f0e5)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(90,75,55,0.9)_1px,transparent_1px)] [background-size:22px_22px]" />

      <header className="relative z-20 shrink-0 border-b border-[#e8dfcd]/80 bg-[#faf8f2]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[460px] items-start justify-between gap-3 px-4 pb-3 pt-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#a9926f]">
              Our memory map
            </p>
            <h2 className="mt-1 font-display text-[1.7rem] leading-none text-slate-700">
              The Map of Us
            </h2>
            <p className="mt-1.5 font-serif text-xs italic leading-none text-slate-500">
              dari pertama kenal sampai hari ini
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e2d9c7] bg-white/70 text-slate-500 transition-colors hover:bg-white"
            aria-label="Tutup memory journey"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="h-[3px] w-full bg-[#ece4d4]">
          <div
            className="h-full rounded-r-full bg-[#72809c] transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
      >
        <div className="relative mx-auto w-full max-w-[460px] px-4 pb-24 pt-5">
          {/* Winding road */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 340 1400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={roadPath}
              fill="none"
              stroke="#eee2c9"
              strokeWidth="20"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={roadPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="6 15"
              opacity="0.95"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative mx-auto max-w-[310px] rounded-[24px] border border-[#e7dfcf] bg-white/78 px-5 py-4 text-center shadow-sm backdrop-blur-[2px]"
          >
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#72809c]/10 text-[#72809c]">
              <Plane className="h-4 w-4 rotate-45" />
            </span>
            <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-slate-600">
              Setiap langkah ada cerita. Scroll untuk ikut perjalanan kecil yang bawa kami
              sampai ke hari ini.
            </p>
          </motion.div>

          <div className="relative mt-7 space-y-7">
            {milestones.map((milestone, index) => {
              const isLeft = index % 2 === 0;
              const images =
                milestone.images && milestone.images.length > 0
                  ? milestone.images
                  : milestone.image
                    ? [milestone.image]
                    : [];
              return (
                <motion.article
                  key={`${milestone.date}-${milestone.title}`}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`relative w-[84%] ${isLeft ? "mr-auto" : "ml-auto"}`}
                >
                  <div
                    className={`relative rounded-[22px] border border-[#e3dccd] bg-white/88 p-2.5 shadow-[0_16px_40px_rgba(90,95,110,0.10)] backdrop-blur-[2px] ${
                      isLeft ? "-rotate-[1.2deg]" : "rotate-[1.2deg]"
                    }`}
                  >
                    <span
                      className={`absolute -top-2 h-4 w-12 rounded-[2px] bg-[#e8dcc4]/85 ${
                        isLeft ? "left-5 rotate-[-5deg]" : "right-5 rotate-[5deg]"
                      }`}
                      aria-hidden="true"
                    />

                    {images.length > 0 && (
                      <div className="overflow-hidden rounded-[16px] bg-[#e9e2d3]">
                        <MilestoneGallery
                          images={images}
                          alt={`${milestone.title} moment`}
                          focus={milestone.focus}
                          className="h-36 w-full object-cover sm:h-40"
                        />
                      </div>
                    )}

                    <div className="px-1.5 pb-1.5 pt-3">
                      <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#b0895f]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {milestone.date}
                        <Heart className="ml-auto h-3 w-3 shrink-0 fill-[#c9a86a]/20 text-[#c9a86a]" />
                      </p>
                      <h3 className="mt-1.5 font-display text-xl leading-tight text-slate-700">
                        {milestone.title}
                      </h3>
                      <p className="mt-1 font-serif text-[15px] italic leading-snug text-slate-500">
                        {milestone.note}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="relative mt-10 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#e2d7c3] bg-white/80 shadow-sm">
              <WeddingLogo className="h-9 w-11 text-[#c9a86a]" />
            </div>
            <p className="mt-4 font-display text-2xl text-slate-700">To be continued…</p>
            <p className="mx-auto mt-2 max-w-[280px] font-serif text-[15px] italic leading-relaxed text-slate-500">
              Cerita kita belum habis. Jumpa di 24 Disember 2026 untuk bab paling indah.
            </p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.28em] text-slate-400">
              Aidit &amp; Athirah
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#72809c] px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#64728e]"
            >
              Back to invitation
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {!hasScrolled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 rounded-full border border-[#e2d9c7] bg-white/85 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-sm"
            >
              <ArrowDown className="h-3 w-3" />
              Scroll untuk mula
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default MemoryJourney;
