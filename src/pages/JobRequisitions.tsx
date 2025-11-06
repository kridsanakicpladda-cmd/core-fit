import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Requisition {
  id: string;
  department: string;
  position: string;
  quantity: number;
  dateNeeded: string;
  workLocation: string;
  reportsTo: string;
  hiringType: "replacement" | "permanent" | "temporary";
  replacementFor?: string;
  replacementDate?: string;
  temporaryDuration?: string;
  justification: string;
  jobDescriptionNo?: string;
  gender?: string;
  maxAge?: string;
  minExperience?: string;
  minEducation?: string;
  fieldOfStudy?: string;
  otherSkills?: string;
  maritalStatus?: string;
  experienceIn?: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
}

const JobRequisitions = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [requisitions, setRequisitions] = useState<Requisition[]>([
    {
      id: "REQ-001",
      department: "Engineering",
      position: "Senior Software Engineer",
      quantity: 2,
      dateNeeded: "2024-02-01",
      workLocation: "กรุงเทพฯ",
      reportsTo: "CTO",
      hiringType: "permanent",
      justification: "ขยายทีมพัฒนาผลิตภัณฑ์ใหม่",
      minEducation: "ปริญญาตรี",
      fieldOfStudy: "วิทยาการคอมพิวเตอร์",
      minExperience: "3",
      requestDate: "2024-01-15",
      status: "Approved",
      requestedBy: "สมชาย ใจดี",
    },
    {
      id: "REQ-002",
      department: "Marketing",
      position: "Marketing Manager",
      quantity: 1,
      dateNeeded: "2024-02-15",
      workLocation: "กรุงเทพฯ",
      reportsTo: "CMO",
      hiringType: "permanent",
      justification: "เตรียมความพร้อมสำหรับแคมเปญใหม่",
      minEducation: "ปริญญาตรี",
      fieldOfStudy: "การตลาด",
      minExperience: "5",
      requestDate: "2024-01-20",
      status: "Pending",
      requestedBy: "สมหญิง รักงาน",
    },
  ]);

  const [formData, setFormData] = useState({
    department: "",
    position: "",
    quantity: "1",
    dateNeeded: "",
    workLocation: "",
    reportsTo: "",
    hiringType: "permanent" as "replacement" | "permanent" | "temporary",
    replacementFor: "",
    replacementDate: "",
    temporaryDuration: "",
    justification: "",
    jobDescriptionNo: "",
    gender: "",
    maxAge: "",
    minExperience: "",
    minEducation: "",
    fieldOfStudy: "",
    otherSkills: "",
    maritalStatus: "",
    experienceIn: "",
    requestedBy: "",
  });

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance",
    "Operations",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department || !formData.position || !formData.dateNeeded || !formData.workLocation || !formData.reportsTo || !formData.justification || !formData.requestedBy) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกข้อมูลทุกช่องที่มีเครื่องหมาย *",
        variant: "destructive",
      });
      return;
    }

    const newRequisition: Requisition = {
      id: `REQ-${String(requisitions.length + 1).padStart(3, "0")}`,
      department: formData.department,
      position: formData.position,
      quantity: parseInt(formData.quantity),
      dateNeeded: formData.dateNeeded,
      workLocation: formData.workLocation,
      reportsTo: formData.reportsTo,
      hiringType: formData.hiringType,
      replacementFor: formData.replacementFor,
      replacementDate: formData.replacementDate,
      temporaryDuration: formData.temporaryDuration,
      justification: formData.justification,
      jobDescriptionNo: formData.jobDescriptionNo,
      gender: formData.gender,
      maxAge: formData.maxAge,
      minExperience: formData.minExperience,
      minEducation: formData.minEducation,
      fieldOfStudy: formData.fieldOfStudy,
      otherSkills: formData.otherSkills,
      maritalStatus: formData.maritalStatus,
      experienceIn: formData.experienceIn,
      requestDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      requestedBy: formData.requestedBy,
    };

    setRequisitions([newRequisition, ...requisitions]);
    setOpen(false);
    
    toast({
      title: "ส่งคำขออนุมัติสำเร็จ",
      description: `คำขออัตรากำลังสำหรับตำแหน่ง ${formData.position} ถูกส่งให้ CEO พิจารณาแล้ว`,
    });

    // Reset form
    setFormData({
      department: "",
      position: "",
      quantity: "1",
      dateNeeded: "",
      workLocation: "",
      reportsTo: "",
      hiringType: "permanent",
      replacementFor: "",
      replacementDate: "",
      temporaryDuration: "",
      justification: "",
      jobDescriptionNo: "",
      gender: "",
      maxAge: "",
      minExperience: "",
      minEducation: "",
      fieldOfStudy: "",
      otherSkills: "",
      maritalStatus: "",
      experienceIn: "",
      requestedBy: "",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "secondary",
      Approved: "default",
      Rejected: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="gap-1">
        {getStatusIcon(status)}
        {status === "Pending" ? "รออนุมัติ" : status === "Approved" ? "อนุมัติ" : "ไม่อนุมัติ"}
      </Badge>
    );
  };

  const getHiringTypeLabel = (type: string) => {
    switch (type) {
      case "replacement":
        return "ตำแหน่งทดแทน";
      case "permanent":
        return "ตำแหน่งประจำที่ขอเพิ่ม";
      case "temporary":
        return "ตำแหน่งชั่วคราว";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">คำขออนุมัติอัตรากำลัง</h1>
          <p className="text-muted-foreground mt-2">
            จัดการคำขออนุมัติตำแหน่งงานใหม่
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              สร้างคำขอใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้างคำขออนุมัติอัตรากำลัง</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลเพื่อขออนุมัติเปิดตำแหน่งงานใหม่
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* ข้อมูลทั่วไป */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลทั่วไป</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      ฝ่าย/แผนก <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData({ ...formData, department: value })
                      }
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="เลือกฝ่าย/แผนก" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">
                      ตำแหน่งงานที่ต้องการ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      placeholder="เช่น Senior Software Engineer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      จำนวนที่ต้องการ (อัตรา) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateNeeded">
                      วันที่ต้องการ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dateNeeded"
                      type="date"
                      value={formData.dateNeeded}
                      onChange={(e) =>
                        setFormData({ ...formData, dateNeeded: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workLocation">
                      สถานที่ทำงาน <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="workLocation"
                      value={formData.workLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, workLocation: e.target.value })
                      }
                      placeholder="เช่น กรุงเทพฯ"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportsTo">
                    รายงานโดยตรงต่อ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reportsTo"
                    value={formData.reportsTo}
                    onChange={(e) =>
                      setFormData({ ...formData, reportsTo: e.target.value })
                    }
                    placeholder="เช่น ผู้จัดการฝ่าย, CEO"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedBy">
                    ผู้ขออนุมัติ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="requestedBy"
                    value={formData.requestedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, requestedBy: e.target.value })
                    }
                    placeholder="ชื่อ-นามสกุล"
                  />
                </div>
              </div>

              {/* ประเภทและเหตุผลของการจ้าง */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">ประเภท / เหตุผลของการจ้าง</h3>
                
                <div className="space-y-3">
                  <Label>ประเภทการจ้าง <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.hiringType}
                    onValueChange={(value: "replacement" | "permanent" | "temporary") =>
                      setFormData({ ...formData, hiringType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replacement">ตำแหน่งทดแทน</SelectItem>
                      <SelectItem value="permanent">ตำแหน่งประจำที่ขอเพิ่ม</SelectItem>
                      <SelectItem value="temporary">ตำแหน่งชั่วคราว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.hiringType === "replacement" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="replacementFor">ทดแทนใคร</Label>
                      <Input
                        id="replacementFor"
                        value={formData.replacementFor}
                        onChange={(e) =>
                          setFormData({ ...formData, replacementFor: e.target.value })
                        }
                        placeholder="ชื่อพนักงานที่จะทดแทน"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="replacementDate">วันที่ออก</Label>
                      <Input
                        id="replacementDate"
                        type="date"
                        value={formData.replacementDate}
                        onChange={(e) =>
                          setFormData({ ...formData, replacementDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {formData.hiringType === "temporary" && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="temporaryDuration">ระยะเวลาการจ้าง</Label>
                    <Input
                      id="temporaryDuration"
                      value={formData.temporaryDuration}
                      onChange={(e) =>
                        setFormData({ ...formData, temporaryDuration: e.target.value })
                      }
                      placeholder="เช่น 6 เดือน, 1 ปี"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="justification">
                    เหตุผลในการขอเพิ่ม <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="justification"
                    value={formData.justification}
                    onChange={(e) =>
                      setFormData({ ...formData, justification: e.target.value })
                    }
                    placeholder="อธิบายเหตุผลความจำเป็นในการเปิดรับตำแหน่งนี้..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescriptionNo">Job Description No.</Label>
                  <Input
                    id="jobDescriptionNo"
                    value={formData.jobDescriptionNo}
                    onChange={(e) =>
                      setFormData({ ...formData, jobDescriptionNo: e.target.value })
                    }
                    placeholder="หากยังไม่มี กรุณาจัดทำและแนบมาด้วย"
                  />
                </div>
              </div>

              {/* คุณสมบัติเบื้องต้น */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">คุณสมบัติเบื้องต้น</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">เพศ</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ชาย</SelectItem>
                        <SelectItem value="female">หญิง</SelectItem>
                        <SelectItem value="any">ไม่ระบุ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAge">อายุไม่เกิน (ปี)</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      value={formData.maxAge}
                      onChange={(e) =>
                        setFormData({ ...formData, maxAge: e.target.value })
                      }
                      placeholder="40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">สถานะสมรส</Label>
                    <Select
                      value={formData.maritalStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, maritalStatus: value })
                      }
                    >
                      <SelectTrigger id="maritalStatus">
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">โสด</SelectItem>
                        <SelectItem value="married">สมรส</SelectItem>
                        <SelectItem value="any">ไม่ระบุ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minEducation">วุฒิการศึกษาขั้นต่ำ</Label>
                    <Select
                      value={formData.minEducation}
                      onValueChange={(value) =>
                        setFormData({ ...formData, minEducation: value })
                      }
                    >
                      <SelectTrigger id="minEducation">
                        <SelectValue placeholder="เลือกวุฒิการศึกษา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="มัธยมศึกษา">มัธยมศึกษา</SelectItem>
                        <SelectItem value="ปวช.">ปวช.</SelectItem>
                        <SelectItem value="ปวส.">ปวส.</SelectItem>
                        <SelectItem value="ปริญญาตรี">ปริญญาตรี</SelectItem>
                        <SelectItem value="ปริญญาโท">ปริญญาโท</SelectItem>
                        <SelectItem value="ปริญญาเอก">ปริญญาเอก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldOfStudy">สาขาวิชา</Label>
                    <Input
                      id="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={(e) =>
                        setFormData({ ...formData, fieldOfStudy: e.target.value })
                      }
                      placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minExperience">ประสบการณ์ขั้นต่ำ (ปี)</Label>
                    <Input
                      id="minExperience"
                      type="number"
                      value={formData.minExperience}
                      onChange={(e) =>
                        setFormData({ ...formData, minExperience: e.target.value })
                      }
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceIn">ประสบการณ์ด้าน</Label>
                    <Input
                      id="experienceIn"
                      value={formData.experienceIn}
                      onChange={(e) =>
                        setFormData({ ...formData, experienceIn: e.target.value })
                      }
                      placeholder="เช่น การพัฒนาซอฟต์แวร์"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherSkills">ความสามารถ / ความชำนาญอื่น</Label>
                  <Textarea
                    id="otherSkills"
                    value={formData.otherSkills}
                    onChange={(e) =>
                      setFormData({ ...formData, otherSkills: e.target.value })
                    }
                    placeholder="เช่น ภาษาอังกฤษ, คอมพิวเตอร์, พิมพ์ดีด, มีรถยนต์, ทำงานต่างจังหวัดได้"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">ส่งคำขออนุมัติ</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการคำขออนุมัติ</CardTitle>
          <CardDescription>
            ติดตามสถานะคำขออนุมัติอัตรากำลังทั้งหมด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>แผนก</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>วันที่ต้องการ</TableHead>
                <TableHead>วันที่ขอ</TableHead>
                <TableHead>ผู้ขอ</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>{req.position}</TableCell>
                  <TableCell>{req.department}</TableCell>
                  <TableCell>{req.quantity} อัตรา</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getHiringTypeLabel(req.hiringType)}</Badge>
                  </TableCell>
                  <TableCell>{new Date(req.dateNeeded).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell>{new Date(req.requestDate).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell>{req.requestedBy}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobRequisitions;
