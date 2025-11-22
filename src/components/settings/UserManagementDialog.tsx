import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const userFormSchema = z.object({
  firstName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  lastName: z.string().min(2, "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"),
  department: z.string().min(1, "กรุณาระบุแผนก"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").optional(),
  roles: z.array(z.string()).min(1, "กรุณาเลือกบทบาทอย่างน้อย 1 บทบาท"),
  status: z.enum(["active", "inactive"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserManagementDialogProps {
  user?: {
    id: string;
    name: string;
    department: string | null;
    email: string;
    roles: string[];
    status: "active" | "inactive";
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: UserFormValues & { id?: string; name: string }) => void;
}

export function UserManagementDialog({ user, open, onOpenChange, onSave }: UserManagementDialogProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      department: "",
      email: "",
      password: "",
      roles: [],
      status: "active",
    },
  });

  // Reset form when dialog opens or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        // Split name into first and last name
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        form.reset({
          firstName,
          lastName,
          department: user.department || "",
          email: user.email,
          password: "",
          roles: user.roles,
          status: user.status,
        });
      } else {
        form.reset({
          firstName: "",
          lastName: "",
          department: "",
          email: "",
          password: "",
          roles: [],
          status: "active",
        });
      }
    }
  }, [open, user, form]);

  const handleSubmit = (data: UserFormValues) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    onSave(user ? { ...data, name: fullName, id: user.id } : { ...data, name: fullName });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl>
                      <Input placeholder="นามสกุล" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>แผนก</FormLabel>
                  <FormControl>
                    <Input placeholder="แผนกทรัพยากรบุคคล" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@company.com" {...field} disabled={!!user} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!user && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>บทบาท (เลือกได้หลายบทบาท)</FormLabel>
                  <div className="space-y-2">
                    {[
                      { value: "admin", label: "Admin - จัดการทุกอย่าง" },
                      { value: "ceo", label: "CEO - อนุมัติระดับสูง" },
                      { value: "manager", label: "Manager - จัดการตามสิทธิ์" },
                      { value: "hr_manager", label: "HR Manager - จัดการ HR" },
                      { value: "recruiter", label: "Recruiter - รับสมัครงาน" },
                      { value: "interviewer", label: "Interviewer - สัมภาษณ์" },
                      { value: "candidate", label: "Candidate - ผู้สมัครงาน" },
                      { value: "viewer", label: "Viewer - ดูอย่างเดียว" },
                    ].map((role) => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={role.value}
                          checked={field.value?.includes(role.value)}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...(field.value || []), role.value]
                              : (field.value || []).filter((r) => r !== role.value);
                            field.onChange(newRoles);
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={role.value} className="text-sm">
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถานะ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {user ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มผู้ใช้"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
