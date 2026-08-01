"use client";

import { Link } from "@/components/atoms";
import { useGlobalStore } from "@/stores/global-store";
import { useTranslations } from "next-intl";
import { LINKEDIN_URL, MAILTO } from "@/config/info.config";

const Footer = () => {
  const { setShowContactForm } = useGlobalStore();
  const t = useTranslations("footer");
  const tGlobals = useTranslations("globals");
  return (
    <footer
      data-dissolve="in"
      data-dissolve-start="top bottom"
      data-dissolve-end="top top"
      className="relative p-c-32 flex flex-col justify-between max-h-[calc(100vh-48px)] tablet-portrait:max-h-hero-screen-height h-screen overflow-hidden"
    >
      <div className="relative z-10 flex justify-between flex-col tablet-portrait:flex-row max-tablet-portrait:gap-c-32">
        <div className="js-s-lines flex flex-col">
          <p className="heading-6 font-instrument-serif text-brand-05/60">
            {t("dropALine")}
          </p>
          <Link
            isExternalLink
            href={MAILTO}
            className="heading-3 font-instrument-serif text-brand-05 italic leading-[0.8em]"
          >
            {tGlobals("email")}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-c-160">
          <div className="flex flex-col gap-4">
            <p className="js-s-lines heading-6 font-instrument-serif text-brand-05/60">
              {t("pages")}
            </p>
            <div className="js-s-lines flex flex-col gap-1">
              <Link hasProximityHover href="/" className="leading-[0.9em]">
                {tGlobals("pages.home")}
              </Link>
              <Link hasProximityHover href="/about" className="leading-[0.9em]">
                {tGlobals("pages.about")}
              </Link>
              <Link hasProximityHover href="/work" className="leading-[0.9em]">
                {tGlobals("pages.works")}
              </Link>
              <Link
                isTextLink
                data-event="hover"
                className="inherit leading-[0.9em]"
                onClick={() => setShowContactForm(true)}
              >
                {tGlobals("pages.contact")}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="js-s-lines heading-6 font-instrument-serif text-brand-05/60">
              {t("socialMedia")}
            </p>
            <div className="js-s-lines flex flex-col gap-1">
              <Link
                isExternalLink
                hasProximityHover
                href={LINKEDIN_URL}
                className="leading-[0.9em]"
              >
                {tGlobals("pages.linkedin")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-c-16">
        <div className="flex justify-between flex-col mobile-landscape:flex-row max-mobile-landscape:items-center">
          <p className="body-md text-brand-05">
            By <i>Jashan Singla</i> © 2026
          </p>

          <p className="body-md text-brand-05">Sirsa, Haryana, India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
