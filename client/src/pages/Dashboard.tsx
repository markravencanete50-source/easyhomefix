import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Hammer,
  Plus,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "wouter";
import type { UserRole } from "../../../shared/types";

function StatCard({ title, value, icon, color, subtitle }: {
  title: string; value: number | string; icon: React.ReactNode; color: string; subtitle?: string;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = (user?.role as UserRole) || "tenant";

  const { data: stats, isLoading: statsLoading } = trpc.tickets.stats.useQuery();
  const { data: tickets, isLoading: ticketsLoading } = trpc.tickets.list.useQuery();

  const recentTickets = tickets?.slice(0, 5) || [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {role === "tenant" && "Track your maintenance requests and stay updated."}
            {role === "manager" && "Manage your properties and maintenance tickets."}
            {role === "contractor" && "View your assigned jobs and update progress."}
            {role === "admin" && "Full system overview and management."}
          </p>
        </div>
        {role === "tenant" && (
          <Link href="/tickets/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus size={16} />
              New Request
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {role === "tenant" && (
            <>
              <StatCard title="My Tickets" value={tickets?.length || 0} icon={<ClipboardList size={20} className="text-white" />} color="bg-primary" />
              <StatCard title="In Progress" value={tickets?.filter(t => t.status === "in_progress").length || 0} icon={<Clock size={20} className="text-white" />} color="bg-amber-500" />
              <StatCard title="Completed" value={tickets?.filter(t => t.status === "completed").length || 0} icon={<CheckCircle2 size={20} className="text-white" />} color="bg-green-500" />
              <StatCard title="Pending Review" value={tickets?.filter(t => t.status === "submitted" || t.status === "under_review").length || 0} icon={<AlertCircle size={20} className="text-white" />} color="bg-blue-500" />
            </>
          )}
          {(role === "manager" || role === "admin") && (
            <>
              <StatCard title="Total Tickets" value={stats?.total || 0} icon={<ClipboardList size={20} className="text-white" />} color="bg-primary" subtitle="All time" />
              <StatCard title="Pending" value={(stats?.submitted || 0) + (stats?.under_review || 0)} icon={<AlertCircle size={20} className="text-white" />} color="bg-amber-500" subtitle="Need attention" />
              <StatCard title="In Progress" value={(stats?.assigned || 0) + (stats?.in_progress || 0)} icon={<Wrench size={20} className="text-white" />} color="bg-blue-500" subtitle="Active jobs" />
              <StatCard title="Completed" value={stats?.completed || 0} icon={<CheckCircle2 size={20} className="text-white" />} color="bg-green-500" subtitle="This period" />
            </>
          )}
          {role === "contractor" && (
            <>
              <StatCard title="Assigned Jobs" value={tickets?.filter(t => t.status === "assigned").length || 0} icon={<ClipboardList size={20} className="text-white" />} color="bg-primary" />
              <StatCard title="In Progress" value={tickets?.filter(t => t.status === "in_progress").length || 0} icon={<Hammer size={20} className="text-white" />} color="bg-amber-500" />
              <StatCard title="Completed" value={tickets?.filter(t => t.status === "completed").length || 0} icon={<CheckCircle2 size={20} className="text-white" />} color="bg-green-500" />
              <StatCard title="Total Jobs" value={tickets?.length || 0} icon={<TrendingUp size={20} className="text-white" />} color="bg-purple-500" />
            </>
          )}
        </div>
      )}

      {/* Recent Tickets */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {role === "contractor" ? "Recent Jobs" : "Recent Tickets"}
            </CardTitle>
            <Link href={role === "contractor" ? "/jobs" : "/tickets"}>
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ticketsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList size={40} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No tickets yet</p>
              {role === "tenant" && (
                <Link href="/tickets/new">
                  <Button variant="outline" size="sm" className="mt-3 gap-2">
                    <Plus size={14} />
                    Submit your first request
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {ticket.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">{ticket.ticketNumber}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground capitalize">{ticket.category.replace(/_/g, " ")}</span>
                      </div>
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

      {/* Quick actions for tenant */}
      {role === "tenant" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/tickets/new">
            <Card className="border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Submit a Request</p>
                  <p className="text-xs text-muted-foreground">Report a new maintenance issue</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/tickets">
            <Card className="border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <ClipboardList size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">View My Tickets</p>
                  <p className="text-xs text-muted-foreground">Track all your requests</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
