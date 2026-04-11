import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Music, Navigation, Megaphone, HandHeart, CheckCircle } from "lucide-react";
import volunteerBanner from "@/assets/volunteer-banner.png";

const positions = [
  { value: "mass_choir", label: "Mass Choir", icon: Music, desc: "Lead worship and set the atmosphere" },
  { value: "ushering", label: "Ushering", icon: HandHeart, desc: "Welcome and guide attendees" },
  { value: "transportation", label: "Transportation & Logistics", icon: Navigation, desc: "Coordinate movement and event logistics" },
  { value: "social_media", label: "Social Media", icon: Megaphone, desc: "Capture and share the experience live" },
];

const Volunteer = () => {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", position: "", experience: "", why_volunteer: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.position) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("volunteer_applications").insert({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      position: form.position,
      experience: form.experience || null,
      why_volunteer: form.why_volunteer || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Submission failed. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Application Received!</h2>
          <p className="text-muted-foreground mb-4">
            Thank you for volunteering! We'll be in touch soon. Join our WhatsApp group and follow us on Instagram and Facebook for updates.
          </p>
          <div className="flex flex-col gap-2">
            <a href="https://chat.whatsapp.com/CAVi4oKBoyv4b3vo92AKkl?mode=gi_t" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">🟢 Join Volunteer WhatsApp Group</Button>
            </a>
            <a href="https://forms.gle/Hjzyizt5YmeoWxTK6" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">Also fill the Google Form</Button>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3">
            Call for <span className="text-gradient">Volunteers</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            The Next Generation Summit 2026 is coming to Abuja on 27th June — and we're inviting YOU to be part of something bigger than just an event. — and we're inviting YOU to be part of something bigger than just an event.
          </p>
        </motion.div>

        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <img src={volunteerBanner} alt="Call for Volunteers — Next Generation Summit 2026" className="w-full rounded-2xl" />
        </motion.div>

        {/* Why Volunteer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-xl font-display font-bold mb-4">Why You Should Volunteer</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />Access fully funded scholarships worth ₦500,000 in high-value tech skills</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />Network with top business leaders, founders, and industry giants</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />Receive structured volunteer training and certification</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />Spaces are limited — apply now!</li>
          </ul>
        </motion.div>

        {/* Positions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {positions.map((p) => (
            <div key={p.value} className="glass rounded-xl p-4 text-center">
              <p.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-semibold">{p.label}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">{p.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
            <h2 className="text-xl font-display font-bold mb-2">Apply Now</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name *</label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email *</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Position *</label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Relevant Experience</label>
              <Textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="Briefly describe any relevant experience..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Why do you want to volunteer?</label>
              <Textarea value={form.why_volunteer} onChange={(e) => setForm({ ...form, why_volunteer: e.target.value })} placeholder="What motivates you to join the team?" rows={3} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Volunteer;
