import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tracks = [
  {
    icon: GraduationCap,
    title: "Career Track",
    desc: "Focused on employability, professional growth, and industry-specific skills to help participants excel in their careers.",
  },
  {
    icon: Briefcase,
    title: "Enterprise Track",
    desc: "Focused on entrepreneurial skills, business strategy, and financial management to empower participants to build and scale ventures.",
  },
];

const FellowshipPreview = () => (
  <section className="py-24 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Skill Accelerator</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Two Learning <span className="text-gradient">Tracks</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose your path to excellence. Both tracks combine soft skills with technical mastery.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {tracks.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 hover:border-primary/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <t.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display font-bold text-xl mb-3">{t.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/fellowship">
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
            Explore Programs <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default FellowshipPreview;
