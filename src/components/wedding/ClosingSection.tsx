import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const ClosingSection = () => {
  return (
    <section className="py-20 px-6">
      <motion.div
        className="max-w-md mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Heart className="w-6 h-6 text-gold mx-auto mb-6 fill-gold/30" />

        <p className="font-serif text-lg text-muted-foreground leading-relaxed italic mb-8">
          "We thank you from the bottom of our hearts for being part of our special day.
          Your love, prayers, and presence mean the world to us."
        </p>

        <h3 className="font-display text-2xl text-foreground mb-1">Ahmad Farhan & Nur Aisyah</h3>
        <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase font-body mt-4">
          28 June 2025
        </p>

        <div className="section-divider mt-8 mb-6" />

        <p className="text-muted-foreground/50 text-xs font-body">
          Made with ♥ for our special day
        </p>
      </motion.div>
    </section>
  );
};

export default ClosingSection;
