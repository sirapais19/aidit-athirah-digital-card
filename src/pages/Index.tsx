import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  Images,
  MailCheck,
  MapPin,
  Navigation,
  Phone,
  Plane,
  Route,
  Send,
  Shirt,
  Users,
  X,
} from "lucide-react";
import MemoryJourney from "@/components/wedding/MemoryJourney";
import GuestPhotoQR from "@/components/wedding/GuestPhotoQR";
import MomentsGallery from "@/components/wedding/MomentsGallery";
import GiftRegistry from "@/components/wedding/GiftRegistry";
import DressCodePanel from "@/components/wedding/DressCode";
import WeddingLogo from "@/components/wedding/WeddingLogo";
import { timelineFlightCode, weddingTimelineEvents } from "@/data/weddingTimeline";
import { weddingContacts as contacts } from "@/data/weddingContacts";
import moment1 from "@/assets/moment-1.jpeg";
import moment13 from "@/assets/moment-13.jpeg";
import moment2 from "@/assets/moment-2.jpeg";
import moment3 from "@/assets/moment-3.jpeg";
import moment4 from "@/assets/moment-4.jpeg";
import moment5 from "@/assets/moment-5.jpeg";
import venueImg from "@/assets/venue-gazebo.jpg";
import dressCodeCover from "@/assets/dress-code-cover-trim.png";
import weddingSong from "@/assets/river-flows-in-you.mp3";

type InfoKey = "calendar" | "location" | "rsvp" | "gallery" | "gift" | "salamkaut" | "dresscode" | "contact" | "journey" | "photos";

const quickCards: Array<{
  id: InfoKey;
  title: string;
  caption: string;
  icon: typeof CalendarDays;
}> = [
  { id: "calendar", title: "Calendar", caption: "Save the date", icon: CalendarDays },
  { id: "location", title: "Location", caption: "Maps and Waze", icon: MapPin },
  { id: "rsvp", title: "RSVP", caption: "Confirm seats", icon: MailCheck },
  { id: "gallery", title: "Moments", caption: "Our photos", icon: Images },
  { id: "dresscode", title: "Dress Code", caption: "Warna pakaian", icon: Shirt },
  { id: "gift", title: "Gift", caption: "Group gift", icon: Gift },
  { id: "salamkaut", title: "Salam Kaut", caption: "Duit salam", icon: Heart },
  { id: "contact", title: "Contact", caption: "Ask family", icon: Phone },
  { id: "photos", title: "Photos", caption: "Scan & share", icon: Camera },
];

const gallery = [moment1, moment2, moment3, moment4, moment5];

const paymentUrl = "https://payment.tngdigital.com.my/sc/bDLob4bj0L";

const calendarDetails = "20261224T030000Z/20261224T080000Z";
const calendarText = encodeURIComponent("Aidit & Athirah Wedding Reception");
const calendarLocation = encodeURIComponent("Moara Hall, Kota Bharu, Kelantan");
const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarText}&dates=${calendarDetails}&location=${calendarLocation}`;
const mapUrl = "https://maps.app.goo.gl/pxRuAqg48ZSom6Cr9";
const wazeUrl = "https://ul.waze.com/ul?place=ChIJS5t3JtmxtjERS174U4EmYdE&ll=6.13278620%2C102.31163470&navigate=yes&utm_campaign=live_map&utm_source=waze_website&utm_medium=lm_share_location";
const weddingDateMs = new Date("2026-12-24T11:00:00+08:00").getTime();
const salamKautStorageKey = "forever-pass-salamkaut-v1";
const invitationGuideStorageKey = "forever-pass-guide-shown-v1";

const barcodeBars = Array.from({ length: 38 }, (_, index) => ({
  width: index % 4 === 0 || index % 9 === 0 ? 2 : 1,
  height: 18 + ((index * 5) % 18),
}));

const Index = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [guestName, setGuestName] = useState("Dear Guest");
  const [isOpen, setIsOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState<InfoKey | null>(null);
  const [showGuideTour, setShowGuideTour] = useState(false);
  const [shouldShowGuideAfterOpen, setShouldShowGuideAfterOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wishesRefreshKey, setWishesRefreshKey] = useState(0);

  const activeCard = useMemo(
    () => quickCards.find((card) => card.id === activeInfo && card.id !== "journey"),
    [activeInfo],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("to") || params.get("guest");
    if (name) setGuestName(decodeURIComponent(name));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = 0.45;
      audio.play().catch(() => undefined);
    }, 600);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addRsvpEntry = (entry: RsvpEntry) => {
    setSubmitted(true);

    void (async () => {
      const { error: rsvpError } = await supabase.from("rsvp_entries").insert({
        name: entry.name,
        attendance: entry.attendance,
        pax: entry.pax,
        wishes: entry.wishes || null,
      });
      if (rsvpError) console.error("Failed to save RSVP:", rsvpError.message);

      if (entry.wishes) {
        const { error: wishError } = await supabase.from("wishes").insert({
          name: entry.name,
          message: entry.wishes,
        });
        if (wishError) console.error("Failed to save wish:", wishError.message);
      }

      setWishesRefreshKey((key) => key + 1);
    })();
  };

  const playWeddingSong = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    audio.play().catch(() => undefined);
  };

  return (
    <main className="min-h-[100svh] w-full max-w-full overflow-x-hidden bg-[#eef0f4] text-slate-800">
      <audio ref={audioRef} src={weddingSong} loop preload="auto" />
      <AnimatePresence>
        {!isOpen && (
          <PassportCover
            guestName={guestName}
            onOpen={() => {
              setIsOpen(true);
              playWeddingSong();
              if (window.localStorage.getItem(invitationGuideStorageKey) !== "shown") {
                setShouldShowGuideAfterOpen(true);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative min-h-[100svh] px-3 py-4 sm:px-4 sm:py-5"
          >
            <BackgroundTexture />

            <section className="relative z-10 mx-auto max-w-[430px] pb-24 sm:pb-10">
              <header className="sticky top-3 z-20 mb-4 flex items-center justify-between rounded-[26px] border border-white/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-md">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">
                    8:36 / WA Business
                  </p>
                  <p className="mt-1 font-display text-lg text-slate-700">Wedding Pass</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#72809c] text-white shadow-sm transition-transform hover:scale-105"
                  aria-label="Return to cover"
                >
                  <Plane className="h-4 w-4" />
                </button>
              </header>

              <section className="rounded-[30px] border border-white/80 bg-[#f9f7f1]/95 p-3 shadow-[0_24px_80px_rgba(80,88,110,0.18)] sm:rounded-[34px] sm:p-4">
                <div className="grid grid-cols-[1fr_0.9fr] gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveInfo("gallery")}
                    data-tour-target="gallery"
                    className="group min-h-[168px] rounded-[20px] bg-[#74819d] p-4 text-center text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-[178px]"
                  >
                    <p className="font-serif text-sm italic text-white/80">Wedding</p>
                    <h1 className="mt-1 font-display text-[1.65rem] leading-none tracking-wide">PASSPORT</h1>
                    <div className="mx-auto my-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/50 sm:h-16 sm:w-16">
                      <WeddingLogo className="h-9 w-11 text-[#f9f7f1] sm:h-10 sm:w-12" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/85">
                      Aidit & Athirah
                    </p>
                    <p className="mt-1 font-mono text-xs text-white/80">24.12.26</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInfo("rsvp")}
                    data-tour-target="rsvp"
                    className="rounded-[20px] border border-slate-200 bg-white p-3 text-left shadow-sm transition-transform duration-300 hover:-translate-y-0.5 sm:p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-display text-xl text-[#72809c]">RSVP</p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-[#72809c]">
                        <Plane className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-400 sm:text-[9px]">
                      Loving family to celebration hall
                    </p>
                    <div className="my-4 border-t border-dashed border-slate-300" />
                    <p className="text-xs text-slate-500">Please reply before</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-slate-700">17 December 2026</p>
                    <Barcode compact />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveInfo("calendar")}
                  data-tour-target="calendar"
                  className="mt-3 min-h-20 w-full rounded-[22px] border border-[#d7dbea] bg-[#c7d0e4] px-4 py-4 text-center shadow-md transition-transform duration-300 hover:-translate-y-0.5 sm:px-5"
                >
                  <p className="font-display text-xl text-slate-700">Calendar</p>
                  <p className="mx-auto mt-1 max-w-[280px] font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">
                    Thursday, 24 December 2026 / 11:00 AM - 4:00 PM
                  </p>
                </button>

                <BoardingTicket guestName={guestName} />

                <div className="relative mt-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4">
                  <div className="absolute right-5 top-6 text-[#72809c]">
                    <Plane className="h-6 w-6 rotate-45" />
                  </div>
                  <div className="flex gap-1.5 min-[400px]:gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveInfo("journey")}
                      className="group w-[94px] shrink-0 rotate-[-7deg] rounded-md bg-white p-1 shadow-lg transition-transform duration-300 hover:rotate-[-3deg] min-[400px]:w-[108px]"
                    >
                      <img
                        src={moment13}
                        alt="Journey moment"
                        className="aspect-[3/2] w-full rounded-sm object-cover"
                      />
                      <p className="py-1 font-serif text-xs italic text-slate-500">Journey</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInfo("location")}
                      data-tour-target="venueCard"
                      className="group mt-6 w-[78px] shrink-0 rotate-[6deg] rounded-md bg-white p-1 shadow-lg transition-transform duration-300 hover:rotate-[2deg] min-[400px]:mt-7 min-[400px]:w-[88px]"
                    >
                      <img
                        src={venueImg}
                        alt="Venue preview"
                        className="h-[70px] w-full rounded-sm object-cover min-[400px]:h-[78px]"
                      />
                      <p className="py-1 font-serif text-xs italic text-slate-500">Venue</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInfo("dresscode")}
                      data-tour-target="dresscodeCard"
                      className="group mt-3 w-[78px] shrink-0 rotate-[9deg] rounded-md bg-white p-1 shadow-lg transition-transform duration-300 hover:rotate-[3deg] min-[400px]:w-[88px]"
                      aria-label="Buka dress code"
                    >
                      <img
                        src={dressCodeCover}
                        alt="Dress code"
                        className="h-[70px] w-full rounded-sm bg-white object-contain min-[400px]:h-[78px]"
                      />
                      <p className="py-1 font-serif text-xs italic text-slate-500">Dress code</p>
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3.5">
                    <div className="min-w-0">
                      <p className="font-serif text-[15px] italic leading-tight text-slate-500">
                        Our route to forever
                      </p>
                      <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-slate-400">
                        From hello to forever
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveInfo("journey")}
                      data-tour-target="journey"
                      className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d7dbea] bg-[#eef1f7] px-3.5 py-2 text-[11px] font-medium text-[#64728e] transition-colors hover:bg-[#e3e8f2]"
                      aria-label="Buka memory journey"
                    >
                      <Route className="h-3.5 w-3.5" />
                      Journey
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {quickCards
                    .filter(
                      (card) =>
                        card.id === "gift" ||
                        card.id === "salamkaut" ||
                        card.id === "contact" ||
                        card.id === "photos",
                    )
                    .map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setActiveInfo(card.id)}
                        data-tour-target={card.id}
                        className="group min-h-[100px] rounded-[20px] border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f4f6fb]"
                      >
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#72809c] text-white transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="block font-display text-lg text-slate-700">{card.title}</span>
                        <span className="mt-1 block text-xs text-slate-400">{card.caption}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 rounded-[30px] border border-white/80 bg-[#f9f7f1]/95 p-4 shadow-[0_24px_80px_rgba(80,88,110,0.13)] sm:rounded-[34px] sm:p-5">
                <CountdownStrip />
                <MalayInvitationCard />
                <Timeline />
                <button
                  type="button"
                  onClick={() => setActiveInfo("contact")}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-[22px] bg-[#72809c] px-5 py-4 text-white transition-colors hover:bg-[#66738d]"
                >
                  <Phone className="h-5 w-5" />
                  Contact Family
                </button>
                <GuestWishes
                  refreshKey={wishesRefreshKey}
                  onWriteWish={() => setActiveInfo("rsvp")}
                />
              </section>
            </section>

            <InfoPopup
              activeCard={activeCard}
              activeInfo={activeInfo}
              submitted={submitted}
              onClose={() => {
                setActiveInfo(null);
                setSubmitted(false);
              }}
              onSubmitted={addRsvpEntry}
              onNavigate={setActiveInfo}
            />
            <AnimatePresence>
              {activeInfo === "journey" && (
                <MemoryJourney key="memory-journey" onClose={() => setActiveInfo(null)} />
              )}
            </AnimatePresence>
            <MobileDock onSelect={setActiveInfo} />
            <motion.button
              type="button"
              drag
              dragMomentum={false}
              dragElastic={0.08}
              dragConstraints={{
                left: -window.innerWidth + 68,
                right: 0,
                top: -window.innerHeight + 68,
                bottom: 0,
              }}
              whileDrag={{ scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => setShowGuideTour(true)}
              className="fixed bottom-24 right-4 z-30 flex h-14 w-14 touch-none items-center justify-center rounded-full border border-white/80 bg-[#72809c] text-white shadow-[0_10px_30px_rgba(65,78,104,0.38)] sm:bottom-8 sm:right-8"
              aria-label="Buka panduan jemputan. Seret untuk alihkan butang."
              title="Panduan jemputan · seret untuk alihkan"
            >
              <Plane className="h-6 w-6" />
            </motion.button>
            {(showGuideTour || shouldShowGuideAfterOpen) && (
              <InvitationGuideTour
                onClose={() => {
                  setShowGuideTour(false);
                  setShouldShowGuideAfterOpen(false);
                  window.localStorage.setItem(invitationGuideStorageKey, "shown");
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

const guideSteps = [
  {
    target: "rsvp",
    title: "Sahkan Kehadiran (RSVP)",
    detail:
      "Tekan pas masuk ini untuk sahkan kehadiran. Isi nama, pilih Hadir atau Tidak Hadir, bilangan tetamu, kemudian tekan Hantar.",
  },
  {
    target: "venueCard",
    title: "Lokasi Majlis (Venue)",
    detail:
      "Tekan gambar Venue untuk lihat alamat penuh. Pilih Google Maps atau Waze untuk terus ke Moara Hall, Kota Bharu.",
  },
  {
    target: "dresscodeCard",
    title: "Panduan Pakaian",
    detail:
      "Tekan gambar Dress code untuk lihat panduan pakaian keluarga pengantin dan tetamu.",
  },
  {
    target: "calendar",
    title: "Simpan Tarikh",
    detail:
      "Tekan butang kalendar untuk tambah majlis ke Google Calendar — jadi anda tak terlepas tarikh 24 Disember 2026.",
  },
  {
    target: "journey",
    title: "Journey Kami",
    detail:
      "Ikuti perjalanan kami dari pertama bertemu hingga hari bahagia. Tekan butang Journey untuk buka galeri kenangan.",
  },
  {
    target: "gallery",
    title: "Galeri Foto",
    detail:
      "Tekan pasport ini untuk buka galeri foto kenangan kami. Semua gambar majlis ada di dalam.",
  },
  {
    target: "wishes",
    title: "Ucapan & Doa",
    detail:
      "Tulis ucapan dalam borang RSVP, kemudian tekan Hantar. Ucapan anda akan dipaparkan di ruangan ini.",
  },
  {
    target: "gift",
    title: "Hadiah Perkahwinan",
    detail:
      "Lihat gambar dan pautan produk. Pilih Sumbangan Ikhlas (bayar TnG/QR) atau Kirim Hadiah Sendiri (pos ke alamat melalui WhatsApp).",
  },
  {
    target: "salamkaut",
    title: "Salam Kaut",
    detail:
      "Nak beri sumbangan ikhlas? Tekan card Salam Kaut, masukkan nama dan jumlah, kemudian bayar melalui TnG atau QR.",
  },
  {
    target: "contact",
    title: "Hubungi Keluarga",
    detail:
      "Perlu bertanya sesuatu? Tekan card Contact untuk WhatsApp atau telefon Aidit dan Athirah terus.",
  },
  {
    target: "photos",
    title: "Foto Tetamu",
    detail:
      "Kongsi foto anda sepanjang majlis. Tekan card Photos, ambil gambar dan muat naik ke galeri tetamu.",
  },
] as const;

const InvitationGuideTour = ({ onClose }: { onClose: () => void }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<DOMRect | null>(null);
  const step = guideSteps[stepIndex];

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(`[data-tour-target="${step.target}"]`);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setSpotlight(target.getBoundingClientRect()), 450);
    const updatePosition = () => setSpotlight(target.getBoundingClientRect());
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [step.target]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const width = Math.min(340, window.innerWidth - 32);
  const left = spotlight
    ? Math.max(16, Math.min(window.innerWidth - width - 16, spotlight.left + spotlight.width / 2 - width / 2))
    : 16;
  const top = spotlight
    ? Math.max(16, Math.min(window.innerHeight - 250, spotlight.top > window.innerHeight * 0.58 ? spotlight.top - 230 : spotlight.bottom + 18))
    : 90;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Panduan penggunaan kad jemputan">
      <svg className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="invitation-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={Math.max(4, spotlight.left - 8)}
                y={Math.max(4, spotlight.top - 8)}
                width={spotlight.width + 16}
                height={spotlight.height + 16}
                rx="24"
                fill="black"
                style={{ transition: "all 350ms ease" }}
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(25, 34, 50, .72)" mask="url(#invitation-tour-mask)" />
        {spotlight && (
          <rect
            x={Math.max(4, spotlight.left - 8)}
            y={Math.max(4, spotlight.top - 8)}
            width={spotlight.width + 16}
            height={spotlight.height + 16}
            rx="24"
            fill="none"
            stroke="rgba(255,255,255,.95)"
            strokeWidth="2"
            style={{ transition: "all 350ms ease" }}
          />
        )}
      </svg>

      <AnimatePresence mode="wait">
        <motion.section
          key={step.target}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="fixed overflow-y-auto overscroll-contain rounded-[24px] border border-white/80 bg-[#f9f7f1] p-5 text-slate-700 shadow-[0_24px_80px_rgba(20,28,40,.35)]"
          style={{ top, left, width, maxHeight: "calc(100vh - 32px)" }}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Panduan Jemputan · {String(stepIndex + 1).padStart(2, "0")} / {String(guideSteps.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={onClose} className="rounded-full px-2 py-1 text-xs text-slate-500">Tutup</button>
          </div>
          <h2 className="mt-2 font-display text-2xl text-[#72809c]">{step.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.detail}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 disabled:opacity-40"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => stepIndex === guideSteps.length - 1 ? onClose() : setStepIndex((current) => current + 1)}
              className="rounded-full bg-[#72809c] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#64728e]"
            >
              {stepIndex === guideSteps.length - 1 ? "Selesai" : "Seterusnya"}
            </button>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

const MalayInvitationCard = () => (
  <article className="relative mt-5 overflow-hidden rounded-[24px] border border-[#e4dccb] bg-[#fffdf8] px-4 pb-5 pt-[84px] text-center shadow-sm">
    <div className="pointer-events-none absolute inset-2 rounded-[18px] border border-[#c9a86a]/35" />
    <div className="absolute left-1/2 top-0 h-12 w-14 -translate-x-1/2 bg-gradient-to-r from-[#5c6982] via-[#8b98b2] to-[#55617a] [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" />
    <div className="absolute left-1/2 top-5 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_34%_28%,#e8cd98,#c9a86a_56%,#9f7d48_100%)] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(80,55,20,0.24),0_5px_10px_rgba(90,65,30,0.25)]">
      <WeddingLogo className="h-9 w-11 text-[#5e4a2c]" />
    </div>

    <div className="relative">
      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#a8895e]">
        Perkahwinan · 24.12.2026
      </p>
      <h2 className="mt-1 font-display text-xl leading-snug text-[#5c6982]">
        JEMPUTAN PERKAHWINAN
      </h2>
      <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-[#c9a86a] to-transparent" />

      <p className="mx-auto mt-3 max-w-[330px] font-serif text-[13.5px] leading-relaxed text-slate-600">
        Assalamualaikum warahmatullahi wabarakatuh dan salam sejahtera,
      </p>
      <p className="mt-3 font-serif text-[13.5px] leading-relaxed text-slate-600">
        Dengan penuh kesyukuran ke hadrat Allah SWT, kami
      </p>

      <div className="mt-2">
        <p className="break-words font-display text-[12px] font-semibold leading-relaxed tracking-[0.06em] text-[#5c6982]">
          AZMI BIN MAT JUSOH
        </p>
        <p className="my-1 font-serif text-sm italic text-[#a8895e]">&amp;</p>
        <p className="break-words font-display text-[12px] font-semibold leading-relaxed tracking-[0.06em] text-[#5c6982]">
          FARIDAH BINTI ABDUL HAMID
        </p>
      </div>

      <p className="mt-3 font-serif text-[13.5px] leading-relaxed text-slate-600">
        dengan segala hormatnya menjemput Dato’/Datin/Tuan/Puan/Encik/Cik ke majlis
        perkahwinan anakanda kami
      </p>

      <div className="relative mt-4 overflow-hidden rounded-[16px] border border-[#c9a86a]/25 bg-[#f9f7f1]/80 px-3 py-4">
        <Heart className="pointer-events-none absolute left-2 top-2 h-3 w-3 text-[#c9a86a]/30" />
        <Heart className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 text-[#c9a86a]/30" />

        <p className="font-mono text-[6px] uppercase tracking-[0.22em] text-[#a8895e]">
          The Bride
        </p>
        <p className="mt-1 break-words font-display text-sm font-semibold leading-relaxed tracking-[0.07em] text-[#5c6982]">
          NUR ATHIRAH BINTI AZMI
        </p>

        <div className="my-2.5 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c9a86a]/50" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c9a86a]/40 bg-white/70 text-[#c9a86a] shadow-sm">
            <Heart className="h-3.5 w-3.5 fill-[#c9a86a]/30" />
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a86a]/50" />
        </div>

        <p className="font-mono text-[6px] uppercase tracking-[0.22em] text-[#a8895e]">
          The Groom
        </p>
        <p className="mt-1 break-words font-display text-sm font-semibold leading-relaxed tracking-[0.07em] text-[#5c6982]">
          MUHAMAD AIDIT HAIKAL BIN ZAINUDDIN
        </p>

        <p className="mt-2 text-center font-serif text-[10.5px] italic text-[#a8895e]">
          two hearts, one promise
        </p>
      </div>

      <div className="mt-4 space-y-2 border-y border-dashed border-[#e4dccb] py-3 text-left">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[6.5px] uppercase tracking-[0.14em] text-[#a29a8a]">Tarikh</span>
          <span className="text-right font-serif text-[13px] leading-snug text-slate-600">Khamis, 24 Disember 2026</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[6.5px] uppercase tracking-[0.14em] text-[#a29a8a]">Masa</span>
          <span className="text-right font-serif text-[13px] leading-snug text-slate-600">12.00 tengah hari</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[6.5px] uppercase tracking-[0.14em] text-[#a29a8a]">Tempat</span>
          <span className="text-right font-serif text-[13px] leading-snug text-slate-600">
            <b className="font-semibold text-slate-700">MOARA HALL</b>
            <br />
            Lot 418, Hujung Tanjung, Pulau Belanga,
            <br />
            16100 Kota Bharu, Kelantan
          </span>
        </div>
      </div>

      <p className="mt-4 font-serif text-[12.5px] italic leading-relaxed text-slate-600">
        Semoga kehadiran serta doa restu anda dapat menyerikan majlis dan menambahkan
        keberkatan buat kedua-dua mempelai. Insya-Allah.
      </p>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="h-px w-6 bg-[#e4dccb]" />
        <WeddingLogo className="h-4 w-5 text-[#c9a86a]" />
        <span className="h-px w-6 bg-[#e4dccb]" />
      </div>
    </div>
  </article>
);

const PassportCover = ({ guestName, onOpen }: { guestName: string; onOpen: () => void }) => (
  <motion.section
    className="fixed inset-0 z-50 grid min-h-[100svh] place-items-center overflow-hidden bg-[#eef0f4] px-5 py-6"
    exit={{ opacity: 0, scale: 1.04 }}
    transition={{ duration: 0.55 }}
  >
    <BackgroundTexture />
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 w-full max-w-[330px] text-center"
    >
      <div className="rounded-[30px] border border-white/80 bg-[#f9f7f1] p-4 shadow-[0_24px_90px_rgba(80,88,110,0.22)] sm:p-5">
        <div className="rounded-[24px] bg-[#72809c] px-6 py-7 text-white sm:py-8">
          <p className="rounded-t-xl bg-white/14 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/75">
            Wedding Pass
          </p>
          <p className="mt-8 font-serif text-lg italic text-white/80">Wedding</p>
          <h1 className="mt-1 font-display text-3xl tracking-wide">PASSPORT</h1>
          <div className="mx-auto my-8 flex h-28 w-28 items-center justify-center rounded-full border border-white/45">
            <WeddingLogo className="h-20 w-24 text-[#e8cd98]" />
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/85">Aidit</p>
          <p className="font-serif text-lg italic text-white/80">&</p>
          <p className="text-xs uppercase tracking-[0.24em] text-white/85">Athirah</p>
          <p className="mt-3 font-mono text-sm text-white/80">24.12.26</p>
        </div>
        <Barcode />
      </div>

      <p className="mt-6 font-serif text-lg italic text-slate-500">
        {guestName}, your flight is ready.
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-[#72809c]"
      >
        <Plane className="h-4 w-4" />
        Open
      </button>
    </motion.div>
  </motion.section>
);

const BackgroundTexture = () => (
  <>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.9),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(114,128,156,0.24),transparent_28%),linear-gradient(180deg,#eef0f4,#f7f3ed)]" />
    <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] [background-size:34px_34px]" />
  </>
);

const BoardingTicket = ({ guestName }: { guestName: string }) => (
  <div className="mt-3">
    <div className="grid grid-cols-[1fr_88px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <div className="p-3.5">
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-400 sm:text-[9px] sm:tracking-[0.2em]">
          Boarding Ticket to be married
        </p>

        <div className="mt-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div>
            <p className="font-display text-2xl leading-none text-slate-700">SGL</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-slate-400">Single</p>
          </div>
          <Plane className="h-4 w-4 rotate-45 text-[#72809c]" />
          <div className="text-right">
            <p className="font-display text-2xl leading-none text-slate-700">FRV</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-slate-400">Forever</p>
          </div>
        </div>

        <div className="my-2.5 border-t border-dashed border-slate-300" />

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-400">Passenger</p>
            <p className="mt-0.5 break-words font-medium text-slate-700">{guestName}</p>
          </div>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-400">Gate</p>
            <p className="mt-0.5 break-words font-medium text-slate-700">Moara Hall</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 border-l border-dashed border-slate-300 bg-[#f4efe4] px-2 py-3">
        <p className="text-center font-mono text-[7px] uppercase leading-relaxed tracking-[0.14em] text-slate-400">
          Flight
          <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.06em] text-[#5b6884]">
            {timelineFlightCode}
          </span>
        </p>
        <div className="flex items-end justify-center gap-[1.5px]" aria-hidden="true">
          {barcodeBars.slice(0, 11).map((bar, index) => (
            <span
              key={index}
              className="rounded-sm bg-[#6f7c93]/65"
              style={{ width: 1.5, height: Math.round(bar.height * 0.72) }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const getTimeLeft = () => {
  const diff = Math.max(0, weddingDateMs - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const CountdownStrip = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    ["Days", timeLeft.days],
    ["Hours", timeLeft.hours],
    ["Minutes", timeLeft.minutes],
    ["Seconds", timeLeft.seconds],
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map(([label, value]) => (
        <div key={label} className="rounded-[18px] border border-slate-200 bg-white px-2 py-3 text-center sm:p-3">
          <p className="font-display text-2xl text-[#72809c]">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-slate-400 sm:text-[9px] sm:tracking-[0.18em]">{label}</p>
        </div>
      ))}
    </div>
  );
};

const Timeline = () => (
  <div className="mt-6">
    <div className="text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-slate-400">
        Boarding · Wedding Day
      </p>
      <h2 className="mt-1 font-display text-2xl tracking-wide text-slate-700">
        Wedding Timeline
      </h2>
      <p className="mt-1 font-serif text-sm italic text-slate-500">
        Aidit &amp; Athirah · flight to forever
      </p>
      <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-[#c9a86a]/70 to-transparent" />
    </div>

    <div className="mt-5 space-y-4">
      {weddingTimelineEvents.map((event, index) => (
        <motion.article
          key={`${event.time}-${event.title}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: index * 0.05 }}
          className={`relative grid grid-cols-[58px_1fr_46px] overflow-hidden rounded-[15px] border border-[#e4dccb] bg-[#fffdf8] shadow-[0_12px_28px_rgba(90,95,110,0.08)] ${
            index % 2 === 0 ? "-rotate-[0.35deg]" : "rotate-[0.45deg]"
          }`}
        >
          <div className="border-r border-dashed border-[#d8d0be] bg-[#f3eee3]/60 px-1 py-4 text-center">
            <p className="font-mono text-[13px] font-semibold leading-none text-[#72809c]">
              {event.time}
            </p>
            <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.16em] text-[#a29a8a]">
              {event.period}
            </p>
          </div>

          <div className="px-3 py-3.5">
            <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-[#b0a792]">
              Boarding · {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-0.5 font-display text-[17px] leading-tight text-slate-700">
              {event.title}
            </h3>
            <p className="mt-1 font-serif text-[13.5px] italic leading-snug text-slate-500">
              {event.detail}
            </p>
            <div className="mt-2 flex gap-3 border-t border-dashed border-[#e4dccb] pt-2">
              <div>
                <p className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-[#b0a792]">
                  Gate
                </p>
                <p className="mt-0.5 font-mono text-[8px] text-[#5c6982]">{event.gate}</p>
              </div>
              <div>
                <p className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-[#b0a792]">
                  Seat
                </p>
                <p className="mt-0.5 font-mono text-[8px] text-[#5c6982]">{event.seat}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 border-l border-dashed border-[#d8d0be] bg-[#f3eee3]/55 px-1 py-2">
            <Plane className="h-3.5 w-3.5 rotate-45 text-[#72809c]" />
            <div className="h-6 w-[18px] bg-[repeating-linear-gradient(90deg,#6c788d_0_1px,transparent_1px_3px)] opacity-90" />
            <p className="font-mono text-[6px] tracking-[0.04em] text-[#a29a8a]">
              {timelineFlightCode}
            </p>
          </div>

          <span className="pointer-events-none absolute -top-1.5 left-[57px] h-3 w-3 rounded-full border border-[#e4dccb] bg-[#f9f7f1]" />
          <span className="pointer-events-none absolute -bottom-1.5 left-[57px] h-3 w-3 rounded-full border border-[#e4dccb] bg-[#f9f7f1]" />
        </motion.article>
      ))}
    </div>
  </div>
);

type WishRow = {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
};

const formatWishDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const GuestWishes = ({
  refreshKey,
  onWriteWish,
}: {
  refreshKey: number;
  onWriteWish: () => void;
}) => {
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const [activeWish, setActiveWish] = useState(0);
  const wishItems = wishes.slice(0, 5);

  useEffect(() => {
    setActiveWish(0);
    railRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [refreshKey, wishes.length]);

  const scrollToWish = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.children[index] as HTMLElement | undefined;
    if (!card) return;
    const railRect = rail.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    rail.scrollTo({
      left: rail.scrollLeft + cardRect.left - railRect.left,
      behavior: "smooth",
    });
  };

  const goToWish = (direction: number) => {
    if (wishItems.length < 2) return;
    const next = (activeWish + direction + wishItems.length) % wishItems.length;
    scrollToWish(next);
  };

  const handleWishScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const center = railRect.left + railRect.width / 2;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    Array.from(rail.children).forEach((child, index) => {
      const rect = (child as HTMLElement).getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveWish(closest);
  };

  useEffect(() => {
    let cancelled = false;

    const loadWishes = async () => {
      const { data, error } = await supabase
        .from("wishes")
        .select("id, name, message, created_at")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (cancelled) return;
      if (error) {
        console.error("Failed to load wishes:", error.message);
      } else if (data) {
        setWishes(data as WishRow[]);
      }
      setLoading(false);
    };

    void loadWishes();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <section
      data-tour-target="wishes"
      className="mt-5 overflow-hidden rounded-[26px] border border-[#e4dccb] bg-white/80 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
            Guestbook · Wishes
          </p>
          <h2 className="mt-1 font-display text-2xl text-slate-700">From Our Guests</h2>
          <p className="mt-1 font-serif text-sm italic text-slate-500">
            little notes for our forever
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e4dccb] bg-[#f9f7f1] text-[#c9a86a]">
          <Heart className="h-4 w-4 fill-[#c9a86a]/20" />
        </div>
      </div>

      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#e4dccb] to-transparent" />

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-[14px] bg-[#f4f1e9]" />
          ))}
        </div>
      ) : wishes.length > 0 ? (
        <>
          <div className="mt-4">
            <div
              ref={railRef}
              onScroll={handleWishScroll}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {wishItems.map((wish, index) => (
                <motion.article
                  key={wish.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className={`relative shrink-0 snap-start rounded-[14px] border border-[#e4dccb] bg-[#fffdf8] p-3.5 shadow-[0_10px_22px_rgba(90,95,110,0.06)] ${
                    wishItems.length > 1 ? "w-[88%]" : "w-full"
                  }`}
                >
                  <div className="absolute right-2.5 top-2.5 flex h-11 w-9 rotate-3 flex-col items-center justify-center gap-0.5 border border-dashed border-[#b7a78b] bg-[#f4e8d6] text-center text-[#8d7d64]">
                    <WeddingLogo className="h-4 w-5 text-[#8d7d64]" />
                    <span className="font-mono text-[4.5px] leading-none">24.12</span>
                  </div>
                  <div className="absolute right-7 top-8 flex h-9 w-9 -rotate-12 items-center justify-center rounded-full border border-[#72809c]/35 text-center font-mono text-[4.5px] leading-tight text-[#72809c]/60">
                    MOARA
                    <br />
                    HALL
                    <br />
                    2026
                  </div>

                  <p className="font-mono text-[6.5px] uppercase tracking-[0.18em] text-[#a8895e]">
                    Par avion · Postcard {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 pr-16 font-display text-[17px] leading-tight text-slate-700">
                    {wish.name || "Tetamu"}
                  </p>
                  <p className="mt-1.5 font-serif text-[14.5px] italic leading-relaxed text-slate-600">
                    “{wish.message}”
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#e4dccb] pt-2">
                    <span className="font-mono text-[5.5px] uppercase tracking-[0.12em] text-slate-400">
                      {formatWishDate(wish.created_at)}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[5.5px] uppercase tracking-[0.1em] text-[#c9a86a]">
                      <Heart className="h-2.5 w-2.5 fill-current" />
                      with love
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>

            {wishItems.length > 1 && (
              <>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => goToWish(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4dccb] bg-white/70 text-[#72809c] transition-colors hover:bg-white"
                    aria-label="Ucapan sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {wishItems.map((wish, index) => (
                      <button
                        key={wish.id}
                        type="button"
                        onClick={() => scrollToWish(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeWish === index ? "w-5 bg-[#c9a86a]" : "w-1.5 bg-[#d9d0be]"
                        }`}
                        aria-label={`Ucapan ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => goToWish(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4dccb] bg-white/70 text-[#72809c] transition-colors hover:bg-white"
                    aria-label="Ucapan seterusnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-center font-mono text-[5.5px] uppercase tracking-[0.14em] text-slate-400">
                  Swipe untuk ucapan lain →
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onWriteWish}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#d7dbea] bg-[#f4f6fb] px-4 py-2.5 text-xs font-medium text-[#64728e] transition-colors hover:bg-[#e9edf6]"
          >
            <Heart className="h-3.5 w-3.5" />
            Tinggalkan ucapan
          </button>
        </>
      ) : (
        <div className="mt-4 rounded-[4px] bg-[repeating-linear-gradient(45deg,#72809c_0_7px,#f9f7f1_7px_14px,#c9a86a_14px_21px)] p-[3px]">
          <div className="relative rounded-[2px] bg-[#fffdf8] px-4 py-5 text-center">
            <div className="absolute right-3 top-3 flex h-11 w-9 rotate-3 flex-col items-center justify-center gap-0.5 border border-dashed border-[#b7a78b] bg-[#f4e8d6] text-center text-[#8d7d64]">
              <WeddingLogo className="h-4 w-5 text-[#8d7d64]" />
              <span className="font-mono text-[4.5px] leading-none">24.12</span>
            </div>

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#e4dccb] bg-[#f9f7f1] text-[#c9a86a]">
              <Heart className="h-5 w-5 fill-[#c9a86a]/20" />
            </div>
            <p className="mt-2 font-display text-lg text-slate-700">Be our first wish</p>
            <p className="mx-auto mt-1 max-w-[250px] font-serif text-sm italic leading-relaxed text-slate-500">
              Ucapan dan doa anda akan muncul di sini selepas anda menghantar RSVP.
            </p>
            <button
              type="button"
              onClick={onWriteWish}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#72809c] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#64728e]"
            >
              <Heart className="h-3.5 w-3.5" />
              Tinggalkan ucapan
            </button>
            <p className="mt-3 font-mono text-[5.5px] uppercase tracking-[0.14em] text-slate-300">
              Your words, our keepsake
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

const MobileDock = ({ onSelect }: { onSelect: (info: InfoKey) => void }) => {
  const dockItems = quickCards.filter((card) =>
    ["calendar", "location", "rsvp", "contact"].includes(card.id),
  );

  return (
    <nav className="fixed inset-x-0 bottom-2 z-30 mx-auto w-[min(332px,calc(100vw-28px))] rounded-full border border-white/70 bg-white/72 px-2 py-1.5 shadow-[0_12px_38px_rgba(80,88,110,0.22)] backdrop-blur-md sm:hidden">
      <div className="grid grid-cols-4 gap-0.5">
        {dockItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="flex min-h-10 flex-col items-center justify-center rounded-full text-[#72809c] transition-colors active:bg-[#eef0f4]"
              aria-label={item.title}
            >
              <Icon className="h-4 w-4" />
              <span className="mt-0.5 text-[8px] font-medium leading-none">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

type RsvpEntry = {
  name: string;
  attendance: string;
  pax: number;
  wishes: string;
};

const currency = new Intl.NumberFormat("ms-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

type SalamKautEntry = {
  name: string;
  amount: number;
};

const TransferDetails = () => (
  <div className="rounded-[22px] bg-white/70 p-4">
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
      Transfer Details
    </p>
    <a
      href={paymentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-slate-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
    >
      Open Touch ’n Go payment link
    </a>
    <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block">
      <img
        src="/duitnow-qr.png"
        alt="DuitNow QR code for payment"
        className="mx-auto block h-auto w-full max-w-[260px] rounded-[18px]"
      />
    </a>
  </div>
);

const SalamKaut = () => {
  const [entries, setEntries] = useState<SalamKautEntry[]>([]);
  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(salamKautStorageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as SalamKautEntry[];
      if (Array.isArray(parsed)) setEntries(parsed);
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(salamKautStorageKey, JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeAmount = Math.max(1, amount);
    const finalName = contributorName.trim() || "Guest";
    setEntries((current) => [
      ...current,
      {
        name: finalName,
        amount: safeAmount,
      },
    ]);

    void supabase
      .from("donation_confirmations")
      .insert({
        name: finalName,
        amount: String(safeAmount),
        message: "Salam Kaut",
      })
      .then(({ error }) => {
        if (error) console.error("Failed to save salam kaut:", error.message);
      });

    setContributorName("");
    setAmount(50);
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2200);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-white/65 p-4">
        <p className="font-serif text-lg italic leading-relaxed text-slate-600">
          Salam Kaut — contribute any amount from the heart (ikhlas).
        </p>
      </div>

      <TransferDetails />

      <form onSubmit={handleSubmit} className="rounded-[22px] bg-white/70 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Contribution
            </p>
            <p className="mt-1 font-display text-2xl text-slate-700">
              {currency.format(amount)}
            </p>
          </div>
          <Heart className="h-8 w-8 text-[#72809c]" />
        </div>

        <label className="mt-4 block">
          <span className="sr-only">Your name</span>
          <input
            value={contributorName}
            onChange={(event) => setContributorName(event.target.value)}
            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-500"
            placeholder="Your name"
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-medium text-slate-500">
            Slide amount (ikhlas)
          </span>
          <input
            type="range"
            min={1}
            max={500}
            step={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full accent-slate-700"
          />
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            <span>RM1</span>
            <span>RM500</span>
          </div>
        </label>

        <label className="mt-4 block">
          <span className="sr-only">Donation amount</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-500"
            placeholder="Amount"
          />
        </label>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Heart className="h-4 w-4" />
          Send Salam Kaut
        </button>

        {submitted && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
            Thank you. Your salam kaut has been added.
          </p>
        )}
      </form>
    </div>
  );
};

const Barcode = ({ compact = false }: { compact?: boolean }) => (
  <div className={compact ? "mt-4" : "mt-5"}>
    <div className="flex items-end justify-center gap-[2px]" aria-hidden="true">
      {barcodeBars.slice(0, compact ? 24 : undefined).map((bar, index) => (
        <span
          key={index}
          className="rounded-sm bg-slate-500/75"
          style={{ width: bar.width, height: compact ? Math.max(12, bar.height - 8) : bar.height }}
        />
      ))}
    </div>
  </div>
);

const InfoPopup = ({
  activeCard,
  activeInfo,
  submitted,
  onClose,
  onSubmitted,
  onNavigate,
}: {
  activeCard?: (typeof quickCards)[number];
  activeInfo: InfoKey | null;
  submitted: boolean;
  onClose: () => void;
  onSubmitted: (entry: RsvpEntry) => void;
  onNavigate: (info: InfoKey) => void;
}) => (
  <AnimatePresence>
    {activeInfo && activeCard && (
      <motion.div
        className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/30 px-3 pb-3 pt-8 backdrop-blur-sm sm:items-center sm:px-5 sm:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          onClick={(event) => event.stopPropagation()}
          className="relative flex max-h-[86svh] w-full max-w-[380px] flex-col overflow-hidden rounded-[28px] border border-[#aeb8cf] bg-[#c7d0e4] text-slate-700 shadow-2xl sm:max-h-[82vh] sm:max-w-[360px]"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-500 backdrop-blur-sm transition-colors hover:bg-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div
            key={activeInfo}
            className="overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
              {activeInfo === "photos" ? "Guest camera" : "Boarding info"}
            </p>
            <h2 className="mt-2 font-display text-2xl">{activeCard.title}</h2>
            <div className="mt-5">{renderPopup(activeInfo, submitted, onSubmitted, onNavigate)}</div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const attendanceOptions = [
  { value: "Attending", label: "Hadir" },
  { value: "Maybe", label: "Mungkin" },
  { value: "Unable to attend", label: "Tidak hadir" },
] as const;

const RsvpForm = ({
  submitted,
  onSubmitted,
}: {
  submitted: boolean;
  onSubmitted: (entry: RsvpEntry) => void;
}) => {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState("Attending");
  const [pax, setPax] = useState(1);
  const [wishes, setWishes] = useState("");

  const isNotAttending = attendance === "Unable to attend";
  const attendanceLabel =
    attendance === "Attending" ? "Hadir" : attendance === "Maybe" ? "Mungkin" : "Tidak hadir";

  const handleAttendanceChange = (value: string) => {
    setAttendance(value);
    if (value === "Unable to attend") {
      setPax(0);
    } else if (pax === 0) {
      setPax(1);
    }
  };

  if (submitted) {
    return (
      <div className="-mx-1 rounded-[24px] bg-[#f9f7f1] p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
          <Check className="h-6 w-6" />
        </div>
        <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.22em] text-slate-400">
          RSVP received
        </p>
        <h3 className="mt-1 font-display text-2xl text-slate-700">Terima kasih!</h3>
        <p className="mt-2 font-serif text-sm italic leading-relaxed text-slate-500">
          Your seat has been noted. Your wish will appear in <b>From Our Guests</b>.
        </p>

        {name.trim() && (
          <div className="mt-4 space-y-2 rounded-[14px] border border-dashed border-[#e4dccb] bg-white/60 p-3 text-left">
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-slate-400">
                Nama
              </span>
              <span className="text-right text-xs font-medium text-slate-600">{name}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-slate-400">
                Kehadiran
              </span>
              <span className="text-xs font-medium text-slate-600">{attendanceLabel}</span>
            </div>
            {!isNotAttending && (
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-slate-400">
                  Bilangan tetamu
                </span>
                <span className="text-xs font-medium text-slate-600">{pax}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#e4dccb] pt-2 font-mono text-[6px] uppercase tracking-[0.14em] text-slate-400">
          <span>Aidit &amp; Athirah</span>
          <span>24.12.26</span>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-1 rounded-[24px] bg-[#f9f7f1] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#a29a8a]">
            Wedding pass · RSVP
          </p>
          <h3 className="mt-1 font-display text-xl text-slate-700">Sahkan kehadiran</h3>
          <p className="mt-1 font-serif text-sm italic text-slate-500">We saved a seat for you.</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e4dccb] bg-white/70 text-[#72809c]">
          <Plane className="h-4 w-4 rotate-45" />
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-[#e4dccb]" />

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitted({
            name: name.trim() || "Guest",
            attendance,
            pax: isNotAttending ? 0 : Math.max(1, pax),
            wishes: wishes.trim(),
          });
        }}
      >
        <label className="block">
          <span className="mb-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
            Nama
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-[10px] border border-[#e4dccb] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-[#b0a792] focus:border-[#72809c]"
            placeholder="Nama anda / keluarga"
            required
          />
        </label>

        <div>
          <span className="mb-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
            Kehadiran
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {attendanceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAttendanceChange(option.value)}
                className={`rounded-[10px] border px-1.5 py-2 text-[11px] font-medium transition-colors ${
                  attendance === option.value
                    ? "border-[#72809c] bg-[#72809c] text-white"
                    : "border-[#e4dccb] bg-white/70 text-slate-500 hover:bg-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
              Bilangan tetamu
            </span>
            <span className="font-mono text-[6px] uppercase tracking-[0.1em] text-slate-400">
              Max 20
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPax((current) => Math.max(1, current - 1))}
              disabled={isNotAttending || pax <= 1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#e4dccb] bg-white/70 text-lg leading-none text-[#72809c] transition-colors hover:bg-white disabled:opacity-40"
              aria-label="Kurangkan tetamu"
            >
              −
            </button>
            <input
              type="number"
              min={isNotAttending ? 0 : 1}
              max={isNotAttending ? 0 : 20}
              value={pax}
              disabled={isNotAttending}
              onChange={(event) =>
                setPax(Math.max(0, Math.min(20, Number(event.target.value) || 0)))
              }
              className={`h-10 w-full rounded-[10px] border border-[#e4dccb] px-3 text-center text-sm outline-none ${
                isNotAttending
                  ? "cursor-not-allowed bg-[#f1ece1] text-slate-400"
                  : "bg-white text-slate-700 focus:border-[#72809c]"
              }`}
              placeholder="Bilangan tetamu"
              required={!isNotAttending}
            />
            <button
              type="button"
              onClick={() => setPax((current) => Math.min(20, current + 1))}
              disabled={isNotAttending || pax >= 20}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#e4dccb] bg-white/70 text-lg leading-none text-[#72809c] transition-colors hover:bg-white disabled:opacity-40"
              aria-label="Tambah tetamu"
            >
              +
            </button>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
            Ucapan &amp; doa{" "}
            <span className="normal-case tracking-normal text-slate-400">(pilihan)</span>
          </span>
          <textarea
            value={wishes}
            onChange={(event) => setWishes(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-[10px] border border-[#e4dccb] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-[#b0a792] focus:border-[#72809c]"
            placeholder="Tinggalkan ucapan untuk pengantin..."
          />
        </label>

        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#72809c] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#64728e]">
          <Send className="h-4 w-4" />
          Hantar RSVP
        </button>

        <p className="text-center font-serif text-[11px] italic leading-relaxed text-slate-400">
          Sila sahkan sebelum 17 Disember 2026.
        </p>

        <div className="flex items-center justify-between border-t border-dashed border-[#e4dccb] pt-2 font-mono text-[6px] uppercase tracking-[0.14em] text-slate-400">
          <span>Aidit &amp; Athirah</span>
          <span>24.12.26</span>
        </div>
      </form>
    </div>
  );
};

function renderPopup(
  activeInfo: InfoKey,
  submitted: boolean,
  onSubmitted: (entry: RsvpEntry) => void,
  onNavigate: (info: InfoKey) => void,
) {
  switch (activeInfo) {
    case "calendar":
      return (
        <div className="space-y-4 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">Thursday, 24 December 2026</p>
          <p className="text-sm text-slate-600">11:00 AM - 4:00 PM</p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/70 px-4 py-3 text-sm font-medium"
            >
              Add Event
            </a>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/70 px-4 py-3 text-sm font-medium"
            >
              Google Calendar
            </a>
          </div>
        </div>
      );
    case "location":
      return (
        <div className="space-y-4 text-center">
          <img
            src={venueImg}
            alt="Wedding venue"
            className="aspect-[736/650] w-full rounded-[18px] object-cover"
          />
          <h3 className="font-display text-xl">Moara Hall</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Lot 418, Hujung Tanjung, Pulau Belanga,<br />
            16100 Kota Bharu, Kelantan.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm font-medium"
            >
              <Navigation className="h-4 w-4" />
              Google Maps
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm font-medium"
            >
              <Navigation className="h-4 w-4" />
              Waze
            </a>
          </div>
        </div>
      );
    case "rsvp":
      return <RsvpForm submitted={submitted} onSubmitted={onSubmitted} />;
    case "gallery":
      return <MomentsGallery images={gallery} />;
    case "dresscode":
      return <DressCodePanel />;
    case "gift":
      return (
        <GiftRegistry
          paymentUrl={paymentUrl}
          onOpenSalamKaut={() => onNavigate("salamkaut")}
        />
      );
    case "salamkaut":
      return <SalamKaut />;
    case "contact":
      return (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <a
              key={contact.phone}
              href={`https://wa.me/${contact.phone.replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-[18px] bg-white/65 p-4"
            >
              <span>
                <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">
                  {contact.side}
                </span>
                <span className="mt-1 block font-display text-xl">{contact.name}</span>
              </span>
              <Phone className="h-5 w-5 text-slate-600" />
            </a>
          ))}
        </div>
      );
    case "photos":
      return <GuestPhotoQR />;
    default:
      return null;
  }
}

export default Index;
