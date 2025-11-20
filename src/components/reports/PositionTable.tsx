import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Position } from '@/types/reports';

interface PositionTableProps {
  positions: Position[];
  onViewDetails: (position: Position) => void;
}

export function PositionTable({ positions, onViewDetails }: PositionTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">สรุปตำแหน่ง</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead className="text-right">ผู้สมัครทั้งหมด</TableHead>
              <TableHead className="text-right">สัมภาษณ์แล้ว</TableHead>
              <TableHead className="text-right">ผ่าน</TableHead>
              <TableHead className="text-right">ไม่ผ่าน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การทำงาน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((position) => (
              <TableRow 
                key={position.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewDetails(position)}
              >
                <TableCell className="font-medium">{position.title}</TableCell>
                <TableCell>{position.department}</TableCell>
                <TableCell className="text-right">{position.applicants}</TableCell>
                <TableCell className="text-right">{position.interviewed}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">{position.passed}</TableCell>
                <TableCell className="text-right text-red-600 font-medium">{position.failed}</TableCell>
                <TableCell>
                  <Badge variant={position.status === 'เปิดรับ' ? 'default' : 'secondary'}>
                    {position.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(position);
                    }}
                  >
                    ดูรายละเอียด
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
