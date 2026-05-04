import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, KeyRound } from "lucide-react";
import nextgenLogo from "@/assets/nextgen-logo.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();

  // Prefetch admin dashboard chunk while user is on the login page
  // so the redirect after a successful login is instant.
  useEffect(() => {
    import("./Admin");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check admin role via edge function
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("check-admin", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (!res.data?.isAdmin) {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin privileges required.");
        return;
      }

      // Check if password needs to be changed (first login with default password)
      if (password === "123456" || res.data?.needsPasswordChange) {
        setShowPasswordChange(true);
        toast.info("Please change your default password to continue.");
        return;
      }

      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword === "123456") {
      toast.error("Please choose a different password.");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { password_changed: true, needs_password_change: false },
      });
      if (error) throw error;
      toast.success("Password updated! Redirecting to dashboard...");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={nextgenLogo} alt="NextGen Summit" className="h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold">
            {showPasswordChange ? "Change Password" : "Admin Login"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {showPasswordChange
              ? "You must set a new password before continuing"
              : "Sign in to access the dashboard"}
          </p>
        </div>

        {!showPasswordChange ? (
          <form onSubmit={handleLogin} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              <Lock className="w-4 h-4 mr-2" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-center">
              <KeyRound className="w-5 h-5 text-primary mx-auto mb-2" />
              For security, you must change your default password before accessing the dashboard.
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={changingPassword}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {changingPassword ? "Updating..." : "Update Password & Continue"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
