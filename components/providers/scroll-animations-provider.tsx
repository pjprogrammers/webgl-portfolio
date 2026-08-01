"use client";

import useFontsReady from "@/lib/hooks/useFontsReady";
import { useScrollAnimations } from "@/lib/gsap/scrollAnimations";

type ScrollAnimationsProviderProps = {
  children: React.ReactNode;
};

export function ScrollAnimationsProvider({
  children,
}: ScrollAnimationsProviderProps) {
  useFontsReady();
  useScrollAnimations();

  return children;
}
