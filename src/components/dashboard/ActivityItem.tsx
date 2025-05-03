
import { ReactNode } from "react";

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  time: string;
}

export default function ActivityItem({ icon, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </div>
  );
}
