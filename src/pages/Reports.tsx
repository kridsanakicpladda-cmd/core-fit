import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Briefcase, TrendingUp, ArrowUp, Users, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Position {
  id: string;
  title: string;
  department: string;
  startDate: string;
  endDate?: string;
  daysToHire: number;
  status: "open" | "filled" | "closed";
  applicants: number;
}

export default function Reports() {
  const [positions] = useState<Position[]>([
    {
      id: "1",
      title: "Senior Software Engineer",
      department: "วิศวกรรม",
      startDate: "2024-01-15",
      endDate: "2024-02-28",
      daysToHire: 44,
      status: "filled",
      applicants: 124
    },
    {
      id: "2",
      title: "Product Manager",
      department: "ผลิตภัณฑ์",
      startDate: "2024-02-01",
      endDate: "2024-03-10",
      daysToHire: 38,
      status: "filled",
      applicants: 89
    },
    {
      id: "3",
      title: "UX Designer",
      department: "ออกแบบ",
      startDate: "2024-02-15",
      endDate: "2024-03-20",
      daysToHire: 34,
      status: "filled",
      applicants: 67
    },
    {
      id: "4",
      title: "Data Analyst",
      department: "วิเคราะห์ข้อมูล",
      startDate: "2024-03-01",
      daysToHire: 18,
      status: "open",
      applicants: 45
    },
    {
      id: "5",
      title: "Marketing Manager",
      department: "การตลาด",
      startDate: "2024-03-10",
      daysToHire: 12,
      status: "open",
      applicants: 32
    },
    {
      id: "6",
      title: "DevOps Engineer",
      department: "วิศวกรรม",
      startDate: "2024-01-20",
      endDate: "2024-03-05",
      daysToHire: 45,
      status: "filled",
      applicants: 56
    }
  ]);

  const handleExport = () => {
    // Prepare CSV data
    const csvHeaders = ["ตำแหน่ง", "แผนก", "วันเริ่มต้น", "วันสิ้นสุด", "ระยะเวลา (วัน)", "สถานะ", "ผู้สมัคร"];
    const csvRows = positions.map(pos => [
      pos.title,
      pos.department,
      pos.startDate,
      pos.endDate || "-",
      pos.daysToHire.toString(),
      pos.status === "filled" ? "เต็มแล้ว" : pos.status === "open" ? "เปิดรับ" : "ปิด",
      pos.applicants.toString()
    ]);
    
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `recruitment-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const avgDaysToHire = positions
    .filter(p => p.status === "filled")
    .reduce((sum, p) => sum + p.daysToHire, 0) / positions.filter(p => p.status === "filled").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">รายงาน</h1>
          <p className="text-muted-foreground">รายงานและข้อมูลเชิงลึก</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          ส่งออกรายงาน
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ผู้สมัครทั้งหมด
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">1,234</div>
            <div className="flex items-center text-xs">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-muted-foreground ml-1">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 opacity-10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ตำแหน่งเปิดรับ
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">45</div>
            <div className="flex items-center text-xs">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+5.2%</span>
              <span className="text-muted-foreground ml-1">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 opacity-10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              อัตราจ้างงาน
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">85%</div>
            <div className="flex items-center text-xs">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+3.1%</span>
              <span className="text-muted-foreground ml-1">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ประสิทธิภาพการจ้างงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">เวลาเฉลี่ยในการจ้างงาน</span>
                <span className="font-bold">{Math.round(avgDaysToHire)} วัน</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">อัตราการยอมรับ</span>
                <span className="font-bold">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ต้นทุนต่อการจ้าง</span>
                <span className="font-bold">฿45,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>คุณภาพผู้สมัคร</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">AI Fit Score เฉลี่ย</span>
                <span className="font-bold">78/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ผ่านการสัมภาษณ์</span>
                <span className="font-bold">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ความพึงพอใจ HR</span>
                <span className="font-bold">4.5/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">ระยะเวลาการสรรหาของแต่ละตำแหน่ง</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">รายละเอียดระยะเวลาในการสรรหาบุคลากรแต่ละตำแหน่ง</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
            <Clock className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>แผนก</TableHead>
                  <TableHead className="text-center">วันเริ่มต้น</TableHead>
                  <TableHead className="text-center">วันสิ้นสุด</TableHead>
                  <TableHead className="text-center">ระยะเวลา</TableHead>
                  <TableHead className="text-center">ผู้สมัคร</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>{position.department}</TableCell>
                    <TableCell className="text-center">
                      {new Date(position.startDate).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {position.endDate 
                        ? new Date(position.endDate).toLocaleDateString('th-TH', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{position.daysToHire} วัน</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{position.applicants}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={
                          position.status === "filled" 
                            ? "default" 
                            : position.status === "open" 
                            ? "secondary" 
                            : "outline"
                        }
                      >
                        {position.status === "filled" 
                          ? "เต็มแล้ว" 
                          : position.status === "open" 
                          ? "เปิดรับ" 
                          : "ปิด"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>เวลาเฉลี่ยในการสรรหา (ตำแหน่งที่เต็มแล้ว): <span className="font-semibold text-foreground">{Math.round(avgDaysToHire)} วัน</span></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
