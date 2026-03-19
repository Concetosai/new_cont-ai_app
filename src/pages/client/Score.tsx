import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface Client { id: string; nombre: string; }

export default function ClientProxyScore() {
  const { client, searchTerm } = useOutletContext<{ client: Client; searchTerm: string }>();

  const scoreFiscal = 87;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Score Fiscal</h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>Salud fiscal ante el SAT</p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} className="glass-card p-8 rounded-xl text-center lg:col-span-1">
          <div className="w-40 h-40 mx-auto mb-4 rounded-full border-8 border-emerald-500 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400">{scoreFiscal}</div>
              <div className="text-xs mt-1" style={{ color: "hsl(210, 15%, 55%)" }}>de 100</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-semibold">Excelente salud fiscal</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} className="glass-card p-6 rounded-xl lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(195, 100%, 60%)" }}>Factores que afectan tu score</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>Declaraciones al corriente</div>
                <div className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Última declaración presentada a tiempo</div>
              </div>
              <span className="text-emerald-400 font-bold">+15 pts</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>IVA acreditable documentado</div>
                <div className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Todos los gastos con XML</div>
              </div>
              <span className="text-emerald-400 font-bold">+10 pts</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>Gastos sin categorizar</div>
                <div className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>3 gastos pendientes de clasificación</div>
              </div>
              <span className="text-amber-400 font-bold">-5 pts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
