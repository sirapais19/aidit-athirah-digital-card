import { useEffect, useRef, useState } from "react";

const AUTO_SLIDE_MS = 4000;
const RESUME_AFTER_MS = 6000;

type MilestoneGalleryProps = {
  images: string[];
  alt: string;
  focus?: string;
  className?: string;
};

/**
 * Gambar milestone. Kalau ada lebih daripada satu gambar, ia jadi
 * carousel yang auto-slide dan boleh di-swipe (kiri/kanan).
 * Auto-slide berhenti sementara bila user sentuh/scroll, dan hanya
 * berjalan bila card nampak di skrin.
 */
const MilestoneGallery = ({ images, alt, focus, className }: MilestoneGalleryProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<number>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || images.length < 2) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2 || paused || !inView) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const index = Math.round(el.scrollLeft / el.clientWidth);
      const next = (index + 1) % images.length;
      el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(id);
  }, [images.length, paused, inView]);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        loading="lazy"
        style={{ objectPosition: focus ?? "50% 50%" }}
        className={className}
      />
    );
  }

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(images.length - 1, Math.max(0, index)));
  };

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
    setActive(index);
  };

  const pauseAutoSlide = () => setPaused(true);

  const resumeAutoSlideSoon = () => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS);
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={pauseAutoSlide}
        onPointerUp={resumeAutoSlideSoon}
        onPointerCancel={resumeAutoSlideSoon}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt={`${alt} ${index + 1}`}
            loading="lazy"
            draggable={false}
            style={{ objectPosition: focus ?? "50% 50%" }}
            className={`${className} w-full shrink-0 snap-center`}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
        {images.map((src, index) => (
          <button
            key={`dot-${src}-${index}`}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Gambar ${index + 1} daripada ${images.length}`}
            aria-current={index === active}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span
              className={`h-1.5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all duration-200 ${
                index === active ? "w-4 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MilestoneGallery;
