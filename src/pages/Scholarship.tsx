import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Users, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

const phases = [
  {
    title: "Application & Selection",
    description: "Submit your application and go through a merit-based selection process. Shortlisted candidates are notified via email.",
    icon: BookOpen,
  },
  {
    title: "Immersive Training",
    description: "Engage in hands-on classes, mentorship sessions, and real-world projects across your chosen discipline at TAI.",
    icon: Users,
  },
  {
    title: "Assessment & Graduation",
    description: "Complete your capstone project and final assessments. Successful fellows graduate with certification from Tribe Africa Institute.",
    icon: CheckCircle,
  },
  {
    title: "Post-Graduation Tracking",
    description: "Alumni progress is tracked through employment placement, business launches, and continued mentorship for 12 months post-graduation.",
    icon: TrendingUp,
  },
];

const trackingMetrics = [
  { label: "Employment Rate", value: "85%", description: "of graduates secure employment within 6 months" },
  { label: "Business Launches", value: "40+", description: "ventures started by enterprise track alumni" },
  { label: "Mentorship Hours", value: "500+", description: "hours of post-graduation mentorship delivered" },
  { label: "Alumni Network", value: "1,200+", description: "graduates in the TAI alumni community" },
];

const Scholarship = () => {
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary mb-6">
            <GraduationCap className="w-4 h-4" />
            Tribe Africa Institute (TAI)
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Scholarship <span className="text-gradient">Program</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            The TAI Scholarship empowers young Africans with world-class training, mentorship, and career support — from application through graduation and beyond.
          </p>
        </motion.div>

        {/* Journey Phases */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-20"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">
            The Scholar's <span className="text-gradient">Journey</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass rounded-2xl p-6 relative group hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <phase.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Phase {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{phase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Progress Tracking */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-4">
            Progress <span className="text-gradient">Tracking</span>
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10 max-w-xl mx-auto">
            TAI tracks every scholar's development during training and for 12 months after graduation to ensure lasting impact.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trackingMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5 text-center"
              >
                <p className="text-2xl sm:text-3xl font-display font-bold text-gradient">{metric.value}</p>
                <p className="font-semibold text-sm mt-2">{metric.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* What Scholars Receive */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">
            What Scholars <span className="text-gradient">Receive</span>
          </h2>
          <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
            {[
              "Full tuition coverage for the selected fellowship track",
              "Access to industry mentors and career coaches",
              "Hands-on project experience and portfolio development",
              "Post-graduation job placement and entrepreneurship support",
              "12-month alumni tracking and continued mentorship",
              "Networking access to the TAI alumni community",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Apprenticeship Challenge */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 max-w-3xl mx-auto"
        >
          <div className="glass rounded-2xl p-6 sm:p-8 border-primary/20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              🎯 Mandatory Task
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
              Apprenticeship <span className="text-gradient">Challenge</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
              All scholarship applicants are advised to check our social media platforms for the secret code to our Apprenticeship projects. Lucky winners will be announced during the summit.
            </p>
            <p className="text-sm font-semibold text-primary">
              This task must be completed by all scholarship students.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
            Ready to <span className="text-gradient">Apply</span>?
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Visit the official Tribe Africa Institute portal to submit your scholarship application.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://theplatformnigeria.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
                Apply for Scholarship <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 px-8">
                Register for Summit
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Scholarship;
