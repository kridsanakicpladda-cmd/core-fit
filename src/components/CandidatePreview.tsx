import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, MessageSquare } from "lucide-react";

interface Candidate {
  name: string;
  position: string;
  fitScore: number;
  skills: string[];
  experience: string;
  status: "new" | "screening" | "interview" | "shortlisted";
}

const candidates: Candidate[] = [
  {
    name: "Sarah Johnson",
    position: "Senior Frontend Developer",
    fitScore: 92,
    skills: ["React", "TypeScript", "Next.js"],
    experience: "5 years",
    status: "shortlisted"
  },
  {
    name: "Michael Chen",
    position: "Senior Frontend Developer", 
    fitScore: 87,
    skills: ["Vue.js", "TypeScript", "Node.js"],
    experience: "4 years",
    status: "interview"
  },
  {
    name: "Priya Sharma",
    position: "Senior Frontend Developer",
    fitScore: 84,
    skills: ["React", "JavaScript", "CSS"],
    experience: "6 years",
    status: "screening"
  }
];

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-700" },
  screening: { label: "Screening", color: "bg-warning/10 text-warning" },
  interview: { label: "Interview", color: "bg-purple-100 text-purple-700" },
  shortlisted: { label: "Shortlisted", color: "bg-success/10 text-success" }
};

export const CandidatePreview = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            ดูผู้สมัครที่เหมาะสมในพริบตา
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI Fit Score แสดงคะแนนความเหมาะสมพร้อมเหตุผลประกอบที่ชัดเจน
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {candidates.map((candidate, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-spring hover:scale-[1.02] cursor-pointer border-2 hover:border-primary"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Avatar & Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xl font-semibold">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{candidate.name}</h3>
                        <p className="text-muted-foreground">{candidate.position}</p>
                      </div>
                      <Badge className={statusConfig[candidate.status].color}>
                        {statusConfig[candidate.status].label}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">
                        {candidate.experience}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Fit Score */}
                <div className="lg:w-48 flex flex-col items-center gap-3 p-4 rounded-xl gradient-subtle">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="hsl(var(--border))"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="hsl(var(--primary))"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - candidate.fitScore / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{candidate.fitScore}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-center">AI Fit Score</div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Note
                  </Button>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Skills Match</div>
                  <Progress value={95} className="h-2" />
                  <div className="text-xs font-medium mt-1">95%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Experience</div>
                  <Progress value={88} className="h-2" />
                  <div className="text-xs font-medium mt-1">88%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Education</div>
                  <Progress value={90} className="h-2" />
                  <div className="text-xs font-medium mt-1">90%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Cultural Fit</div>
                  <Progress value={92} className="h-2" />
                  <div className="text-xs font-medium mt-1">92%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="px-8">
            ดูผู้สมัครทั้งหมด
          </Button>
        </div>
      </div>
    </section>
  );
};
