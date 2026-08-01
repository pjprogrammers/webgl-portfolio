"use client";

import { useEffect, useRef, useState } from "react";
import { registerTickerCallback } from "@/lib/ticker";
import { useCursorStore } from "@/stores/cursor-store";
import classNames from "classnames";

const lerp = (current: number, target: number, factor: number) =>
  current + (target - current) * factor;

const CIRCLE_LERP = 0.06;

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const smoothPositionRef = useRef({ x: 0, y: 0 });
  const addedElements = useRef(new WeakSet<HTMLElement>());
  const [enabled, setEnabled] = useState(false);

  const [cursorPressed, setCursorPressed] = useState(false);
  const cursorType = useCursorStore((s) => s.type);
  const setCursorType = useCursorStore((s) => s.setType);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const syncEnabled = () => setEnabled(media.matches);
    syncEnabled();
    media.addEventListener("change", syncEnabled);
    return () => media.removeEventListener("change", syncEnabled);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    addedElements.current = new WeakSet();

    const addEventListeners = () => {
      const dataEvents = Array.from(document.querySelectorAll("[data-event]"));

      dataEvents.forEach((evt) => {
        if (!(evt instanceof HTMLElement) || addedElements.current.has(evt))
          return;
        addedElements.current.add(evt);

        const eventType = evt.dataset.event?.toLowerCase();

        if (eventType === "hover") {
          evt.addEventListener("mouseover", () => setCursorType("hover"));
          evt.addEventListener("mouseleave", () => setCursorType("default"));
        }

        if (eventType === "simple-hover") {
          evt.addEventListener("mouseover", () =>
            setCursorType("simple-hover"),
          );
          evt.addEventListener("mouseleave", () => setCursorType("default"));
        }

        if (eventType === "text") {
          evt.addEventListener("mouseover", () => setCursorType("text"));
          evt.addEventListener("mouseleave", () => setCursorType("default"));
        }

        if (eventType === "drag") {
          evt.addEventListener("mouseover", () => setCursorType("drag"));
          evt.addEventListener("mouseleave", () => setCursorType("default"));
        }

        if (eventType === "hide") {
          evt.addEventListener("mouseover", () => setCursorType("hide"));
          evt.addEventListener("mouseleave", () => setCursorType("default"));
        }
      });
    };

    addEventListeners();

    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        addEventListeners();
      }, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const { setCursor, setActive } = useCursorStore.getState();

    const onMove = (event: MouseEvent) => {
      positionRef.current = { x: event.clientX, y: event.clientY };
      setCursor(
        { x: event.clientX, y: event.clientY },
        { width: window.innerWidth, height: window.innerHeight },
      );
      setActive(true);
    };

    const onLeave = () => setActive(false);

    const onMouseDown = () => setCursorPressed(true);
    const onMouseUp = () => setCursorPressed(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("blur", onMouseUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    smoothPositionRef.current = {
      x: positionRef.current.x || window.innerWidth / 2,
      y: positionRef.current.y || window.innerHeight / 2,
    };

    const unregister = registerTickerCallback(() => {
      const el = cursorRef.current;
      const circleEl = circleRef.current;
      if (!el || !circleEl) return;

      const { x: targetX, y: targetY } = positionRef.current;
      const smooth = smoothPositionRef.current;

      smooth.x = lerp(smooth.x, targetX, CIRCLE_LERP);
      smooth.y = lerp(smooth.y, targetY, CIRCLE_LERP);

      el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      circleEl.style.transform = `translate3d(${smooth.x}px, ${smooth.y}px, 0) translate(-50%, -50%)`;
    });

    return () => {
      observer.disconnect();
      if (debounceTimeout) clearTimeout(debounceTimeout);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("blur", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      unregister();
      setActive(false);
      setCursorPressed(false);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={circleRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100000001]"
      >
        <div
          className={classNames(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 will-change-transform rounded-full border border-brand-05/10 bg-brand-05/4 backdrop-blur-[1px] scale-0 transition-all duration-400",
            {
              "scale-100": cursorType === "hover",
            },
          )}
        ></div>
      </div>
      <div
        ref={cursorRef}
        aria-hidden
        className={classNames(
          "mix-blend-difference pointer-events-none fixed top-0 left-0 z-[100000002] h-1 w-1 will-change-transform transition-opacity duration-200",
          {
            "opacity-60!": cursorPressed,
            "opacity-0!": cursorType === "hide",
            "opacity-100!": cursorType !== "hide",
          },
        )}
      >
        <div
          className={classNames(
            "absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-brand-05 transition-all duration-200",
            {
              "bottom-1/2! translate-y-0!": cursorPressed,
              "-translate-y-full scale-60":
                cursorType === "hover" || cursorType === "simple-hover",
            },
          )}
        />
        <div
          className={classNames(
            "absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-brand-05 transition-all duration-200",
            {
              "top-1/2! translate-y-0!": cursorPressed,
              "translate-y-full scale-60":
                cursorType === "hover" || cursorType === "simple-hover",
            },
          )}
        />
        <div
          className={classNames(
            "absolute top-1/2 left-full -translate-y-1/2 w-1.5 h-0.5 bg-brand-05 transition-all duration-200",
            {
              "left-1/2! translate-x-0!": cursorPressed,
              "translate-x-full scale-60":
                cursorType === "hover" || cursorType === "simple-hover",
            },
          )}
        />
        <div
          className={classNames(
            "absolute top-1/2 right-full -translate-y-1/2 w-1.5 h-0.5 bg-brand-05 transition-all duration-200",
            {
              "right-1/2! translate-x-0!": cursorPressed,
              "-translate-x-full scale-60":
                cursorType === "hover" || cursorType === "simple-hover",
            },
          )}
        />
      </div>
    </>
  );
};

export default Cursor;
