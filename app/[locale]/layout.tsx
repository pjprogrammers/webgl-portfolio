import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Red_Hat_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/components/providers/app-providers";
import { JsonLd } from "@/components/JsonLd";
import { siteUrl } from "@/config/site.config";
import "../globals.css";
import { GlobalParticleCanvas, RigCanvas } from "@/components/webgl";
import { Navbar, Loader, Contact } from "@/components/organisms";
import { Cursor } from "@/components/atoms";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(siteUrl()),

    title: {
      default: "Jashan Singla — AI Automation & Cybersecurity",
      template: "%s | Jashan Singla",
    },

    description:
      "Cybersecurity enthusiast focused on penetration testing, web security, and digital forensics — with hands-on experience in AI automation, LLMOps, and agentic AI. Based in Sirsa, Haryana, India.",

    keywords: [
      "Cybersecurity",
      "Penetration Testing",
      "Web Security",
      "Digital Forensics",
      "OSINT",
      "AI Automation",
      "LLMOps",
      "Agentic AI",
      "Workflow Automation",
      "Intelligent Solutions",
      "SQL Injection",
      "XSS",
      "CSRF",
      "IDOR",
      "Threat Intelligence",
      "Burp Suite",
      "Nmap",
      "Metasploit",
      "Wireshark",
      "Jashan Singla",
      "Sirsa developer",
      "Haryana cybersecurity",
      "India AI intern",
      "IBM SkillsBuild",
    ],

    authors: [{ name: "Jashan Singla", url: siteUrl() }],
    creator: "Jashan Singla",
    publisher: "Jashan Singla",

    alternates: {
      canonical: siteUrl(`/${locale}`),
      languages: {
        en: siteUrl("/en"),
        "x-default": siteUrl("/en"),
      },
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl(`/${locale}`),
      siteName: "Jashan Singla",
      title: "Jashan Singla — AI Automation & Cybersecurity",
      description:
        "Cybersecurity enthusiast and AI automation intern building intelligent systems with security at the core. Based in Sirsa, Haryana, India.",
      images: [
        {
          url: "/og/og-home.png",
          width: 1200,
          height: 630,
          alt: "Jashan Singla — AI Automation & Cybersecurity",
          type: "image/png",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Jashan Singla — AI Automation & Cybersecurity",
      description:
        "Cybersecurity enthusiast and AI automation intern building intelligent systems with security at the core.",
      images: ["/og/og-default.png"],
    },

    icons: {
      icon: [
        { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        {
          url: "/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
      shortcut: "/favicon.ico",
    },

    manifest: "/site.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${instrumentSerif.variable} ${redHatDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-red-hat-display">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "history.scrollRestoration='manual';window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;",
          }}
        />
        <JsonLd />
        {/* <div className="bg-fallback" /> */}
        <div
          className="fixed inset-0 z-[100000] pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage: "url(/images/assets/noise.png)",
            backgroundRepeat: "repeat",
            backgroundPosition: "center center",
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <RigCanvas />
            <GlobalParticleCanvas />
            <Navbar />
            <Cursor />
            {children}
            <Contact />
            <Loader />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
