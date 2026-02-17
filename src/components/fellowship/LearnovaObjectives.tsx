import { motion } from "framer-motion";
import { Target, Rocket, Handshake, Lightbulb } from "lucide-react";

const objectives = [
  {
    icon: Target,
    title: "Close the Skills Gap",
    desc: "Equip youth with digital literacy, employability skills, and entrepreneurial knowledge aligned with labour market demands.",
  },
  {
    icon: Rocket,
    title: "Build a Future-Ready Workforce",
    desc: "Prepare Africa's youth to compete globally while addressing local challenges.",
  },
  {
    icon: Handshake,
    title: "Bridge the Opportunity Gap",
    desc: "Provide pathways to internships, jobs, mentorship, and funding, ensuring trained youth can convert skills into livelihoods.",
  },
  {
    icon: Lightbulb,
    title: "Foster Job Creation",
    desc: "Nurture entrepreneurial thinking so youth can create employment for themselves and others.",
  },
];

const frameworks = [
  "UN SDG 4: Quality Education",
  "UN SDG 8: Decent Work & Economic Growth",
  "UN SDG 9: Industry, Innovation & Infrastructure",
  "African Union Agenda 2063",
  "ILO Youth Employment Framework",
  "WEF Future of Jobs Report (2025)",
  "World Bank Human Capital Project",
  "AfDB Jobs for Youth in Africa Strategy",
];

const LearnovaObjectives = () => (
  <section className="py-12 sm:py-20 bg-secondary/30">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-14"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3">
          Our <span className="text-gradient">Objectives</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
        {objectives.map((o, i) => (
          <motion.div
            key={o.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 sm:p-6"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <o.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-bold text-sm sm:text-base mb-2">{o.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{o.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Framework alignment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-5 sm:p-8"
      >
        <h3 className="font-display font-bold text-base sm:text-lg mb-4">
          Alignment with Global & Regional Frameworks
        </h3>
        <div className="flex flex-wrap gap-2">
          {frameworks.map((f) => (
            <span key={f} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
              {f}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default LearnovaObjectives;
