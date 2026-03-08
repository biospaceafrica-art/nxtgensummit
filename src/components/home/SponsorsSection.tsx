import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

import graceCapitalLogo from "@/assets/sponsors/grace-capital.png";
import covenantTechLogo from "@/assets/sponsors/covenant-tech.png";
import kingdomBuildersLogo from "@/assets/sponsors/kingdom-builders.png";
import ariseMediaLogo from "@/assets/sponsors/arise-media.png";
import heritageBankLogo from "@/assets/sponsors/heritage-bank.png";

const TIERS = [
  {
    name: "Harvesting Partners",
    tagline: "₦10,000,000+",
    accent: "from-primary to-[hsl(43,90%,55%)]",
    logos: [
      { name: "Grace Capital Group", src: graceCapitalLogo },
    ],
  },
  {
    name: "Gardener Partners",
    tagline: "₦1,000,000 – ₦5,000,000",
    accent: "from-primary/80 to-primary/40",
    logos: [
      { name: "Covenant Technologies", src: covenantTechLogo },
      { name: "Heritage Bank", src: heritageBankLogo },
    ],
  },
  {
    name: "Seedling Partners",
    tagline: "₦100,000 – ₦500,000",
    accent: "from-muted-foreground/60 to-muted-foreground/30",
    logos: [
      { name: "Kingdom Builders Foundation", src: kingdomBuildersLogo },
      { name: "Arise Media", src: ariseMediaLogo },
    ],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const SponsorsSection = () => (
  <section className="py-20 sm:py-28 bg-secondary/30">
    <div className="container px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">
          <Handshake className="w-4 h-4" />
          Be a Door Opener
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          Our <span className="text-gradient">Partners & Sponsors</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          These visionary organizations are opening doors for the next generation of
          faith-driven leaders.
        </p>
      </motion.div>

      {/* Tiers */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="space-y-10 max-w-4xl mx-auto"
      >
        {TIERS.map((tier) => (
          <motion.div
            key={tier.name}
            variants={item}
            className="glass rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
              <span
                className={`inline-block bg-gradient-to-r ${tier.accent} bg-clip-text text-transparent font-display font-bold text-lg sm:text-xl`}
              >
                {tier.name}
              </span>
              <span className="text-xs text-muted-foreground tracking-wide">
                {tier.tagline}
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {tier.logos.map((logo, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-xl border border-border/60 bg-card/60 px-6 py-4 min-w-[140px] sm:min-w-[180px] transition-colors hover:border-primary/30"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-12 sm:h-14 object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-12"
      >
        <Link to="/plant-a-seed">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
          >
            Become a Door Opener
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>
);

export default SponsorsSection;
