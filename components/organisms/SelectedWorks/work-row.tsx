"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/components/atoms";
import Card from "./card";
import Reveal from "./reveal";
import type { FeaturedWork } from "./featured";

const MAX_ANGLE = 28;
const MAX_SCALE = 0.12;
// Small screens scroll fast (flick/gesture), so use a stronger angle and a
// snappier lerp there — otherwise the bend never catches up while the card
// is on screen and it reads as no tilt at all.
const MOBILE_MAX_ANGLE = 42;
const MOBILE_MAX_SCALE = 0.18;
const LERP = 0.2;

function useScrollBend(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(max-width: 1024px)");
    let mobile = mq.matches;

    let current = 0;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);

      const maxAngle = mobile ? MOBILE_MAX_ANGLE : MAX_ANGLE;
      const maxScale = mobile ? MOBILE_MAX_SCALE : MAX_SCALE;

      const vh = window.innerHeight;
      const vCenter = vh / 2;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      // -1 when the card center sits below the viewport center, 0 at center,
      // +1 when it sits above. Mirrors the reference implementation.
      let progress = (vCenter - elCenter) / (vCenter + rect.height / 2);
      progress = Math.max(-1, Math.min(1, progress));

      current += (progress - current) * LERP;

      const angle = current * maxAngle;
      const scale = 1 - Math.abs(current) * maxScale;
      el.style.transform = `perspective(1000px) rotateX(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    };

    const onMq = () => {
      mobile = mq.matches;
    };
    mq.addEventListener("change", onMq);

    loop();
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", onMq);
    };
  }, [ref]);
}

const WorkRow = ({ item }: { item: FeaturedWork }) => {
  const tGlobals = useTranslations("globals");
  const imgRef = useRef<HTMLDivElement>(null);
  useScrollBend(imgRef);

  return (
    <div className="relative">
      <Reveal>
        <Link
          href={`/work#${item.id}`}
          aria-label={item.ariaLabel}
          className="group block cursor-pointer"
        >
          <div
            ref={imgRef}
            className="mx-auto w-[min(920px,84%)] origin-center overflow-hidden transition-[filter] duration-[0.25s] ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform group-hover:brightness-[1.08] max-[700px]:w-full"
          >
            <Card item={item} />
          </div>
        </Link>

        <div className="pointer-events-none absolute bottom-4 left-8 right-8 flex items-center justify-between max-[700px]:static max-[700px]:bottom-auto max-[700px]:left-auto max-[700px]:right-auto max-[700px]:border-b max-[700px]:border-brand-05/10 max-[700px]:px-5 max-[700px]:py-[14px]">
          <span className="pointer-events-auto font-instrument-serif italic text-base text-brand-05">
            {item.name}
          </span>
          <Link
            isExternalLink
            href={item.href}
            className="pointer-events-auto border-b border-transparent text-sm text-brand-30 transition-colors duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:border-brand-5000 hover:text-brand-5000"
          >
            {tGlobals("seeLive")}
          </Link>
        </div>
      </Reveal>
    </div>
  );
};

export default WorkRow;
