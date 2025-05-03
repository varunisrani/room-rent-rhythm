
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-status-active";
      case "pending":
        return "bg-amber-100 text-status-pending";
      case "overdue":
        return "bg-red-100 text-status-overdue";
      case "occupied":
        return "bg-gray-900 text-white";
      case "partially occupied":
        return "bg-blue-100 text-status-partially-occupied";
      case "available":
        return "bg-green-100 text-status-available";
      case "billed":
        return "bg-blue-100 text-status-billed";
      case "paid":
        return "bg-green-100 text-status-paid";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";

  return (
    <span className={cn(baseClasses, getStatusStyles(), className)}>
      {status}
    </span>
  );
}
