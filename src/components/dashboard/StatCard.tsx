
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  className
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden premium-card", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-premium-600">{title}</p>
            <h3 className="text-2xl font-bold mt-2 text-premium-900">{value}</h3>
            
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <div 
                  className={cn(
                    "flex items-center text-xs font-medium rounded-full px-1.5 py-0.5",
                    trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {trendValue}
                </div>
              )}
              {subtitle && <p className="text-xs text-premium-500">{subtitle}</p>}
            </div>
          </div>
          {icon && (
            <div className="bg-premium-100 p-3 rounded-lg text-premium-accent">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
