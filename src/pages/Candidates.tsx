import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, UserPlus, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCandidatesDB, DBCandidate } from "@/hooks/useCandidatesDB";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

export default function Candidates() {
  const { toast } = useToast();
  const { candidates, isLoading } = useCandidatesDB();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // For now, show all candidates in "all" tab
      // You can add status filtering when applications table is connected
      return matchesSearch;
    });
  }, [candidates, searchQuery, activeTab]);

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const formatAppliedDate = (dateString: string | null) => {
    if (!dateString) return "ไม่ระบุ";
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: th 
      });
    } catch {
      return "ไม่ระบุ";
    }
  };

  const handleDownloadResume = (resumeUrl: string | null, name: string) => {
    if (!resumeUrl) {
      toast({
        title: "ไม่พบ Resume",
        description: "ผู้สมัครยังไม่ได้แนบ Resume",
        variant: "destructive",
      });
      return;
    }
    window.open(resumeUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ผู้สมัคร
          </h1>
          <p className="text-muted-foreground">
            จัดการและติดตามสถานะผู้สมัครทั้งหมด ({candidates.length} คน)
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="ค้นหาผู้สมัคร..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All ({candidates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCandidates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">ไม่พบผู้สมัคร</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Checkbox
                          checked={selectedCandidates.includes(candidate.id)}
                          onCheckedChange={() => toggleCandidateSelection(candidate.id)}
                          className="mt-1"
                        />
                        <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-sm">
                          <AvatarImage src={candidate.photo_url || undefined} alt={candidate.name} />
                          <AvatarFallback>
                            {candidate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {candidate.ai_fit_score && (
                          <div className="relative">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-xl shadow-primary">
                              {candidate.ai_fit_score}
                            </div>
                            {candidate.ai_fit_score >= 90 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Star className="h-3 w-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {candidate.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {candidate.source}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{candidate.email}</span>
                            {candidate.phone && (
                              <>
                                <span>•</span>
                                <span>{candidate.phone}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>สมัครเมื่อ: {formatAppliedDate(candidate.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {candidate.resume_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-accent transition-colors"
                            onClick={() => handleDownloadResume(candidate.resume_url, candidate.name)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            ดาวน์โหลด Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bulk Action Popup */}
      {selectedCandidates.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  เลือก {selectedCandidates.length} คน
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedCandidates([])}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
