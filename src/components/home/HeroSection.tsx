import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const TARGET_DATE = new Date("2026-06-20T09:00:00+01:00");

const HeroSection = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = TARGET_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://www.youtube.com/embed/FeoZU_jmFqQ?autoplay=1&mute=1&loop=1&playlist=FeoZU_jmFqQ&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1"
          className="absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Background Video"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>

      <div className="relative z-10 container text-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-tight mb-6">
            Next Generation
            <br />
            <span className="text-gradient">Summit 2026</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-light">
            Raising the Next Generation of Faith-Driven Business and Career Leaders.
          </p>
          <p className="text-sm sm:text-base text-primary font-medium mb-10">
            A Strategy for Global Missions and Evangelism.
          </p>

          {/* Countdown */}
          <div className="flex justify-center gap-3 sm:gap-6 mb-10">
            {[
              { val: timeLeft.days, label: "Days" },
              { val: timeLeft.hours, label: "Hours" },
              { val: timeLeft.mins, label: "Mins" },
              { val: timeLeft.secs, label: "Secs" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-xl px-4 py-3 sm:px-6 sm:py-4 min-w-[70px]">
                <div className="text-2xl sm:text-4xl font-bold text-foreground font-display">
                  {String(item.val).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 font-semibold">
                Get Your Free Ticket
              </Button>
            </Link>
            <Link to="/plant-a-seed">
              <Button size="lg" variant="outline" className="text-base px-8 border-primary/40 text-primary hover:bg-primary/10">
                Plant a Seed
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
