import { motion } from "framer-motion";
import { Sprout, TrendingUp, Rocket, Award } from "lucide-react";

const stages = [
  {
    icon: Sprout,
    stage: "Start",
    color: "text-green-400",
    desc: "For beginners setting out on their career or business journey. Build foundational knowledge, essential skills, and confidence to take the first step.",
  },
  {
    icon: TrendingUp,
    stage: "Grow",
    color: "text-blue-400",
    desc: "Deepen expertise with advanced learning, career readiness tools, and support to move from survival to steady growth.",
  },
  {
    icon: Rocket,
    stage: "Scale",
    color: "text-primary",
    desc: "Expand capacity and impact through scaling operations, leadership development, funding access, and market entry.",
  },
  {
    icon: Award,
    stage: "Legacy",
    color: "text-gold",
    desc: "For established leaders positioned to influence, mentor, and give back — embedding their impact into systems and communities.",
  },
];

const GrowthPathway = () => (
  <section className="py-12 sm:py-20">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-14"
      >
        <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">
          Growth Pathway
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
          Start → Grow → Scale → <span className="text-gradient">Legacy</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stages.map((s, i) => (
          <motion.div
            key={s.stage}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 sm:p-6 relative"
          >
            <div className="flex items-center gap-3 mb-4">
              <s.icon className={`w-6 h-6 ${s.color}`} />
              <span className="font-display font-bold text-lg">{s.stage}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{s.desc}</p>
            {i < stages.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 text-muted-foreground text-xl">→</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default GrowthPathway;
