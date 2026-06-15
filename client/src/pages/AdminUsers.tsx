import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Shield, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "../../../shared/types";

const ROLE_COLORS: Record<string, string> = {
  tenant: "bg-blue-100 text-blue-700",
  manager: "bg-purple-100 text-purple-700",
  contractor: "bg-amber-100 text-amber-700",
  admin: "bg-red-100 text-red-700",
};

const ROLES: UserRole[] = ["tenant", "manager", "contractor", "admin"];

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation();

  const handleRoleChange = async (userId: number, role: UserRole) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
      await refetch();
      toast.success("User role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const stats = {
    total: users?.length || 0,
    tenants: users?.filter(u => u.role === "tenant").length || 0,
    managers: users?.filter(u => u.role === "manager").length || 0,
    contractors: users?.filter(u => u.role === "contractor").length || 0,
    admins: users?.filter(u => u.role === "admin").length || 0,
  };

  return (
    <div className="p-6 space-y-5 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{stats.total} registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tenants", value: stats.tenants, color: "text-blue-600 bg-blue-50" },
          { label: "Managers", value: stats.managers, color: "text-purple-600 bg-purple-50" },
          { label: "Contractors", value: stats.contractors, color: "text-amber-600 bg-amber-50" },
          { label: "Admins", value: stats.admins, color: "text-red-600 bg-red-50" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className={cn("text-2xl font-bold mt-1", color.split(" ")[0])}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User list */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users size={16} />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : !users || users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={40} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {u.name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || <User size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{u.name || "Unnamed User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email || `OpenID: ${u.openId.substring(0, 12)}...`}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", ROLE_COLORS[u.role])}>
                      {u.role}
                    </span>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground cursor-pointer hover:border-primary/50 transition-colors"
                      disabled={updateRoleMutation.isPending}
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
