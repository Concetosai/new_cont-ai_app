import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart, Pie } from "recharts";

const monthlyData = [
  { mes: "Sep", monto: 32400 },
  { mes: "Oct", monto: 41200 },
  { mes: "Nov", monto: 38900 },
  { mes: "Dic", monto: 52100 },
  { mes: "Ene", monto: 44800 },
  { mes: "Feb", monto: 61300 },
  { mes: "Mar", monto: 48500 },
];

const categories = [
  { name: "Telecomunicaciones", value: 18, color: "hsl(195, 100%, 50%)" },
  { name: "Servicios Profesionales", value: 28, color: "hsl(220, 90%, 60%)" },
  { name: "Nómina", value: 35, color: "hsl(270, 80%, 60%)" },
  { name: "Arrendamiento", value: 12, color: "hsl(145, 60%, 50%)" },
  { name: "Otros", value: 7, color: "hsl(35, 95%, 55%)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs"
        style={{ background: "hsl(210 35% 10%)", border: "1px solid hsl(210 30% 20%)", color: "hsl(210, 20%, 85%)" }}>
        <p className="font-semibold">{label}</p>
        <p style={{ color: "hsl(195, 100%, 60%)" }}>
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function Analisis() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Análisis de Gastos</h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
          Visualización inteligente de tu actividad financiera
        </p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase mb-5"
            style={{ color: "hsl(195, 100%, 60%)" }}>
            Gastos por Mes (MXN)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={28} margin={{ top: 0, right: 0, bottom: 0, left: -15 }}>
              <XAxis dataKey="mes" tick={{ fill: "hsl(210, 15%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(210, 15%, 45%)", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(195 100% 50% / 0.05)" }} />
              <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, i) => (
                  <Cell key={i}
                    fill={i === monthlyData.length - 2
                      ? "url(#barGradient)"
                      : "hsl(210, 35%, 18%)"}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(195, 100%, 60%)" />
                  <stop offset="100%" stopColor="hsl(220, 90%, 50%)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase mb-4"
            style={{ color: "hsl(195, 100%, 60%)" }}>
            Por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                dataKey="value" paddingAngle={3}>
                {categories.map((cat, i) => (
                  <Cell key={i} fill={cat.color} opacity={0.85} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: cat.color }} />
                <span className="flex-1 truncate" style={{ color: "hsl(210, 15%, 60%)" }}>{cat.name}</span>
                <span className="font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top expenses */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-semibold tracking-wide uppercase mb-4"
          style={{ color: "hsl(195, 100%, 60%)" }}>
          Mayores Gastos del Periodo
        </h2>
        <div className="space-y-3">
          {[
            { proveedor: "Nómina Quincenal", monto: "$28,500", cat: "Nómina", pct: 90 },
            { proveedor: "Arrendamiento Oficina", monto: "$18,000", cat: "Arrendamiento", pct: 58 },
            { proveedor: "Contabilidad Mensual", monto: "$8,500", cat: "Servicios Prof.", pct: 27 },
            { proveedor: "Telecomunicaciones", monto: "$4,200", cat: "Telecomunicaciones", pct: 13 },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "hsl(195 100% 50% / 0.1)", color: "hsl(195, 100%, 60%)" }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium truncate" style={{ color: "hsl(210, 20%, 82%)" }}>{row.proveedor}</span>
                  <span className="font-bold ml-2 flex-shrink-0" style={{ color: "hsl(210, 20%, 92%)" }}>{row.monto}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(210 30% 15%)" }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${row.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                    style={{ background: "linear-gradient(90deg, hsl(195, 100%, 50%), hsl(220, 90%, 55%))" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
