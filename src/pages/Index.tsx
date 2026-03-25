import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CoverSection from "@/components/wedding/CoverSection";
import WelcomeSection from "@/components/wedding/WelcomeSection";
import BoardingPass from "@/components/wedding/BoardingPass";
import CountdownSection from "@/components/wedding/CountdownSection";
import EventDetails from "@/components/wedding/EventDetails";
import LoveStory from "@/components/wedding/LoveStory";
import PhotoGallery from "@/components/wedding/PhotoGallery";
import VenueSection from "@/components/wedding/VenueSection";
import RSVPSection from "@/components/wedding/RSVPSection";
import GiftSection from "@/components/wedding/GiftSection";
import ContactSection from "@/components/wedding/ContactSection";
import ClosingSection from "@/components/wedding/ClosingSection";
import ScrollProgress from "@/components/wedding/ScrollProgress";
import FloatingRSVP from "@/components/wedding/FloatingRSVP";
import MusicToggle from "@/components/wedding/MusicToggle";

const Index = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("to") || params.get("guest");
    if (name) setGuestName(decodeURIComponent(name));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {!isOpen && <CoverSection onOpen={() => setIsOpen(true)} guestName={guestName} />}
      </AnimatePresence>

      {isOpen && (
        <>
          <ScrollProgress />
          <MusicToggle />
          <FloatingRSVP />

          <main className="max-w-screen-md mx-auto">
            <WelcomeSection />
            <BoardingPass />
            <CountdownSection />
            <EventDetails />
            <LoveStory />
            <PhotoGallery />
            <VenueSection />
            <RSVPSection />
            <GiftSection />
            <ContactSection />
            <ClosingSection />
          </main>
        </>
      )}
    </div>
  );
};

export default Index;
