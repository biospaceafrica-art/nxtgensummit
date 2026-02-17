import { motion } from "framer-motion";
import { BookOpen, Users, Brain, MessageSquare, ClipboardCheck, Award, Presentation, Star } from "lucide-react";

const methods = [
  { icon: BookOpen, title: "Blended Learning", desc: "Combination of online and live sessions." },
  { icon: Brain, title: "Project-Based Learning", desc: "Application through real-world challenges." },
  { icon: Users, title: "Peer Learning", desc: "Group discussions, simulations, and collaborations." },
  { icon: MessageSquare, title: "Mentorship & Coaching", desc: "One-on-one guidance from industry experts." },
];

const assessments = [
  { icon: ClipboardCheck, title: "Continuous Assessment", desc: "Quizzes, assignments, and peer reviews." },
  { icon: Star, title: "Capstone Projects", desc: "Demonstrating practical application of learning." },
  { icon: MessageSquare, title: "Mentor Feedback", desc: "Continuous growth check-ins and evaluations." },
  { icon: Presentation, title: "Final Showcase", desc: "Public demonstration of outcomes." },
];

const LearnovaMethodology = () => (
  <section className="py-12 sm:py-20 bg-secondary/30">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-14"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3">
          Learning <span className="text-gradient">Methodology</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          The Learnova approach blends academic rigour, experiential learning, and mentorship.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-14">
        <div className="glass rounded-2xl p-5 sm:p-8">
          <h3 className="font-display font-bold text-base sm:text-lg mb-5">Key Components</h3>
          <div className="space-y-4">
            {methods.map((m) => (
              <div key={m.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <m.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 sm:p-8">
          <h3 className="font-display font-bold text-base sm:text-lg mb-5">Assessment Framework</h3>
          <div className="space-y-4">
            {assessments.map((a) => (
              <div key={a.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <a.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-primary mt-4 font-medium">
            Grading is competency-based, emphasising mastery over memorisation.
          </p>
        </div>
      </div>

      {/* Collaborative Certification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-5 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-primary" />
          <h3 className="font-display font-bold text-base sm:text-lg">Collaborative Certification Model</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-3xl">
          Learnova partners with recognized professional and certification bodies — such as IABAC, DASCA, PMI, PRINCE2, AWS, Microsoft, EC-Council, and CompTIA — to ensure learners earn globally recognized credentials that meet international standards and are highly valued by employers.
        </p>
        <div className="flex flex-wrap gap-2">
          {["IABAC", "DASCA", "PMI", "PRINCE2", "AWS", "Microsoft", "EC-Council", "CompTIA", "ACCA"].map((p) => (
            <span key={p} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">{p}</span>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default LearnovaMethodology;
