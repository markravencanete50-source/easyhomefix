import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  ticket_submitted: "📋",
  ticket_assigned: "🔧",
  status_changed: "🔄",
  comment_added: "💬",
  ticket_completed: "✅",
  ticket_closed: "🔒",
  role_changed: "👤",
};

export default function Notifications() {
  const { data: notifications, isLoading, refetch } = trpc.notifications.list.useQuery();
  const markReadMutation = trpc.notifications.markRead.useMutation();
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation();
  const utils = trpc.useUtils();

  const handleMarkRead = async (id: number) => {
    await markReadMutation.mutateAsync({ id });
    await refetch();
    await utils.notifications.unreadCount.invalidate();
  };

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
    await refetch();
    await utils.notifications.unreadCount.invalidate();
    toast.success("All notifications marked as read");
  };

  const unread = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
            <CheckCheck size={14} />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">You'll be notified about ticket updates and assignments here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-primary/30",
                notif.isRead ? "bg-white border-border" : "bg-primary/5 border-primary/20"
              )}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-semibold", !notif.isRead && "text-primary")}>{notif.title}</p>
                  {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground/60">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  {notif.ticketId && (
                    <Link href={`/tickets/${notif.ticketId}`} onClick={e => e.stopPropagation()}>
                      <span className="text-xs text-primary hover:underline flex items-center gap-1">
                        View ticket <ExternalLink size={10} />
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
