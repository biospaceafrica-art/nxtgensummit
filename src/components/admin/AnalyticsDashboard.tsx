import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, TrendingUp, BarChart3, PieChart, DollarSign, Calendar,
  ArrowUpRight, ArrowDownRight, Briefcase, GraduationCap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";

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

const COLORS = ["hsl(32, 85%, 52%)", "hsl(43, 90%, 55%)", "hsl(150, 60%, 45%)", "hsl(220, 70%, 55%)", "hsl(280, 60%, 55%)"];

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
    return { date: d.toLocaleDateString("en", { day: "numeric", month: "short" }), count };
  });

  const thisWeekCount = dailyRegs.slice(7).reduce((s, d) => s + d.count, 0);
  const lastWeekCount = dailyRegs.slice(0, 7).reduce((s, d) => s + d.count, 0);
  const growthPct = lastWeekCount > 0 ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) : thisWeekCount > 0 ? 100 : 0;

  const today = new Date().toISOString().split("T")[0];
  const todayRegs = registrations.filter((r) => r.created_at.startsWith(today));
  const conversionRate = stats.totalDoorOpeners > 0 ? Math.round((stats.confirmedPayments / stats.totalDoorOpeners) * 100) : 0;

  // Track distribution pie
  const trackData = [
    { name: "Business Track", value: stats.enterprise },
    { name: "Career Track", value: stats.career },
  ];

  // Status distribution pie
  const statusData = [
    { name: "Employed", value: stats.employed },
    { name: "Unemployed", value: stats.unemployed },
    { name: "Corp Members", value: stats.corpMembers },
    { name: "Students", value: stats.students },
  ].filter((s) => s.value > 0);

  // Door opener tier breakdown
  const tierBreakdown = doorOpeners.reduce<Record<string, { total: number; confirmed: number }>>((acc, d) => {
    const tier = d.partnership_tier;
    if (!acc[tier]) acc[tier] = { total: 0, confirmed: 0 };
    acc[tier].total++;
    if (d.payment_confirmed) acc[tier].confirmed++;
    return acc;
  }, {});

  const tierChartData = Object.entries(tierBreakdown).map(([tier, data]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    total: data.total,
    confirmed: data.confirmed,
  }));

  // Financial overview (estimated based on tiers)
  const tierEstimates: Record<string, number> = { seedling: 100000, gardener: 1000000, harvesting: 10000000 };
  const totalEstimatedDonations = Object.entries(tierBreakdown).reduce((sum, [tier, data]) => {
    return sum + data.confirmed * (tierEstimates[tier] || 0);
  }, 0);
  const budgetTarget = 50000000; // ₦50M target
  const budgetProgress = Math.min((totalEstimatedDonations / budgetTarget) * 100, 100);

  // Course distribution
  const courseDistribution = registrations.reduce<Record<string, number>>((acc, r) => {
    const course = r.selected_course || "Unspecified";
    acc[course] = (acc[course] || 0) + 1;
    return acc;
  }, {});

  const recentRegs = registrations.slice(0, 5);

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
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl sm:text-3xl font-display font-bold">{todayRegs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Today's Registrations</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 sm:p-5">
            <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-2xl sm:text-3xl font-display font-bold">{stats.confirmedPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed Payments ({conversionRate}%)</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 sm:p-5">
            <TrendingUp className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl sm:text-3xl font-display font-bold">₦{(totalEstimatedDonations / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground mt-1">Est. Donations</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend Area Chart */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Registration Trend (14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyRegs}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(32, 85%, 52%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(32, 85%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="hsl(32, 85%, 52%)" fill="url(#colorReg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Track & Status Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> Track Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie data={trackData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {trackData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: 8 }} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg">Attendee Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: 8 }} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview / Budget Progress */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Projected Budget (₦50M Target)</span>
            <span className="font-bold text-primary">₦{(totalEstimatedDonations / 1000000).toFixed(1)}M / ₦50M</span>
          </div>
          <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-[hsl(43,90%,55%)] rounded-full transition-all" style={{ width: `${budgetProgress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground text-center">{budgetProgress.toFixed(1)}% of target reached</p>
        </CardContent>
      </Card>

      {/* Sponsor Tiers Bar Chart */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg">Sponsor Contributions by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          {tierChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tierChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(0, 0%, 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" fill="hsl(32, 85%, 52%)" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="confirmed" fill="hsl(150, 60%, 45%)" name="Confirmed" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No submissions yet</p>
          )}
        </CardContent>
      </Card>

      {/* Course Distribution & Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader><CardTitle className="text-lg">Course Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {Object.entries(courseDistribution).sort(([, a], [, b]) => b - a).map(([course, count]) => (
              <div key={course} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-full max-w-[120px] h-2 bg-secondary rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm truncate">{course}</span>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{count}</Badge>
              </div>
            ))}
            {Object.keys(courseDistribution).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No course data yet</p>}
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader><CardTitle className="text-lg">Recent Registrations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRegs.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary text-xs ml-2">
                    {r.fellowship_track === "enterprise" ? "Business" : "Career"}
                  </Badge>
                </div>
              ))}
              {recentRegs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No registrations yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
