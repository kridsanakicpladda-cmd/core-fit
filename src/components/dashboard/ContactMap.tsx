import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export function ContactMap() {

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Contact Information */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            ช่องทางติดต่อ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">ที่อยู่</p>
              <p className="text-sm text-muted-foreground">
                <strong>สำนักงานใหญ่:</strong> 42 อาคารไอ ซี พี ชั้น 5 ถนนสุรวงศ์ แขวงสี่พระยา เขตบางรัก กรุงเทพมหานคร 10500<br />
                <strong>โรงงานนครปฐม:</strong> 151 หมู่ที่ 8 ตำบลสามวายเผือก อำเภอเมืองนครปฐม จังหวัดนครปฐม 73000
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">โทรศัพท์</p>
              <p className="text-sm text-muted-foreground">
                02-0299888 ต่อ 101<br />
                065-5091216
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">อีเมล</p>
              <p className="text-sm text-muted-foreground">
                hr@icpladda.com
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">เวลาทำการ</p>
              <p className="text-sm text-muted-foreground">
                <strong>สำนักงานใหญ่กรุงเทพ:</strong><br />
                จันทร์ - ศุกร์ 08:30-17:30 น.<br />
                เสาร์-อาทิตย์ ปิดทำการ
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>โรงงานนครปฐม:</strong><br />
                จันทร์ - เสาร์ 08:00-17:00 น.<br />
                อาทิตย์ ปิดทำการ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            แผนที่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href="https://www.google.com/maps/place/42+Soi+Surawong+Plaza,+Suriwong+Rd,+Si+Phraya,+Bang+Rak,+Bangkok+10500"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 relative group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.8537267234586!2d100.52396931483176!3d13.727899990358992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e298c95f7e29c9%3A0x4a1e4d6c1e2a7b1c!2z4Lit4Liy4LiE4Liy4Lij4LmE4Lit4LiL4Li14Lie4Li1!5e0!3m2!1sth!2sth!4v1620000000000!5m2!1sth!2sth"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="แผนที่บริษัท ICP Ladda"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            </div>
          </a>
          <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3" />
            คลิกเพื่อเปิดใน Google Maps
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
