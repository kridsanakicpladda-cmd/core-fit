import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const interviewSchema = z.object({
  date: z.string().min(1, "กรุณาระบุวันที่สัมภาษณ์"),
  passed: z.string().min(1, "กรุณาเลือกผลการสัมภาษณ์"),
  feedback: z.string().optional(),
});

type InterviewFormValues = z.infer<typeof interviewSchema>;

interface SingleInterviewDialogProps {
  title: string;
  interview?: { date: string; passed: boolean; feedback: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (interview: { date: string; passed: boolean; feedback: string }) => void;
}

export function SingleInterviewDialog({ title, interview, open, onOpenChange, onSave }: SingleInterviewDialogProps) {
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      date: "",
      passed: "",
      feedback: "",
    },
  });

  useEffect(() => {
    if (interview) {
      form.reset({
        date: interview.date || "",
        passed: interview.passed !== undefined ? (interview.passed ? "true" : "false") : "",
        feedback: interview.feedback || "",
      });
    } else {
      form.reset({
        date: "",
        passed: "",
        feedback: "",
      });
    }
  }, [interview, form, open]);

  const handleSubmit = (values: InterviewFormValues) => {
    const interviewData = {
      date: values.date,
      passed: values.passed === "true",
      feedback: values.feedback || "",
    };
    
    onSave(interviewData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่สัมภาษณ์</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น 15/03/2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ผลการสัมภาษณ์</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกผลการสัมภาษณ์" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">ผ่าน</SelectItem>
                      <SelectItem value="false">ไม่ผ่าน</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ข้อคิดเห็น</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ใส่ข้อคิดเห็นจากการสัมภาษณ์" rows={4} {...field} />
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
