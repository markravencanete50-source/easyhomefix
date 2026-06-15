import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Building2, Home, MapPin, Plus, User } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { cn } from "@/lib/utils";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const propertyId = parseInt(id || "0");
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [unitNumber, setUnitNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [assignTenantOpen, setAssignTenantOpen] = useState<number | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState("");

  const { data: property, isLoading } = trpc.properties.getById.useQuery({ id: propertyId });
  const { data: units, refetch: refetchUnits } = trpc.properties.units.useQuery({ propertyId });
  const { data: tenants } = trpc.users.byRole.useQuery({ role: "tenant" });
  const createUnitMutation = trpc.properties.createUnit.useMutation();
  const assignTenantMutation = trpc.properties.assignTenant.useMutation();

  const handleCreateUnit = async () => {
    if (!unitNumber) return;
    try {
      await createUnitMutation.mutateAsync({ propertyId, unitNumber, floor: floor || undefined, bedrooms: bedrooms ? parseInt(bedrooms) : undefined });
      await refetchUnits();
      toast.success("Unit created");
      setAddUnitOpen(false);
      setUnitNumber(""); setFloor(""); setBedrooms("");
    } catch { toast.error("Failed to create unit"); }
  };

  const handleAssignTenant = async (unitId: number) => {
    try {
      await assignTenantMutation.mutateAsync({ unitId, tenantId: selectedTenantId ? parseInt(selectedTenantId) : null });
      await refetchUnits();
      toast.success("Tenant assignment updated");
      setAssignTenantOpen(null);
      setSelectedTenantId("");
    } catch { toast.error("Failed to assign tenant"); }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Property not found.</p>
        <Link href="/properties"><Button variant="outline" className="mt-4">Back to properties</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3">
        <Link href="/properties">
          <button className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{property.name}</h1>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{property.address}{property.city ? `, ${property.city}` : ""}{property.postcode ? ` ${property.postcode}` : ""}</p>
          </div>
        </div>
      </div>

      {property.description && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{property.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Units */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Home size={16} />
              Units ({units?.length || 0})
            </CardTitle>
            <Dialog open={addUnitOpen} onOpenChange={setAddUnitOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus size={14} />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Unit Number *</label>
                    <Input placeholder="e.g. 1A, 201, Flat 3" value={unitNumber} onChange={e => setUnitNumber(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Floor</label>
                      <Input placeholder="e.g. Ground, 1st" value={floor} onChange={e => setFloor(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Bedrooms</label>
                      <Input type="number" placeholder="0" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleCreateUnit} disabled={!unitNumber || createUnitMutation.isPending}>
                    {createUnitMutation.isPending ? "Creating..." : "Create Unit"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!units || units.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Home size={36} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No units yet. Add units to this property.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    unit.isOccupied ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    <Home size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Unit {unit.unitNumber}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {unit.floor && <span className="text-xs text-muted-foreground">Floor: {unit.floor}</span>}
                      {unit.bedrooms != null && <span className="text-xs text-muted-foreground">{unit.bedrooms} bed</span>}
                      <span className={cn("text-xs font-medium", unit.isOccupied ? "text-green-600" : "text-muted-foreground")}>
                        {unit.isOccupied ? "Occupied" : "Vacant"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {unit.tenantId && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User size={12} />
                        Tenant #{unit.tenantId}
                      </span>
                    )}
                    <Dialog open={assignTenantOpen === unit.id} onOpenChange={open => { setAssignTenantOpen(open ? unit.id : null); setSelectedTenantId(unit.tenantId?.toString() || ""); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          {unit.tenantId ? "Change Tenant" : "Assign Tenant"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-sm">
                        <DialogHeader><DialogTitle>Assign Tenant to Unit {unit.unitNumber}</DialogTitle></DialogHeader>
                        <div className="space-y-3 mt-2">
                          <select
                            value={selectedTenantId}
                            onChange={e => setSelectedTenantId(e.target.value)}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                          >
                            <option value="">No tenant (vacant)</option>
                            {tenants?.map(t => (
                              <option key={t.id} value={t.id}>{t.name || t.email || `User #${t.id}`}</option>
                            ))}
                          </select>
                          <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleAssignTenant(unit.id)} disabled={assignTenantMutation.isPending}>
                            {assignTenantMutation.isPending ? "Saving..." : "Save Assignment"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
