import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { StatusBadge, PriorityBadge, StatusStepper } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  User,
  Wrench,
} from "lucide-react";
import { useState, useRef } from "react";
import { Link, useParams } from "wouter";
import { cn } from "@/lib/utils";
import type { TicketStatus, UserRole } from "../../../shared/types";
import { TICKET_CATEGORY_LABELS, TICKET_STATUS_LABELS } from "../../../shared/types";

const STATUS_TRANSITIONS: Record<string, TicketStatus[]> = {
  submitted: ["under_review"],
  under_review: ["assigned"],
  assigned: ["in_progress"],
  in_progress: ["completed"],
  completed: ["closed"],
  closed: [],
};

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const role = (user?.role as UserRole) || "tenant";
  const ticketId = parseInt(id || "0");

  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { data: ticket, isLoading, refetch } = trpc.tickets.getById.useQuery({ id: ticketId });
  const { data: comments, refetch: refetchComments } = trpc.tickets.comments.useQuery({ ticketId });
  const { data: photos, refetch: refetchPhotos } = trpc.tickets.photos.useQuery({ ticketId });
  const { data: contractors } = trpc.users.contractors.useQuery(undefined, { enabled: role === "manager" || role === "admin" });

  const addCommentMutation = trpc.tickets.addComment.useMutation();
  const updateStatusMutation = trpc.tickets.updateStatus.useMutation();
  const assignMutation = trpc.tickets.assign.useMutation();
  const contractorUpdateMutation = trpc.tickets.contractorUpdate.useMutation();
  const uploadPhotoMutation = trpc.tickets.uploadPhoto.useMutation();
  const utils = trpc.useUtils();

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await addCommentMutation.mutateAsync({ ticketId, content: comment, isInternal });
      setComment("");
      await refetchComments();
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: ticketId, status: newStatus });
      await refetch();
      await utils.tickets.list.invalidate();
      toast.success(`Status updated to ${TICKET_STATUS_LABELS[newStatus]}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAssign = async () => {
    if (!selectedContractor) return;
    try {
      await assignMutation.mutateAsync({
        id: ticketId,
        contractorId: parseInt(selectedContractor),
        estimatedCost: estimatedCost || undefined,
      });
      await refetch();
      await utils.tickets.list.invalidate();
      toast.success("Contractor assigned successfully");
    } catch {
      toast.error("Failed to assign contractor");
    }
  };

  const handleContractorUpdate = async (status: "in_progress" | "completed") => {
    try {
      await contractorUpdateMutation.mutateAsync({ id: ticketId, status });
      await refetch();
      await utils.tickets.list.invalidate();
      toast.success(`Job status updated to ${status.replace(/_/g, " ")}`);
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(",")[1];
        const photoType = role === "contractor" ? "completion" : "progress";
        await uploadPhotoMutation.mutateAsync({ ticketId, photoType, base64Data: base64, mimeType: file.type });
        await refetchPhotos();
        toast.success("Photo uploaded");
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload photo");
      setUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Link href="/tickets"><Button variant="outline" className="mt-4">Back to tickets</Button></Link>
      </div>
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[ticket.status] || [];
  const canManage = role === "manager" || role === "admin";
  const isAssignedContractor = role === "contractor" && ticket.assignedContractorId === user?.id;

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tickets">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground truncate">{ticket.title}</h1>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground capitalize">
              {TICKET_CATEGORY_LABELS[ticket.category as keyof typeof TICKET_CATEGORY_LABELS]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Status stepper */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <StatusStepper currentStatus={ticket.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Photos */}
          {(photos && photos.length > 0) && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Photos ({photos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                      <div className="aspect-video rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors">
                        <img src={photo.url} alt={photo.caption || "Photo"} className="w-full h-full object-cover" />
                      </div>
                      {photo.caption && <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo upload for contractor/manager */}
          {(isAssignedContractor || canManage) && ticket.status !== "closed" && (
            <Card className="border-border shadow-sm border-dashed">
              <CardContent className="p-4">
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <Button
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-full gap-2"
                >
                  {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare size={16} />
                Comments ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className={cn(
                      "flex gap-3 p-3 rounded-xl",
                      c.isInternal ? "bg-amber-50 border border-amber-100" : "bg-muted/50"
                    )}>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        <User size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-foreground">
                            {c.authorId === user?.id ? "You" : `User #${c.authorId}`}
                          </span>
                          {c.isInternal && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                              <Lock size={10} /> Internal
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment.</p>
              )}

              {ticket.status !== "closed" && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    className="border-border resize-none"
                  />
                  <div className="flex items-center justify-between">
                    {canManage && (
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={e => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        <Lock size={12} />
                        Internal note (managers only)
                      </label>
                    )}
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!comment.trim() || submittingComment}
                      className="gap-2 bg-primary hover:bg-primary/90 ml-auto"
                    >
                      {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ticket info */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Created", value: new Date(ticket.createdAt).toLocaleDateString() },
                { label: "Updated", value: new Date(ticket.updatedAt).toLocaleDateString() },
                ticket.estimatedCost && { label: "Est. Cost", value: `£${ticket.estimatedCost}` },
                ticket.scheduledDate && { label: "Scheduled", value: new Date(ticket.scheduledDate).toLocaleDateString() },
                ticket.completedAt && { label: "Completed", value: new Date(ticket.completedAt).toLocaleDateString() },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Manager actions */}
          {canManage && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status update */}
                {nextStatuses.length > 0 && ticket.status !== "assigned" && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Update Status</p>
                    {nextStatuses.map(s => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 justify-start"
                        onClick={() => handleStatusUpdate(s)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle2 size={14} />
                        Mark as {TICKET_STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Assign contractor */}
                {(ticket.status === "under_review" || ticket.status === "submitted") && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground">Assign Contractor</p>
                    <select
                      value={selectedContractor}
                      onChange={e => setSelectedContractor(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                    >
                      <option value="">Select contractor...</option>
                      {contractors?.map(c => (
                        <option key={c.id} value={c.id}>{c.name || c.email}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Estimated cost (£)"
                      value={estimatedCost}
                      onChange={e => setEstimatedCost(e.target.value)}
                      className="border-border text-sm"
                    />
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={handleAssign}
                      disabled={!selectedContractor || assignMutation.isPending}
                    >
                      {assignMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Wrench size={14} className="mr-2" />}
                      Assign Contractor
                    </Button>
                  </div>
                )}

                {/* Internal notes */}
                {ticket.internalNotes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Lock size={11} /> Internal Notes
                    </p>
                    <p className="text-xs text-foreground bg-amber-50 border border-amber-100 rounded-lg p-2.5 leading-relaxed">
                      {ticket.internalNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contractor actions */}
          {isAssignedContractor && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Job Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ticket.status === "assigned" && (
                  <Button
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                    onClick={() => handleContractorUpdate("in_progress")}
                    disabled={contractorUpdateMutation.isPending}
                  >
                    <Clock size={14} />
                    Start Job
                  </Button>
                )}
                {ticket.status === "in_progress" && (
                  <Button
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleContractorUpdate("completed")}
                    disabled={contractorUpdateMutation.isPending}
                  >
                    <CheckCircle2 size={14} />
                    Mark Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
