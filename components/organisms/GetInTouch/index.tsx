"use client";

import { Link } from "@/components/atoms";
import { useGlobalStore } from "@/stores/global-store";
import { useTranslations } from "next-intl";
import { MAILTO } from "@/config/info.config";

const GetInTouch = () => {
  const { setShowContactForm } = useGlobalStore();
  const t = useTranslations("getInTouch");
  return (
    <section className="relative pt-c-160 pb-c-320">
      <p className="flex flex-col items-center display-140">
        <span className="js-s-lines w-full text-center">
          <span className="w-fit mobile-landscape:-ml-c-80">{t("line1")}</span>
        </span>
        <span className="js-s-lines w-full text-center">
          <span>{t("line2")}</span>
        </span>
        <span className="js-s-lines w-full text-center">
          <Link
            isExternalLink
            href={MAILTO}
            className="w-fit mobile-landscape:ml-c-80 underline"
          >
            {t("line3")}
          </Link>
        </span>
        <span className="js-s-lines w-full text-center">
          <span className="w-fit mobile-landscape:-ml-c-320">{t("line4")}</span>
        </span>
        <span className="js-s-lines w-full text-center">
          <span
            onClick={() => setShowContactForm(true)}
            className="w-fit mobile-landscape:-ml-c-360 underline"
          >
            {t("line5")}
          </span>
        </span>
      </p>
    </section>
  );
};

export default GetInTouch;
