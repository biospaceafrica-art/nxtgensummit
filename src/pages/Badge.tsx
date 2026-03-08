import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback } from "react";

const Badge = () => {
  const [params] = useSearchParams();
  const name = params.get("name") || "Attendee";
  const track = params.get("track") || "career";
  const course = params.get("course") || "";
  const email = params.get("email") || "";
  const badgeRef = useRef<HTMLDivElement>(null);

  const trackLabel = track === "enterprise" ? "Business Champions" : "Career Champions";
  const qrData = JSON.stringify({ name, email, track, course, event: "NextGen Summit 2026" });

  const handleDownload = useCallback(async () => {
    if (!badgeRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(badgeRef.current, { backgroundColor: null, scale: 2 });
    const link = document.createElement("a");
    link.download = `nextgen-badge-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [name]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My NextGen Summit 2026 Badge",
        text: `I'm attending NextGen Summit 2026 as a ${trackLabel}! 🚀`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [trackLabel]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 flex items-center justify-center">
      <div className="container max-w-lg px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            Your <span className="text-gradient">Digital Badge</span>
          </h1>
          <p className="text-sm text-muted-foreground">Save or share your personalized attendee badge</p>
        </motion.div>

        <motion.div
          ref={badgeRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden border border-primary/30 bg-gradient-to-br from-background via-secondary to-background p-6 sm:p-8"
        >
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/50 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/50 rounded-br-2xl" />

          <div className="text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
              NextGen Summit 2026
            </p>

            <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground leading-tight">
              {name}
            </h2>

            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30">
              <span className="text-xs sm:text-sm font-semibold text-primary">{trackLabel}</span>
            </div>

            {course && (
              <p className="text-xs text-muted-foreground">{course}</p>
            )}

            <div className="flex justify-center pt-2">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={qrData} size={140} level="M" />
              </div>
            </div>

            <div className="pt-2 space-y-0.5">
              <p className="text-[10px] text-muted-foreground">📅 June 20, 2026 · 11:00 AM</p>
              <p className="text-[10px] text-muted-foreground">📍 The Purple Place, Lokogoma, Abuja</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3 mt-6 justify-center">
          <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" /> Download Badge
          </Button>
          <Button variant="outline" onClick={handleShare} className="border-primary/40 text-primary hover:bg-primary/10">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Badge;
