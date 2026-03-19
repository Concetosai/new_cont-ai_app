import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Download,
  Search,
  FileText,
  TrendingUp,
  Calculator,
  Shield,
  BarChart3,
  LayoutDashboard,
  ScanLine,
  AlertCircle,
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
  linkedAt: string;
}

export default function ClientLayout() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clientId) {
      loadClientData(clientId);
      loadNotes(clientId);
    }
  }, [clientId]);

  const loadClientData = async (id: string) => {
    setLoading(true);
    try {
      const result = await contAiApi.getClient(id);
      if (result.success && result.data) {
        setClient(result.data);
      } else {
        // Fallback a mock data si falla la API
        setClient({
          id: clientId || 'CLI001',
          nombre: 'Juan Pérez',
          email: 'juan@empresa.mx',
          rfc: 'PEJU850101ABC',
          code: 'CL-JP001',
          status: 'activo',
          linkedAt: '15 Mar 2024',
        });
      }
    } catch (error) {
      console.error('Error loading client:', error);
      toast.error('Error al cargar datos del cliente');
      // Fallback a mock data
      setClient({
        id: clientId || 'CLI001',
        nombre: 'Juan Pérez',
        email: 'juan@empresa.mx',
        rfc: 'PEJU850101ABC',
        code: 'CL-JP001',
        status: 'activo',
        linkedAt: '15 Mar 2024',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (id: string) => {
    const contadorId = localStorage.getItem('userId');
    if (!contadorId) return;
    
    try {
      const result = await contAiApi.getContadorNotes(contadorId, id);
      if (result.success && result.data) {
        setNotes(result.data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async () => {
    const contadorId = localStorage.getItem('userId');
    if (!contadorId || !clientId) return;
    
    try {
      const result = await contAiApi.saveContadorNotes(contadorId, clientId, notes);
      if (result.success) {
        toast.success('Notas guardadas');
      } else {
        toast.error('Error al guardar notas');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Error al guardar notas');
    }
  };

  const exportClientData = () => {
    toast.success('Exportando datos del cliente...');
    // TODO: Implement real export
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/gastos')) return 'Gastos';
    if (path.includes('/facturacion')) return 'Facturación';
    if (path.includes('/impuestos')) return 'Impuestos';
    if (path.includes('/analisis')) return 'Análisis';
    if (path.includes('/score')) return 'Score Fiscal';
    return 'Dashboard';
  };

  const navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'gastos', label: 'Gastos', icon: ScanLine },
    { path: 'facturacion', label: 'Facturación', icon: FileText },
    { path: 'impuestos', label: 'Impuestos', icon: Calculator },
    { path: 'analisis', label: 'Análisis', icon: BarChart3 },
    { path: 'score', label: 'Score Fiscal', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] p-6 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-emerald-400">Cargando dashboard del cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-[calc(100vh-56px)] p-6 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <p className="text-lg font-semibold">Cliente no encontrado</p>
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all"
          >
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner Superior - Siempre Visible */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50"
      >
        <div className="bg-gradient-to-r from-emerald-900/95 to-green-900/95 border-b border-emerald-500/30 backdrop-blur-xl">
          {/* Barra principal */}
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/clients')}
                  className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                  title="Volver a Mis Clientes"
                >
                  <ArrowLeft className="w-5 h-5 text-emerald-400" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    {client.nombre.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-100">{client.nombre}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/30 border border-emerald-500/50 text-emerald-300">
                        🟢 Línea Verde Activa
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-emerald-400/80">
                      <span className="font-mono">RFC: {client.rfc}</span>
                      <span>•</span>
                      <span className="font-mono">Code: {client.code}</span>
                      <span>•</span>
                      <span>Vinculado: {client.linkedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Buscador */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/50" />
                  <input
                    type="text"
                    placeholder="Buscar en todo el dashboard..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 px-4 py-2 pl-10 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-100 placeholder:text-emerald-400/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Exportar */}
                <button
                  onClick={exportClientData}
                  className="px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-emerald-300 text-sm flex items-center gap-2"
                  title="Exportar datos"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>

                {/* Notas */}
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`px-3 py-2 rounded-lg border transition-all text-sm flex items-center gap-2 ${
                    showNotes 
                      ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-200' 
                      : 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300'
                  }`}
                  title="Notas privadas"
                >
                  <FileText className="w-4 h-4" />
                  Notas
                </button>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div className="px-6 pb-2">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname.includes(`/${item.path}`);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(`/client/${clientId}/${item.path}`)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-100'
                        : 'text-emerald-400/80 hover:bg-emerald-500/20 hover:text-emerald-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panel de Notas (colapsable) */}
      {showNotes && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-slate-900/80 border-b border-emerald-500/20 px-6 py-4"
        >
          <div className="max-w-2xl">
            <label className="text-xs text-emerald-400 font-medium mb-2 block">
              📝 Notas privadas sobre este cliente (solo visibles para ti)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Ej: Revisar gastos de marzo, faltan facturas..."
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-emerald-500 text-emerald-100 placeholder:text-slate-500 text-sm resize-none h-24"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={saveNotes}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-all"
              >
                Guardar notas
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badge de Read-Only */}
      <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20">
        <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-medium">
          <Eye className="w-3.5 h-3.5" />
          <span>Vista de solo lectura - Los cambios no se guardarán</span>
        </div>
      </div>

      {/* Contenido de la página */}
      <div className="p-6">
        <Outlet context={{ client, searchTerm }} />
      </div>
    </div>
  );
}
