"use client";

import { Button } from "@/components/atoms";
import { useGlobalStore } from "@/stores/global-store";
import { useRef } from "react";
import { process } from "../process.mock";
import {
  PROCESS_CTA_PENDING_CLASS,
  useProcessScrollAnimation,
} from "./useProcessScrollAnimation";
import { useTranslations } from "next-intl";

const Process = () => {
  const t = useTranslations("home.process");
  const { setShowContactForm } = useGlobalStore();
  const lineRef = useRef(null);
  const squareRef = useRef(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useProcessScrollAnimation({
    containerRef,
    lineRef,
    squareRef,
    titleRef,
    descriptionRef,
    buttonRef,
  });

  return (
    <section
      ref={containerRef}
      className="relative -mt-c-160 hidden tablet-portrait:block"
    >
      <div className="absolute top-0 left-c-16 tablet-portrait:left-1/2 w-px h-full">
        <div
          ref={lineRef}
          className="absolute top-0 left-1/2 w-px h-full tablet-portrait:bg-brand-05/10"
        />
        <div
          ref={squareRef}
          className="w-6 h-6 sticky top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <svg
            className="absolute top-1/2 left-1/2 -translate-1/2 ml-px drop-shadow-[0_0_24px_white]"
            width="57"
            height="57"
            viewBox="0 0 57 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28.2842 -0.000976562C28.2867 0.0402974 29.1893 15.0456 35.3555 21.2119C41.5178 27.3743 56.5082 28.2796 56.5684 28.2832C56.5082 28.2868 41.5178 29.1922 35.3555 35.3545C29.1893 41.5208 28.2867 56.5261 28.2842 56.5674C28.2816 56.5236 27.3786 41.5202 21.2129 35.3545C15.0381 29.1798 0 28.2832 0 28.2832C0 28.2832 15.0381 27.3866 21.2129 21.2119C27.3786 15.0462 28.2816 0.0428417 28.2842 -0.000976562Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <div className="grid tablet-portrait:grid-cols-2">
        <div className="h-fit tablet-portrait:sticky top-1/2 tablet-portrait:-translate-y-1/2 -mb-45vh flex flex-col tablet-portrait:items-end items-start tablet-portrait:justify-center gap-c-16 desktop:gap-c-24 p-c-32 tablet-portrait:p-c-48">
          <h2
            ref={titleRef}
            className="heading-2 font-instrument-serif tablet-portrait:text-right max-w-80 desktop-sm:max-w-100 desktop-lg:max-w-130"
          >
            {t("title")}
          </h2>
          <p
            ref={descriptionRef}
            className="body-md max-w-90 tablet-portrait:text-right"
          >
            {t("description")}
          </p>

          <Button
            ref={buttonRef}
            noAnimation
            className={PROCESS_CTA_PENDING_CLASS}
            onClick={() => setShowContactForm(true)}
          >
            {t("cta")}
          </Button>
        </div>

        <div className="flex flex-col gap-c-120 pt-50vh px-c-48 pb-50vh">
          {process.map((item) => (
            <div
              key={item.id}
              className="js-s-fade-in-outs flex flex-col max-w-80"
            >
              <p
                data-start="top center"
                data-end="bottom center"
                className="js-s-print-opacity body-xl text-brand-05/40"
              >
                {item.id}
              </p>
              <p
                data-start="top center"
                data-end="bottom center"
                className="js-s-print-opacity heading-3 font-instrument-serif"
              >
                {t(item.title)}
              </p>
              <p
                data-start="top center"
                data-end="bottom center"
                className="js-s-print-opacity body-lg text-brand-05/80"
              >
                {t(item.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
