import { motion } from "framer-motion";
import { Clock, MapPin, Shirt } from "lucide-react";

const events = [
  {
    title: "Akad Nikah",
    subtitle: "Solemnization Ceremony",
    date: "28 June 2025",
    time: "10:00 AM – 11:00 AM",
    venue: "Masjid Al-Hidayah, Shah Alam",
    dress: "White & Cream",
    note: "Close family members only",
  },
  {
    title: "Resepsi",
    subtitle: "Wedding Reception",
    date: "28 June 2025",
    time: "11:30 AM – 4:00 PM",
    venue: "Dewan Seri Melati, Shah Alam",
    dress: "Dusty Pink & Gold",
    note: "All guests are warmly welcomed",
  },
];

const EventDetails = () => {
  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-md mx-auto text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-2xl text-foreground mb-2">Event Itinerary</h2>
        <p className="font-serif text-muted-foreground italic">your flight schedule</p>
        <div className="section-divider mt-6" />
      </motion.div>

      <div className="max-w-md mx-auto space-y-5">
        {events.map((event, i) => (
          <motion.div
            key={event.title}
            className="paper-card p-6"
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <h3 className="font-display text-xl text-foreground mb-1">{event.title}</h3>
            <p className="text-muted-foreground text-xs tracking-wider uppercase mb-4 font-body">{event.subtitle}</p>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-foreground font-body">{event.date}</p>
                  <p className="text-muted-foreground font-body">{event.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <p className="text-foreground font-body">{event.venue}</p>
              </div>
              <div className="flex items-start gap-3">
                <Shirt className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <p className="text-foreground font-body">Dress Code: {event.dress}</p>
              </div>
            </div>

            {event.note && (
              <p className="mt-4 text-muted-foreground text-xs italic font-serif border-t border-border/50 pt-3">
                ✦ {event.note}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default EventDetails;
