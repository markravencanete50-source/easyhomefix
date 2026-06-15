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
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { CATEGORY_LABELS, CATEGORY_ICONS, generateTicketNumber, formatFileSize } from '@/lib/utils';
import type { MaintenanceCategory, Priority } from '@/types';

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
  propertyId: string;
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
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    propertyId: MOCK_PROPERTIES[0].id,
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
      case 1: return !!form.propertyId;
      case 2: return !!form.category;
      case 3: return form.title.length >= 5 && form.description.length >= 10;
      case 4: return true; // Files optional
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
    // Simulate API call (in production: create Firestore document + upload files)
    await new Promise(resolve => setTimeout(resolve, 1500));
    const num = generateTicketNumber();
    setTicketNumber(num);
    setSubmitted(true);
    setSubmitting(false);
    toast.success(`Ticket ${num} submitted successfully!`);
  };

  const selectedProperty = MOCK_PROPERTIES.find(p => p.id === form.propertyId);

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
              <Button variant="outline" onClick={() => { setSubmitted(false); setStep(1); setForm({ propertyId: MOCK_PROPERTIES[0].id, category: '', title: '', description: '', files: [], issueDuration: '', contractorAccess: '', priority: '' }); }}>
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
        {/* Step indicator */}
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

            {/* Step 1: Select Property */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Select Property
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Which property is this issue at?</p>
                </div>
                <div className="space-y-2">
                  {MOCK_PROPERTIES.map(property => (
                    <button
                      key={property.id}
                      onClick={() => setForm(prev => ({ ...prev, propertyId: property.id }))}
                      className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-150 ${
                        form.propertyId === property.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        form.propertyId === property.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{property.name}</p>
                        <p className="text-sm text-muted-foreground">{property.address}, {property.city}, {property.state}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{property.totalUnits} units</p>
                      </div>
                      {form.propertyId === property.id && (
                        <CheckCircle className="w-5 h-5 text-primary ml-auto shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Category */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Maintenance Category
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">What type of issue are you reporting?</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                      className={`flex items-center gap-2.5 p-3.5 rounded-lg border-2 text-left transition-all duration-150 ${
                        form.category === cat
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                      <span className={`text-sm font-medium ${form.category === cat ? 'text-primary' : 'text-foreground'}`}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Describe */}
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
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground text-right">{form.title.length}/100</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue in detail. When did it start? What have you noticed? Any safety concerns?"
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={5}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground text-right">{form.description.length}/1000</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center gap-2">
                    <Mic className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">Voice Recording</p>
                      <p className="text-xs text-muted-foreground">Voice message upload available in full app</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.info('Voice recording requires microphone access in the full app.')}>
                      Record
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Upload Evidence */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Upload Evidence
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Photos and videos help us understand the issue faster. (Optional)
                  </p>
                </div>

                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-150"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, MP4, MOV, WebM — Max 100MB each</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileAdd}
                  />
                </div>

                {form.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{form.files.length} file(s) selected</p>
                    {form.files.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                        {file.type.startsWith('image/') ? (
                          <Image className="w-4 h-4 text-blue-500 shrink-0" />
                        ) : (
                          <Video className="w-4 h-4 text-purple-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Additional Info */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Additional Information
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Help us prioritize and schedule your request.</p>
                </div>

                {/* Issue duration */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">How long has this issue existed?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'today', label: 'Today' },
                      { value: '1_3_days', label: '1–3 Days' },
                      { value: '1_week', label: '1 Week' },
                      { value: 'more_than_1_week', label: 'More Than 1 Week' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setForm(prev => ({ ...prev, issueDuration: opt.value as FormData['issueDuration'] }))}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-150 ${
                          form.issueDuration === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 text-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contractor access */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Can a contractor access the property?</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                      { value: 'contact_first', label: 'Contact Me First' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setForm(prev => ({ ...prev, contractorAccess: opt.value as FormData['contractorAccess'] }))}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-150 ${
                          form.contractorAccess === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 text-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Priority Level</Label>
                  <div className="space-y-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-150 ${
                          form.priority === p.value ? `border-current ${p.color}` : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {p.value === 'emergency' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                        <div>
                          <p className="text-sm font-semibold">{p.label}</p>
                          <p className="text-xs opacity-70">{p.desc}</p>
                        </div>
                        {form.priority === p.value && <CheckCircle className="w-4 h-4 ml-auto shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Review Your Request
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Confirm the details before submitting.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Property', value: selectedProperty?.name },
                    { label: 'Category', value: form.category ? CATEGORY_LABELS[form.category] : '' },
                    { label: 'Title', value: form.title },
                    { label: 'Priority', value: form.priority ? form.priority.charAt(0).toUpperCase() + form.priority.slice(1) : '' },
                    { label: 'Issue Duration', value: { today: 'Today', '1_3_days': '1–3 Days', '1_week': '1 Week', 'more_than_1_week': 'More Than 1 Week' }[form.issueDuration as string] },
                    { label: 'Contractor Access', value: { yes: 'Yes', no: 'No', contact_first: 'Contact Me First' }[form.contractorAccess as string] },
                    { label: 'Files', value: form.files.length > 0 ? `${form.files.length} file(s) attached` : 'None' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
                      <span className="text-sm font-medium text-foreground text-right">{value || '—'}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <p className="text-xs font-medium text-foreground mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                </div>

                {form.priority === 'emergency' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <p className="text-xs text-red-700 font-medium">
                      Emergency requests are escalated immediately and may incur additional charges.
                    </p>
                  </div>
                )}
              </div>
            )}

          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 6 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1.5 bg-primary"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
