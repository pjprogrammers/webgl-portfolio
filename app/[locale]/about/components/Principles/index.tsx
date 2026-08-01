"use client";

import { Button } from "@/components/atoms";
import { useGlobalStore } from "@/stores/global-store";
import { useTranslations } from "next-intl";

const Principles = () => {
  const { setShowContactForm } = useGlobalStore();
  const t = useTranslations("about");
  const tGlobals = useTranslations("globals");
  return (
    <section
      data-dissolve="out"
      data-dissolve-start="top bottom"
      data-dissolve-end="bottom top"
      className="container mobile-landscape:safearea-lg px-c-32! mobile-landscape:px-c-48! desktop-sm:px-c-80! desktop:px-c-160! mt-c-160! tablet-portrait:mt-c-320!"
    >
      <div className="grid tablet-portrait:grid-cols-2">
        <div />
        <div className="flex justify-center">
          <div className="flex flex-col gap-c-16 max-w-100">
            <h2
              data-start-from-zero={true}
              className="js-s-print-opacity heading-2 font-instrument-serif"
            >
              {t("approach.title")}
            </h2>
            <p className="js-s-lines body-sm">{t("approach.description")}</p>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-c-16 max-w-100 mt-c-48 tablet-portrait:mt-c-160">
          <h2
            data-start-from-zero={true}
            className="js-s-print-opacity heading-2 font-instrument-serif"
          >
            {t("purpose.title")}
          </h2>
          <p className="js-s-lines body-sm">{t("purpose.description")}</p>
        </div>

        <div />

        <div className="flex flex-col gap-c-16 max-w-100 mt-c-48 tablet-landscape:-mt-c-32">
          <h2
            data-start-from-zero={true}
            className="js-s-print-opacity heading-2 font-instrument-serif"
          >
            {t("whatToExpect.title")}
          </h2>
          <p className="js-s-lines body-sm">{t("whatToExpect.description")}</p>
        </div>
      </div>

      <div className="flex justify-center my-c-48 tablet-portrait:my-c-160">
        <Button
          onClick={() => setShowContactForm(true)}
          className="whitespace-nowrap"
        >
          {tGlobals("openToFreelance")}
        </Button>
      </div>
    </section>
  );
};

export default Principles;
