import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const testScoreSchema = z.object({
  hrTest: z.coerce.number().min(0, "คะแนนต้องมากกว่า 0").max(100, "คะแนนต้องไม่เกิน 100"),
  departmentTest: z.coerce.number().min(0, "คะแนนต้องมากกว่า 0").max(100, "คะแนนต้องไม่เกิน 100"),
});

type TestScoreFormValues = z.infer<typeof testScoreSchema>;

interface TestScoreDialogProps {
  testScores?: {
    hrTest: number;
    departmentTest: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (testScores: { hrTest: number; departmentTest: number }) => void;
}

export function TestScoreDialog({ testScores, open, onOpenChange, onSave }: TestScoreDialogProps) {
  const form = useForm<TestScoreFormValues>({
    resolver: zodResolver(testScoreSchema),
    defaultValues: {
      hrTest: 0,
      departmentTest: 0,
    },
  });

  useEffect(() => {
    if (testScores) {
      form.reset({
        hrTest: testScores.hrTest ?? 0,
        departmentTest: testScores.departmentTest ?? 0,
      });
    } else {
      form.reset({
        hrTest: 0,
        departmentTest: 0,
      });
    }
  }, [testScores, form, open]);

  const handleSubmit = (values: TestScoreFormValues) => {
    onSave({
      hrTest: values.hrTest,
      departmentTest: values.departmentTest,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขคะแนนแบบทดสอบ</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hrTest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>แบบทดสอบส่วนกลาง (HR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0-100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentTest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>แบบทดสอบเฉพาะแผนก</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0-100" {...field} />
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
