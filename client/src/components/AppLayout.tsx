import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  AlertCircle,
  Bell,
  Building2,
  ChevronLeft,
  ClipboardList,
  Hammer,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import type { UserRole } from "../../../shared/types";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} />, roles: ["tenant", "manager", "contractor", "admin"] },
  { label: "My Tickets", path: "/tickets", icon: <ClipboardList size={18} />, roles: ["tenant"] },
  { label: "Submit Request", path: "/tickets/new", icon: <Wrench size={18} />, roles: ["tenant"] },
  { label: "All Tickets", path: "/tickets", icon: <ClipboardList size={18} />, roles: ["manager", "admin"] },
  { label: "My Jobs", path: "/jobs", icon: <Hammer size={18} />, roles: ["contractor"] },
  { label: "Properties", path: "/properties", icon: <Building2 size={18} />, roles: ["manager", "admin"] },
  { label: "Users", path: "/admin/users", icon: <Users size={18} />, roles: ["admin"] },
  { label: "Analytics", path: "/admin/analytics", icon: <Shield size={18} />, roles: ["admin"] },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  useEffect(() => { setSidebarOpen(false); }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Wrench size={32} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">House of Lettings Fix</h1>
            <p className="mt-2 text-muted-foreground">The maintenance workflow platform built for property teams who move fast.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            {[
              { icon: <ClipboardList size={16} />, text: "Real-time tracking" },
              { icon: <AlertCircle size={16} />, text: "Emergency alerts" },
              { icon: <Building2 size={16} />, text: "Multi-property" },
              { icon: <Users size={16} />, text: "Contractor portal" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-muted rounded-lg p-3">
                <span className="text-primary">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <a
            href={getLoginUrl()}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors shadow-md"
          >
            Sign in to your account
          </a>
          <p className="text-xs text-muted-foreground">Every issue. Tracked. Resolved.</p>
        </div>
      </div>
    );
  }

  const role = (user?.role as UserRole) || "tenant";
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  const roleLabel: Record<UserRole, string> = {
    tenant: "Tenant",
    manager: "Property Manager",
    contractor: "Contractor",
    admin: "Administrator",
  };

  const roleColor: Record<UserRole, string> = {
    tenant: "bg-blue-500",
    manager: "bg-purple-500",
    contractor: "bg-amber-500",
    admin: "bg-red-500",
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-sidebar-border", collapsed && "justify-center px-3")}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Wrench size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground leading-tight truncate">House of Lettings</p>
            <p className="text-xs text-primary font-medium">Fix</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white", roleColor[role])}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            {roleLabel[role]}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleNav.map((item) => {
          const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
          return (
            <Link key={item.path + item.label} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Notifications + User */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <Link href="/notifications">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}>
            <span className="relative flex-shrink-0">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            {!collapsed && <span>Notifications {unreadCount > 0 && <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">{unreadCount}</span>}</span>}
          </div>
        </Link>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Menu size={18} />
          </button>
        )}

        {!collapsed && (
          <div className="px-3 py-2 mt-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email || ""}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar flex-shrink-0 transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col lg:hidden transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-3 right-3">
          <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/50 hover:text-sidebar-foreground">
            <X size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground/60 hover:text-foreground">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Wrench size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold">House of Lettings Fix</span>
          </div>
          <Link href="/notifications" className="ml-auto relative">
            <Bell size={20} className="text-foreground/60" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
