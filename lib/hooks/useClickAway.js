"use client";

import { useState, useEffect, useRef } from "react";

export function useClickAway(initialIsVisible) {
  const [isVisible, setIsVisible] = useState(initialIsVisible);

  const ref = useRef(null);

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current?.contains?.(event.target)) {
      setIsVisible(false);
    }
    if (event.key === "Escape") {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("keydown", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return { ref, isVisible, setIsVisible };
}
