import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTASection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
    <div className="container relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Ready to <span className="text-gradient">Ignite</span> Your Potential?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Secure your spot at Africa's premier faith-driven leadership summit. June 20, 2026 • The Purple Place, Lokogoma, Abuja.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 text-base font-semibold">
              Register Now — It's Free
            </Button>
          </Link>
          <a href="https://www.eventbrite.com/e/tech-fellowship-2026fully-funded-cybersecurity-data-science-software-tickets-1983649195141?aff=oddtdtcreator" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 px-10 text-base">
              Apply for Scholarship
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
