import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, CheckCircle, ListTodo, Plus, Trash2,
  DollarSign, LogOut, Search, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import PaymentConfirmation from "@/components/admin/PaymentConfirmation";
import GalleryManager from "@/components/admin/GalleryManager";
import FeedbackDashboard from "@/components/admin/FeedbackDashboard";
import VolunteerAdmin from "@/components/admin/VolunteerAdmin";
import CheckInDashboard from "@/components/admin/CheckInDashboard";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  fellowship_track: "career" | "enterprise";
  current_status: "employed" | "unemployed" | "corp_member" | "student";
  selected_course: string | null;
  payment_confirmed: boolean;
  whatsapp_group_assigned: string | null;
  created_at: string;
};

type AdminTask = {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
};

type DoorOpenerSubmission = {
  id: string;
  full_name: string;
  email: string;
  partnership_tier: string;
  payment_confirmed: boolean;
  payment_confirmed_at: string | null;
  created_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [doorOpeners, setDoorOpeners] = useState<DoorOpenerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", assigned_to: "", due_date: "" });
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "tasks" | "whatsapp" | "door-openers" | "analytics" | "payments" | "gallery" | "feedback" | "volunteers" | "check-ins">("overview");
  const [regSearch, setRegSearch] = useState("");
  const [regTrackFilter, setRegTrackFilter] = useState<"all" | "career" | "enterprise">("all");
  const [regStatusFilter, setRegStatusFilter] = useState<string>("all");

  // Auth guard with admin role check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setAuthLoading(false);
        navigate("/admin/login");
        return;
      }
      // Check admin role
      const res = await supabase.functions.invoke("check-admin", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.data?.isAdmin) {
        await supabase.auth.signOut();
        setUser(null);
        setAuthLoading(false);
        navigate("/admin/login");
        toast.error("Access denied. Admin privileges required.");
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setUser(null);
        setAuthLoading(false);
        navigate("/admin/login");
        return;
      }
      const res = await supabase.functions.invoke("check-admin", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.data?.isAdmin) {
        await supabase.auth.signOut();
        setUser(null);
        setAuthLoading(false);
        navigate("/admin/login");
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [regRes, taskRes, doRes] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("admin_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("door_opener_submissions").select("*").order("created_at", { ascending: false }),
    ]);
    if (regRes.data) setRegistrations(regRes.data as Registration[]);
    if (taskRes.data) setTasks(taskRes.data as AdminTask[]);
    if (doRes.data) setDoorOpeners(doRes.data as DoorOpenerSubmission[]);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch = regSearch === "" ||
      r.full_name.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(regSearch.toLowerCase()) ||
      (r.selected_course || "").toLowerCase().includes(regSearch.toLowerCase());
    const matchesTrack = regTrackFilter === "all" || r.fellowship_track === regTrackFilter;
    const matchesStatus = regStatusFilter === "all" || r.current_status === regStatusFilter;
    return matchesSearch && matchesTrack && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    career: registrations.filter((r) => r.fellowship_track === "career").length,
    enterprise: registrations.filter((r) => r.fellowship_track === "enterprise").length,
    confirmedPayments: doorOpeners.filter((d) => d.payment_confirmed).length,
    totalDoorOpeners: doorOpeners.length,
  };

  const addTask = async () => {
    if (!newTask.title) return;
    const { error } = await supabase.from("admin_tasks").insert({
      title: newTask.title,
      assigned_to: newTask.assigned_to || null,
      due_date: newTask.due_date || null,
    });
    if (error) toast.error("Failed to add task");
    else {
      toast.success("Task added");
      setNewTask({ title: "", assigned_to: "", due_date: "" });
      fetchData();
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    await supabase.from("admin_tasks").update({ status }).eq("id", id);
    fetchData();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("admin_tasks").delete().eq("id", id);
    fetchData();
  };

  const createWhatsAppGroups = async () => {
    const tracks: Array<{ track: "career" | "enterprise"; name: string }> = [
      { track: "career", name: "NextGen 2026 — Career Track" },
      { track: "enterprise", name: "NextGen 2026 — Business Track" },
    ];
    for (const t of tracks) {
      const members = registrations.filter((r) => r.fellowship_track === t.track);
      await supabase.from("whatsapp_groups").upsert(
        { fellowship_track: t.track, group_name: t.name, member_count: members.length },
        { onConflict: "fellowship_track" }
      );
    }
    toast.success("WhatsApp groups created/updated!");
  };

  const tabClass = (tab: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking access...</div>;
  if (!user) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-4xl font-display font-bold">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {(["overview", "analytics", "payments", "registrations", "check-ins", "door-openers", "gallery", "tasks", "whatsapp", "feedback", "volunteers"] as const).map((tab) => (
              <button key={tab} className={tabClass(tab)} onClick={() => setActiveTab(tab)}>
                {tab === "door-openers" ? "Door Openers" : tab === "check-ins" ? "Check-ins" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: "Total Registrations", value: stats.total, color: "text-primary" },
                { icon: TrendingUp, label: "Career Champions", value: stats.career, color: "text-primary" },
                { icon: CheckCircle, label: "Business Champions", value: stats.enterprise, color: "text-primary" },
                { icon: DollarSign, label: "Confirmed Payments", value: stats.confirmedPayments, color: "text-primary" },
              ].map((s) => (
                <Card key={s.label} className="glass border-border">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                    <div className="text-2xl sm:text-3xl font-display font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <AnalyticsDashboard registrations={registrations} doorOpeners={doorOpeners} />
          )}

          {/* Registrations with search & filter */}
          {activeTab === "registrations" && (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-lg">All Registrations ({filteredRegistrations.length})</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search name, email, or course..."
                      value={regSearch}
                      onChange={(e) => setRegSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={regTrackFilter} onValueChange={(v) => setRegTrackFilter(v as any)}>
                    <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Track" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tracks</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="enterprise">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={regStatusFilter} onValueChange={setRegStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="corp_member">Corp Member</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <th className="text-left py-3 px-2 hidden md:table-cell">Status</th>
                        <th className="text-left py-3 px-2 hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((r) => (
                        <tr key={r.id} className="border-b border-border/50">
                          <td className="py-3 px-2 font-medium">{r.full_name}</td>
                          <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{r.email}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                              {r.fellowship_track === "enterprise" ? "Business" : "Career"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 hidden md:table-cell text-xs text-muted-foreground">{r.selected_course || "—"}</td>
                          <td className="py-3 px-2 hidden md:table-cell">
                            <Badge variant="secondary" className="text-xs">{r.current_status}</Badge>
                          </td>
                          <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground text-xs">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {filteredRegistrations.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No registrations found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Door Openers */}
          {activeTab === "door-openers" && (
            <Card className="glass border-border">
              <CardHeader><CardTitle className="text-lg">Door Opener Submissions ({doorOpeners.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2">Name</th>
                        <th className="text-left py-3 px-2 hidden sm:table-cell">Email</th>
                        <th className="text-left py-3 px-2">Tier</th>
                        <th className="text-left py-3 px-2">Payment</th>
                        <th className="text-left py-3 px-2 hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doorOpeners.map((d) => (
                        <tr key={d.id} className="border-b border-border/50">
                          <td className="py-3 px-2 font-medium">{d.full_name}</td>
                          <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{d.email}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="text-xs capitalize">{d.partnership_tier}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={d.payment_confirmed ? "default" : "secondary"} className="text-xs">
                              {d.payment_confirmed ? "✓ Confirmed" : "Pending"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground text-xs">
                            {new Date(d.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {doorOpeners.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No submissions yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <Card className="glass border-border">
                <CardHeader><CardTitle className="text-lg">Add Task</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                    <Input placeholder="Assign to" value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} className="sm:max-w-[200px]" />
                    <Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} className="sm:max-w-[180px]" />
                    <Button onClick={addTask} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-3">
                {tasks.map((t) => (
                  <Card key={t.id} className="glass border-border">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{t.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {t.assigned_to && <span className="text-xs text-muted-foreground">→ {t.assigned_to}</span>}
                          {t.due_date && <span className="text-xs text-muted-foreground">Due: {t.due_date}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={t.status} onValueChange={(v) => updateTaskStatus(t.id, v)}>
                          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTask(t.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks yet</p>}
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <PaymentConfirmation
              registrations={registrations}
              doorOpeners={doorOpeners}
              onRefresh={fetchData}
            />
          )}

          {/* Gallery */}
          {activeTab === "gallery" && <GalleryManager />}

          {/* WhatsApp */}
          {activeTab === "whatsapp" && (
            <Card className="glass border-border">
              <CardHeader><CardTitle className="text-lg">WhatsApp Group Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Auto-create WhatsApp groups by fellowship track.</p>
                <Button onClick={createWhatsAppGroups} className="bg-primary text-primary-foreground">Create / Update WhatsApp Groups</Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-secondary/50 border-border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Career Champions Group</h3>
                      <p className="text-2xl font-display font-bold text-primary mt-1">{stats.career} members</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50 border-border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Business Champions Group</h3>
                      <p className="text-2xl font-display font-bold text-primary mt-1">{stats.enterprise} members</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          {activeTab === "feedback" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    const session = await supabase.auth.getSession();
                    const token = session.data.session?.access_token;
                    const res = await supabase.functions.invoke("send-feedback-request", {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.error) {
                      toast.error("Failed to send feedback requests");
                    } else {
                      toast.success(`Feedback requests sent to ${res.data?.participants_notified || 0} participants`);
                    }
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" /> Send Feedback Requests
                </Button>
              </div>
              <FeedbackDashboard />
            </div>
          )}

          {/* Volunteers */}
          {activeTab === "volunteers" && <VolunteerAdmin />}

          {/* Check-ins */}
          {activeTab === "check-ins" && <CheckInDashboard totalRegistrations={stats.total} />}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
