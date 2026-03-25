import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const contacts = [
  { side: "Bride's Side", name: "Kak Sarah", phone: "+60123456789" },
  { side: "Groom's Side", name: "Abang Hafiz", phone: "+60198765432" },
];

const ContactSection = () => {
  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-md mx-auto text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-2xl text-foreground mb-2">Contact Us</h2>
        <p className="font-serif text-muted-foreground italic">for any enquiries</p>
        <div className="section-divider mt-6" />
      </motion.div>

      <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
        {contacts.map((c, i) => (
          <motion.div
            key={c.name}
            className="paper-card p-5 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body mb-2">{c.side}</p>
            <p className="font-display text-base text-foreground mb-3">{c.name}</p>
            <a
              href={`https://wa.me/${c.phone.replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-xs font-body text-foreground
                         hover:bg-gold/20 transition-colors"
            >
              <Phone className="w-3 h-3 text-gold" />
              WhatsApp
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ContactSection;
