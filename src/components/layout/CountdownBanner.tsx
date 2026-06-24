import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Share2 } from "lucide-react";

const TARGET_DATE = new Date("2026-09-26T09:00:00+01:00");
const DISMISS_KEY = "countdown-dismissed";
const DISMISS_TIME_KEY = "countdown-dismissed-at";
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const CountdownBanner = () => {
  const [days, setDays] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    const dismissedAt = localStorage.getItem(DISMISS_TIME_KEY);
    if (!dismissedAt) return false;
    return Date.now() - Number(dismissedAt) < TWENTY_FOUR_HOURS;
  });
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
    localStorage.setItem(DISMISS_KEY, "true");
    localStorage.setItem(DISMISS_TIME_KEY, String(Date.now()));
  };

  const share = () => {
    const text = isLive
      ? "🔥 NextGen Summit 2026 is LIVE! Join us now!"
      : `🔥 Only ${days} days until NextGen Summit 2026! Register free:`;
    const url = "https://nxtgensummit.lovable.app/register";

    if (navigator.share) {
      navigator.share({ title: "NextGen Summit 2026", text, url }).catch(() => {});
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, "_blank");
    }
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
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={share}
            className="opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Share event countdown"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={dismiss}
            className="opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountdownBanner;
