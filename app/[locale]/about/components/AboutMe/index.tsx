"use client";

import { useTranslations } from "next-intl";

const AboutMe = () => {
  const t = useTranslations("about");
  return (
    <section className="tablet-portrait:mt-c-320! pt-c-320! flex flex-col gap-40 safearea-md tablet-portrait:safearea-lg">
      <div className="ml-auto desktop-sm:ml-0 desktop-sm:grid grid-cols-2 desktop-sm:pr-c-32">
        <div></div>
        <div className="flex flex-col gap-c-16 tablet-portrait:gap-c-32 tablet-landscape:gap-c-48">
          <h2 className="js-s-print-opacity heading-2 font-instrument-serif">
            {t("about.title")}
          </h2>
          <div className="body-lg leading-[1.6em]! flex flex-col gap-c-32 max-w-140">
            <p className="js-s-lines">{t("about.p1")}</p>
            <p className="js-s-lines">{t("about.p2")}</p>
            <p className="js-s-lines">{t("about.p3")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-c-16 tablet-portrait:gap-c-32 tablet-landscape:gap-c-48">
        <p className="js-s-print-opacity heading-2 font-instrument-serif desktop-sm:max-w-50vw desktop-sm:w-[calc(50%+20px)] ml-8 mobile-landscape:ml-20 tablet-landscape:ml-80 desktop-sm:ml-auto">
          {t("currently.title")}
        </p>
        <p className="js-s-print-opacity body-lg leading-[1.6em]! text-justify indent-8 mobile-landscape:indent-20 tablet-landscape:indent-80 desktop-sm:indent-[calc(50%-20px)]">
          {t("currently.description")}
        </p>
      </div>
    </section>
  );
};

export default AboutMe;
