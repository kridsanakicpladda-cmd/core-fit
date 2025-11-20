import { Card } from '@/components/ui/card';
import { StageStats } from '@/types/reports';
import { ArrowRight } from 'lucide-react';

interface RecruitmentFunnelProps {
  data: StageStats;
  onStageClick?: (stage: string) => void;
}

export function RecruitmentFunnel({ data, onStageClick }: RecruitmentFunnelProps) {
  const stages = [
    { label: 'ผู้สมัคร', value: data.applicants, key: 'applicants' },
    { label: 'คัดกรอง', value: data.screening, key: 'screening' },
    { label: 'สัมภาษณ์', value: data.interview, key: 'interview' },
    { label: 'ข้อเสนอ', value: data.offer, key: 'offer' },
    { label: 'รับเข้าทำงาน', value: data.hired, key: 'hired' }
  ];

  const maxValue = data.applicants;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Recruitment Funnel</h3>
      
      <div className="space-y-6">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const conversionRate = index > 0 ? ((stage.value / stages[index - 1].value) * 100).toFixed(1) : '100.0';
          
          return (
            <div key={stage.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{stage.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
                {index > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-green-600">{conversionRate}%</span>
                  </div>
                )}
              </div>
              
              <div 
                className="h-12 bg-primary rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center px-4"
                style={{ width: `${percentage}%` }}
                onClick={() => onStageClick?.(stage.key)}
              >
                <span className="text-primary-foreground font-medium">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          อัตราความสำเร็จโดยรวม: <span className="font-bold text-foreground">{((data.hired / data.applicants) * 100).toFixed(1)}%</span>
        </p>
      </div>
    </Card>
  );
}
