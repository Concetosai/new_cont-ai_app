import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle, Zap, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const forecastData = [
  { mes: "Mar", real: 48500, proyectado: 48500 },
  { mes: "Abr", proyectado: 52100 },
  { mes: "May", proyectado: 55800 },
  { mes: "Jun", proyectado: 61200 },
  { mes: "Jul", proyectado: 58700 },
  { mes: "Ago", proyectado: 67400 },
];

const taxAlerts = [
  { type: "warning", label: "ISR Mensual Estimado", value: "$12,400", due: "17 Abr 2026" },
  { type: "info", label: "IVA a Pagar", value: "$8,200", due: "17 Abr 2026" },
  { type: "success", label: "IMSS Patronal", value: "$4,800", due: "17 Mar 2026 ✓" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs"
        style={{ background: "hsl(210 35% 10%)", border: "1px solid hsl(210 30% 20%)", color: "hsl(210, 20%, 85%)" }}>
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>${p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Pronostico() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Pronóstico Fiscal</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: "hsl(270 80% 60% / 0.12)", border: "1px solid hsl(270 80% 60% / 0.25)", color: "hsl(270, 80%, 70%)" }}>
            <Brain className="w-3 h-3" />
            IA Predictiva
          </div>
        </div>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
          Análisis inteligente basado en tus ganancias reales
        </p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      {/* Flujo de caja projection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase"
            style={{ color: "hsl(195, 100%, 60%)" }}>
            Proyección de Ingresos
          </h2>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "hsl(195, 100%, 50%)" }} />
              <span style={{ color: "hsl(210, 15%, 55%)" }}>Real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "hsl(270, 80%, 60%)" }} />
              <span style={{ color: "hsl(210, 15%, 55%)" }}>Proyectado</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forecastData} margin={{ top: 0, right: 0, bottom: 0, left: -15 }}>
            <defs>
              <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(195, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(195, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(270, 80%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(270, 80%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fill: "hsl(210, 15%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(210, 15%, 45%)", fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="real" stroke="hsl(195, 100%, 50%)" strokeWidth={2}
              fill="url(#gradReal)" dot={{ fill: "hsl(195, 100%, 50%)", r: 4 }} />
            <Area type="monotone" dataKey="proyectado" stroke="hsl(270, 80%, 60%)" strokeWidth={2}
              strokeDasharray="5 3" fill="url(#gradProj)" dot={{ fill: "hsl(270, 80%, 60%)", r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tax obligations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase mb-4"
            style={{ color: "hsl(195, 100%, 60%)" }}>
            Obligaciones Fiscales
          </h2>
          <div className="space-y-3">
            {taxAlerts.map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: alert.type === "warning" ? "hsl(35 95% 55% / 0.08)" :
                    alert.type === "success" ? "hsl(145 60% 40% / 0.08)" : "hsl(195 100% 50% / 0.08)",
                  border: `1px solid ${alert.type === "warning" ? "hsl(35 95% 55% / 0.2)" :
                    alert.type === "success" ? "hsl(145 60% 40% / 0.2)" : "hsl(195 100% 50% / 0.2)"}`
                }}>
                {alert.type === "success"
                  ? <CheckCircle className="w-4 h-4" style={{ color: "hsl(145, 60%, 55%)" }} />
                  : <AlertTriangle className="w-4 h-4" style={{ color: alert.type === "warning" ? "hsl(35, 95%, 60%)" : "hsl(195, 100%, 60%)" }} />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: "hsl(210, 20%, 82%)" }}>{alert.label}</p>
                  <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>{alert.due}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>{alert.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4" style={{ color: "hsl(270, 80%, 65%)" }} />
            <h2 className="text-sm font-semibold tracking-wide uppercase"
              style={{ color: "hsl(195, 100%, 60%)" }}>
              Insights IA
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { text: "Con base en tus gastos actuales, podrías deducir hasta $18,200 adicionales este trimestre.", icon: "💡" },
              { text: "Tu flujo de caja proyecta crecimiento del 28% para Q2 2026.", icon: "📈" },
              { text: "Recomendamos crear una provisión de $12,400 para el ISR de abril.", icon: "🛡️" },
            ].map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }}
                className="flex gap-3 p-3 rounded-lg"
                style={{ background: "hsl(210 35% 8% / 0.5)", border: "1px solid hsl(210 30% 15%)" }}>
                <span className="text-sm flex-shrink-0">{insight.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(210, 15%, 65%)" }}>{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
