import { motion } from "framer-motion";
import { GraduationCap, Briefcase, BookOpen, Brain, Users, Target, Lightbulb, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

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

const Fellowship = () => (
  <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
    <SEO
      title="Fellowship — Business & Career Champions Tracks"
      description="Explore Business and Career Champions tracks with hard and soft-skill courses preparing the next generation of African leaders."
      path="/fellowship"
    />
    <div className="container px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 sm:mb-20"
      >
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Skill Accelerator</p>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          Our <span className="text-gradient">Schools</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Two complementary tracks designed to build both the mindset and the skillset for marketplace excellence.
        </p>
      </motion.div>

      {/* Foundation Skills */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <div className="glass rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold">Foundation Skills Training</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            At Learnova, soft skills form the foundation of our entire curriculum. Every student, regardless of their chosen career path,
            begins with our Foundation Skills Training — building the core human competencies needed to succeed in today's world of work.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Personal Effectiveness
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Strategic Thinking & Decision-Making</li>
                <li>• Coaching & Mentoring</li>
                <li>• Influence & Motivation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Interpersonal Skills
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verbal & Written Communication</li>
                <li>• Conflict Resolution & Mediation</li>
                <li>• Networking & Relationship Building</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Digital Age Skills
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Virtual Communication Etiquette</li>
                <li>• Customer-Centric Thinking</li>
                <li>• Cross-Cultural Competence</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <span key={skill} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Two Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        {/* Career Track */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">School of Career Development</h2>
              <p className="text-xs text-primary">Career Track</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Focused on employability, professional growth, and industry-relevant skills.
            Structured into Soft Skills Track and Technical Skills Track.
          </p>

          <h3 className="font-display font-semibold mb-4">Start Course</h3>
          <div className="grid grid-cols-2 gap-3">
            {careerCourses.map((c) => (
              <div key={c.num} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-primary font-display font-bold text-lg">{c.num}</span>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Business Track */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">School of Business</h2>
              <p className="text-xs text-primary">Business Track</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Focused on entrepreneurial skills, business strategy, and financial management to empower participants to build and scale ventures.
          </p>

          <h3 className="font-display font-semibold mb-4">Core Modules</h3>
          <div className="space-y-3 mb-8">
            {[
              "Business Model Canvas & Lean Startup",
              "Financial Literacy & Fundraising",
              "Marketing & Sales Strategy",
              "Supply Chain & Operations",
              "Leadership & Team Building",
              "Pitching & Investor Relations",
              "Legal & Compliance Essentials",
              "Scaling & Growth Hacking",
            ].map((mod, i) => (
              <div key={mod} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-primary font-display font-bold text-lg">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-medium">{mod}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Opportunity Accelerator */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <div className="glass rounded-2xl p-6 sm:p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-8 h-8 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">
              Opportunity <span className="text-gradient">Accelerator</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-3xl">
            To address these challenges, the Business School Opportunity Accelerator seeks to bridge the gap between learning and real-world impact by connecting trained entrepreneurs to post-training growth opportunities. This will include:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-secondary/50 rounded-xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg">Market Linkage Platforms</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Facilitating access to corporate and institutional buyers, trade fairs, digital marketplaces, and strategic partnerships.
              </p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg">Access to Finance</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Creating pathways to funding through micro-grants, revolving funds, and partnerships with financial institutions and impact investors.
              </p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg">Business Mentorship & Advisory</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Providing tailored guidance, mentorship, and business development support to ensure long-term growth and sustainability.
              </p>
            </div>
          </div>

          {/* NextFund Impact */}
          <div className="glass rounded-xl p-5 sm:p-8">
            <h3 className="text-lg sm:text-xl font-display font-bold mb-4">
              Impact & <span className="text-gradient">Sustainability</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              The NextFund's design ensures that investment returns continuously fuel new opportunities for youth-led businesses, creating a self-sustaining impact cycle. Over time, the model aims to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Strengthen the capacity and visibility of youth-led enterprises.</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Increase job creation and innovation-driven growth.</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Attract more partners into a collaborative ecosystem of youth enterprise development.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <div className="text-center">
        <Link to="/register">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 font-semibold">
            Register & Choose Your Track
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default Fellowship;
