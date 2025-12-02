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
  date: z.date({
    required_error: "กรุณาเลือกวันที่สัมภาษณ์",
  }),
  // 7 evaluation criteria (0-10 each, optional)
  skill_knowledge: z.coerce.number().min(0).max(10).optional(),
  communication: z.coerce.number().min(0).max(10).optional(),
  creativity: z.coerce.number().min(0).max(10).optional(),
  motivation: z.coerce.number().min(0).max(10).optional(),
  teamwork: z.coerce.number().min(0).max(10).optional(),
  analytical: z.coerce.number().min(0).max(10).optional(),
  culture_fit: z.coerce.number().min(0).max(10).optional(),
  feedback: z.string().optional(),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

interface FinalInterviewDialogProps {
  candidateName?: string;
  position?: string;
  interview?: { 
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
  onSave: (interview: { 
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
  }) => void;
}

export function FinalInterviewDialog({ 
  candidateName, 
  position,
  interview, 
  open, 
  onOpenChange, 
  onSave 
}: FinalInterviewDialogProps) {
  const [totalScore, setTotalScore] = useState(0);

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      date: undefined,
      skill_knowledge: undefined,
      communication: undefined,
      creativity: undefined,
      motivation: undefined,
      teamwork: undefined,
      analytical: undefined,
      culture_fit: undefined,
      feedback: "",
    },
  });

  const watchedScores = form.watch([
    "skill_knowledge",
    "communication",
    "creativity",
    "motivation",
    "teamwork",
    "analytical",
    "culture_fit"
  ]);

  useEffect(() => {
    const sum = watchedScores.reduce((acc, val) => acc + (val || 0), 0);
    setTotalScore(sum);
  }, [watchedScores]);

  useEffect(() => {
    if (interview) {
      const dateParts = interview.date?.split('/');
      let parsedDate: Date | undefined;
      if (dateParts && dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        parsedDate = new Date(year, month, day);
      }
      
      form.reset({
        date: parsedDate,
        skill_knowledge: interview.scores?.skill_knowledge,
        communication: interview.scores?.communication,
        creativity: interview.scores?.creativity,
        motivation: interview.scores?.motivation,
        teamwork: interview.scores?.teamwork,
        analytical: interview.scores?.analytical,
        culture_fit: interview.scores?.culture_fit,
        feedback: interview.feedback || "",
      });
    } else {
      form.reset({
        date: undefined,
        skill_knowledge: undefined,
        communication: undefined,
        creativity: undefined,
        motivation: undefined,
        teamwork: undefined,
        analytical: undefined,
        culture_fit: undefined,
        feedback: "",
      });
    }
  }, [interview, form, open]);

  const handleSubmit = (values: EvaluationFormValues) => {
    const scores = {
      skill_knowledge: values.skill_knowledge,
      communication: values.communication,
      creativity: values.creativity,
      motivation: values.motivation,
      teamwork: values.teamwork,
      analytical: values.analytical,
      culture_fit: values.culture_fit,
    };

    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
    
    const interviewData = {
      date: format(values.date, "dd/MM/yyyy"),
      passed: total >= 50,
      feedback: values.feedback || "",
      scores,
      total_score: total,
    };
    
    onSave(interviewData);
    onOpenChange(false);
  };

  const getResultBadge = () => {
    if (totalScore >= 50) {
      return <Badge className="bg-green-500 hover:bg-green-600">ผ่านเกณฑ์รับเข้าทำงาน (≥50)</Badge>;
    } else if (totalScore >= 45) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">รองไว้พิจารณา (45-49)</Badge>;
    } else {
      return <Badge variant="destructive">ไม่ผ่านเกณฑ์ (&lt;45)</Badge>;
    }
  };

  const ScoreInput = ({ name, label }: { name: keyof EvaluationFormValues; label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              max={10}
              value={typeof field.value === 'number' ? field.value : ""}
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
              className="text-center"
              placeholder="0-10"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">แบบประเมินผลการสัมภาษณ์ผู้สมัครงาน - Final Interview (IS)</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h3 className="font-semibold text-sm">1. ข้อมูลทั่วไปของผู้สมัครงาน</h3>
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

            {/* Interview Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>วันที่สัมภาษณ์</FormLabel>
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

            {/* Evaluation Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">2. การประเมิน</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  • ระดับการประเมินแต่ละหัวข้อ คะแนน 1-10 (น้อยที่สุด = 1, มากที่สุด = 10)<br/>
                  • คะแนนประเมินอย่างน้อย 50 คะแนน จากคะแนนเต็ม 70 คะแนน ถือว่าสามารถผ่านเกณฑ์รับเข้าทำงาน
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <ScoreInput 
                  name="skill_knowledge" 
                  label="1. ทักษะและความรู้ในงาน – ความรู้และประสบการณ์ตรงกับตำแหน่ง" 
                />
                <ScoreInput 
                  name="communication" 
                  label="2. การสื่อสาร – ชัดเจน เข้าใจง่าย ตอบคำถามตรงประเด็น" 
                />
                <ScoreInput 
                  name="creativity" 
                  label="3. ความคิดสร้างสรรค์ – นำเสนอความคิดในตำแหน่งเอง และเป็นจริง" 
                />
                <ScoreInput 
                  name="motivation" 
                  label="4. แรงจูงใจ – แสดงความสนใจและตั้งใจอยากทำงานจริง ๆ" 
                />
                <ScoreInput 
                  name="teamwork" 
                  label="5. การทำงานร่วมกับคนอื่น – ร่วมงานกับผู้อื่น เปิดใจและ Teamwork" 
                />
                <ScoreInput 
                  name="analytical" 
                  label="6. การคิดวิเคราะห์และแก้ปัญหา – สามารถคิดเป็นระบบรับมือกับสถานการณ์ได้ดี" 
                />
                <ScoreInput 
                  name="culture_fit" 
                  label="7. วัฒนธรรมองค์กร – ทัศนคติ และพฤติกรรมเข้ากับค่านิยมขององค์กร" 
                />
              </div>

              {/* Total Score Display */}
              <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">รวมคะแนน:</span>{" "}
                    <span className="text-2xl font-bold text-primary">{totalScore}</span>
                    <span className="text-sm text-muted-foreground"> / 70</span>
                  </div>
                  {getResultBadge()}
                </div>
              </div>
            </div>

            {/* Comments */}
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ความคิดเห็นเพิ่มเติมของผู้สัมภาษณ์</FormLabel>
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
