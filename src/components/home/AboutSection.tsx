import { motion } from "framer-motion";
import { Rocket, Lightbulb, Globe, BookOpen } from "lucide-react";

const pillars = [
  {
    icon: Rocket,
    title: "Career Acceleration",
    desc: "Workshops designed to upscale your CV, portfolio, and digital skills for the global market.",
  },
  {
    icon: Lightbulb,
    title: "Business Creation",
    desc: "Connecting entrepreneurs with angel investors, grants, and business incubation opportunities.",
  },
  {
    icon: Globe,
    title: "Global Missions",
    desc: "Commissioning leaders who steward influence responsibly, shaping industries with Kingdom values.",
  },
  {
    icon: BookOpen,
    title: "Faith-Work Integration",
    desc: "Demonstrating that Kingdom values and marketplace success are mutually reinforcing.",
  },
];

const AboutSection = () => (
  <section id="about" className="py-24 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Why This Summit <span className="text-gradient">Matters Now</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Opening Doors for the Next Generation of Business and Career Leaders in Africa.
          Equipping emerging leaders with practical skills, mentorship, and connections.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <p.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
