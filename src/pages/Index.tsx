import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Copy,
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
import weddingSong from "@/assets/boarding-pass-to-forever.mp3";

type InfoKey = "calendar" | "location" | "rsvp" | "gallery" | "gift" | "contact";

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

const giftWishlist = [
  { id: "microwave-tjean", title: "Microwave TJean", target: 500, collected: 0 },
];

const giftBankAccount = {
  bank: "Maybank",
  account: "151146857958",
  name: "Aidit",
};

const contacts = [
  { side: "Bride's Side", name: "Kak Sarah", phone: "+60123456789" },
  { side: "Groom's Side", name: "Abang Hafiz", phone: "+60198765432" },
];

const calendarDetails = "20261224T030000Z/20261224T080000Z";
const calendarText = encodeURIComponent("Aidit & Athirah Wedding Reception");
const calendarLocation = encodeURIComponent("Moara Hall, Kota Bharu, Kelantan");
const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarText}&dates=${calendarDetails}&location=${calendarLocation}`;
const mapUrl = "https://maps.app.goo.gl/Q6LWt8rn2ERBBBbr5";
const weddingDateMs = new Date("2026-12-24T11:00:00+08:00").getTime();
const rsvpStorageKey = "forever-pass-rsvp-wishes-v2";
const giftStorageKey = "forever-pass-gift-contributions-v2";

const barcodeBars = Array.from({ length: 38 }, (_, index) => ({
  width: index % 4 === 0 || index % 9 === 0 ? 2 : 1,
  height: 18 + ((index * 5) % 18),
}));

const Index = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [guestName, setGuestName] = useState("Dear Guest");
  const [isOpen, setIsOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState<InfoKey | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>([]);

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

  useEffect(() => {
    window.localStorage.removeItem("forever-pass-rsvp-wishes");
    window.localStorage.removeItem("forever-pass-rsvp-wishes-reset");
    const saved = window.localStorage.getItem(rsvpStorageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as RsvpEntry[];
      if (Array.isArray(parsed)) setRsvpEntries(parsed);
    } catch {
      setRsvpEntries([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(rsvpStorageKey, JSON.stringify(rsvpEntries));
  }, [rsvpEntries]);

  const addRsvpEntry = (entry: RsvpEntry) => {
    setRsvpEntries((current) => [entry, ...current]);
    setSubmitted(true);
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
                    .filter((card) => card.id === "gift" || card.id === "contact")
                    .map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setActiveInfo(card.id)}
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
                <div className="mt-5 rounded-[24px] bg-[#72809c] p-5 text-white">
                  <p className="font-serif text-lg italic leading-relaxed text-white/90">
                    Dear family and friends, we invite you to celebrate the beginning of our
                    forever. Your presence and prayers are the most meaningful gift.
                  </p>
                </div>
                <Timeline />
                <button
                  type="button"
                  onClick={() => setActiveInfo("contact")}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-[22px] bg-[#72809c] px-5 py-4 text-white transition-colors hover:bg-[#66738d]"
                >
                  <Phone className="h-5 w-5" />
                  Contact Family
                </button>
                <GuestWishes entries={rsvpEntries} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

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

const GuestWishes = ({ entries }: { entries: RsvpEntry[] }) => (
  <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Guest Wishes
        </p>
        <h2 className="mt-1 font-display text-2xl text-slate-700">From Our Guests</h2>
      </div>
      <Heart className="h-5 w-5 fill-[#72809c]/20 text-[#72809c]" />
    </div>

    {entries.length > 0 ? (
      <div className="space-y-3">
        {entries.slice(0, 5).map((entry, index) => (
          <article key={`${entry.name}-${index}`} className="rounded-[18px] bg-[#f4f6fb] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg text-slate-700">{entry.name}</p>
              <span className="rounded-full bg-[#72809c] px-3 py-1 text-[10px] font-medium text-white">
                {entry.attendance}
              </span>
            </div>
            <p className="mt-2 font-serif text-base italic leading-relaxed text-slate-600">
              "{entry.wishes || "Sending love and prayers for your beautiful day."}"
            </p>
          </article>
        ))}
      </div>
    ) : (
      <p className="rounded-[18px] bg-[#f4f6fb] p-4 font-serif text-base italic leading-relaxed text-slate-500">
        Wishes from guests will appear here after they submit the RSVP form.
      </p>
    )}
  </section>
);

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

type Contribution = {
  itemId: string;
  name: string;
  amount: number;
};

type RsvpEntry = {
  name: string;
  attendance: string;
  wishes: string;
};

const currency = new Intl.NumberFormat("ms-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

const GiftContribution = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedItem, setSelectedItem] = useState(giftWishlist[0].id);
  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState(100);
  const [giftSubmitted, setGiftSubmitted] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);

  useEffect(() => {
    window.localStorage.removeItem("forever-pass-gift-contributions");
    window.localStorage.removeItem("forever-pass-gift-contributions-reset");
    const saved = window.localStorage.getItem(giftStorageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Contribution[];
      if (Array.isArray(parsed)) setContributions(parsed);
    } catch {
      setContributions([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(giftStorageKey, JSON.stringify(contributions));
  }, [contributions]);

  const wishlistWithTotals = giftWishlist.map((item) => {
    const extra = contributions
      .filter((contribution) => contribution.itemId === item.id)
      .reduce((sum, contribution) => sum + contribution.amount, 0);
    const total = item.collected + extra;
    const progress = Math.min(100, Math.round((total / item.target) * 100));
    return { ...item, total, progress };
  });

  const selectedGift = wishlistWithTotals.find((item) => item.id === selectedItem) ?? wishlistWithTotals[0];
  const remaining = Math.max(0, selectedGift.target - selectedGift.total);
  const maxContribution = Math.max(50, Math.min(1000, remaining || selectedGift.target));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeAmount = Math.max(1, Math.min(amount, remaining || amount));
    setContributions((current) => [
      ...current,
      {
        itemId: selectedGift.id,
        name: contributorName.trim() || "Guest",
        amount: safeAmount,
      },
    ]);
    setContributorName("");
    setAmount(100);
    setGiftSubmitted(true);
    window.setTimeout(() => setGiftSubmitted(false), 2200);
  };

  const copyAccount = () => {
    navigator.clipboard?.writeText(giftBankAccount.account);
    setAccountCopied(true);
    window.setTimeout(() => setAccountCopied(false), 1800);
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

      <div className="rounded-[22px] bg-white/70 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Transfer Details
            </p>
            <h3 className="mt-2 font-display text-2xl text-slate-700">{giftBankAccount.bank}</h3>
            <p className="mt-1 text-sm text-slate-500">{giftBankAccount.name}</p>
          </div>
          <Gift className="h-8 w-8 text-[#72809c]" />
        </div>

        <div className="mt-4 rounded-[18px] bg-white p-4">
          <p className="font-mono text-xl tracking-[0.08em] text-slate-700">
            {giftBankAccount.account}
          </p>
          <button
            type="button"
            onClick={copyAccount}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Copy className="h-3.5 w-3.5" />
            {accountCopied ? "Copied" : "Copy account"}
          </button>
        </div>

        <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-white/60 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            DuitNow QR
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Send me the QR image file and I can place the exact scannable QR here.
          </p>
        </div>
      </div>

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

        {giftSubmitted && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
            Thank you. Your contribution has been added.
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
  const [wishes, setWishes] = useState("");

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
        onChange={(event) => setAttendance(event.target.value)}
        className="w-full rounded-xl border-0 bg-white/70 px-4 py-3 text-sm outline-none"
      >
        <option>Attending</option>
        <option>Maybe</option>
        <option>Unable to attend</option>
      </select>
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
            Kota Bharu, Kelantan.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm font-medium"
            >
              <Navigation className="h-4 w-4" />
              Open Map
            </a>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm font-medium"
            >
              <Navigation className="h-4 w-4" />
              Maps
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
