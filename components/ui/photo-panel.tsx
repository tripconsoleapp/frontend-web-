import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PhotoPanelProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Illustrated stand-in for a travel photo (mountains + road) until real
 * photography is dropped in. Kept in navy/mint tones to stay on-brand.
 */
export function PhotoPanel({ className, children }: PhotoPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#3d5268] to-[#1c2733]",
        className
      )}
    >
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <circle cx="600" cy="140" r="70" fill="#A8D5C5" opacity="0.35" />
        <circle cx="600" cy="140" r="40" fill="#A8D5C5" opacity="0.55" />
        <polygon points="0,600 0,380 180,180 340,380 420,300 600,600" fill="#2D3E50" opacity="0.9" />
        <polygon points="200,600 420,260 600,460 700,340 800,600" fill="#26333F" />
        <polygon points="0,600 150,470 320,600" fill="#182028" />
        <polygon points="450,600 620,430 800,600" fill="#182028" />
        <path
          d="M 340 600 C 380 500, 420 480, 400 400 C 380 320, 460 300, 440 220"
          stroke="#EAF2EF"
          strokeWidth="6"
          strokeDasharray="14 16"
          fill="none"
          opacity="0.5"
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
