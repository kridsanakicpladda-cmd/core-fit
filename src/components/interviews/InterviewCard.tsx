import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Video, DoorOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Interview } from "./InterviewFormDialog";
import { addSparkleEffect } from "@/lib/sparkle";

interface InterviewCardProps {
  interview: Interview;
  onClick: (interview: Interview) => void;
}

export function InterviewCard({ interview, onClick }: InterviewCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl bg-card hover:shadow-md transition-all group border border-border/50 cursor-pointer glow-on-hover"
      onClick={(e) => {
        addSparkleEffect(e);
        onClick(interview);
      }}
    >
      <div className="flex items-center gap-4">
        {interview.status === "completed" && interview.score ? (
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
            {interview.score}
          </div>
        ) : (
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow animate-float">
            <Video className="h-6 w-6" />
          </div>
        )}
        <div>
          <h3 className="font-semibold group-hover:text-primary transition-colors">
            {interview.name}
          </h3>
          <p className="text-sm text-muted-foreground">{interview.position}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {interview.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {interview.type}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {interview.interviewer}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {interview.status === "completed" ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            เสร็จสิ้น
          </Badge>
        ) : (
          <>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              กำลังจะถึง
            </Badge>
            {interview.applicationId && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/interview-room/${interview.applicationId}`);
                }}
              >
                <DoorOpen className="h-4 w-4" />
                เข้าห้องสัมภาษณ์
              </Button>
            )}
            <Button
              size="sm"
              className="shadow-sm hover:shadow-glow transition-all hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                addSparkleEffect(e);
              }}
            >
              เข้าร่วม
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
