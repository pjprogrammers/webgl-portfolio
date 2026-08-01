"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { ShinyText } from "@/components/molecules";
import { gsap } from "@/lib/gsap/registerPlugin";
import { hasClientNavigatedOnce } from "@/lib/webgl/particlePageTransition";
import { resetScrollToTop, startScroll, stopScroll } from "@/lib/scroll";
import { useGlobalStore } from "@/stores/global-store";

import { LOADER_HOLD_DURATION, LOADER_SPLIT_DURATION } from "./loaderConfig";

function shouldShowInitialLoader(): boolean {
  if (typeof window === "undefined") return true;
  return !hasClientNavigatedOnce();
}

const Loader = () => {
  const setIsLoading = useGlobalStore((state) => state.setIsLoading);
  const lineRef = useRef<HTMLDivElement>(null);
  const leftToBottom = useRef<HTMLDivElement>(null);
  const rightToTop = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(shouldShowInitialLoader);

  useLayoutEffect(() => {
    resetScrollToTop();

    if (shouldShowInitialLoader()) {
      stopScroll();
    }
  }, []);

  useEffect(() => {
    if (!shouldShowInitialLoader()) {
      resetScrollToTop();
      setIsLoading(false);
      setTimeout(() => {
        setVisible(false);
      }, 1000);
      return;
    }

    const line = lineRef.current;
    const left = leftToBottom.current;
    const right = rightToTop.current;
    if (!left || !right || !line) return;

    gsap.set(line, { clipPath: "inset(100% 0 0 0)" });
    gsap.set(left, { clipPath: "inset(0 50% 0 0)", xPercent: 0 });
    gsap.set(right, { clipPath: "inset(0 0 0 50%)", xPercent: 0 });

    const splitEase = "power4.inOut";

    const timeline = gsap.timeline({
      onComplete: () => {
        resetScrollToTop();
        setIsLoading(false);
        setVisible(false);
        startScroll();
      },
    });

    timeline.to({}, { duration: LOADER_HOLD_DURATION });
    timeline.fromTo(
      line,
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 0.7,
        ease: splitEase,
      },
    );
    timeline.fromTo(
      left,
      { clipPath: "inset(0 50% 0 0)", xPercent: 0 },
      {
        clipPath: "inset(0 80% 0 0)",
        xPercent: -20,
        duration: LOADER_SPLIT_DURATION,
        ease: splitEase,
      },
      "-=0.1",
    );
    timeline.fromTo(
      right,
      { clipPath: "inset(0 0 0 50%)", xPercent: 0 },
      {
        clipPath: "inset(0 0 0 80%)",
        xPercent: 20,
        duration: LOADER_SPLIT_DURATION,
        ease: splitEase,
      },
      `<`,
    );

    return () => {
      timeline.kill();
      startScroll();
    };
  }, [setIsLoading]);

  if (!visible) return null;

  return (
    <div>
      <div
        ref={leftToBottom}
        className="overflow-hidden text-brand-05 fixed w-screen h-screen left-0 top-0 z-[10000000] flex items-center justify-center bg-brand-70"
        aria-hidden="true"
        style={{
          clipPath: "inset(0 50% 0 0)",
        }}
      >
        <ShinyText
          text="Where security meets intelligence."
          className="heading-2 text-center font-instrument-serif"
        />
        <div
          ref={lineRef}
          className="absolute top-0 left-1/2 w-px h-screen -translate-x-1/2 bg-brand-05/20"
          style={{
            clipPath: "inset(100% 0 0 0)",
          }}
        />
      </div>
      <div
        ref={rightToTop}
        className="overflow-hidden text-brand-05 fixed w-screen h-screen left-0 top-0 z-[10000000] flex items-center justify-center bg-brand-70"
        aria-hidden="true"
        style={{
          clipPath: "inset(0 0 0 50%)",
        }}
      >
        <ShinyText
          text="Where security meets intelligence."
          className="heading-2 text-center font-instrument-serif"
        />
      </div>
    </div>
  );
};

export default Loader;
