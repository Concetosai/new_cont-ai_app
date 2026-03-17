import { motion } from "framer-motion";
import { ShoppingCart, Zap, Link, CheckCircle, AlertCircle, Settings } from "lucide-react";

export default function Integraciones() {
  const integrations = [
    { 
      name: "Mercado Libre", 
      status: "connected", 
      icon: "🛒", 
      desc: "Ventas automáticas + comisiones calculadas"
    },
    { 
      name: "TikTok Shop", 
      status: "pending", 
      icon: "📱", 
      desc: "Importa órdenes + calcula impuestos plataforma"
    },
    { 
      name: "Shopify", 
      status: "available", 
      icon: "🛍️", 
      desc: "Todo tu e-commerce conectado"
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-4" style={{ color: "hsl(270, 80%, 65%)" }}>
          ⚫ Integraciones Automáticas
        </h1>
        <p className="text-lg mb-2" style={{ color: "hsl(210, 20%, 80%)" }}>
          TikTok Shop • Mercado Libre • Shopify
        </p>
        <p className="text-sm max-w-2xl mx-auto" style={{ color: "hsl(210, 15%, 50%)" }}>
          Ventas se registran solas. CONT-AI calcula comisiones, impuestos y utilidad neta.
        </p>
        <div className="vein-line w-64 mx-auto mt-6" style={{ backgroundColor: "hsl(270, 80%, 60%)" }} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((int, i) => (
          <motion.div 
            key={int.name}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass-card rounded-2xl p-6 h-[280px] flex flex-col items-center text-center group hover:shadow-glow"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 font-bold text-xl shadow-lg transition-all group-hover:scale-110 ${
              int.status === "connected" ? "glow-cyan" : 
              int.status === "pending" ? "glow-violet" : "glow-blue"
            }`}
            style={{
              background: int.status === "connected" ? "hsl(195 100% 50% / 0.15)" :
                          int.status === "pending" ? "hsl(270 80% 60% / 0.15)" : "hsl(220 90% 55% / 0.15)",
              border: `1px solid ${
                int.status === "connected" ? "hsl(195 100% 50% / 0.4)" :
                int.status === "pending" ? "hsl(270 80% 60% / 0.4)" : "hsl(220 90% 55% / 0.4)"
              }`,
              color: int.status === "connected" ? "hsl(195 100% 60%)" :
                     int.status === "pending" ? "hsl(270 80% 70%)" : "hsl(220 90% 65%)"
            }}>
              {int.icon}
            </div>
            
            <h3 className="font-bold text-lg mb-2" style={{ color: "hsl(210, 20%, 92%)" }}>
              {int.name}
            </h3>
            <p className="text-sm mb-6" style={{ color: "hsl(210, 15%, 55%)" }}>
              {int.desc}
            </p>

            <div className="flex items-center gap-2 text-xs mb-4">
              {int.status === "connected" && (
                <>
                  <CheckCircle className="w-3 h-3" style={{ color: "hsl(145, 60%, 55%)" }} />
                  <span style={{ color: "hsl(145, 60%, 60%)" }}>Conectado</span>
                </>
              )}
              {int.status === "pending" && (
                <>
                  <Zap className="w-3 h-3 animate-pulse" style={{ color: "hsl(35, 95%, 60%)" }} />
                  <span style={{ color: "hsl(35, 95%, 65%)" }}>Configurando...</span>
                </>
              )}
              {int.status === "available" && (
                <>
                  <Link className="w-3 h-3" style={{ color: "hsl(270, 80%, 65%)" }} />
                  <span style={{ color: "hsl(270, 80%, 70%)" }}>Disponible</span>
                </>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 px-6 rounded-xl font-semibold text-sm"
              style={{
                background: int.status === "connected" ? "hsl(210 35% 12%)" :
                           "linear-gradient(135deg, hsl(270, 80%, 50%), hsl(270, 70%, 45%))",
                color: int.status === "connected" ? "hsl(195, 100%, 65%)" : "hsl(210, 50%, 98%)",
                border: int.status === "connected" ? "1px solid hsl(195 100% 50% / 0.3)" : "none",
                boxShadow: int.status !== "connected" ? "0 4px 20px hsl(270 80% 60% / 0.3)" : "none"
              }}
            >
              {int.status === "connected" ? "Ver Ventas" : "Conectar Ahora"}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Stats footer */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-6 text-center"
      >
        <h3 className="font-bold mb-3 text-lg" style={{ color: "hsl(270, 80%, 65%)" }}>
          Ventas Automáticas Activas
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <div className="text-2xl font-black" style={{ color: "hsl(145, 60%, 65%)" }}>247</div>
            <div style={{ color: "hsl(210, 15%, 55%)" }}>Órdenes</div>
          </div>
          <div>
            <div className="text-2xl font-black" style={{ color: "hsl(195, 100%, 65%)" }}>$156,800</div>
            <div style={{ color: "hsl(210, 15%, 55%)" }}>Ingresos</div>
          </div>
          <div>
            <div className="text-2xl font-black" style={{ color: "hsl(145, 60%, 65%)" }}>$28,400</div>
            <div style={{ color: "hsl(210, 15%, 55%)" }}>Utilidad</div>
          </div>
        </div>
        <p className="text-xs" style={{ color: "hsl(210, 15%, 45%)" }}>
          Comisiones e impuestos ya descontados
        </p>
      </motion.div>
    </div>
  );
}

