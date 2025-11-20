import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StageStats } from '@/types/reports';

interface StatusDonutProps {
  data: StageStats;
}

const COLORS = {
  applicants: '#3B82F6',
  screening: '#10B981',
  interview: '#F59E0B',
  offer: '#8B5CF6',
  hired: '#22C55E',
  rejected: '#EF4444'
};

export function StatusDonut({ data }: StatusDonutProps) {
  const chartData = [
    { name: 'ใหม่', value: data.applicants - data.screening, color: COLORS.applicants },
    { name: 'คัดกรอง', value: data.screening - data.interview, color: COLORS.screening },
    { name: 'สัมภาษณ์', value: data.interview - data.offer, color: COLORS.interview },
    { name: 'ข้อเสนอ', value: data.offer - data.hired, color: COLORS.offer },
    { name: 'รับเข้าทำงาน', value: data.hired, color: COLORS.hired },
    { name: 'ไม่ผ่าน', value: data.rejected, color: COLORS.rejected }
  ].filter(item => item.value > 0);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">สถานะผู้สมัครปัจจุบัน</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
