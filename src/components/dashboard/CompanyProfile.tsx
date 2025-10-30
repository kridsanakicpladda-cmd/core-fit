import { Card, CardContent } from "@/components/ui/card";
import { Award, CheckCircle2 } from "lucide-react";
import companyFarmer from "@/assets/company-farmer.jpg";
import companyRice from "@/assets/company-rice.jpg";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export function CompanyProfile() {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const certifications = [
    "ISO 9001:2015 - ระบบบริหารงานคุณภาพ",
    "ISO 14001:2015 - ระบบจัดการสิ่งแวดล้อม",
    "ISO/IEC 17025:2017 - มาตรฐานห้องปฏิบัติการ",
    "GMP - สำนักงานคณะกรรมการอาหารและยา",
  ];

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-background to-primary/5 hover:shadow-xl transition-all duration-500">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success/5 via-primary/5 to-transparent rounded-full blur-3xl -ml-48 -mb-48" />

      <CardContent className="p-0 relative">
        {/* Hero Images Carousel */}
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={() => plugin.current.stop()}
          onMouseLeave={() => plugin.current.play()}
        >
          <CarouselContent>
            {carouselImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-96 md:h-[500px] overflow-hidden">
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                  {/* แก้ไข overlay ให้ตัวอักษรอ่านชัด: ใช้พื้นหลังโปร่ง/เบลอเล็กน้อย แทน drop-shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex items-end p-6 md:p-8">
                    <div className="max-w-[90%]">
                      <span className="inline-block rounded-xl bg-black/40 backdrop-blur-sm px-4 py-2">
                        <h3 className="text-xl md:text-4xl font-bold leading-tight tracking-tight text-white">
                          “{image.caption}”
                        </h3>
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        {/* Company Information Section */}
        <div className="p-8 md:p-10">
          {/* Company Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-lg shadow-success/20">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground mb-2">
              <div className="h-1 w-1 rounded-full bg-success animate-pulse" />
              <span>ผู้นำธุรกิจเคมีเกษตรมากว่า 50 ปี</span>
              <div className="h-1 w-1 rounded-full bg-success animate-pulse" />
            </div>
          </div>

          {/* Company Description */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-accent/50 to-accent/30 p-6 md:p-8 rounded-2xl border border-border/50 mb-8 hover:shadow-md transition-all duration-300">
              <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                เป็นบริษัทชั้นนำในด้านธุรกิจเคมีเกษตร ดำเนินธุรกิจนาน{" "}
                <span className="font-bold text-success">50 ปี</span> ดำเนินการผลิต นำเข้า
                และจัดจำหน่ายสารเคมีป้องกันศัตรูพืช ปุ๋ยเคมี และฮอร์โมนสำหรับพืช ฯลฯ
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground/90 mt-4">
                ทางบริษัทให้ความสำคัญอย่างยิ่งต่อเนื่องเสมอมาในการควบคุมคุณภาพของผลิตภัณฑ์ และใส่ใจในการรักษาสิ่งแวดล้อม
                พร้อมห้องปฏิบัติการที่ทันสมัยเพื่อตรวจสอบคุณภาพอย่างเข้มงวด
              </p>
            </div>

            {/* Certifications Grid */}
            <div className="bg-gradient-to-br from-primary/5 to-success/5 p-6 md:p-8 rounded-2xl border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">มาตรฐานและการรับรอง</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card/80 hover:bg-card transition-all duration-300 hover:shadow-md border border-border/30 group"
                  >
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm leading-relaxed">{cert}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  รับรองโดย <span className="font-semibold text-primary">Bureau Veritas (BV)</span>,
                  <span className="font-semibold text-primary"> สำนักบริหารและรับรองห้องปฏิบัติการ</span> และ
                  <span className="font-semibold text-primary"> กระทรวงสาธารณสุข</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
