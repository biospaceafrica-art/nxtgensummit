import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import nextgenLogo from "@/assets/nextgen-logo.png";
import SEO from "@/components/SEO";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your inbox for a reset link.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send reset email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password — NextGen Summit 2026"
        description="Recover your NextGen Summit account by requesting a secure password reset link."
        path="/forgot-password"
      />
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src={nextgenLogo} alt="NextGen Summit" className="h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold">Forgot your password?</h1>
            <p className="text-sm text-muted-foreground mt-1">
              We'll email you a secure link to set a new one.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
            {sent ? (
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  If an account exists for <span className="text-foreground font-medium">{email}</span>,
                  a reset link is on its way. The link expires shortly for security.
                </p>
                <Link to="/login" className="text-primary hover:underline text-sm font-medium inline-block">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Remembered it?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
