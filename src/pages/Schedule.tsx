import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

const schedule = [
  {
    time: "8:00 AM",
    title: "Registration & Networking Breakfast",
    desc: "Check in and connect with fellow delegates.",
    type: "general",
  },
  {
    time: "9:00 AM",
    title: "Opening Keynote — Purpose-Driven Leadership",
    desc: "Reflecting God's Image Through Your Career and Business Ventures.",
    type: "keynote",
  },
  {
    time: "10:30 AM",
    title: "Skill Accelerator — Track Sessions",
    desc: "Career Track & Enterprise Track breakout sessions begin.",
    type: "workshop",
  },
  {
    time: "12:00 PM",
    title: "Panel: Faith in the Marketplace",
    desc: "Leaders discuss integrating faith with professional excellence.",
    type: "panel",
  },
  {
    time: "1:00 PM",
    title: "Lunch & Networking",
    desc: "Connect with speakers, sponsors, and fellow attendees.",
    type: "general",
  },
  {
    time: "2:00 PM",
    title: "Scholarship Selection & Business Partnership",
    desc: "Selection process for scholarship candidates, business partnerships, and equity investment.",
    type: "keynote",
  },
  {
    time: "3:30 PM",
    title: "Wisdom Exchange & Mentoring Sessions",
    desc: "One-on-one and group mentoring with industry leaders.",
    type: "workshop",
  },
  {
    time: "5:00 PM",
    title: "Closing & Commissioning",
    desc: "Certificate presentation and commissioning of faith-driven leaders.",
    type: "keynote",
  },
];

const typeColors: Record<string, string> = {
  keynote: "bg-primary/20 text-primary",
  workshop: "bg-green-500/20 text-green-400",
  panel: "bg-blue-500/20 text-blue-400",
  general: "bg-muted text-muted-foreground",
};

const Schedule = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          Event <span className="text-gradient">Schedule</span>
        </h1>
        <div className="flex items-center justify-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> June 20, 2026</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> The Purple Place, Lokogoma, Abuja</span>
        </div>
      </motion.div>

      <div className="space-y-4">
        {schedule.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5 flex gap-5 items-start"
          >
            <div className="text-right min-w-[80px]">
              <span className="text-sm font-semibold text-primary">{item.time}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-semibold">{item.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[item.type]}`}>
                  {item.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Schedule;
