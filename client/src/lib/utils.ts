import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MaintenanceCategory, Priority, TicketStatus, TradeType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Status Helpers ───────────────────────────────────────────
export const STATUS_LABELS: Record<TicketStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Assigned',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  closed: 'Closed',
  reopened: 'Reopened',
  escalated: 'Escalated',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  submitted: 'bg-slate-100 text-slate-700 border-slate-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  in_progress: 'bg-teal-50 text-teal-700 border-teal-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  reopened: 'bg-orange-50 text-orange-700 border-orange-200',
  escalated: 'bg-red-50 text-red-700 border-red-200',
};

export const STATUS_DOT_COLORS: Record<TicketStatus, string> = {
  submitted: 'bg-slate-500',
  under_review: 'bg-blue-500',
  assigned: 'bg-indigo-500',
  scheduled: 'bg-purple-500',
  in_progress: 'bg-teal-500',
  completed: 'bg-green-500',
  closed: 'bg-gray-400',
  reopened: 'bg-orange-500',
  escalated: 'bg-red-500',
};

// ─── Priority Helpers ─────────────────────────────────────────
export const PRIORITY_LABELS: Record<Priority, string> = {
  emergency: 'Emergency',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  emergency: 'bg-red-50 text-red-700 border-red-300 border-l-4 border-l-red-500',
  high: 'bg-amber-50 text-amber-700 border-amber-300 border-l-4 border-l-amber-500',
  medium: 'bg-blue-50 text-blue-700 border-blue-300 border-l-4 border-l-blue-500',
  low: 'bg-slate-50 text-slate-600 border-slate-200 border-l-4 border-l-slate-400',
};

export const PRIORITY_BADGE_COLORS: Record<Priority, string> = {
  emergency: 'bg-red-100 text-red-700 border border-red-200',
  high: 'bg-amber-100 text-amber-700 border border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border border-blue-200',
  low: 'bg-slate-100 text-slate-600 border border-slate-200',
};

// ─── Category Helpers ─────────────────────────────────────────
export const CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  heating: 'Heating / HVAC',
  roofing: 'Roofing',
  pest_control: 'Pest Control',
  general_repair: 'General Repair',
  appliance: 'Appliance',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<MaintenanceCategory, string> = {
  plumbing: '🔧',
  electrical: '⚡',
  heating: '🌡️',
  roofing: '🏠',
  pest_control: '🐛',
  general_repair: '🔨',
  appliance: '🏪',
  other: '📋',
};

export const TRADE_TYPE_LABELS: Record<TradeType, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  heating: 'Heating / HVAC',
  roofing: 'Roofing',
  pest_control: 'Pest Control',
  general_repair: 'General Repair',
  appliance: 'Appliance',
  other: 'Other',
};

// ─── Date Helpers ─────────────────────────────────────────────
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

// ─── Ticket Number Generator ──────────────────────────────────
export const generateTicketNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999) + 1;
  return `MT-${year}-${String(random).padStart(6, '0')}`;
};

// ─── File Size Formatter ──────────────────────────────────────
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ─── Role Helpers ─────────────────────────────────────────────
export const ROLE_LABELS = {
  tenant: 'Tenant',
  property_manager: 'Property Manager',
  contractor: 'Contractor',
  admin: 'Administrator',
};

export const ROLE_COLORS = {
  tenant: 'bg-sky-100 text-sky-700',
  property_manager: 'bg-teal-100 text-teal-700',
  contractor: 'bg-amber-100 text-amber-700',
  admin: 'bg-purple-100 text-purple-700',
};

// ─── Workflow Stage Order ─────────────────────────────────────
export const WORKFLOW_STAGES: TicketStatus[] = [
  'submitted',
  'under_review',
  'assigned',
  'scheduled',
  'in_progress',
  'completed',
  'closed',
];

export const getWorkflowStageIndex = (status: TicketStatus): number => {
  return WORKFLOW_STAGES.indexOf(status);
};

// ─── Next Status Transitions ──────────────────────────────────
export const NEXT_STATUS: Partial<Record<TicketStatus, TicketStatus>> = {
  submitted: 'under_review',
  under_review: 'assigned',
  assigned: 'scheduled',
  scheduled: 'in_progress',
  in_progress: 'completed',
  completed: 'closed',
};
