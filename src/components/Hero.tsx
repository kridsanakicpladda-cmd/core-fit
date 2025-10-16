import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-hero py-24 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6 transition-spring hover:scale-105">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered Recruitment Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          See Candidate Potential
          <br />
          <span className="text-primary-light">With Perfect Clarity</span>
        </h1>

        <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
          Talent X-Ray ช่วยให้คุณมองเห็นศักยภาพผู้สมัครอย่างลึกซึ้ง โปร่งใส และยุติธรรม 
          ด้วย AI ที่อธิบายเหตุผลได้ ลดเวลาคัดเลือก เพิ่มคุณภาพการจ้าง
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 shadow-xl group px-8 py-6 text-lg transition-spring hover:scale-105"
          >
            เริ่มต้นใช้งานฟรี
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-smooth" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg transition-smooth"
          >
            ดูตัวอย่างการทำงาน
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-spring hover:scale-105 hover:bg-white/15">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary-light" />
              <div className="text-3xl font-bold text-white">50%</div>
            </div>
            <div className="text-white/80">ลดเวลาคัดกรองผู้สมัคร</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-spring hover:scale-105 hover:bg-white/15">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary-light" />
              <div className="text-3xl font-bold text-white">80%</div>
            </div>
            <div className="text-white/80">ความแม่นยำการแมตช์</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-spring hover:scale-105 hover:bg-white/15">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-light" />
              <div className="text-3xl font-bold text-white">70%</div>
            </div>
            <div className="text-white/80">ลดเวลานัดสัมภาษณ์</div>
          </div>
        </div>
      </div>
    </section>
  );
};
