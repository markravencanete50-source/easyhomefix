// ============================================================
// easyhomefix — Tenant Dashboard
// Simple, lightweight view for tenants
// ============================================================

import { useState } from 'react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_TICKETS, MOCK_NOTIFICATIONS, MOCK_PROPERTIES } from '@/lib/mockData';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_BADGE_COLORS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  formatDate,
  timeAgo,
} from '@/lib/utils';
import {
  Plus,
  Ticket,
  Clock,
  CheckCircle,
  Building2,
  Bell,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function TenantDashboard() {
  const { currentUser } = useAuth();

  // Filter tickets for this tenant (demo: show first 2 tenants' tickets)
  const myTickets = MOCK_TICKETS.slice(0, 4);
  const openCount = myTickets.filter(t => ['submitted', 'under_review', 'assigned', 'scheduled'].includes(t.status)).length;
  const inProgressCount = myTickets.filter(t => t.status === 'in_progress').length;
  const completedCount = myTickets.filter(t => ['completed', 'closed'].includes(t.status)).length;
  const myProperty = MOCK_PROPERTIES[0];
  const unreadNotifications = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  // Upcoming visits (tickets that are scheduled)
  const scheduledTickets = myTickets.filter(t => t.status === 'scheduled' && t.scheduledDate);

  return (
    <DashboardLayout
      title="My Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={
        <Link href="/tenant/report">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Report Issue
          </Button>
        </Link>
      }
    >
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl">
        {/* Welcome banner */}
        <div className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Hello, {currentUser?.displayName?.split(' ')[0]} 👋
            </h2>
            <p className="text-teal-100 text-sm mt-0.5">
              {openCount > 0
                ? `You have ${openCount} open maintenance request${openCount > 1 ? 's' : ''}.`
                : 'All your maintenance requests are up to date.'}
            </p>
          </div>
          <Link href="/tenant/report">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="w-4 h-4 mr-1.5" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Open', count: openCount, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Progress', count: inProgressCount, icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Completed', count: completedCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {count}
                  </p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Property Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                My Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold text-foreground">{myProperty.name}</p>
                <p className="text-sm text-muted-foreground">{myProperty.address}</p>
                <p className="text-sm text-muted-foreground">{myProperty.city}, {myProperty.state} {myProperty.zipCode}</p>
              </div>
              {currentUser?.unitNumber && (
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-xs">Unit {currentUser.unitNumber}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Visits */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Upcoming Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledTickets.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No upcoming visits scheduled</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledTickets.map(ticket => (
                    <div key={ticket.id} className="flex items-start gap-2 p-2 rounded-lg bg-purple-50">
                      <Calendar className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.scheduledDate ? formatDate(ticket.scheduledDate) : 'TBD'}
                        </p>
                        {ticket.assignedContractorName && (
                          <p className="text-xs text-purple-600">{ticket.assignedContractorName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0 h-4 ml-auto">
                    {unreadNotifications}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_NOTIFICATIONS.slice(0, 3).map(notif => (
                  <div key={notif.id} className={`p-2 rounded-lg text-xs ${!notif.isRead ? 'bg-primary/5' : 'bg-muted/30'}`}>
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-medium text-foreground leading-tight">{notif.title}</p>
                      {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                    <p className="text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                    <p className="text-muted-foreground/60 mt-0.5">{timeAgo(notif.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Requests</CardTitle>
            <Link href="/tenant/requests">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Ticket #</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Issue</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <span className="ticket-number text-primary">{ticket.ticketNumber}</span>
                        {ticket.isEmergency && (
                          <AlertTriangle className="w-3 h-3 text-destructive inline ml-1" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-xs truncate max-w-[180px]">{ticket.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[ticket.category]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${STATUS_COLORS[ticket.status]}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {STATUS_LABELS[ticket.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
