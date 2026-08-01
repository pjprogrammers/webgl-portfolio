"use client";

import { Button, Link } from "@/components/atoms";
import Image from "next/image";
import { useRef } from "react";
import useMediaQuery, { bp, maxWidth } from "@/lib/hooks/useMediaQuery";
import { useNavigateToWork } from "./useNavigateToWork";
import { useWorkScrollSync } from "./useWorkScrollSync";
import { useWorkImageParallax } from "./useWorkImageParallax";
import { selectedWorks } from "./works";
import { useTranslations } from "next-intl";

const SelectedWorks = () => {
  const t = useTranslations("home.selectedWorks");
  const tGlobals = useTranslations("globals");
  const worksContainerRef = useRef<HTMLDivElement>(null);
  const workCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const studioNameRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const workImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const seeLiveRef = useRef<HTMLAnchorElement>(null);
  const navigateToWork = useNavigateToWork();

  // En tablet/mobile (≤1024px) no usamos la distorsión WebGL: mostramos una
  // imagen normal con parallax por scroll. En desktop renderizamos el placeholder
  // `data-type="image"` que el RigCanvas detecta para superponer el plano con
  // distorsión. Arranca en `false` (SSR/primer render) para preservar el
  // comportamiento de desktop y el timing con el que el WebGL detecta los
  // placeholders.
  const useStaticImage = useMediaQuery(maxWidth(bp.tabletLandscape));

  useWorkScrollSync(workCardRefs, studioNameRefs, seeLiveRef, selectedWorks);
  useWorkImageParallax(workImageRefs, useStaticImage);

  return (
    <section
      data-geometry="diamond"
      data-dissolve="in"
      data-start="bottom 100%"
      data-end="bottom -50%"
      className="container px-8 tablet-portrait:safearea-lg pt-c-320 grid grid-cols-1 tablet-portrait:grid-cols-[1fr_60vw_1fr] desktop-sm:grid-cols-[1fr_600px_1fr] desktop:grid-cols-[1fr_800px_1fr] gap-c-32"
    >
      <div className="hidden tablet-portrait:block sticky top-1/2 h-fit">
        <div className="grid *:col-start-1 *:row-start-1 overflow-hidden">
          {selectedWorks.map((work, workIndex) => (
            <p
              key={work.name}
              ref={(el) => {
                studioNameRefs.current[workIndex] = el;
              }}
              className="heading-5 leading-[1.4em] font-instrument-serif s-split-lines"
              aria-hidden
            >
              {work.name}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-12 desktop-sm:gap-20 desktop:gap-c-120">
        <div className="flex flex-col gap-c-16">
          <h2 className="js-s-lines text-center body-md uppercase">
            {t("title")}
          </h2>
          <p className="js-s-print-opacity text-center heading-2 leading-[1.1em] font-instrument-serif">
            {t("description")}
          </p>
        </div>

        <div
          ref={worksContainerRef}
          className="flex flex-col gap-12 tablet-portrait:gap-c-32"
        >
          {selectedWorks.map((work, workIndex) => (
            <div
              key={work.name}
              className="flex flex-col gap-2 tablet-portrait:block"
            >
              <div
                ref={(el) => {
                  workCardRefs.current[workIndex] = el;
                }}
                className="aspect-800/500 w-full relative"
              >
                <button
                  type="button"
                  data-event="hover"
                  aria-label={work.name}
                  className="absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0"
                  onClick={(event) => {
                    void navigateToWork(workIndex, event);
                  }}
                />
                {useStaticImage ? (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image
                      ref={(el) => {
                        workImageRefs.current[workIndex] = el;
                      }}
                      src={work.image}
                      alt={work.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="w-full h-full object-cover scale-[1.2]"
                    />
                  </div>
                ) : (
                  <div
                    data-type="image"
                    data-src={work.image}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                )}
              </div>

              <div className="flex tablet-portrait:hidden items-center justify-between">
                <p className="js-s-lines heading-5 leading-[1.4em] font-instrument-serif">
                  {work.name}
                </p>

                <Link
                  isExternalLink
                  href={work.link}
                  className="js-s-lines font-instrument-serif body-lg underline"
                >
                  See live
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-c-24">
          <p className="js-s-lines body-md max-w-100">{t("copy")}</p>

          <Link href="/work">
            <Button>{t("cta")}</Button>
          </Link>
        </div>
      </div>

      <Link
        ref={seeLiveRef}
        isExternalLink
        hasProximityHover
        href={selectedWorks[0].link}
        className="hidden tablet-portrait:block sticky w-fit top-1/2 h-fit ml-auto font-instrument-serif body-lg underline cursor-pointer overflow-hidden s-split-lines"
      >
        {tGlobals("seeLive")}
      </Link>
    </section>
  );
};

export default SelectedWorks;
