import { trpc } from "@/lib/trpc";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Hammer } from "lucide-react";
import { Link } from "wouter";
import { TICKET_CATEGORY_LABELS } from "../../../shared/types";

export default function JobList() {
  const { data: tickets, isLoading } = trpc.tickets.list.useQuery();

  const activeJobs = tickets?.filter(t => t.status === "assigned" || t.status === "in_progress") || [];
  const completedJobs = tickets?.filter(t => t.status === "completed" || t.status === "closed") || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  const JobCard = ({ ticket }: { ticket: NonNullable<typeof tickets>[0] }) => (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Hammer size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{ticket.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {TICKET_CATEGORY_LABELS[ticket.category as keyof typeof TICKET_CATEGORY_LABELS]}
                </span>
                {ticket.scheduledDate && (
                  <>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs text-muted-foreground">
                      Scheduled: {new Date(ticket.scheduledDate).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          {ticket.estimatedCost && (
            <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Estimated cost:</span>
              <span className="text-xs font-semibold text-foreground">£{ticket.estimatedCost}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="p-6 space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{tickets?.length || 0} total assigned jobs</p>
      </div>

      {/* Active jobs */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Active Jobs ({activeJobs.length})
        </h2>
        {activeJobs.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Hammer size={36} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No active jobs at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeJobs.map(t => <JobCard key={t.id} ticket={t} />)}
          </div>
        )}
      </div>

      {/* Completed jobs */}
      {completedJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Completed Jobs ({completedJobs.length})
          </h2>
          <div className="space-y-2">
            {completedJobs.map(t => <JobCard key={t.id} ticket={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}
