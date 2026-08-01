"use client";

import { Button } from "@/components/atoms";
import { useGlobalStore } from "@/stores/global-store";
import { process } from "../process.mock";
import { useTranslations } from "next-intl";

const Process = () => {
  const t = useTranslations("home.process");
  const { setShowContactForm } = useGlobalStore();

  return (
    <section className="relative block tablet-portrait:hidden safearea-md">
      <div className="grid grid-cols-7 gap-c-48">
        <div className="col-span-full h-fit flex flex-col items-start gap-c-16 py-c-32 max-w-90">
          <h2
            data-start-from-zero
            className="js-s-print-opacity heading-2 font-instrument-serif"
          >
            {t("title")}
          </h2>
          <p className="js-s-lines body-md">{t("description")}</p>

          <Button onClick={() => setShowContactForm(true)}>{t("cta")}</Button>
        </div>

        <div className="relative col-span-6 col-start-2 mobile-landscape:col-span-5 mobile-landscape:col-start-3 flex flex-col gap-c-48">
          <div className="absolute top-0 left-0 w-px h-full">
            <div className="w-6 h-6 sticky top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                data-start="bottom top"
                data-end="bottom top-=40px"
                data-scrub={true}
                data-scale={0}
                className="js-s-fade-out absolute top-0 left-0 -translate-x-full mobile-landscape:translate-x-[-120%]! ml-px"
              >
                <svg
                  data-start="top center+=20px"
                  data-end="bottom center-=20px"
                  data-scrub={true}
                  data-scale={0}
                  className="js-s-fade-in drop-shadow-[0_0_24px_white]"
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
          </div>

          {process.map((item) => (
            <div key={item.id} className="flex flex-col mobile-landscape:pr-20">
              <p
                data-start="top center"
                data-end="bottom center"
                data-scrub={true}
                className="js-s-print-opacity body-xl text-brand-05/40"
              >
                {item.id}
              </p>
              <p
                data-start="top center"
                data-end="bottom center"
                data-scrub={true}
                className="js-s-print-opacity heading-3 font-instrument-serif"
              >
                {t(item.title)}
              </p>
              <p
                data-start="top center"
                data-end="bottom center"
                data-scrub={true}
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
