"use server";

import LandingPage from "@/components/landingPage/page";
import AboutHackfest from "@/components/aboutHackfest/page";
import Footer from "@/components/footer/page";
import Domains from "@/components/domains/page";
import AlertBanner from "@/components/alertBanner/page";
import Sponsors from "@/components/sponsors/page";
import About from "@/components/about/page";
import Navbar from "@/components/navbar/page";
import NeonGrid from "@/components/hero/neonGrid";
import PrizePool from "@/components/prizePool/page";
import { FAQ } from "@/components/faq/page";

export default async function Home() {
  return (
    <main className="flex flex-col gap-20">
      <Navbar />
      <LandingPage />
      <AboutHackfest />
      <PrizePool />
      <Domains
        domainList={[
          {
            name: "Metaverse",
            image: "/metaverse.svg",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis modi dolor qui atque vero libero odit, tempora dolores impedit ut!",
            prize: 10000,
          },
          {
            name: "Open Innovation",
            image: "/metaverse.svg",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis modi dolor qui atque vero libero odit, tempora dolores impedit ut!",
            prize: 10000,
          },
          {
            name: "Healthcare",
            image: "/metaverse.svg",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis modi dolor qui atque vero libero odit, tempora dolores impedit ut!",
            prize: 10000,
          },
        ]}
      />
      <Sponsors />
      <FAQ/>
      <About />
      <Footer />
    </main>
  );
}
