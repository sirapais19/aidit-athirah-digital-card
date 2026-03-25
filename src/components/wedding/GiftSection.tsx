import { motion } from "framer-motion";
import { Gift, Copy } from "lucide-react";
import { useState } from "react";

const banks = [
  { bank: "Maybank", account: "1234 5678 9012", name: "Ahmad Farhan bin Abdullah" },
  { bank: "CIMB Bank", account: "9876 5432 1098", name: "Nur Aisyah binti Ismail" },
];

const GiftSection = () => {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-md mx-auto text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-2xl text-foreground mb-2">Wedding Gift</h2>
        <p className="font-serif text-muted-foreground italic">your love is the greatest gift</p>
        <div className="section-divider mt-6" />
      </motion.div>

      <div className="max-w-md mx-auto space-y-4">
        {banks.map((b, i) => (
          <motion.div
            key={b.bank}
            className="paper-card p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-4 h-4 text-gold" />
              <p className="font-body text-sm font-medium text-foreground">{b.bank}</p>
            </div>
            <p className="text-muted-foreground text-xs font-body mb-1">{b.name}</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm text-foreground tracking-wider">{b.account}</p>
              <button
                onClick={() => handleCopy(b.account, i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 text-xs font-body text-foreground
                           hover:bg-gold/20 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied === i ? "Copied!" : "Copy"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GiftSection;
