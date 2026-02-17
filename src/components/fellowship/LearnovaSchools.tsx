import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Brain, Target, Users, Shield, BookOpen, Lightbulb } from "lucide-react";

const softSkills = [
  "Creative & Critical Thinking", "Problem-Solving", "Creativity & Innovation",
  "Analytical Thinking", "Design Thinking", "Time Management",
  "Adaptability & Resilience", "Emotional Intelligence", "Work Ethics & Integrity",
  "Professional Etiquette", "Growth Mindset", "Change Management",
  "Personal Branding", "Learning Agility", "Remote Work Collaboration",
];

const careerCourses = [
  { num: "01", name: "Data Science" },
  { num: "02", name: "Data Analytics" },
  { num: "03", name: "UI/UX Design" },
  { num: "04", name: "Project Management" },
  { num: "05", name: "Cybersecurity" },
  { num: "06", name: "Accounting" },
  { num: "07", name: "Backend Engineering" },
  { num: "08", name: "Frontend Engineering" },
];

const businessModules = [
  "Business Model Canvas & Lean Startup",
  "Financial Literacy & Fundraising",
  "Marketing & Sales Strategy",
  "Supply Chain & Operations",
  "Leadership & Team Building",
  "Pitching & Investor Relations",
  "Legal & Compliance Essentials",
  "Scaling & Growth Hacking",
];

const LearnovaSchools = () => (
  <section className="py-12 sm:py-20">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-14"
      >
        <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">Skill Accelerator</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3">
          Our <span className="text-gradient">Schools</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
          Two complementary tracks designed to build both the mindset and the skillset for marketplace excellence.
        </p>
      </motion.div>

      {/* Foundation Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-5 sm:p-8 md:p-12 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-7 h-7 text-primary" />
          <h3 className="text-lg sm:text-2xl font-display font-bold">Foundation Skills Training</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-3xl">
          Every student begins with our Foundation Skills Training — building the core human competencies needed to succeed in today's world of work.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="space-y-2">
            <h4 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Personal Effectiveness
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Strategic Thinking & Decision-Making</li>
              <li>• Coaching & Mentoring</li>
              <li>• Influence & Motivation</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Interpersonal Skills
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Verbal & Written Communication</li>
              <li>• Conflict Resolution & Mediation</li>
              <li>• Networking & Relationship Building</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Digital Age Skills
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Virtual Communication Etiquette</li>
              <li>• Customer-Centric Thinking</li>
              <li>• Cross-Cultural Competence</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {softSkills.map((skill) => (
            <span key={skill} className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Two Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
        {/* Career Track */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-5 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-display font-bold">School of Career Development</h3>
              <p className="text-[10px] sm:text-xs text-primary">Career Track</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-5">
            Focused on employability, professional growth, and industry-relevant skills. Structured into Soft Skills Track and Technical Skills Track.
          </p>
          <h4 className="font-display font-semibold text-sm mb-3">Start Courses</h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {careerCourses.map((c) => (
              <div key={c.num} className="flex items-center gap-2 sm:gap-3 bg-secondary/50 rounded-xl p-2.5 sm:p-3">
                <span className="text-primary font-display font-bold text-sm sm:text-lg">{c.num}</span>
                <span className="text-xs sm:text-sm font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enterprise Track */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-5 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-display font-bold">School of Business</h3>
              <p className="text-[10px] sm:text-xs text-primary">Enterprise Track</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-5">
            Focused on entrepreneurial skills, business strategy, and financial management to empower participants to build and scale ventures.
          </p>
          <h4 className="font-display font-semibold text-sm mb-3">Core Modules</h4>
          <div className="space-y-2 sm:space-y-3">
            {businessModules.map((mod, i) => (
              <div key={mod} className="flex items-center gap-2 sm:gap-3 bg-secondary/50 rounded-xl p-2.5 sm:p-3">
                <span className="text-primary font-display font-bold text-sm sm:text-lg">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-xs sm:text-sm font-medium">{mod}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Opportunity Accelerator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-5 sm:p-8 md:p-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-7 h-7 text-primary" />
          <h3 className="text-lg sm:text-2xl font-display font-bold">
            Opportunity <span className="text-gradient">Accelerator</span>
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-8 max-w-3xl">
          Bridging the gap between learning and real-world impact by connecting trained entrepreneurs to post-training growth opportunities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-secondary/50 rounded-xl p-4 sm:p-6 space-y-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h4 className="font-display font-semibold text-sm sm:text-base">Market Linkage Platforms</h4>
            <p className="text-xs text-muted-foreground">
              Facilitating access to corporate and institutional buyers, trade fairs, digital marketplaces, and strategic partnerships.
            </p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4 sm:p-6 space-y-3">
            <Target className="w-5 h-5 text-primary" />
            <h4 className="font-display font-semibold text-sm sm:text-base">Access to Finance</h4>
            <p className="text-xs text-muted-foreground">
              Creating pathways to funding through micro-grants, revolving funds, and partnerships with financial institutions and impact investors.
            </p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4 sm:p-6 space-y-3">
            <Users className="w-5 h-5 text-primary" />
            <h4 className="font-display font-semibold text-sm sm:text-base">Business Mentorship & Advisory</h4>
            <p className="text-xs text-muted-foreground">
              Providing tailored guidance, mentorship, and business development support to ensure long-term growth and sustainability.
            </p>
          </div>
        </div>

        {/* NextFund Impact */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <h4 className="font-display font-bold text-sm sm:text-base mb-3">
            Impact & <span className="text-gradient">Sustainability</span>
          </h4>
          <p className="text-xs text-muted-foreground mb-4 max-w-2xl">
            The NextFund's design ensures that investment returns continuously fuel new opportunities for youth-led businesses, creating a self-sustaining impact cycle.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              "Strengthen the capacity and visibility of youth-led enterprises.",
              "Increase job creation and innovation-driven growth.",
              "Attract more partners into a collaborative ecosystem of youth enterprise development.",
            ].map((item) => (
              <div key={item} className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default LearnovaSchools;
