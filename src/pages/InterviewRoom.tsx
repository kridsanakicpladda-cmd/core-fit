import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Brain, Sparkles, User, FileText, Star, Loader2,
  MessageSquare, ThumbsUp, ThumbsDown, Meh, Smile, Frown, Save, CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { getScoreColor } from "@/lib/calculateJobFitScore";

interface CandidateInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  resume_url: string | null;
  ai_fit_score: number | null;
  position_title: string | null;
  age: string | null;
  expected_salary: string | null;
  height: string | null;
  weight: string | null;
  present_address: string | null;
  work_experiences: any;
  educations: any;
  other_skills: string | null;
}

interface JavisQuestion {
  id: number;
  question: string;
  category: string;
  score: number | null;
  notes: string;
}

const scoringCriteria = [
  { key: "skill_knowledge", label: "1. ทักษะและความรู้ในงาน" },
  { key: "communication", label: "2. การสื่อสาร" },
  { key: "creativity", label: "3. ความคิดสร้างสรรค์" },
  { key: "motivation", label: "4. แรงจูงใจ" },
  { key: "teamwork", label: "5. การทำงานร่วมกับคนอื่น" },
  { key: "analytical", label: "6. การคิดวิเคราะห์และแก้ปัญหา" },
  { key: "culture_fit", label: "7. วัฒนธรรมองค์กร" },
];

const emojiRatings = [
  { emoji: "😡", label: "แย่มาก", value: 1 },
  { emoji: "😕", label: "ไม่ดี", value: 2 },
  { emoji: "😐", label: "ปานกลาง", value: 3 },
  { emoji: "😊", label: "ดี", value: 4 },
  { emoji: "🤩", label: "ยอดเยี่ยม", value: 5 },
];

export default function InterviewRoom() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isManager, isAdmin, isHRManager } = useUserRoles();

  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviewType, setInterviewType] = useState<"main" | "final">("main");

  // Javis AI Questions
  const [javisQuestions, setJavisQuestions] = useState<JavisQuestion[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Scoring
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  // Emoji feedback for AI quality
  const [aiRating, setAiRating] = useState<number | null>(null);
  const [aiComment, setAiComment] = useState("");
  const [showEmojiFeedback, setShowEmojiFeedback] = useState(false);

  // Load candidate data
  useEffect(() => {
    if (!applicationId) return;

    const fetchCandidate = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id, position_id,
          candidates ( id, name, email, phone, photo_url, resume_url, ai_fit_score ),
          job_positions ( id, title, description, requirements, responsibilities ),
          candidate_details:candidates!inner ( candidate_details ( age, expected_salary, height, weight, present_address, work_experiences, educations, other_skills, position ) )
        `)
        .eq("id", applicationId)
        .single();

      if (error || !data) {
        // Fallback: try simpler query
        const { data: appData } = await supabase
          .from("applications")
          .select(`
            id, position_id,
            candidates ( id, name, email, phone, photo_url, resume_url, ai_fit_score )
          `)
          .eq("id", applicationId)
          .single();

        if (appData?.candidates) {
          const c = appData.candidates as any;
          // Fetch candidate details separately
          const { data: details } = await supabase
            .from("candidate_details")
            .select("*")
            .eq("candidate_id", c.id)
            .single();

          // Fetch job position
          const { data: job } = await supabase
            .from("job_positions")
            .select("*")
            .eq("id", appData.position_id)
            .single();

          setCandidate({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            photo_url: c.photo_url,
            resume_url: c.resume_url,
            ai_fit_score: c.ai_fit_score,
            position_title: details?.position || job?.title || null,
            age: details?.age || null,
            expected_salary: details?.expected_salary || null,
            height: details?.height || null,
            weight: details?.weight || null,
            present_address: details?.present_address || null,
            work_experiences: details?.work_experiences || null,
            educations: details?.educations || null,
            other_skills: details?.other_skills || null,
          });
        }
      }
      setLoading(false);
    };

    fetchCandidate();
  }, [applicationId]);

  // Generate AI questions
  const handleGenerateQuestions = async () => {
    if (!candidate) return;
    setGeneratingQuestions(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: {
          candidateName: candidate.name,
          position: candidate.position_title,
          workExperiences: candidate.work_experiences,
          educations: candidate.educations,
          skills: candidate.other_skills,
          interviewType,
        },
      });

      if (error) throw error;

      if (data?.questions) {
        setJavisQuestions(data.questions.map((q: any, i: number) => ({
          id: i + 1,
          question: q.question,
          category: q.category || "ทั่วไป",
          score: null,
          notes: "",
        })));
      } else {
        // Fallback default questions
        const defaultQuestions = [
          { question: `บอกเล่าประสบการณ์การทำงานที่เกี่ยวข้องกับตำแหน่ง ${candidate.position_title || 'นี้'}`, category: "ทักษะและความรู้" },
          { question: "คุณมีวิธีจัดการเวลาและลำดับความสำคัญของงานอย่างไร?", category: "การจัดการ" },
          { question: "เล่าสถานการณ์ที่คุณต้องทำงานร่วมกับทีมที่มีความคิดเห็นแตกต่างกัน", category: "การทำงานเป็นทีม" },
          { question: "อะไรที่ทำให้คุณสนใจสมัครตำแหน่งนี้กับบริษัทเรา?", category: "แรงจูงใจ" },
          { question: "คุณมีเป้าหมายในอาชีพ 3-5 ปีข้างหน้าอย่างไร?", category: "วิสัยทัศน์" },
          { question: "เล่าสถานการณ์ที่คุณต้องแก้ปัญหาที่ซับซ้อนในการทำงาน", category: "การแก้ปัญหา" },
          { question: "คุณรับมือกับความกดดันและ deadline อย่างไร?", category: "ความอดทน" },
        ];
        setJavisQuestions(defaultQuestions.map((q, i) => ({
          id: i + 1,
          question: q.question,
          category: q.category,
          score: null,
          notes: "",
        })));
      }

      toast({ title: "Javis สร้างคำถามเรียบร้อย", description: `สร้างคำถามสำหรับ ${interviewType === 'main' ? 'Main' : 'Final'} Interview` });
    } catch (err: any) {
      console.error('Error generating questions:', err);
      // Use fallback questions
      const fallbackQuestions = [
        { question: `บอกเล่าประสบการณ์การทำงานที่เกี่ยวข้องกับตำแหน่ง ${candidate.position_title || 'นี้'}`, category: "ทักษะและความรู้" },
        { question: "คุณมีวิธีจัดการเวลาและลำดับความสำคัญของงานอย่างไร?", category: "การจัดการ" },
        { question: "เล่าสถานการณ์ที่คุณต้องทำงานร่วมกับทีมที่มีความคิดเห็นแตกต่างกัน", category: "การทำงานเป็นทีม" },
        { question: "อะไรที่ทำให้คุณสนใจสมัครตำแหน่งนี้กับบริษัทเรา?", category: "แรงจูงใจ" },
        { question: "คุณมีเป้าหมายในอาชีพ 3-5 ปีข้างหน้าอย่างไร?", category: "วิสัยทัศน์" },
        { question: "เล่าสถานการณ์ที่คุณต้องแก้ปัญหาที่ซับซ้อนในการทำงาน", category: "การแก้ปัญหา" },
        { question: "คุณรับมือกับความกดดันและ deadline อย่างไร?", category: "ความอดทน" },
      ];
      setJavisQuestions(fallbackQuestions.map((q, i) => ({
        id: i + 1,
        question: q.question,
        category: q.category,
        score: null,
        notes: "",
      })));
      toast({ title: "ใช้คำถามมาตรฐาน", description: "ไม่สามารถเชื่อมต่อ AI ได้ ใช้คำถามมาตรฐานแทน" });
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Save interview result
  const handleSaveInterview = async () => {
    // Validate all scores are filled
    const allScoresFilled = scoringCriteria.every(c => scores[c.key] !== null && scores[c.key] !== undefined);
    if (!allScoresFilled) {
      toast({ title: "กรุณากรอกคะแนนให้ครบทุกหัวข้อ", variant: "destructive" });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: "กรุณากรอก Comment", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const totalScore = Object.values(scores).reduce((sum, v) => sum + (v || 0), 0);

      // Save interview record
      const { error } = await supabase.from("interviews").insert({
        application_id: applicationId,
        interviewer_id: user?.id,
        status: "completed",
        result: totalScore >= 50 ? "passed" : "rejected",
        score: totalScore,
        notes: JSON.stringify({
          type: interviewType === "main" ? "first_interview" : "final_interview",
          scores,
          feedback,
          javis_questions: javisQuestions,
          ai_rating: aiRating,
          ai_comment: aiComment,
        }),
      });

      if (error) throw error;

      toast({ title: "บันทึกผลสัมภาษณ์เรียบร้อย", description: `คะแนนรวม: ${totalScore}/70` });
      setShowEmojiFeedback(true);
    } catch (err: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Save AI feedback
  const handleSaveAiFeedback = async () => {
    try {
      await supabase.from("interviews").update({
        notes: JSON.stringify({
          type: interviewType === "main" ? "first_interview" : "final_interview",
          scores,
          feedback,
          javis_questions: javisQuestions,
          ai_rating: aiRating,
          ai_comment: aiComment,
        }),
      }).eq("application_id", applicationId).eq("interviewer_id", user?.id);

      toast({ title: "ขอบคุณสำหรับ Feedback!", description: "ข้อมูลจะถูกนำไปปรับปรุง Javis AI" });
      navigate("/interviews");
    } catch {
      navigate("/interviews");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">ไม่พบข้อมูลผู้สมัคร</p>
        <Button variant="outline" onClick={() => navigate("/interviews")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> กลับหน้าสัมภาษณ์
        </Button>
      </div>
    );
  }

  // Emoji Feedback Screen (shown after interview submission)
  if (showEmojiFeedback) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              <Brain className="h-8 w-8 mx-auto mb-3 text-primary" />
              ให้คะแนน Javis AI
            </CardTitle>
            <p className="text-muted-foreground">
              คุณพอใจกับคำถามที่ Javis สร้างให้แค่ไหน?
              <br />
              <span className="text-xs">ข้อมูลนี้จะถูกนำไปปรับปรุงคุณภาพคำถาม AI สำหรับตำแหน่ง {candidate.position_title}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Emoji Rating */}
            <div className="flex justify-center gap-4">
              {emojiRatings.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setAiRating(r.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    aiRating === r.value
                      ? "bg-primary/10 scale-110 ring-2 ring-primary"
                      : "hover:bg-muted/50 hover:scale-105"
                  }`}
                >
                  <span className="text-4xl">{r.emoji}</span>
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                </button>
              ))}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label>ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)</Label>
              <Textarea
                value={aiComment}
                onChange={(e) => setAiComment(e.target.value)}
                placeholder="เช่น คำถามข้อไหนดี/ไม่ดี, อยากให้ถามเรื่องอะไรเพิ่ม..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/interviews")}>
                ข้าม
              </Button>
              <Button onClick={handleSaveAiFeedback} disabled={!aiRating}>
                <CheckCircle className="h-4 w-4 mr-2" />
                ส่ง Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Persistent Sidebar - Candidate Info */}
      <div className="w-80 flex-shrink-0 overflow-y-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/interviews")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> กลับ
        </Button>

        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 border-2 border-primary/40">
                <AvatarImage src={candidate.photo_url || undefined} />
                <AvatarFallback className="text-lg">{candidate.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-lg">{candidate.name}</h2>
                <p className="text-sm text-muted-foreground">{candidate.position_title || "ไม่ระบุตำแหน่ง"}</p>
              </div>
            </div>

            {/* AI Score */}
            {candidate.ai_fit_score && (
              <div className={`p-3 rounded-lg bg-gradient-to-br ${getScoreColor(candidate.ai_fit_score)} text-white text-center`}>
                <div className="text-2xl font-bold">{candidate.ai_fit_score}</div>
                <div className="text-xs opacity-80">AI Fit Score</div>
              </div>
            )}

            {/* Quick Info */}
            <div className="space-y-2 text-sm">
              {candidate.age && <div className="flex justify-between"><span className="text-muted-foreground">อายุ</span><span>{candidate.age} ปี</span></div>}
              {candidate.expected_salary && <div className="flex justify-between"><span className="text-muted-foreground">เงินเดือน</span><span>{Number(candidate.expected_salary).toLocaleString()} บาท</span></div>}
              {candidate.height && <div className="flex justify-between"><span className="text-muted-foreground">ส่วนสูง</span><span>{candidate.height} cm</span></div>}
              {candidate.weight && <div className="flex justify-between"><span className="text-muted-foreground">น้ำหนัก</span><span>{candidate.weight} kg</span></div>}
              {candidate.present_address && <div><span className="text-muted-foreground">ที่อยู่</span><p className="text-xs mt-1">{candidate.present_address}</p></div>}
              {candidate.email && <div className="flex justify-between"><span className="text-muted-foreground">อีเมล</span><span className="text-xs">{candidate.email}</span></div>}
              {candidate.phone && <div className="flex justify-between"><span className="text-muted-foreground">โทร</span><span>{candidate.phone}</span></div>}
            </div>

            {/* Resume Link */}
            {candidate.resume_url && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" /> ดู Resume
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Interview Area */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Interview Type Selector */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex-1">
            <Brain className="h-6 w-6 inline mr-2 text-primary" />
            ห้องสัมภาษณ์
          </h1>
          <div className="flex gap-2">
            <Button
              variant={interviewType === "main" ? "default" : "outline"}
              size="sm"
              onClick={() => setInterviewType("main")}
            >
              Main Interview
            </Button>
            <Button
              variant={interviewType === "final" ? "default" : "outline"}
              size="sm"
              onClick={() => setInterviewType("final")}
            >
              Final Interview
            </Button>
          </div>
        </div>

        {/* Javis AI Question Generator */}
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Javis AI - คำถามสัมภาษณ์
              </CardTitle>
              <Button
                onClick={handleGenerateQuestions}
                disabled={generatingQuestions}
                size="sm"
                className="gap-2"
              >
                {generatingQuestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {generatingQuestions ? "กำลังสร้าง..." : javisQuestions.length > 0 ? "สร้างใหม่" : "สร้างคำถาม"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {javisQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>กดปุ่ม "สร้างคำถาม" เพื่อให้ Javis AI สร้างคำถามสัมภาษณ์</p>
                <p className="text-xs mt-1">คำถามจะถูกปรับตาม JD และข้อมูลผู้สมัคร</p>
              </div>
            ) : (
              <div className="space-y-3">
                {javisQuestions.map((q, i) => (
                  <div key={q.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="text-[10px] mb-1">{q.category}</Badge>
                        <p className="text-sm font-medium">{q.question}</p>
                        <Textarea
                          placeholder="จดบันทึกคำตอบ..."
                          className="mt-2 text-xs min-h-[60px] resize-none"
                          value={q.notes}
                          onChange={(e) => {
                            const updated = [...javisQuestions];
                            updated[i] = { ...q, notes: e.target.value };
                            setJavisQuestions(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoring Section */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">คะแนนประเมิน</CardTitle>
            <p className="text-xs text-muted-foreground">
              ระดับ 1-10 (น้อยที่สุด = 1, มากที่สุด = 10) • เกณฑ์ผ่าน ≥ 50/70
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoringCriteria.map((criteria) => (
              <div key={criteria.key} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span className="text-sm flex-1">{criteria.label}</span>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={scores[criteria.key] ?? ""}
                  onChange={(e) => setScores(prev => ({
                    ...prev,
                    [criteria.key]: e.target.value === "" ? null : parseInt(e.target.value),
                  }))}
                  className="w-20 text-center"
                  placeholder="0-10"
                />
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t-2 font-bold">
              <span>รวมคะแนน</span>
              <span className="text-2xl text-primary">
                {Object.values(scores).reduce((sum, v) => sum + (v || 0), 0)} / 70
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comment */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              ความคิดเห็น
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="กรุณาให้ความคิดเห็นเกี่ยวกับผู้สมัคร... (บังคับกรอก)"
              rows={4}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-6">
          <Button
            onClick={handleSaveInterview}
            disabled={saving}
            size="lg"
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg"
          >
            {saving ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Save className="h-5 w-5 mr-2" /> จบการสัมภาษณ์และบันทึกผล</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
