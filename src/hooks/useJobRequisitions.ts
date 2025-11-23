import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface JobRequisition {
  id: string;
  requisition_number: string;
  department: string;
  position: string;
  quantity: number;
  date_needed: string;
  work_location: string;
  reports_to: string;
  hiring_type: "replacement" | "permanent" | "temporary";
  replacement_for?: string;
  replacement_date?: string;
  temporary_duration?: string;
  justification: string;
  job_description_no?: string;
  job_grade?: string;
  jd_file_url?: string;
  gender?: string;
  max_age?: string;
  min_experience?: string;
  min_education?: string;
  field_of_study?: string;
  other_skills?: string;
  marital_status?: string;
  experience_in?: string;
  status: "pending" | "approved" | "rejected";
  requested_by: string;
  created_at: string;
  updated_at: string;
  requester?: {
    name: string;
    email: string;
    department: string;
  };
}

export interface RequisitionApproval {
  id: string;
  requisition_id: string;
  approver_id: string;
  action: "approved" | "rejected" | "commented";
  comment?: string;
  created_at: string;
  approver?: {
    name: string;
    email: string;
  };
}

export const useJobRequisitions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requisitions = [], isLoading } = useQuery({
    queryKey: ["job-requisitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_requisitions")
        .select(`
          *,
          requester:profiles!requested_by(name, email, department)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map(req => ({
        ...req,
        requester: Array.isArray(req.requester) ? req.requester[0] : req.requester
      })) as JobRequisition[];
    },
  });

  const createRequisition = useMutation({
    mutationFn: async (data: Omit<JobRequisition, "id" | "requisition_number" | "created_at" | "updated_at" | "requester" | "status" | "requested_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate requisition number
      const { data: reqNumber, error: funcError } = await supabase.rpc("generate_requisition_number");
      if (funcError) throw funcError;

      const { data: newReq, error } = await supabase
        .from("job_requisitions")
        .insert({
          ...data,
          requisition_number: reqNumber,
          requested_by: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return newReq;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-requisitions"] });
      toast({
        title: "สำเร็จ",
        description: "สร้าง Job Requisition เรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRequisition = useMutation({
    mutationFn: async ({ id, ...data }: Partial<JobRequisition> & { id: string }) => {
      const { error } = await supabase
        .from("job_requisitions")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-requisitions"] });
      toast({
        title: "สำเร็จ",
        description: "อัปเดต Job Requisition เรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRequisition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_requisitions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-requisitions"] });
      toast({
        title: "สำเร็จ",
        description: "ลบ Job Requisition เรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    requisitions,
    isLoading,
    createRequisition,
    updateRequisition,
    deleteRequisition,
  };
};

export const useRequisitionApprovals = (requisitionId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["requisition-approvals", requisitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requisition_approvals")
        .select(`
          *,
          approver:profiles!approver_id(name, email)
        `)
        .eq("requisition_id", requisitionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map(approval => ({
        ...approval,
        approver: Array.isArray(approval.approver) ? approval.approver[0] : approval.approver
      })) as RequisitionApproval[];
    },
    enabled: !!requisitionId,
  });

  const addApproval = useMutation({
    mutationFn: async (data: { action: "approved" | "rejected" | "commented"; comment?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("requisition_approvals")
        .insert({
          requisition_id: requisitionId,
          approver_id: user.id,
          ...data,
        });

      if (error) throw error;

      // Update requisition status if approved/rejected
      if (data.action === "approved" || data.action === "rejected") {
        const { error: updateError } = await supabase
          .from("job_requisitions")
          .update({ status: data.action })
          .eq("id", requisitionId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisition-approvals", requisitionId] });
      queryClient.invalidateQueries({ queryKey: ["job-requisitions"] });
      toast({
        title: "สำเร็จ",
        description: "บันทึกการอนุมัติเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    approvals,
    isLoading,
    addApproval,
  };
};