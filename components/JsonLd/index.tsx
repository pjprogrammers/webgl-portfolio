import { siteUrl } from "@/config/site.config";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jashan Singla",
    url: siteUrl(),
    email: "jashansingla30@gmail.com",
    jobTitle: "AI Automation & Intelligent Solutions Intern",
    description:
      "Cybersecurity enthusiast focused on penetration testing, web security, and digital forensics — with hands-on experience in AI automation, LLMOps, and agentic AI.",
    image: siteUrl("/og/og-personal-about.png"),
    sameAs: ["https://www.linkedin.com/in/singlajashan/"],
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
