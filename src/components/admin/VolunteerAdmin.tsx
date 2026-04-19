import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Search, Check, X, Clock, Download } from "lucide-react";

type VolunteerApp = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string;
  experience: string | null;
  why_volunteer: string | null;
  status: string;
  created_at: string;
};

const positionLabels: Record<string, string> = {
  mass_choir: "Mass Choir",
  ushering: "Ushering",
  transportation: "Transportation & Logistics",
  social_media: "Social Media",
};

const VolunteerAdmin = () => {
  const [volunteers, setVolunteers] = useState<VolunteerApp[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulkUpdate = async (status: "approved" | "rejected") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const targets = volunteers.filter((v) => ids.includes(v.id));
    const { error } = await supabase
      .from("volunteer_applications")
      .update({ status })
      .in("id", ids);
    if (error) {
      toast.error("Bulk update failed");
      return;
    }
    setVolunteers((prev) => prev.map((v) => (ids.includes(v.id) ? { ...v, status } : v)));
    setSelected(new Set());
    toast.success(`${ids.length} application(s) ${status}`);
    targets.forEach((v) => {
      supabase.functions.invoke("notify-volunteer-status", {
        body: {
          full_name: v.full_name,
          email: v.email,
          position: positionLabels[v.position] || v.position,
          status,
        },
      });
    });
  };

  const load = () => {
    supabase
      .from("volunteer_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setVolunteers(data as VolunteerApp[]);
      });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    const volunteer = volunteers.find((v) => v.id === id);
    const { error } = await supabase
      .from("volunteer_applications")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));

    if (volunteer && (status === "approved" || status === "rejected")) {
      supabase.functions.invoke("notify-volunteer-status", {
        body: {
          full_name: volunteer.full_name,
          email: volunteer.email,
          position: positionLabels[volunteer.position] || volunteer.position,
          status,
        },
      }).then(({ error: fnErr }) => {
        if (fnErr) toast.warning(`Status updated, but email notification failed`);
        else toast.success(`Application ${status} & email sent`);
      });
    } else {
      toast.success(`Application ${status}`);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Position", "Status", "Experience", "Motivation", "Applied"];
    const rows = filtered.map((v) => [
      v.full_name,
      v.email,
      v.phone || "",
      positionLabels[v.position] || v.position,
      v.status || "pending",
      (v.experience || "").replace(/"/g, '""'),
      (v.why_volunteer || "").replace(/"/g, '""'),
      new Date(v.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `volunteers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} applications`);
  };

  const filtered = volunteers.filter((v) => {
    const s = search.toLowerCase();
    const matchesSearch = !s ||
      v.full_name.toLowerCase().includes(s) ||
      v.email.toLowerCase().includes(s);
    const matchesPosition = positionFilter === "all" || v.position === positionFilter;
    const matchesStatus = statusFilter === "all" || (v.status || "pending") === statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const counts = {
    total: volunteers.length,
    pending: volunteers.filter((v) => (v.status || "pending") === "pending").length,
    approved: volunteers.filter((v) => v.status === "approved").length,
    rejected: volunteers.filter((v) => v.status === "rejected").length,
  };

  const statusBadge = (status: string) => {
    const s = status || "pending";
    if (s === "approved") return <Badge className="bg-primary/20 text-primary border-primary/40 text-xs">Approved</Badge>;
    if (s === "rejected") return <Badge variant="outline" className="text-xs border-destructive/40 text-destructive">Rejected</Badge>;
    return <Badge variant="secondary" className="text-xs">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-display font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">Total Volunteers</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <div className="text-2xl font-display font-bold">{counts.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Check className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-display font-bold">{counts.approved}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <X className="w-6 h-6 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-display font-bold">{counts.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">Volunteer Applications ({filtered.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Position" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {Object.entries(positionLabels).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-3 mt-3 p-3 rounded-md bg-secondary/40 border border-border">
              <span className="text-sm font-medium">{selected.size} selected</span>
              <Button size="sm" variant="outline" onClick={() => bulkUpdate("approved")} className="border-primary/40 text-primary hover:bg-primary/10 gap-1">
                <Check className="w-3 h-3" /> Approve all
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkUpdate("rejected")} className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1">
                <X className="w-3 h-3" /> Reject all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-3 px-2 w-8">
                    <Checkbox
                      checked={filtered.length > 0 && filtered.every((v) => selected.has(v.id))}
                      onCheckedChange={(c) => {
                        if (c) setSelected(new Set(filtered.map((v) => v.id)));
                        else setSelected(new Set());
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2 hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-2">Position</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <React.Fragment key={v.id}>
                    <tr
                      className="border-b border-border/50 cursor-pointer hover:bg-secondary/30"
                      onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                    >
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.has(v.id)} onCheckedChange={() => toggleOne(v.id)} />
                      </td>
                      <td className="py-3 px-2 font-medium">{v.full_name}</td>
                      <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{v.email}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-xs">{positionLabels[v.position] || v.position}</Badge>
                      </td>
                      <td className="py-3 px-2">{statusBadge(v.status)}</td>
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 border-primary/40 text-primary hover:bg-primary/10"
                            onClick={() => updateStatus(v.id, "approved")}
                            disabled={v.status === "approved"}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                            onClick={() => updateStatus(v.id, "rejected")}
                            disabled={v.status === "rejected"}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expanded === v.id && (
                      <tr className="bg-secondary/20 border-b border-border/50">
                        <td colSpan={6} className="py-4 px-4">
                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            <div><span className="text-muted-foreground">Phone:</span> {v.phone || "—"}</div>
                            <div><span className="text-muted-foreground">Applied:</span> {new Date(v.created_at).toLocaleString()}</div>
                            <div className="sm:col-span-2"><span className="text-muted-foreground">Experience:</span> {v.experience || "—"}</div>
                            <div className="sm:col-span-2"><span className="text-muted-foreground">Motivation:</span> {v.why_volunteer || "—"}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No volunteer applications found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerAdmin;
