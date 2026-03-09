import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useHiringLogic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkAndUpdateJobStatus = async (
    positionId: string,
    newStage: string,
    oldStage?: string
  ) => {
    if (newStage !== "Hired" && oldStage !== "Hired") return;

    const { data: position, error: posError } = await supabase
      .from("job_positions")
      .select("id, required_count, status, title")
      .eq("id", positionId)
      .single();

    if (posError || !position) return;
    if (position.required_count === null) return;

    const { count, error: countError } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("position_id", positionId)
      .eq("stage", "Hired");

    if (countError || count === null) return;

    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ["job_positions"] });
      queryClient.invalidateQueries({ queryKey: ["hired-count-by-position"] });
      queryClient.invalidateQueries({ queryKey: ["hired-candidates", positionId] });
    };

    // Auto-close: hired count reached required_count
    if (count >= position.required_count && position.status === "open") {
      const { error } = await supabase
        .from("job_positions")
        .update({ status: "closed" })
        .eq("id", positionId);

      if (!error) {
        invalidateAll();
        toast({
          title: "ปิดตำแหน่งงานอัตโนมัติ",
          description: `ตำแหน่ง "${position.title}" ถูกปิดโดยอัตโนมัติ เนื่องจากรับครบ ${position.required_count} อัตราแล้ว`,
        });
      }
    }

    // Auto-reopen: un-hired and count dropped below required_count
    if (
      oldStage === "Hired" &&
      newStage !== "Hired" &&
      count < position.required_count &&
      position.status === "closed"
    ) {
      const { error } = await supabase
        .from("job_positions")
        .update({ status: "open" })
        .eq("id", positionId);

      if (!error) {
        invalidateAll();
        toast({
          title: "เปิดตำแหน่งงานอัตโนมัติ",
          description: `ตำแหน่ง "${position.title}" ถูกเปิดใหม่ เนื่องจากยังรับไม่ครบ ${position.required_count} อัตรา`,
        });
      }
    }
  };

  return { checkAndUpdateJobStatus };
}
