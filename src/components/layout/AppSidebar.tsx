import { LayoutDashboard, Users, Briefcase, Calendar, FileText, Settings, FileUp, ClipboardList, UserPlus } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { addSparkleEffect } from "@/lib/sparkle";

const menuItems = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Quick Apply", url: "/quick-apply", icon: UserPlus },
  { title: "Job Application", url: "/job-application", icon: FileUp },
  { title: "Job Requisitions", url: "/job-requisitions", icon: ClipboardList },
  { title: "Candidates", url: "/candidates", icon: Users },
  { title: "Interviews", url: "/interviews", icon: Calendar },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="bg-gradient-to-b from-background to-muted/20">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      onClick={addSparkleEffect}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-medium border border-primary/30 shadow-accent transition-all duration-300 hover:scale-105 hover:shadow-hover group"
                          : "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent-vibrant/20 hover:border hover:border-accent/30 transition-all duration-300 hover:scale-105 hover:shadow-sm group"
                      }
                    >
                      <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                      {open && (
                        <span className="transition-all duration-300 group-hover:translate-x-1">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
