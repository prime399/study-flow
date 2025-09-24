"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
}
export const Meteors = ({ number = 30 }: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    [],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const availableWidth =
      containerRef.current?.offsetWidth && containerRef.current.offsetWidth > 0
        ? containerRef.current.offsetWidth
        : window.innerWidth;

    const styles = [...new Array(number)].map(() => ({
      top: -5,
      left: Math.floor(Math.random() * availableWidth) + "px",
      animationDelay: Math.random() * 1 + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * 8 + 3) + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden">
      {[...meteorStyles].map((style, idx) => (
        <span
          key={idx}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 size-1 rotate-[215deg] animate-meteor rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff40]",
          )}
          style={style}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[100px] -translate-y-1/2 bg-gradient-to-r from-slate-500 to-transparent" />
        </span>
      ))}
    </div>
  );
};

export default Meteors;
