import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Amara Okonkwo",
    role: "Entrepreneur, Lagos",
    quote:
      "NextGen Summit completely shifted my perspective on building a faith-driven business. The connections I made there opened doors I never imagined possible.",
    avatar: "AO",
  },
  {
    name: "David Eze",
    role: "Software Engineer, Abuja",
    quote:
      "The career track gave me practical strategies that I applied immediately. Within three months of attending, I landed my dream role at a global tech firm.",
    avatar: "DE",
  },
  {
    name: "Grace Adeyemi",
    role: "Non-profit Director, Ibadan",
    quote:
      "I came looking for guidance and left with a God-given mission. The speakers were incredibly anointed and the fellowship track was transformational.",
    avatar: "GA",
  },
  {
    name: "Samuel Nwosu",
    role: "Medical Doctor & Startup Founder",
    quote:
      "This summit is different — it's not just motivational talk. It's strategic, Spirit-led, and genuinely impactful. I've attended twice and plan to keep coming.",
    avatar: "SN",
  },
  {
    name: "Blessing Obi",
    role: "Marketing Lead, Port Harcourt",
    quote:
      "The networking alone was worth it. I met my current business partner at the summit and we've been building together ever since. Truly life-changing.",
    avatar: "BO",
  },
];

const AUTOPLAY_MS = 6000;

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [next]);

  const t = TESTIMONIALS[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            <Quote className="w-4 h-4" />
            Voices of Impact
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-foreground">
            What Attendees <span className="text-gradient">Are Saying</span>
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative glass rounded-2xl p-8 sm:p-12 min-h-[260px] flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-center w-full"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary font-display font-bold text-lg flex items-center justify-center mx-auto mb-5">
                {t.avatar}
              </div>

              {/* Quote */}
              <p className="text-base sm:text-lg text-foreground/90 italic leading-relaxed mb-6 max-w-xl mx-auto">
                "{t.quote}"
              </p>

              {/* Name */}
              <p className="font-display font-bold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-primary w-6" : "bg-muted-foreground/30"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
