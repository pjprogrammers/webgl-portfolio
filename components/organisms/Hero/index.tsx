"use client";

import { useTranslations } from "next-intl";
import { Button, Link } from "@/components/atoms";
import { useGlobalStore } from "@/stores/global-store";

const Hero = () => {
  const { setShowContactForm } = useGlobalStore();
  const t = useTranslations("home.hero");
  return (
    <section
      data-home-hero
      data-geometry="star"
      data-geometry-entry-animation={false}
      className="mt-navbar-height pt-4 px-8 pb-10 tablet-portrait:pt-6 tablet-portrait:px-12 tablet-landscape:px-16 desktop-sm:px-20 tablet-portrait:pb-10 desktop:pt-10 desktop:px-24 desktop:pb-20 desktop-lg:pt-20 desktop-lg:px-30 desktop-lg:pb-30 min-h-hero-screen-height flex flex-col justify-between"
    >
      <div className="flex flex-col gap-3">
        <p data-home-hero-label className="js-s-lines opacity-0">
          {t("label")}
        </p>
        <h1
          data-home-hero-title
          className="heading-1 font-instrument-serif italic max-w-80 tablet-portrait:max-w-120 desktop-lg:max-w-150 opacity-0"
          dangerouslySetInnerHTML={{ __html: t.raw("title") }}
        />
      </div>

      <div className="w-fit tablet-landscape:w-auto ml-auto tablet-landscape:ml-[initial] gap-c-16 flex flex-col-reverse tablet-landscape:flex-row items-start tablet-landscape:items-end justify-start tablet-landscape:justify-between">
        <div className="flex gap-2 tablet-landscape:gap-4">
          <Button
            data-home-hero-cta
            noAnimation
            className="invisible"
            onClick={() => setShowContactForm(true)}
          >
            {t("cta1")}
          </Button>
          <Link href="/work">
            <Button data-home-hero-cta noAnimation className="invisible">
              {t("cta2")}
            </Button>
          </Link>
        </div>

        <div className="w-full mobile-landscape:w-90 tablet-portrait:shrink-0">
          <p
            data-home-hero-description
            className="mobile-landscape:text-justify opacity-0 h-fit!"
          >
            {t("description")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
