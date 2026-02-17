import { motion } from "framer-motion";
import { Users, Handshake, Mic, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "2000+", label: "Participants Reached" },
  { icon: Handshake, value: "50+", label: "Scholarships Awarded" },
  { icon: Mic, value: "5+", label: "Industry Speakers" },
  { icon: Award, value: "100+", label: "Jobs Connected" },
];

const StatsSection = () => (
  <section className="py-12 sm:py-16 bg-secondary/50">
    <div className="container px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-4 sm:p-6"
          >
            <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">{stat.value}</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
