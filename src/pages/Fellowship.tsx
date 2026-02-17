import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LearnovaHero from "@/components/fellowship/LearnovaHero";
import LearnovaObjectives from "@/components/fellowship/LearnovaObjectives";
import GrowthPathway from "@/components/fellowship/GrowthPathway";
import LearnovaSchools from "@/components/fellowship/LearnovaSchools";
import LearnovaMethodology from "@/components/fellowship/LearnovaMethodology";

const Fellowship = () => (
  <div className="min-h-screen">
    <LearnovaHero />
    <LearnovaObjectives />
    <GrowthPathway />
    <LearnovaSchools />
    <LearnovaMethodology />

    {/* CTA */}
    <div className="text-center py-12 sm:py-16">
      <Link to="/register">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 sm:px-10 font-semibold text-sm sm:text-base">
          Register & Choose Your Track
        </Button>
      </Link>
    </div>
  </div>
);

export default Fellowship;
