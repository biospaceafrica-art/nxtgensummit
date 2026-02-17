import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, TrendingUp, BarChart3, PieChart, DollarSign, Calendar,
  ArrowUpRight, ArrowDownRight, Briefcase, GraduationCap,
} from "lucide-react";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  fellowship_track: "career" | "enterprise";
  current_status: "employed" | "unemployed" | "corp_member" | "student";
  selected_course: string | null;
  payment_confirmed: boolean;
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

interface AnalyticsDashboardProps {
  registrations: Registration[];
  doorOpeners: DoorOpenerSubmission[];
}

const AnalyticsDashboard = ({ registrations, doorOpeners }: AnalyticsDashboardProps) => {
  const stats = {
    total: registrations.length,
    career: registrations.filter((r) => r.fellowship_track === "career").length,
    enterprise: registrations.filter((r) => r.fellowship_track === "enterprise").length,
    students: registrations.filter((r) => r.current_status === "student").length,
    employed: registrations.filter((r) => r.current_status === "employed").length,
    unemployed: registrations.filter((r) => r.current_status === "unemployed").length,
    corpMembers: registrations.filter((r) => r.current_status === "corp_member").length,
    confirmedPayments: doorOpeners.filter((d) => d.payment_confirmed).length,
    totalDoorOpeners: doorOpeners.length,
  };

  // Daily registrations (last 14 days)
  const dailyRegs = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split("T")[0];
    const count = registrations.filter((r) => r.created_at.startsWith(key)).length;
    return { date: d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }), shortDate: d.toLocaleDateString("en", { day: "numeric", month: "short" }), count };
  });

  // Weekly growth
  const thisWeekCount = dailyRegs.slice(7).reduce((s, d) => s + d.count, 0);
  const lastWeekCount = dailyRegs.slice(0, 7).reduce((s, d) => s + d.count, 0);
  const growthPct = lastWeekCount > 0 ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) : thisWeekCount > 0 ? 100 : 0;

  // Course distribution
  const courseDistribution = registrations.reduce<Record<string, number>>((acc, r) => {
    const course = r.selected_course || "Unspecified";
    acc[course] = (acc[course] || 0) + 1;
    return acc;
  }, {});

  // Door opener tier breakdown
  const tierBreakdown = doorOpeners.reduce<Record<string, { total: number; confirmed: number }>>((acc, d) => {
    const tier = d.partnership_tier;
    if (!acc[tier]) acc[tier] = { total: 0, confirmed: 0 };
    acc[tier].total++;
    if (d.payment_confirmed) acc[tier].confirmed++;
    return acc;
  }, {});

  // Recent registrations (last 5)
  const recentRegs = registrations.slice(0, 5);

  // Hourly distribution for today
  const today = new Date().toISOString().split("T")[0];
  const todayRegs = registrations.filter((r) => r.created_at.startsWith(today));

  const conversionRate = stats.totalDoorOpeners > 0
    ? Math.round((stats.confirmedPayments / stats.totalDoorOpeners) * 100)
    : 0;

  const tierAmounts: Record<string, string> = {
    seedling: "₦1,000,000",
    gardener: "₦5,000,000",
    harvest: "₦10,000,000",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
              <div className={`flex items-center gap-1 text-xs font-medium ${growthPct >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                {growthPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(growthPct)}%
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Registrations</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold">{todayRegs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Today's Registrations</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-muted-foreground">{conversionRate}% rate</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold">{stats.confirmedPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed Payments</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">{stats.totalDoorOpeners} total</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold">{stats.totalDoorOpeners - stats.confirmedPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending Payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend Chart */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Registration Trend (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 h-44">
            {dailyRegs.map((d) => {
              const max = Math.max(...dailyRegs.map((r) => r.count), 1);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                  <div
                    className="w-full bg-primary/80 rounded-t-md transition-all hover:bg-primary"
                    style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? "8px" : "2px" }}
                  />
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">{d.shortDate}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Track & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fellowship Track Split */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> Track Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 text-center p-4 rounded-xl bg-secondary/50">
                <Briefcase className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-display font-bold">{stats.enterprise}</div>
                <p className="text-xs text-muted-foreground">Business Champions</p>
                <p className="text-xs text-primary font-medium mt-1">
                  {stats.total ? Math.round((stats.enterprise / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="flex-1 text-center p-4 rounded-xl bg-secondary/50">
                <GraduationCap className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-display font-bold">{stats.career}</div>
                <p className="text-xs text-muted-foreground">Career Champions</p>
                <p className="text-xs text-primary font-medium mt-1">
                  {stats.total ? Math.round((stats.career / stats.total) * 100) : 0}%
                </p>
              </div>
            </div>
            {/* Visual bar */}
            <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${stats.total ? (stats.enterprise / stats.total) * 100 : 50}%` }}
              />
              <div
                className="h-full bg-primary/50 transition-all"
                style={{ width: `${stats.total ? (stats.career / stats.total) * 100 : 50}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Business</span>
              <span>Career</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg">Attendee Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Employed", count: stats.employed, color: "bg-emerald-500" },
              { label: "Unemployed", count: stats.unemployed, color: "bg-amber-500" },
              { label: "Corp Members", count: stats.corpMembers, color: "bg-blue-500" },
              { label: "Students", count: stats.students, color: "bg-purple-500" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{s.label}</span>
                  <span className="font-medium">{s.count} <span className="text-muted-foreground text-xs">({stats.total ? Math.round((s.count / stats.total) * 100) : 0}%)</span></span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all`}
                    style={{ width: `${stats.total ? (s.count / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Course Distribution & Payment Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg">Course Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {Object.entries(courseDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([course, count]) => (
                <div key={course} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-full max-w-[120px] h-2 bg-secondary rounded-full overflow-hidden shrink-0"
                    >
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm truncate">{course}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{count}</Badge>
                </div>
              ))}
            {Object.keys(courseDistribution).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No course data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Door Opener Payment Tiers */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Door Opener Tiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(tierBreakdown).length > 0 ? (
              Object.entries(tierBreakdown).map(([tier, data]) => (
                <div key={tier} className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-sm capitalize">{tier}</span>
                      <span className="text-xs text-muted-foreground ml-2">{tierAmounts[tier] || ""}</span>
                    </div>
                    <Badge variant={data.confirmed === data.total ? "default" : "secondary"} className="text-xs">
                      {data.confirmed}/{data.total} paid
                    </Badge>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${data.total ? (data.confirmed / data.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No submissions yet</p>
            )}
            <div className="p-3 rounded-xl border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Overall Conversion</p>
              <p className="text-xl font-display font-bold text-primary">{conversionRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRegs.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                    {r.fellowship_track === "enterprise" ? "Business" : "Career"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
            {recentRegs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No registrations yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
