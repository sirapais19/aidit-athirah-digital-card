import { motion } from "framer-motion";
import { Plane, Heart } from "lucide-react";

const BoardingPass = () => {
  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-display text-2xl text-center text-foreground mb-2">Boarding Pass</h2>
        <div className="section-divider mb-8" />

        <div className="boarding-pass">
          {/* Header */}
          <div className="bg-passport-navy px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-gold" />
              <span className="text-gold text-xs font-mono tracking-widest uppercase">Love Airlines</span>
            </div>
            <span className="text-gold/60 text-xs font-mono">FLIGHT LV-2025</span>
          </div>

          {/* Main content */}
          <div className="p-5">
            {/* Route */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-left">
                <p className="font-mono text-2xl font-bold text-foreground">SGL</p>
                <p className="text-muted-foreground text-xs font-body mt-1">Single Life</p>
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full relative flex items-center">
                  <div className="flex-1 border-t border-dashed border-gold/40" />
                  <Heart className="w-5 h-5 text-gold mx-2 fill-gold/30" />
                  <div className="flex-1 border-t border-dashed border-gold/40" />
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-foreground">MRD</p>
                <p className="text-muted-foreground text-xs font-body mt-1">Married Life</p>
              </div>
            </div>

            {/* Perforated line */}
            <div className="perforated-edge h-3 -mx-5 mb-5" />

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body">Passenger</p>
                <p className="font-mono text-sm text-foreground mt-0.5">Dear Guest</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body">Date</p>
                <p className="font-mono text-sm text-foreground mt-0.5">28 JUN 2025</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body">Boarding Time</p>
                <p className="font-mono text-sm text-foreground mt-0.5">11:00 AM</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body">Gate</p>
                <p className="font-mono text-sm text-foreground mt-0.5">Dewan Seri Melati</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body">Seat</p>
                <p className="font-mono text-sm text-foreground mt-0.5">VIP</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body">Flight No.</p>
                <p className="font-mono text-sm text-foreground mt-0.5">AF ♥ NA</p>
              </div>
            </div>

            {/* Barcode placeholder */}
            <div className="mt-4 pt-4 border-t border-dashed border-border">
              <div className="flex gap-[2px] justify-center">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-foreground/70 rounded-sm"
                    style={{
                      width: Math.random() > 0.5 ? 2 : 1,
                      height: 28 + Math.random() * 8,
                    }}
                  />
                ))}
              </div>
              <p className="text-center text-muted-foreground text-[10px] font-mono mt-2 tracking-widest">
                LV 2025 0628 FOREVER
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default BoardingPass;
