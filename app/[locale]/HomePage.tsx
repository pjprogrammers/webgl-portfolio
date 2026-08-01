"use client";

import {
  Hero,
  Resume,
  SelectedWorks,
  Services,
  Process,
  GetInTouch,
  Footer,
} from "@/components/organisms";

const HomePage = () => {
  return (
    <main data-page-content className="container relative z-10">
      <Hero />
      <Resume />
      <SelectedWorks />
      <Services />
      <Process />
      <GetInTouch />
      <Footer />
    </main>
  );
};

export default HomePage;
