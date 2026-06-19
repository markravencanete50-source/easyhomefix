import { useAuth } from "@/_core/hooks/useAuth";
import { createTicket } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Flame,
  HardHat,
  Loader2,
  Shield,
  Sparkles,
  Upload,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { TicketCategory, TicketPriority } from "../../../shared/types";

const CATEGORIES: { value: TicketCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "plumbing", label: "Plumbing", icon: <Droplets size={22} />, description: "Leaks, blockages, water issues" },
  { value: "electrical", label: "Electrical", icon: <Zap size={22} />, description: "Wiring, outlets, lighting" },
  { value: "hvac", label: "HVAC", icon: <Wind size={22} />, description: "Heating, cooling, ventilation" },
  { value: "structural", label: "Structural", icon: <HardHat size={22} />, description: "Walls, floors, ceilings" },
  { value: "appliance", label: "Appliance", icon: <Wrench size={22} />, description: "Broken appliances" },
  { value: "pest_control", label: "Pest Control", icon: <AlertCircle size={22} />, description: "Insects, rodents" },
  { value: "cleaning", label: "Cleaning", icon: <Sparkles size={22} />, description: "Deep cleaning, waste" },
  { value: "security", label: "Security", icon: <Shield size={22} />, description: "Locks, doors, access" },
  { value: "other", label: "Other", icon: <Flame size={22} />, description: "Other issues" },
];

const PRIORITIES: { value: TicketPriority; label: string; description: string; color: string; border: string }[] = [
  { value: "emergency", label: "Emergency", description: "Immediate danger — gas leak, flooding, fire risk", color: "text-red-600", border: "border-red-300 bg-red-50 hover:border-red-400" },
  { value: "high", label: "High", description: "Significant impact — no hot water, heating failure", color: "text-orange-600", border: "border-orange-300 bg-orange-50 hover:border-orange-400" },
  { value: "medium", label: "Medium", description: "Moderate issue — minor leak, broken appliance", color: "text-teal-600", border: "border-teal-300 bg-teal-50 hover:border-teal-400" },
  { value: "low", label: "Low", description: "Minor issue — cosmetic, non-urgent", color: "text-gray-600", border: "border-gray-200 bg-gray-50 hover:border-gray-300" },
];

const STEPS = ["Category", "Details", "Priority", "Photos", "Review"];

export default function SubmitTicket() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<TicketCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.slice(0, 4 - photos.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!category || !user) return;
    setSubmitting(true);
    try {
      const ticketId = await createTicket({
        title,
        description,
        category,
        priority,
        tenantId: user.uid,
        tenantName: user.displayName ?? user.email ?? "Tenant",
        status: "open",
      });

      toast.success("Request submitted successfully!");
      navigate(`/tickets/${ticketId}`);
    } catch (err) {
      console.error("Ticket submission error:", err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return category !== null;
    if (step === 1) return title.trim().length >= 3 && description.trim().length >= 10;
    return true;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/tickets")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Submit Maintenance Request</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                i < step && "bg-primary border-primary text-white",
                i === step && "bg-primary border-primary text-white ring-4 ring-primary/20",
                i > step && "bg-white border-border text-muted-foreground"
              )}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={cn("text-[10px] font-medium hidden sm:block", i === step ? "text-primary" : "text-muted-foreground")}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1 mx-1 mb-4", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          {/* Step 0: Category */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">What type of issue is this?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all",
                      category === cat.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <span className={cn("text-muted-foreground", category === cat.value && "text-primary")}>{cat.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{cat.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Describe the issue</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title *</label>
                <Input
                  placeholder="e.g. Leaking tap in kitchen"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description *</label>
                <Textarea
                  placeholder="Please describe the issue in detail. Include when it started, how severe it is, and any relevant context..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                  className="border-border resize-none"
                />
                <p className="text-xs text-muted-foreground">{description.length} characters (minimum 10)</p>
              </div>
            </div>
          )}

          {/* Step 2: Priority */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">How urgent is this?</h2>
              <div className="space-y-3">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                      priority === p.value ? `${p.border} shadow-sm` : "border-border hover:border-border/80 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all", priority === p.value ? "border-current bg-current" : "border-border")}>
                      {priority === p.value && <div className="w-full h-full rounded-full bg-white scale-50" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-semibold", priority === p.value ? p.color : "text-foreground")}>{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Add photos (optional)</h2>
                <p className="text-sm text-muted-foreground">Upload up to 4 photos to help us understand the issue better.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border group">
                    <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all"
                  >
                    <Upload size={24} />
                    <span className="text-xs font-medium">Add photo</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review your request</h2>
              <div className="space-y-3">
                {[
                  { label: "Category", value: CATEGORIES.find(c => c.value === category)?.label },
                  { label: "Title", value: title },
                  { label: "Priority", value: PRIORITIES.find(p => p.value === priority)?.label },
                  { label: "Photos", value: `${photos.length} photo${photos.length !== 1 ? "s" : ""} attached` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground w-20 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-foreground">{value}</span>
                  </div>
                ))}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">Description</span>
                  <p className="text-sm text-foreground">{description}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            Continue
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        )}
      </div>
    </div>
  );
}
