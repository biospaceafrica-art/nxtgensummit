import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const schedule = [
  {
    time: "8:00 AM",
    title: "Registration & Networking Breakfast",
    desc: "Check in and connect with fellow delegates.",
    type: "general",
    track: "all",
    speaker: "",
  },
  {
    time: "9:00 AM",
    title: "Opening Keynote — Purpose-Driven Leadership",
    desc: "Reflecting God's Image Through Your Career and Business Ventures.",
    type: "keynote",
    track: "all",
    speaker: "Hamilton Gabriel",
  },
  {
    time: "10:30 AM",
    title: "Skill Accelerator — Career Track Session",
    desc: "Deep-dive into career growth strategies, CV optimization, and interview mastery.",
    type: "workshop",
    track: "career",
    speaker: "Dr. Offiong Archibong",
  },
  {
    time: "10:30 AM",
    title: "Skill Accelerator — Business Track Session",
    desc: "Business model canvas, pitch deck creation, and funding strategies.",
    type: "workshop",
    track: "business",
    speaker: "Audrey Joe-Ezigbo",
  },
  {
    time: "12:00 PM",
    title: "Panel: Faith in the Marketplace",
    desc: "Leaders discuss integrating faith with professional excellence.",
    type: "panel",
    track: "all",
    speaker: "Apostle Michael Orokpo, Lucy Doggett Kamero",
  },
  {
    time: "1:00 PM",
    title: "Lunch & Networking",
    desc: "Connect with speakers, sponsors, and fellow attendees.",
    type: "general",
    track: "all",
    speaker: "",
  },
  {
    time: "2:00 PM",
    title: "Scholarship Selection & Business Partnership",
    desc: "Selection process for scholarship candidates, business partnerships, and equity investment.",
    type: "keynote",
    track: "all",
    speaker: "Hamilton Gabriel",
  },
  {
    time: "3:00 PM",
    title: "Career Mentoring — One-on-One",
    desc: "Personal mentoring with industry professionals for career-track attendees.",
    type: "workshop",
    track: "career",
    speaker: "Dr. Offiong Archibong",
  },
  {
    time: "3:00 PM",
    title: "Business Mentoring & Investor Connections",
    desc: "Meet potential investors and business mentors.",
    type: "workshop",
    track: "business",
    speaker: "Audrey Joe-Ezigbo",
  },
  {
    time: "4:30 PM",
    title: "Wisdom Exchange — Group Session",
    desc: "Group mentoring with industry leaders across both tracks.",
    type: "workshop",
    track: "all",
    speaker: "Lucy Doggett Kamero",
  },
  {
    time: "5:00 PM",
    title: "Closing & Commissioning",
    desc: "Certificate presentation and commissioning of faith-driven leaders.",
    type: "keynote",
    track: "all",
    speaker: "Apostle Michael Orokpo",
  },
];

const typeColors: Record<string, string> = {
  keynote: "bg-primary/20 text-primary",
  workshop: "bg-green-500/20 text-green-400",
  panel: "bg-blue-500/20 text-blue-400",
  general: "bg-muted text-muted-foreground",
};

const trackFilters = [
  { value: "all", label: "All Sessions" },
  { value: "career", label: "Career Track" },
  { value: "business", label: "Business Track" },
];

const Schedule = () => {
  const [activeTrack, setActiveTrack] = useState("all");

  const filtered = schedule.filter(
    (s) => activeTrack === "all" || s.track === "all" || s.track === activeTrack
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title="Schedule — NextGen Summit 2026"
        description="Full agenda for NextGen Summit 2026 in Abuja: keynotes, masterclasses, and breakout sessions across business and career tracks."
        path="/schedule"
      />
      <div className="container max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
            Event <span className="text-gradient">Schedule</span>
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 27th June, 2026 • 11:00 AM</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> The Purple Place, Lokogoma, Abuja</span>
          </div>
        </motion.div>

        {/* Track filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-center gap-2 mb-8">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {trackFilters.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={activeTrack === f.value ? "default" : "outline"}
              onClick={() => setActiveTrack(f.value)}
              className={activeTrack === f.value ? "bg-primary text-primary-foreground" : "border-border"}
            >
              {f.label}
            </Button>
          ))}
        </motion.div>

        <div className="space-y-4">
          {filtered.map((item, i) => (
            <motion.div
              key={`${item.time}-${item.title}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-xl p-5 flex gap-5 items-start"
            >
              <div className="text-right min-w-[80px]">
                <span className="text-sm font-semibold text-primary">{item.time}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-sm sm:text-base">{item.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                  {item.track !== "all" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium capitalize">
                      {item.track}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {item.speaker && (
                  <p className="text-xs text-primary mt-1 font-medium">🎤 {item.speaker}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
