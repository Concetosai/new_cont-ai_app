import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Shield, CheckCircle, AlertTriangle, Zap, Calculator } from 'lucide-react';

interface Client {
  id: string;
  nombre: string;
  email: string;
  rfc?: string;
}

export default function ClientProxyDashboard() {
  const { client, searchTerm } = useOutletContext<{ client: Client; searchTerm: string }>();

  const kpis = [
    { label: "Saldo Total", value: "$248,500", change: "+12.4%", up: true, icon: TrendingUp, color: "hsl(195, 100%, 50%)" },
    { label: "Gastos Mes", value: "$42,300", change: "+8.1%", up: true, icon: FileText, color: "hsl(220, 90%, 60%)" },
    { label: "IVA Acreditable", value: "$6,768", change: "Disponible", up: true, icon: Calculator, color: "hsl(145, 60%, 50%)" },
    { label: "Alertas SAT", value: "2", change: "Revisar", up: false, icon: AlertTriangle, color: "hsl(35, 95%, 55%)" },
  ];

  const recentActivity = [
    { type: "success", text: "Factura F-4521 enviada — TechCorp MX", time: "Hace 2h", amount: "+$12,500" },
    { type: "warning", text: "Gasto sin categorizar", time: "Hace 4h", amount: "-$3,200" },
    { type: "success", text: "Declaración ISR validada", time: "Ayer", amount: "" },
    { type: "alert", text: "Vencimiento IMSS en 3 días", time: "Programado", amount: "-$8,900" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
          Dashboard de {client.nombre}
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
          Vista general del estado financiero
        </p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} className="kpi-card rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <span className={`flex items-center text-xs font-medium gap-0.5`}
                style={{ color: kpi.up ? "hsl(145, 60%, 55%)" : "hsl(0, 72%, 60%)" }}>
                {kpi.up ? '↑' : '↓'} {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: "hsl(210, 20%, 92%)" }}>
              {kpi.value}
            </div>
            <div className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-6 tracking-wide uppercase flex items-center gap-2"
          style={{ color: "hsl(195, 100%, 60%)" }}>
          <Zap className="w-4 h-4" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition-all text-center group">
            <FileText className="w-5 h-5 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Descargar XMLs</span>
          </button>
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition-all text-center group">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Reporte Mensual</span>
          </button>
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition-all text-center group">
            <Shield className="w-5 h-5 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Score Fiscal</span>
          </button>
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition-all text-center group">
            <CheckCircle className="w-5 h-5 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Marcar Revisado</span>
          </button>
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold mb-4 tracking-wide uppercase"
          style={{ color: "hsl(195, 100%, 60%)" }}>
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {recentActivity.map((act, i) => (
            <motion.div key={i}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: "hsl(210 35% 8% / 0.6)", border: "1px solid hsl(210 30% 14%)" }}
            >
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
    </div>
  );
}
