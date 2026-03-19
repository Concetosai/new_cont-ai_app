import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Copy, Calendar, CheckCircle, Clock, User, Link, ExternalLink, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import contAiApi from '@/lib/api';
import { toast } from 'sonner';

interface Client {
  id: string;
  nombre: string;
  code: string;
  status: 'activo' | 'pendiente';
  joined: string;
  email: string;
  gastosCount: number;
  scoreFiscal: number;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const contadorId = localStorage.getItem('userId');
      if (!contadorId) {
        toast.error('Usuario no identificado');
        return;
      }

      const result = await contAiApi.getLinkedClients(contadorId);
      if (result.success && Array.isArray(result.data)) {
        setClients(result.data);
      } else {
        // Mock data fallback
        setClients([
          { id: 'CLI001', nombre: 'Juan Pérez', code: 'CL-JP001', status: 'activo', joined: '15 Mar 2024', email: 'juan@empresa.mx', gastosCount: 47, scoreFiscal: 92 },
          { id: 'CLI002', nombre: 'María González', code: 'CL-MG002', status: 'activo', joined: '10 Mar 2024', email: 'maria@tienda.com', gastosCount: 23, scoreFiscal: 87 },
          { id: 'CLI003', nombre: 'Carlos López', code: 'CL-CL003', status: 'pendiente', joined: '12 Mar 2024', email: 'carlos@freelance.mx', gastosCount: 5, scoreFiscal: 76 },
        ]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      // Mock data fallback
      setClients([
        { id: 'CLI001', nombre: 'Juan Pérez', code: 'CL-JP001', status: 'activo', joined: '15 Mar 2024', email: 'juan@empresa.mx', gastosCount: 47, scoreFiscal: 92 },
        { id: 'CLI002', nombre: 'María González', code: 'CL-MG002', status: 'activo', joined: '10 Mar 2024', email: 'maria@tienda.com', gastosCount: 23, scoreFiscal: 87 },
        { id: 'CLI003', nombre: 'Carlos López', code: 'CL-CL003', status: 'pendiente', joined: '12 Mar 2024', email: 'carlos@freelance.mx', gastosCount: 5, scoreFiscal: 76 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado');
  };

  const viewClientDashboard = (clientId: string) => {
    navigate(`/client/${clientId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] p-6 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(195 100% 50% / 0.15)", border: "1px solid hsl(195 100% 50% / 0.3)" }}>
          <Users className="w-6 h-6" style={{ color: "hsl(195, 100%, 60%)" }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Mis Clientes</h1>
          <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>
            Acceso completo a dashboards de clientes vinculados
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="glass-card p-6 text-center rounded-2xl">
          <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(195, 100%, 60%)" }} />
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>{clients.length}</div>
          <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>Clientes Total</p>
        </div>
        <div className="glass-card p-6 text-center rounded-2xl">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(145, 60%, 55%)" }} />
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            {Array.isArray(clients) ? clients.filter(c => c.status === 'activo').length : 0}
          </div>
          <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>Activos</p>
        </div>
        <div className="glass-card p-6 text-center rounded-2xl">
          <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(220, 90%, 60%)" }} />
          <div className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            {Array.isArray(clients) ? clients.reduce((sum, c) => sum + (c.gastosCount || 0), 0) : 0}
          </div>
          <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>Gastos Total</p>
        </div>
      </motion.div>

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-4 pr-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Cliente</th>
                <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Código</th>
                <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Estado</th>
                <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Score</th>
                <th className="text-left py-4 px-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Gastos</th>
                <th className="text-right py-4 pl-4 font-semibold" style={{ color: "hsl(210, 20%, 80%)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {clients.map((client) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-slate-800/50 transition-all cursor-pointer group"
                  onClick={() => viewClientDashboard(client.id)}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-110"
                        style={{ background: "hsl(195 100% 50% / 0.15)", color: "hsl(195, 100%, 60%)" }}>
                        {client.nombre.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>{client.nombre}</p>
                        <p className="text-xs" style={{ color: "hsl(210, 15%, 55%)" }}>{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-semibold" style={{ color: "hsl(270, 60%, 70%)" }}>
                    {client.code}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      client.status === 'activo' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {client.status === 'activo' ? '🟢 Activo' : '🟡 Pendiente'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 rounded-full bg-slate-800/50">
                        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" 
                          style={{ width: `${client.scoreFiscal}%` }} />
                      </div>
                      <span className="text-xs font-semibold ml-2" style={{ color: "hsl(210, 20%, 85%)" }}>
                        {client.scoreFiscal}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-sm" style={{ color: "hsl(210, 20%, 85%)" }}>
                    {client.gastosCount.toLocaleString()}
                  </td>
                  <td className="py-4 pl-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => copyCode(client.code)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
                        title="Copiar código"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                      </button>
                      <button 
                        onClick={() => viewClientDashboard(client.id)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/20 transition-all"
                        title="Ver Dashboard"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400 hover:text-blue-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
