import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Client { id: string; nombre: string; }

export default function ClientProxyFacturacion() {
  const { client, searchTerm } = useOutletContext<{ client: Client; searchTerm: string }>();

  const facturas = [
    { id: 'F001', folio: 'A-4521', cliente: 'TechCorp MX', monto: 12500, fecha: '2024-03-15', status: 'emitida', tieneXML: true },
    { id: 'F002', folio: 'A-4522', cliente: 'Servicios SA', monto: 8900, fecha: '2024-03-14', status: 'emitida', tieneXML: true },
    { id: 'F003', folio: 'B-1234', proveedor: 'AWS Services', monto: 5000, fecha: '2024-03-10', status: 'recibida', tieneXML: true },
  ];

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Facturación</h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>Facturas emitidas y recibidas</p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-xl">
          <div className="text-xs mb-1" style={{ color: "hsl(210, 15%, 55%)" }}>Ingresos Mes</div>
          <div className="text-2xl font-bold" style={{ color: "hsl(145, 60%, 60%)" }}>$21,400</div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <div className="text-xs mb-1" style={{ color: "hsl(210, 15%, 55%)" }}>Egresos Mes</div>
          <div className="text-2xl font-bold" style={{ color: "hsl(0, 72%, 60%)" }}>$5,000</div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Fecha</th>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Folio</th>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Cliente/Proveedor</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Monto</th>
              <th className="text-center py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Status</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>XML</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {facturas.map((fac) => (
              <tr key={fac.id} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>{fac.fecha}</td>
                <td className="py-3 px-4 font-mono text-sm" style={{ color: "hsl(210, 20%, 85%)" }}>{fac.folio}</td>
                <td className="py-3 px-4" style={{ color: "hsl(210, 20%, 85%)" }}>{fac.cliente || fac.proveedor}</td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: "hsl(210, 20%, 90%)" }}>${fac.monto.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${fac.status === 'emitida' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {fac.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {fac.tieneXML ? <CheckCircle className="w-4 h-4 text-emerald-400 inline" /> : <AlertTriangle className="w-4 h-4 text-amber-400 inline" />}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => copyText(fac.folio, 'Folio')} className="p-1.5 rounded-lg hover:bg-slate-700/50">
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-emerald-500/20">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
