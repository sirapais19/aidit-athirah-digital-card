import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MusicToggle = () => {
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    setPlaying(!playing);
    // Music functionality placeholder - add audio source here
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 z-40 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50
                 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
      aria-label={playing ? "Mute music" : "Play music"}
    >
      {playing ? (
        <Volume2 className="w-4 h-4 text-foreground" />
      ) : (
        <VolumeX className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
};

export default MusicToggle;
