import { motion } from "framer-motion";
import stampImg from "@/assets/stamp-decoration.png";

const WelcomeSection = () => {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <motion.div
        className="max-w-lg mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase mb-6 font-body">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
          You Are Invited
        </h2>

        <div className="section-divider mb-8" />

        <p className="font-serif text-lg md:text-xl text-muted-foreground leading-relaxed italic mb-6">
          "And among His signs is that He created for you mates from among yourselves,
          that you may dwell in tranquility with them, and He has put love and mercy between your hearts."
        </p>
        <p className="text-muted-foreground text-sm tracking-wider uppercase mb-10 font-body">
          — Ar-Rum 30:21
        </p>

        <p className="font-serif text-lg text-foreground/80 leading-relaxed">
          With gratitude and joy, we invite you to celebrate the beginning of our forever.
          Your presence would be the greatest gift as we embark on this beautiful journey together.
        </p>
      </motion.div>

      {/* Decorative stamp */}
      <motion.img
        src={stampImg}
        alt=""
        loading="lazy"
        width={120}
        height={120}
        className="absolute -right-4 top-16 w-24 h-24 opacity-15 rotate-12"
        initial={{ opacity: 0, rotate: 25 }}
        whileInView={{ opacity: 0.15, rotate: 12 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </section>
  );
};

export default WelcomeSection;
