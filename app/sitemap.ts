import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/config/site.config";

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/work"];

  return routes.flatMap((route) =>
    routing.locales.map((locale) => {
      const path = `/${locale}${route}`;
      return {
        url: siteUrl(path),
        lastModified,
        changeFrequency: "monthly",
        priority: route === "" ? 1 : 0.8,
        alternates: {
          languages: {
            en: siteUrl(path),
            "x-default": siteUrl(path),
          },
        },
      };
    }),
  );
}
