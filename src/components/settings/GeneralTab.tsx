import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export function GeneralTab() {
  const { settings, isLoading, updateSettings, isUpdating } = useCompanySettings();
  
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 25,
    projects: 15,
    education: 10,
    other: 10,
  });

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name || "");
      setCompanyEmail(settings.company_email || "");
      setWeights(settings.ai_fit_score_weights);
    }
  }, [settings]);

  const handleSaveCompanyInfo = () => {
    updateSettings({
      company_name: companyName,
      company_email: companyEmail,
    });
  };

  const handleSaveWeights = () => {
    updateSettings({
      ai_fit_score_weights: weights,
    });
  };

  const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
    const newWeight = value[0];
    const oldWeight = weights[key];
    const diff = newWeight - oldWeight;
    
    // Distribute the difference among other weights
    const otherKeys = Object.keys(weights).filter(k => k !== key) as (keyof typeof weights)[];
    const adjustPerKey = diff / otherKeys.length;
    
    const newWeights = { ...weights, [key]: newWeight };
    otherKeys.forEach(k => {
      newWeights[k] = Math.max(0, Math.min(100, weights[k] - adjustPerKey));
    });
    
    // Normalize to ensure total is 100
    const total = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const factor = 100 / total;
      Object.keys(newWeights).forEach(k => {
        newWeights[k as keyof typeof weights] = Math.round(newWeights[k as keyof typeof weights] * factor);
      });
    }
    
    setWeights(newWeights);
  };

  if (isLoading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลบริษัท</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">ชื่อบริษัท</Label>
            <Input
              id="company"
              placeholder="บริษัท ABC จำกัด"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="hr@company.com"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveCompanyInfo} disabled={isUpdating}>
            {isUpdating ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>การเชื่อมต่อ Microsoft 365</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            เชื่อมต่อกับ Microsoft 365 เพื่อซิงค์อีเมลและปฏิทิน
          </p>
          <Button variant="outline" disabled>
            เชื่อมต่อ Microsoft 365 (เร็วๆ นี้)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Fit Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ปรับน้ำหนักการคำนวณคะแนน AI Fit Score (รวม 100%)
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>ทักษะ</Label>
                <span className="text-sm font-medium">{weights.skills}%</span>
              </div>
              <Slider
                value={[weights.skills]}
                onValueChange={(value) => handleWeightChange("skills", value)}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>ประสบการณ์</Label>
                <span className="text-sm font-medium">{weights.experience}%</span>
              </div>
              <Slider
                value={[weights.experience]}
                onValueChange={(value) => handleWeightChange("experience", value)}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>โครงการ</Label>
                <span className="text-sm font-medium">{weights.projects}%</span>
              </div>
              <Slider
                value={[weights.projects]}
                onValueChange={(value) => handleWeightChange("projects", value)}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>การศึกษา</Label>
                <span className="text-sm font-medium">{weights.education}%</span>
              </div>
              <Slider
                value={[weights.education]}
                onValueChange={(value) => handleWeightChange("education", value)}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>อื่นๆ</Label>
                <span className="text-sm font-medium">{weights.other}%</span>
              </div>
              <Slider
                value={[weights.other]}
                onValueChange={(value) => handleWeightChange("other", value)}
                max={100}
                step={1}
              />
            </div>
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">
              รวม: {Object.values(weights).reduce((sum, val) => sum + val, 0)}%
            </p>
            <Button onClick={handleSaveWeights} disabled={isUpdating}>
              {isUpdating ? "กำลังบันทึก..." : "บันทึกน้ำหนัก"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
