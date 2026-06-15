// ============================================================
// House of Lettings Fix — Login Page
// Firebase Auth + Demo mode support
// ============================================================

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Eye, EyeOff, Wrench, CheckCircle, AlertTriangle, Loader2, Users, Building2, HardHat, Shield } from 'lucide-react';
import type { UserRole } from '@/types';

const DEMO_ACCOUNTS = [
  {
    role: 'tenant' as UserRole,
    label: 'Tenant',
    email: 'tenant@demo.com',
    password: 'demo1234',
    description: 'Report & track issues',
    icon: Users,
    color: 'text-sky-600',
    bg: 'bg-sky-50 hover:bg-sky-100 border-sky-200',
  },
  {
    role: 'property_manager' as UserRole,
    label: 'Property Manager',
    email: 'manager@demo.com',
    password: 'demo1234',
    description: 'Manage all tickets',
    icon: Building2,
    color: 'text-teal-600',
    bg: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
  },
  {
    role: 'contractor' as UserRole,
    label: 'Contractor',
    email: 'contractor@demo.com',
    password: 'demo1234',
    description: 'View & complete jobs',
    icon: HardHat,
    color: 'text-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  },
  {
    role: 'admin' as UserRole,
    label: 'Admin',
    email: 'admin@demo.com',
    password: 'demo1234',
    description: 'Full system access',
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  },
];

export default function Login() {
  const [, navigate] = useLocation();
  const { login, demoLogin, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    setDemoLoading(role);
    setTimeout(() => {
      demoLogin(role);
      toast.success(`Logged in as ${DEMO_ACCOUNTS.find(a => a.role === role)?.label}`);
      navigate('/');
      setDemoLoading(null);
    }, 600);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663762951485/7uj5hnYJRRXorRVXrZfLxM/maintenance-hero-bg-MA6GYJS3HpYVjqwe4V4StP.webp) center/cover no-repeat`,
      }}
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663762951485/7uj5hnYJRRXorRVXrZfLxM/fixflow-logo-EkNeMYvSJJ5YP4ELsBoxBN.webp"
            alt="FixFlow"
            className="w-10 h-10"
          />
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            House of Lettings Fix
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-bold leading-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Every issue.
              <br />
              <span className="text-teal-400">Tracked.</span>
              <br />
              Resolved.
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-md">
              The maintenance workflow platform built for property teams who move fast.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: CheckCircle, label: 'Real-time tracking', desc: 'Live ticket status updates' },
              { icon: AlertTriangle, label: 'Emergency alerts', desc: 'Instant priority escalation' },
              { icon: Building2, label: 'Multi-property', desc: 'Manage all your properties' },
              { icon: HardHat, label: 'Contractor portal', desc: 'Streamlined job management' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <Icon className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/40">© 2024 House of Lettings Fix. Property Maintenance Management Platform.</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white/95 backdrop-blur-xl">
        <div className="w-full max-w-md space-y-6 page-enter">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663762951485/7uj5hnYJRRXorRVXrZfLxM/fixflow-logo-EkNeMYvSJJ5YP4ELsBoxBN.webp"
              alt="FixFlow"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>House of Lettings Fix</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Sign in
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Access your maintenance dashboard
            </p>
          </div>

          {isDemoMode && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium">Demo Mode — Firebase not configured</p>
              </div>
              <p className="text-xs text-amber-600 mt-1 ml-6">
                Use the quick access buttons below or enter demo credentials.
              </p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-10"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast.info('Password reset: Enter your email and use the forgot password flow.')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">
              or try a demo account
            </span>
          </div>

          {/* Demo quick access */}
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(({ role, label, description, icon: Icon, color, bg }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                disabled={demoLoading !== null}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all duration-150 ${bg} disabled:opacity-60`}
              >
                {demoLoading === role ? (
                  <Loader2 className={`w-4 h-4 animate-spin ${color} shrink-0`} />
                ) : (
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <button
              className="text-primary hover:underline font-medium"
              onClick={() => navigate('/register')}
            >
              Request access
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
