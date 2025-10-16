import { Button } from "@/components/ui/button";
import { Brain, Menu } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Talent X-Ray</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition-smooth font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-smooth font-medium">
              How it Works
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-smooth font-medium">
              Pricing
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-smooth font-medium">
              About
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">เข้าสู่ระบบ</Button>
            <Button>เริ่มต้นฟรี</Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <a href="#features" className="block py-2 text-foreground hover:text-primary transition-smooth font-medium">
              Features
            </a>
            <a href="#how-it-works" className="block py-2 text-foreground hover:text-primary transition-smooth font-medium">
              How it Works
            </a>
            <a href="#pricing" className="block py-2 text-foreground hover:text-primary transition-smooth font-medium">
              Pricing
            </a>
            <a href="#about" className="block py-2 text-foreground hover:text-primary transition-smooth font-medium">
              About
            </a>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" className="w-full">เข้าสู่ระบบ</Button>
              <Button className="w-full">เริ่มต้นฟรี</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
