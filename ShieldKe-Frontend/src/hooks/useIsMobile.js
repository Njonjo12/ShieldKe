import { useState, useEffect } from "react";

/*
========================================
useIsMobile

Tiny shared hook so every component can
branch its inline styles responsively
without introducing CSS media queries
(the whole codebase uses inline styles,
so this keeps that pattern consistent).

Returns true when the viewport is narrower
than the given breakpoint (default 768px,
the standard tablet/phone cutoff).
========================================
*/

export default function useIsMobile(breakpoint = 768) {

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, [breakpoint]);

  return isMobile;
}
