import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import coupleHero from "@/assets/couple-hero.jpg";
import gallery1 from "@/assets/couple-gallery-1.jpg";
import gallery2 from "@/assets/couple-gallery-2.jpg";
import gallery3 from "@/assets/couple-gallery-3.jpg";

const photos = [coupleHero, gallery1, gallery2, gallery3];

const PhotoGallery = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-md mx-auto text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-2xl text-foreground mb-2">Our Gallery</h2>
        <p className="font-serif text-muted-foreground italic">moments we treasure</p>
        <div className="section-divider mt-6" />
      </motion.div>

      <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
        {photos.map((src, i) => (
          <motion.div
            key={i}
            className={`rounded-xl overflow-hidden cursor-pointer ${i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(i)}
          >
            <img
              src={src}
              alt={`Gallery photo ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.img
              src={photos[selected]}
              alt="Gallery preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PhotoGallery;
