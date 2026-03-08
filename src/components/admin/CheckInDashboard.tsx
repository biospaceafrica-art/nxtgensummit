import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserCheck, Users, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckInRow = {
  id: string;
  registration_id: string;
  checked_in_at: string;
  method: string;
  registration: {
    full_name: string;
    email: string;
    fellowship_track: "career" | "enterprise";
    selected_course: string | null;
  } | null;
};

interface Props {
  totalRegistrations: number;
}

const CheckInDashboard = ({ totalRegistrations }: Props) => {
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCheckIns = async () => {
    const { data } = await supabase
      .from("check_ins")
      .select("id, registration_id, checked_in_at, method, registrations(full_name, email, fellowship_track, selected_course)")
      .order("checked_in_at", { ascending: false });

    if (data) {
      setCheckIns(
        data.map((d: any) => ({
          ...d,
          registration: d.registrations,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCheckIns();

    // Real-time subscription
    const channel = supabase
      .channel("check-ins-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "check_ins" },
        () => fetchCheckIns()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = checkIns.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.registration?.full_name?.toLowerCase().includes(q) ||
      c.registration?.email?.toLowerCase().includes(q)
    );
  });

  const checkedInCount = checkIns.length;
  const percentage = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

  const lastCheckIn = checkIns.length > 0 ? new Date(checkIns[0].checked_in_at) : null;

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading check-ins...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <UserCheck className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-display font-bold">{checkedInCount}</div>
            <p className="text-xs text-muted-foreground">Checked In</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-display font-bold">{percentage}%</div>
            <p className="text-xs text-muted-foreground">of {totalRegistrations} registered</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-lg font-display font-bold">
              {lastCheckIn ? lastCheckIn.toLocaleTimeString() : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Last Check-in</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="glass border-border">
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Attendance Progress</span>
            <span className="font-semibold">{checkedInCount} / {totalRegistrations}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendee List */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg">Checked-in Attendees ({filtered.length})</CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2 hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-2">Track</th>
                  <th className="text-left py-3 px-2 hidden md:table-cell">Course</th>
                  <th className="text-left py-3 px-2">Method</th>
                  <th className="text-left py-3 px-2 hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3 px-2 font-medium">{c.registration?.full_name || "Unknown"}</td>
                    <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{c.registration?.email || "—"}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                        {c.registration?.fellowship_track === "enterprise" ? "Business" : "Career"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 hidden md:table-cell text-xs text-muted-foreground">
                      {c.registration?.selected_course || "—"}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="secondary" className="text-xs capitalize">{c.method.replace("_", " ")}</Badge>
                    </td>
                    <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground text-xs">
                      {new Date(c.checked_in_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No check-ins yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInDashboard;
