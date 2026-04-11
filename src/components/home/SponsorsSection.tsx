import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, Heart, Users, Sparkles, ArrowRight } from "lucide-react";

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
    logos: [{ name: "Grace Capital Group", src: graceCapitalLogo }],
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

const impactPoints = [
  {
    icon: Users,
    title: "Fund a Future Leader",
    desc: "Your sponsorship directly funds scholarships, training materials, and mentorship access for young Africans who can't afford it.",
  },
  {
    icon: Heart,
    title: "Join a Kingdom Mission",
    desc: "This isn't just a conference — it's a movement. Every Door Opener becomes part of a legacy that transforms industries through faith.",
  },
  {
    icon: Sparkles,
    title: "Your Name, Their Testimony",
    desc: "Every life changed at this summit carries your fingerprint. You don't just sponsor an event — you sponsor a destiny.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const SponsorsSection = () => (
  <section className="py-20 sm:py-28 bg-secondary/30">
    <div className="container px-4">
      {/* Header — Story-driven */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">
          <Handshake className="w-4 h-4" />
          Be a Door Opener
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          Every Great Leader Had a{" "}
          <span className="text-gradient">Door Opener</span>
        </h2>
      </motion.div>

      {/* Storytelling block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-3xl mx-auto text-center mb-16"
      >
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
          Across Africa, thousands of brilliant young people have the talent, the faith, and the fire — but not the opportunity.
          They sit in classrooms without mentors. They dream of businesses but can't afford a laptop. They're ready to lead, but
          no one has opened the door.
        </p>
        <p className="text-foreground font-medium text-sm sm:text-base leading-relaxed mb-4">
          That's where <strong>you</strong> come in. As a Door Opener, your partnership doesn't just fund an event — it funds
          a future. It puts a young entrepreneur in front of an investor. It gives a first-generation graduate her first
          professional certification. It tells a generation: <em>"Someone believes in you."</em>
        </p>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          The leaders who walked through doors before are now holding them open for others. Will you join them?
        </p>
      </motion.div>

      {/* Impact Points */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
      >
        {impactPoints.map((point) => (
          <motion.div
            key={point.title}
            variants={item}
            className="glass rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <point.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-base mb-2">{point.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Current Partners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 className="text-lg sm:text-2xl font-display font-bold text-foreground mb-2">
          Those Already <span className="text-gradient">Opening Doors</span>
        </h3>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          These visionary organizations are making it possible for the next generation to walk through.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="space-y-8 max-w-4xl mx-auto mb-12"
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
        className="text-center"
      >
        <Link to="/plant-a-seed">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 gap-2"
          >
            Become a Door Opener <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-3">
          Every amount counts. Every seed grows. Every door opened changes a life.
        </p>
      </motion.div>
    </div>
  </section>
);

export default SponsorsSection;
