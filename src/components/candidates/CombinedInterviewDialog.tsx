import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const evaluationSchema = z.object({
  // First Interview (Manager)
  manager_date: z.date().optional(),
  manager_skill_knowledge: z.number().min(1).max(10),
  manager_communication: z.number().min(1).max(10),
  manager_creativity: z.number().min(1).max(10),
  manager_motivation: z.number().min(1).max(10),
  manager_teamwork: z.number().min(1).max(10),
  manager_analytical: z.number().min(1).max(10),
  manager_culture_fit: z.number().min(1).max(10),
  manager_feedback: z.string().optional(),
  
  // Final Interview (IS)
  is_date: z.date().optional(),
  is_skill_knowledge: z.number().min(1).max(10),
  is_communication: z.number().min(1).max(10),
  is_creativity: z.number().min(1).max(10),
  is_motivation: z.number().min(1).max(10),
  is_teamwork: z.number().min(1).max(10),
  is_analytical: z.number().min(1).max(10),
  is_culture_fit: z.number().min(1).max(10),
  is_feedback: z.string().optional(),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

interface CombinedInterviewDialogProps {
  candidateName?: string;
  position?: string;
  managerInterview?: { 
    date: string; 
    passed: boolean; 
    feedback: string;
    scores?: {
      skill_knowledge?: number;
      communication?: number;
      creativity?: number;
      motivation?: number;
      teamwork?: number;
      analytical?: number;
      culture_fit?: number;
    };
  };
  isInterview?: { 
    date: string; 
    passed: boolean; 
    feedback: string;
    scores?: {
      skill_knowledge?: number;
      communication?: number;
      creativity?: number;
      motivation?: number;
      teamwork?: number;
      analytical?: number;
      culture_fit?: number;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (interviews: { 
    manager: { 
      date: string; 
      passed: boolean; 
      feedback: string;
      scores: {
        skill_knowledge: number;
        communication: number;
        creativity: number;
        motivation: number;
        teamwork: number;
        analytical: number;
        culture_fit: number;
      };
      total_score: number;
    };
    isTeam: { 
      date: string; 
      passed: boolean; 
      feedback: string;
      scores: {
        skill_knowledge: number;
        communication: number;
        creativity: number;
        motivation: number;
        teamwork: number;
        analytical: number;
        culture_fit: number;
      };
      total_score: number;
    };
  }) => void;
}

export function CombinedInterviewDialog({ 
  candidateName, 
  position,
  managerInterview, 
  isInterview,
  open, 
  onOpenChange, 
  onSave 
}: CombinedInterviewDialogProps) {
  const [managerTotalScore, setManagerTotalScore] = useState(0);
  const [isTotalScore, setIsTotalScore] = useState(0);

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      manager_date: undefined,
      manager_skill_knowledge: 5,
      manager_communication: 5,
      manager_creativity: 5,
      manager_motivation: 5,
      manager_teamwork: 5,
      manager_analytical: 5,
      manager_culture_fit: 5,
      manager_feedback: "",
      is_date: undefined,
      is_skill_knowledge: 5,
      is_communication: 5,
      is_creativity: 5,
      is_motivation: 5,
      is_teamwork: 5,
      is_analytical: 5,
      is_culture_fit: 5,
      is_feedback: "",
    },
  });

  const managerWatchedScores = form.watch([
    "manager_skill_knowledge",
    "manager_communication",
    "manager_creativity",
    "manager_motivation",
    "manager_teamwork",
    "manager_analytical",
    "manager_culture_fit"
  ]);

  const isWatchedScores = form.watch([
    "is_skill_knowledge",
    "is_communication",
    "is_creativity",
    "is_motivation",
    "is_teamwork",
    "is_analytical",
    "is_culture_fit"
  ]);

  useEffect(() => {
    const managerSum = managerWatchedScores.reduce((acc, val) => acc + (val || 0), 0);
    setManagerTotalScore(managerSum);
    
    const isSum = isWatchedScores.reduce((acc, val) => acc + (val || 0), 0);
    setIsTotalScore(isSum);
  }, [managerWatchedScores, isWatchedScores]);

  useEffect(() => {
    if (open) {
      // Parse Manager Interview date
      let managerDate: Date | undefined;
      if (managerInterview?.date) {
        const dateParts = managerInterview.date.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const year = parseInt(dateParts[2], 10);
          managerDate = new Date(year, month, day);
        }
      }

      // Parse IS Interview date
      let isDate: Date | undefined;
      if (isInterview?.date) {
        const dateParts = isInterview.date.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const year = parseInt(dateParts[2], 10);
          isDate = new Date(year, month, day);
        }
      }
      
      form.reset({
        manager_date: managerDate,
        manager_skill_knowledge: managerInterview?.scores?.skill_knowledge || 5,
        manager_communication: managerInterview?.scores?.communication || 5,
        manager_creativity: managerInterview?.scores?.creativity || 5,
        manager_motivation: managerInterview?.scores?.motivation || 5,
        manager_teamwork: managerInterview?.scores?.teamwork || 5,
        manager_analytical: managerInterview?.scores?.analytical || 5,
        manager_culture_fit: managerInterview?.scores?.culture_fit || 5,
        manager_feedback: managerInterview?.feedback || "",
        is_date: isDate,
        is_skill_knowledge: isInterview?.scores?.skill_knowledge || 5,
        is_communication: isInterview?.scores?.communication || 5,
        is_creativity: isInterview?.scores?.creativity || 5,
        is_motivation: isInterview?.scores?.motivation || 5,
        is_teamwork: isInterview?.scores?.teamwork || 5,
        is_analytical: isInterview?.scores?.analytical || 5,
        is_culture_fit: isInterview?.scores?.culture_fit || 5,
        is_feedback: isInterview?.feedback || "",
      });
    }
  }, [managerInterview, isInterview, form, open]);

  const handleSubmit = (values: EvaluationFormValues) => {
    const managerScores = {
      skill_knowledge: values.manager_skill_knowledge,
      communication: values.manager_communication,
      creativity: values.manager_creativity,
      motivation: values.manager_motivation,
      teamwork: values.manager_teamwork,
      analytical: values.manager_analytical,
      culture_fit: values.manager_culture_fit,
    };

    const isScores = {
      skill_knowledge: values.is_skill_knowledge,
      communication: values.is_communication,
      creativity: values.is_creativity,
      motivation: values.is_motivation,
      teamwork: values.is_teamwork,
      analytical: values.is_analytical,
      culture_fit: values.is_culture_fit,
    };

    const managerTotal = Object.values(managerScores).reduce((sum, val) => sum + val, 0);
    const isTotal = Object.values(isScores).reduce((sum, val) => sum + val, 0);
    
    const interviews = {
      manager: {
        date: values.manager_date ? format(values.manager_date, "dd/MM/yyyy") : "",
        passed: managerTotal >= 50,
        feedback: values.manager_feedback || "",
        scores: managerScores,
        total_score: managerTotal,
      },
      isTeam: {
        date: values.is_date ? format(values.is_date, "dd/MM/yyyy") : "",
        passed: isTotal >= 50,
        feedback: values.is_feedback || "",
        scores: isScores,
        total_score: isTotal,
      },
    };
    
    onSave(interviews);
    onOpenChange(false);
  };

  const getResultBadge = (score: number) => {
    if (score >= 50) {
      return <Badge className="bg-green-500 hover:bg-green-600">ผ่านเกณฑ์ (≥50)</Badge>;
    } else if (score >= 45) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">สำรอง (45-49)</Badge>;
    } else {
      return <Badge variant="destructive">ไม่ผ่าน (&lt;45)</Badge>;
    }
  };

  const ScoreInput = ({ 
    managerName, 
    isName, 
    label 
  }: { 
    managerName: keyof EvaluationFormValues; 
    isName: keyof EvaluationFormValues; 
    label: string;
  }) => (
    <div className="grid grid-cols-[1fr_80px_80px] gap-2 items-center py-2 border-b">
      <div className="text-xs">{label}</div>
      <FormField
        control={form.control}
        name={managerName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={10}
                value={Number(field.value) || 5}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                className="text-center h-9"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={isName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={10}
                value={Number(field.value) || 5}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                className="text-center h-9"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">แบบประเมินผลการสัมภาษณ์ผู้สมัครงาน</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h3 className="font-semibold text-sm">1. ข้อมูลทั่วไปของผู้สมัครงาน (HR เป็นผู้กรอก)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ชื่อผู้สมัคร:</span>{" "}
                  <span className="font-medium">{candidateName || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ตำแหน่งที่สมัคร:</span>{" "}
                  <span className="font-medium">{position || "-"}</span>
                </div>
              </div>
            </div>

            {/* Interview Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manager_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่สัมภาษณ์ (First Interview)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่สัมภาษณ์ (Final Interview)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Evaluation Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">2. การประเมิน</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  • ระดับการประเมินแต่ละหัวข้อ คะแนน 1-10 (น้อยที่สุด = 1, มากที่สุด = 10)<br/>
                  • คะแนนประเมินอย่างน้อย 50 คะแนน จากคะแนนเต็ม 70 คะแนน ถือว่าสามารถผ่านเกณฑ์รับเข้าทำงาน
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_80px_80px] gap-2 bg-yellow-100 p-3 font-semibold text-xs border-b-2 border-black">
                  <div>หัวข้อการประเมินผลการสัมภาษณ์</div>
                  <div className="text-center">ตีนสังกัด<br/>สัมภาษณ์ครั้งที่ 1</div>
                  <div className="text-center">ตีนสังกัด<br/>สัมภาษณ์ครั้งที่ 2</div>
                </div>

                {/* Evaluation Rows */}
                <div className="p-3 space-y-1">
                  <ScoreInput 
                    managerName="manager_skill_knowledge"
                    isName="is_skill_knowledge"
                    label="1. ทักษะและความรู้ในงาน – ความรู้และประสบการณ์ตรงกับตำแหน่ง" 
                  />
                  <ScoreInput 
                    managerName="manager_communication"
                    isName="is_communication"
                    label="2. การสื่อสาร – ชัดเจน เข้าใจง่าย ตอบคำถามตรงประเด็น" 
                  />
                  <ScoreInput 
                    managerName="manager_creativity"
                    isName="is_creativity"
                    label="3. ความคิดสร้างสรรค์ – นำเสนอความคิดในตำแหน่งเอง และเป็นจริง" 
                  />
                  <ScoreInput 
                    managerName="manager_motivation"
                    isName="is_motivation"
                    label="4. แรงจูงใจ – แสดงความสนใจและตั้งใจอยากทำงานจริง ๆ" 
                  />
                  <ScoreInput 
                    managerName="manager_teamwork"
                    isName="is_teamwork"
                    label="5. การทำงานร่วมกับคนอื่น – ร่วมงานกับผู้อื่น เปิดใจและ Teamwork" 
                  />
                  <ScoreInput 
                    managerName="manager_analytical"
                    isName="is_analytical"
                    label="6. การคิดวิเคราะห์และแก้ปัญหา – สามารถคิดเป็นระบบรับมือกับสถานการณ์ได้ดี" 
                  />
                  <ScoreInput 
                    managerName="manager_culture_fit"
                    isName="is_culture_fit"
                    label="7. วัฒนธรรมองค์กร – ทัศนคติและพฤติกรรมเข้ากับค่านิยมขององค์กร" 
                  />
                </div>

                {/* Total Score Row */}
                <div className="grid grid-cols-[1fr_80px_80px] gap-2 bg-yellow-50 p-3 border-t-2 border-black">
                  <div className="text-xs font-semibold">
                    รวมคะแนน<br/>
                    <span className="text-[10px] font-normal">[ เกณฑ์คะแนน ≥ 50 ผ่านเกณฑ์รับเข้าทำงาน, 45-49 สำรองไว้พิจารณา, &lt; 45 ไม่ผ่านการสัมภาษณ์ ]</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-2xl font-bold text-primary">{managerTotalScore}</span>
                    <span className="text-xs text-muted-foreground">/ 70</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-2xl font-bold text-primary">{isTotalScore}</span>
                    <span className="text-xs text-muted-foreground">/ 70</span>
                  </div>
                </div>

                {/* Result Badges */}
                <div className="grid grid-cols-[1fr_80px_80px] gap-2 p-3 bg-muted/10">
                  <div className="text-xs font-semibold">ผลการประเมิน:</div>
                  <div className="flex justify-center">
                    {getResultBadge(managerTotalScore)}
                  </div>
                  <div className="flex justify-center">
                    {getResultBadge(isTotalScore)}
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">ความคิดเห็นเพิ่มเติมของผู้สัมภาษณ์</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manager_feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตีนสังกัดสัมภาษณ์ครั้งที่ 1</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="ใส่ข้อคิดเห็นเพิ่มเติมจากการสัมภาษณ์" 
                          rows={4} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตีนสังกัดสัมภาษณ์ครั้งที่ 2</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="ใส่ข้อคิดเห็นเพิ่มเติมจากการสัมภาษณ์" 
                          rows={4} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}