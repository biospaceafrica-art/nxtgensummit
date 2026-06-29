import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, LogOut, Search, RefreshCw, Save, AlertCircle } from "lucide-react";
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
const NOTES_MAX = 1000;
const ROW_HEIGHT = 196; // estimated row height for virtualization
const LIST_HEIGHT = 720; // visible scroll area height (px)

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

  const updateStatus = async (a: Applicant, status: Status) => {
    if (status === a.status) return;
    const prevStatus = a.status;
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
      toast.error(`Notes exceed the ${NOTES_MAX}-character limit and cannot be saved.`);
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
    // Always exports the FULL filtered set, independent of any view paging
    // or virtualized scroll position. The CSV is the source of truth for
    // the reviewer's current filter selection.
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

  // ===== Virtualization =====
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  });

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
          <div className="flex items-end text-xs text-muted-foreground">
            Showing <span className="px-1 font-semibold text-foreground">{filtered.length}</span> /
            <span className="pl-1">{applicants.length} applicants</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No applicants match the current filters.
            </div>
          ) : (
            <div
              ref={parentRef}
              data-testid="virtual-scroll"
              className="overflow-auto"
              style={{ height: LIST_HEIGHT }}
            >
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: "relative",
                  width: "100%",
                }}
              >
                {virtualizer.getVirtualItems().map((vi) => {
                  const a = filtered[vi.index];
                  const draft = notesDraft[a.id];
                  const currentNotes = draft ?? a.notes ?? "";
                  const dirty = draft !== undefined && draft !== (a.notes ?? "");
                  const tooLong = currentNotes.length > NOTES_MAX;
                  return (
                    <div
                      key={a.id}
                      data-index={vi.index}
                      ref={virtualizer.measureElement}
                      data-testid={`applicant-row-${a.id}`}
                      className="absolute left-0 right-0 border-b px-4 py-3 grid gap-3 md:grid-cols-[1.2fr_1.4fr_1fr_2fr_0.6fr]"
                      style={{ transform: `translateY(${vi.start}px)` }}
                    >
                      <div>
                        <div className="font-medium">{a.full_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>{a.email}</div>
                        {a.phone && <div>{a.phone}</div>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={statusVariant(a.status)} className="w-fit">
                          {a.status}
                        </Badge>
                        <Select
                          value={a.status}
                          onValueChange={(v) => void updateStatus(a, v as Status)}
                        >
                          <SelectTrigger
                            className="w-[140px]"
                            data-testid={`status-select-${a.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="min-w-[240px]">
                        <Textarea
                          value={currentNotes}
                          onChange={(e) =>
                            setNotesDraft((prev) => ({ ...prev, [a.id]: e.target.value }))
                          }
                          rows={2}
                          placeholder="Reviewer notes…"
                          data-testid={`notes-input-${a.id}`}
                          aria-invalid={tooLong}
                          aria-describedby={`notes-help-${a.id}`}
                          className={tooLong ? "border-destructive focus-visible:ring-destructive" : undefined}
                        />
                        <div
                          id={`notes-help-${a.id}`}
                          className="flex items-center justify-between mt-1 gap-2"
                        >
                          {tooLong ? (
                            <span
                              className="text-[11px] text-destructive flex items-center gap-1"
                              data-testid={`notes-error-${a.id}`}
                              role="alert"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Notes exceed the {NOTES_MAX}-character limit
                              ({currentNotes.length}/{NOTES_MAX}).
                            </span>
                          ) : (
                            <span
                              className="text-[11px] text-muted-foreground"
                              data-testid={`notes-counter-${a.id}`}
                            >
                              {currentNotes.length}/{NOTES_MAX}
                            </span>
                          )}
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
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.reviewed_at
                          ? new Date(a.reviewed_at).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectionDashboard;
