import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Users, Globe } from "lucide-react";

const stats = [
  { icon: Users, value: "65M+", label: "Youth unemployed globally" },
  { icon: TrendingUp, value: "72%", label: "Young workers in insecure jobs (SSA)" },
  { icon: BookOpen, value: "10-12M", label: "Youth entering labour force yearly" },
  { icon: Globe, value: "3.1M", label: "Formal jobs created annually" },
];

const LearnovaHero = () => (
  <section className="pt-20 sm:pt-24 pb-12 sm:pb-16">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-16"
      >
        <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">
          Tribe Africa Institute (TAI)
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mb-4">
          <span className="text-gradient">Learnova</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto mb-2">
          A transformative Digital Learning Campus redefining access to education, employability, and enterprise development across Africa.
        </p>
        <p className="text-xs sm:text-sm text-primary font-medium max-w-2xl mx-auto">
          Closing the Gap. Creating the Future.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5 sm:p-8 md:p-10 mb-10 sm:mb-16"
      >
        <h2 className="text-lg sm:text-xl font-display font-bold mb-4">Executive Summary</h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          Youth unemployment and underemployment in Africa are driven by demographic pressure, weak job creation, skills mismatches, and structural constraints. Through our fully funded 6-month Entry-Level Scholarship Programme, we empower young Africans with in-demand skills and real-world experience, connecting them to job opportunities and supporting aspiring entrepreneurs to launch sustainable ventures.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-secondary/50 rounded-xl p-3 sm:p-4 text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-display font-bold text-foreground">{s.value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default LearnovaHero;
