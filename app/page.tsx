import { Navbar } from "@/components/layout/navbar";
import { HomeHero } from "@/components/marketing/home-hero";
import { ScrollPhotoSection } from "@/components/marketing/scroll-photo-section";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <HomeHero />
      <ScrollPhotoSection />
    </div>
  );
}
