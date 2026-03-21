import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ScanLine,
  BarChart3,
  TrendingUp,
  FileText,
  MessageSquare,
  Users,
  Vault,
  Settings,
  Calculator,
  ShoppingCart,
  Bell,
  ShieldCheck,
  MessageCircle,
  LogOut,
} from "lucide-react";
import contAiLogo from "@/assets/cont-ai-logo.png";

const navItems = [
  // Core
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mis Gastos", url: "/gastos", icon: ScanLine },
  { title: "Facturación", url: "/facturacion", icon: FileText },

  // AI Premium Features ⭐ NEW
  { title: "🟡 Impuestos", url: "/impuestos", icon: Calculator },
  { title: "⚫ Integraciones", url: "/integraciones", icon: ShoppingCart },
  { title: "🔴 Alertas", url: "/alertas", icon: Bell },

  // Analysis
  { title: "Análisis", url: "/analisis", icon: BarChart3 },
  { title: "Pronóstico", url: "/pronostico", icon: TrendingUp },

  // Pro
  { title: "💥 Simulador", url: "/simulador", icon: TrendingUp },
  { title: "💥 Score Fiscal", url: "/score", icon: ShieldCheck },

  // Team
  { title: "Mensajería", url: "/chat", icon: MessageSquare },
  { title: "Clientes", url: "/clients", icon: Users, role: "contador" },
  { title: "Bóveda Fiscal", url: "/boveda", icon: Vault },
  { title: "Configuración", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const isActive = (path: string) => location.pathname === path;

  // Filter nav items by role
  const filteredNavItems = navItems.filter(item => {
    if (item.role && userRole !== item.role) {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('googleToken');
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon"
      style={{
        background: "hsl(210, 50%, 3%)",
        borderRight: "1px solid hsl(210, 30%, 12%)"
      }}>

      <SidebarHeader className="p-4 space-y-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src={contAiLogo} alt="CONT-AI" className="w-8 h-8 object-contain flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-brand text-sm font-black text-glow block"
                style={{ color: "hsl(195, 100%, 75%)", letterSpacing: "0.15em" }}>
                CONT-AI
              </span>
              <span className="text-xs" style={{ color: "hsl(210, 15%, 45%)" }}>
                Contabilidad IA
              </span>
            </div>
          )}
        </div>

        {userRole === 'contador' && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider"
            style={{
              background: "hsl(145 60% 40% / 0.1)",
              border: "1px solid hsl(145 60% 40% / 0.3)",
              color: "hsl(145, 60%, 65%)"
            }}
          >
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_hsl(145,60%,50%)]" />
            VINCULACIÓN SMART ACTIVA
          </motion.div>
        )}
      </SidebarHeader>

      {!collapsed && <div className="vein-line mx-4 mb-2" />}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {filteredNavItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                          ? "active"
                          : ""
                          }`}
                        style={{
                          color: active ? "hsl(195, 100%, 60%)" : "hsl(210, 15%, 60%)",
                          background: active ? "hsl(195 100% 50% / 0.12)" : "transparent",
                          boxShadow: active ? "inset 2px 0 0 hsl(195 100% 50%)" : "none",
                        }}
                        activeClassName=""
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" style={{
                          color: active ? "hsl(195, 100%, 60%)" : "hsl(210, 15%, 60%)"
                        }} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 mb-2"
          style={{
            background: "hsl(0 60% 40% / 0.1)",
            border: "1px solid hsl(0 60% 40% / 0.2)",
            color: "hsl(0, 60%, 60%)"
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>

        {!collapsed && (
          <a
            href="https://wa.me/528332892730"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{
              background: "hsl(120 60% 40% / 0.1)",
              border: "1px solid hsl(120 60% 40% / 0.2)",
              color: "hsl(120, 60%, 60%)"
            }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Ventas y Servicio</span>
          </a>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

