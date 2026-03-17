import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, TrendingUp, FileText, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ScoreFiscal() {
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Simular cálculo del score fiscal
  useEffect(() => {
    const calculateScore = async () => {
      setLoading(true);
      
      // TODO: Implementar llamada real al backend para calcular score
      // Por ahora, usamos un score simulado
      setTimeout(() => {
        // Score simulado basado en factores fiscales
        const simulatedScore = Math.floor(Math.random() * 40) + 60; // 60-100
        setScore(simulatedScore);
        setLoading(false);
      }, 1500);
    };

    calculateScore();
  }, []);

  // Determinar el nivel del score
  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Excelente', color: 'text-green-400', bgColor: 'bg-green-400/20', icon: CheckCircle };
    if (score >= 75) return { level: 'Bueno', color: 'text-blue-400', bgColor: 'bg-blue-400/20', icon: TrendingUp };
    if (score >= 60) return { level: 'Regular', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', icon: AlertTriangle };
    return { level: 'Crítico', color: 'text-red-400', bgColor: 'bg-red-400/20', icon: Shield };
  };

  const scoreData = getScoreLevel(score);
  const ScoreIcon = scoreData.icon;

  // Factores que afectan el score
  const factores = [
    {
      nombre: 'Declaraciones presentadas a tiempo',
      estado: 'ok',
      impacto: '+15 puntos',
      descripcion: 'Has presentado el 90% de tus declaraciones a tiempo'
    },
    {
      nombre: 'Facturación electrónica',
      estado: 'ok',
      impacto: '+10 puntos',
      descripcion: 'El 85% de tus facturas están timbradas correctamente'
    },
    {
      nombre: 'Deducciones documentadas',
      estado: 'warning',
      impacto: '+5 puntos',
      descripcion: 'El 70% de tus deducciones tienen comprobantes válidos'
    },
    {
      nombre: 'Adeudos fiscales',
      estado: 'error',
      impacto: '-20 puntos',
      descripcion: 'Tienes 2 adeudos pendientes del último ejercicio'
    },
    {
      nombre: 'Contabilidad al corriente',
      estado: 'ok',
      impacto: '+10 puntos',
      descripcion: 'Tu contabilidad está actualizada hasta el mes actual'
    }
  ];

  // Recomendaciones
  const recomendaciones = [
    {
      titulo: 'Regulariza adeudos pendientes',
      descripcion: 'Paga los 2 adeudos del último ejercicio para recuperar 20 puntos',
      prioridad: 'alta',
      icono: FileText
    },
    {
      titulo: 'Mejora documentación de deducciones',
      descripcion: 'Asegúrate de tener todos los comprobantes fiscales de tus deducciones',
      prioridad: 'media',
      icono: Calculator
    },
    {
      titulo: 'Mantén declaraciones al corriente',
      descripcion: 'Continúa presentando tus declaraciones dentro de los plazos establecidos',
      prioridad: 'baja',
      icono: CheckCircle
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
          Score Fiscal
        </h1>
        <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>
          Evalúa la salud fiscal de tu negocio ante el SAT
        </p>
        <div className="vein-line w-48" />
      </motion.div>

      {/* Score Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-slate-700">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              {loading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center">
                    <div className="w-16 h-16 animate-spin rounded-full border-t-2 border-b-2 border-blue-400" />
                  </div>
                  <p className="text-slate-400">Calculando tu score fiscal...</p>
                </div>
              ) : (
                <>
                  <div className={`w-40 h-40 rounded-full border-8 ${scoreData.bgColor} border-${scoreData.color.split('-')[1]}-400 flex items-center justify-center`}>
                    <div className="text-center">
                      <ScoreIcon className={`w-12 h-12 mx-auto mb-2 ${scoreData.color}`} />
                      <p className="text-4xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
                        {score}
                      </p>
                      <p className="text-sm text-slate-400">/ 100</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-semibold ${scoreData.color}`}>
                      {scoreData.level}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Salud fiscal {scoreData.level.toLowerCase()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Factores que Afectan el Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>
          Factores que Afectan tu Score
        </h2>
        <div className="space-y-3">
          {factores.map((factor, index) => (
            <motion.div
              key={factor.nombre}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass-card p-4 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {factor.estado === 'ok' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : factor.estado === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium">{factor.nombre}</p>
                    <p className="text-sm text-slate-400 mt-1">{factor.descripcion}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  factor.impacto.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {factor.impacto}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recomendaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>
          Recomendaciones para Mejorar tu Score
        </h2>
        <div className="grid gap-4">
          {recomendaciones.map((rec, index) => (
            <motion.div
              key={rec.titulo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="glass-card p-4 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <rec.icono className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  rec.prioridad === 'alta' ? 'text-red-400' :
                  rec.prioridad === 'media' ? 'text-yellow-400' :
                  'text-blue-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-slate-200 font-medium">{rec.titulo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rec.prioridad === 'alta' ? 'bg-red-400/20 text-red-400' :
                      rec.prioridad === 'media' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-blue-400/20 text-blue-400'
                    }`}>
                      {rec.prioridad === 'alta' ? 'Prioridad Alta' :
                       rec.prioridad === 'media' ? 'Prioridad Media' :
                       'Prioridad Baja'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{rec.descripcion}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Info Adicional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="glass-card p-4 rounded-lg border-slate-700"
      >
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-200 font-medium">¿Cómo se calcula el Score Fiscal?</p>
            <p className="text-sm text-slate-400 mt-1">
              El Score Fiscal se calcula con base en múltiples factores: cumplimiento de obligaciones fiscales, 
              presentación oportuna de declaraciones, documentación de deducciones, adeudos fiscales, y más. 
              Un score alto (90-100) indica excelente salud fiscal, mientras que un score bajo (&lt;60) sugiere 
              áreas de oportunidad que requieren atención inmediata.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
