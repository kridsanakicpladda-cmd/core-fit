import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, DollarSign } from 'lucide-react';
import { Efficiency } from '@/types/reports';

interface EfficiencyPanelProps {
  data: Efficiency;
  onViewDetails: () => void;
}

export function EfficiencyPanel({ data, onViewDetails }: EfficiencyPanelProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">ประสิทธิภาพการจ้างงาน</h3>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          ดูรายละเอียด
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">เวลาเฉลี่ยในการจ้างงาน</span>
          </div>
          <p className="text-3xl font-bold">{data.timeToHireAvg}</p>
          <p className="text-sm text-muted-foreground">วัน</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">อัตราการยอมรับข้อเสนอ</span>
          </div>
          <p className="text-3xl font-bold">{(data.acceptanceRate * 100).toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Offer Acceptance</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">ต้นทุนต่อการจ้าง</span>
          </div>
          <p className="text-3xl font-bold">฿{data.costPerHire.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Cost per Hire</p>
        </div>
      </div>
    </Card>
  );
}
