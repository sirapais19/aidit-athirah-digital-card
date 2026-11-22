import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, MapPin, Plane } from "lucide-react";
import { milestones, type Milestone } from "@/data/milestones";
import WeddingLogo from "@/components/wedding/WeddingLogo";

const roadPath =
  "M 170 -20 C 10 90, 10 220, 170 300 C 330 380, 330 500, 170 580 C 10 660, 10 780, 170 860 C 330 940, 330 1060, 170 1140 C 10 1220, 10 1320, 170 1420";

const getImages = (milestone: Milestone) =>
  milestone.images && milestone.images.length > 0
    ? milestone.images
    : milestone.image
      ? [milestone.image]
      : [];

const AUTO_SLIDE_MS = 4500;

/* ------------------------------------------------------------------ */
/* Carousel asas — dipakai oleh design yang perlukan swipe/auto-slide */
/* ------------------------------------------------------------------ */
type SnapCarouselProps = {
  images: string[];
  alt: string;
  focus?: string;
  renderSlide: (src: string, index: number) => React.ReactNode;
  slideClassName?: string;
};

const SnapCarousel = ({ images, alt, renderSlide, slideClassName = "w-full" }: SnapCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || images.length < 2) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2 || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const step = el.scrollWidth / images.length;
      const current = Math.round(el.scrollLeft / step);
      el.scrollTo({ left: step * ((current + 1) % images.length), behavior: "smooth" });
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(id);
  }, [images.length, inView]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.scrollWidth / images.length;
    setActive(Math.min(images.length - 1, Math.round(el.scrollLeft / step)));
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, index) => (
          <div key={`${src}-${index}`} className={`${slideClassName} shrink-0 snap-center`}>
            {renderSlide(src, index)}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
          {images.map((src, index) => (
            <span
              key={`dot-${src}-${index}`}
              className={`h-1.5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.45)] transition-all duration-200 ${
                index === active ? "w-4 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
};

/* --------------------------------------------------------- */
/* Blok gambar mengikut design                               */
/* --------------------------------------------------------- */
const ImageBlock = ({ milestone, variant }: { milestone: Milestone; variant: number }) => {
  const images = getImages(milestone);
  const alt = `${milestone.title} moment`;
  const focus = milestone.focus;
  const position = { objectPosition: focus ?? "50% 50%" };

  if (images.length === 0) return null;

  switch (variant) {
    case 1:
      return (
        <div className="space-y-1.5">
          {images.map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt={`${alt} ${index + 1}`}
              style={position}
              className="h-auto w-full rounded-[16px] object-cover"
            />
          ))}
        </div>
      );

    case 2:
      return (
        <SnapCarousel
          images={images}
          alt={alt}
          renderSlide={(src) => (
            <img src={src} alt={alt} style={position} className="aspect-square w-full rounded-[16px] object-cover" />
          )}
        />
      );

    case 3:
      return (
        <SnapCarousel
          images={images}
          alt={alt}
          renderSlide={(src) => (
            <img src={src} alt={alt} style={position} className="aspect-[4/5] w-full rounded-[16px] object-cover" />
          )}
        />
      );

    case 4:
      return (
        <SnapCarousel
          images={images}
          alt={alt}
          renderSlide={(src) => (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-[#e9e2d3]">
              <img
                src={src}
                alt=""
                aria-hidden="true"
                style={position}
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl"
              />
              <img
                src={src}
                alt={alt}
                style={position}
                className="relative z-10 mx-auto h-full w-auto object-contain"
              />
            </div>
          )}
        />
      );

    case 5:
      return (
        <div className="space-y-3">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={`rounded-[6px] bg-white p-2 pb-5 shadow-[0_10px_22px_rgba(90,95,110,0.18)] ${
                index % 2 === 0 ? "rotate-[-1.2deg]" : "rotate-[1.2deg]"
              }`}
            >
              <img
                src={src}
                alt={`${alt} ${index + 1}`}
                style={position}
                className="h-auto w-full rounded-[2px] object-cover"
              />
              <p className="mt-2 text-center font-serif text-[13px] italic text-slate-500">
                {milestone.date.toLowerCase()} — kenangan ♡
              </p>
            </div>
          ))}
        </div>
      );

    case 6:
      return <ThumbnailGallery milestone={milestone} images={images} alt={alt} position={position} />;

    case 7:
      return (
        <SnapCarousel
          images={images}
          alt={alt}
          slideClassName="w-[86%]"
          renderSlide={(src) => (
            <img src={src} alt={alt} style={position} className="aspect-[4/5] w-full rounded-[16px] object-cover" />
          )}
        />
      );

    case 8:
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {images.slice(0, 4).map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt={`${alt} ${index + 1}`}
              style={position}
              className={`w-full rounded-[12px] object-cover ${index % 3 === 0 ? "aspect-[4/5]" : "aspect-square"}`}
            />
          ))}
        </div>
      );

    case 9:
      return (
        <SnapCarousel
          images={images}
          alt={alt}
          renderSlide={(src) => (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-[#e9e2d3]">
              <img src={src} alt={alt} style={position} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3.5 pb-3 pt-16">
                <CardText milestone={milestone} onImage />
              </div>
            </div>
          )}
        />
      );

    default:
      return (
        <div className="flex gap-1.5">
          <img
            src={images[0]}
            alt={alt}
            style={position}
            className="h-64 w-[62%] rounded-[16px] object-cover"
          />
          <div className="flex flex-1 flex-col gap-1.5">
            <img
              src={images[1] ?? images[0]}
              alt=""
              style={position}
              className="h-[calc(50%-3px)] w-full rounded-[16px] object-cover"
            />
            <img
              src={images[2] ?? images[0]}
              alt=""
              style={position}
              className="h-[calc(50%-3px)] w-full rounded-[16px] object-cover"
            />
          </div>
        </div>
      );
  }
};

/* Thumbnail strip (design 6) */
const ThumbnailGallery = ({
  milestone,
  images,
  alt,
  position,
}: {
  milestone: Milestone;
  images: string[];
  alt: string;
  position: React.CSSProperties;
}) => {
  const [active, setActive] = useState(0);
  return (
    <div>
      <img
        src={images[active] ?? images[0]}
        alt={alt}
        style={position}
        className="aspect-[4/3] w-full rounded-[16px] object-cover"
      />
      {images.length > 1 && (
        <div className="mt-1.5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, index) => (
            <button
              key={`${src}-thumb-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Gambar ${index + 1} — ${milestone.title}`}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-[8px] border-2 transition-opacity ${
                index === active ? "border-[#b0895f]" : "border-transparent opacity-65"
              }`}
            >
              <img src={src} alt="" style={position} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CardText = ({ milestone, onImage = false }: { milestone: Milestone; onImage?: boolean }) => (
  <div className={`px-1.5 pb-1.5 pt-3 ${onImage ? "" : ""}`}>
    <p
      className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] ${
        onImage ? "text-white/80" : "text-[#b0895f]"
      }`}
    >
      <MapPin className="h-3 w-3 shrink-0" />
      {milestone.date}
      <Heart className="ml-auto h-3 w-3 shrink-0 fill-[#c9a86a]/20 text-[#c9a86a]" />
    </p>
    <h3 className={`mt-1.5 font-display text-xl leading-tight ${onImage ? "text-white" : "text-slate-700"}`}>
      {milestone.title}
    </h3>
    <p
      className={`mt-1 font-serif text-[15px] italic leading-snug ${
        onImage ? "text-white/85" : "text-slate-500"
      }`}
    >
      {milestone.note}
    </p>
  </div>
);

/* --------------------------------------------------------- */
/* Timeline penuh — dirender ikut design yang dipilih        */
/* --------------------------------------------------------- */
const TimelinePreview = ({ variant }: { variant: number }) => {
  const overlaysText = variant === 9;

  return (
    <div className="relative min-h-screen bg-[#f9f7f1] pb-16 text-slate-700">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(196,173,140,0.22),transparent_30%),radial-gradient(circle_at_12%_78%,rgba(160,174,163,0.2),transparent_34%),linear-gradient(180deg,#fbf9f3,#f5f0e5)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(90,75,55,0.9)_1px,transparent_1px)] [background-size:22px_22px]" />

      <header className="relative z-10 border-b border-[#e8dfcd]/80 bg-[#faf8f2]/90 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[460px]">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#a9926f]">Our memory map</p>
          <h2 className="mt-1 font-display text-[1.7rem] leading-none text-slate-700">The Map of Us</h2>
          <p className="mt-1.5 font-serif text-xs italic leading-none text-slate-500">
            dari pertama kenal sampai hari ini
          </p>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-[460px] px-4 pt-5">
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

        <div className="relative mx-auto max-w-[310px] rounded-[24px] border border-[#e7dfcf] bg-white/78 px-5 py-4 text-center shadow-sm backdrop-blur-[2px]">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#72809c]/10 text-[#72809c]">
            <Plane className="h-4 w-4 rotate-45" />
          </span>
          <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-slate-600">
            Setiap langkah ada cerita. Scroll untuk ikut perjalanan kecil yang bawa kami sampai ke hari ini.
          </p>
        </div>

        <div className="relative mt-7 space-y-7">
          {milestones.map((milestone, index) => {
            const isLeft = index % 2 === 0;
            return (
              <article
                key={`${milestone.date}-${milestone.title}`}
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

                  <div className={variant === 8 || variant === 10 ? "" : "overflow-hidden rounded-[16px]"}>
                    <ImageBlock milestone={milestone} variant={variant} />
                  </div>

                  {!overlaysText && <CardText milestone={milestone} />}
                </div>
              </article>
            );
          })}
        </div>

        <div className="relative mt-10 text-center">
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
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------- */
/* Pilihan design                                            */
/* --------------------------------------------------------- */
const variants = [
  { id: 1, name: "Natural Height", desc: "Gambar penuh, tiada potongan. Card jadi tinggi untuk gambar portrait." },
  { id: 2, name: "Square 1:1", desc: "Potongan sederhana — seimbang antara portrait dan landscape." },
  { id: 3, name: "Portrait 4:5", desc: "Ruang menegak lebih banyak, sesuai gambar orang berdiri." },
  { id: 4, name: "Blur Backdrop", desc: "Gambar penuh di tengah, sisi diisi versi blur. Tiada orang terpotong." },
  { id: 5, name: "Polaroid", desc: "Bingkai putih + caption tangan, gaya scrapbook." },
  { id: 6, name: "Thumbnail Strip", desc: "Gambar utama 4:3 + thumbnail kecil yang boleh diklik." },
  { id: 7, name: "Peek Carousel", desc: "Slide 4:5, gambar sebelah nampak sikit — orang tahu boleh swipe." },
  { id: 8, name: "Collage 2 Kolum", desc: "4 gambar sekali papar, macam scrapbook." },
  { id: 9, name: "Full-bleed + Teks", desc: "Gambar besar, teks duduk atas gambar. Moden & dramatik." },
  { id: 10, name: "Editorial Split", desc: "Satu gambar besar + dua kecil sebelah, gaya majalah." },
];

const MilestoneDesigns = () => {
  const [params, setParams] = useSearchParams();
  const fromUrl = Number(params.get("v"));
  const active = variants.some((v) => v.id === fromUrl) ? fromUrl : 1;
  const current = variants.find((v) => v.id === active) ?? variants[0];

  const select = (id: number) => {
    const next = new URLSearchParams(params);
    next.set("v", String(id));
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") select(Math.min(10, active + 1));
      if (event.key === "ArrowLeft") select(Math.max(1, active - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="min-h-screen bg-[#e9e4d8]">
      <div className="sticky top-0 z-40 border-b border-[#dcd4c2] bg-[#f6f2e9]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[720px] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a9926f] underline"
            >
              ← invitation
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => select(Math.max(1, active - 1))}
                disabled={active === 1}
                aria-label="Design sebelum"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d0bd] bg-white/80 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="min-w-[110px] text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a9926f]">
                  {active} / 10
                </p>
                <p className="font-display text-base leading-tight text-slate-700">{current.name}</p>
              </div>
              <button
                type="button"
                onClick={() => select(Math.min(10, active + 1))}
                disabled={active === 10}
                aria-label="Design seterusnya"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d0bd] bg-white/80 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <span className="w-[62px]" aria-hidden="true" />
          </div>

          <p className="mt-2 text-center font-serif text-[13px] italic leading-snug text-slate-500">
            {current.desc}
          </p>

          <div className="mt-2 flex justify-center gap-1.5">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => select(variant.id)}
                aria-label={`Design ${variant.id} — ${variant.name}`}
                aria-current={variant.id === active}
                className={`h-7 w-7 rounded-full font-mono text-[11px] transition-colors ${
                  variant.id === active
                    ? "bg-[#72809c] text-white"
                    : "bg-white/70 text-slate-500 hover:bg-white"
                }`}
              >
                {variant.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TimelinePreview variant={active} />
    </div>
  );
};

export default MilestoneDesigns;
