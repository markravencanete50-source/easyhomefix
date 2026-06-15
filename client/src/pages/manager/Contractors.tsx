// ============================================================
// FixFlow — Contractor Management
// ============================================================

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MOCK_CONTRACTORS } from '@/lib/mockData';
import { TRADE_TYPE_LABELS } from '@/lib/utils';
import type { Contractor } from '@/types';
import { Plus, Search, Star, Phone, Mail, Wrench, CheckCircle, XCircle, Edit } from 'lucide-react';

export default function Contractors() {
  const [contractors, setContractors] = useState(MOCK_CONTRACTORS);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newContractor, setNewContractor] = useState({ companyName: '', contactName: '', phone: '', email: '', tradeType: 'plumbing' });

  const filtered = contractors.filter(c =>
    !search ||
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newContractor.companyName || !newContractor.email) {
      toast.error('Company name and email are required.');
      return;
    }
    const contractor: Contractor = {
      id: `cont-${Date.now()}`,
      email: newContractor.email,
      displayName: newContractor.contactName,
      role: 'contractor',
      companyName: newContractor.companyName,
      contactName: newContractor.contactName,
      tradeTypes: [newContractor.tradeType as any],
      phone: newContractor.phone,
      performanceRating: 0,
      totalJobsCompleted: 0,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    setContractors(prev => [contractor, ...prev]);
    toast.success(`${newContractor.companyName} added successfully.`);
    setAddDialogOpen(false);
    setNewContractor({ companyName: '', contactName: '', phone: '', email: '', tradeType: 'plumbing' });
  };

  return (
    <DashboardLayout
      title="Contractor Management"
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Contractors' }]}
      actions={
        <Button size="sm" className="gap-1.5" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Contractor
        </Button>
      }
    >
      <div className="p-4 lg:p-6 space-y-4 max-w-5xl">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contractors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(contractor => (
            <Card key={contractor.id} className="border-0 shadow-sm ticket-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                      {contractor.displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{contractor.companyName}</p>
                      <p className="text-xs text-muted-foreground">{contractor.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {contractor.isAvailable ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Available</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Busy</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wrench className="w-3.5 h-3.5 shrink-0" />
                    <span>{contractor.tradeTypes.map(t => TRADE_TYPE_LABELS[t]).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{contractor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{contractor.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold">{contractor.performanceRating || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">({contractor.totalJobsCompleted} jobs)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toast.info('Edit contractor feature coming soon.')}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Contractor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contractor</DialogTitle>
            <DialogDescription>Add a contractor to your network.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { id: 'companyName', label: 'Company Name *', placeholder: 'e.g. Plumbing Pros LLC' },
              { id: 'contactName', label: 'Contact Name', placeholder: 'e.g. Mike Johnson' },
              { id: 'phone', label: 'Phone', placeholder: '(512) 555-0100' },
              { id: 'email', label: 'Email *', placeholder: 'contractor@example.com' },
            ].map(field => (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={newContractor[field.id as keyof typeof newContractor]}
                  onChange={e => setNewContractor(prev => ({ ...prev, [field.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Contractor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
