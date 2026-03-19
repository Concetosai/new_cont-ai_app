import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { DollarSign, Users, Clock, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, Zap, FileText, Brain, ShoppingCart, AlertCircle, Calculator, Shield } from "lucide-react";
import contAiApi from "@/lib/api";

const kpis = [
  { label: "Saldo Total", value: "$248,500", change: "+12.4%", up: true, icon: DollarSign, color: "hsl(195, 100%, 50%)" },
  { label: "Clientes Activos", value: "34", change: "+3 este mes", up: true, icon: Users, color: "hsl(220, 90%, 60%)" },
  { label: "Pendientes SAT", value: "7", change: "Urgente", up: false, icon: Clock, color: "hsl(35, 95%, 55%)" },
  { label: "Ingresos Mes", value: "$82,300", change: "+8.1%", up: true, icon: TrendingUp, color: "hsl(145, 60%, 50%)" },
];

const recentActivity = [
  { type: "success", text: "Factura CFDI enviada — TechCorp MX", time: "Hace 2h", amount: "+$12,500" },
  { type: "warning", text: "Gasto pendiente de categorizar", time: "Hace 4h", amount: "-$3,200" },
  { type: "success", text: "Declaración ISR validada por contador", time: "Ayer", amount: "" },
  { type: "alert", text: "Vencimiento IMSS en 3 días", time: "Programado", amount: "-$8,900" },
];

const featureButtons = [
  { title: "🟡 Impuestos SAT", desc: "ISR/IVA automático", icon: Calculator, path: "/impuestos", color: "hsl(35, 95%, 55%)" },
  { title: "⚫ Integraciones", desc: "ML/TikTok/Shopify", icon: ShoppingCart, path: "/integraciones", color: "hsl(270, 80%, 60%)" },
  { title: "💥 Simulador", desc: "Calcula escenarios", icon: Brain, path: "/simulador", color: "hsl(195, 100%, 50%)" },
  { title: "🔴 Alertas", desc: "Notificaciones urgentes", icon: AlertCircle, path: "/alertas", color: "hsl(0, 72%, 55%)" },
  { title: "💥 Score Fiscal", desc: "Tu salud ante SAT", icon: Shield, path: "/score", color: "hsl(145, 60%, 50%)" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [linkedClients, setLinkedClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const uId = localStorage.getItem('userId');
    setRole(userRole);
    setUserId(uId);

    if (uId && userRole === 'contador') {
      loadClients(uId);
    }
  }, []);

  const loadClients = async (uId: string) => {
    setLoading(true);
    try {
      const result = await contAiApi.getLinkedClients(uId);
      if (result.success && result.data) {
        setLinkedClients(result.data);
      }
    } catch (error) {
      console.error('Error loading clients for dashboard:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
              {role === 'contador' ? 'Panel de Control Contador' : 'Panel General'}
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
              {role === 'contador' 
                ? 'Monitorea el estado fiscal y gastos de todos tus clientes vinculados' 
                : 'Resumen financiero en tiempo real + Acceso rápido a funciones IA'}
            </p>
          </div>

          {role === 'contador' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>TERMINAL DE CONEXIÓN ACTIVA</span>
              </div>
              <div className="w-px h-4 bg-emerald-500/30 mx-1" />
              <span>{linkedClients.length} CLIENTES EN LÍNEA</span>
            </motion.div>
          )}
        </div>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} variants={item} className="kpi-card rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <span className={`flex items-center text-xs font-medium gap-0.5`}
                style={{ color: kpi.up ? "hsl(145, 60%, 55%)" : "hsl(0, 72%, 60%)" }}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: "hsl(210, 20%, 92%)" }}>
              {(role === 'contador' && kpi.label === "Clientes Activos") ? linkedClients.length : kpi.value}
            </div>
            <div className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* NEW: Feature Quick Actions - MISSING BUTTONS ADDED */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-6 tracking-wide uppercase flex items-center gap-2"
          style={{ color: "hsl(195, 100%, 60%)" }}>
          <Zap className="w-4 h-4" />
          Funciones CONT-AI Premium
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureButtons.map((btn, i) => (
            <motion.div key={btn.title} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.3 + i * 0.1 }}
              className="group"
            >
              <Link to={btn.path} className="kpi-card hover:shadow-glow p-5 rounded-xl h-full flex flex-col items-center gap-3 text-center transition-all group-hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ 
                    background: `${btn.color}20`, 
                    border: `1px solid ${btn.color}40`,
                    color: btn.color 
                  }}>
                  <btn.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "hsl(210, 20%, 92%)" }}>
                    {btn.title}
                  </h3>
                  <p className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>
                    {btn.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <motion.div
          variants={container} initial="hidden" animate="show"
          className="glass-card rounded-xl p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-4 tracking-wide uppercase"
            style={{ color: "hsl(195, 100%, 60%)" }}>
            Actividad Reciente
          </h2>
          <div className="space-y-3">
            {recentActivity.map((act, i) => (
              <motion.div key={i} variants={item}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "hsl(210 35% 8% / 0.6)", border: "1px solid hsl(210 30% 14%)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: act.type === "success" ? "hsl(145 60% 40% / 0.2)" :
                      act.type === "warning" ? "hsl(35 95% 55% / 0.2)" : "hsl(0 72% 51% / 0.2)"
                  }}>
                  {act.type === "success" ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "hsl(145, 60%, 55%)" }} /> :
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: act.type === "warning" ? "hsl(35, 95%, 60%)" : "hsl(0, 72%, 65%)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "hsl(210, 20%, 80%)" }}>{act.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(210, 15%, 45%)" }}>{act.time}</p>
                </div>
                {act.amount && (
                  <span className="text-xs font-bold flex-shrink-0"
                    style={{ color: act.amount.startsWith("+") ? "hsl(145, 60%, 55%)" : "hsl(0, 72%, 60%)" }}>
                    {act.amount}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(195, 100%, 60%)" }}>
            Resumen Fiscal
          </h2>

          {[
            { label: "ISR Estimado", value: "$12,400", progress: 65 },
            { label: "IVA Pendiente", value: "$8,200", progress: 42 },
            { label: "IMSS", value: "$4,800", progress: 80 },
          ].map((item, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span style={{ color: "hsl(210, 15%, 60%)" }}>{item.label}</span>
                <span className="font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>{item.value}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "hsl(210 30% 15%)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(195, 100%, 50%), hsl(220, 90%, 55%))" }}
                />
              </div>
            </div>
          ))}

          <div className="vein-line" />

          <div className="p-3 rounded-lg text-center"
            style={{ background: "hsl(195 100% 50% / 0.08)", border: "1px solid hsl(195 100% 50% / 0.2)" }}>
            <p className="text-xs" style={{ color: "hsl(195, 60%, 70%)" }}>Próxima declaración</p>
            <p className="text-lg font-bold mt-1" style={{ color: "hsl(195, 100%, 65%)" }}>17 Mar 2026</p>
            <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>5 días restantes</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

