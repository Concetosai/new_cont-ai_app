import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

interface Client { id: string; nombre: string; }

export default function ClientProxyAnalisis() {
  const { client, searchTerm } = useOutletContext<{ client: Client; searchTerm: string }>();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Análisis</h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>Gráficas y tendencias financieras</p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} className="glass-card p-6 rounded-xl">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(195, 100%, 60%)" }}>Ingresos vs Gastos</h3>
          <div className="h-64 flex items-center justify-center" style={{ color: "hsl(210, 15%, 50%)" }}>
            [Gráfica de barras - Ingresos vs Gastos por mes]
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} className="glass-card p-6 rounded-xl">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(195, 100%, 60%)" }}>Gastos por Categoría</h3>
          <div className="h-64 flex items-center justify-center" style={{ color: "hsl(210, 15%, 50%)" }}>
            [Gráfica circular - Distribución por categoría]
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} className="glass-card p-6 rounded-xl lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(195, 100%, 60%)" }}>Tendencia Mensual</h3>
          <div className="h-48 flex items-center justify-center" style={{ color: "hsl(210, 15%, 50%)" }}>
            [Gráfica de línea - Tendencia de 6 meses]
          </div>
        </motion.div>
      </div>
    </div>
  );
}
