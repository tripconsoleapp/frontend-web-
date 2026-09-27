import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HomeHero, IntentStrip } from "@/components/marketing/home-hero";
import { CategoryNav } from "@/components/marketing/category-nav";
import { FeaturedTemplates } from "@/components/marketing/featured-templates";
import { FeatureSplit } from "@/components/marketing/feature-split";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <HomeHero />
      <IntentStrip />

      <ScrollReveal>
        <FeaturedTemplates />
      </ScrollReveal>

      <ScrollReveal>
        <CategoryNav />
      </ScrollReveal>

      <ScrollReveal>
        <FeatureSplit />
      </ScrollReveal>

      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      <ScrollReveal>
        <ClosingCta />
      </ScrollReveal>

      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
