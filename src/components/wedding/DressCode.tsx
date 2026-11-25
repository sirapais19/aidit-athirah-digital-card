import { useState } from "react";
import { Info, Maximize2 } from "lucide-react";
import lineupImg from "@/assets/Elegant Malay Wedding Party Lineup.png";
import guestsImg from "@/assets/Malay Wedding Guests in Elegant Attire.png";

const attireNote =
  "Wear any colour that makes you feel beautiful! Kami hanya simpan warna putih dan warna wedding squad untuk pengantin & barisan persandingan. Terima kasih kerana menjadi sebahagian daripada hari bahagia kami ♡";

const DressCodePanel = () => {
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <div className="-mx-4 space-y-5">
      <section>
        <p className="px-1 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-[#94a0b8]">
          Panduan pakaian keluarga
        </p>

        <a
          href={lineupImg}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative mt-2 block overflow-hidden rounded-[18px] border border-[#e9dfcb] bg-[#fdf8ec] shadow-sm"
          aria-label="Lihat lineup pakaian keluarga"
        >
          <img
            src={lineupImg}
            alt="Lineup pakaian pengantin, keluarga dan dulang"
            className="h-auto w-full object-contain"
          />
          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#5c6982] shadow-sm">
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </a>
      </section>

      <section>
        <p className="px-1 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-[#94a0b8]">
          Panduan pakaian tetamu
        </p>

        <div className="group relative mt-2 overflow-hidden rounded-[18px] border border-[#e9dfcb] bg-[#fdf8ec] shadow-sm">
          <button
            type="button"
            onClick={() => setNoteOpen((open) => !open)}
            aria-expanded={noteOpen}
            aria-label="Tunjuk nota pakaian tetamu"
            className="block w-full"
          >
            <img
              src={guestsImg}
              alt="Pakaian tetamu dan nota attire"
              className="h-auto w-full object-contain"
            />
          </button>

          <div
            className={`pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-[#2b2620] via-[#2b2620]/60 to-transparent p-3 pb-3.5 text-center transition-opacity duration-300 group-hover:opacity-100 ${
              noteOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="mx-auto max-w-[300px]">
              <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-white/70">
                Nota pakaian · Attire note
              </p>
              <p className="mt-1 font-serif text-[11.5px] leading-relaxed text-white/95">
                {attireNote}
              </p>
            </div>
          </div>

          <a
            href={guestsImg}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#5c6982] shadow-sm"
            aria-label="Lihat nota pakaian tetamu"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </a>

          {!noteOpen && (
            <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-[#5c6982] shadow-sm transition-opacity duration-300 group-hover:opacity-0">
              <Info className="h-2.5 w-2.5" />
              Nota pakaian
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default DressCodePanel;
