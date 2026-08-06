export type FeaturedWork = {
  id: string;
  name: string;
  wordmark: string;
  background: string;
  href: string;
  ariaLabel: string;
};

export const featuredWorks: FeaturedWork[] = [
  {
    id: "tavrynewallpapers",
    name: "Tavryne Wallpapers",
    wordmark: "tavryne.wallpapers",
    background: "linear-gradient(160deg, #050505, #0a0f0c 55%, #040404)",
    href: "https://tavrynewallpapers.vercel.app/",
    ariaLabel: "Visit Tavryne Wallpapers",
  },
  {
    id: "tavryneai",
    name: "Tavryne AI",
    wordmark: "tavryne.ai",
    background: "linear-gradient(160deg, #0a0a0a, #16102a 55%, #080808)",
    href: "https://tavryneai.vercel.app/",
    ariaLabel: "Visit Tavryne AI",
  },
  {
    id: "vyaparai",
    name: "VyaparAI",
    wordmark: "vyapar.ai",
    background: "linear-gradient(160deg, #0e0b05, #1c1608 55%, #0a0906)",
    href: "https://vyaparai.vercel.app/",
    ariaLabel: "Visit VyaparAI",
  },
  {
    id: "qrigo",
    name: "Qrigo",
    wordmark: "qrigo",
    background: "linear-gradient(160deg, #150b2e, #30102e 50%, #1c1208)",
    href: "https://qrigo.vercel.app/",
    ariaLabel: "Visit Qrigo",
  },
  {
    id: "jashansingla-portfolio",
    name: "Jashan Portfolio",
    wordmark: "jashan.portfolio",
    background: "linear-gradient(160deg, #070d1a, #13203a 55%, #060910)",
    href: "https://jashansingla.vercel.app/",
    ariaLabel: "Visit Jashan Portfolio",
  },
  {
    id: "jashan-portfolio",
    name: "Jashan Portfolio",
    wordmark: "jashan.portfolio",
    background: "linear-gradient(160deg, #100a1d, #0d0718 55%, #090510)",
    href: "https://jashansingla.is-a.dev/",
    ariaLabel: "Visit Jashan Portfolio",
  },
];
