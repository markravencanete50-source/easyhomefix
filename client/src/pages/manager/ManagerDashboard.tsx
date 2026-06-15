// ============================================================
// FixFlow — Property Manager Dashboard
// Core system with analytics, metrics, and ticket overview
// ============================================================

import { useState } from 'react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  MOCK_TICKETS,
  MOCK_DASHBOARD_METRICS,
  MOCK_MONTHLY_DATA,
  MOCK_CATEGORY_DATA,
  MOCK_CONTRACTORS,
} from '@/lib/mockData';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_BADGE_COLORS, PRIORITY_LABELS,
  CATEGORY_LABELS, formatDate, timeAgo,
} from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Ticket, Clock, AlertTriangle, CheckCircle, TrendingUp,
  ArrowRight, Users, Building2, HardHat, Star, Activity,
  RefreshCw, Plus, Filter,
} from 'lucide-react';

const METRIC_CARDS = [
  { key: 'openTickets', label: 'Open Tickets', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'assignedTickets', label: 'Assigned', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { key: 'inProgressTickets', label: 'In Progress', icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
  { key: 'overdueTickets', label: 'Overdue', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  { key: 'completedTickets', label: 'Completed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  { key: 'emergencyTickets', label: 'Emergency', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
];

export default function ManagerDashboard() {
  const { currentUser } = useAuth();
  const metrics = MOCK_DASHBOARD_METRICS;
  const recentTickets = MOCK_TICKETS.slice(0, 5);

  return (
    <DashboardLayout
      title="Operations Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Link href="/manager/tickets">
            <Button size="sm" className="gap-1.5 h-8">
              <Filter className="w-3.5 h-3.5" />
              All Tickets
            </Button>
          </Link>
        </div>
      }
    >
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Good morning, {currentUser?.displayName?.split(' ')[0]} 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Here's what's happening across your properties today.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Live updates enabled</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {METRIC_CARDS.map(({ key, label, icon: Icon, color, bg, border }) => (
            <Card key={key} className={`border shadow-sm ${border}`}>
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {metrics[key as keyof typeof metrics]}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly Volume Chart */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Monthly Ticket Volume
                </CardTitle>
                <Badge variant="outline" className="text-xs">Last 6 months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MOCK_MONTHLY_DATA} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.006 240)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid oklch(0.9 0.006 240)' }}
                  />
                  <Bar dataKey="tickets" name="Total" fill="oklch(0.58 0.14 185)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="oklch(0.65 0.14 145)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                By Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {MOCK_CATEGORY_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {MOCK_CATEGORY_DATA.slice(0, 4).map(item => (
                  <div key={item.category} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground truncate">{item.category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Tickets */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Tickets</CardTitle>
              <Link href="/manager/tickets">
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
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Ticket</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Tenant</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Priority</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="ticket-number text-primary">{ticket.ticketNumber}</span>
                            {ticket.isEmergency && <AlertTriangle className="w-3 h-3 text-destructive" />}
                            {ticket.isEscalated && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px] mt-0.5">{ticket.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{ticket.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{ticket.propertyName}</p>
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
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {timeAgo(ticket.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Contractor Performance */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-600" />
                Contractors
              </CardTitle>
              <Link href="/manager/contractors">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_CONTRACTORS.slice(0, 4).map(contractor => (
                <div key={contractor.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                    {contractor.displayName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{contractor.companyName}</p>
                    <p className="text-xs text-muted-foreground truncate">{contractor.tradeTypes.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium">{contractor.performanceRating}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${contractor.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Avg Resolution Time', value: `${metrics.avgResolutionDays} days`, icon: Clock, color: 'text-teal-600' },
            { label: 'This Month', value: `${metrics.totalThisMonth} tickets`, icon: TrendingUp, color: 'text-blue-600' },
            { label: 'Active Properties', value: '3', icon: Building2, color: 'text-purple-600' },
            { label: 'Active Contractors', value: `${MOCK_CONTRACTORS.filter(c => c.isAvailable).length}`, icon: HardHat, color: 'text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div>
                  <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
