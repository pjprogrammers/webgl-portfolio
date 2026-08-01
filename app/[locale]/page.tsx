import type { Metadata } from "next";
import HomePage from "./HomePage";
import { openGraphBase, ogImage } from "@/config/og.config";
import { localizedSiteUrl, siteUrl } from "@/config/site.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Jashan Singla — AI Automation & Cybersecurity",
    description:
      "Cybersecurity enthusiast focused on penetration testing, web security, and digital forensics — with hands-on experience in AI automation, LLMOps, and agentic AI. Based in Sirsa, Haryana, India.",
    alternates: {
      canonical: localizedSiteUrl(locale),
      languages: {
        en: siteUrl("/"),
        "x-default": siteUrl("/"),
      },
    },
    openGraph: {
      ...openGraphBase,
      url: localizedSiteUrl(locale),
      title: "Jashan Singla — AI Automation & Cybersecurity",
      description:
        "Cybersecurity enthusiast focused on penetration testing, web security, and digital forensics — with hands-on experience in AI automation, LLMOps, and agentic AI. Based in Sirsa, Haryana, India.",
      images: [
        ogImage(
          "/og/og-home.png",
          "Jashan Singla — AI Automation & Cybersecurity",
        ),
      ],
    },
  };
}

export default function Page() {
  return <HomePage />;
}
