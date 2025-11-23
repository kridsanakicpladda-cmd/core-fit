import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, User, Calendar, MapPin, Briefcase, FileText, Download } from "lucide-react";
import { JobRequisition, useRequisitionApprovals } from "@/hooks/useJobRequisitions";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequisitionDetailDialogProps {
  requisition: JobRequisition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canApprove?: boolean;
}

export const RequisitionDetailDialog = ({
  requisition,
  open,
  onOpenChange,
  canApprove = false,
}: RequisitionDetailDialogProps) => {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const { approvals, addApproval } = useRequisitionApprovals(requisition?.id || "");

  if (!requisition) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "default",
      rejected: "destructive",
      pending: "secondary",
    } as const;

    const labels = {
      approved: "อนุมัติแล้ว",
      rejected: "ไม่อนุมัติ",
      pending: "รอพิจารณา",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels]}</span>
      </Badge>
    );
  };

  const getHiringTypeLabel = (type: string) => {
    const labels = {
      permanent: "พนักงานประจำ",
      temporary: "พนักงานชั่วคราว",
      replacement: "ทดแทนตำแหน่ง",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleApprove = async () => {
    await addApproval.mutateAsync({
      action: "approved",
      comment: comment || undefined,
    });
    
    // Check if user is CEO and create job position automatically
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const userRoles = roles?.map(r => r.role) || [];
      
      if (userRoles.includes("ceo") || userRoles.includes("admin")) {
        // Create job position automatically
        const { error: jobError } = await supabase.from("job_positions").insert({
          title: requisition.position,
          department: requisition.department,
          description: requisition.justification,
          required_count: requisition.quantity,
          start_date: requisition.date_needed,
          status: "open"
        });
        
        if (!jobError) {
          toast({
            title: "สำเร็จ",
            description: "สร้างตำแหน่งงานใหม่อัตโนมัติแล้ว",
          });
        }
      }
    }
    
    setComment("");
  };

  const handleReject = async () => {
    await addApproval.mutateAsync({
      action: "rejected",
      comment: comment || undefined,
    });
    setComment("");
  };

  const handleComment = async () => {
    await addApproval.mutateAsync({
      action: "commented",
      comment,
    });
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>รายละเอียด Job Requisition</DialogTitle>
            {getStatusBadge(requisition.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            เลขที่: {requisition.requisition_number}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลทั่วไป</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">แผนก</p>
                <p className="font-medium">{requisition.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ตำแหน่ง</p>
                <p className="font-medium">{requisition.position}</p>
              </div>
              {requisition.job_grade && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Job Grade</p>
                  <p className="font-medium">{requisition.job_grade}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">จำนวน</p>
                <p className="font-medium">{requisition.quantity} คน</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">วันที่ต้องการ</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {format(new Date(requisition.date_needed), "d MMMM yyyy", { locale: th })}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">สถานที่ทำงาน</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{requisition.work_location}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">รายงานต่อ</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{requisition.reports_to}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ประเภทการจ้าง</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{getHiringTypeLabel(requisition.hiring_type)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ผู้ขอ</p>
                <p className="font-medium">{requisition.requester?.name || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Type Details */}
          {(requisition.hiring_type === "replacement" || requisition.hiring_type === "temporary") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">รายละเอียดการจ้าง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requisition.hiring_type === "replacement" && (
                  <>
                    {requisition.replacement_for && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">ทดแทนตำแหน่ง</p>
                        <p className="font-medium">{requisition.replacement_for}</p>
                      </div>
                    )}
                    {requisition.replacement_date && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">วันที่ออก</p>
                        <p className="font-medium">
                          {format(new Date(requisition.replacement_date), "d MMMM yyyy", { locale: th })}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {requisition.hiring_type === "temporary" && requisition.temporary_duration && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ระยะเวลา</p>
                    <p className="font-medium">{requisition.temporary_duration}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Justification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">เหตุผลในการขอ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{requisition.justification}</p>
            </CardContent>
          </Card>

          {/* Job Description File */}
          {requisition.jd_file_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">เอกสาร Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={async () => {
                    const { data } = await supabase.storage
                      .from('job-descriptions')
                      .createSignedUrl(requisition.jd_file_url!, 60);
                    if (data?.signedUrl) {
                      window.open(data.signedUrl, '_blank');
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  ดาวน์โหลด Job Description
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">คุณสมบัติพื้นฐาน</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {requisition.min_education && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">การศึกษา</p>
                  <p className="font-medium">{requisition.min_education}</p>
                </div>
              )}
              {requisition.field_of_study && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">สาขา</p>
                  <p className="font-medium">{requisition.field_of_study}</p>
                </div>
              )}
              {requisition.min_experience && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ประสบการณ์</p>
                  <p className="font-medium">{requisition.min_experience} ปี</p>
                </div>
              )}
              {requisition.gender && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">เพศ</p>
                  <p className="font-medium">{requisition.gender}</p>
                </div>
              )}
              {requisition.max_age && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">อายุสูงสุด</p>
                  <p className="font-medium">{requisition.max_age} ปี</p>
                </div>
              )}
              {requisition.marital_status && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">สถานภาพ</p>
                  <p className="font-medium">{requisition.marital_status}</p>
                </div>
              )}
              {requisition.other_skills && (
                <div className="col-span-2 space-y-1">
                  <p className="text-sm text-muted-foreground">ทักษะอื่นๆ</p>
                  <p className="font-medium">{requisition.other_skills}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ประวัติการพิจารณา</CardTitle>
            </CardHeader>
            <CardContent>
              {approvals.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีการพิจารณา</p>
              ) : (
                <div className="space-y-3">
                  {approvals.map((approval) => (
                    <div key={approval.id} className="flex gap-3 p-3 rounded-lg bg-muted">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(approval.action)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{approval.approver?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(approval.created_at), "d MMM yyyy HH:mm", { locale: th })}
                          </p>
                        </div>
                        <p className="text-sm">
                          <Badge variant="outline" className="mr-2">
                            {approval.action === "approved" && "อนุมัติ"}
                            {approval.action === "rejected" && "ไม่อนุมัติ"}
                            {approval.action === "commented" && "แสดงความเห็น"}
                          </Badge>
                        </p>
                        {approval.comment && (
                          <p className="text-sm text-muted-foreground">{approval.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Actions */}
          {canApprove && requisition.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">พิจารณาคำขอ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="ความเห็น (ไม่บังคับ)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    className="flex-1"
                    disabled={addApproval.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    อนุมัติ
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    className="flex-1"
                    disabled={addApproval.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    ไม่อนุมัติ
                  </Button>
                  {comment && (
                    <Button
                      onClick={handleComment}
                      variant="outline"
                      disabled={addApproval.isPending}
                    >
                      แสดงความเห็น
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};