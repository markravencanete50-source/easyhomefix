// ============================================================
// easyhomefix — All Tickets Management
// Full ticket list with filters, search, and assignment
// ============================================================

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MOCK_TICKETS, MOCK_CONTRACTORS, MOCK_PROPERTIES } from '@/lib/mockData';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_BADGE_COLORS, PRIORITY_LABELS,
  CATEGORY_LABELS, CATEGORY_ICONS, formatDate, timeAgo, NEXT_STATUS,
} from '@/lib/utils';
import type { MaintenanceTicket, TicketStatus } from '@/types';
import {
  Search, Filter, AlertTriangle, Calendar, UserCheck, ChevronRight,
  Eye, ArrowUpCircle, X, Download,
} from 'lucide-react';

export default function AllTickets() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningTicket, setAssigningTicket] = useState<MaintenanceTicket | null>(null);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [managerNotes, setManagerNotes] = useState('');

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchProperty = propertyFilter === 'all' || t.propertyId === propertyFilter;
    return matchSearch && matchStatus && matchPriority && matchProperty;
  });

  const handleStatusUpdate = (ticket: MaintenanceTicket, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t =>
      t.id === ticket.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    ));
    toast.success(`Ticket ${ticket.ticketNumber} updated to "${STATUS_LABELS[newStatus]}"`);
  };

  const handleAssign = () => {
    if (!assigningTicket || !selectedContractor) {
      toast.error('Please select a contractor.');
      return;
    }
    const contractor = MOCK_CONTRACTORS.find(c => c.id === selectedContractor);
    setTickets(prev => prev.map(t =>
      t.id === assigningTicket.id
        ? {
            ...t,
            status: 'assigned' as TicketStatus,
            assignedContractorId: selectedContractor,
            assignedContractorName: contractor?.displayName,
            scheduledDate: scheduledDate || undefined,
            managerNotes: managerNotes || undefined,
            updatedAt: new Date().toISOString(),
          }
        : t
    ));
    toast.success(`Assigned to ${contractor?.displayName}`);
    setAssignDialogOpen(false);
    setAssigningTicket(null);
    setSelectedContractor('');
    setScheduledDate('');
    setManagerNotes('');
  };

  const handleEscalate = (ticket: MaintenanceTicket) => {
    setTickets(prev => prev.map(t =>
      t.id === ticket.id ? { ...t, isEscalated: true, priority: 'high', updatedAt: new Date().toISOString() } : t
    ));
    toast.warning(`Ticket ${ticket.ticketNumber} escalated.`);
  };

  return (
    <DashboardLayout
      title="All Maintenance Tickets"
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'All Tickets' }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => toast.info('Export feature coming soon.')}>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      }
    >
      <div className="p-4 lg:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets, tenants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {MOCK_PROPERTIES.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setPropertyFilter('all'); }}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Tickets Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tenant / Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contractor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Created</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="ticket-number text-primary">{ticket.ticketNumber}</span>
                        {ticket.isEmergency && <AlertTriangle className="w-3 h-3 text-destructive" />}
                        {ticket.isEscalated && <ArrowUpCircle className="w-3 h-3 text-amber-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px] mt-0.5">{ticket.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">{ticket.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{ticket.propertyName}</p>
                      {ticket.unitNumber && <p className="text-xs text-muted-foreground">Unit {ticket.unitNumber}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg">{CATEGORY_ICONS[ticket.category] && <span className="w-5 h-5">{(() => { const Icon = CATEGORY_ICONS[ticket.category]; return <Icon className="w-4 h-4" />; })()}</span>}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{CATEGORY_LABELS[ticket.category]}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`priority-chip ${PRIORITY_BADGE_COLORS[ticket.priority]}`}>
                        {PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${STATUS_COLORS[ticket.status]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.assignedContractorName ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">{ticket.assignedContractorName}</p>
                          {ticket.scheduledDate && (
                            <p className="text-xs text-purple-600 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(ticket.scheduledDate)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {timeAgo(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {!ticket.assignedContractorId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => { setAssigningTicket(ticket); setAssignDialogOpen(true); }}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {NEXT_STATUS[ticket.status] && NEXT_STATUS[ticket.status].length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleStatusUpdate(ticket, NEXT_STATUS[ticket.status][0])}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {!ticket.isEscalated && ticket.status !== 'completed' && ticket.status !== 'closed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleEscalate(ticket)}
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No tickets match your filters.</p>
          </div>
        )}
      </div>

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="ticket-number text-primary">{selectedTicket.ticketNumber}</span>
                {selectedTicket.isEmergency && <AlertTriangle className="w-4 h-4 text-destructive" />}
              </DialogTitle>
              <DialogDescription>{selectedTicket.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Tenant</p>
                  <p className="font-medium">{selectedTicket.tenantName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Property</p>
                  <p className="font-medium">{selectedTicket.propertyName}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm">{selectedTicket.description}</p>
              </div>
              {NEXT_STATUS[selectedTicket.status] && NEXT_STATUS[selectedTicket.status].length > 0 && (
                <div className="pt-2 border-t flex gap-2">
                  {NEXT_STATUS[selectedTicket.status].map(status => (
                    <Button 
                      key={status} 
                      size="sm" 
                      onClick={() => { handleStatusUpdate(selectedTicket, status); setSelectedTicket(null); }}
                    >
                      Move to {STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Contractor</DialogTitle>
            <DialogDescription>Select a contractor and schedule a visit for ticket {assigningTicket?.ticketNumber}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Contractor</Label>
              <Select value={selectedContractor} onValueChange={setSelectedContractor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CONTRACTORS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.displayName} ({c.companyName})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Manager Notes</Label>
              <Textarea placeholder="Add notes for the contractor..." value={managerNotes} onChange={e => setManagerNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign Contractor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
