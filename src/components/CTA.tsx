import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "ทดลองใช้งานฟรี 14 วัน ไม่ต้องใช้บัตรเครดิต",
  "ตั้งค่าง่าย เริ่มใช้งานได้ภายใน 5 นาที",
  "ทีม Support พร้อมช่วยเหลือตลอด 24/7",
  "ปลอดภัยตามมาตรฐาน PDPA/GDPR"
];

export const CTA = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          พร้อมที่จะเปลี่ยนวิธีคัดเลือกคนของคุณแล้วหรือยัง?
        </h2>
        
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          เริ่มใช้ Talent X-Ray วันนี้ และค้นพบผู้สมัครที่ใช่ให้กับองค์กรของคุณ
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 shadow-xl group px-8 py-6 text-lg transition-spring hover:scale-105"
          >
            เริ่มทดลองใช้ฟรี
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-smooth" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg"
          >
            นัดหมายสาธิต
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-white/90 text-left">
              <CheckCircle className="w-5 h-5 text-primary-light flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
