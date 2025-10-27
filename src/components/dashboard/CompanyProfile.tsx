import { Card, CardContent } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";

export function CompanyProfile() {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-32 -mt-32" />
      
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Company Logo & Name */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Talent X-Ray
              </h2>
              <p className="text-muted-foreground mt-1 text-lg">
                ระบบคัดกรองผู้สมัครงานด้วย AI
              </p>
            </div>
          </div>

          {/* Company Info Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 lg:ml-auto">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">อีเมล</p>
                <p className="font-medium text-sm">contact@talentxray.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">โทรศัพท์</p>
                <p className="font-medium text-sm">02-123-4567</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">เว็บไซต์</p>
                <p className="font-medium text-sm">www.talentxray.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">สถานที่ตั้ง</p>
                <p className="font-medium text-sm">กรุงเทพมหานคร</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Description */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-muted-foreground leading-relaxed">
            ระบบจัดการและคัดกรองผู้สมัครงานด้วยเทคโนโลยี AI ที่ช่วยให้องค์กรค้นหาบุคลากรที่เหมาะสมได้อย่างรวดเร็วและมีประสิทธิภาพ
            พร้อมระบบวิเคราะห์และรายงานที่ครบครัน
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
