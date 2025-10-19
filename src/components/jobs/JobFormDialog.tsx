import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const jobFormSchema = z.object({
  title: z.string().min(1, "กรุณาระบุชื่อตำแหน่ง"),
  department: z.string().min(1, "กรุณาระบุแผนก"),
  location: z.string().min(1, "กรุณาระบุสถานที่"),
  type: z.string().min(1, "กรุณาระบุประเภทงาน"),
  salaryRange: z.string().min(1, "กรุณาระบุช่วงเงินเดือน"),
  numberOfPositions: z.string().min(1, "กรุณาระบุจำนวนอัตราที่รับสมัคร"),
  jobGrade: z.string().min(1, "กรุณาระบุ JG"),
  description: z.string().min(1, "กรุณาระบุรายละเอียดงาน"),
  responsibilities: z.string().min(1, "กรุณาระบุหน้าที่ความรับผิดชอบ"),
  requirements: z.string().min(1, "กรุณาระบุคุณสมบัติที่ต้องการ"),
  additionalInfo: z.string().optional(),
  status: z.enum(["open", "closed"]),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormDialogProps {
  job?: {
    id: number;
    title: string;
    department: string;
    location: string;
    type: string;
    salaryRange: string;
    numberOfPositions: string;
    jobGrade: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    additionalInfo?: string;
    status: "open" | "closed";
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export function JobFormDialog({ job, open, onOpenChange, onSave }: JobFormDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title || "",
      department: job?.department || "",
      location: job?.location || "",
      type: job?.type || "Full-time",
      salaryRange: job?.salaryRange || "",
      numberOfPositions: job?.numberOfPositions || "",
      jobGrade: job?.jobGrade || "",
      description: job?.description || "",
      responsibilities: job?.responsibilities.join("\n") || "",
      requirements: job?.requirements.join("\n") || "",
      additionalInfo: job?.additionalInfo || "",
      status: job?.status || "open",
    },
  });

  const onSubmit = (data: JobFormValues) => {
    const jobData = {
      ...data,
      responsibilities: data.responsibilities.split("\n").filter(r => r.trim()),
      requirements: data.requirements.split("\n").filter(r => r.trim()),
    };
    
    onSave(jobData);
    
    toast({
      title: job ? "อัปเดตตำแหน่งงานสำเร็จ" : "เพิ่มตำแหน่งงานสำเร็จ",
      description: `ตำแหน่ง ${data.title} ได้รับการ${job ? "อัปเดต" : "เพิ่ม"}แล้ว`,
    });
    
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งงานใหม่"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ชื่อตำแหน่ง *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Senior Full-Stack Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>แผนก *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานที่ *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น กรุงเทพฯ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภทงาน *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภทงาน" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ช่วงเงินเดือน *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น ฿50,000 - ฿80,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfPositions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รับสมัครกี่อัตรา *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น 2 อัตรา" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JG (Job Grade) *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น JG5, JG6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>สถานะ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">เปิดรับสมัคร</SelectItem>
                        <SelectItem value="closed">ปิดรับสมัคร</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียดงาน *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="อธิบายรายละเอียดตำแหน่งงาน..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หน้าที่ความรับผิดชอบ * (แยกแต่ละข้อด้วยการขึ้นบรรทัดใหม่)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="พัฒนาและดูแลระบบ&#10;ทำงานร่วมกับทีม&#10;วิเคราะห์ความต้องการ"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คุณสมบัติที่ต้องการ * (แยกแต่ละข้อด้วยการขึ้นบรรทัดใหม่)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="ประสบการณ์ 3 ปีขึ้นไป&#10;มีทักษะ React, Node.js&#10;สามารถสื่อสารภาษาอังกฤษได้"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อื่นๆ (ข้อมูลเพิ่มเติม)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="ระบุข้อมูลเพิ่มเติมที่ต้องการ..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {job ? "บันทึกการแก้ไข" : "เพิ่มตำแหน่งงาน"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
