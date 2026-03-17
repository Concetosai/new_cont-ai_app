import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Bell, Clock, CheckCircle, Zap } from "lucide-react";

const alerts = [
  { 
    type: "critical", 
    title: "⏰ IMSS vence HOY", 
    desc: "Pago obligatorio - Multa de $5,200 si no pagas", 
    time: "Hace 2h",
    action: "Pagar ahora"
  },
  { 
    type: "warning", 
    title: "Declaración bimestral", 
    desc: "3 días restantes - $12,450 estimado", 
    time: "Hoy",
    action: "Revisar"
  },
  { 
    type: "info", 
    title: "Nuevo gasto deducible detectado", 
    desc: "$3,200 telecomunicaciones - 16% deducible", 
    time: "Hace 4h",
    action: "Categorizar"
  },
  { 
    type: "success", 
    title: "ISR validado ✓", 
    desc: "Contador aprobó declaración del mes", 
    time: "Ayer",
    action: "Ver detalles"
  },
];

export default function Alerts() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(0, 72%, 55% / 0.15)", border: "1px solid hsl(0 72% 55% / 0.3)" }}>
          <Bell className="w-5 h-5" style={{ color: "hsl(0, 72%, 60%)" }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "hsl(0, 72%, 65%)" }}>🔴 Alertas Inteligentes</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
            Notificaciones proactivas — Evita multas y optimiza deducciones
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        {alerts.map((alert, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: alert.type === "critical" ? -20 : 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="group"
          >
            <div className={`glass-card p-5 rounded-xl flex gap-4 hover:shadow-glow transition-all ${
              alert.type === "critical" ? "border-l-4 border-l-red-500" :
              alert.type === "warning" ? "border-l-4 border-l-yellow-500" :
              alert.type === "info" ? "border-l-4 border-l-blue-500" :
              "border-l-4 border-l-green-500"
            }`}
            style={{
              borderLeftColor: alert.type === "critical" ? "hsl(0 72% 55%)" :
                              alert.type === "warning" ? "hsl(35 95% 55%)" :
                              alert.type === "info" ? "hsl(195 100% 55%)" :
                              "hsl(145 60% 55%)"
            }}>
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                alert.type === "critical" ? "glow-violet" :
                alert.type === "warning" ? "glow-orange" :
                alert.type === "info" ? "glow-cyan" :
                "glow-green"
              }`}
              style={{
                background: alert.type === "critical" ? "hsl(0 72% 55% / 0.15)" :
                            alert.type === "warning" ? "hsl(35 95% 55% / 0.15)" :
                            alert.type === "info" ? "hsl(195 100% 50% / 0.15)" :
                            "hsl(145 60% 50% / 0.15)",
                border: `1px solid ${
                  alert.type === "critical" ? "hsl(0 72% 55% / 0.4)" :
                  alert.type === "warning" ? "hsl(35 95% 55% / 0.4)" :
                  alert.type === "info" ? "hsl(195 100% 50% / 0.4)" :
                  "hsl(145 60% 50% / 0.4)"
                }`
              }}>
                {alert.type === "critical" && <AlertTriangle className="w-6 h-6" />}
                {alert.type === "warning" && <Clock className="w-6 h-6" />}
                {alert.type === "info" && <Zap className="w-6 h-6 animate-pulse" />}
                {alert.type === "success" && <CheckCircle className="w-6 h-6" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg flex-1 pr-4" style={{ 
                    color: alert.type === "critical" ? "hsl(0, 72%, 65%)" :
                           alert.type === "warning" ? "hsl(35, 95%, 65%)" :
                           alert.type === "info" ? "hsl(195, 100%, 65%)" :
                           "hsl(145, 60%, 65%)"
                  }}>
                    {alert.title}
                  </h3>
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: "hsl(210, 15%, 45%)" }}>
                    {alert.time}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: "hsl(210, 15%, 60%)" }}>
                  {alert.desc}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  style={{
                    background: "hsl(210 35% 12%)",
                    border: "1px solid hsl(210 30% 20%)",
                    color: "hsl(195, 100%, 65%)"
                  }}
                >
                  {alert.action}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
      >
        <div>
          <div className="text-2xl font-black" style={{ color: "hsl(0, 72%, 65%)" }}>4</div>
          <div className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Críticas</div>
        </div>
        <div>
          <div className="text-2xl font-black" style={{ color: "hsl(35, 95%, 65%)" }}>12</div>
          <div className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Advertencias</div>
        </div>
        <div>
          <div className="text-2xl font-black" style={{ color: "hsl(195, 100%, 65%)" }}>28</div>
          <div className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Información</div>
        </div>
        <div>
          <div className="text-2xl font-black" style={{ color: "hsl(145, 60%, 65%)" }}>156</div>
          <div className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Resueltas</div>
        </div>
      </motion.div>
    </div>
  );
}

