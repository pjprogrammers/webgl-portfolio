"use client";

import { useEffect } from "react";

import { usePathname } from "@/i18n/navigation";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap/registerPlugin";
import { scrollTriggerFromDataset } from "@/lib/gsap/scrollTriggerFromDataset";
import { useGlobalStore } from "@/stores/global-store";

export enum ETextAnimation {
  PrintOpacity = "print-opacity",
  PrintBlur = "print-blur",
  FadeInOut = "fade-in-out",
  Blur = "blur",
  Lines = "lines",
  FadeIn = "fade-in",
  FadeOut = "fade-out",
}

const SELECTORS = {
  [ETextAnimation.PrintOpacity]: ".js-s-print-opacity",
  [ETextAnimation.PrintBlur]: ".js-s-print-blur",
  [ETextAnimation.FadeInOut]: ".js-s-fade-in-out",
  [ETextAnimation.Blur]: ".js-s-blur",
  [ETextAnimation.Lines]: ".js-s-lines",
  [ETextAnimation.FadeIn]: ".js-s-fade-in",
  [ETextAnimation.FadeOut]: ".js-s-fade-out",
} as const;

const SCROLL_DEFAULTS = {
  reveal: { start: "90%" },
  fade: { start: "80%" },
} as const;

export function useScrollAnimations() {
  const { fontsLoaded } = useGlobalStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!fontsLoaded) return;

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      document
        .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.PrintOpacity])
        .forEach((el) => {
          const split = new SplitText(el, {
            type: "chars,words,lines",
            tag: "span",
          });
          splits.push(split);

          const startFromZero = el.dataset.startFromZero === "true";
          const scrub = el.dataset.scrub ? Number(el.dataset.scrub) : 1;

          gsap.fromTo(
            split.chars,
            {
              opacity: startFromZero ? 0 : 0.1,
            },
            {
              keyframes: [
                { opacity: 0.4 },
                { opacity: 0.6 },
                { opacity: 0.8 },
                { opacity: 1 },
              ],
              stagger: 0.02,
              ease: "power1.inOut",
              duration: 0.2,
              scrollTrigger: scrollTriggerFromDataset(el, {
                ...SCROLL_DEFAULTS.reveal,
                scrub,
                start: "top 90%",
                end: "bottom 70%",
              }),
            },
          );
        });

      // document
      //   .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.PrintBlur])
      //   .forEach((el) => {
      //     const tl = gsap.timeline({
      //       defaults: {
      //         duration: 0.4,
      //         stagger: 0.02,
      //         ease: "power2.out",
      //         scrollTrigger: {
      //           ...scrollTriggerFromDataset(el, SCROLL_DEFAULTS.reveal),
      //           scrub: 1,
      //           start: "top 60%",
      //           end: "bottom 70%",
      //         },
      //       },
      //     });
      //     const split = new SplitText(el, {
      //       type: "chars,words,lines",
      //       tag: "span",
      //     });
      //     splits.push(split);

      //     tl.fromTo(
      //       split.chars,
      //       { opacity: 0, filter: "blur(10px)" },
      //       { opacity: 1, filter: "blur(0px)" },
      //     );

      //     tl.to({}, { duration: 1.5 });

      //     tl.to(split.chars, { opacity: 0, filter: "blur(10px)" });
      //   });

      document
        .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.PrintBlur])
        .forEach((el) => {
          const split = new SplitText(el, {
            type: "chars,words,lines",
            tag: "span",
          });

          splits.push(split);

          const tl = gsap.timeline({
            scrollTrigger: {
              ...scrollTriggerFromDataset(el, SCROLL_DEFAULTS.reveal),
              scrub: 1,
              start: "top 60%",
              // end: "+=1500",
              end: "bottom 80%",
            },
          });

          // ENTER
          tl.fromTo(
            split.chars,
            {
              opacity: 0,
              filter: "blur(10px)",
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              stagger: 0.3,
              duration: 3,
              ease: "none",
            },
          );

          // HOLD
          tl.to({}, { duration: 2 });

          // EXIT
          // tl.to(split.chars, {
          //   opacity: 0,
          //   filter: "blur(10px)",
          //   stagger: 0.3,
          //   duration: 1,
          //   ease: "none",
          // });
        });

      document
        .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.Blur])
        .forEach((el) => {
          const split = new SplitText(el, {
            type: "chars,words,lines",
            tag: "span",
          });
          splits.push(split);

          gsap.from(split.words, {
            opacity: 0,
            filter: "blur(15px)",
            duration: 0.4,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: scrollTriggerFromDataset(el, SCROLL_DEFAULTS.reveal),
          });
        });

      document
        .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.FadeIn])
        .forEach((el) => {
          const delay = Number(el.dataset.delay || 0);

          const scrub = el.dataset.scrub ? Number(el.dataset.scrub) : 1;
          const start = el.dataset.start ? el.dataset.start : "top 80%";
          const end = el.dataset.end ? el.dataset.end : "bottom 80%";
          const markers = Boolean(el.dataset.markers);
          const scale = Number(el.dataset.scale) === 0 ? 0 : 1;

          const tl = gsap.timeline({
            scrollTrigger: {
              ...scrollTriggerFromDataset(el, {
                ...SCROLL_DEFAULTS.fade,
                scrub,
                start,
                end,
                markers,
              }),
            },
          });

          tl.fromTo(
            el,
            { opacity: 0, scale },
            { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
            delay,
          );
        });

      document
        .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.FadeOut])
        .forEach((el) => {
          const delay = Number(el.dataset.delay || 0);

          const scrubFO = el.dataset.scrub ? Number(el.dataset.scrub) : 1;
          const startFO = el.dataset.start ? el.dataset.start : "";
          const endFO = el.dataset.end ? el.dataset.end : "";
          const markersFO = Boolean(el.dataset.markers);
          const scaleFO = Number(el.dataset.scale) === 0 ? 0 : 1;

          const tl = gsap.timeline({
            scrollTrigger: {
              ...scrollTriggerFromDataset(el, {
                // ...SCROLL_DEFAULTS.fade,
                scrub: scrubFO,
                start: startFO,
                end: endFO,
                markers: markersFO,
              }),
            },
          });

          tl.fromTo(
            el,
            { opacity: 1, scale: 1 },
            { opacity: 0, scale: scaleFO, duration: 1, ease: "power3.out" },
            delay,
          );
        });

      document
        .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.FadeInOut])
        .forEach((el) => {
          const tl = gsap.timeline({
            defaults: {
              duration: 2,
              scrollTrigger: {
                ...scrollTriggerFromDataset(el, SCROLL_DEFAULTS.fade),
                scrub: true,
                start: "top 70%",
                end: "bottom 30%",
              },
            },
          });

          tl.fromTo(el, { opacity: 0 }, { opacity: 1 });

          tl.to({}, { duration: 2 });

          tl.to(el, { opacity: 0 });
        });

      document
        .querySelectorAll<HTMLElement>(SELECTORS[ETextAnimation.Lines])
        .forEach((el) => {
          const split = new SplitText(el, {
            type: "lines",
            mask: "lines",
            linesClass: "overflow-hidden",
            tag: "div",
          });
          splits.push(split);

          const scale = Number(el.dataset.scale) || 1;

          gsap.fromTo(
            split.lines,
            { yPercent: 320, scale, rotate: 10 },
            {
              yPercent: 0,
              scale: 1,
              rotate: 0,
              stagger: 0.07,
              duration: 0.4,
              ease: "power3.out",
              scrollTrigger: scrollTriggerFromDataset(el, {
                ...SCROLL_DEFAULTS.reveal,
                scrub: 1,
                end: "bottom 60%",
              }),
            },
          );
        });
    });

    ScrollTrigger.refresh();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, [fontsLoaded, pathname]);
}

export default useScrollAnimations;
