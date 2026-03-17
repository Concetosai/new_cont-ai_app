import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AIAssistant } from "@/components/AIAssistant";
import { Menu } from "lucide-react";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative"
        style={{ background: "linear-gradient(160deg, #0A1929 0%, #050c14 60%, #000000 100%)" }}>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Header */}
          <header className="h-14 flex items-center px-4 gap-4 flex-shrink-0"
            style={{ borderBottom: "1px solid hsl(210 30% 12%)", background: "hsl(210 50% 4% / 0.8)", backdropFilter: "blur(12px)" }}>
            <SidebarTrigger
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105"
              style={{
                background: "hsl(210 35% 12%)",
                border: "1px solid hsl(210 30% 18%)",
                color: "hsl(195, 100%, 60%)"
              }}
            >
              <Menu className="w-4 h-4" />
            </SidebarTrigger>

            <div className="vein-line flex-1" style={{ maxWidth: "200px" }} />

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: "hsl(195 100% 50% / 0.1)",
                  border: "1px solid hsl(195 100% 50% / 0.2)",
                  color: "hsl(195, 100%, 70%)"
                }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                <span className="font-medium">Sistema Activo</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Floating AI Assistant */}
        <AIAssistant />
      </div>
    </SidebarProvider>
  );
}
