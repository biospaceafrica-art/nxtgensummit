import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, CheckCircle, ListTodo, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  fellowship_track: "career" | "enterprise";
  current_status: "employed" | "unemployed" | "corp_member" | "student";
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

const Admin = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", assigned_to: "", due_date: "" });
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "tasks" | "whatsapp">("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [regRes, taskRes] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("admin_tasks").select("*").order("created_at", { ascending: false }),
    ]);
    if (regRes.data) setRegistrations(regRes.data as Registration[]);
    if (taskRes.data) setTasks(taskRes.data as AdminTask[]);
    setLoading(false);
  };

  const stats = {
    total: registrations.length,
    career: registrations.filter((r) => r.fellowship_track === "career").length,
    enterprise: registrations.filter((r) => r.fellowship_track === "enterprise").length,
    students: registrations.filter((r) => r.current_status === "student").length,
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
      { track: "enterprise", name: "NextGen 2026 — Enterprise Track" },
    ];
    for (const t of tracks) {
      const members = registrations.filter((r) => r.fellowship_track === t.track);
      await supabase.from("whatsapp_groups").upsert(
        { fellowship_track: t.track, group_name: t.name, member_count: members.length },
        { onConflict: "fellowship_track" }
      );
    }
    toast.success("WhatsApp groups created/updated by fellowship track!");
  };

  const tabClass = (tab: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-6">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(["overview", "registrations", "tasks", "whatsapp"] as const).map((tab) => (
              <button key={tab} className={tabClass(tab)} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: "Total Registrations", value: stats.total, color: "text-primary" },
                { icon: TrendingUp, label: "Career Track", value: stats.career, color: "text-green-400" },
                { icon: CheckCircle, label: "Enterprise Track", value: stats.enterprise, color: "text-blue-400" },
                { icon: ListTodo, label: "Students", value: stats.students, color: "text-yellow-400" },
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

          {/* Registrations */}
          {activeTab === "registrations" && (
            <Card className="glass border-border">
              <CardHeader><CardTitle className="text-lg">All Registrations ({registrations.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2">Name</th>
                        <th className="text-left py-3 px-2 hidden sm:table-cell">Email</th>
                        <th className="text-left py-3 px-2">Track</th>
                        <th className="text-left py-3 px-2 hidden md:table-cell">Status</th>
                        <th className="text-left py-3 px-2 hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r) => (
                        <tr key={r.id} className="border-b border-border/50">
                          <td className="py-3 px-2 font-medium">{r.full_name}</td>
                          <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{r.email}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="border-primary/40 text-primary text-xs">{r.fellowship_track}</Badge>
                          </td>
                          <td className="py-3 px-2 hidden md:table-cell">
                            <Badge variant="secondary" className="text-xs">{r.current_status}</Badge>
                          </td>
                          <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground text-xs">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {registrations.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No registrations yet</td></tr>
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

          {/* WhatsApp Groups */}
          {activeTab === "whatsapp" && (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-lg">WhatsApp Group Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Auto-create WhatsApp groups by fellowship track. Groups are updated with current member counts.
                </p>
                <Button onClick={createWhatsAppGroups} className="bg-primary text-primary-foreground">
                  Create / Update WhatsApp Groups
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-secondary/50 border-border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Career Track Group</h3>
                      <p className="text-2xl font-display font-bold text-primary mt-1">{stats.career} members</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50 border-border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Enterprise Track Group</h3>
                      <p className="text-2xl font-display font-bold text-primary mt-1">{stats.enterprise} members</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
