export type Work = {
  name: string;
  role: string;
  services: string[];
  tools: string;
  link: string;
  image: string;
  activeMedia: string;
  type: "image" | "video";
};

export const works: Work[] = [
  {
    name: "/nk.studio",
    image: "/covers/nk.png",
    link: "https://www.nk.studio/",
    role: "Creative Developer",
    services: [
      "WebGL & Shader Effects",
      "Motion-Rich Interfaces",
      "Creative Partnership",
    ],
    tools:
      "Next.js, WebGL,Three.js, Shaders, Prismic, SASS, GSAP, Framer Motion, Zustand, Lenis Scroll, Axios",
    activeMedia: "/videos/nk.mp4",
    type: "video",
  },
  // {
  //   name: "Warren Lotas",
  //   image: "/covers/wl.png",
  //   link: "https://www.warrenlotas.com/",
  //   role: "Frontend Developer",
  //   services: ["Creative Partnership"],
  //   tools: "Nextjs, Typescript, Shopify, Tailwind, GSAP, Zustand, Axios",
  //   activeMedia: "/videos/wl.mp4",
  //   type: "video",
  // },
  // {
  //   name: "GUT",
  //   image: "/covers/gut.png",
  //   link: "https://www.gut.agency/",
  //   role: "Creative Developer",
  //   services: ["Creative Partnership", "Motion-Rich Interfaces"],
  //   tools:
  //     "Next.js, Typescript, Contentful, Tailwind, GSAP, Lenis Scroll, Zustand",
  //   activeMedia: "/videos/gut.mp4",
  //   type: "video",
  // },
  {
    name: "Flixxo",
    image: "/covers/flixxo.png",
    link: "https://www.flixxo.com/",
    role: "Creative Developer",
    services: ["Creative Partnership", "Motion-Rich Interfaces"],
    tools: "Next.js, SASS, GSAP, Framer Motion, Lenis Scroll, Zustand",
    activeMedia: "/videos/flixxo.mp4",
    type: "video",
  },
  // {
  //   name: "Tecmaco",
  //   image: "/covers/tecmaco.png",
  //   link: "https://www.tecmaco.com.ar/",
  //   role: "Creative Developer",
  //   services: ["Creative Partnership", "Motion-Rich Interfaces"],
  //   tools: "Next.js, SASS, GSAP, Framer Motion, Lenis Scroll, Zustand",
  //   activeMedia: "/videos/tecmaco.mp4",
  //   type: "video",
  // },
  {
    name: "Suku",
    image: "/covers/suku.png",
    link: "https://www.suku.world/",
    role: "Frontend Developer",
    services: ["Creative Partnership"],
    tools: "Next.js, SCSS, GSAP, Lenis Scroll",
    activeMedia: "/videos/suku.mp4",
    type: "video",
  },
];
