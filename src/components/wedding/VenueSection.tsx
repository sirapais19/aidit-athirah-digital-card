import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import venueImg from "@/assets/venue.jpg";

const VenueSection = () => {
  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-md mx-auto text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-2xl text-foreground mb-2">Destination</h2>
        <p className="font-serif text-muted-foreground italic">where love lands</p>
        <div className="section-divider mt-6" />
      </motion.div>

      <motion.div
        className="max-w-md mx-auto paper-card overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <img src={venueImg} alt="Wedding venue" loading="lazy" width={600} height={400} className="w-full h-48 object-cover" />
        <div className="p-6 text-center">
          <h3 className="font-display text-xl text-foreground mb-2">Dewan Seri Melati</h3>
          <div className="flex items-start justify-center gap-2 mb-6">
            <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <p className="text-muted-foreground text-sm font-body">
              Jalan Kristal 7/20, Seksyen 7,<br />
              40000 Shah Alam, Selangor
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gold/10 border border-gold/30 rounded-full text-sm font-body text-foreground
                         hover:bg-gold/20 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-gold" />
              Google Maps
            </a>
            <a
              href="https://waze.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gold/10 border border-gold/30 rounded-full text-sm font-body text-foreground
                         hover:bg-gold/20 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-gold" />
              Waze
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default VenueSection;
