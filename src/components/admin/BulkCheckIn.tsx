import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, UserCheck, Loader2 } from "lucide-react";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  fellowship_track: "career" | "enterprise";
  selected_course: string | null;
};

const BulkCheckIn = ({ onComplete }: { onComplete?: () => void }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [regRes, ciRes] = await Promise.all([
        supabase.from("registrations").select("id, full_name, email, fellowship_track, selected_course"),
        supabase.from("check_ins").select("registration_id"),
      ]);
      if (regRes.data) setRegistrations(regRes.data as Registration[]);
      if (ciRes.data) setCheckedInIds(new Set(ciRes.data.map((c: any) => c.registration_id)));
      setLoading(false);
    };
    load();
  }, []);

  const unchecked = registrations.filter((r) => !checkedInIds.has(r.id));

  const filtered = unchecked.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  const handleBulkCheckIn = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    const rows = Array.from(selected).map((registration_id) => ({
      registration_id,
      method: "bulk_admin",
    }));
    const { error } = await supabase.from("check_ins").insert(rows);
    if (error) {
      toast.error("Bulk check-in failed: " + error.message);
    } else {
      toast.success(`${selected.size} attendees checked in successfully!`);
      setCheckedInIds((prev) => {
        const next = new Set(prev);
        selected.forEach((id) => next.add(id));
        return next;
      });
      setSelected(new Set());
      onComplete?.();
    }
    setSubmitting(false);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading registrations...</p>;

  return (
    <Card className="glass border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg">
            Bulk Check-in ({unchecked.length} remaining)
          </CardTitle>
          <Button
            onClick={handleBulkCheckIn}
            disabled={selected.size === 0 || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
            Check in {selected.size} selected
          </Button>
        </div>
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
                <th className="py-3 px-2 w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2 hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-2">Track</th>
                <th className="text-left py-3 px-2 hidden md:table-cell">Course</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-border/50 cursor-pointer transition-colors ${selected.has(r.id) ? "bg-primary/5" : "hover:bg-muted/30"}`}
                  onClick={() => toggleOne(r.id)}
                >
                  <td className="py-3 px-2">
                    <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} />
                  </td>
                  <td className="py-3 px-2 font-medium">{r.full_name}</td>
                  <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                      {r.fellowship_track === "enterprise" ? "Business" : "Career"}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell text-xs text-muted-foreground">
                    {r.selected_course || "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    {unchecked.length === 0 ? "All attendees are checked in! 🎉" : "No matching attendees"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkCheckIn;
