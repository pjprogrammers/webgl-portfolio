"use client";

import { useRef } from "react";
import { Link } from "@/components/atoms";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import WorksInfo, { WorksIndex } from "./components/WorksInfo";
import { MAILTO } from "@/config/info.config";
import { useWorksHeaderEntry } from "./useWorksHeaderEntry";

const CarouselCanvas = dynamic(
  () => import("@/components/webgl/CarouselCanvas"),
  { ssr: false },
);

export default function WorksPageClient() {
  const tGlobals = useTranslations("globals");
  const headerRef = useRef<HTMLDivElement>(null);

  useWorksHeaderEntry(headerRef);

  return (
    <main
      data-page-content
      className="relative w-screen h-screen overflow-hidden"
    >
      <CarouselCanvas />
      <div className="container fixed inset-0 z-1000 p-c-32 mobile-landscape:p-c-48 tablet-portrait:p-c-64 w-full h-full flex flex-col justify-between">
        <div
          ref={headerRef}
          className="h-1/4 tablet-portrait:h-fit tablet-landscape:h-1/6 flex items-end justify-between opacity-0 pt-c-16 tablet-portrait:pt-c-48 tablet-landscape:pt-0"
        >
          <div>
            <p data-works-line>{tGlobals("openToFreelance")}</p>
            <Link
              isExternalLink
              hasProximityHover
              href={MAILTO}
              data-works-line
            >
              {tGlobals("email")}
            </Link>
          </div>
          <div className="overflow-hidden">
            <div data-works-block>
              <WorksIndex />
            </div>
          </div>
        </div>

        <WorksInfo />
      </div>
    </main>
  );
}
