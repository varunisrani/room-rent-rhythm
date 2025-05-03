
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  to: string;
  description?: string;
}

export default function QuickAction({ icon, label, to, description }: QuickActionProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button 
        asChild 
        variant="outline" 
        className="w-full justify-between h-auto py-3 px-4 bg-white hover:bg-premium-50 border-premium-100 group"
      >
        <Link to={to} className="flex items-center">
          <div className="flex items-center">
            <div className="mr-3 p-2 bg-premium-100 rounded-lg text-premium-accent group-hover:bg-premium-accent group-hover:text-white transition-colors">
              {icon}
            </div>
            <div className="text-left">
              <span className="font-medium text-premium-800">{label}</span>
              {description && (
                <p className="text-xs text-premium-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-premium-400 group-hover:text-premium-accent transition-colors" />
        </Link>
      </Button>
    </motion.div>
  );
}
