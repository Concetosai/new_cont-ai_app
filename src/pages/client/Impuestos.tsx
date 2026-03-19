import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface Client { id: string; nombre: string; }

export default function ClientProxyImpuestos() {
  const { client, searchTerm } = useOutletContext<{ client: Client; searchTerm: string }>();

  const impuestos = [
    { concepto: 'ISR', calculo: '$6,420', base: '$21,400', tasa: '30%', vencimiento: '17 Abr 2024', status: 'pendiente' },
    { concepto: 'IVA', calculo: '$3,424', base: '$21,400', tasa: '16%', vencimiento: '17 Abr 2024', status: 'pendiente' },
    { concepto: 'IMSS', calculo: '$4,800', base: '$40,000', tasa: 'Fija', vencimiento: '15 Abr 2024', status: 'proximo' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Impuestos</h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>Calculadora SAT y declaraciones</p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-xl border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Total a Pagar</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "hsl(35, 95%, 60%)" }}>$14,644</div>
        </div>
        <div className="glass-card p-6 rounded-xl border-l-4 border-emerald-500">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>IVA Acreditable</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "hsl(145, 60%, 60%)" }}>$6,768</div>
        </div>
        <div className="glass-card p-6 rounded-xl border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Pago Definitivo</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "hsl(220, 90%, 65%)" }}>$7,876</div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Concepto</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Base</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Tasa</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Cálculo</th>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Vencimiento</th>
              <th className="text-center py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {impuestos.map((imp) => (
              <tr key={imp.concepto} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>{imp.concepto}</td>
                <td className="py-3 px-4 text-right" style={{ color: "hsl(210, 20%, 90%)" }}>${imp.base}</td>
                <td className="py-3 px-4 text-right" style={{ color: "hsl(210, 15%, 60%)" }}>{imp.tasa}</td>
                <td className="py-3 px-4 text-right font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>{imp.calculo}</td>
                <td className="py-3 px-4 text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>{imp.vencimiento}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    imp.status === 'pendiente' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>{imp.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
