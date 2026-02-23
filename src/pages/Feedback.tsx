import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
  <div className="space-y-1">
    <Label className="text-sm">{label}</Label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-colors"
        >
          <Star
            className={`w-7 h-7 ${star <= value ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  </div>
);

const Feedback = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    overallRating: 0,
    contentRating: 0,
    speakersRating: 0,
    organizationRating: 0,
    comments: "",
    wouldRecommend: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.overallRating === 0) {
      toast.error("Please provide an overall rating.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        full_name: form.fullName,
        email: form.email,
        overall_rating: form.overallRating,
        content_rating: form.contentRating || null,
        speakers_rating: form.speakersRating || null,
        organization_rating: form.organizationRating || null,
        comments: form.comments || null,
        would_recommend: form.wouldRecommend,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-primary fill-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">Thank You!</h1>
          <p className="text-muted-foreground">Your feedback helps us make the next summit even better.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
            Event <span className="text-gradient">Feedback</span>
          </h1>
          <p className="text-muted-foreground">We'd love to hear about your experience at NextGen Summit 2026.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Your name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StarRating label="Overall Experience *" value={form.overallRating} onChange={(v) => setForm({ ...form, overallRating: v })} />
            <StarRating label="Content Quality" value={form.contentRating} onChange={(v) => setForm({ ...form, contentRating: v })} />
            <StarRating label="Speakers" value={form.speakersRating} onChange={(v) => setForm({ ...form, speakersRating: v })} />
            <StarRating label="Organization" value={form.organizationRating} onChange={(v) => setForm({ ...form, organizationRating: v })} />
          </div>

          <div className="space-y-2">
            <Label>Comments (Optional)</Label>
            <Textarea placeholder="What did you enjoy most? What can we improve?" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recommend"
              checked={form.wouldRecommend}
              onChange={(e) => setForm({ ...form, wouldRecommend: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="recommend" className="text-sm">I would recommend this summit to others</label>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default Feedback;
