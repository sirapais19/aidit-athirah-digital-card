import { motion } from "framer-motion";
import { Mail } from "lucide-react";

const FloatingRSVP = () => {
  const scrollToRSVP = () => {
    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.button
      onClick={scrollToRSVP}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-passport-navy text-gold shadow-lg
                 flex items-center justify-center hover:scale-110 transition-transform"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      whileTap={{ scale: 0.9 }}
    >
      <Mail className="w-5 h-5" />
    </motion.button>
  );
};

export default FloatingRSVP;
