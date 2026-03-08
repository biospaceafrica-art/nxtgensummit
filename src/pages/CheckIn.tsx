import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Search, CheckCircle, XCircle, Users } from "lucide-react";

type CheckInResult = {
  success: boolean;
  name: string;
  track: string;
  course: string | null;
  alreadyCheckedIn?: boolean;
};

const CheckIn = () => {
  const [mode, setMode] = useState<"scanner" | "manual">("scanner");
  const [scanning, setScanning] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Fetch checked-in count
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase.from("check_ins").select("*", { count: "exact", head: true });
      setCheckedInCount(count || 0);
    };
    fetchCount();
    const channel = supabase
      .channel("check-ins-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "check_ins" }, fetchCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const processCheckIn = useCallback(async (data: string) => {
    setLoading(true);
    try {
      let parsed: { email?: string; name?: string };
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = { email: data };
      }

      const email = parsed.email;
      if (!email) {
        setLastResult({ success: false, name: "Unknown", track: "", course: null });
        toast.error("Invalid QR code data");
        return;
      }

      // Find registration
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .select("id, full_name, fellowship_track, selected_course")
        .eq("email", email)
        .maybeSingle();

      if (regErr || !reg) {
        setLastResult({ success: false, name: email, track: "", course: null });
        toast.error("No registration found for this attendee");
        return;
      }

      // Try check in
      const { error: checkInErr } = await supabase.from("check_ins").insert({
        registration_id: reg.id,
        method: mode === "scanner" ? "qr_scan" : "manual",
      });

      if (checkInErr) {
        if (checkInErr.code === "23505") {
          setLastResult({
            success: true,
            name: reg.full_name,
            track: reg.fellowship_track,
            course: reg.selected_course,
            alreadyCheckedIn: true,
          });
          toast.info(`${reg.full_name} was already checked in`);
        } else {
          throw checkInErr;
        }
      } else {
        setLastResult({
          success: true,
          name: reg.full_name,
          track: reg.fellowship_track,
          course: reg.selected_course,
        });
        toast.success(`✓ ${reg.full_name} checked in!`);
        setCheckedInCount((c) => c + 1);
      }
    } catch (err: any) {
      toast.error(err.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          processCheckIn(decodedText);
          scanner.pause(true);
          setTimeout(() => {
            try { scanner.resume(); } catch {}
          }, 3000);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      toast.error("Could not access camera. Try manual check-in.");
    }
  }, [processCheckIn]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    await processCheckIn(manualEmail.trim());
    setManualEmail("");
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12">
      <div className="container max-w-xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">
            Event <span className="text-gradient">Check-In</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{checkedInCount} checked in</span>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 justify-center">
          <Button
            variant={mode === "scanner" ? "default" : "outline"}
            onClick={() => { setMode("scanner"); stopScanner(); }}
            className={mode === "scanner" ? "bg-primary text-primary-foreground" : "border-primary/40 text-primary"}
          >
            <Camera className="w-4 h-4 mr-2" /> QR Scanner
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            onClick={() => { setMode("manual"); stopScanner(); }}
            className={mode === "manual" ? "bg-primary text-primary-foreground" : "border-primary/40 text-primary"}
          >
            <Search className="w-4 h-4 mr-2" /> Manual
          </Button>
        </div>

        {/* QR Scanner */}
        {mode === "scanner" && (
          <div className="space-y-4">
            <div
              id="qr-reader"
              ref={scannerRef}
              className="rounded-xl overflow-hidden border border-border bg-secondary/30 min-h-[300px]"
            />
            {!scanning ? (
              <Button onClick={startScanner} className="w-full bg-primary text-primary-foreground">
                <Camera className="w-4 h-4 mr-2" /> Start Camera
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="outline" className="w-full border-primary/40 text-primary">
                Stop Camera
              </Button>
            )}
          </div>
        )}

        {/* Manual Check-in */}
        {mode === "manual" && (
          <form onSubmit={handleManualCheckIn} className="flex gap-2">
            <Input
              placeholder="Enter attendee email..."
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              type="email"
              required
            />
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground shrink-0">
              Check In
            </Button>
          </form>
        )}

        {/* Result Card */}
        {lastResult && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6">
            <Card className={`border-2 ${lastResult.success ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}`}>
              <CardContent className="p-6 text-center space-y-2">
                {lastResult.success ? (
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                ) : (
                  <XCircle className="w-12 h-12 mx-auto text-destructive" />
                )}
                <h3 className="text-xl font-display font-bold">{lastResult.name}</h3>
                {lastResult.success && (
                  <>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      {lastResult.track === "enterprise" ? "Business Champions" : "Career Champions"}
                    </Badge>
                    {lastResult.course && (
                      <p className="text-sm text-muted-foreground">{lastResult.course}</p>
                    )}
                    {lastResult.alreadyCheckedIn && (
                      <p className="text-xs text-amber-500 font-medium">⚠ Already checked in</p>
                    )}
                  </>
                )}
                {!lastResult.success && (
                  <p className="text-sm text-destructive">Not found in registrations</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
