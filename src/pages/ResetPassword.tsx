import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import nextgenLogo from "@/assets/nextgen-logo.png";
import SEO from "@/components/SEO";

// Password policy enforced both inline and at submit time.
// Keep these regexes in sync with any backend rules.
const PASSWORD_RULES = [
  { id: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "num", label: "One number (0-9)", test: (p: string) => /\d/.test(p) },
];

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const navigate = useNavigate();

  const ruleResults = PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(password) }));
  const allRulesPass = ruleResults.every((r) => r.ok);
  const confirmMismatch = confirm.length > 0 && confirm !== password;

  // Supabase recovery flow: the link contains a hash with access_token + type=recovery.
  // The auth client picks it up automatically and emits PASSWORD_RECOVERY.
  // Expired/used/invalid tokens surface as `error=...&error_code=otp_expired` in the hash.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errCode = hash.get("error_code") || hash.get("error");
    if (errCode) {
      const desc = hash.get("error_description")?.replace(/\+/g, " ") || "";
      if (errCode === "otp_expired" || /expired/i.test(desc)) {
        setLinkError("This password reset link has expired. Please request a new one.");
      } else if (/used|consumed/i.test(desc)) {
        setLinkError("This password reset link has already been used. Please request a new one.");
      } else {
        setLinkError(desc || "This password reset link is invalid. Please request a new one.");
      }
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // Also handle the case where the listener missed the event (page reload, etc.)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && window.location.hash.includes("type=recovery")) setReady(true);
      else if (session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);
    if (!allRulesPass) {
      setInlineError("Your password doesn't meet all the requirements yet.");
      return;
    }
    if (password !== confirm) {
      setInlineError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate("/", { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Could not update password.";
      const lower = raw.toLowerCase();
      if (/same.*password|new password should be different/i.test(lower)) {
        setInlineError("Your new password must be different from your current one.");
      } else if (/weak|short|at least|characters/i.test(lower)) {
        setInlineError(raw);
      } else if (/expired|invalid|otp|jwt|token|session/i.test(lower)) {
        const friendly = "Your password reset link has expired or already been used. Please request a new one.";
        setLinkError(friendly);
        toast.error(friendly);
      } else {
        toast.error(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Set a new password — NextGen Summit 2026"
        description="Set a new password to recover your NextGen Summit account."
        path="/reset-password"
      />
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src={nextgenLogo} alt="NextGen Summit" className="h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold">Set a new password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose something strong — minimum 8 characters.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
            {linkError ? (
              <div
                role="alert"
                data-testid="reset-link-error"
                className="text-center text-sm space-y-3"
              >
                <p className="text-destructive font-medium">{linkError}</p>
                <Link to="/forgot-password" className="text-primary hover:underline font-medium inline-block">
                  Request a new link
                </Link>
              </div>
            ) : !ready ? (
              <div className="text-center text-sm text-muted-foreground space-y-3">
                <p>
                  This page must be opened from the password reset link sent to your email.
                </p>
                <Link to="/forgot-password" className="text-primary hover:underline font-medium inline-block">
                  Request a new link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update password"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;
