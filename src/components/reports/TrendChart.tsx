import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: Array<{ date: string; applicants: number; interviewed: number; hired: number }>;
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">แนวโน้มใบสมัคร</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-sm"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-sm"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="applicants" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="ผู้สมัคร"
            dot={{ fill: '#3B82F6', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="interviewed" 
            stroke="#10B981" 
            strokeWidth={2}
            name="สัมภาษณ์"
            dot={{ fill: '#10B981', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="hired" 
            stroke="#F59E0B" 
            strokeWidth={2}
            name="รับเข้าทำงาน"
            dot={{ fill: '#F59E0B', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
