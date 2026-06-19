// ============================================================
// easyhomefix — Report Maintenance Issue
// 6-step wizard for tenants to submit maintenance requests
// ============================================================

import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Upload,
  X,
  Mic,
  MicOff,
  Image,
  Video,
  AlertTriangle,
  Loader2,
  Building2,
  Wrench,
  FileText,
  Camera,
  Info,
  Send,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createTicket } from '@/lib/firestore';
import { uploadTicketAttachment } from '@/lib/storage';
import { CATEGORY_LABELS, CATEGORY_ICONS, formatFileSize } from '@/lib/utils';
import type { MaintenanceCategory, Priority, MaintenanceTicket } from '@/types';

const makeTicketNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `MT-${year}-${rand}`;
};

const STEPS = [
  { id: 1, label: 'Property', icon: Building2 },
  { id: 2, label: 'Category', icon: Wrench },
  { id: 3, label: 'Describe', icon: FileText },
  { id: 4, label: 'Evidence', icon: Camera },
  { id: 5, label: 'Details', icon: Info },
  { id: 6, label: 'Review', icon: Send },
];

const CATEGORIES: MaintenanceCategory[] = [
  'plumbing', 'electrical', 'heating', 'roofing',
  'pest_control', 'general_repair', 'appliance', 'other',
];

const PRIORITIES: Array<{ value: Priority; label: string; desc: string; color: string }> = [
  { value: 'emergency', label: 'Emergency', desc: 'Immediate danger or uninhabitable', color: 'border-red-400 bg-red-50 text-red-700' },
  { value: 'high', label: 'High', desc: 'Major issue affecting daily life', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { value: 'medium', label: 'Medium', desc: 'Significant but not urgent', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { value: 'low', label: 'Low', desc: 'Minor issue, can wait', color: 'border-slate-300 bg-slate-50 text-slate-600' },
];

interface FormData {
  postcode: string;
  addressLine1: string;
  category: MaintenanceCategory | '';
  title: string;
  description: string;
  files: File[];
  issueDuration: 'today' | '1_3_days' | '1_week' | 'more_than_1_week' | '';
  contractorAccess: 'yes' | 'no' | 'contact_first' | '';
  priority: Priority | '';
}

export default function ReportIssue() {
  const [, navigate] = useLocation();
  const { currentUser: user, isDemoMode } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    postcode: '',
    addressLine1: '',
    category: '',
    title: '',
    description: '',
    files: [],
    issueDuration: '',
    contractorAccess: '',
    priority: '',
  });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return form.postcode.length >= 3 && form.addressLine1.length >= 5;
      case 2: return !!form.category;
      case 3: return form.title.length >= 5 && form.description.length >= 10;
      case 4: return true;
      case 5: return !!form.issueDuration && !!form.contractorAccess && !!form.priority;
      case 6: return true;
      default: return false;
    }
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter(f => f.size <= 100 * 1024 * 1024);
    if (validFiles.length < newFiles.length) {
      toast.error('Some files were too large (max 100MB each).');
    }
    setForm(prev => ({ ...prev, files: [...prev.files, ...validFiles].slice(0, 10) }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const num = makeTicketNumber();
        setTicketNumber(num);
        setSubmitted(true);
        toast.success(`Ticket ${num} submitted! (Demo mode — not saved to database)`);
      } else {
        const uploadedUrls: string[] = [];
        const tempTicketId = `temp-${Date.now()}`;
        if (form.files.length > 0 && user) {
          for (const file of form.files) {
            try {
              const result = await uploadTicketAttachment(tempTicketId, file, 'evidence');
              uploadedUrls.push(result.url);
            } catch {
              toast.warning(`Could not upload ${file.name}, skipping.`);
            }
          }
        }

        const ticketNum = makeTicketNumber();
        await createTicket({
          ticketNumber: ticketNum,
          tenantId: user?.uid ?? '',
          tenantName: user?.displayName ?? '',
          propertyId: '',
          propertyName: `${form.addressLine1}, ${form.postcode}`,
          category: form.category as MaintenanceCategory,
          title: form.title,
          description: form.description,
          priority: form.priority as Priority,
          status: 'submitted',
          attachments: uploadedUrls.map((url, i) => ({
            id: `att-${i}`,
            ticketId: tempTicketId,
            uploadedBy: user?.uid ?? '',
            fileName: form.files[i]?.name ?? `file-${i}`,
            fileType: form.files[i]?.type ?? 'application/octet-stream',
            fileSize: form.files[i]?.size ?? 0,
            url,
            attachmentType: 'evidence',
            createdAt: new Date().toISOString(),
          })),
          issueDuration: form.issueDuration as MaintenanceTicket['issueDuration'],
          contractorAccess: form.contractorAccess as MaintenanceTicket['contractorAccess'],
          isEmergency: form.priority === 'emergency',
          isEscalated: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);

        setTicketNumber(ticketNum);
        setSubmitted(true);
        toast.success(`Ticket ${ticketNum} submitted successfully!`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout title="Request Submitted" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Report Issue' }]}>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="text-center space-y-4 max-w-sm page-enter">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Request Submitted!
              </h2>
              <p className="text-muted-foreground mt-1">
                Your maintenance request has been received and will be reviewed shortly.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Ticket Number</p>
              <p className="ticket-number text-xl font-bold text-primary mt-1">{ticketNumber}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/tenant/requests')} className="w-full">
                View My Requests
              </Button>
              <Button variant="outline" onClick={() => { setSubmitted(false); setStep(1); setForm({ postcode: '', addressLine1: '', category: '', title: '', description: '', files: [], issueDuration: '', contractorAccess: '', priority: '' }); }}>
                Submit Another Request
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Report Maintenance Issue"
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Report Issue' }]}
    >
      <div className="p-4 lg:p-6 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs hidden sm:block ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 sm:mx-2 transition-colors ${step > s.id ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground mt-1">Step {step} of {STEPS.length}</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-5">

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Property Details
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Enter your property postcode and address</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="postcode" className="text-sm font-medium">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="e.g., SW1A 1AA"
                      value={form.postcode}
                      onChange={e => setForm(prev => ({ ...prev, postcode: e.target.value }))}
                      className="h-10 mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine1" className="text-sm font-medium">First Line of Address *</Label>
                    <Input
                      id="addressLine1"
                      placeholder="e.g., 123 Main Street"
                      value={form.addressLine1}
                      onChange={e => setForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className="h-10 mt-1.5"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">ℹ️ Info:</span> We'll use this information to identify your property and route your request to the appropriate manager.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Maintenance Category
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">What type of issue are you reporting?</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = CATEGORY_ICONS[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                        className={`flex items-center gap-2.5 p-3.5 rounded-lg border-2 text-left transition-all duration-150 ${
                          form.category === cat
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <span className="text-xl text-primary"><Icon className="w-5 h-5" /></span>
                        <span className={`text-sm font-medium ${form.category === cat ? 'text-primary' : 'text-foreground'}`}>
                          {CATEGORY_LABELS[cat]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Describe the Issue
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Provide a clear title and detailed description.</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Issue Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="title"
                      placeholder="e.g. Kitchen sink leaking under cabinet"
                      value={form.title}
                      onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Full Description <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide as much detail as possible about the issue..."
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Evidence (Optional)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Upload photos or videos to help us understand the issue.</p>
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or MP4 (max. 100MB)</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileAdd} 
                    multiple 
                    className="hidden" 
                    accept="image/*,video/*"
                  />
                </div>

                {form.files.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {form.files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.type.startsWith('image/') ? <Image className="w-4 h-4 shrink-0" /> : <Video className="w-4 h-4 shrink-0" />}
                          <span className="text-xs truncate font-medium">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Final Details
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Help us prioritize and schedule the repair.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">How long has this been an issue? *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'today', label: 'Started today' },
                        { value: '1_3_days', label: '1-3 days' },
                        { value: '1_week', label: 'About a week' },
                        { value: 'more_than_1_week', label: 'Over a week' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setForm(prev => ({ ...prev, issueDuration: opt.value as any }))}
                          className={`p-2.5 rounded-lg border text-sm transition-all ${
                            form.issueDuration === opt.value 
                              ? 'border-primary bg-primary/5 text-primary font-medium' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Can a contractor access with a key? *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                        { value: 'contact_first', label: 'Call first' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setForm(prev => ({ ...prev, contractorAccess: opt.value as any }))}
                          className={`p-2.5 rounded-lg border text-sm transition-all ${
                            form.contractorAccess === opt.value 
                              ? 'border-primary bg-primary/5 text-primary font-medium' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Priority Level *</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.value}
                          onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                            form.priority === p.value 
                              ? p.color 
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-bold text-sm">{p.label}</p>
                            <p className="text-xs opacity-80">{p.desc}</p>
                          </div>
                          {form.priority === p.value && <CheckCircle className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Review & Submit
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Please check your details before submitting.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                    <div className="flex justify-between items-start border-b border-border/50 pb-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Property</p>
                        <p className="text-sm font-medium">{form.addressLine1}, {form.postcode}</p>
                      </div>
                      <Badge variant="outline" className="bg-background">{form.category ? CATEGORY_LABELS[form.category as MaintenanceCategory] : ''}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Issue</p>
                      <p className="text-sm font-bold mt-0.5">{form.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{form.description}</p>
                    </div>
                    <div className="flex gap-4 pt-1">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Priority</p>
                        <p className="text-sm font-medium capitalize">{form.priority}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Evidence</p>
                        <p className="text-sm font-medium">{form.files.length} file(s)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800">
                      By submitting this request, you agree to allow the property manager and assigned contractors to contact you regarding this maintenance issue.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1 || submitting}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          
          {step < STEPS.length ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1.5 bg-primary hover:bg-primary/90 min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
