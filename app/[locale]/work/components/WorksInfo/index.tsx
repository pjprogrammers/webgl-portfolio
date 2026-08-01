"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/components/atoms";
import type { Work } from "@/components/organisms/SelectedWorks/works";
import { works } from "@/components/organisms/SelectedWorks/works";
import { getHoverSlideId, useCarouselStore } from "@/stores/carousel-store";
import { slideIdToWorkIndex } from "./slideIdToWorkIndex";
import { useWorksInfoAnimation } from "./useWorksInfoAnimation";
import { WorksIndexCounter } from "./WorksIndexCounter";

const SeeLiveArrow = () => (
  <svg
    width="14"
    height="12"
    viewBox="0 0 14 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.3643 5.65723L12.6562 6.36328L7.70605 11.3135L6.99902 10.6064L11.4551 6.15039H0V5.15039H11.4434L7 0.707031L7.70703 0L13.3643 5.65723Z"
      fill="white"
    />
  </svg>
);

type SeeLiveLinkProps = {
  href: string;
  className?: string;
};

function SeeLiveLink({ href, className }: SeeLiveLinkProps) {
  return (
    <Link isExternalLink className={className} href={href}>
      <span data-work-line>See live</span>
      <SeeLiveArrow />
    </Link>
  );
}

export function WorksIndex() {
  const hoverSlideId = useCarouselStore(getHoverSlideId);
  const centeredSlideId = useCarouselStore((state) => state.centeredSlideId);

  const activeWorkIndex = slideIdToWorkIndex(hoverSlideId);
  const counterWorkIndex =
    activeWorkIndex ?? slideIdToWorkIndex(centeredSlideId) ?? 0;

  const totalWorks =
    works.length <= 9 ? `0${works.length}` : String(works.length);

  return (
    <div className="flex items-baseline">
      <WorksIndexCounter index={counterWorkIndex} total={works.length} />
      <span>/{totalWorks}</span>
    </div>
  );
}

export default function WorksInfo() {
  const t = useTranslations("works");
  const tGlobals = useTranslations("globals");

  const pendingSlideId = useCarouselStore((state) => state.pendingSlideId);
  const commitCurrentSlideId = useCarouselStore(
    (state) => state.commitCurrentSlideId,
  );
  const completeSlideTransition = useCarouselStore(
    (state) => state.completeSlideTransition,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  const hasPendingRequest = pendingSlideId !== undefined;
  const targetWorkIndex = hasPendingRequest
    ? slideIdToWorkIndex(pendingSlideId ?? null)
    : null;

  const [visibleWork, setVisibleWork] = useState<Work | null>(null);

  const handleContentSwap = useCallback((index: number | null) => {
    setVisibleWork(index !== null ? works[index] : null);
  }, []);

  const handleContentCommit = useCallback(() => {
    commitCurrentSlideId();
  }, [commitCurrentSlideId]);

  const handleTransitionComplete = useCallback(() => {
    completeSlideTransition();
  }, [completeSlideTransition]);

  useWorksInfoAnimation(
    { containerRef, nameRef },
    targetWorkIndex,
    hasPendingRequest,
    handleContentSwap,
    handleContentCommit,
    handleTransitionComplete,
  );

  return (
    <div
      ref={containerRef}
      className="h-1/3 tablet-landscape:h-1/5 flex flex-col justify-end items-start tablet-portrait:grid tablet-portrait:grid-cols-[2fr_4fr] tablet-landscape:grid-cols-[2fr_4fr_1fr] gap-c-16 tablet-portrait:items-end"
    >
      <div className="w-full flex flex-row tablet-portrait:flex-col gap-2 items-end justify-between tablet-portrait:items-start">
        <div>
          <h2 ref={nameRef} className="heading-2 font-instrument-serif">
            {visibleWork?.name ?? "\u00A0"}
          </h2>
          <p className="body-xs" data-work-line>
            {visibleWork ? `${t("role")}: ${visibleWork.role}` : "\u00A0"}
          </p>
        </div>
        <div className="max-tablet-landscape:block tablet-landscape:hidden">
          {visibleWork ? (
            <SeeLiveLink
              href={visibleWork.link}
              className="italic body-lg flex items-center gap-2"
            />
          ) : (
            <span className="italic body-lg flex items-center gap-2 opacity-0 pointer-events-none">
              {tGlobals("seeLive")}
            </span>
          )}
        </div>
      </div>

      {visibleWork ? (
        <div className="grid grid-cols-1 mobile-landscape:grid-cols-[1fr_1.5fr] tablet-portrait:grid-cols-2 gap-c-16">
          <div className="flex flex-col gap-1">
            <p className="body-xl font-instrument-serif" data-work-line>
              {t("services")}
            </p>
            <ul className="body-xs">
              {visibleWork.services.map((service) => (
                <li key={service} data-work-line>
                  {service}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-1 tablet-portrait:max-w-60">
            <p className="body-xl font-instrument-serif" data-work-line>
              {t("toolsAndTechnologies")}
            </p>
            <p className="body-xs" data-work-line>
              {visibleWork.tools}
            </p>
          </div>
        </div>
      ) : null}

      <div className="hidden tablet-landscape:flex items-end justify-end">
        {visibleWork ? (
          <SeeLiveLink
            href={visibleWork.link}
            className="italic body-lg flex items-center gap-2"
          />
        ) : (
          <span className="italic body-lg flex items-center gap-2 opacity-0 pointer-events-none">
            {tGlobals("seeLive")}
          </span>
        )}
      </div>
    </div>
  );
}
