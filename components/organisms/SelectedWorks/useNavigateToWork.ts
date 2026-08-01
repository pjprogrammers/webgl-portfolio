"use client";

import { useCallback, type MouseEvent } from "react";

import { formatSlideId } from "@/components/webgl/CarouselCanvas/slides.data";
import { usePathname, useRouter } from "@/i18n/navigation";
import { handleParticleTransitionClick } from "@/lib/webgl/particlePageTransition";
import { useCarouselStore } from "@/stores/carousel-store";

export function useNavigateToWork() {
  const pathname = usePathname();
  const router = useRouter();

  return useCallback(
    async (workIndex: number, event: MouseEvent<HTMLElement>) => {
      const slideId = formatSlideId(workIndex);
      useCarouselStore.getState().requestSlideSelection(slideId);

      const navigate = await handleParticleTransitionClick(
        event as unknown as MouseEvent<HTMLAnchorElement>,
        "/work",
        pathname,
        () => router.push("/work"),
      );

      navigate?.();
    },
    [pathname, router],
  );
}
