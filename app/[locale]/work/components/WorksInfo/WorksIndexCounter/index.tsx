"use client";

import { useLayoutEffect, useMemo, useRef } from "react";

import { gsap } from "@/lib/gsap/registerPlugin";

import {
  buildIndexSlots,
  getAnimatedTargetSlot,
  getCarouselDirection,
  getNormalizedSlot,
} from "./utils";

const COUNTER_DURATION = 0.4;
const COUNTER_EASE = "power3.out";

type WorksIndexCounterProps = {
  index: number;
  total: number;
  className?: string;
};

export function WorksIndexCounter({
  index,
  total,
  className,
}: WorksIndexCounterProps) {
  const maskRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(index);
  const hasInitializedRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const slots = useMemo(() => buildIndexSlots(total), [total]);

  const getStepHeight = () => {
    const mask = maskRef.current;
    if (!mask) return 0;

    const measured = mask.getBoundingClientRect().height;
    if (measured > 0) return measured;

    const firstItem = trackRef.current?.firstElementChild as HTMLElement | null;
    return firstItem?.getBoundingClientRect().height ?? 0;
  };

  const setTrackY = (slot: number) => {
    const track = trackRef.current;
    const step = getStepHeight();
    if (!track || step <= 0) return;

    gsap.set(track, { y: -slot * step });
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (!hasInitializedRef.current) {
      const step = getStepHeight();
      if (step <= 0) return;

      setTrackY(getNormalizedSlot(index));
      prevIndexRef.current = index;
      hasInitializedRef.current = true;
      return;
    }

    const prevIndex = prevIndexRef.current;
    if (prevIndex === index) return;

    const direction = getCarouselDirection(prevIndex, index, total);
    const fromSlot = getNormalizedSlot(prevIndex);
    const toSlot = getAnimatedTargetSlot(prevIndex, index, direction, total);
    const step = getStepHeight();

    if (step <= 0) return;

    tweenRef.current?.kill();
    setTrackY(fromSlot);

    tweenRef.current = gsap.to(track, {
      y: -toSlot * step,
      duration: COUNTER_DURATION,
      ease: COUNTER_EASE,
      overwrite: true,
      onComplete: () => {
        setTrackY(getNormalizedSlot(index));
        tweenRef.current = null;
      },
    });

    prevIndexRef.current = index;

    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [index, total]);

  if (total <= 0) return null;

  return (
    <div
      ref={maskRef}
      className={`inline-block h-[1em] w-10 overflow-hidden leading-none ${className ?? ""}`}
    >
      <div ref={trackRef} className="will-change-transform">
        {slots.map((label, slotIndex) => (
          <span
            key={`${label}-${slotIndex}`}
            className="block h-[1em] w-full text-right tabular-nums leading-none"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
