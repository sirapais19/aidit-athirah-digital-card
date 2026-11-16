import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Camera,
  Check,
  Coffee,
  CookingPot,
  Gift as GiftIcon,
  Heart,
  Luggage,
  Search,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type GiftMode = "group" | "reserve" | "cash";

type RegistryRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  target_amount: number | string;
  collected_amount?: number | string | null;
  quantity?: number | string | null;
  reserved_count?: number | string | null;
  gift_mode?: string | null;
  sort_order?: number | null;
};

type Gift = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  target: number;
  collected: number;
  quantity: number;
  reserved: number;
  giftMode: GiftMode;
  sortOrder: number;
  progress: number;
  isFunded: boolean;
  remaining: number;
};

type ReservationSuccess = {
  giftTitle: string;
  amount: number;
  name: string;
  method: string;
};

const iconMap: Record<string, typeof GiftIcon> = {
  coffee: Coffee,
  plate: UtensilsCrossed,
  blender: CookingPot,
  bed: BedDouble,
  luggage: Luggage,
  camera: Camera,
  sparkles: Sparkles,
  gift: GiftIcon,
};

const currency = new Intl.NumberFormat("ms-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

const modeLabel = (mode: GiftMode) =>
  mode === "cash" ? "Cash gift" : mode === "reserve" ? "Reserve gift" : "Group gift";

const statusLabel = (gift: Gift) => {
  if (gift.isFunded) return "Fully funded";
  if (gift.progress >= 70) return "Almost there";
  return "Available";
};

const normalizeRow = (row: RegistryRow): Gift => {
  const target = Math.max(0, Number(row.target_amount) || 0);
  const collected = Math.max(0, Number(row.collected_amount) || 0);
  const quantity = Math.max(1, Number(row.quantity) || 1);
  const reserved = Math.max(0, Number(row.reserved_count) || 0);
  const giftMode: GiftMode =
    row.gift_mode === "cash" || row.gift_mode === "reserve" ? row.gift_mode : "group";
  const progress =
    giftMode === "reserve"
      ? Math.min(100, Math.round((reserved / quantity) * 100))
      : target > 0
        ? Math.min(100, Math.round((collected / target) * 100))
        : 0;
  const isFunded =
    giftMode === "reserve" ? reserved >= quantity : target > 0 && collected >= target;

  return {
    id: row.id,
    title: row.title,
    description: row.description || "A little wish for our new home.",
    category: row.category || "Gift",
    icon: row.icon || "gift",
    target,
    collected,
    quantity,
    reserved,
    giftMode,
    sortOrder: Number(row.sort_order) || 0,
    progress,
    isFunded,
    remaining: Math.max(0, target - collected),
  };
};

const GiftRegistry = ({ paymentUrl }: { paymentUrl: string }) => {
  const [rows, setRows] = useState<RegistryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"popular" | "low" | "high">("popular");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"TnG" | "QR">("TnG");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reservation, setReservation] = useState<ReservationSuccess | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");

    const loadRegistry = async () => {
      const { data, error } = await supabase.rpc("get_gift_registry");

      if (!active) return;

      if (!error && data) {
        setRows(data as RegistryRow[]);
        setLoading(false);
        return;
      }

      console.error("Gift registry RPC failed:", error?.message);

      // Fallback for projects that have not run gift_registry.sql yet.
      const { data: legacy, error: legacyError } = await supabase
        .from("gift_items")
        .select("id, title, target_amount, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!active) return;

      if (legacyError) {
        console.error("Failed to load gift items:", legacyError.message);
        setLoadError("Gift registry is temporarily unavailable. Please try again later.");
      } else {
        setRows(
          (legacy ?? []).map((item) => ({
            ...item,
            description: null,
            category: "Gift",
            icon: "gift",
            collected_amount: 0,
            quantity: 1,
            reserved_count: 0,
            gift_mode: "group",
          })) as RegistryRow[],
        );
      }
      setLoading(false);
    };

    void loadRegistry();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const gifts = useMemo(() => rows.map(normalizeRow), [rows]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(gifts.map((gift) => gift.category)))],
    [gifts],
  );

  useEffect(() => {
    if (!categories.includes(category)) setCategory("All");
  }, [categories, category]);

  const filteredGifts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = gifts.filter((gift) => {
      const matchesCategory = category === "All" || gift.category === category;
      const haystack = `${gift.title} ${gift.description} ${gift.category}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });

    if (sort === "low") return [...list].sort((a, b) => a.target - b.target);
    if (sort === "high") return [...list].sort((a, b) => b.target - a.target);
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [gifts, category, search, sort]);

  const totalCollected = gifts.reduce((sum, gift) => sum + gift.collected, 0);
  const totalRemaining = gifts.reduce((sum, gift) => sum + gift.remaining, 0);
  const selected = gifts.find((gift) => gift.id === selectedId) ?? null;

  const maximum = selected
    ? selected.giftMode === "reserve"
      ? selected.target
      : selected.remaining || selected.target
    : 0;

  const closeModal = () => {
    setSelectedId(null);
    setReservation(null);
    setSubmitError("");
  };

  useEffect(() => {
    if (!selectedId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(null);
        setReservation(null);
        setSubmitError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId]);

  const openGift = (gift: Gift) => {
    setSelectedId(gift.id);
    setAmount(gift.giftMode === "reserve" ? gift.target : gift.remaining || gift.target);
    setGuestName("");
    setMessage("");
    setPaymentMethod("TnG");
    setSubmitError("");
    setReservation(null);
  };

  const applyPreset = (value: number | "full") => {
    if (!selected) return;
    setAmount(value === "full" ? maximum : Math.min(value, maximum));
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setAmount(Number.isFinite(next) ? Math.max(1, Math.min(next, maximum)) : 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;

    const safeAmount = Math.max(1, Math.min(Number(amount) || 0, maximum));
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.from("gift_reservations").insert({
      gift_item_id: selected.id,
      guest_name: guestName.trim() || "Tetamu",
      amount: safeAmount,
      message: message.trim() || null,
      payment_method: paymentMethod,
      status: "confirmed",
    });

    if (error) {
      console.error("Failed to save gift reservation:", error.message);
      setSubmitError("Tempahan gagal dihantar. Sila cuba lagi.");
      setSubmitting(false);
      return;
    }

    setReservation({
      giftTitle: selected.title,
      amount: safeAmount,
      name: guestName.trim() || "Tetamu",
      method: paymentMethod,
    });
    setSubmitting(false);
    setRefreshKey((key) => key + 1);
  };

  if (loading) {
    return (
      <div className="-mx-1 space-y-3 rounded-[24px] border border-white/70 bg-[#f9f7f1] p-4">
        <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-[#e4dccb]" />
        <div className="mt-4 h-24 animate-pulse rounded-[16px] bg-white/70" />
        <div className="h-24 animate-pulse rounded-[16px] bg-white/70" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="-mx-1 rounded-[24px] border border-white/70 bg-[#f9f7f1] p-6 text-center">
        <p className="text-sm text-slate-600">{loadError}</p>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="mt-3 text-xs font-medium text-[#72809c] underline underline-offset-4"
        >
          Cuba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="-mx-1 rounded-[24px] border border-white/70 bg-[#f9f7f1] p-3.5">
      <div className="text-center">
        <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-[#a29a8a]">
          Baggage claim · Gift registry
        </p>
        <h3 className="mt-1 font-display text-[1.7rem] leading-none text-slate-700">
          Tagged with love
        </h3>
        <p className="mt-1.5 font-serif text-[13px] italic text-slate-500">
          Collect moments, not things
        </p>
        <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-[#c9a86a]/70 to-transparent" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-[#e4dccb] bg-white/70 px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#72809c]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari hadiah..."
            className="w-full bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-[#b0a792]"
          />
        </label>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as "popular" | "low" | "high")}
          className="shrink-0 rounded-full border border-[#e4dccb] bg-white/70 px-2 py-2 font-mono text-[7px] text-[#5c6982] outline-none"
          aria-label="Susun hadiah"
        >
          <option value="popular">Popular</option>
          <option value="low">Harga rendah</option>
          <option value="high">Harga tinggi</option>
        </select>
      </div>

      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full border px-2.5 py-1.5 font-mono text-[6.5px] tracking-[0.06em] transition-colors ${
              category === item
                ? "border-[#72809c] bg-[#72809c] text-white"
                : "border-[#e4dccb] bg-white/60 text-[#8a8170]"
            }`}
          >
            {item === "All" ? "Semua" : item}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 border-y border-[#e4dccb] py-2">
        <div className="text-center">
          <p className="font-display text-[15px] leading-none text-[#5c6982]">{gifts.length}</p>
          <p className="mt-1 font-mono text-[5.5px] uppercase tracking-[0.13em] text-[#a29a8a]">
            Hadiah
          </p>
        </div>
        <div className="text-center">
          <p className="font-display text-[15px] leading-none text-[#5c6982]">
            {currency.format(totalCollected)}
          </p>
          <p className="mt-1 font-mono text-[5.5px] uppercase tracking-[0.13em] text-[#a29a8a]">
            Terkumpul
          </p>
        </div>
        <div className="text-center">
          <p className="font-display text-[15px] leading-none text-[#5c6982]">
            {currency.format(totalRemaining)}
          </p>
          <p className="mt-1 font-mono text-[5.5px] uppercase tracking-[0.13em] text-[#a29a8a]">
            Baki
          </p>
        </div>
      </div>

      {gifts.length === 0 ? (
        <div className="mt-4 rounded-[16px] border border-dashed border-[#e4dccb] px-4 py-8 text-center">
          <GiftIcon className="mx-auto h-7 w-7 text-[#72809c]/60" />
          <p className="mt-2 font-serif text-sm italic text-slate-500">
            Senarai hadiah akan tersedia tidak lama lagi.
          </p>
        </div>
      ) : filteredGifts.length === 0 ? (
        <div className="mt-4 rounded-[16px] border border-dashed border-[#e4dccb] px-4 py-8 text-center">
          <Search className="mx-auto h-7 w-7 text-[#72809c]/60" />
          <p className="mt-2 font-serif text-sm italic text-slate-500">
            Tiada hadiah dijumpai. Cuba search atau filter lain.
          </p>
        </div>
      ) : (
        <div className="relative mt-4 pl-1">
          <div className="pointer-events-none absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-transparent via-[#d3c5ad] to-transparent" />

          <div className="space-y-4">
            {filteredGifts.map((gift, index) => {
              const Icon = iconMap[gift.icon] ?? GiftIcon;
              const isEven = index % 2 === 0;
              return (
                <motion.article
                  key={gift.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                  className={`relative w-[calc(100%-1rem)] rounded-[11px] border border-[#dccfb8] bg-gradient-to-b from-[#fdf8ec] to-[#f5edda] shadow-[0_10px_22px_rgba(120,100,70,0.1)] ${
                    isEven
                      ? "ml-4 -rotate-[0.6deg]"
                      : "ml-8 w-[calc(100%-2rem)] rotate-[0.7deg]"
                  }`}
                >
                  <span className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-[#c9b99d] bg-[#f9f7f1] shadow-inner" />
                  <span className="absolute -left-3 top-1/2 h-px w-3 bg-[#d3c5ad]" />

                  <div className="grid grid-cols-[56px_1fr] gap-2.5 p-3 pl-5">
                    <div className="flex flex-col items-center justify-center border-r border-dashed border-[#dccfb8] pr-2">
                      <Icon className="h-6 w-6 text-[#a8895e]" />
                      <span className="mt-1.5 text-center font-mono text-[6px] uppercase tracking-[0.1em] text-[#a8987b]">
                        {gift.category}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="rounded-[3px] border border-[#dccfb8] px-1 py-0.5 font-mono text-[5.5px] uppercase tracking-[0.07em] text-[#a8895e]">
                          {modeLabel(gift.giftMode)}
                        </span>
                        <span
                          className={`rounded-[3px] border px-1 py-0.5 font-mono text-[5.5px] uppercase tracking-[0.05em] ${
                            gift.isFunded
                              ? "border-emerald-700/20 bg-emerald-50 text-emerald-700"
                              : "border-[#dccfb8] text-[#8a8170]"
                          }`}
                        >
                          {statusLabel(gift)}
                        </span>
                      </div>

                      <h4 className="mt-1 font-display text-[16px] leading-tight text-slate-700">
                        {gift.title}
                      </h4>
                      <p className="mt-0.5 font-serif text-[12.5px] italic leading-snug text-slate-500">
                        {gift.description}
                      </p>

                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#ece5d7]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#72809c] to-[#c9a86a]"
                          initial={false}
                          animate={{ width: `${gift.progress}%` }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between gap-2 font-mono text-[6px] text-[#a29a8a]">
                        <span>
                          <b className="font-semibold text-[#5c6982]">
                            {currency.format(gift.collected)}
                          </b>{" "}
                          collected
                        </span>
                        <span>
                          {gift.isFunded ? "Goal reached" : `${currency.format(gift.remaining)} left`}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-[#dccfb8] pt-2">
                        <span className="font-mono text-[5.5px] uppercase tracking-[0.08em] text-[#a8987b]">
                          {gift.giftMode === "reserve"
                            ? `${gift.reserved} / ${gift.quantity} reserved`
                            : `${gift.reserved} guests`}
                        </span>
                        <button
                          type="button"
                          onClick={() => openGift(gift)}
                          disabled={gift.isFunded}
                          className="rounded-full bg-[#b79a6a] px-3 py-1.5 font-mono text-[6px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#a8895e] disabled:bg-[#ddd5c5] disabled:text-[#a29a8a]"
                        >
                          {gift.isFunded ? "Fully funded" : gift.giftMode === "cash" ? "Sumbang" : "Tempah"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-4 border-t border-dashed border-[#e4dccb] pt-3 text-center font-serif text-[11.5px] italic leading-relaxed text-[#9a9182]">
        Tempah hadiah yang anda suka, dan kami akan tag ia dengan nama anda dalam buku kenangan
        kami.
      </p>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/55 backdrop-blur-sm sm:items-center sm:p-4"
                onClick={closeModal}
              >
                <motion.div
                  initial={{ y: 30, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 24, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  onClick={(event) => event.stopPropagation()}
                  className="relative max-h-[92svh] w-full max-w-[420px] overflow-y-auto rounded-t-[28px] border border-white/80 bg-[#f9f7f1] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]"
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-500"
                    aria-label="Tutup"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {reservation ? (
                    <div className="pt-1 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                        <Check className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 font-display text-2xl text-slate-700">
                        Tempahan diterima!
                      </h3>
                      <p className="mx-auto mt-2 max-w-[300px] font-serif text-sm italic leading-relaxed text-slate-500">
                        {reservation.name}, tempahan <b>{reservation.giftTitle}</b> sebanyak{" "}
                        <b>{currency.format(reservation.amount)}</b> melalui {reservation.method}{" "}
                        telah diterima. Pengantin akan mengesahkan tidak lama lagi.
                      </p>

                      <div className="mt-4 rounded-[18px] border border-[#e4dccb] bg-white/70 p-4 text-left">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                          Bayar sekarang
                        </p>
                        <a
                          href={paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 flex min-h-11 items-center justify-center rounded-full bg-[#72809c] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#64728e]"
                        >
                          Buka pautan Touch ’n Go
                        </a>
                        <a
                          href={paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block"
                        >
                          <img
                            src="/duitnow-qr.png"
                            alt="DuitNow QR code untuk bayaran"
                            className="mx-auto block h-auto w-full max-w-[220px] rounded-[14px]"
                          />
                        </a>
                        <p className="mt-2 text-center font-serif text-[11px] italic text-slate-400">
                          Selepas bayar, pengantin akan sahkan tempahan anda.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={closeModal}
                        className="mt-4 w-full rounded-full bg-[#72809c] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#64728e]"
                      >
                        Selesai
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-400">
                        Tempahan hadiah
                      </p>
                      <h3 className="mt-1 font-display text-2xl text-slate-700">
                        {selected.giftMode === "cash" ? "Sumbang hadiah" : "Tempah hadiah"}
                      </h3>

                      <div className="mt-3 flex items-center gap-3 rounded-[16px] border border-[#e4dccb] bg-white/60 p-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#e9e0d0] to-[#c9bfa8] text-[#a8895e]">
                          {(() => {
                            const Icon = iconMap[selected.icon] ?? GiftIcon;
                            return <Icon className="h-6 w-6" />;
                          })()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-[16px] leading-tight text-slate-700">
                            {selected.title}
                          </p>
                          <p className="mt-0.5 font-serif text-[12.5px] italic leading-snug text-slate-500">
                            {selected.description}
                          </p>
                          <span className="mt-1 inline-block rounded-[3px] border border-[#dccfb8] px-1 py-0.5 font-mono text-[5.5px] uppercase tracking-[0.07em] text-[#a8895e]">
                            {modeLabel(selected.giftMode)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#ece5d7]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#72809c] to-[#c9a86a]"
                          style={{ width: `${selected.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[6px] text-[#a29a8a]">
                        <span>
                          {currency.format(selected.collected)} collected
                        </span>
                        <span>
                          {selected.isFunded
                            ? "Goal reached"
                            : `${currency.format(selected.remaining)} left`}
                        </span>
                      </div>

                      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                        <label className="block">
                          <span className="mb-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
                            {selected.giftMode === "reserve"
                              ? "Harga hadiah"
                              : "Jumlah tempahan / sumbangan"}
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={maximum}
                            value={amount}
                            onChange={handleAmountChange}
                            readOnly={selected.giftMode === "reserve"}
                            className="w-full rounded-[10px] border border-[#e4dccb] bg-white/80 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#72809c]"
                            required
                          />
                          {selected.giftMode !== "reserve" && (
                            <div className="mt-1.5 flex gap-1.5">
                              {[50, 100, 250].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => applyPreset(value)}
                                  className="flex-1 rounded-full border border-[#e4dccb] bg-white/60 px-1 py-1.5 font-mono text-[6.5px] text-[#5c6982] transition-colors hover:bg-white"
                                >
                                  RM{value}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => applyPreset("full")}
                                className="flex-1 rounded-full border border-[#e4dccb] bg-white/60 px-1 py-1.5 font-mono text-[6.5px] text-[#5c6982] transition-colors hover:bg-white"
                              >
                                Penuh
                              </button>
                            </div>
                          )}
                        </label>

                        <label className="block">
                          <span className="mb-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
                            Nama anda
                          </span>
                          <input
                            value={guestName}
                            onChange={(event) => setGuestName(event.target.value)}
                            placeholder="Contoh: Pakcik Din & Keluarga"
                            className="w-full rounded-[10px] border border-[#e4dccb] bg-white/80 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-[#b0a792] focus:border-[#72809c]"
                            required
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
                            Ucapan &amp; doa (pilihan)
                          </span>
                          <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            rows={2}
                            placeholder="Tahniah pengantin baru..."
                            className="w-full resize-none rounded-[10px] border border-[#e4dccb] bg-white/80 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-[#b0a792] focus:border-[#72809c]"
                          />
                        </label>

                        <fieldset>
                          <span className="mb-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#9a9182]">
                            Cara bayaran
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(["TnG", "QR"] as const).map((method) => (
                              <label
                                key={method}
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[6.5px] transition-colors ${
                                  paymentMethod === method
                                    ? "border-[#72809c] bg-[#72809c] text-white"
                                    : "border-[#e4dccb] bg-white/60 text-[#5c6982]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="payment"
                                  className="sr-only"
                                  checked={paymentMethod === method}
                                  onChange={() => setPaymentMethod(method)}
                                />
                                {method === "TnG" ? "Touch ’n Go" : "DuitNow QR"}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {submitError && (
                          <p
                            role="alert"
                            className="rounded-[10px] bg-rose-50 px-3 py-2 text-center text-xs text-rose-700"
                          >
                            {submitError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#72809c] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#64728e] disabled:opacity-70"
                        >
                          {submitting ? "Sedang hantar..." : "Hantar tempahan"}
                        </button>

                        <p className="text-center font-serif text-[11px] italic leading-relaxed text-slate-400">
                          Tempahan akan disahkan oleh pengantin selepas bayaran diterima.
                        </p>
                      </form>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default GiftRegistry;
