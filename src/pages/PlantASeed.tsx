import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sprout, HandHeart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const tiers = [
  { icon: Sprout, name: "Seedling", amount: "₦10,000", desc: "Support one delegate's materials" },
  { icon: Heart, name: "Gardener", amount: "₦50,000", desc: "Sponsor a full delegate experience" },
  { icon: HandHeart, name: "Harvest Partner", amount: "₦100,000+", desc: "Strategic event partnership" },
];

const PlantASeed = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you for planting a seed! We'll be in touch.");
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
            Plant a <span className="text-gradient">Seed</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Be a Door Opener. Leverage your influence and resources to open pathways for the next generation.
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

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 space-y-6"
        >
          <h2 className="font-display font-bold text-2xl text-center mb-4">Become a Door Opener</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name / Organization</Label>
              <Input placeholder="Your name or organization" required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+234..." required />
            </div>
            <div className="space-y-2">
              <Label>Partnership Tier</Label>
              <Select>
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
            <Textarea placeholder="How would you like to support the summit?" />
          </div>
          <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Plant Your Seed 🌱
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default PlantASeed;
