"use client";

import { useEffect, type RefObject } from "react";

import { gsap, SplitText } from "@/lib/gsap/registerPlugin";
import { useGlobalStore } from "@/stores/global-store";

export const PROCESS_CTA_PENDING_CLASS = "process-cta-pending";

type ProcessAnimationRefs = {
  containerRef: RefObject<HTMLElement | null>;
  lineRef: RefObject<HTMLElement | null>;
  squareRef: RefObject<HTMLElement | null>;
  titleRef: RefObject<HTMLElement | null>;
  descriptionRef: RefObject<HTMLElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
};

function readRefs(refs: ProcessAnimationRefs) {
  return {
    title: refs.titleRef.current,
    description: refs.descriptionRef.current,
    line: refs.lineRef.current,
    square: refs.squareRef.current,
    container: refs.containerRef.current,
    buttonEl: refs.buttonRef.current,
  };
}

function getButtonPerimeter(button: HTMLElement) {
  const { width, height } = button.getBoundingClientRect();
  const r = height / 2;
  const perimeter = 2 * (width - 2 * r) + 2 * Math.PI * r;

  return { width, height, r, perimeter };
}

function setupButtonSvg(
  button: HTMLElement,
  svg: SVGSVGElement,
  rect: SVGRectElement,
) {
  const { width, height, r, perimeter } = getButtonPerimeter(button);

  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  rect.setAttribute("x", "0.5");
  rect.setAttribute("y", "0.5");
  rect.setAttribute("width", String(width - 1));
  rect.setAttribute("height", String(height - 1));
  rect.setAttribute("rx", String(r - 0.5));

  return perimeter;
}

function setButtonHiddenState(
  button: HTMLButtonElement,
  rect: SVGRectElement,
  lines: Element[] | undefined,
  perimeter: number,
) {
  gsap.set(rect, {
    strokeDasharray: perimeter,
    strokeDashoffset: perimeter,
  });
  gsap.set(button, { backgroundColor: "rgba(255,255,255,0)" });

  if (lines?.length) {
    gsap.set(lines, { yPercent: 320, rotate: 10 });
  }
}

export function useProcessScrollAnimation(refs: ProcessAnimationRefs) {
  const { fontsLoaded } = useGlobalStore();

  useEffect(() => {
    if (!fontsLoaded) return;

    const { title, description, line, square, container, buttonEl } =
      readRefs(refs);

    if (!title || !description || !line || !square || !container) return;

    const ctx = gsap.context(() => {
      const splitedTitle = new SplitText(title, {
        type: "chars,words,lines",
        tag: "span",
      });

      const splitedDescription = new SplitText(description, {
        type: "lines",
        mask: "lines",
        linesClass: "overflow-hidden",
        tag: "div",
      });

      gsap.set(splitedTitle.chars, { opacity: 0 });
      gsap.set(splitedDescription.lines, { yPercent: 320, rotate: 10 });
      gsap.set(square, { scale: 0 });
      gsap.set(line, { scaleY: 0, transformOrigin: "top" });

      const tl = gsap.timeline({
        defaults: { immediateRender: false },
        scrollTrigger: {
          trigger: container,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      // ===== ENTER =====

      tl.fromTo(
        line,
        {
          scaleY: 0,
          transformOrigin: "top",
        },
        {
          scaleY: 1,
          transformOrigin: "bottom",
          duration: 8,
          ease: "none",
        },
        0,
      );

      tl.fromTo(
        splitedTitle.chars,
        { opacity: 0 },
        { opacity: 1, stagger: 0.2, duration: 10 },
      );

      tl.fromTo(
        splitedDescription.lines,
        { yPercent: 320, rotate: 10 },
        { yPercent: 0, rotate: 0, stagger: 0.7, duration: 3 },
        "<+=4",
      );

      let buttonSplit: SplitText | null = null;
      let buttonRect: SVGRectElement | null = null;
      let buttonPerimeter = 0;

      if (buttonEl) {
        const svgEl = buttonEl.querySelector("svg");
        buttonRect = buttonEl.querySelector("rect");
        const textEl = buttonEl.querySelector("span");

        if (svgEl && buttonRect && textEl) {
          buttonPerimeter = setupButtonSvg(buttonEl, svgEl, buttonRect);

          buttonSplit = new SplitText(textEl, {
            type: "lines",
            mask: "lines",
            linesClass: "overflow-hidden",
            tag: "div",
          });

          setButtonHiddenState(
            buttonEl,
            buttonRect,
            buttonSplit.lines,
            buttonPerimeter,
          );

          buttonEl.classList.remove(PROCESS_CTA_PENDING_CLASS);

          tl.fromTo(
            buttonRect,
            { strokeDashoffset: buttonPerimeter },
            { strokeDashoffset: 0, duration: 4 },
            "<+=0.3",
          );

          tl.fromTo(
            buttonEl,
            { backgroundColor: "rgba(255,255,255,0)" },
            { backgroundColor: "rgba(255,255,255,0.04)", duration: 4 },
            "<+=0.3",
          );

          tl.fromTo(
            buttonSplit.lines,
            { yPercent: 320, rotate: 10 },
            { yPercent: 0, rotate: 0, duration: 4 },
            "<+=0.3",
          );
        }
      }

      tl.fromTo(square, { scale: 0 }, { scale: 1, duration: 1 }, "<");

      // ===== HOLD =====

      tl.to({}, { duration: 16 });
      tl.fromTo(
        line,
        {
          transformOrigin: "bottom",
        },
        {
          transformOrigin: "top",
          duration: 1.5,
        },
        "<",
      );

      // ===== EXIT =====

      if (buttonEl && buttonSplit && buttonRect) {
        tl.fromTo(
          buttonSplit.lines,
          { yPercent: 0, rotate: 0 },
          {
            yPercent: 320,
            rotate: 10,
            duration: 2,
            stagger: { each: 0.07, from: "end" },
          },
          "+=0.35",
        );

        tl.fromTo(
          buttonRect,
          { strokeDashoffset: 0 },
          { strokeDashoffset: buttonPerimeter, duration: 2 },
          "<+=0.1",
        );

        tl.fromTo(
          buttonEl,
          { backgroundColor: "rgba(255,255,255,0.04)" },
          { backgroundColor: "rgba(255,255,255,0)", duration: 2 },
          "<",
        );
      }

      tl.to(
        splitedDescription.lines,
        {
          yPercent: 320,
          rotate: 10,
          stagger: { each: 2, from: "end" },
          duration: 10,
        },
        "-=1.7",
      );

      tl.to(
        splitedTitle.chars,
        {
          opacity: 0,
          stagger: { each: 0.2, from: "end" },
          duration: 10,
        },
        "<+=0.7",
      );

      tl.to(square, { scale: 0, duration: 2 }, "<+=6");

      tl.fromTo(
        line,
        {
          scaleY: 1,
        },
        {
          scaleY: 0,
          duration: 4,
          ease: "none",
        },
      );
    }, container);

    return () => {
      refs.buttonRef.current?.classList.add(PROCESS_CTA_PENDING_CLASS);
      ctx.revert();
    };
  }, [fontsLoaded]);
}
