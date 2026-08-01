import type { Metadata } from "next";
import WorksPageClient from "./WorksPageClient";
import { openGraphBase, ogImage } from "@/config/og.config";
import { localizedSiteUrl, siteUrl } from "@/config/site.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Works",
    description:
      "Selected projects and experiences in AI automation, cybersecurity, and intelligent solutions — built with a security-first mindset.",
    alternates: {
      canonical: localizedSiteUrl(locale, "/work"),
      languages: {
        en: siteUrl("/work"),
        "x-default": siteUrl("/work"),
      },
    },
    openGraph: {
      ...openGraphBase,
      url: localizedSiteUrl(locale, "/work"),
      title: "Works | Jashan Singla",
      description:
        "Selected projects and experiences in AI automation, cybersecurity, and intelligent solutions — built with a security-first mindset.",
      images: [ogImage("/og/og-works.png", "Works — Jashan Singla")],
    },
  };
}

export default function WorksPage() {
  return <WorksPageClient />;
}
