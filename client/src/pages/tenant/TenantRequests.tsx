// ============================================================
// easyhomefix — Tenant Requests List
// ============================================================

import { useState } from 'react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_TICKETS } from '@/lib/mockData';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_BADGE_COLORS, PRIORITY_LABELS,
  CATEGORY_LABELS, CATEGORY_ICONS, formatDate, timeAgo,
} from '@/lib/utils';
import { Plus, Search, AlertTriangle, Calendar, User, ChevronRight } from 'lucide-react';

export default function TenantRequests() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const tickets = MOCK_TICKETS.filter(t => {
    const matchesSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="My Maintenance Requests"
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'My Requests' }]}
      actions={
        <Link href="/tenant/report">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      }
    >
      <div className="p-4 lg:p-6 space-y-4 max-w-4xl">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No requests found.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <Card key={ticket.id} className="border-0 shadow-sm ticket-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0 mt-0.5">{CATEGORY_ICONS[ticket.category]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="ticket-number text-primary">{ticket.ticketNumber}</span>
                            {ticket.isEmergency && (
                              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mt-0.5">{ticket.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`priority-chip ${PRIORITY_BADGE_COLORS[ticket.priority]}`}>
                            {PRIORITY_LABELS[ticket.priority]}
                          </span>
                          <span className={`status-badge ${STATUS_COLORS[ticket.status]}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            {STATUS_LABELS[ticket.status]}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        {ticket.assignedContractorName && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.assignedContractorName}
                          </span>
                        )}
                        {ticket.scheduledDate && (
                          <span className="text-xs text-purple-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Visit: {formatDate(ticket.scheduledDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
