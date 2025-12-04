import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CandidateDetails {
  id: string;
  candidate_id: string;
  birth_date: string | null;
  age: string | null;
  id_card: string | null;
  sex: string | null;
  blood_type: string | null;
  religion: string | null;
  height: string | null;
  weight: string | null;
  marital_status: string | null;
  spouse_name: string | null;
  spouse_occupation: string | null;
  number_of_children: string | null;
  emergency_name: string | null;
  emergency_relation: string | null;
  emergency_address: string | null;
  emergency_phone: string | null;
  color_blindness: string | null;
  pregnant: string | null;
  driving_car: boolean | null;
  driving_car_license_no: string | null;
  driving_motorcycle: boolean | null;
  driving_motorcycle_license_no: string | null;
  contagious_disease: string | null;
  other_skills: string | null;
  training_curriculums: string | null;
  worked_at_icp_before: string | null;
  worked_at_icp_details: string | null;
  relatives_at_icp: string | null;
  relatives_at_icp_details: string | null;
  criminal_record: string | null;
  criminal_record_details: string | null;
  serious_illness: string | null;
  serious_illness_details: string | null;
  position: string | null;
  expected_salary: string | null;
  title_name: string | null;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  present_address: string | null;
  moo: string | null;
  district: string | null;
  sub_district: string | null;
  province: string | null;
  zip_code: string | null;
  mobile_phone: string | null;
  hr_test_score: number | null;
  department_test_score: number | null;
  computer_skill: boolean | null;
  educations: any[];
  work_experiences: any[];
  family_members: any[];
  language_skills: any[];
  privacy_consent: boolean | null;
}

export function useCandidateDetails(candidateId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: details, isLoading } = useQuery({
    queryKey: ["candidate-details", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      
      const { data, error } = await supabase
        .from("candidate_details")
        .select("*")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (error) throw error;
      return data as CandidateDetails | null;
    },
    enabled: !!candidateId,
  });

  // Update test scores
  const updateTestScoresMutation = useMutation({
    mutationFn: async ({
      candidateId,
      hrTestScore,
      departmentTestScore,
    }: {
      candidateId: string;
      hrTestScore?: number;
      departmentTestScore?: number;
    }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from("candidate_details")
        .select("id")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("candidate_details")
          .update({
            hr_test_score: hrTestScore,
            department_test_score: departmentTestScore,
          })
          .eq("candidate_id", candidateId);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("candidate_details")
          .insert({
            candidate_id: candidateId,
            hr_test_score: hrTestScore,
            department_test_score: departmentTestScore,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-details", candidateId] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกคะแนนทดสอบเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update Pre-Screen interview
  const updatePreScreenMutation = useMutation({
    mutationFn: async ({
      applicationId,
      date,
      passed,
      feedback,
    }: {
      applicationId: string;
      date: string;
      passed: boolean;
      feedback: string;
    }) => {
      // Parse the date
      let scheduledAt: string | null = null;
      if (date) {
        const dateParts = date.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const year = parseInt(dateParts[2], 10);
          scheduledAt = new Date(year, month, day).toISOString();
        }
      }

      // Check if pre-screen interview exists
      const { data: existing } = await supabase
        .from("interviews")
        .select("id")
        .eq("application_id", applicationId)
        .eq("status", "pre_screen")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("interviews")
          .update({
            scheduled_at: scheduledAt,
            result: passed ? "passed" : "failed",
            notes: feedback,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("interviews")
          .insert({
            application_id: applicationId,
            status: "pre_screen",
            scheduled_at: scheduledAt,
            result: passed ? "passed" : "failed",
            notes: feedback,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-details", candidateId] });
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกผล Pre-Screen เรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update First Interview (Manager)
  const updateFirstInterviewMutation = useMutation({
    mutationFn: async ({
      applicationId,
      date,
      passed,
      feedback,
      scores,
      totalScore,
    }: {
      applicationId: string;
      date: string;
      passed: boolean;
      feedback: string;
      scores: Record<string, number>;
      totalScore: number;
    }) => {
      let scheduledAt: string | null = null;
      if (date) {
        const dateParts = date.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const year = parseInt(dateParts[2], 10);
          scheduledAt = new Date(year, month, day).toISOString();
        }
      }

      const notesData = JSON.stringify({
        type: "first_interview",
        scores,
        feedback,
      });

      // Check if first interview exists
      const { data: existing } = await supabase
        .from("interviews")
        .select("id")
        .eq("application_id", applicationId)
        .contains("notes", { type: "first_interview" })
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("interviews")
          .update({
            scheduled_at: scheduledAt,
            result: passed ? "passed" : "failed",
            notes: notesData,
            score: totalScore,
            status: "completed",
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("interviews")
          .insert({
            application_id: applicationId,
            status: "completed",
            scheduled_at: scheduledAt,
            result: passed ? "passed" : "failed",
            notes: notesData,
            score: totalScore,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-details", candidateId] });
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกผล First Interview เรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update Final Interview (IS)
  const updateFinalInterviewMutation = useMutation({
    mutationFn: async ({
      applicationId,
      date,
      passed,
      feedback,
      scores,
      totalScore,
    }: {
      applicationId: string;
      date: string;
      passed: boolean;
      feedback: string;
      scores: Record<string, number>;
      totalScore: number;
    }) => {
      let scheduledAt: string | null = null;
      if (date) {
        const dateParts = date.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const year = parseInt(dateParts[2], 10);
          scheduledAt = new Date(year, month, day).toISOString();
        }
      }

      const notesData = JSON.stringify({
        type: "final_interview",
        scores,
        feedback,
      });

      // Check if final interview exists
      const { data: existing } = await supabase
        .from("interviews")
        .select("id")
        .eq("application_id", applicationId)
        .contains("notes", { type: "final_interview" })
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("interviews")
          .update({
            scheduled_at: scheduledAt,
            result: passed ? "passed" : "failed",
            notes: notesData,
            score: totalScore,
            status: "completed",
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("interviews")
          .insert({
            application_id: applicationId,
            status: "completed",
            scheduled_at: scheduledAt,
            result: passed ? "passed" : "failed",
            notes: notesData,
            score: totalScore,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-details", candidateId] });
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกผล Final Interview เรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Query for pre-screen interview
  const preScreenQuery = useQuery({
    queryKey: ["pre-screen-interview", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      // First get application_id for this candidate
      const { data: application } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (!application) return null;

      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("application_id", application.id)
        .eq("status", "pre_screen")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });

  // Query for first interview
  const firstInterviewQuery = useQuery({
    queryKey: ["first-interview", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      const { data: application } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (!application) return null;

      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("application_id", application.id)
        .filter("notes", "cs", '{"type":"first_interview"}')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!candidateId,
  });

  // Query for final interview
  const finalInterviewQuery = useQuery({
    queryKey: ["final-interview", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      const { data: application } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (!application) return null;

      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("application_id", application.id)
        .filter("notes", "cs", '{"type":"final_interview"}')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!candidateId,
  });

  return {
    data: details,
    isLoading,
    updateTestScores: updateTestScoresMutation.mutate,
    isUpdating: updateTestScoresMutation.isPending,
    updatePreScreen: updatePreScreenMutation.mutate,
    isUpdatingPreScreen: updatePreScreenMutation.isPending,
    updateFirstInterview: updateFirstInterviewMutation.mutate,
    isUpdatingFirstInterview: updateFirstInterviewMutation.isPending,
    updateFinalInterview: updateFinalInterviewMutation.mutate,
    isUpdatingFinalInterview: updateFinalInterviewMutation.isPending,
    preScreenInterview: preScreenQuery.data,
    firstInterview: firstInterviewQuery.data,
    finalInterview: finalInterviewQuery.data,
  };
}
