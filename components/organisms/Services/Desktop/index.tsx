"use client";

import { useRef } from "react";
import { services } from "../services.mock";
import { useServicesScrollAnimation } from "./useServicesScrollAnimation";
import classNames from "classnames";
import { useTranslations } from "next-intl";

const Services = () => {
  const t = useTranslations("home.services");
  const servicesSectionRef = useRef<HTMLElement>(null);
  const servicesContainerRef = useRef<HTMLDivElement>(null);
  const servicePanelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useServicesScrollAnimation(
    servicesSectionRef,
    servicePanelRefs,
    titleRef,
    descriptionRef,
  );

  return (
    <section
      ref={servicesSectionRef}
      className="relative z-10 h-[600vh] hidden tablet-portrait:block"
    >
      <div
        ref={servicesContainerRef}
        className="mobile-landscape:sticky top-0 mobile-landscape:h-screen pt-20 tablet-portrait:pt-30 desktop-sm:pt-20 desktop:pt-c-160 flex flex-col justify-between max-mobile-landscape:gap-12"
      >
        <div className="max-tablet-portrait:px-8 tablet-portrait:w-1/2 tablet-portrait:ml-auto desktop-sm:items-center">
          <div className="flex flex-col gap-c-24 w-fit! mx-auto">
            <h2
              ref={titleRef}
              className="overflow-hidden heading-2 font-instrument-serif w-full max-w-110 desktop-sm:max-w-130 desktop-lg:max-w-160 indent-20"
            >
              {t("title")}
            </h2>

            <p
              ref={descriptionRef}
              className="body-sm mobile-landscape:max-w-105 s-split-lines ml-20"
            >
              {t("description")}
            </p>
          </div>
        </div>

        <div className="relative max-mobile-landscape:flex max-mobile-landscape:flex-col max-mobile-landscape:gap-8">
          {services.map((service, serviceIndex) => (
            <div
              key={service.title}
              ref={(el) => {
                servicePanelRefs.current[serviceIndex] = el;
              }}
              className={classNames(
                "max-mobile-landscape:flex max-mobile-landscape:flex-col max-mobile-landscape:gap-2",
                {
                  " mobile-landscape:absolute inset-x-0 top-0":
                    serviceIndex > 0,
                },
              )}
            >
              <p
                data-service-title
                className="heading-3 mobile-landscape:heading-4 font-instrument-serif tablet-portrait:pb-3 desktop:pb-c-24 px-c-32 s-split-lines"
              >
                {t(service.title)}
              </p>
              <div className="grid mobile-landscape:grid-cols-3 overflow-hidden max-mobile-landscape:gap-2 max-mobile-landscape:px-4">
                {service.services.map((item, index) => (
                  <div
                    key={item.title}
                    data-service-card
                    className="h-full relative p-5 desktop-sm:p-5 desktop:p-c-32 tablet-portrait:aspect-400/500 desktop-sm:aspect-480/260 flex flex-col gap-2 desktop:gap-c-16 border-t border-white/1 bg-brand-100/10 backdrop-blur-xl"
                  >
                    <p
                      data-s-lines
                      className="heading-6 uppercase font-black s-split-lines"
                    >
                      {t(item.title)}
                    </p>
                    <p
                      data-s-lines
                      className="body-sm font-semibold s-split-lines"
                    >
                      {t(item.highlight)}
                    </p>
                    <p data-s-lines className="body-sm s-split-lines">
                      {t(item.description)}
                    </p>

                    {index < service.services.length - 1 && (
                      <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
