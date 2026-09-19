import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HomeHero } from "@/components/marketing/home-hero";
import { HowItWorks } from "@/components/marketing/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <HomeHero />
      <HowItWorks />
      <Footer />
    </div>
  );
}
