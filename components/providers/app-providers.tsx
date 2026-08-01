"use client";

import "@/lib/gsap/registerPlugin";

import { useEffect } from "react";

import { PerformanceViewer } from "@/components/dev/PerformanceViewer";
import { initGlobalWheelInput } from "@/lib/input/globalWheelInput";
import { LenisProvider } from "./lenis-provider";
import { ScrollAnimationsProvider } from "./scroll-animations-provider";
import { ScrollToTopOnNavigate } from "./scroll-to-top-on-navigate";

type AppProvidersProps = {
  children: React.ReactNode;
};

function GlobalWheelInput() {
  useEffect(() => initGlobalWheelInput(), []);
  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LenisProvider>
      <GlobalWheelInput />
      <ScrollAnimationsProvider>
        <ScrollToTopOnNavigate />
        {children}
        <PerformanceViewer />
      </ScrollAnimationsProvider>
    </LenisProvider>
  );
}
