import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  mom: number;
  icon: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, mom, icon, tooltip, onClick }: StatCardProps) {
  const isPositive = mom >= 0;
  const momPercentage = (mom * 100).toFixed(1);

  return (
    <Card
      className={cn(
        "p-6 relative overflow-hidden cursor-pointer transition-all hover:shadow-lg",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
      title={tooltip}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <ArrowUp className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              "font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? '+' : ''}{momPercentage}%
            </span>
            <span className="text-muted-foreground">vs เดือนก่อน</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 opacity-50" />
          <div className="relative z-10 p-3 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Mini sparkline placeholder */}
      <div className="mt-4 h-8 flex items-end gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/20 rounded-sm"
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
