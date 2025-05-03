
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  to: string;
}

export default function QuickAction({ icon, label, to }: QuickActionProps) {
  return (
    <Button asChild variant="default" className="w-full justify-start h-auto py-3">
      <Link to={to} className="flex items-center">
        <div className="mr-3">{icon}</div>
        <span>{label}</span>
      </Link>
    </Button>
  );
}
