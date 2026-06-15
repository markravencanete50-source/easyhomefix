// ============================================================
// FixFlow — Admin Dashboard
// Full system overview, user management, audit logs
// ============================================================

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MOCK_TICKETS, MOCK_DASHBOARD_METRICS, MOCK_ACTIVITY_LOGS, MOCK_CONTRACTORS } from '@/lib/mockData';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_BADGE_COLORS, PRIORITY_LABELS, ROLE_LABELS, formatDate, timeAgo } from '@/lib/utils';
import {
  Users, Building2, Ticket, Shield, Activity, Search,
  UserCheck, UserX, Edit, Trash2, AlertTriangle, CheckCircle,
  FileText, TrendingUp, Settings, Database, Bell, Lock,
} from 'lucide-react';
import type { UserRole } from '@/types';

// Demo users for admin panel
const DEMO_USERS = [
  { id: 'tenant-001', name: 'James Wilson', email: 'tenant@demo.com', role: 'tenant' as UserRole, status: 'active', joinedAt: '2024-01-15', property: 'Oakwood Apartments' },
  { id: 'tenant-002', name: 'Sarah Chen', email: 'sarah.chen@demo.com', role: 'tenant' as UserRole, status: 'active', joinedAt: '2024-02-01', property: 'Riverside Condos' },
  { id: 'manager-001', name: 'Alex Morgan', email: 'manager@demo.com', role: 'property_manager' as UserRole, status: 'active', joinedAt: '2023-11-01', property: 'All Properties' },
  { id: 'cont-001', name: 'Mike Johnson', email: 'contractor@demo.com', role: 'contractor' as UserRole, status: 'active', joinedAt: '2024-01-20', property: 'Plumbing Pros LLC' },
  { id: 'cont-002', name: 'Tom Williams', email: 'tom@demo.com', role: 'contractor' as UserRole, status: 'active', joinedAt: '2024-03-10', property: 'Williams Electric' },
  { id: 'admin-001', name: 'Admin User', email: 'admin@demo.com', role: 'admin' as UserRole, status: 'active', joinedAt: '2023-10-01', property: 'System Admin' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  tenant: 'bg-sky-100 text-sky-700 border-sky-200',
  property_manager: 'bg-teal-100 text-teal-700 border-teal-200',
  contractor: 'bg-amber-100 text-amber-700 border-amber-200',
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function AdminDashboard() {
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = DEMO_USERS.filter(u => {
    const matchSearch = !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout
      title="Admin Control Panel"
      breadcrumbs={[{ label: 'Admin' }]}
    >
      <div className="p-4 lg:p-6 space-y-6">
        {/* System Overview */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            System Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: DEMO_USERS.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Active Tickets', value: MOCK_DASHBOARD_METRICS.openTickets, icon: Ticket, color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Properties', value: 3, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Contractors', value: MOCK_CONTRACTORS.length, icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="h-9">
            <TabsTrigger value="users" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              All Tickets
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="property_manager">Manager</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="h-9 gap-1.5" onClick={() => toast.info('Invite user feature coming soon.')}>
                <Users className="w-3.5 h-3.5" />
                Invite User
              </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Property / Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{user.property}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{user.joinedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toast.info('Edit user feature coming soon.')}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => toast.info('Deactivate user feature coming soon.')}>
                              <UserX className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-4">
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Ticket</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tenant</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Priority</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_TICKETS.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="ticket-number text-primary">{ticket.ticketNumber}</span>
                            {ticket.isEmergency && <AlertTriangle className="w-3 h-3 text-destructive" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px] mt-0.5">{ticket.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium">{ticket.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{ticket.propertyName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`priority-chip ${PRIORITY_BADGE_COLORS[ticket.priority]}`}>
                            {PRIORITY_LABELS[ticket.priority]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`status-badge ${STATUS_COLORS[ticket.status]}`}>
                            {STATUS_LABELS[ticket.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(ticket.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Recent Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {MOCK_ACTIVITY_LOGS.map(log => (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{log.userName}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[log.userRole]}`}>
                            {ROLE_LABELS[log.userRole]}
                          </span>
                          <span className="ticket-number text-primary text-xs">{log.ticketId}</span>
                        </div>
                        <p className="text-xs text-foreground mt-0.5">{log.action}</p>
                        {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                        {log.previousStatus && log.newStatus && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`status-badge ${STATUS_COLORS[log.previousStatus]}`}>{STATUS_LABELS[log.previousStatus]}</span>
                            <span className="text-xs text-muted-foreground">→</span>
                            <span className={`status-badge ${STATUS_COLORS[log.newStatus]}`}>{STATUS_LABELS[log.newStatus]}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Database,
                  title: 'Firebase Configuration',
                  desc: 'Manage Firestore rules, indexes, and storage configuration.',
                  color: 'text-orange-600',
                  bg: 'bg-orange-50',
                  action: 'Configure',
                },
                {
                  icon: Bell,
                  title: 'Notification Settings',
                  desc: 'Configure FCM push notifications and email alert templates.',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  action: 'Manage',
                },
                {
                  icon: Lock,
                  title: 'Security Rules',
                  desc: 'Review and update Firestore and Storage security rules.',
                  color: 'text-red-600',
                  bg: 'bg-red-50',
                  action: 'Review',
                },
                {
                  icon: TrendingUp,
                  title: 'Analytics & Reports',
                  desc: 'Generate custom reports and export maintenance data.',
                  color: 'text-teal-600',
                  bg: 'bg-teal-50',
                  action: 'View Reports',
                },
              ].map(({ icon: Icon, title, desc, color, bg, action }) => (
                <Card key={title} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 h-7 text-xs"
                          onClick={() => toast.info(`${title} panel coming soon.`)}
                        >
                          {action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
