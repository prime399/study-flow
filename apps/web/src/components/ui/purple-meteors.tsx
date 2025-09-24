"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface PurpleMeteorsProps {
  number?: number;
}
export const PurpleMeteors = ({ number = 15 }: PurpleMeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    [],
  );

  useEffect(() => {
    // Ensure window is available
    if (typeof window === 'undefined') return;
    const styles = [...new Array(number)].map(() => ({
      top: -5,
      left: Math.floor(Math.random() * window.innerWidth) + "px",
      animationDelay: Math.random() * 2 + 0.5 + "s",
      animationDuration: (Math.floor(Math.random() * 10 + 4) + "s"), // Slower meteors
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        // Meteor Head
        <span
          key={idx}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 size-0.5 rotate-[215deg] animate-meteor rounded-full bg-purple-400/60 shadow-[0_0_0_1px_#a855f750]",
          )}
          style={style}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[120px] -translate-y-1/2 bg-gradient-to-r from-purple-400/60 via-purple-300/40 to-transparent" />
        </span>
      ))}
    </>
  );
};

export default PurpleMeteors;