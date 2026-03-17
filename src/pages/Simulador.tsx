import { motion, useMotionValue, useTransform } from "framer-motion";
import { Brain, Calculator, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";

export default function Simulador() {
  const [ingresos, setIngresos] = useState(50000);
  const [gastos, setGastos] = useState(25000);
  const [deducciones, setDeducciones] = useState(8000);

  const utilidad = ingresos - gastos;
  const isrEstimado = Math.round(utilidad * 0.3); // Simplified ISR
  const ivaPendiente = Math.round((ingresos * 0.16) - deducciones);
  const utilidadNeta = utilidad - isrEstimado;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3" style={{ color: "hsl(195, 100%, 65%)" }}>
          <Brain className="w-8 h-8" />
          💥 Simulador de Impuestos
        </h1>
        <p className="text-lg mb-2" style={{ color: "hsl(210, 20%, 80%)" }}>
          "¿Si gano X, cuánto pago?"
        </p>
        <p className="text-sm max-w-2xl mx-auto" style={{ color: "hsl(210, 15%, 50%)" }}>
          Prueba escenarios y ve impacto fiscal en tiempo real
        </p>
        <div className="vein-line w-64 mx-auto mt-6" style={{ backgroundColor: "hsl(195, 100%, 55%)" }} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: "hsl(195, 100%, 65%)" }}>
            <Calculator className="w-6 h-6" />
            Escenario Mensual
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(210, 20%, 85%)" }}>
                Ingresos Brutos
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "hsl(210, 15%, 55%)" }}>$</span>
                <input
                  type="number"
                  value={ingresos}
                  onChange={(e) => setIngresos(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl text-lg font-bold text-right"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "2px solid hsl(210 30% 20%)",
                    color: "hsl(195, 100%, 70%)"
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(210, 20%, 85%)" }}>
                Gastos Deducibles
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "hsl(210, 15%, 55%)" }}>$</span>
                <input
                  type="number"
                  value={gastos}
                  onChange={(e) => setGastos(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl text-lg font-bold text-right"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "2px solid hsl(210 30% 20%)",
                    color: "hsl(145, 60%, 65%)"
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(210, 20%, 85%)" }}>
                IVA Acreditable
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "hsl(210, 15%, 55%)" }}>$</span>
                <input
                  type="number"
                  value={deducciones}
                  onChange={(e) => setDeducciones(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl text-lg font-bold text-right"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "2px solid hsl(210 30% 20%)",
                    color: "hsl(220, 90%, 65%)"
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-2xl p-8">
            <h3 className="font-bold mb-6 text-xl flex items-center gap-2" style={{ color: "hsl(145, 60%, 65%)" }}>
              <TrendingUp className="w-5 h-5" />
              Resultados del Simulador
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: "hsl(145 60% 45% / 0.08)", border: "1px solid hsl(145 60% 45% / 0.2)" }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span style={{ color: "hsl(210, 15%, 55%)" }}>Utilidad Bruta</span>
                  <span className="text-2xl font-black" style={{ color: "hsl(145, 60%, 70%)" }}>${utilidad.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl" style={{ background: "hsl(35 95% 55% / 0.08)", border: "1px solid hsl(35 95% 55% / 0.2)" }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span style={{ color: "hsl(210, 15%, 55%)" }}>ISR Estimado (30%)</span>
                  <span className="text-xl font-black" style={{ color: "hsl(35, 95%, 65%)" }}>${isrEstimado.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl" style={{ background: "hsl(220 90% 55% / 0.08)", border: "1px solid hsl(220 90% 55% / 0.2)" }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span style={{ color: "hsl(210, 15%, 55%)" }}>IVA a Pagar</span>
                  <span className="text-xl font-black" style={{ color: "hsl(220, 90%, 65%)" }}>${ivaPendiente.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-6 pb-4 border-t border-dashed" style={{ borderColor: "hsl(210 30% 20%)" }}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm uppercase tracking-wide font-semibold" style={{ color: "hsl(210, 15%, 55%)" }}>
                    UTILIDAD NETA
                  </span>
                  <span className="text-3xl font-black" style={{ color: "hsl(145, 60%, 70%)" }}>
                    ${utilidadNeta.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-center grid grid-cols-3 gap-2">
                  <span style={{ color: "hsl(145, 60%, 55%)" }}>✦ Excelente</span>
                  <span style={{ color: "hsl(35, 95%, 55%)" }}>ISR OK</span>
                  <span style={{ color: "hsl(220, 90%, 55%)" }}>IVA OK</span>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(195, 100%, 50%), hsl(220, 90%, 55%))",
              color: "hsl(210, 50%, 98%)",
              boxShadow: "0 12px 40px hsl(195 100% 50% / 0.4)"
            }}
          >
            <Zap className="w-5 h-5 animate-pulse" />
            Guardar este Escenario
          </motion.button>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-8 text-center max-w-2xl mx-auto"
      >
        <h3 className="font-bold mb-4 text-xl" style={{ color: "hsl(195, 100%, 65%)" }}>
          💡 Consejos CONT-AI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl border border-dashed" style={{ borderColor: "hsl(195 100% 50% / 0.3)" }}>
            <p style={{ color: "hsl(210, 20%, 80%)" }}>
              Factura <strong>15% más</strong> → ISR sube solo <strong>$4,500</strong>
            </p>
          </div>
          <div className="p-4 rounded-xl border border-dashed" style={{ borderColor: "hsl(145 60% 50% / 0.3)" }}>
            <p style={{ color: "hsl(210, 20%, 80%)" }}>
              Deduce <strong>+20%</strong> gastos → Ahorras <strong>$8,200 ISR</strong>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

