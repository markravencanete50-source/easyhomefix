import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { 
  TicketStatus, 
  Priority, 
  MaintenanceCategory, 
  UserRole,
  TradeType 
} from "@/types";
import { 
  Wrench, 
  Zap, 
  Flame, 
  Home, 
  Bug, 
  Hammer, 
  Tv, 
  HelpCircle 
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  if (!date) return "N/A";
  return format(new Date(date), "MMM d, yyyy");
}

export function timeAgo(date: string | Date) {
  if (!date) return "N/A";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
  reopened: "Reopened",
  escalated: "Escalated",
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  under_review: "bg-amber-100 text-amber-700 border-amber-200",
  assigned: "bg-purple-100 text-purple-700 border-purple-200",
  scheduled: "bg-indigo-100 text-indigo-700 border-indigo-200",
  in_progress: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
  reopened: "bg-orange-100 text-orange-700 border-orange-200",
  escalated: "bg-red-100 text-red-700 border-red-200",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  emergency: "Emergency",
};

export const PRIORITY_BADGE_COLORS: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  emergency: "bg-red-100 text-red-700 border-red-200",
};

export const CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  heating: "Heating & AC",
  roofing: "Roofing",
  pest_control: "Pest Control",
  general_repair: "General Repair",
  appliance: "Appliance",
  other: "Other",
};

export const CATEGORY_ICONS: Record<MaintenanceCategory, any> = {
  plumbing: Wrench,
  electrical: Zap,
  heating: Flame,
  roofing: Home,
  pest_control: Bug,
  general_repair: Hammer,
  appliance: Tv,
  other: HelpCircle,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  tenant: "Tenant",
  property_manager: "Property Manager",
  contractor: "Contractor",
  admin: "Administrator",
};

export const TRADE_TYPE_LABELS: Record<TradeType, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  heating: "Heating & AC",
  roofing: "Roofing",
  pest_control: "Pest Control",
  general_repair: "General Repair",
  appliance: "Appliance",
  other: "Other",
};

export const NEXT_STATUS: Record<TicketStatus, TicketStatus[]> = {
  submitted: ["under_review", "closed"],
  under_review: ["assigned", "closed"],
  assigned: ["scheduled", "in_progress", "under_review"],
  scheduled: ["in_progress", "assigned"],
  in_progress: ["completed", "assigned"],
  completed: ["closed", "reopened"],
  closed: ["reopened"],
  reopened: ["under_review"],
  escalated: ["under_review", "assigned", "closed"],
};
