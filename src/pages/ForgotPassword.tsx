import { useEffect, useState } from "react";
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

// Local cooldown to avoid spamming the auth server.
// Supabase also rate-limits server-side; this just gives faster, friendlier
// feedback and stops the user from making redundant requests.
const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = "nextgen.fp.cooldownUntil";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [rateError, setRateError] = useState<string | null>(null);

  // Restore + tick the cooldown across reloads.
  useEffect(() => {
    const until = Number(localStorage.getItem(STORAGE_KEY) || 0);
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldown(remaining);
      if (remaining === 0) setRateError(null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sent]);

  const startCooldown = (seconds = COOLDOWN_SECONDS) => {
    const until = Date.now() + seconds * 1000;
    localStorage.setItem(STORAGE_KEY, String(until));
    setCooldown(seconds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      setRateError(`Please wait ${cooldown}s before requesting another reset email.`);
      return;
    }
    setLoading(true);
    setRateError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      startCooldown();
      toast.success("If an account exists, a reset link is on its way.");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Could not send reset email.";
      const lower = raw.toLowerCase();
      // Map known rate-limit / throttle responses (e.g. Supabase
      // "email rate limit exceeded" or "over_email_send_rate_limit") to a
      // single, friendly UX with a visible cooldown.
      if (
        lower.includes("rate limit") ||
        lower.includes("too many") ||
        lower.includes("over_email_send_rate_limit") ||
        lower.includes("throttle")
      ) {
        const friendly = "Too many reset requests. Please wait a minute before trying again.";
        setRateError(friendly);
        startCooldown();
        toast.error(friendly);
      } else {
        toast.error(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || cooldown > 0;

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
                {cooldown > 0 && (
                  <p data-testid="fp-cooldown" className="text-xs text-muted-foreground">
                    You can request another email in {cooldown}s.
                  </p>
                )}
                <Link to="/login" className="text-primary hover:underline text-sm font-medium inline-block">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                {rateError && (
                  <p
                    role="alert"
                    data-testid="fp-rate-error"
                    className="text-sm text-destructive"
                  >
                    {rateError}
                  </p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={disabled}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {loading
                    ? "Sending..."
                    : cooldown > 0
                      ? `Try again in ${cooldown}s`
                      : "Send reset link"}
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
