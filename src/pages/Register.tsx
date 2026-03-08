import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, GraduationCap, Search } from "lucide-react";

const businessCourses = [
  "Entrepreneurship & Innovation",
  "Financial Literacy & Management",
  "Digital Marketing & E-commerce",
  "Agribusiness & Supply Chain",
];

const careerCourses = [
  "Tech & Software Development",
  "Leadership & Management",
  "Creative Arts & Media",
  "Healthcare & Sciences",
];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "",
    track: "" as "" | "career" | "enterprise",
    selectedCourse: "",
  });

  const allCourses = formData.track === "enterprise" ? businessCourses : formData.track === "career" ? careerCourses : [];
  const filteredCourses = allCourses.filter((c) =>
    c.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status || !formData.track || !formData.selectedCourse) {
      toast.error("Please complete all required fields.");
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
        selected_course: formData.selectedCourse,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already registered.");
        } else {
          throw error;
        }
      } else {
        toast.success("Registration submitted successfully! See you at the summit.");
        setFormData({ fullName: "", email: "", phone: "", status: "", track: "", selectedCourse: "" });
        setCourseSearch("");
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
          {/* Personal Info */}
          <div>
            <h2 className="font-display font-bold text-lg mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+234..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <h2 className="font-display font-bold text-lg mb-4">Current Status</h2>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue placeholder="Select your current status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="corp_member">Corp Member</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fellowship Program */}
          <div>
            <h2 className="font-display font-bold text-lg mb-4">Fellowship Program</h2>
            <RadioGroup
              value={formData.track}
              onValueChange={(v) => setFormData({ ...formData, track: v as "career" | "enterprise", selectedCourse: "" })}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <label
                htmlFor="track-enterprise"
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  formData.track === "enterprise" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value="enterprise" id="track-enterprise" className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Business Champions
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Entrepreneurship, finance, digital marketing & agribusiness</p>
                </div>
              </label>
              <label
                htmlFor="track-career"
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  formData.track === "career" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value="career" id="track-career" className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    Career Champions
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Tech, leadership, creative arts & healthcare careers</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Course Selection with Search */}
          {formData.track && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display font-bold text-lg mb-3">
                Select Course — {formData.track === "enterprise" ? "Business Champions" : "Career Champions"}
              </h2>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <RadioGroup
                value={formData.selectedCourse}
                onValueChange={(v) => setFormData({ ...formData, selectedCourse: v })}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {filteredCourses.map((course) => (
                  <label
                    key={course}
                    htmlFor={`course-${course}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${
                      formData.selectedCourse === course ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <RadioGroupItem value={course} id={`course-${course}`} />
                    {course}
                  </label>
                ))}
                {filteredCourses.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2 py-2">No courses match your search.</p>
                )}
              </RadioGroup>
            </motion.div>
          )}

          <div className="pt-2">
            <Button type="submit" size="lg" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm sm:text-base">
              {loading ? "Submitting..." : "Complete Registration"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Looking for scholarship opportunities?{" "}
            <Link to="/scholarship" className="text-primary hover:underline font-medium">
              View Scholarship Program →
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Register;
