import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Sprout, HandHeart, Landmark, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const tiers = [
  { icon: Sprout, name: "Seedling", amount: "₦10,000", desc: "Support one delegate's materials" },
  { icon: Heart, name: "Gardener", amount: "₦50,000", desc: "Sponsor a full delegate experience" },
  { icon: HandHeart, name: "Harvest Partner", amount: "₦100,000+", desc: "Strategic event partnership" },
];

const bankDetails = {
  bankName: "Guaranty Trust Bank (GTBank)",
  accountNumber: "0123456789",
  accountName: "NextGen Summit Foundation",
};

const PlantASeed = () => {
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    tier: "",
    message: "",
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tier) {
      toast.error("Please select a partnership tier.");
      return;
    }
    if (!paymentConfirmed) {
      toast.error("Please confirm that you have made payment before submitting.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("door_opener_submissions").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        partnership_tier: formData.tier,
        message: formData.message || null,
        payment_confirmed: true,
        payment_confirmed_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Thank you for being a Door Opener! We'll be in touch.");
      setFormData({ fullName: "", email: "", phone: "", tier: "", message: "" });
      setPaymentConfirmed(false);
    } catch (err: any) {
      toast.error(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Be a <span className="text-gradient">Door Opener</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Leverage your influence and resources to open pathways for the next generation. Partner with us as a sponsor.
          </p>
        </motion.div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
            >
              <t.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg">{t.name}</h3>
              <p className="text-2xl font-display font-bold text-gradient my-2">{t.amount}</p>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Payment Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Landmark className="w-6 h-6 text-primary" />
            <h2 className="font-display font-bold text-xl">Payment Account Details</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Make your transfer to the account below, then fill the form and confirm payment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
              <p className="font-semibold text-sm">{bankDetails.bankName}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm font-mono">{bankDetails.accountNumber}</p>
                <button onClick={() => copyToClipboard(bankDetails.accountNumber)} className="text-primary hover:text-primary/80">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Account Name</p>
              <p className="font-semibold text-sm">{bankDetails.accountName}</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <h2 className="font-display font-bold text-2xl text-center mb-4">Become a Door Opener</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name / Organization</Label>
              <Input placeholder="Your name or organization" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+234..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Partnership Tier</Label>
              <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="seedling">Seedling — ₦10,000</SelectItem>
                  <SelectItem value="gardener">Gardener — ₦50,000</SelectItem>
                  <SelectItem value="harvest">Harvest Partner — ₦100,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea placeholder="How would you like to support the summit?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
          </div>

          {/* Payment Confirmation */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
            <Checkbox
              id="payment-confirm"
              checked={paymentConfirmed}
              onCheckedChange={(v) => setPaymentConfirmed(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="payment-confirm" className="text-sm cursor-pointer">
              <span className="font-semibold">I confirm that I have made payment</span>
              <span className="text-muted-foreground block text-xs mt-1">
                Your submission will only be recorded after confirming payment. Please ensure you've transferred to the account above.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !paymentConfirmed}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {loading ? "Submitting..." : "Submit as Door Opener 🚪"}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default PlantASeed;
