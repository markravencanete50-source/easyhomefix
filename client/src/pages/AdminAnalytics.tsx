import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Link } from "wouter";
import { AlertCircle, CheckCircle2, ClipboardList, Users, Wrench } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#3b82f6",
  under_review: "#f59e0b",
  assigned: "#8b5cf6",
  in_progress: "#14b8a6",
  completed: "#22c55e",
  closed: "#94a3b8",
};

const PRIORITY_COLORS: Record<string, string> = {
  emergency: "#ef4444",
  high: "#f97316",
  medium: "#14b8a6",
  low: "#94a3b8",
};

export default function AdminAnalytics() {
  const { data: stats, isLoading: statsLoading } = trpc.tickets.stats.useQuery();
  const { data: tickets, isLoading: ticketsLoading } = trpc.tickets.list.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.users.list.useQuery();

  const statusData = stats ? [
    { name: "Submitted", value: stats.submitted, color: STATUS_COLORS.submitted },
    { name: "Under Review", value: stats.under_review, color: STATUS_COLORS.under_review },
    { name: "Assigned", value: stats.assigned, color: STATUS_COLORS.assigned },
    { name: "In Progress", value: stats.in_progress, color: STATUS_COLORS.in_progress },
    { name: "Completed", value: stats.completed, color: STATUS_COLORS.completed },
    { name: "Closed", value: stats.closed, color: STATUS_COLORS.closed },
  ].filter(d => (d.value ?? 0) > 0) : [];

  const priorityData = tickets ? [
    { name: "Emergency", value: tickets.filter(t => t.priority === "emergency").length, color: PRIORITY_COLORS.emergency },
    { name: "High", value: tickets.filter(t => t.priority === "high").length, color: PRIORITY_COLORS.high },
    { name: "Medium", value: tickets.filter(t => t.priority === "medium").length, color: PRIORITY_COLORS.medium },
    { name: "Low", value: tickets.filter(t => t.priority === "low").length, color: PRIORITY_COLORS.low },
  ].filter(d => (d.value ?? 0) > 0) : [];

  const categoryData = tickets ? Object.entries(
    tickets.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })).sort((a, b) => b.value - a.value) : [];

  const userStats = {
    total: users?.length || 0,
    tenants: users?.filter(u => u.role === "tenant").length || 0,
    managers: users?.filter(u => u.role === "manager").length || 0,
    contractors: users?.filter(u => u.role === "contractor").length || 0,
  };

  const recentTickets = tickets?.slice(0, 8) || [];

  return (
    <div className="p-6 space-y-5 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics & Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System-wide maintenance performance metrics</p>
      </div>

      {/* KPI cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Tickets", value: stats?.total || 0, icon: <ClipboardList size={20} className="text-white" />, color: "bg-primary" },
            { title: "Open Issues", value: (stats?.submitted || 0) + (stats?.under_review || 0) + (stats?.assigned || 0) + (stats?.in_progress || 0), icon: <AlertCircle size={20} className="text-white" />, color: "bg-amber-500" },
            { title: "Completed", value: stats?.completed || 0, icon: <CheckCircle2 size={20} className="text-white" />, color: "bg-green-500" },
            { title: "Total Users", value: userStats.total, icon: <Users size={20} className="text-white" />, color: "bg-purple-500" },
          ].map(({ title, value, icon, color }) => (
            <Card key={title} className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status distribution */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-48 rounded-lg" />
            ) : statusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Tickets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <Skeleton className="h-48 rounded-lg" />
            ) : categoryData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority breakdown */}
      {priorityData.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {priorityData.map(p => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-muted-foreground">{p.name}: <strong className="text-foreground">{p.value}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User breakdown */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users size={16} />
            User Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <Skeleton className="h-16 rounded-lg" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Tenants", value: userStats.tenants, color: "text-blue-600 bg-blue-50" },
                { label: "Managers", value: userStats.managers, color: "text-purple-600 bg-purple-50" },
                { label: "Contractors", value: userStats.contractors, color: "text-amber-600 bg-amber-50" },
                { label: "Admins", value: users?.filter(u => u.role === "admin").length || 0, color: "text-red-600 bg-red-50" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl p-4 ${color.split(" ")[1]}`}>
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color.split(" ")[0]}`}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent tickets */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ticketsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">No tickets yet</div>
          ) : (
            <div className="divide-y divide-border">
              {recentTickets.map(ticket => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <div className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{ticket.ticketNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
