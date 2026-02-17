import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const speakers = [
  {
    name: "Dr. Offiong Archibong",
    title: "Senior Strategy Advisor",
    org: "World Bank",
    image: "https://nextgenerationsummit.com/wp-content/uploads/2025/12/IMG_1985-scaled-e1766428293794.jpg",
  },
  {
    name: "Lucy Doggett Kamero",
    title: "Africa KBN Coordinator",
    org: "Global Advance",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop",
  },
  {
    name: "Audrey Joe-Ezigbo",
    title: "CEO & Co-Founder",
    org: "Falcon Corporation",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
  },
];

const SpeakersPreview = () => (
  <section className="py-24 bg-secondary/30">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Voices of <span className="text-gradient">Change</span>
        </h2>
        <p className="text-muted-foreground">Learn from proven leaders shaping Africa's future.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {speakers.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="group"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
              <img
                src={s.image}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
            <h3 className="font-display font-semibold text-lg">{s.name}</h3>
            <p className="text-sm text-primary">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.org}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/speakers">
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
            View All Speakers <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default SpeakersPreview;
