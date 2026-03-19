import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  FileText,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Eye,
  Copy,
} from 'lucide-react';
import contAiApi from '@/lib/api';
import { toast } from 'sonner';

interface Client {
  id: string;
  nombre: string;
  email: string;
  rfc?: string;
  code: string;
  status: 'activo' | 'pendiente';
  joined: string;
}

interface ClientGasto {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
  iva: number;
  retenido: number;
}

export default function ClientDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [gastos, setGastos] = useState<ClientGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGastos: 0,
    totalIva: 0,
    totalRetenido: 0,
    gastosCount: 0,
  });

  useEffect(() => {
    if (clientId) {
      loadClientData(clientId);
    }
  }, [clientId]);

  const loadClientData = async (id: string) => {
    setLoading(true);
    try {
      // Mock data - replace with API calls
      // const clientResult = await contAiApi.getClient(id);
      // const gastosResult = await contAiApi.getClientGastos(id);
      
      setTimeout(() => {
        setClient({
          id: 'CLI001',
          nombre: 'Juan Pérez',
          email: 'juan@empresa.mx',
          rfc: 'PEJU850101ABC',
          code: 'CL-JP001',
          status: 'activo',
          joined: '15 Mar 2024',
        });
        
        const mockGastos: ClientGasto[] = [
          { id: 'G001', descripcion: 'Compra de oficina', monto: 1500, fecha: '2024-03-15', categoria: 'Oficina', iva: 240, retenido: 0 },
          { id: 'G002', descripcion: 'Servicios profesionales', monto: 5000, fecha: '2024-03-14', categoria: 'Servicios', iva: 800, retenido: 100 },
          { id: 'G003', descripcion: 'Viáticos', monto: 800, fecha: '2024-03-13', categoria: 'Viajes', iva: 128, retenido: 0 },
          { id: 'G004', descripcion: 'Equipo de cómputo', monto: 12000, fecha: '2024-03-10', categoria: 'Equipo', iva: 1920, retenido: 0 },
        ];
        
        setGastos(mockGastos);
        setStats({
          totalGastos: mockGastos.reduce((sum, g) => sum + g.monto, 0),
          totalIva: mockGastos.reduce((sum, g) => sum + g.iva, 0),
          totalRetenido: mockGastos.reduce((sum, g) => sum + g.retenido, 0),
          gastosCount: mockGastos.length,
        });
        
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading client data:', error);
      toast.error('Error al cargar datos del cliente');
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (client?.code) {
      navigator.clipboard.writeText(client.code);
      toast.success('Código copiado');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] p-6 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando dashboard del cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-[calc(100vh-56px)] p-6 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <p className="text-lg font-semibold">Cliente no encontrado</p>
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all"
          >
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            Dashboard de {client.nombre}
          </h1>
          <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>
            Vista completa del cliente - Contador
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            client.status === 'activo'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {client.status === 'activo' ? '🟢 Activo' : '🟡 Pendiente'}
          </span>
        </div>
      </motion.div>

      {/* Client Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: "hsl(195 100% 50% / 0.15)", color: "hsl(195, 100%, 60%)" }}>
              {client.nombre.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>{client.nombre}</h2>
              <p className="text-sm" style={{ color: "hsl(210, 15%, 55%)" }}>{client.email}</p>
              {client.rfc && (
                <p className="text-xs font-mono mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
                  RFC: <span className="font-semibold">{client.rfc}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              {client.code}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5" style={{ color: "hsl(195, 100%, 60%)" }} />
            <span className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Total Gastos</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            ${stats.totalGastos.toLocaleString()}
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: "hsl(145, 60%, 55%)" }} />
            <span className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>IVA Acreditable</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            ${stats.totalIva.toLocaleString()}
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5" style={{ color: "hsl(220, 90%, 60%)" }} />
            <span className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>ISR Retenido</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            ${stats.totalRetenido.toLocaleString()}
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: "hsl(270, 80%, 70%)" }} />
            <span className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>Gastos Registrados</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            {stats.gastosCount}
          </div>
        </div>
      </motion.div>

      {/* Recent Gastos Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "hsl(195, 100%, 65%)" }}>
            <FileText className="w-5 h-5" />
            Gastos Recientes
          </h3>
          <button className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-3 pr-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Fecha</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Descripción</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Categoría</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Monto</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>IVA</th>
                <th className="text-right py-3 pl-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Retenido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {gastos.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 pr-4 text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>
                    {gasto.fecha}
                  </td>
                  <td className="py-3 px-4" style={{ color: "hsl(210, 20%, 85%)" }}>
                    {gasto.descripcion}
                  </td>
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
                  <td className="py-3 pl-4 text-right font-semibold" style={{ color: "hsl(220, 90%, 65%)" }}>
                    ${gasto.retenido.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: "hsl(195, 100%, 65%)" }}>Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all text-center">
            <FileText className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(195, 100%, 60%)" }} />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Ver Todos Gastos</span>
          </button>
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all text-center">
            <Download className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(195, 100%, 60%)" }} />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Descargar XML</span>
          </button>
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(195, 100%, 60%)" }} />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Análisis</span>
          </button>
          <button className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all text-center">
            <User className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(195, 100%, 60%)" }} />
            <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>Editar Cliente</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
