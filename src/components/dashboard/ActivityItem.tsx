
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  time: string;
  highlight?: boolean;
}

export default function ActivityItem({ icon, title, description, time, highlight = false }: ActivityItemProps) {
  return (
    <motion.div 
      className={cn(
        "flex items-start gap-4 py-4 border-b last:border-b-0 hover:bg-premium-50 transition-colors rounded-md px-2",
        highlight && "bg-premium-50/50"
      )}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full",
        highlight ? "bg-premium-accent text-white" : "bg-premium-100 text-premium-700"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-premium-900">{title}</h4>
        <p className="text-sm text-premium-600">{description}</p>
      </div>
      <div className="text-xs bg-premium-50 text-premium-500 px-2 py-1 rounded-full">{time}</div>
    </motion.div>
  );
}
