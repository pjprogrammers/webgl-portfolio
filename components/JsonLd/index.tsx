import { siteUrl } from "@/config/site.config";
import { SITE_NAME } from "@/config/og.config";

export function JsonLd() {
  const personId = `${siteUrl("/")}#person`;
  const websiteId = `${siteUrl("/")}#website`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: "Jashan Singla",
        alternateName: ["Jashan", "jashansingla"],
        givenName: "Jashan",
        familyName: "Singla",
        url: siteUrl(),
        email: "jashansingla30@gmail.com",
        jobTitle: "AI Automation & Intelligent Solutions Intern",
        description:
          "Cybersecurity enthusiast focused on penetration testing, web security, and digital forensics — with hands-on experience in AI automation, LLMOps, and agentic AI. Personal portfolio of Jashan Singla, based in Sirsa, Haryana, India.",
        image: siteUrl("/og/og-personal-about.png"),
        sameAs: ["https://www.linkedin.com/in/singlajashan/"],
        knowsLanguage: "English",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sirsa",
          addressRegion: "Haryana",
          addressCountry: "IN",
        },
        knowsAbout: [
          "Penetration Testing",
          "Web Security",
          "Digital Forensics",
          "OSINT",
          "AI Automation",
          "LLMOps",
          "Agentic AI",
          "Workflow Automation",
          "SQL Injection",
          "XSS",
          "CSRF",
          "IDOR",
          "Threat Intelligence",
        ],
        worksFor: {
          "@type": "Organization",
          name: "CSRBOX",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "Jan Nayak Ch. Devi Lal Vidyapeeth, Sirsa",
        },
        offers: {
          "@type": "Offer",
          description:
            "Cybersecurity and AI automation services",
          areaServed: "Worldwide",
          availableLanguage: "English",
        },
        mainEntityOfPage: siteUrl("/"),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl(),
        name: SITE_NAME,
        description:
          "Jashan Singla — AI automation & cybersecurity. Penetration testing, web security, digital forensics, LLMOps, and agentic AI.",
        inLanguage: "en",
        publisher: { "@id": personId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
