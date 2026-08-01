export type Service = {
  title: string;
  services: {
    title: string;
    highlight: string;
    description: string;
  }[];
};

export const services: Service[] = [
  {
    title: "aiAutomation.title",
    services: [
      {
        title: "aiAutomation.workflowAutomation.title",
        highlight: "aiAutomation.workflowAutomation.copy",
        description: "aiAutomation.workflowAutomation.description",
      },
      {
        title: "aiAutomation.llmOps.title",
        highlight: "aiAutomation.llmOps.copy",
        description: "aiAutomation.llmOps.description",
      },
      {
        title: "aiAutomation.agenticAI.title",
        highlight: "aiAutomation.agenticAI.copy",
        description: "aiAutomation.agenticAI.description",
      },
    ],
  },
  {
    title: "cybersecurity.title",
    services: [
      {
        title: "cybersecurity.webSecurity.title",
        highlight: "cybersecurity.webSecurity.copy",
        description: "cybersecurity.webSecurity.description",
      },
      {
        title: "cybersecurity.osint.title",
        highlight: "cybersecurity.osint.copy",
        description: "cybersecurity.osint.description",
      },
      {
        title: "cybersecurity.forensics.title",
        highlight: "cybersecurity.forensics.copy",
        description: "cybersecurity.forensics.description",
      },
    ],
  },
  {
    title: "foundations.title",
    services: [
      {
        title: "foundations.securityFirst.title",
        highlight: "foundations.securityFirst.copy",
        description: "foundations.securityFirst.description",
      },
      {
        title: "foundations.ethicalReporting.title",
        highlight: "foundations.ethicalReporting.copy",
        description: "foundations.ethicalReporting.description",
      },
      {
        title: "foundations.continuousLearning.title",
        highlight: "foundations.continuousLearning.copy",
        description: "foundations.continuousLearning.description",
      },
    ],
  },
];
