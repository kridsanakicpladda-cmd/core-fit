import { Brain } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-navy text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Talent X-Ray</span>
            </div>
            <p className="text-white/70 leading-relaxed max-w-md">
              AI-powered recruitment platform ที่ช่วยให้คุณมองเห็นศักยภาพผู้สมัครอย่างลึกซึ้ง 
              โปร่งใส และยุติธรรม
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-white/70">
              <li><a href="#" className="hover:text-white transition-smooth">Features</a></li>
              <li><a href="#" className="hover:text-white transition-smooth">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-smooth">Security</a></li>
              <li><a href="#" className="hover:text-white transition-smooth">Integrations</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-white/70">
              <li><a href="#" className="hover:text-white transition-smooth">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-smooth">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-smooth">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-smooth">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-sm">
            © 2025 Talent X-Ray. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/70">
            <a href="#" className="hover:text-white transition-smooth">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-smooth">Terms of Service</a>
            <a href="#" className="hover:text-white transition-smooth">PDPA</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
