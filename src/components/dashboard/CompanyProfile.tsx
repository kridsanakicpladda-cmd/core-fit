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

  const carouselImages = [
    { src: companyFarmer, alt: "ยกระดับคุณภาพชีวิตเกษตรกรไทย" },
    { src: companyRice, alt: "ใส่ใจทุกรายละเอียดในการดูแลพืช" },
  ];

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-background to-primary/5 hover:shadow-xl transition-all duration-500 animate-fade-in">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-primary-glow/5 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />
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
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        {/* Company Information Section */}
        <div className="p-6 md:p-8">
          {/* Company Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-md shadow-success/20">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-base text-muted-foreground mb-2">
              <div className="h-1 w-1 rounded-full bg-success animate-pulse" />
              <span>ผู้นำธุรกิจเคมีเกษตรมากว่า 50 ปี</span>
              <div className="h-1 w-1 rounded-full bg-success animate-pulse" />
            </div>
          </div>

          {/* Company Description */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-accent/50 to-accent/30 p-4 md:p-6 rounded-xl border border-border/50 mb-6 hover:shadow-md transition-all duration-300">
              <p className="text-sm md:text-base leading-relaxed text-foreground/90">
                เป็นบริษัทชั้นนำในด้านธุรกิจเคมีเกษตร ดำเนินธุรกิจนาน{" "}
                <span className="font-bold text-success">50 ปี</span> ดำเนินการผลิต นำเข้า
                และจัดจำหน่ายสารเคมีป้องกันศัตรูพืช ปุ๋ยเคมี และฮอร์โมนสำหรับพืช ฯลฯ
              </p>
              <p className="text-sm md:text-base leading-relaxed text-foreground/90 mt-3">
                ทางบริษัทให้ความสำคัญอย่างยิ่งต่อเนื่องเสมอมาในการควบคุมคุณภาพของผลิตภัณฑ์ และใส่ใจในการรักษาสิ่งแวดล้อม
                พร้อมห้องปฏิบัติการที่ทันสมัยเพื่อตรวจสอบคุณภาพอย่างเข้มงวด
              </p>
            </div>

            {/* Certifications Grid */}
            <div className="bg-gradient-to-br from-primary/5 to-success/5 p-3 rounded-lg border border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">มาตรฐานและการรับรอง</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-card/60 hover:bg-card transition-colors border border-border/20"
                  >
                    <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                    <span className="text-[11px] leading-tight">{cert}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2 pt-2 border-t border-border/30">
                รับรองโดย <span className="font-medium">BV</span>, <span className="font-medium">สำนักบริหารห้องปฏิบัติการ</span> และ <span className="font-medium">กระทรวงสาธารณสุข</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
