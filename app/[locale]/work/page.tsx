import type { Metadata } from "next";
import WorksPageClient from "./WorksPageClient";
import { siteUrl } from "@/config/site.config";

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
      canonical: siteUrl(`/${locale}/work`),
      languages: {
        en: siteUrl("/en/work"),
        "x-default": siteUrl("/en/work"),
      },
    },
    openGraph: {
      url: siteUrl(`/${locale}/work`),
      images: [{ url: "/og/og-works.png" }],
    },
  };
}

export default function WorksPage() {
  return <WorksPageClient />;
}
