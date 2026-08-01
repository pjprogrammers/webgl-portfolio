// "use client";

// import { useEffect, type RefObject } from "react";

// import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap/registerPlugin";

// import { useGlobalStore } from "@/stores/global-store";

// type WorkRevealRefs = RefObject<HTMLElement | null>[];

// export function useWorkRevealAnimation(
//   worksContainerRef: RefObject<HTMLDivElement | null>,
//   workRevealRefs: WorkRevealRefs,
// ) {
//   const { fontsLoaded } = useGlobalStore();

//   useEffect(() => {
//     if (!fontsLoaded) return;

//     const container = worksContainerRef.current;
//     const elements = workRevealRefs
//       .map((ref) => ref.current)
//       .filter((el): el is HTMLElement => el !== null);

//     if (!container || elements.length === 0) return;

//     const splits: SplitText[] = [];
//     const triggers: ScrollTrigger[] = [];

//     elements.forEach((el) => {
//       const split = new SplitText(el, {
//         type: "lines",
//         mask: "lines",
//         linesClass: "overflow-hidden",
//         tag: "div",
//       });
//       splits.push(split);

//       const scale = Number(el.dataset.scale) || 1;

//       const tl = gsap.timeline({ paused: true });
//       tl.fromTo(
//         split.lines,
//         { yPercent: 240, scale, rotate: 10 },
//         {
//           yPercent: 0,
//           scale: 1,
//           rotate: 0,
//           stagger: 1,
//           duration: 0.4,
//           ease: "power3.out",
//         },
//       );

//       const pause = () => {
//         tl.pause();
//       };

//       const play = () => {
//         tl.timeScale(1);
//         tl.play();
//       };

//       const reverse = () => {
//         tl.timeScale(1);
//         tl.reverse();
//       };

//       tl.eventCallback("onComplete", pause);
//       tl.eventCallback("onReverseComplete", pause);

//       // entrada
//       triggers.push(
//         ScrollTrigger.create({
//           trigger: container,
//           start: "top 50%",
//           onEnter: play,
//           onLeaveBack: reverse,
//         }),
//       );

//       // salida
//       triggers.push(
//         ScrollTrigger.create({
//           trigger: container,
//           start: "bottom 60%",
//           onEnter: reverse,
//           onLeaveBack: play,
//         }),
//       );
//     });

//     ScrollTrigger.refresh();

//     return () => {
//       splits.forEach((split) => split.revert());
//       triggers.forEach((trigger) => trigger.kill());
//     };
//   }, [fontsLoaded, worksContainerRef, workRevealRefs]);
// }

/////////// CON SCRUB ///////////

"use client";

import { useEffect, type RefObject } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { useGlobalStore } from "@/stores/global-store";

type WorkRevealRefs = [
  RefObject<HTMLElement | null>,
  RefObject<HTMLElement | null>,
  RefObject<HTMLElement | null>,
];

export function useWorkRevealAnimation(
  worksContainerRef: RefObject<HTMLDivElement | null>,
  workRevealRefs: WorkRevealRefs,
) {
  const { fontsLoaded } = useGlobalStore();

  useEffect(() => {
    if (!fontsLoaded) return;

    const container = worksContainerRef.current;
    const elements = workRevealRefs
      .map((ref) => ref.current)
      .filter((el): el is HTMLElement => el !== null);

    if (!container || elements.length === 0) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const splits: SplitText[] = [];
    const triggers: ScrollTrigger[] = [];

    elements.forEach((el) => {
      const split = new SplitText(el, {
        type: "lines",
        mask: "lines",
        linesClass: "overflow-hidden",
        tag: "div",
      });
      splits.push(split);

      const scale = Number(el.dataset.scale) || 1;

      const fromState = { yPercent: 320, scale, rotate: 10 };
      const toState = { yPercent: 0, scale: 1, rotate: 0 };

      const lineAnimation = {
        stagger: 1,
        duration: 0.4,
        ease: "power3.out" as const,
      };

      // entrada
      const entradaTween = gsap.fromTo(split.lines, fromState, {
        ...toState,
        ...lineAnimation,
        scrollTrigger: {
          trigger: container,
          start: "top 50%",
          end: "top 10%",
          scrub: true,
        },
      });

      if (entradaTween.scrollTrigger) triggers.push(entradaTween.scrollTrigger);

      // salida
      const salidaTween = gsap.fromTo(split.lines, toState, {
        ...fromState,
        ...lineAnimation,
        immediateRender: false,
        scrollTrigger: {
          trigger: container,
          start: "bottom 70%",
          end: "bottom 30%",
          scrub: true,
        },
      });

      if (salidaTween.scrollTrigger) triggers.push(salidaTween.scrollTrigger);
    });

    ScrollTrigger.refresh();

    return () => {
      splits.forEach((split) => split.revert());
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [fontsLoaded, worksContainerRef, workRevealRefs]);
}
