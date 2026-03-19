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
        setClients([]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
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

      {/* Clients List/Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        {clients.length > 0 ? (
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
                            style={{ width: `${client.scoreFiscal || 0}%` }} />
                        </div>
                        <span className="text-xs font-semibold ml-2" style={{ color: "hsl(210, 20%, 85%)" }}>
                          {client.scoreFiscal || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-sm" style={{ color: "hsl(210, 20%, 85%)" }}>
                      {(client.gastosCount || 0).toLocaleString()}
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
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "hsl(210, 20%, 85%)" }}>No tienes clientes vinculados</h3>
            <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: "hsl(210, 15%, 50%)" }}>
              Comparte tu código QR o código de contador desde la configuración para empezar a recibir clientes.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="px-6 py-2 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto"
            >
              <Link className="w-4 h-4" />
              Ir a Configuración
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
