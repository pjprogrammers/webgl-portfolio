import { siteUrl } from "./site.config";

export const SITE_NAME = "Jashan Singla";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type OgImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: "image/png";
};

export function ogImage(path: string, alt = SITE_NAME): OgImage {
  return {
    url: siteUrl(path),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt,
    type: "image/png",
  };
}

export const openGraphBase = {
  type: "website" as const,
  locale: "en_US",
  siteName: SITE_NAME,
};
