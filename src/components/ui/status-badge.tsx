
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-gradient-to-r from-green-50 to-green-100 text-status-active border border-green-200";
      case "pending":
        return "bg-gradient-to-r from-amber-50 to-amber-100 text-status-pending border border-amber-200";
      case "overdue":
        return "bg-gradient-to-r from-red-50 to-red-100 text-status-overdue border border-red-200";
      case "occupied":
        return "bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700";
      case "partially occupied":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-status-partially-occupied border border-blue-200";
      case "available":
        return "bg-gradient-to-r from-green-50 to-green-100 text-status-available border border-green-200";
      case "billed":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-status-billed border border-blue-200";
      case "paid":
        return "bg-gradient-to-r from-green-50 to-green-100 text-status-paid border border-green-200";
      // PG User statuses
      case "new":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200";
      case "contacted":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200";
      case "visited":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200";
      case "interested":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200";
      case "not_interested":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200";
      case "waitlisted":
        return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border border-orange-200";
      case "confirmed":
        return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200";
      case "rejected":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const baseClasses = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm";

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={cn(baseClasses, getStatusStyles(), className)}>
      {formatStatus(status)}
    </span>
  );
}
