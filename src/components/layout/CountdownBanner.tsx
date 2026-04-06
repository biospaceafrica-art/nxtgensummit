import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const TARGET_DATE = new Date("2026-06-27T09:00:00+01:00");

const CountdownBanner = () => {
  const [days, setDays] = useState(0);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("countdown-dismissed") === "true");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = TARGET_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setIsLive(true);
        return;
      }
      setDays(Math.floor(diff / 86400000));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("countdown-dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground">
      <div className="container flex items-center justify-center gap-3 h-9 text-xs sm:text-sm font-medium relative">
        {isLive ? (
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            NextGen Summit 2026 is LIVE!
          </span>
        ) : (
          <>
            <span>🔥 NextGen Summit 2026 — <strong>{days} days</strong> to go!</span>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-xs font-semibold"
            >
              Register Free →
            </Link>
          </>
        )}
        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default CountdownBanner;
