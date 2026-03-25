import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Check } from "lucide-react";

const RSVPSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    attendance: "yes",
    pax: "1",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="rsvp" className="py-16 px-4">
      <motion.div
        className="max-w-md mx-auto text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-2xl text-foreground mb-2">RSVP</h2>
        <p className="font-serif text-muted-foreground italic">confirm your attendance</p>
        <div className="section-divider mt-6" />
      </motion.div>

      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="paper-card p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div>
                <label className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-body text-foreground
                             focus:outline-none focus:ring-1 focus:ring-gold/50 transition-shadow"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-body text-foreground
                             focus:outline-none focus:ring-1 focus:ring-gold/50 transition-shadow"
                  placeholder="012-345 6789"
                />
              </div>

              <div>
                <label className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body block mb-1.5">Attendance</label>
                <div className="flex gap-3">
                  {["yes", "maybe", "no"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm({ ...form, attendance: opt })}
                      className={`flex-1 py-2 rounded-lg text-sm font-body capitalize border transition-all ${
                        form.attendance === opt
                          ? "bg-gold/15 border-gold/40 text-foreground"
                          : "bg-background border-border text-muted-foreground hover:border-gold/30"
                      }`}
                    >
                      {opt === "yes" ? "Attending" : opt === "maybe" ? "Maybe" : "Unable"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body block mb-1.5">Number of Guests</label>
                <select
                  value={form.pax}
                  onChange={(e) => setForm({ ...form, pax: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-body text-foreground
                             focus:outline-none focus:ring-1 focus:ring-gold/50"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-body block mb-1.5">Wishes & Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-body text-foreground resize-none
                             focus:outline-none focus:ring-1 focus:ring-gold/50"
                  placeholder="Write your wishes for the couple..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-passport-navy text-gold rounded-xl font-body text-sm tracking-widest uppercase
                           hover:bg-passport-navy-light transition-colors"
              >
                Send RSVP
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              className="paper-card p-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">Thank You!</h3>
              <p className="font-serif text-muted-foreground italic">
                Your RSVP has been received. We look forward to celebrating with you!
              </p>
              <Heart className="w-5 h-5 text-gold mx-auto mt-4 fill-gold/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default RSVPSection;
