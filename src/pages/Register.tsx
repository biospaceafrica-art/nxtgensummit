import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "",
    track: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status || !formData.track) {
      toast.error("Please select your status and fellowship track.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("registrations").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        current_status: formData.status as "employed" | "unemployed" | "corp_member" | "student",
        fellowship_track: formData.track as "career" | "enterprise",
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already registered.");
        } else {
          throw error;
        }
      } else {
        toast.success("Registration submitted! Check your email for confirmation.");
        setFormData({ fullName: "", email: "", phone: "", status: "", track: "" });
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Register <span className="text-gradient">Free</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Secure your spot at NextGen Summit 2026. Attendance is compulsory for all registered delegates.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+234..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="corp_member">Corp Member</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fellowship Track</Label>
            <Select value={formData.track} onValueChange={(v) => setFormData({ ...formData, track: v })}>
              <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="career">Career Track</SelectItem>
                <SelectItem value="enterprise">Enterprise Track</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm sm:text-base">
              {loading ? "Submitting..." : "Complete Registration"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Scholarship applications are separate.{" "}
            <a href="https://theplatformnigeria.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Apply for Scholarship →
            </a>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Register;
