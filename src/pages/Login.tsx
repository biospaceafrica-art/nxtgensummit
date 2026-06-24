import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import nextgenLogo from "@/assets/nextgen-logo.png";
import GoogleButton from "@/components/auth/GoogleButton";
import SEO from "@/components/SEO";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const routeByRole = async (accessToken: string) => {
      try {
        const res = await supabase.functions.invoke("check-admin", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (cancelled) return;
        navigate(res.data?.isAdmin ? "/admin" : "/", { replace: true });
      } catch {
        if (!cancelled) navigate("/", { replace: true });
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) routeByRole(session.access_token);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) routeByRole(session.access_token);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      // onAuthStateChange will route to /admin or / based on role.
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign In — NextGen Summit 2026"
        description="Sign in to your NextGen Summit account to access your ticket, networking, and personalized schedule."
        path="/login"
      />
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src={nextgenLogo} alt="NextGen Summit" className="h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your NextGen account</p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
            <GoogleButton label="Sign in with Google" />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
