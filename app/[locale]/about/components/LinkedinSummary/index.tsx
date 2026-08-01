"use client";

import { Link } from "@/components/atoms";
import { useTranslations } from "next-intl";
import { LINKEDIN_URL } from "@/config/info.config";

type Experience = {
  classNames: string;
  company: string;
  role: string;
  dates: string;
  highlights: string[];
};

const experiences: Experience[] = [
  {
    classNames: "flex row-span-2 flex-col gap-1 tablet-portrait:gap-c-16",
    company: "CSRBOX (BharatCares)",
    role: "AI Automation & Intelligent Solutions Intern",
    dates: "June 2026 - Present",
    highlights: [
      "Selected for the IBM SkillsBuild Academic Internship 2026 (with AICTE)",
      "AI automation, workflow orchestration, and AI-powered project development",
      "Fine-tuning LLMs for domain-specific applications",
    ],
  },
  {
    classNames: "flex flex-col gap-1 tablet-portrait:gap-c-16",
    company: "Cyber Secured India",
    role: "OSINT Intern",
    dates: "September 2025 · Remote",
    highlights: [
      "CTRL. ALT. ACT. Internship (4 weeks) with MKITOS",
      "Image and metadata analysis with Google Lens, TinEye, Yandex, and Google Earth",
      "Investigated fake news networks, phishing sites, and malicious domains",
      "Awarded the Achievers Certificate",
    ],
  },
  {
    classNames:
      "flex flex-col gap-1 tablet-portrait:gap-c-16 mt-c-48 tablet-portrait:mt-0",
    company: "Cyber Secured India",
    role: "Cybersecurity and Forensics Intern",
    dates: "April 2025 - July 2025 · Haryana, India / Remote",
    highlights: [
      "Penetration testing and vulnerability assessment in simulated environments",
      "Security tools: Wireshark, Nmap, Burp Suite, and Metasploit",
      "Technical reports with remediation strategies and preventive measures",
      "Digital forensics, ethical hacking, and incident response",
    ],
  },
];

const LinkedinSummary = () => {
  const t = useTranslations("about");
  return (
    <section
      data-white-shader={true}
      className="relative text-brand-100 py-c-320 mt-c-320"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-red-500/0" />
      <div className="relative z-10 safearea-sm tablet-portrait:safearea-md desktop-sm:safearea-lg">
        {/* ///// Tools and Technologies ///// */}
        <div className="flex flex-col gap-c-32">
          <h2
            data-start-from-zero={true}
            className="js-s-print-opacity heading-2 font-instrument-serif w-80"
          >
            {t("toolsAndTechnologies.title")}
          </h2>
          <div className="columns-2 mobile-landscape:columns-3 tablet-portrait:columns-4 column-gap-c-16 w-fit *:mb-c-16 *:h-fit *:break-inside-avoid">
            <div
              data-delay="0"
              className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg"
            >
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                AI & Automation
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">LLMOps</li>
                <li className="opacity-80 js-s-lines">Agentic AI</li>
                <li className="opacity-80 js-s-lines">Workflow Automation</li>
                <li className="opacity-80 js-s-lines">Prompt Engineering</li>
              </ul>
            </div>

            <div
              data-delay="0"
              className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg"
            >
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                Web Security
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">Burp Suite</li>
                <li className="opacity-80 js-s-lines">Nmap</li>
                <li className="opacity-80 js-s-lines">Metasploit</li>
                <li className="opacity-80 js-s-lines">Wireshark</li>
              </ul>
            </div>

            <div
              data-delay="0.2"
              className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg"
            >
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                OSINT & Forensics
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">Google Lens</li>
                <li className="opacity-80 js-s-lines">TinEye</li>
                <li className="opacity-80 js-s-lines">Yandex</li>
                <li className="opacity-80 js-s-lines">Google Earth</li>
              </ul>
            </div>

            <div className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg">
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                Programming
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">Python</li>
                <li className="opacity-80 js-s-lines">SQL</li>
                <li className="opacity-80 js-s-lines">Bash</li>
                <li className="opacity-80 js-s-lines">JavaScript</li>
              </ul>
            </div>

            <div
              data-delay="0.4"
              className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg"
            >
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                Frameworks & Standards
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">OWASP Top 10</li>
                <li className="opacity-80 js-s-lines">MITRE ATT&CK</li>
                <li className="opacity-80 js-s-lines">NIST CSF</li>
                <li className="opacity-80 js-s-lines">OWASP ASVS</li>
              </ul>
            </div>

            <div
              data-delay="0.6"
              className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg"
            >
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                Operating Systems
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">Kali Linux</li>
                <li className="opacity-80 js-s-lines">Linux</li>
                <li className="opacity-80 js-s-lines">Windows</li>
              </ul>
            </div>

            <div
              data-delay="0.6"
              className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg"
            >
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                AI Tools & Platforms
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">IBM watsonx</li>
                <li className="opacity-80 js-s-lines">OpenAI API</li>
                <li className="opacity-80 js-s-lines">LangChain</li>
                <li className="opacity-80 js-s-lines">n8n</li>
              </ul>
            </div>

            <div
              data-delay="0.2"
              className="js-s-fade flex h-fit max-w-full! flex-col p-3 min-w-40 w-full tablet-landscape:max-w-40 bg-brand-05 border border-brand-10/40 rounded-lg"
            >
              <h3 className="heading-6 font-instrument-serif js-s-lines">
                Development
              </h3>
              <ul className="body-sm">
                <li className="opacity-80 js-s-lines">React</li>
                <li className="opacity-80 js-s-lines">Next.js</li>
                <li className="opacity-80 js-s-lines">Node.js</li>
                <li className="opacity-80 js-s-lines">Git</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ///// Expertise ///// */}

        <div className="mobile-landscape:flex justify-end mt-c-48 desktop-sm:-mt-c-120 desktop:pr-c-160">
          <div className="flex flex-col gap-c-16 mobile-landscape:max-w-100">
            <h2
              data-start-from-zero={true}
              className="js-s-print-opacity heading-2 font-instrument-serif"
            >
              {t("expertise.title")}
            </h2>
            <p className="js-s-lines body-sm">{t("expertise.description")}</p>
          </div>
        </div>

        {/* ///// Experience ///// */}
        <div className="flex flex-col gap-c-16 mt-c-160 pl-0 mobile-landscape:pl-8 desktop-sm:pl-20">
          <h2
            data-start-from-zero={true}
            className="js-s-print-opacity heading-2 font-instrument-serif"
          >
            {t("companiesIveWorkedWith.title")}
          </h2>
          <div className="flex flex-col tablet-portrait:flex-row tablet-portrait:items-end justify-stretch gap-c-32 tablet-portrait:gap-c-16 w-full">
            <div className="grid grid-cols-2 tablet-portrait:grid-cols-3 gap-c-16 max-w-5xl w-full">
              {experiences.map((experience, index) => (
                <div className={experience.classNames} key={index}>
                  <div>
                    <h3 className="heading-5 font-instrument-serif js-s-lines">
                      {experience.company}
                    </h3>
                    <p className="body-md font-medium js-s-lines">
                      {experience.role}
                    </p>
                    <p className="body-xs opacity-60 js-s-lines">
                      {experience.dates}
                    </p>
                  </div>
                  <div>
                    <p className="body-sm opacity-80 font-medium js-s-lines">
                      Highlights
                    </p>
                    <ul className="body-xs text-brand-90">
                      {experience.highlights.map((highlight, idx) => (
                        <li
                          className="js-s-lines opacity-70"
                          key={idx}
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="js-s-lines">
              <Link
                className="body-sm font-medium whitespace-nowrap"
                href={LINKEDIN_URL}
                isExternalLink
                hasProximityHover
                noDataEvent
              >
                {t("companiesIveWorkedWith.cta")}
              </Link>
            </div>
          </div>
        </div>

        {/* ///// Education ///// */}

        {/* ///// Certifications ///// */}

        {/* ///// Publications ///// */}

        {/* ///// Patents ///// */}
      </div>
    </section>
  );
};

export default LinkedinSummary;
