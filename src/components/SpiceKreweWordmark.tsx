/**
 * Premium wordmark: Montserrat (loaded globally) + brand fills — no raster, no legacy stock icons.
 */
export default function SpiceKreweWordmark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      role="img"
      aria-hidden
      width={168}
      height={28}
      viewBox="0 0 168 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x={0}
        y={21}
        fontFamily="'Montserrat', system-ui, sans-serif"
        fontSize={18}
        fontWeight={600}
        letterSpacing="-0.02em"
        fill="#ffffff"
      >
        Spice
      </text>
      <text
        x={58}
        y={21}
        fontFamily="'Montserrat', system-ui, sans-serif"
        fontSize={18}
        fontWeight={600}
        letterSpacing="-0.02em"
        fill="#b99ee8"
      >
        Krewe
      </text>
    </svg>
  );
}
