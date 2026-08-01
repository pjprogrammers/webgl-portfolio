"use client";

import { forwardRef, useEffect, useRef } from "react";

import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap/registerPlugin";
import { bp, minWidth } from "@/lib/hooks/useMediaQuery";
import { useGlobalStore } from "@/stores/global-store";
import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";

import { syncButtonSvg } from "./syncButtonSvg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  noAnimation?: boolean;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, noAnimation, className, ...props }, forwardedRef) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const rectRef = useRef<SVGRectElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const rectTweenRef = useRef<gsap.core.Tween | null>(null);
    const { fontsLoaded } = useGlobalStore();

    useEffect(() => {
      const button = buttonRef.current;
      const svg = svgRef.current;
      const rect = rectRef.current;
      if (!button || !svg || !rect || !fontsLoaded) return;

      const sync = (preserveProgress: boolean) => {
        syncButtonSvg(button, svg, rect, { preserveProgress });

        if (preserveProgress) {
          rectTweenRef.current?.invalidate();
          ScrollTrigger.refresh();
        }
      };

      sync(false);

      let resizeRaf = 0;
      const scheduleSync = () => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => sync(true));
      };

      const resizeObserver = new ResizeObserver(scheduleSync);
      resizeObserver.observe(button);

      const tabletPortraitMq = window.matchMedia(minWidth(bp.tabletPortrait));
      tabletPortraitMq.addEventListener("change", scheduleSync);

      return () => {
        cancelAnimationFrame(resizeRaf);
        resizeObserver.disconnect();
        tabletPortraitMq.removeEventListener("change", scheduleSync);
      };
    }, [fontsLoaded]);

    useEffect(() => {
      if (noAnimation) return;

      const button = buttonRef.current;
      const rect = rectRef.current;
      const textEl = textRef.current;
      if (!button || !rect || !textEl || !fontsLoaded) return;

      const split = new SplitText(textEl, {
        type: "lines",
        mask: "lines",
        linesClass: "overflow-hidden",
        tag: "div",
      });

      gsap.set(split.lines, { yPercent: 320, rotate: 10 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: button,
          start: "top 90%",
          end: "bottom 80%",
          // toggleActions: "play none none reverse",
          scrub: 1,
        },
      });

      tl.to(rect, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: "power2.inOut",
      });

      tl.fromTo(
        button,
        { backgroundColor: "rgba(255,255,255,0)" },
        { backgroundColor: "rgba(255,255,255,0.04)" },
      );

      tl.to(
        split.lines,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.4,
          ease: "power3.out",
        },
        "-=0.25",
      );

      rectTweenRef.current = tl.getChildren()[0] as gsap.core.Tween;

      ScrollTrigger.refresh();

      return () => {
        rectTweenRef.current = null;
        tl.scrollTrigger?.kill();
        tl.kill();
        split.revert();
      };
    }, [fontsLoaded, noAnimation]);

    return (
      <button
        {...props}
        ref={(el) => {
          buttonRef.current = el;
          if (typeof forwardedRef === "function") forwardedRef(el);
          else if (forwardedRef) forwardedRef.current = el;
        }}
        data-event="hover"
        className={classNames(
          "relative transition-bg duration-300 h-10 tablet-portrait:h-12 px-4 tablet-portrait:px-6 rounded-circular cursor-pointer backdrop-blur-sm",
          className,
        )}
      >
        <svg
          ref={svgRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect
            ref={rectRef}
            className="stroke-brand-05/20"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </svg>
        <span ref={textRef} className="relative block">
          {children}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
