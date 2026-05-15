import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import AboutSection from "@/components/home/AboutSection";
import SpeakersPreview from "@/components/home/SpeakersPreview";
import FellowshipPreview from "@/components/home/FellowshipPreview";
import SponsorsSection from "@/components/home/SponsorsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import SEO from "@/components/SEO";

const Index = () => (
  <>
    <SEO
      title="NextGen Summit 2026 — Faith-Driven Leadership in Africa"
      description="Africa's premier faith-driven business and career leadership summit. Join 2,000+ delegates June 20, 2026 in Abuja, Nigeria."
      path="/"
    />
    <HeroSection />
    <StatsSection />
    <AboutSection />
    <SpeakersPreview />
    <FellowshipPreview />
    <TestimonialsSection />
    <SponsorsSection />
    <FAQSection />
    <CTASection />
  </>
);

export default Index;
