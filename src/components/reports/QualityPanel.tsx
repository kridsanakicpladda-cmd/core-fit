import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, Star } from 'lucide-react';
import { Quality } from '@/types/reports';

interface QualityPanelProps {
  data: Quality;
  onViewDetails: () => void;
}

export function QualityPanel({ data, onViewDetails }: QualityPanelProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">คุณภาพผู้สมัคร</h3>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          ดูรายละเอียด
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="h-4 w-4" />
            <span className="text-sm">AI Fit Score เฉลี่ย</span>
          </div>
          <p className="text-3xl font-bold">{data.aiFitScoreAvg}</p>
          <p className="text-sm text-muted-foreground">คะแนน 0-100</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">ผ่านการสัมภาษณ์</span>
          </div>
          <p className="text-3xl font-bold">{(data.interviewPassRate * 100).toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Interview Pass Rate</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4" />
            <span className="text-sm">ความพึงพอใจ HR</span>
          </div>
          <p className="text-3xl font-bold">{data.hrSatisfaction.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">คะแนน 0-5</p>
        </div>
      </div>
    </Card>
  );
}
