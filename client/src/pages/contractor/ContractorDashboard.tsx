// ============================================================
// easyhomefix — Contractor Dashboard
// Job list, evidence upload, and completion workflow
// ============================================================

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MOCK_TICKETS } from '@/lib/mockData';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_BADGE_COLORS, PRIORITY_LABELS,
  CATEGORY_LABELS, CATEGORY_ICONS, formatDate, formatFileSize,
} from '@/lib/utils';
import type { MaintenanceTicket, TicketStatus } from '@/types';
import {
  Wrench, CheckCircle, Clock, AlertTriangle, Upload, Image, Video,
  Camera, FileText, X, Loader2, Calendar, User, Building2,
  ChevronRight, Star,
} from 'lucide-react';

// Filter tickets assigned to this contractor (demo: show cont-001 tickets)
const CONTRACTOR_TICKETS = MOCK_TICKETS.filter(t => t.assignedContractorId === 'cont-001');

interface JobUpdateState {
  notes: string;
  beforeFiles: File[];
  progressFiles: File[];
  completionFiles: File[];
  uploading: boolean;
  uploadProgress: number;
}

export default function ContractorDashboard() {
  const [tickets, setTickets] = useState(CONTRACTOR_TICKETS);
  const [selectedJob, setSelectedJob] = useState<MaintenanceTicket | null>(null);
  const [jobUpdate, setJobUpdate] = useState<JobUpdateState>({
    notes: '',
    beforeFiles: [],
    progressFiles: [],
    completionFiles: [],
    uploading: false,
    uploadProgress: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = useState<'before' | 'progress' | 'completion'>('before');

  const openJobs = tickets.filter(t => ['assigned', 'scheduled', 'in_progress'].includes(t.status));
  const completedJobs = tickets.filter(t => ['completed', 'closed'].includes(t.status));

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setJobUpdate(prev => ({
      ...prev,
      [`${activeUploadType}Files`]: [...prev[`${activeUploadType}Files` as keyof JobUpdateState] as File[], ...files],
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (type: 'before' | 'progress' | 'completion', index: number) => {
    const key = `${type}Files` as keyof JobUpdateState;
    setJobUpdate(prev => ({
      ...prev,
      [key]: (prev[key] as File[]).filter((_, i) => i !== index),
    }));
  };

  const handleStartJob = (ticket: MaintenanceTicket) => {
    setTickets(prev => prev.map(t =>
      t.id === ticket.id ? { ...t, status: 'in_progress' as TicketStatus, updatedAt: new Date().toISOString() } : t
    ));
    toast.success(`Started work on ${ticket.ticketNumber}`);
    if (selectedJob?.id === ticket.id) {
      setSelectedJob(prev => prev ? { ...prev, status: 'in_progress' } : null);
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;
    if (!jobUpdate.notes) {
      toast.error('Please add completion notes.');
      return;
    }

    setJobUpdate(prev => ({ ...prev, uploading: true, uploadProgress: 0 }));

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 200));
      setJobUpdate(prev => ({ ...prev, uploadProgress: i }));
    }

    setTickets(prev => prev.map(t =>
      t.id === selectedJob.id
        ? { ...t, status: 'completed' as TicketStatus, contractorNotes: jobUpdate.notes, updatedAt: new Date().toISOString() }
        : t
    ));

    toast.success(`Job ${selectedJob.ticketNumber} marked as completed!`);
    setJobUpdate({ notes: '', beforeFiles: [], progressFiles: [], completionFiles: [], uploading: false, uploadProgress: 0 });
    setSelectedJob(null);
  };

  const FileUploadSection = ({ type, label }: { type: 'before' | 'progress' | 'completion'; label: string }) => {
    const files = jobUpdate[`${type}Files` as keyof JobUpdateState] as File[];
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        <div
          className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          onClick={() => { setActiveUploadType(type); fileInputRef.current?.click(); }}
        >
          <Camera className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Click to add {label.toLowerCase()}</p>
        </div>
        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/40 text-xs">
                {file.type.startsWith('image/') ? <Image className="w-3.5 h-3.5 text-blue-500" /> : <Video className="w-3.5 h-3.5 text-purple-500" />}
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                <button onClick={() => removeFile(type, i)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout
      title="My Jobs"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Jobs', count: openJobs.length, icon: Wrench, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Completed', count: completedJobs.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Assigned', count: tickets.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="active">
          <TabsList className="h-9">
            <TabsTrigger value="active" className="text-xs">
              Active Jobs ({openJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completed ({completedJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-3">
            {openJobs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No active jobs. You're all caught up!</p>
              </div>
            ) : (
              openJobs.map(ticket => (
                <Card key={ticket.id} className="border-0 shadow-sm ticket-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl shrink-0">{CATEGORY_ICONS[ticket.category]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <span className="ticket-number text-primary">{ticket.ticketNumber}</span>
                            {ticket.isEmergency && <AlertTriangle className="w-3.5 h-3.5 text-destructive inline ml-1.5" />}
                            <h3 className="font-semibold text-foreground mt-0.5">{ticket.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`priority-chip ${PRIORITY_BADGE_COLORS[ticket.priority]}`}>
                              {PRIORITY_LABELS[ticket.priority]}
                            </span>
                            <span className={`status-badge ${STATUS_COLORS[ticket.status]}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                              {STATUS_LABELS[ticket.status]}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {ticket.propertyName}
                            {ticket.unitNumber && ` · Unit ${ticket.unitNumber}`}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.tenantName}
                          </span>
                          {ticket.scheduledDate && (
                            <span className="text-xs text-purple-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(ticket.scheduledDate)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {ticket.status === 'assigned' || ticket.status === 'scheduled' ? (
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1.5"
                              onClick={() => handleStartJob(ticket)}
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              Start Job
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => setSelectedJob(ticket)}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Update / Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            {completedJobs.map(ticket => (
              <Card key={ticket.id} className="border-0 shadow-sm opacity-80">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">{CATEGORY_ICONS[ticket.category]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="ticket-number text-muted-foreground">{ticket.ticketNumber}</span>
                          <h3 className="font-semibold text-foreground mt-0.5">{ticket.title}</h3>
                        </div>
                        <span className={`status-badge ${STATUS_COLORS[ticket.status]}`}>
                          <CheckCircle className="w-3 h-3" />
                          {STATUS_LABELS[ticket.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{ticket.propertyName}</span>
                        {ticket.resolvedAt && <span>Completed: {formatDate(ticket.resolvedAt)}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Update Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="ticket-number text-primary">{selectedJob.ticketNumber}</span>
                — Job Update
              </DialogTitle>
              <DialogDescription>{selectedJob.title}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileAdd}
              />

              <FileUploadSection type="before" label="Before Photos" />
              <FileUploadSection type="progress" label="Progress Photos" />
              <FileUploadSection type="completion" label="Completion Evidence" />

              <div className="space-y-1.5">
                <Label htmlFor="notes">Work Notes <span className="text-destructive">*</span></Label>
                <Textarea
                  id="notes"
                  placeholder="Describe the work performed, parts used, any issues encountered..."
                  value={jobUpdate.notes}
                  onChange={e => setJobUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              {jobUpdate.uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading files...</span>
                    <span>{jobUpdate.uploadProgress}%</span>
                  </div>
                  <Progress value={jobUpdate.uploadProgress} className="h-1.5" />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>Cancel</Button>
              <Button
                onClick={handleCompleteJob}
                disabled={jobUpdate.uploading || !jobUpdate.notes}
                className="gap-1.5"
              >
                {jobUpdate.uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
