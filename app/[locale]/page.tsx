import type { Metadata } from "next";
import HomePage from "./HomePage";
import { siteUrl } from "@/config/site.config";

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
      canonical: siteUrl(`/${locale}`),
      languages: {
        en: siteUrl("/en"),
        "x-default": siteUrl("/en"),
      },
    },
    openGraph: {
      url: siteUrl(`/${locale}`),
      images: [{ url: "/og/og-home.png" }],
    },
  };
}

export default function Page() {
  return <HomePage />;
}
