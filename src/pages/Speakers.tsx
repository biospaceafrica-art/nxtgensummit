import { motion } from "framer-motion";

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
    bio: "Faith-Driven Entrepreneur",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop",
  },
  {
    name: "Audrey Joe-Ezigbo",
    title: "CEO & Co-Founder",
    org: "Falcon Corporation",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
  },
  {
    name: "Manuela Hargassner-Delpos",
    title: "Labour Market Expert",
    org: "Public Employment Service, Vienna",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=500&fit=crop",
  },
  {
    name: "Apostle Michael Orokpo",
    title: "President",
    org: "Encounter Jesus Ministries",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    name: "Susanne Schroeder",
    title: "Head of Dev Corp.",
    org: "German Embassy Nig. ECOWAS",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop",
  },
];

const Speakers = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          Our <span className="text-gradient">Speakers</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Proven leaders who have successfully integrated faith with professional excellence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {speakers.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
              <img
                src={s.image}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display font-bold text-xl text-foreground">{s.name}</h3>
                <p className="text-primary text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.org}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Speakers;
