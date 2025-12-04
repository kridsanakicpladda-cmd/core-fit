import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CandidateDetails {
  id: string;
  candidate_id: string;
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
  computer_skill: boolean | null;
  driving_car: boolean | null;
  driving_car_license_no: string | null;
  driving_motorcycle: boolean | null;
  driving_motorcycle_license_no: string | null;
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
  color_blindness: string | null;
  pregnant: string | null;
  contagious_disease: string | null;
  hr_test_score: number | null;
  department_test_score: number | null;
  educations: Array<{
    level: string;
    institution: string;
    major: string;
    gpa: string;
    yearGraduated: string;
  }> | null;
  work_experiences: Array<{
    company: string;
    position: string;
    duration: string;
    salary: string;
    responsibilities: string;
    reason: string;
  }> | null;
  family_members: Array<{
    name: string;
    relationship: string;
    age: string;
    occupation: string;
  }> | null;
  language_skills: Array<{
    language: string;
    spoken: string;
    written: string;
    understand: string;
  }> | null;
  privacy_consent: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useCandidateDetails(candidateId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidate-details", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      
      const { data, error } = await supabase
        .from("candidate_details")
        .select("*")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching candidate details:", error);
        return null;
      }

      return data as CandidateDetails | null;
    },
    enabled: !!candidateId,
  });

  const updateTestScoresMutation = useMutation({
    mutationFn: async ({ candidateId, hrTestScore, departmentTestScore }: { 
      candidateId: string; 
      hrTestScore?: number; 
      departmentTestScore?: number;
    }) => {
      const { data: existing } = await supabase
        .from("candidate_details")
        .select("id")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("candidate_details")
          .update({
            hr_test_score: hrTestScore ?? null,
            department_test_score: departmentTestScore ?? null,
          })
          .eq("candidate_id", candidateId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("candidate_details")
          .insert({
            candidate_id: candidateId,
            hr_test_score: hrTestScore ?? null,
            department_test_score: departmentTestScore ?? null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-details", candidateId] });
    },
  });

  return {
    ...query,
    updateTestScores: updateTestScoresMutation.mutate,
    isUpdating: updateTestScoresMutation.isPending,
  };
}
