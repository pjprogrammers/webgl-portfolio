import type { Metadata } from "next";
import { Footer, GetInTouch } from "@/components/organisms";
import { openGraphBase, ogImage } from "@/config/og.config";
import { localizedSiteUrl, siteUrl } from "@/config/site.config";
import { Hero, AboutMe, LinkedinSummary, Principles } from "./components";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "About",
    description:
      "Cybersecurity enthusiast and AI automation intern. Hands-on experience in penetration testing, web security, digital forensics, OSINT, LLMOps, and agentic AI. Currently pursuing a BTech in Artificial Intelligence at Jan Nayak Ch. Devi Lal Vidyapeeth, Sirsa.",
    alternates: {
      canonical: localizedSiteUrl(locale, "/about"),
      languages: {
        en: siteUrl("/about"),
        "x-default": siteUrl("/about"),
      },
    },
    openGraph: {
      ...openGraphBase,
      url: localizedSiteUrl(locale, "/about"),
      title: "About | Jashan Singla",
      description:
        "Cybersecurity enthusiast and AI automation intern. Hands-on experience in penetration testing, web security, digital forensics, OSINT, LLMOps, and agentic AI.",
      images: [ogImage("/og/og-about.png", "About — Jashan Singla")],
    },
  };
}

const AboutPage = () => {
  return (
    <main data-page-content className="container relative z-10">
      <Hero />
      <AboutMe />
      <LinkedinSummary />
      <Principles />
      <GetInTouch />
      <Footer />
    </main>
  );
};

export default AboutPage;
