import { motion } from "framer-motion";
import { Calculator, FileText, Clock, CheckCircle, AlertTriangle, Download, Loader2 } from "lucide-react";
import { contAiApi } from "../lib/api";
import { useState, useEffect } from "react";

// Mock user ID for demo
const MOCK_USER_ID = "usuario-001";

interface ImpuestosData {
  isr: number;
  iva: number;
  imss: number;
  vence: string;
}

export default function Impuestos() {
  const [loading, setLoading] = useState(true);
  const [impuestos, setImpuestos] = useState<ImpuestosData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImpuestos();
  }, []);

  const loadImpuestos = async () => {
    try {
      setLoading(true);
      const response = await contAiApi.getImpuestos(MOCK_USER_ID);
      
      if (response.success && response.data && response.data.success) {
        setImpuestos(response.data);
      } else {
        // Use default values if no data
        setImpuestos({
          isr: 0,
          iva: 0,
          imss: 0,
          vence: '17/04/2026'
        });
      }
    } catch (err) {
      console.error('Error loading impuestos:', err);
      setError('Error al cargar impuestos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleString('es-MX', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(35, 95%, 60%)" }} />
        </div>
      </div>
    );
  }

  const currentMonth = getCurrentMonth();
  const impuestosData = impuestos || { isr: 0, iva: 0, imss: 0, vence: '17/04/2026' };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-4" style={{ color: "hsl(35, 95%, 60%)" }}>
          🟡 Cálculo Automático SAT
        </h1>
        <p className="text-lg mb-2" style={{ color: "hsl(210, 20%, 80%)" }}>
          ISR • IVA • Declaraciones Mensuales
        </p>
        <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>
          CONT-AI calcula todo automáticamente. Solo aprueba y paga.
        </p>
        <div className="vein-line w-64 mx-auto mt-6" style={{ backgroundColor: "hsl(35, 95%, 55%)" }} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculos actuales */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "hsl(35, 95%, 65%)" }}>
            <Calculator className="w-6 h-6" />
            Pendientes {currentMonth}
          </h2>
          
          <div className="space-y-6">
            {/* ISR */}
            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "hsl(210, 20%, 90%)" }}>ISR</h3>
                  <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>Provisional Mensual</p>
                </div>
                <CheckCircle className="w-6 h-6" style={{ color: "hsl(145, 60%, 55%)" }} />
              </div>
              <div className="text-3xl font-black mb-2" style={{ color: "hsl(35, 95%, 60%)" }}>
                {formatCurrency(impuestosData.isr)}
              </div>
              <p className="text-sm" style={{ color: "hsl(210, 15%, 55%)" }}>
                Vence: <span style={{ color: "hsl(35, 95%, 60%)", fontWeight: 600 }}>{impuestosData.vence}</span> 
                · <span style={{ color: "hsl(145, 60%, 55%)" }}>Listo para pagar</span>
              </p>
            </div>

            {/* IVA */}
            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "hsl(210, 20%, 90%)" }}>IVA Mensual</h3>
                  <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>Crédito Fiscal Aplicado</p>
                </div>
                <AlertTriangle className="w-6 h-6" style={{ color: "hsl(35, 95%, 60%)" }} />
              </div>
              <div className="text-3xl font-black mb-2" style={{ color: "hsl(35, 95%, 60%)" }}>
                {formatCurrency(impuestosData.iva)}
              </div>
              <p className="text-sm" style={{ color: "hsl(210, 15%, 55%)" }}>
                Debes: <span style={{ color: "hsl(35, 95%, 65%)", fontWeight: 600 }}>{formatCurrency(impuestosData.iva)}</span>
              </p>
            </div>

            {/* IMSS */}
            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "hsl(210, 20%, 90%)" }}>IMSS</h3>
                  <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>Bimestral</p>
                </div>
                <Clock className="w-6 h-6" style={{ color: "hsl(35, 95%, 60%)" }} />
              </div>
              <div className="text-3xl font-black mb-2" style={{ color: "hsl(35, 95%, 60%)" }}>
                {formatCurrency(impuestosData.imss)}
              </div>
              <p className="text-sm" style={{ color: "hsl(210, 15%, 55%)" }}>
                Próximo: <span style={{ color: "hsl(35, 95%, 60%)", fontWeight: 600 }}>17 Abr 2026</span>
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
            style={{
              background: "linear-gradient(135deg, hsl(35, 95%, 55%), hsl(35, 85%, 50%))",
              color: "hsl(210, 50%, 98%)",
              boxShadow: "0 8px 32px hsl(35 95% 55% / 0.4)"
            }}
          >
            <Download className="w-5 h-5" />
            Pagar Todo Ahora
          </motion.button>
        </motion.div>

        {/* Quick actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color: "hsl(145, 60%, 65%)" }}>
              <CheckCircle className="w-5 h-5" />
              Listo ✓
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(145, 60%, 60%)" }}>
                <CheckCircle className="w-3 h-3" />
                Cálculos actualizados
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(145, 60%, 60%)" }}>
                <CheckCircle className="w-3 h-3" />
                CFDI conciliados ✓
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-lg" style={{ color: "hsl(35, 95%, 65%)" }}>⏰ Próximos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2">
                <span>IMSS</span>
                <span className="font-semibold" style={{ color: "hsl(35, 95%, 60%)" }}>3 días</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span>Declaración Bimestral</span>
                <span className="font-semibold" style={{ color: "hsl(0, 72%, 60%)" }}>15 días</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-lg" style={{ color: "hsl(210, 20%, 90%)" }}>📊 Resumen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span style={{ color: "hsl(210, 15%, 60%)" }}>ISR (30%)</span>
                <span className="font-semibold" style={{ color: "hsl(35, 95%, 60%)" }}>{formatCurrency(impuestosData.isr)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "hsl(210, 15%, 60%)" }}>IVA (16%)</span>
                <span className="font-semibold" style={{ color: "hsl(35, 95%, 60%)" }}>{formatCurrency(impuestosData.iva)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "hsl(210, 15%, 60%)" }}>IMSS</span>
                <span className="font-semibold" style={{ color: "hsl(35, 95%, 60%)" }}>{formatCurrency(impuestosData.imss)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex items-center justify-between">
                <span className="font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Total</span>
                <span className="font-bold text-lg" style={{ color: "hsl(35, 95%, 60%)" }}>
                  {formatCurrency(impuestosData.isr + impuestosData.iva + impuestosData.imss)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
