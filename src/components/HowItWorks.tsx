import { Card } from "@/components/ui/card";
import { Upload, Brain, Users, Calendar, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "อัปโหลด JD & เรซูเม่",
    description: "สร้างตำแหน่งงานและอัปโหลดเรซูเม่ของผู้สมัคร ระบบจะวิเคราะห์อัตโนมัติ"
  },
  {
    icon: Brain,
    number: "02",
    title: "AI วิเคราะห์และให้คะแนน",
    description: "Fit Score พร้อมเหตุผลประกอบ จัดอันดับผู้สมัครที่เหมาะสมที่สุด"
  },
  {
    icon: Calendar,
    number: "03",
    title: "นัดสัมภาษณ์อัตโนมัติ",
    description: "เชื่อมต่อ Microsoft 365 ส่งอีเมลเชิญและสร้าง Teams meeting ทันที"
  },
  {
    icon: Users,
    number: "04",
    title: "ประเมินผลสัมภาษณ์",
    description: "ผู้สัมภาษณ์ให้คะแนนและคอมเมนต์ ระบบรวมผลแบบเรียลไทม์"
  },
  {
    icon: FileText,
    number: "05",
    title: "สร้าง Insight Report",
    description: "สรุปข้อมูลจากทุกขั้นตอน สร้างรายงาน PDF เพื่อการตัดสินใจ"
  },
  {
    icon: CheckCircle,
    number: "06",
    title: "ตัดสินใจจ้าง",
    description: "ตัดสินใจอย่างมั่นใจด้วยข้อมูลที่ครบถ้วน โปร่งใส และตรวจสอบได้"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            วิธีการทำงานของ Talent X-Ray
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            6 ขั้นตอนง่ายๆ จากการคัดกรองไปจนถึงการจ้างงาน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative p-6 border-2 hover:border-primary transition-spring hover:scale-105"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {step.number}
              </div>
              
              <div className="bg-primary-light w-14 h-14 rounded-xl flex items-center justify-center mb-4 mt-2">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
