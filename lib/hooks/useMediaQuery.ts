"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const bp = {
  mobileLandscape: 480,
  tabletPortrait: 768,
  tabletLandscape: 1024,
  desktopSM: 1280,
  desktop: 1440,
  desktopLG: 1680,
  wide: 1920,
  ultrawide: 2560,
};

export const minWidth = (breakpoint: number): string =>
  `(min-width: ${breakpoint}px)`;
export const maxWidth = (breakpoint: number): string =>
  `(max-width: ${breakpoint}px)`;

const useMediaQuery = (query: string): boolean => {
  const windows = typeof window !== "undefined" ? window : null;
  const [matches, setMatches] = useState(false);

  const updateTarget = useCallback((e: MediaQueryListEvent) => {
    if (e.matches) {
      setMatches(true);
    } else {
      setMatches(false);
    }
  }, []);

  const media = useMemo(() => windows?.matchMedia(query), [query, windows]);

  useEffect(() => {
    media?.addEventListener("change", updateTarget);

    // Check on mount (callback is not called until a change occurs)
    if (media?.matches) {
      setMatches(true);
    }

    return () => media?.removeEventListener("change", updateTarget);
  }, [media, updateTarget]);

  return matches;
};

export default useMediaQuery;

///// VERSION 2 /////

// 'use client';

// import { useCallback, useSyncExternalStore } from 'react';

// export const bp = {
//   xs: 480,
//   sm: 640,
//   s: 650,
//   md: 768,
//   lg: 1024,
//   xl: 1280,
//   '2xl': 1440,
//   '3xl': 1636
// };

// export const desktop = '(min-width: 1024px)';
// export const mobile = '(max-width: 1023px)';

// export const minWidth = (breakpoint: number): string => `(min-width: ${breakpoint}px)`;
// export const maxWidth = (breakpoint: number): string => `(max-width: ${breakpoint}px)`;

// const useMediaQuery = (query: string): boolean => {
//   const subscribe = useCallback(
//     (onStoreChange: () => void) => {
//       const media = window.matchMedia(query);
//       media.addEventListener('change', onStoreChange);
//       return () => media.removeEventListener('change', onStoreChange);
//     },
//     [query],
//   );

//   const getSnapshot = useCallback(
//     () => window.matchMedia(query).matches,
//     [query],
//   );

//   const getServerSnapshot = useCallback(() => false, []);

//   return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
// };

// export default useMediaQuery;
