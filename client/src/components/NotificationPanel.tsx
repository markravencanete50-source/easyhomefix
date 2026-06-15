// ============================================================
// easyhomefix — Notification Panel
// Real-time notification center with unread counter
// ============================================================

import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Wrench,
  UserCheck,
} from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '@/lib/mockData';
import { timeAgo } from '@/lib/utils';
import type { NotificationEvent } from '@/types';

const EVENT_ICONS: Record<NotificationEvent, React.ElementType> = {
  ticket_submitted: Bell,
  ticket_assigned: UserCheck,
  contractor_scheduled: Clock,
  status_updated: CheckCircle,
  new_message: MessageSquare,
  job_completed: CheckCheck,
  ticket_closed: CheckCircle,
  ticket_escalated: AlertTriangle,
  ticket_reopened: Wrench,
};

const EVENT_COLORS: Record<NotificationEvent, string> = {
  ticket_submitted: 'text-blue-600 bg-blue-50',
  ticket_assigned: 'text-teal-600 bg-teal-50',
  contractor_scheduled: 'text-purple-600 bg-purple-50',
  status_updated: 'text-green-600 bg-green-50',
  new_message: 'text-sky-600 bg-sky-50',
  job_completed: 'text-green-600 bg-green-50',
  ticket_closed: 'text-gray-600 bg-gray-50',
  ticket_escalated: 'text-red-600 bg-red-50',
  ticket_reopened: 'text-amber-600 bg-amber-50',
};

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50"
      style={{ animation: 'pageEnter 150ms var(--ease-out-snappy) forwards' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0 h-4">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Mark all read
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <ScrollArea className="max-h-80">
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {MOCK_NOTIFICATIONS.map(notification => {
              const Icon = EVENT_ICONS[notification.event];
              const colorClass = EVENT_COLORS[notification.event];
              return (
                <div
                  key={notification.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                  onClick={onClose}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-tight">{notification.title}</p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(notification.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border">
        <Button variant="ghost" className="w-full h-8 text-xs text-primary hover:text-primary" onClick={onClose}>
          View all notifications
        </Button>
      </div>
    </div>
  );
}
