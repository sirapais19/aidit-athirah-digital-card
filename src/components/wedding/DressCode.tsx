import { Maximize2 } from "lucide-react";
import lineupImg from "@/assets/Elegant Malay Wedding Party Lineup.png";
import guestsImg from "@/assets/Malay Wedding Guests in Elegant Attire.png";

const DressCodePanel = () => (
  <div className="-mx-1 rounded-[24px] border border-white/70 bg-[#f9f7f1] p-3.5">
    <p className="text-center font-mono text-[7px] uppercase tracking-[0.18em] text-[#94a0b8]">
      Panduan pakaian keluarga
    </p>

    <div className="mt-3 rounded-[16px] border border-[#e4dccb] bg-gradient-to-b from-[#fdf8ec] to-[#f6eddd] p-2">
      <a
        href={lineupImg}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block overflow-hidden rounded-[10px] border border-[#e9dfcb] bg-[#fdf8ec]"
        aria-label="Lihat lineup pakaian keluarga"
      >
        <img
          src={lineupImg}
          alt="Lineup pakaian pengantin, keluarga dan dulang"
          className="h-auto w-full object-contain"
        />
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-[#5c6982] shadow-sm">
          <Maximize2 className="h-3 w-3" />
        </span>
      </a>

      <p className="mt-4 text-center font-mono text-[7px] uppercase tracking-[0.18em] text-[#94a0b8]">
        Panduan pakaian tetamu
      </p>

      <a
        href={guestsImg}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-2 block overflow-hidden rounded-[10px] border border-[#e9dfcb] bg-[#fdf8ec]"
        aria-label="Lihat nota pakaian tetamu"
      >
        <img
          src={guestsImg}
          alt="Pakaian tetamu dan nota attire"
          className="h-auto w-full object-contain"
        />
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-[#5c6982] shadow-sm">
          <Maximize2 className="h-3 w-3" />
        </span>
      </a>
    </div>
  </div>
);

export default DressCodePanel;
