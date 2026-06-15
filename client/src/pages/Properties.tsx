import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, MapPin, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Properties() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [description, setDescription] = useState("");

  const { data: properties, isLoading, refetch } = trpc.properties.list.useQuery();
  const createMutation = trpc.properties.create.useMutation();

  const handleCreate = async () => {
    if (!name || !address) return;
    try {
      await createMutation.mutateAsync({ name, address, city, postcode, description });
      await refetch();
      toast.success("Property created successfully");
      setOpen(false);
      setName(""); setAddress(""); setCity(""); setPostcode(""); setDescription("");
    } catch {
      toast.error("Failed to create property");
    }
  };

  return (
    <div className="p-6 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{properties?.length || 0} managed properties</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus size={16} />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Property Name *</label>
                <Input placeholder="e.g. Riverside Apartments" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address *</label>
                <Input placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">City</label>
                  <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Postcode</label>
                  <Input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Optional description..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="resize-none" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleCreate} disabled={!name || !address || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Property"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !properties || properties.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No properties yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Add your first property to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Building2 size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{property.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">{property.address}{property.city ? `, ${property.city}` : ""}</p>
                      </div>
                    </div>
                  </div>
                  {property.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{property.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Added {new Date(property.createdAt).toLocaleDateString()}</span>
                    {property.postcode && <span className="text-xs text-muted-foreground ml-auto font-mono">{property.postcode}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
