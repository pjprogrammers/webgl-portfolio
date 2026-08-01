"use client";

import { useEffect, type RefObject } from "react";

import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap/registerPlugin";
import useMediaQuery, { bp, maxWidth } from "@/lib/hooks/useMediaQuery";
import { useGlobalStore } from "@/stores/global-store";

import type { Work } from "./works";

const TEXT_FROM = { opacity: 0 };
const TEXT_TO = {
  keyframes: [
    { opacity: 0.4 },
    { opacity: 0.6 },
    { opacity: 0.8 },
    { opacity: 1 },
  ],
  stagger: 0.02,
  ease: "power1.inOut",
  duration: 0.2,
};

// Porciones del recorrido de la card (top center → bottom center)
const CARD_ENTER_END = 0.2;
const CARD_HOLD_END = 0.8;

function splitLines(el: HTMLElement) {
  return new SplitText(el, {
    type: "chars,words,lines",
    // mask: "lines",
    linesClass: "overflow-hidden",
    tag: "div",
  });
}

function buildWorkTextTimeline(lines: Element[], cardEl: HTMLElement) {
  gsap.set(lines, TEXT_FROM);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: cardEl,
      start: "top 50%",
      end: "bottom 50%",
      scrub: true,
    },
  });

  tl.fromTo(
    lines,
    TEXT_FROM,
    { ...TEXT_TO, duration: CARD_ENTER_END, immediateRender: false },
    0,
  );

  tl.to({}, { duration: CARD_HOLD_END - CARD_ENTER_END });

  tl.fromTo(lines, TEXT_TO, {
    ...TEXT_FROM,
    duration: 1 - CARD_HOLD_END,
    immediateRender: false,
  });

  return tl;
}

function applyLinkHref(linkEl: HTMLAnchorElement, href: string) {
  linkEl.setAttribute("href", href);
}

export function useWorkScrollSync(
  workCardRefs: RefObject<(HTMLElement | null)[]>,
  studioNameRefs: RefObject<(HTMLElement | null)[]>,
  seeLiveRef: RefObject<HTMLAnchorElement | null>,
  works: Work[],
) {
  const { fontsLoaded } = useGlobalStore();
  const isMobile = useMediaQuery(maxWidth(bp.mobileLandscape));

  useEffect(() => {
    if (!fontsLoaded || isMobile) return;

    const cardEls = workCardRefs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    const nameEls = studioNameRefs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    const seeLiveEl = seeLiveRef.current;

    if (
      cardEls.length === 0 ||
      cardEls.length !== works.length ||
      nameEls.length !== works.length ||
      !seeLiveEl
    ) {
      return;
    }

    const splits: SplitText[] = [];
    const timelines: gsap.core.Timeline[] = [];
    const triggers: ScrollTrigger[] = [];

    // El link usa VariableProximity (hasProximityHover), que ya parte el texto en
    // letras desde React. Reusamos esas letras en vez de correr SplitText encima,
    // para no romper el espaciado ni el DOM que controla React.
    const proximityChars = Array.from(
      seeLiveEl.querySelectorAll<HTMLElement>("[data-vp-char]"),
    );

    let linkChars: Element[];
    if (proximityChars.length > 0) {
      linkChars = proximityChars;
    } else {
      const linkSplit = splitLines(seeLiveEl);
      splits.push(linkSplit);
      linkChars = linkSplit.chars;
    }

    gsap.set(linkChars, TEXT_FROM);
    applyLinkHref(seeLiveEl, works[0].link);

    const syncHref = (index: number) => {
      applyLinkHref(seeLiveEl, works[index].link);
    };

    cardEls.forEach((cardEl, index) => {
      const nameSplit = splitLines(nameEls[index]);
      splits.push(nameSplit);

      timelines.push(buildWorkTextTimeline(nameSplit.chars, cardEl));
      timelines.push(buildWorkTextTimeline(linkChars, cardEl));

      triggers.push(
        ScrollTrigger.create({
          trigger: cardEl,
          start: "top 50%",
          end: "bottom 50%",
          onUpdate: (self) => {
            if (self.progress > 0 && self.progress < 1) {
              syncHref(index);
            }
          },
        }),
      );
    });

    ScrollTrigger.refresh();

    return () => {
      timelines.forEach((tl) => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
      triggers.forEach((trigger) => trigger.kill());
      splits.forEach((split) => split.revert());
      if (proximityChars.length > 0) {
        gsap.set(proximityChars, { clearProps: "opacity" });
      }
    };
  }, [fontsLoaded, isMobile, workCardRefs, studioNameRefs, seeLiveRef, works]);
}
