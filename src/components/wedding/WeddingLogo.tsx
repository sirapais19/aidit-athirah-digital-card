import logoMark from "@/assets/logo-mark.png";

const WeddingLogo = ({ className = "" }: { className?: string }) => (
  <span
    role="img"
    aria-label="Aidit & Athirah"
    className={`inline-block bg-current ${className}`}
    style={{
      maskImage: `url(${logoMark})`,
      WebkitMaskImage: `url(${logoMark})`,
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    }}
  />
);

export default WeddingLogo;
