"use client";

import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global-store";

const useFontsReady = () => {
  const { fontsLoaded, setFontsLoaded } = useGlobalStore();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleFontsLoaded = () => {
      setFontsLoaded(true);
      document.body.classList.add("fonts-loaded");
    };

    if (!document.fonts) {
      handleFontsLoaded();
      return;
    }

    if (document.fonts.status === "loaded") {
      handleFontsLoaded();
      return;
    }

    // iOS Safari on local network (HTTP) may never fire loadingdone or resolve
    // document.fonts.ready — this fallback guarantees animations always start.
    const fallback = setTimeout(handleFontsLoaded, 800);

    const onDone = () => {
      clearTimeout(fallback);
      handleFontsLoaded();
    };

    document.fonts.ready.then(onDone);
    document.fonts.addEventListener("loadingdone", onDone);

    return () => {
      clearTimeout(fallback);
      document.fonts.removeEventListener("loadingdone", onDone);
    };
  }, [setFontsLoaded]);

  return fontsLoaded;
};

export default useFontsReady;
