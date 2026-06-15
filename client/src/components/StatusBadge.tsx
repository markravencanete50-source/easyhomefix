import { cn } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "../../../shared/types";
import { TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from "../../../shared/types";

const statusStyles: Record<TicketStatus, string> = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  under_review: "bg-amber-100 text-amber-700 border-amber-200",
  assigned: "bg-purple-100 text-purple-700 border-purple-200",
  in_progress: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const priorityStyles: Record<TicketPriority, string> = {
  emergency: "bg-red-100 text-red-700 border-red-200 border-l-4 border-l-red-500",
  high: "bg-orange-100 text-orange-700 border-orange-200 border-l-4 border-l-orange-500",
  medium: "bg-teal-100 text-teal-700 border-teal-200 border-l-4 border-l-teal-500",
  low: "bg-gray-100 text-gray-600 border-gray-200 border-l-4 border-l-gray-400",
};

const statusDot: Record<TicketStatus, string> = {
  submitted: "bg-blue-500",
  under_review: "bg-amber-500",
  assigned: "bg-purple-500",
  in_progress: "bg-teal-500",
  completed: "bg-green-500",
  closed: "bg-gray-400",
};

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", statusDot[status])} />
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border",
        priorityStyles[priority],
        className
      )}
    >
      {TICKET_PRIORITY_LABELS[priority]}
    </span>
  );
}

// Status stepper for ticket detail view
const STATUS_STEPS: TicketStatus[] = ["submitted", "under_review", "assigned", "in_progress", "completed", "closed"];

interface StatusStepperProps {
  currentStatus: TicketStatus;
}

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  isCompleted && "bg-teal-500 border-teal-500 text-white",
                  isCurrent && "bg-teal-600 border-teal-600 text-white ring-4 ring-teal-100",
                  isPending && "bg-white border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-medium text-center leading-tight hidden sm:block",
                isCurrent && "text-teal-600",
                isCompleted && "text-teal-500",
                isPending && "text-gray-400"
              )}>
                {TICKET_STATUS_LABELS[step]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-1 transition-all",
                i < currentIndex ? "bg-teal-500" : "bg-gray-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
