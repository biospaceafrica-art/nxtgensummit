import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback, useMemo } from "react";

const Badge = () => {
  const [params] = useSearchParams();
  const name = params.get("name") || "Attendee";
  const track = params.get("track") || "career";
  const course = params.get("course") || "";
  const email = params.get("email") || "";
  const badgeRef = useRef<HTMLDivElement>(null);

  const trackLabel = track === "enterprise" ? "Business Champions" : "Career Champions";
  const qrData = JSON.stringify({ name, email, track, course, event: "NextGen Summit 2026" });

  const shareText = useMemo(
    () => `I'm attending NextGen Summit 2026 as a ${trackLabel}! 🚀 Join me on September 26 at The Purple Place, Abuja.`,
    [trackLabel]
  );
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

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
        text: shareText,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  }, [shareText, shareUrl]);

  const socialLinks = useMemo(() => [
    {
      label: "Twitter / X",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "LinkedIn",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
  ], [shareText, shareUrl]);

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
            {course && <p className="text-xs text-muted-foreground">{course}</p>}
            <div className="flex justify-center pt-2">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={qrData} size={140} level="M" />
              </div>
            </div>
            <div className="pt-2 space-y-0.5">
              <p className="text-[10px] text-muted-foreground">📅 September 26, 2026 · 11:00 AM</p>
              <p className="text-[10px] text-muted-foreground">📍 The Purple Place, Lokogoma, Abuja</p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 justify-center">
          <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" /> Download Badge
          </Button>
          <Button variant="outline" onClick={handleShare} className="border-primary/40 text-primary hover:bg-primary/10">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

        {/* Social sharing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted-foreground mb-3">Share on social media</p>
          <div className="flex justify-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${s.label}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors text-xs font-medium"
              >
                {s.icon}
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Badge;
