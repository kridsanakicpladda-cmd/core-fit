import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Position } from '@/types/reports';

interface DepartmentBarChartProps {
  positions: Position[];
}

export function DepartmentBarChart({ positions }: DepartmentBarChartProps) {
  const departmentData = positions.reduce((acc, pos) => {
    const existing = acc.find(d => d.department === pos.department);
    if (existing) {
      existing.applicants += pos.applicants;
      existing.interviewed += pos.interviewed;
      existing.passed += pos.passed;
    } else {
      acc.push({
        department: pos.department,
        applicants: pos.applicants,
        interviewed: pos.interviewed,
        passed: pos.passed
      });
    }
    return acc;
  }, [] as Array<{ department: string; applicants: number; interviewed: number; passed: number }>);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">สถิติตามแผนก</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={departmentData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="department" 
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
          <Bar dataKey="applicants" fill="#3B82F6" name="ผู้สมัคร" />
          <Bar dataKey="interviewed" fill="#10B981" name="สัมภาษณ์" />
          <Bar dataKey="passed" fill="#F59E0B" name="ผ่าน" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
