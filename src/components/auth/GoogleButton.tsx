import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  label?: string;
  redirectTo?: string;
};

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/>
  </svg>
);

const GoogleButton = ({ label = "Continue with Google", redirectTo }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectTo ?? window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed.");
        setLoading(false);
        return;
      }
      // If redirected the browser will navigate away; otherwise tokens are set
      if (!result.redirected) {
        toast.success("Signed in with Google.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-background hover:bg-secondary border-border font-medium"
    >
      <GoogleIcon />
      {loading ? "Connecting..." : label}
    </Button>
  );
};

export default GoogleButton;
