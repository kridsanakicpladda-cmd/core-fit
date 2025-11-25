import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const interviewSchema = z.object({
  candidateName: z.string().min(1, "กรุณาระบุชื่อผู้สมัคร"),
  position: z.string().min(1, "กรุณาระบุตำแหน่ง"),
  date: z.date({ required_error: "กรุณาเลือกวันที่" }),
  time: z.string().min(1, "กรุณาระบุเวลา"),
  type: z.string().min(1, "กรุณาเลือกประเภท"),
  interviewer: z.string().min(1, "กรุณาระบุผู้สัมภาษณ์"),
});

type InterviewFormValues = z.infer<typeof interviewSchema>;

export interface Interview {
  id: string;
  name: string;
  position: string;
  date: Date;
  time: string;
  type: string;
  interviewer: string;
  status: "upcoming" | "completed";
  score?: number;
  interviewRound: "first" | "final";
  schedulingStatus: "pending" | "not_interested" | "rejected" | "scheduled";
  candidateEmail?: string;
  managerEmail?: string;
  proposedSlots?: string[];
}

interface InterviewFormDialogProps {
  interview?: Interview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (interview: Omit<Interview, "id">) => void;
}

export function InterviewFormDialog({ interview, open, onOpenChange, onSave }: InterviewFormDialogProps) {
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      candidateName: "",
      position: "",
      time: "",
      type: "",
      interviewer: "",
    },
  });

  useEffect(() => {
    if (interview) {
      form.reset({
        candidateName: interview.name,
        position: interview.position,
        date: interview.date,
        time: interview.time,
        type: interview.type,
        interviewer: interview.interviewer,
      });
    } else {
      form.reset({
        candidateName: "",
        position: "",
        time: "",
        type: "",
        interviewer: "",
      });
    }
  }, [interview, form, open]);

  const handleSubmit = (values: InterviewFormValues) => {
    const interviewData = {
      name: values.candidateName,
      position: values.position,
      date: values.date,
      time: values.time,
      type: values.type,
      interviewer: values.interviewer,
      status: "upcoming" as const,
      interviewRound: interview?.interviewRound || "first" as const,
      schedulingStatus: interview?.schedulingStatus || "scheduled" as const,
      candidateEmail: interview?.candidateEmail,
      managerEmail: interview?.managerEmail,
      proposedSlots: interview?.proposedSlots,
    };
    
    onSave(interviewData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{interview ? "แก้ไขการสัมภาษณ์" : "นัดสัมภาษณ์ใหม่"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="candidateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อผู้สมัคร</FormLabel>
                  <FormControl>
                    <Input placeholder="ระบุชื่อผู้สมัคร" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ตำแหน่ง</FormLabel>
                  <FormControl>
                    <Input placeholder="ระบุตำแหน่งที่สมัคร" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                            format(field.value, "PPP")
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
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เวลา</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น 10:00 - 11:00" {...field} />
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
                  <FormLabel>ประเภท</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ออนไลน์">ออนไลน์</SelectItem>
                      <SelectItem value="ออนไซต์">ออนไซต์</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interviewer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ผู้สัมภาษณ์</FormLabel>
                  <FormControl>
                    <Input placeholder="ระบุชื่อผู้สัมภาษณ์" {...field} />
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
