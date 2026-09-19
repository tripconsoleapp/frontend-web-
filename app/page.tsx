import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HomeHero } from "@/components/marketing/home-hero";
import { CategoryNav } from "@/components/marketing/category-nav";
import { FeaturedTemplates } from "@/components/marketing/featured-templates";
import { SectionBreak } from "@/components/marketing/section-break";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FadeIn } from "@/components/ui/fade-in";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <HomeHero />
      <CategoryNav />

      <FadeIn>
        <FeaturedTemplates />
      </FadeIn>

      <SectionBreak
        imageUrl="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2400&q=80"
        alt="Traditional houseboat gliding through Kerala's backwaters"
        headline="Plan your escape through Kerala's backwaters"
      />

      <FadeIn>
        <HowItWorks />
      </FadeIn>

      <Footer />
    </div>
  );
}
