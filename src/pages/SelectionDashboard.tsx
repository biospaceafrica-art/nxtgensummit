import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Download, LogOut, Search, RefreshCw, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Status = "pending" | "shortlisted" | "accepted" | "rejected" | "waitlist";
type ReviewFilter = "all" | "reviewed" | "unreviewed";

type Applicant = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: Status;
  notes: string | null;
  source: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

const STATUSES: Status[] = ["pending", "shortlisted", "accepted", "rejected", "waitlist"];
const PAGE_SIZE = 25;
const NOTES_MAX = 1000;

const statusVariant = (s: Status) =>
  s === "accepted" ? "default"
    : s === "rejected" ? "destructive"
    : s === "shortlisted" ? "secondary"
    : "outline";

const isRlsError = (msg: string) =>
  /permission|rls|policy|not authorized|only change status/i.test(msg);

const SelectionDashboard = () => {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [page, setPage] = useState(0);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const guard = async (session: { user: { id: string } } | null) => {
      if (!session?.user) {
        navigate("/login?redirect=/selection");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const allowed = (roles ?? []).some(
        (r) => r.role === "admin" || r.role === "selection_team",
      );
      if (!allowed) {
        toast.error("You don't have access to the selection dashboard.");
        navigate("/");
        return;
      }
      setUserId(session.user.id);
      setAuthReady(true);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => { void guard(session); },
    );
    supabase.auth.getSession().then(({ data: { session } }) => void guard(session));
    return () => subscription.unsubscribe();
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scholarship_applicants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(`Failed to load applicants: ${error.message}`);
    } else {
      setApplicants((data ?? []) as Applicant[]);
    }
    setLoading(false);
  };

  useEffect(() => { if (authReady) void load(); }, [authReady]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applicants.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (reviewFilter === "reviewed" && !a.reviewed_at) return false;
      if (reviewFilter === "unreviewed" && a.reviewed_at) return false;
      if (!q) return true;
      return (
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [applicants, search, statusFilter, reviewFilter]);

  // Reset pagination when filters change
  useEffect(() => { setPage(0); }, [search, statusFilter, reviewFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage],
  );

  const updateStatus = async (a: Applicant, status: Status) => {
    if (status === a.status) return;
    const prevStatus = a.status;
    // Optimistic
    setApplicants((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status } : x)),
    );
    const { error } = await supabase
      .from("scholarship_applicants")
      .update({
        status,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", a.id);
    if (error) {
      setApplicants((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, status: prevStatus } : x)),
      );
      toast.error(
        isRlsError(error.message)
          ? "Update rejected: you don't have permission to change this field."
          : `Update failed: ${error.message}`,
      );
      return;
    }
    setApplicants((prev) =>
      prev.map((x) =>
        x.id === a.id
          ? { ...x, status, reviewed_by: userId, reviewed_at: new Date().toISOString() }
          : x,
      ),
    );
    toast.success(`${a.full_name} marked as ${status}`);
  };

  const saveNotes = async (a: Applicant) => {
    const draft = notesDraft[a.id] ?? "";
    if (draft.length > NOTES_MAX) {
      toast.error(`Notes are too long (${draft.length}/${NOTES_MAX}).`);
      return;
    }
    setSavingId(a.id);
    const { error } = await supabase
      .from("scholarship_applicants")
      .update({
        notes: draft,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", a.id);
    setSavingId(null);
    if (error) {
      toast.error(
        isRlsError(error.message)
          ? "Notes update rejected by access policy."
          : `Could not save notes: ${error.message}`,
      );
      return;
    }
    setApplicants((prev) =>
      prev.map((x) =>
        x.id === a.id
          ? { ...x, notes: draft, reviewed_by: userId, reviewed_at: new Date().toISOString() }
          : x,
      ),
    );
    setNotesDraft((prev) => {
      const next = { ...prev };
      delete next[a.id];
      return next;
    });
    toast.success("Notes saved");
  };

  const exportCsv = () => {
    const headers = [
      "full_name", "email", "phone", "status",
      "notes", "source", "reviewed_at", "created_at",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...filtered.map((a) =>
        headers.map((h) => escape((a as unknown as Record<string, unknown>)[h])).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scholarship-applicants-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} row${filtered.length === 1 ? "" : "s"}`);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: applicants.length, reviewed: 0, unreviewed: 0 };
    STATUSES.forEach((s) => (c[s] = 0));
    applicants.forEach((a) => {
      c[a.status] = (c[a.status] ?? 0) + 1;
      if (a.reviewed_at) c.reviewed++; else c.unreviewed++;
    });
    return c;
  }, [applicants]);

  if (!authReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10" data-testid="selection-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Scholarship Selection</h1>
          <p className="text-muted-foreground text-sm">
            Review applicants and update their status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button
            variant="outline" size="sm" onClick={exportCsv}
            data-testid="export-csv" disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4" /> Export CSV ({filtered.length})
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total", value: counts.total },
          { label: "Unreviewed", value: counts.unreviewed },
          ...STATUSES.map((s) => ({ label: s, value: counts[s] ?? 0 })),
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-bold">{c.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6 grid gap-3 md:grid-cols-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-3 text-muted-foreground" />
              <Input
                id="search" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email or phone" className="pl-8"
                data-testid="search-input"
              />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger data-testid="status-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Review state</Label>
            <Select
              value={reviewFilter}
              onValueChange={(v) => setReviewFilter(v as ReviewFilter)}
            >
              <SelectTrigger data-testid="review-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="unreviewed">Unreviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Reviewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((a) => {
                  const draft = notesDraft[a.id];
                  const currentNotes = draft ?? a.notes ?? "";
                  const dirty = draft !== undefined && draft !== (a.notes ?? "");
                  const tooLong = currentNotes.length > NOTES_MAX;
                  return (
                    <TableRow key={a.id} data-testid={`applicant-row-${a.id}`}>
                      <TableCell className="font-medium align-top">{a.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground align-top">
                        <div>{a.email}</div>
                        {a.phone && <div>{a.phone}</div>}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-2">
                          <Badge variant={statusVariant(a.status)} className="w-fit">{a.status}</Badge>
                          <Select
                            value={a.status}
                            onValueChange={(v) => void updateStatus(a, v as Status)}
                          >
                            <SelectTrigger className="w-[140px]" data-testid={`status-select-${a.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="align-top min-w-[240px]">
                        <Textarea
                          value={currentNotes}
                          onChange={(e) =>
                            setNotesDraft((prev) => ({ ...prev, [a.id]: e.target.value }))
                          }
                          rows={2}
                          placeholder="Reviewer notes…"
                          data-testid={`notes-input-${a.id}`}
                          aria-invalid={tooLong}
                          className={tooLong ? "border-destructive" : undefined}
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-[11px] ${
                              tooLong ? "text-destructive" : "text-muted-foreground"
                            }`}
                            data-testid={`notes-counter-${a.id}`}
                          >
                            {currentNotes.length}/{NOTES_MAX}
                          </span>
                          <Button
                            size="sm" variant="outline"
                            onClick={() => void saveNotes(a)}
                            disabled={!dirty || tooLong || savingId === a.id}
                            data-testid={`notes-save-${a.id}`}
                          >
                            <Save className="w-3 h-3" />
                            {savingId === a.id ? "Saving…" : "Save"}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground align-top">
                        {a.reviewed_at
                          ? new Date(a.reviewed_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No applicants match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div
          className="flex items-center justify-between mt-4 text-sm text-muted-foreground"
          data-testid="pagination-bar"
        >
          <div>
            Showing {safePage * PAGE_SIZE + 1}–
            {Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" data-testid="page-prev"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span data-testid="page-indicator">Page {safePage + 1} / {pageCount}</span>
            <Button
              variant="outline" size="sm" data-testid="page-next"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionDashboard;
