import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  Check,
  Clock,
  Gift,
  Heart,
  Images,
  MailCheck,
  MapPin,
  Navigation,
  Phone,
  Plane,
  Send,
  Users,
  X,
} from "lucide-react";
import moment1 from "@/assets/moment-1.jpeg";
import moment2 from "@/assets/moment-2.jpeg";
import moment3 from "@/assets/moment-3.jpeg";
import moment4 from "@/assets/moment-4.jpeg";
import moment5 from "@/assets/moment-5.jpeg";
import venueImg from "@/assets/venue.jpg";
import weddingSong from "@/assets/river-flows-in-you.mp3";

type InfoKey = "calendar" | "location" | "rsvp" | "gallery" | "gift" | "salamkaut" | "contact";

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
  { id: "gift", title: "Gift", caption: "Group gift", icon: Gift },
  { id: "salamkaut", title: "Salam Kaut", caption: "Duit salam", icon: Heart },
  { id: "contact", title: "Contact", caption: "Ask family", icon: Phone },
];

const events = [
  {
    title: "Guest Arrival",
    time: "11:00 AM",
    detail: "Moara Hall opens for family and friends.",
  },
  {
    title: "Lunch Reception",
    time: "12:00 PM",
    detail: "A warm meal, greetings, and wedding portraits.",
  },
  {
    title: "Photo Session",
    time: "2:30 PM",
    detail: "Group photos with the couple.",
  },
  {
    title: "Ceremony End",
    time: "4:00 PM",
    detail: "Thank you for boarding our forever journey.",
  },
];

const gallery = [moment1, moment2, moment3, moment4, moment5];

type GiftItem = {
  id: string;
  title: string;
  target_amount: number;
  sort_order: number;
};

const paymentUrl = "https://payment.tngdigital.com.my/sc/bDLob4bj0L";

const contacts = [
  { side: "Groom", name: "Aidit", phone: "+60133694584", displayPhone: "013-369 4584" },
  { side: "Bride", name: "Athirah", phone: "+60189067988", displayPhone: "018-906 7988" },
];

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
    () => quickCards.find((card) => card.id === activeInfo),
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
                    className="group min-h-[168px] rounded-[20px] bg-[#74819d] p-4 text-center text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-[178px]"
                  >
                    <p className="font-serif text-sm italic text-white/80">Wedding</p>
                    <h1 className="mt-1 font-display text-[1.65rem] leading-none tracking-wide">PASSPORT</h1>
                    <div className="mx-auto my-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/50 sm:h-16 sm:w-16">
                      <span className="font-display text-3xl italic">AA</span>
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
                  className="mt-3 min-h-20 w-full rounded-[22px] border border-[#d7dbea] bg-[#c7d0e4] px-4 py-4 text-center shadow-md transition-transform duration-300 hover:-translate-y-0.5 sm:px-5"
                >
                  <p className="font-display text-xl text-slate-700">Calendar</p>
                  <p className="mx-auto mt-1 max-w-[280px] font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">
                    Thursday, 24 December 2026 / 11:00 AM - 4:00 PM
                  </p>
                </button>

                <BoardingTicket guestName={guestName} />

                <div className="relative mt-4 min-h-[188px] overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4">
                  <div className="absolute right-5 top-6 text-[#72809c]">
                    <Plane className="h-6 w-6 rotate-45" />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveInfo("gallery")}
                      className="group w-28 shrink-0 rotate-[-7deg] rounded-md bg-white p-1 shadow-lg transition-transform duration-300 hover:rotate-[-3deg]"
                    >
                      <img src={moment1} alt="Travel moment" className="h-24 w-full rounded-sm object-cover" />
                      <p className="py-1 font-serif text-xs italic text-slate-500">Journey</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInfo("location")}
                      className="group mt-12 w-28 shrink-0 rotate-[6deg] rounded-md bg-white p-1 shadow-lg transition-transform duration-300 hover:rotate-[2deg]"
                    >
                      <img src={venueImg} alt="Venue preview" className="h-24 w-full rounded-sm object-cover" />
                      <p className="py-1 font-serif text-xs italic text-slate-500">Venue</p>
                    </button>
                  </div>
                  <p className="absolute bottom-5 right-5 max-w-[132px] text-right font-serif text-base italic leading-tight text-slate-500 sm:max-w-[140px] sm:text-lg">
                    Our route to forever
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {quickCards
                    .filter((card) => card.id === "gift" || card.id === "salamkaut" || card.id === "contact")
                    .map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setActiveInfo(card.id)}
                        data-tour-target={card.id === "gift" || card.id === "salamkaut" ? card.id : undefined}
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
                <GuestWishes refreshKey={wishesRefreshKey} />
              </section>
            </section>

            <InfoPopup
              activeCard={activeCard}
              activeInfo={activeInfo}
              submitted={submitted}
              onClose={() => setActiveInfo(null)}
              onSubmitted={addRsvpEntry}
            />
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
              aria-label="Open invitation guide. Drag to move this button."
              title="Invitation guide · drag to move"
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
    title: "RSVP",
    detail: "Tap this boarding pass to confirm if you can attend. Enter your name, attendance, and number of guests.",
  },
  {
    target: "wishes",
    title: "Send a wish",
    detail: "Write your message in the Wishes field inside the RSVP form. After you submit, guest wishes appear in this section.",
  },
  {
    target: "gift",
    title: "Wedding gift",
    detail: "Open Gift to browse the wishlist and contribute. The Touch ’n Go payment link and QR are inside.",
  },
  {
    target: "salamkaut",
    title: "Salam Kaut",
    detail: "Open Salam Kaut to enter your name and amount. You can then pay using the Touch ’n Go link or QR.",
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

  const width = Math.min(320, window.innerWidth - 32);
  const left = spotlight
    ? Math.max(16, Math.min(window.innerWidth - width - 16, spotlight.left + spotlight.width / 2 - width / 2))
    : 16;
  const top = spotlight
    ? Math.max(16, Math.min(window.innerHeight - 210, spotlight.top > window.innerHeight * 0.58 ? spotlight.top - 190 : spotlight.bottom + 18))
    : 90;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Invitation feature guide">
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
          className="fixed rounded-[24px] border border-white/80 bg-[#f9f7f1] p-5 text-slate-700 shadow-[0_24px_80px_rgba(20,28,40,.35)]"
          style={{ top, left, width }}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Invitation guide · {String(stepIndex + 1).padStart(2, "0")} / {String(guideSteps.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={onClose} className="rounded-full px-2 py-1 text-xs text-slate-500">Skip</button>
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
              Back
            </button>
            <button
              type="button"
              onClick={() => stepIndex === guideSteps.length - 1 ? onClose() : setStepIndex((current) => current + 1)}
              className="rounded-full bg-[#72809c] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#64728e]"
            >
              {stepIndex === guideSteps.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

const MalayInvitationCard = () => (
  <article className="relative mt-5 overflow-hidden rounded-[24px] border border-[#dce0e9] bg-white px-5 py-6 text-center shadow-sm sm:px-6">
    <div className="pointer-events-none absolute inset-2 rounded-[18px] border border-[#e8eaf0]" />
    <div className="relative">
      <p className="font-display text-lg leading-snug text-[#72809c] sm:text-xl">
        💐 JEMPUTAN WALIMATULURUS 💐
      </p>
      <p className="mx-auto mt-4 max-w-[330px] font-serif text-sm leading-relaxed text-slate-600">
        Assalamualaikum warahmatullahi wabarakatuh dan salam sejahtera,
      </p>
      <p className="mt-4 font-serif text-sm leading-relaxed text-slate-600">
        Dengan penuh kesyukuran ke hadrat Allah SWT, kami
      </p>
      <div className="mt-3 rounded-[18px] bg-[#f4f5f8] px-3 py-3.5">
        <p className="text-xs font-semibold tracking-[0.06em] text-slate-700">AZMI BIN MAT JUSOH</p>
        <p className="my-1 font-serif text-sm italic text-[#72809c]">&amp;</p>
        <p className="text-xs font-semibold tracking-[0.06em] text-slate-700">FARIDAH BINTI ABDUL HAMID</p>
      </div>
      <p className="mt-4 font-serif text-sm leading-relaxed text-slate-600">
        dengan segala hormatnya menjemput Dato’/Datin/Tuan/Puan/Encik/Cik ke majlis
        walimatulurus anakanda kami
      </p>
      <p className="mt-4 text-sm font-semibold tracking-[0.18em] text-[#72809c]">ATHIRAH</p>
      <p className="mt-1 font-serif text-sm italic text-slate-500">bersama pilihannya,</p>
      <p className="mt-1 text-sm font-semibold tracking-[0.18em] text-[#72809c]">AIDIT</p>

      <div className="my-5 border-t border-dashed border-slate-300" />
      <div className="space-y-3 text-left text-sm text-slate-600">
        <div className="flex items-start gap-3">
          <span aria-hidden="true">🗓️</span>
          <p>Khamis, 24 Disember 2026</p>
        </div>
        <div className="flex items-start gap-3">
          <span aria-hidden="true">🕛</span>
          <p>12.00 tengah hari</p>
        </div>
        <div className="flex items-start gap-3">
          <span aria-hidden="true">📍</span>
          <p><span className="font-semibold text-slate-700">MOARA HALL</span><br />
            Lot 418, Hujung Tanjung, Pulau Belanga,<br />
            16100 Kota Bharu, Kelantan
          </p>
        </div>
      </div>
      <p className="mt-5 font-serif text-sm italic leading-relaxed text-slate-600">
        Semoga kehadiran serta doa restu anda dapat menyerikan majlis dan menambahkan
        keberkatan buat kedua-dua mempelai. Insya-Allah.
      </p>
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
            <Heart className="h-10 w-10 fill-white/15 text-white" />
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
  <div className="mt-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400 sm:text-[10px] sm:tracking-[0.2em]">
        Boarding Ticket to be married
      </p>
      <Heart className="h-4 w-4 fill-[#72809c]/20 text-[#72809c]" />
    </div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div>
        <p className="font-display text-2xl text-slate-700">SGL</p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Single</p>
      </div>
      <Plane className="h-5 w-5 rotate-90 text-[#72809c]" />
      <div className="text-right">
        <p className="font-display text-2xl text-slate-700">FRV</p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Forever</p>
      </div>
    </div>
    <div className="my-4 border-t border-dashed border-slate-300" />
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <p className="font-mono uppercase tracking-[0.16em] text-slate-400 sm:tracking-[0.18em]">Passenger</p>
        <p className="mt-1 break-words font-medium text-slate-700">{guestName}</p>
      </div>
      <div>
        <p className="font-mono uppercase tracking-[0.16em] text-slate-400 sm:tracking-[0.18em]">Gate</p>
        <p className="mt-1 break-words font-medium text-slate-700">Moara Hall</p>
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
    <h2 className="text-center font-display text-2xl tracking-wide text-slate-700">Wedding Timeline</h2>
    <div className="mt-5 space-y-5">
      {events.map((event) => (
        <div key={event.title} className="grid grid-cols-[64px_1px_1fr] gap-3 sm:grid-cols-[74px_1px_1fr] sm:gap-4">
          <p className="text-right font-mono text-xs text-[#72809c]">{event.time}</p>
          <div className="relative bg-slate-200">
            <span className="absolute -left-[5px] top-0 h-3 w-3 rounded-full bg-[#72809c]" />
          </div>
          <div className="-mt-1">
            <h3 className="font-display text-lg text-slate-700">{event.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{event.detail}</p>
          </div>
        </div>
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

const GuestWishes = ({ refreshKey }: { refreshKey: number }) => {
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadWishes = async () => {
      const { data, error } = await supabase
        .from("wishes")
        .select("id, name, message, created_at")
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
    <section data-tour-target="wishes" className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Guest Wishes
          </p>
          <h2 className="mt-1 font-display text-2xl text-slate-700">From Our Guests</h2>
        </div>
        <Heart className="h-5 w-5 fill-[#72809c]/20 text-[#72809c]" />
      </div>

      {wishes.length > 0 ? (
        <div className="space-y-3">
          {wishes.slice(0, 5).map((wish) => (
            <article key={wish.id} className="rounded-[18px] bg-[#f4f6fb] p-4">
              <p className="font-display text-lg text-slate-700">{wish.name || "Guest"}</p>
              <p className="mt-2 font-serif text-base italic leading-relaxed text-slate-600">
                "{wish.message}"
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-[18px] bg-[#f4f6fb] p-4 font-serif text-base italic leading-relaxed text-slate-500">
          {loading
            ? "Loading wishes..."
            : "Wishes from guests will appear here after they submit the RSVP form."}
        </p>
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

const GiftContribution = () => {
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [approvedTotals, setApprovedTotals] = useState<Record<string, number>>({});
  const [selectedItem, setSelectedItem] = useState("");
  const [giftsLoading, setGiftsLoading] = useState(true);
  const [giftsError, setGiftsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState(100);
  const [giftSubmitted, setGiftSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    const loadGiftData = async () => {
      setGiftsLoading(true);
      setGiftsError("");
      const [{ data: items, error: itemsError }, { data: totalsData, error: totalsError }] = await Promise.all([
        supabase
          .from("gift_items")
          .select("id, title, target_amount, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase.rpc("get_approved_gift_totals"),
      ]);

      if (!active) return;
      if (itemsError || totalsError) {
        console.error("Failed to load gift data:", itemsError?.message ?? totalsError?.message);
        setGiftsError("Gift details are temporarily unavailable. Please try again later.");
        setGiftsLoading(false);
        return;
      }

      const gifts = (items ?? []) as GiftItem[];
      const totals = (totalsData ?? []).reduce<Record<string, number>>((result, row) => {
        const itemId = row.gift_item_id as string | null;
        const value = Number(row.total_amount);
        if (itemId && Number.isFinite(value)) result[itemId] = value;
        return result;
      }, {});
      setGiftItems(gifts);
      setApprovedTotals(totals);
      setSelectedItem((current) => gifts.some((item) => item.id === current) ? current : gifts[0]?.id ?? "");
      setGiftsLoading(false);
    };

    void loadGiftData();
    return () => { active = false; };
  }, []);

  const wishlistWithTotals = giftItems.map((item) => {
    const total = approvedTotals[item.id] ?? 0;
    const progress = item.target_amount > 0
      ? Math.min(100, Math.round((total / item.target_amount) * 100))
      : 0;
    return { ...item, target: item.target_amount, total, progress };
  });

  const selectedGift = wishlistWithTotals.find((item) => item.id === selectedItem);
  if (giftsLoading) {
    return <p className="rounded-[20px] bg-white/65 p-4 text-sm text-slate-600">Loading gift wishlist…</p>;
  }
  if (giftsError) {
    return <p className="rounded-[20px] bg-white/65 p-4 text-sm text-slate-600">{giftsError}</p>;
  }
  if (!selectedGift) {
    return <p className="rounded-[20px] bg-white/65 p-4 text-sm text-slate-600">The gift wishlist will be available soon.</p>;
  }
  const remaining = Math.max(0, selectedGift.target - selectedGift.total);
  const maxContribution = Math.max(50, Math.min(1000, remaining || selectedGift.target));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGift) return;
    setSubmitError("");
    const safeAmount = Math.max(1, Math.min(amount, remaining || amount));
    const finalName = contributorName.trim() || "Guest";
    const { error } = await supabase
      .from("donation_confirmations")
      .insert({
        name: finalName,
        amount: String(safeAmount),
        message: `Gift: ${selectedGift.title}`,
        gift_item_id: selectedGift.id,
      })

    if (error) {
      console.error("Failed to save gift contribution:", error.message);
      setSubmitError("We couldn't submit your contribution. Please try again.");
      return;
    }

    setContributorName("");
    setAmount(100);
    setGiftSubmitted(true);
    window.setTimeout(() => setGiftSubmitted(false), 2200);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-white/65 p-4">
        <p className="font-serif text-lg italic leading-relaxed text-slate-600">
          Choose a wishlist item and contribute any amount toward the target.
        </p>
      </div>

      <div className="space-y-3">
        {wishlistWithTotals.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item.id)}
            className={`w-full rounded-[20px] p-4 text-left transition-all ${
              selectedItem === item.id
                ? "bg-white shadow-sm ring-2 ring-slate-700/15"
                : "bg-white/58 hover:bg-white/75"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-slate-700">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Target {currency.format(item.target)}
                </p>
              </div>
              <span className="rounded-full bg-[#72809c] px-3 py-1 font-mono text-[10px] text-white">
                {item.progress}%
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200/80">
              <motion.div
                className="h-full rounded-full bg-slate-700"
                initial={false}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 0.45 }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Collected {currency.format(item.total)}</span>
              <span>Left {currency.format(Math.max(0, item.target - item.total))}</span>
            </div>
          </button>
        ))}
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
          <Gift className="h-8 w-8 text-[#72809c]" />
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
            Slide amount for {selectedGift.title}
          </span>
          <input
            type="range"
            min={10}
            max={maxContribution}
            step={10}
            value={Math.min(amount, maxContribution)}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full accent-slate-700"
          />
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            <span>RM10</span>
            <span>{currency.format(maxContribution)}</span>
          </div>
        </label>

        <label className="mt-4 block">
          <span className="sr-only">Donation amount</span>
          <input
            type="number"
            min={1}
            max={remaining || undefined}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-500"
            placeholder="Donation amount"
          />
        </label>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Heart className="h-4 w-4" />
          Contribute Gift
        </button>

        {submitError && (
          <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
            {submitError}
          </p>
        )}

        {giftSubmitted && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
            Thank you. Your contribution has been added.
          </p>
        )}
      </form>
    </div>
  );
};

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
}: {
  activeCard?: (typeof quickCards)[number];
  activeInfo: InfoKey | null;
  submitted: boolean;
  onClose: () => void;
  onSubmitted: (entry: RsvpEntry) => void;
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
          className="relative max-h-[86svh] w-full max-w-[380px] overflow-y-auto rounded-[28px] border border-[#aeb8cf] bg-[#c7d0e4] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-slate-700 shadow-2xl sm:max-h-[82vh] sm:max-w-[360px]"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/55 text-slate-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
            Boarding info
          </p>
          <h2 className="mt-2 font-display text-2xl">{activeCard.title}</h2>
          <div className="mt-5">{renderPopup(activeInfo, submitted, onSubmitted)}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

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
      <div className="py-5 text-center">
        <Check className="mx-auto h-10 w-10 text-slate-700" />
        <h3 className="mt-3 font-display text-xl">RSVP received</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you. Your wishes will appear below the Wedding Timeline.
        </p>
      </div>
    );
  }

  return (
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
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full rounded-xl border-0 bg-white/70 px-4 py-3 text-sm outline-none"
        placeholder="Name"
        required
      />
      <select
        value={attendance}
        onChange={(event) => handleAttendanceChange(event.target.value)}
        className="w-full rounded-xl border-0 bg-white/70 px-4 py-3 text-sm outline-none"
      >
        <option>Attending</option>
        <option>Maybe</option>
        <option>Unable to attend</option>
      </select>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          Number of Pax
        </label>
        <input
          type="number"
          min={isNotAttending ? 0 : 1}
          max={isNotAttending ? 0 : 20}
          value={pax}
          disabled={isNotAttending}
          onChange={(event) => setPax(Math.max(0, Number(event.target.value)))}
          className={`w-full rounded-xl border-0 px-4 py-3 text-sm outline-none ${
            isNotAttending
              ? "bg-slate-200/60 text-slate-400 cursor-not-allowed"
              : "bg-white/70"
          }`}
          placeholder="Number of guests"
          required={!isNotAttending}
        />
      </div>
      <textarea
        value={wishes}
        onChange={(event) => setWishes(event.target.value)}
        className="h-24 w-full resize-none rounded-xl border-0 bg-white/70 px-4 py-3 text-sm outline-none"
        placeholder="Wishes"
      />
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white">
        <Send className="h-4 w-4" />
        Submit
      </button>
    </form>
  );
};

function renderPopup(
  activeInfo: InfoKey,
  submitted: boolean,
  onSubmitted: (entry: RsvpEntry) => void,
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
          <img src={venueImg} alt="Wedding venue" className="h-40 w-full rounded-[18px] object-cover" />
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
      return (
        <div className="grid grid-cols-2 gap-3">
          {gallery.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Wedding moment ${index + 1}`}
              className={`${index === 0 ? "col-span-2 h-44" : "h-32"} w-full rounded-[18px] object-cover`}
            />
          ))}
        </div>
      );
    case "gift":
      return <GiftContribution />;
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
    default:
      return null;
  }
}

export default Index;
