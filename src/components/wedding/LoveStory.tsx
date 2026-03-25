import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const milestones = [
  { year: "2020", title: "First Meeting", desc: "A beautiful coincidence brought our paths together at a friend's gathering." },
  { year: "2022", title: "The Proposal", desc: "Under a sky full of stars, he asked the question that changed everything." },
  { year: "2024", title: "Engagement", desc: "Surrounded by loved ones, we said yes to forever." },
  { year: "2025", title: "Wedding Day", desc: "The day our two hearts officially become one." },
];

const LoveStory = () => {
  return (
    <section className="py-16 px-6">
      <motion.div
        className="max-w-md mx-auto text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-2xl text-foreground mb-2">Our Love Story</h2>
        <p className="font-serif text-muted-foreground italic">the journey that led us here</p>
        <div className="section-divider mt-6" />
      </motion.div>

      <div className="max-w-sm mx-auto relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />

        <div className="space-y-10">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              className="relative pl-14"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {/* Dot */}
              <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-champagne border-2 border-gold/50 flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-gold fill-gold/40" />
              </div>

              <p className="text-gold text-xs font-mono tracking-widest mb-1">{m.year}</p>
              <h3 className="font-display text-lg text-foreground mb-1">{m.title}</h3>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoveStory;
