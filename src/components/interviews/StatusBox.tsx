import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, UserX } from "lucide-react";
import { Interview } from "./InterviewFormDialog";

interface StatusBoxProps {
  title: string;
  candidates: Interview[];
  type: "not_interested" | "rejected";
}

export function StatusBox({ title, candidates, type }: StatusBoxProps) {
  const Icon = type === "not_interested" ? UserX : XCircle;
  const colorClass = type === "not_interested" ? "text-orange-500" : "text-red-500";
  const bgClass = type === "not_interested" ? "bg-orange-500" : "bg-red-500";

  return (
    <Card className="glow-on-hover hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          {title}
          <Badge variant="secondary" className="ml-auto">{candidates.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            ไม่มีรายการ
          </p>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-2 rounded-lg border border-border/50 bg-card/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.position}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${bgClass}`} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
