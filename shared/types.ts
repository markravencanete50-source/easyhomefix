export type UserRole = "tenant" | "manager" | "contractor" | "admin";
export type TicketStatus = "submitted" | "under_review" | "assigned" | "in_progress" | "completed" | "closed";
export type TicketPriority = "emergency" | "high" | "medium" | "low";
export type TicketCategory = "plumbing" | "electrical" | "hvac" | "structural" | "appliance" | "pest_control" | "cleaning" | "security" | "other";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};

export const TICKET_STATUS_ORDER: TicketStatus[] = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "completed",
  "closed",
];

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  emergency: "Emergency",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  structural: "Structural",
  appliance: "Appliance",
  pest_control: "Pest Control",
  cleaning: "Cleaning",
  security: "Security",
  other: "Other",
};
