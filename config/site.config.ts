import { routing } from "@/i18n/routing";

export const SITE_URL = "https://jashansingla.is-a.dev";

export function siteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localizedPath(locale: string, path = ""): string {
  const p = path.startsWith("/") ? path : `/${path || ""}`;
  if (locale === routing.defaultLocale) {
    return p === "/" ? "" : p;
  }
  return `/${locale}${p === "/" ? "" : p}`;
}

export function localizedSiteUrl(locale: string, path = ""): string {
  return siteUrl(localizedPath(locale, path));
}
