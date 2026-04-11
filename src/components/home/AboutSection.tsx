import { motion } from "framer-motion";
import { Rocket, Lightbulb, Globe, BookOpen, Quote, Target, Flame, GraduationCap } from "lucide-react";
import hamiltonImg from "@/assets/speakers/hamilton-gabriel.png";

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

const problemStats = [
  { icon: Target, value: "65%", label: "of African graduates struggle to find meaningful work within 2 years" },
  { icon: Flame, value: "80%", label: "of young entrepreneurs fail in year one without mentorship" },
  { icon: GraduationCap, value: "3 in 10", label: "young professionals feel equipped to integrate faith with career" },
];

const AboutSection = () => (
  <section id="about" className="py-24 bg-background">
    <div className="container">

      {/* The Problem */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Why This Summit <span className="text-gradient">Matters Now</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Africa's next generation is brilliant, bold, and ready — but the systems designed to support them are broken.
          Graduates leave university with degrees but no direction. Entrepreneurs burn out without mentors.
          And faith-driven leaders are left wondering if their values have a place in the marketplace.
        </p>
      </motion.div>

      {/* Problem Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
        {problemStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 text-center"
          >
            <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-primary mb-1">{stat.value}</div>
            <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* The Answer — Our Mission */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">Our Answer</p>
        <h3 className="text-2xl md:text-4xl font-display font-bold mb-4">
          Opening Doors for the <span className="text-gradient">Next Generation</span>
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          The NextGen Summit is not just an event — it's a launchpad. We bring together Africa's brightest emerging leaders
          with world-class mentors, investors, and Kingdom-aligned organizations to create real pathways to career success,
          business growth, and purpose-driven leadership.
        </p>
      </motion.div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-28">
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

      {/* Convener Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden glass border border-primary/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Column */}
          <div className="relative min-h-[360px] md:min-h-[480px] overflow-hidden">
            <img
              src={hamiltonImg}
              alt="Portrait of Hamilton Gabriel, Convener of NextGen Summit"
              className="absolute inset-0 w-full h-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent md:hidden" />
          </div>

          {/* Content Column */}
          <div className="relative flex flex-col justify-center p-8 md:p-12">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">Meet the Convener</p>

            <h2 className="text-3xl md:text-4xl font-display font-black mb-1">
              Hamilton Gabriel
            </h2>
            <p className="text-primary font-medium mb-6 text-sm">Convener, NextGen Summit</p>

            {/* Pull Quote */}
            <div className="relative mb-6">
              <Quote className="absolute -top-2 -left-1 w-8 h-8 text-primary/20" />
              <blockquote className="pl-8 text-muted-foreground italic leading-relaxed text-sm md:text-base">
                "The next generation of African leaders are not waiting for permission — they are building with purpose,
                driven by faith, and committed to transforming every sphere of influence they touch."
              </blockquote>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Hamilton Gabriel is a Kingdom-minded entrepreneur, leadership development strategist, and passionate advocate
              for Africa's emerging generation. With over a decade of experience bridging the gap between faith communities
              and the marketplace, he has equipped thousands of young professionals across Nigeria and beyond.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              As the founder and convener of the NextGen Summit, Hamilton brings together Africa's brightest minds,
              global mentors, and Kingdom-aligned investors to create an ecosystem where faith and marketplace excellence
              intersect — producing leaders who are both competent and compassionate.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "10+", label: "Years in Leadership Development" },
                { value: "5K+", label: "Young Professionals Mentored" },
                { value: "3", label: "Nations Impacted" },
                { value: "2026", label: "Summit Edition" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <div className="text-xl font-display font-bold text-primary">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AboutSection;
