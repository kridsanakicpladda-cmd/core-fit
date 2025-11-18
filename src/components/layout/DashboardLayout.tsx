import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo.png";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="ml-4 font-semibold text-lg">Talent X-Ray</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
              <img src={logo} alt="ICP Ladda Logo" className="h-10" />
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
