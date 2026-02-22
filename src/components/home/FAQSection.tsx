import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "Is there an entry fee?", a: "No, registration for NextGen Summit 2026 is completely free for all selected delegates thanks to our sponsors." },
  { q: "Is attendance compulsory?", a: "Yes, attendance is compulsory for all registered delegates. This ensures maximum value from the program and networking." },
  { q: "Is accommodation provided?", a: "We provide discounted rates with partner hotels in Abuja. Delegates are responsible for their own travel and stay." },
  { q: "How do I become a speaker?", a: "Speaker applications are open until March 2026. Please use the 'Plant a Seed' page to express interest." },
  { q: "Will I get a certificate?", a: "Yes! All delegates who complete the summit will receive a verified digital certificate of participation." },
  { q: "What about the scholarship?", a: "The scholarship program is separate from attendance registration. Apply for the fully funded Tech Fellowship 2026 on Eventbrite via our Scholarship page." },
];

const FAQSection = () => (
  <section id="faq" className="py-24 bg-background">
    <div className="container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h2>
      </motion.div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="glass rounded-xl px-6 border-none">
            <AccordionTrigger className="text-left font-medium hover:no-underline py-5">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
