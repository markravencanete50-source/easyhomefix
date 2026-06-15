// ============================================================
// FixFlow — Dashboard Layout
// Persistent sidebar + top header for all dashboard views
// ============================================================

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Ticket,
  Building2,
  Users,
  HardHat,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Wrench,
  BarChart3,
  MessageSquare,
  Plus,
  Shield,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { ROLE_LABELS } from '@/lib/utils';
import NotificationPanel from './NotificationPanel';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['tenant', 'property_manager', 'contractor', 'admin'] },
  { label: 'My Requests', href: '/tenant/requests', icon: Ticket, roles: ['tenant'] },
  { label: 'Report Issue', href: '/tenant/report', icon: Plus, roles: ['tenant'] },
  { label: 'All Tickets', href: '/manager/tickets', icon: Ticket, roles: ['property_manager', 'admin'] },
  { label: 'Properties', href: '/manager/properties', icon: Building2, roles: ['property_manager', 'admin'] },
  { label: 'Tenants', href: '/manager/tenants', icon: Users, roles: ['property_manager', 'admin'] },
  { label: 'Contractors', href: '/manager/contractors', icon: HardHat, roles: ['property_manager', 'admin'] },
  { label: 'Analytics', href: '/manager/analytics', icon: BarChart3, roles: ['property_manager', 'admin'] },
  { label: 'My Jobs', href: '/contractor/jobs', icon: Wrench, roles: ['contractor'] },
  { label: 'Messages', href: '/messages', icon: MessageSquare, roles: ['tenant', 'property_manager', 'contractor'] },
  { label: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
  { label: 'Audit Logs', href: '/admin/logs', icon: FileText, roles: ['admin'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['property_manager', 'admin'] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export default function DashboardLayout({ children, title, breadcrumbs, actions }: DashboardLayoutProps) {
  const { currentUser, logout } = useAuth();
  const [location] = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = currentUser?.role ?? 'tenant';
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663762951485/7uj5hnYJRRXorRVXrZfLxM/fixflow-logo-EkNeMYvSJJ5YP4ELsBoxBN.webp"
          alt="FixFlow"
          className="w-8 h-8"
        />
        <div>
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            FixFlow
          </span>
          <p className="text-xs text-sidebar-foreground/50 -mt-0.5">Maintenance Platform</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-sidebar-accent-foreground">
            {ROLE_LABELS[role]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {filteredNav.map(item => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div
                className={`nav-item ${isActive ? 'active' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0 min-w-[1.25rem] h-5">
                    {item.badge}
                  </Badge>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {currentUser?.displayName}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 shrink-0 flex items-center gap-4 px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 bg-sidebar border-sidebar-border">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs / Title */}
          <div className="flex-1 min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    {crumb.href ? (
                      <Link href={crumb.href}>
                        <span className="text-muted-foreground hover:text-foreground transition-colors">
                          {crumb.label}
                        </span>
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : title ? (
              <h1 className="text-base font-semibold text-foreground truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {title}
              </h1>
            ) : null}
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {actions}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              {notifOpen && (
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <p className="font-medium text-sm">{currentUser?.displayName}</p>
                  <p className="text-xs text-muted-foreground font-normal">{ROLE_LABELS[role]}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Profile settings coming soon.')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
