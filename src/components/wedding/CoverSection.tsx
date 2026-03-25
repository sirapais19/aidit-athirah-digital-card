import { motion } from "framer-motion";
import { Plane } from "lucide-react";

interface CoverSectionProps {
  onOpen: () => void;
  guestName?: string;
}

const CoverSection = ({ onOpen, guestName }: CoverSectionProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center passport-cover"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative border */}
      <div className="absolute inset-4 md:inset-12 border border-gold/30 rounded-3xl pointer-events-none" />
      <div className="absolute inset-6 md:inset-14 border border-gold/15 rounded-2xl pointer-events-none" />

      <motion.div
        className="text-center px-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {/* Passport emblem */}
        <motion.div
          className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-gold/50 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Plane className="w-8 h-8 text-gold" />
        </motion.div>

        <motion.p
          className="text-gold-light/60 text-xs tracking-[0.4em] uppercase mb-6 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Wedding Invitation
        </motion.p>

        <motion.h1
          className="font-display text-4xl md:text-5xl text-gold-light mb-3 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Ahmad Farhan
        </motion.h1>

        <motion.div
          className="text-gold/60 font-serif text-2xl italic my-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          &
        </motion.div>

        <motion.h1
          className="font-display text-4xl md:text-5xl text-gold-light mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          Nur Aisyah
        </motion.h1>

        <motion.p
          className="font-serif text-lg text-gold-light/80 italic mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          "Our Journey to Forever"
        </motion.p>

        <motion.p
          className="text-gold-light/50 text-sm tracking-[0.2em] uppercase mb-10 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          28 . 06 . 2025
        </motion.p>

        {guestName && (
          <motion.p
            className="text-gold-light/70 text-sm mb-6 font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            Dear <span className="font-serif text-lg text-gold-light italic">{guestName}</span>,
            <br />you are cordially invited
          </motion.p>
        )}

        <motion.button
          onClick={onOpen}
          className="px-8 py-3.5 border border-gold/50 text-gold-light rounded-full font-body text-sm tracking-widest uppercase
                     hover:bg-gold/10 transition-all duration-500 animate-pulse-gold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Open Invitation
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CoverSection;
