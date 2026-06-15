// ============================================================
// FixFlow — Property Maintenance Management Platform
// TypeScript Interfaces & Type Definitions
// ============================================================

// ─── User Roles ──────────────────────────────────────────────
export type UserRole = 'tenant' | 'property_manager' | 'contractor' | 'admin';

// ─── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  fcmToken?: string;
}

// ─── Tenant ──────────────────────────────────────────────────
export interface Tenant extends User {
  role: 'tenant';
  propertyId?: string;
  unitNumber?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
}

// ─── Property Manager ────────────────────────────────────────
export interface PropertyManager extends User {
  role: 'property_manager';
  managedPropertyIds: string[];
  companyName?: string;
}

// ─── Contractor ──────────────────────────────────────────────
export interface Contractor extends User {
  role: 'contractor';
  companyName: string;
  contactName: string;
  tradeTypes: TradeType[];
  phone: string;
  email: string;
  performanceRating: number;
  totalJobsCompleted: number;
  isAvailable: boolean;
  licenseNumber?: string;
  insuranceInfo?: string;
}

export type TradeType =
  | 'plumbing'
  | 'electrical'
  | 'heating'
  | 'roofing'
  | 'pest_control'
  | 'general_repair'
  | 'appliance'
  | 'other';

// ─── Property ────────────────────────────────────────────────
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  managerId: string;
  totalUnits: number;
  propertyType: 'apartment' | 'house' | 'commercial' | 'condo';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ─── Tenancy ─────────────────────────────────────────────────
export interface Tenancy {
  id: string;
  tenantId: string;
  propertyId: string;
  unitNumber: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Maintenance Category ────────────────────────────────────
export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'heating'
  | 'roofing'
  | 'pest_control'
  | 'general_repair'
  | 'appliance'
  | 'other';

// ─── Priority ────────────────────────────────────────────────
export type Priority = 'emergency' | 'high' | 'medium' | 'low';

// ─── Ticket Status ───────────────────────────────────────────
export type TicketStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'reopened'
  | 'escalated';

// ─── Maintenance Ticket ──────────────────────────────────────
export interface MaintenanceTicket {
  id: string;
  ticketNumber: string; // MT-YYYY-000001
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitNumber?: string;
  category: MaintenanceCategory;
  priority: Priority;
  status: TicketStatus;
  title: string;
  description: string;
  voiceMessageUrl?: string;
  attachments: Attachment[];
  assignedContractorId?: string;
  assignedContractorName?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  issueDuration: 'today' | '1_3_days' | '1_week' | 'more_than_1_week';
  contractorAccess: 'yes' | 'no' | 'contact_first';
  isEmergency: boolean;
  isEscalated: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  resolvedAt?: string;
  estimatedCompletionDate?: string;
  notes?: string;
  managerNotes?: string;
  contractorNotes?: string;
  workCompletionPhotos?: Attachment[];
}

// ─── Attachment ──────────────────────────────────────────────
export interface Attachment {
  id: string;
  ticketId: string;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  attachmentType: 'evidence' | 'before' | 'progress' | 'completion';
  createdAt: string;
}

// ─── Ticket Message ──────────────────────────────────────────
export type Message = TicketMessage; // Alias for convenience
export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  attachments?: Attachment[];
  voiceMessageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────
export type NotificationEvent =
  | 'ticket_submitted'
  | 'ticket_assigned'
  | 'contractor_scheduled'
  | 'status_updated'
  | 'new_message'
  | 'job_completed'
  | 'ticket_closed'
  | 'ticket_escalated'
  | 'ticket_reopened';

export interface Notification {
  id: string;
  userId: string;
  ticketId?: string;
  ticketNumber?: string;
  event: NotificationEvent;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ─── Activity Log ────────────────────────────────────────────
export interface ActivityLog {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
  details?: string;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────
export interface DashboardMetrics {
  openTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  overdueTickets: number;
  completedTickets: number;
  emergencyTickets: number;
  avgResolutionDays: number;
  totalThisMonth: number;
}

export interface CategoryBreakdown {
  category: MaintenanceCategory;
  count: number;
  percentage: number;
}

export interface ContractorPerformance {
  contractorId: string;
  contractorName: string;
  assignedJobs: number;
  completedJobs: number;
  avgRating: number;
  avgResolutionDays: number;
}

// ─── Settings ────────────────────────────────────────────────
export interface AppSettings {
  id: string;
  companyName: string;
  companyLogo?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoAssignContractors: boolean;
  overdueThresholdDays: number;
  emergencyContactPhone: string;
  updatedAt: string;
}

// ─── Auth Context ────────────────────────────────────────────
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  propertyId?: string;
  unitNumber?: string;
}

// ─── Form Types ──────────────────────────────────────────────
export interface MaintenanceRequestForm {
  propertyId: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  voiceMessage?: File;
  attachments: File[];
  issueDuration: 'today' | '1_3_days' | '1_week' | 'more_than_1_week';
  contractorAccess: 'yes' | 'no' | 'contact_first';
  priority: Priority;
}

// ─── Filter Types ────────────────────────────────────────────
export interface TicketFilters {
  status?: TicketStatus | 'all';
  priority?: Priority | 'all';
  propertyId?: string | 'all';
  contractorId?: string | 'all';
  category?: MaintenanceCategory | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ─── Contractor Job Update ───────────────────────────────────
export interface ContractorJobUpdate {
  ticketId: string;
  notes: string;
  beforePhotos?: File[];
  progressPhotos?: File[];
  completionPhotos?: File[];
  completionVideos?: File[];
  isCompleted: boolean;
}
