"use client";

import { useTranslations } from "next-intl";
import Reveal from "./reveal";
import WorkRow from "./work-row";
import { featuredWorks } from "./featured";

const SelectedWorks = () => {
  const t = useTranslations("home.selectedWorks");

  return (
    <section id="work" className="pt-c-320">
      <div className="mx-auto max-w-[1160px] px-8">
        <Reveal className="mx-auto mb-14 max-w-[760px] text-center">
          <div className="mb-[22px] body-md uppercase tracking-[0.1em] text-brand-30">
            {t("title")}
          </div>
          <h2 className="font-instrument-serif font-medium italic text-[clamp(1.8rem,4vw,3rem)] leading-[1.32] tracking-[-0.01em] text-brand-05">
            {t("headingPrefix")}
            <span className="text-brand-5000 not-italic">*</span> {t("headingSuffix")}
          </h2>
        </Reveal>
      </div>

      <div className="mt-20 max-[700px]:mt-14">
        {featuredWorks.map((item) => (
          <WorkRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default SelectedWorks;
