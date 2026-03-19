import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Copy, Search, Filter, Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import contAiApi from '@/lib/api';

interface Client {
  id: string;
  nombre: string;
}

interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
  iva: number;
  retenido: number;
  tieneXML: boolean;
}

export default function ClientProxyGastos() {
  const { client, searchTerm } = useOutletContext<{ client: Client; searchTerm: string }>();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategoria, setFilterCategoria] = useState('');

  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = async () => {
    setLoading(true);
    try {
      const result = await contAiApi.getClientGastos(client.id, 100);
      if (result.success && result.data) {
        setGastos(result.data);
      }
    } catch (error) {
      console.error('Error loading gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGastos = gastos.filter(g => {
    const matchesSearch = g.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         g.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !filterCategoria || g.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const categorias = [...new Set(gastos.map(g => g.categoria))];

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const downloadXML = (gastoId: string) => {
    toast.success(`Descargando XML del gasto ${gastoId}...`);
    // TODO: Implement real download
  };

  const totalMonto = filteredGastos.reduce((sum, g) => sum + g.monto, 0);
  const totalIva = filteredGastos.reduce((sum, g) => sum + g.iva, 0);
  const totalRetenido = filteredGastos.reduce((sum, g) => sum + g.retenido, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
          Gastos de {client.nombre}
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
          Lista completa de gastos deducibles
        </p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-xl">
          <div className="text-xs mb-1" style={{ color: "hsl(210, 15%, 55%)" }}>Total Gastos</div>
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>${totalMonto.toLocaleString()}</div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <div className="text-xs mb-1" style={{ color: "hsl(210, 15%, 55%)" }}>IVA Acreditable</div>
          <div className="text-2xl font-bold" style={{ color: "hsl(145, 60%, 60%)" }}>${totalIva.toLocaleString()}</div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <div className="text-xs mb-1" style={{ color: "hsl(210, 15%, 55%)" }}>ISR Retenido</div>
          <div className="text-2xl font-bold" style={{ color: "hsl(220, 90%, 65%)" }}>${totalRetenido.toLocaleString()}</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar gastos..."
            className="w-full px-4 py-2 pl-10 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-emerald-500 text-sm"
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-emerald-500 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500 transition-all text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Fecha
        </button>
        <button className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-sm flex items-center gap-2 text-emerald-400">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Fecha</th>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Descripción</th>
              <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Categoría</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Monto</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>IVA</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Ret.</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>XML</th>
              <th className="text-right py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredGastos.map((gasto) => (
              <tr key={gasto.id} className="hover:bg-slate-800/30 transition-all">
                <td className="py-3 px-4 text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>{gasto.fecha}</td>
                <td className="py-3 px-4" style={{ color: "hsl(210, 20%, 85%)" }}>{gasto.descripcion}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-lg text-xs bg-slate-700/50" style={{ color: "hsl(210, 15%, 60%)" }}>
                    {gasto.categoria}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: "hsl(210, 20%, 90%)" }}>
                  ${gasto.monto.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: "hsl(145, 60%, 60%)" }}>
                  ${gasto.iva.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: "hsl(220, 90%, 65%)" }}>
                  ${gasto.retenido.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  {gasto.tieneXML ? (
                    <span className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Disponible
                    </span>
                  ) : (
                    <span className="text-xs text-amber-400 flex items-center justify-end gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pendiente
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => copyText(gasto.descripcion, 'Descripción')}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
                      title="Copiar descripción"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                    </button>
                    <button
                      onClick={() => downloadXML(gasto.id)}
                      disabled={!gasto.tieneXML}
                      className="p-1.5 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Descargar XML"
                    >
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
