import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle, XCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobRequisitions, JobRequisition } from "@/hooks/useJobRequisitions";
import { RequisitionDetailDialog } from "@/components/requisitions/RequisitionDetailDialog";
import { exportRequisitionsPDF } from "@/lib/exportRequisitionsPDF";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const JobRequisitions = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<JobRequisition | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const { requisitions, isLoading, createRequisition } = useJobRequisitions();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const userRoles = roles?.map(r => r.role) || [];
      setCanApprove(userRoles.includes("admin") || userRoles.includes("hr_manager"));
    };
    checkRole();
  }, []);

  const [formData, setFormData] = useState({
    department: "", position: "", quantity: "1", date_needed: "", work_location: "",
    reports_to: "", hiring_type: "permanent" as "replacement" | "permanent" | "temporary",
    replacement_for: "", replacement_date: "", temporary_duration: "", justification: "",
    job_description_no: "", gender: "", max_age: "", min_experience: "", min_education: "",
    field_of_study: "", other_skills: "", marital_status: "", experience_in: "",
  });

  const departments = ["Engineering", "Marketing", "Sales", "Human Resources", "Finance", "Operations"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department || !formData.position || !formData.date_needed || !formData.work_location || !formData.reports_to || !formData.justification) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", variant: "destructive" });
      return;
    }
    await createRequisition.mutateAsync({ ...formData, quantity: parseInt(formData.quantity) });
    setOpen(false);
    setFormData({ department: "", position: "", quantity: "1", date_needed: "", work_location: "", reports_to: "", hiring_type: "permanent", replacement_for: "", replacement_date: "", temporary_duration: "", justification: "", job_description_no: "", gender: "", max_age: "", min_experience: "", min_education: "", field_of_study: "", other_skills: "", marital_status: "", experience_in: "" });
  };

  const getStatusBadge = (status: string) => {
    const variants = { approved: "default", rejected: "destructive", pending: "secondary" } as const;
    const labels = { approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ", pending: "รอพิจารณา" };
    const Icon = status === "approved" ? CheckCircle : status === "rejected" ? XCircle : Clock;
    return <Badge variant={variants[status as keyof typeof variants]}><Icon className="h-4 w-4 mr-1" />{labels[status as keyof typeof labels]}</Badge>;
  };

  const getHiringTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      permanent: "พนักงานประจำ",
      temporary: "พนักงานชั่วคราว",
      replacement: "ทดแทนตำแหน่ง"
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">คำขออนุมัติอัตรากำลัง</h1><p className="text-muted-foreground mt-2">จัดการคำขออนุมัติตำแหน่งงานใหม่</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportRequisitionsPDF(requisitions)} disabled={requisitions.length === 0}><Download className="h-4 w-4 mr-2" />Export PDF</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />สร้างคำขอใหม่</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>สร้างคำขออนุมัติการจ้างงาน</DialogTitle><DialogDescription>กรอกข้อมูลเพื่อขออนุมัติเปิดตำแหน่งงานใหม่</DialogDescription></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลทั่วไป</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>ฝ่าย/แผนก *</Label><Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}><SelectTrigger><SelectValue placeholder="เลือกฝ่าย/แผนก" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>ตำแหน่งงาน *</Label><Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} /></div>
                    <div className="space-y-2"><Label>จำนวน *</Label><Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} /></div>
                    <div className="space-y-2"><Label>วันที่ต้องการ *</Label><Input type="date" value={formData.date_needed} onChange={(e) => setFormData({...formData, date_needed: e.target.value})} /></div>
                    <div className="space-y-2"><Label>สถานที่ *</Label><Input value={formData.work_location} onChange={(e) => setFormData({...formData, work_location: e.target.value})} /></div>
                    <div className="space-y-2"><Label>รายงานต่อ *</Label><Input value={formData.reports_to} onChange={(e) => setFormData({...formData, reports_to: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2"><Label>เหตุผล *</Label><Textarea value={formData.justification} onChange={(e) => setFormData({...formData, justification: e.target.value})} rows={4} /></div>
                </div>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button><Button type="submit" disabled={createRequisition.isPending}>บันทึกคำขอ</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>รายการคำขออนุมัติ</CardTitle><CardDescription>รายการคำขอทั้งหมด {requisitions.length} รายการ</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">กำลังโหลด...</div> : requisitions.length === 0 ? <div className="text-center py-8 text-muted-foreground">ยังไม่มีคำขออนุมัติ</div> : 
            <Table><TableHeader><TableRow><TableHead>เลขที่</TableHead><TableHead>แผนก</TableHead><TableHead>ตำแหน่ง</TableHead><TableHead>จำนวน</TableHead><TableHead>วันที่ต้องการ</TableHead><TableHead>ประเภท</TableHead><TableHead>สถานะ</TableHead><TableHead>ผู้ขอ</TableHead></TableRow></TableHeader>
              <TableBody>{requisitions.map((req) => <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedRequisition(req); setDetailOpen(true); }}><TableCell className="font-medium">{req.requisition_number}</TableCell><TableCell>{req.department}</TableCell><TableCell>{req.position}</TableCell><TableCell>{req.quantity}</TableCell><TableCell>{format(new Date(req.date_needed), "dd/MM/yyyy")}</TableCell><TableCell>{getHiringTypeLabel(req.hiring_type)}</TableCell><TableCell>{getStatusBadge(req.status)}</TableCell><TableCell>{req.requester?.name || "N/A"}</TableCell></TableRow>)}</TableBody>
            </Table>}
        </CardContent>
      </Card>
      <RequisitionDetailDialog requisition={selectedRequisition} open={detailOpen} onOpenChange={setDetailOpen} canApprove={canApprove} />
    </div>
  );
};

export default JobRequisitions;