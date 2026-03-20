import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, XCircle, MessageSquare, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { contAiApi } from "@/lib/api";
import { toast } from "sonner";

interface Client {
  id: string;
  nombre: string;
  email: string;
  status: string;
}


export default function MiContador() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [contador, setContador] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    setUserRole(role || "");

    if (!userId) return;

    if (role === 'contador') {
      loadClients(userId);
    } else {
      loadContadorInfo();
      loadMessages(userId);
    }

    const interval = setInterval(() => {
      const uId = localStorage.getItem('userId');
      if (uId) loadMessages(uId, selectedClient?.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedClient?.id]);

  const loadContadorInfo = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const result = await contAiApi.getUserSettings(userId);
      if (result.success && result.data.contador) {
        setContador(result.data.contador);
      }
    } catch (error) {
      console.error("Error loading contador info:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string, otherId?: string) => {
    try {
      const result = await contAiApi.getConversacion(userId);
      if (result.success && Array.isArray(result.data)) {
        // Filter by selected client if I'm a contador
        if (userRole === 'contador' && otherId) {
          setMensajes(result.data.filter((m: any) => m.userId === otherId || m.contadorId === otherId));
        } else {
          setMensajes(result.data);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadClients = async (contadorId: string) => {
    try {
      const result = await contAiApi.getLinkedClients(contadorId);
      if (result.success && Array.isArray(result.data)) {
        setClients(result.data);
        if (result.data.length > 0 && !selectedClient) {
          setSelectedClient(result.data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {

    if (!message.trim()) return;
    const userId = localStorage.getItem('userId') || "";
    
    setSending(true);
    try {
      let result;
      if (userRole === 'contador') {
        if (!selectedClient) return;
        result = await contAiApi.sendMessage(selectedClient.id, message, userId, 'contador');
      } else {
        if (!contador?.id) {
          // Reloader session or show error
          const session = await contAiApi.getUserSettings(userId);
          if (session.success && session.data.contador?.id) {
            result = await contAiApi.sendMessage(userId, message, session.data.contador.id, 'usuario');
          } else {
            toast.error("No tienes un contador vinculado");
            setSending(false);
            return;
          }
        } else {
          result = await contAiApi.sendMessage(userId, message, contador.id, 'usuario');
        }
      }

      if (result.success) {
        setMessage("");
        loadMessages(userId, selectedClient?.id);
      } else {
        toast.error("Error al enviar mensaje");
      }
    } catch (error) {
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si es contador, mostrar panel de clientes
  if (userRole === 'contador') {
    return (
      <div className="p-6 h-[calc(100vh-56px)] flex flex-col space-y-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Mensajería</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
            Comunicación con tus clientes vinculados
          </p>
          <div className="vein-line w-48 mt-3" />
        </motion.div>

        {/* Lista de clientes o mensaje de vacío */}
        {clients.length > 0 ? (
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Lista de clientes */}
            <div className="w-64 flex-shrink-0 glass-card rounded-xl p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "hsl(210, 20%, 80%)" }}>
                Tus Clientes ({clients.length})
              </h3>
              <div className="space-y-2">
                {clients.map((client) => (
                  <motion.button
                    key={client.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedClient(client)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${selectedClient?.id === client.id
                      ? 'bg-blue-500/20 border border-blue-500/40'
                      : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "hsl(195 100% 50% / 0.2)", color: "hsl(195, 100%, 60%)" }}>
                        {client.nombre?.split(' ').map(n => n[0]).join('') || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "hsl(210, 20%, 90%)" }}>
                          {client.nombre || 'Cliente'}
                        </p>
                        <p className="text-xs truncate" style={{ color: "hsl(210, 15%, 50%)" }}>
                          {client.email || 'Sin email'}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chat con cliente seleccionado */}
            <div className="flex-1 glass-card rounded-xl p-4 flex flex-col">
              {selectedClient ? (
                <>
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: "hsl(195 100% 50% / 0.2)", color: "hsl(195, 100%, 60%)" }}>
                      {selectedClient.nombre?.split(' ').map(n => n[0]).join('') || 'C'}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "hsl(210, 20%, 90%)" }}>
                        {selectedClient.nombre || 'Cliente'}
                      </p>
                      <p className="text-xs" style={{ color: "hsl(145, 60%, 55%)" }}>
                        Activo
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    {mensajes.length === 0 ? (
                      <div className="text-center py-10 opacity-40">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm">No hay mensajes anteriores</p>
                      </div>
                    ) : (
                      mensajes.map((entry, i) => {
                        const isMyMessage = entry.remitente === 'contador';
                        return (
                          <motion.div key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${isMyMessage
                              ? 'bg-blue-500/20 border border-blue-500/30'
                              : 'bg-slate-700/50 border border-slate-600/50'
                              }`}>
                              <p className="text-sm" style={{ color: "hsl(210, 20%, 90%)" }}>{entry.mensaje}</p>
                              <p className="text-xs mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
                                {entry.fecha}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Input de mensaje */}
                  <div className="pt-4 border-t border-slate-700/50 flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={sending}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                      style={{ color: "hsl(210, 20%, 90%)" }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={sending || !message.trim()}
                      className="p-2 rounded-lg disabled:opacity-50"
                      style={{ background: "hsl(195, 100%, 50%)", color: "white" }}
                    >
                      {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p style={{ color: "hsl(210, 15%, 50%)" }}>Selecciona un cliente para chatear</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-8 text-center border-2 border-dashed border-slate-700/50">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h3 className="text-lg font-bold mb-2 text-slate-300">No tienes clientes vinculados</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-4">
              Comparte tu código de contador desde la configuración para recibir clientes.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/settings')}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Ir a Configuración
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  }

  // Si es usuario normal, mostrar información del contador vinculado (original)
  return (
    <div className="p-6 h-[calc(100vh-56px)] flex flex-col space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Mi Contador</h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
          Canal directo de comunicación y validación
        </p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      {/* Contador profile card */}
      {contador ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(195, 100%, 40%), hsl(220, 90%, 45%))", color: "hsl(0, 0%, 100%)" }}>
            {contador.nombre ? contador.nombre.split(' ').map((n: any) => n[0]).join('') : 'C'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "hsl(210, 20%, 88%)" }}>{contador.nombre}</p>
            <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>{contador.rfc || 'Contador Certificado'}</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            style={{ background: "hsl(145 60% 40% / 0.12)", border: "1px solid hsl(145 60% 40% / 0.25)", color: "hsl(145, 60%, 60%)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Conectado
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-8 text-center border-2 border-dashed border-slate-700/50">
          <User className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-lg font-bold mb-2 text-slate-300">No tienes un contador vinculado</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mb-4">
            Vincula a tu contador desde la configuración para habilitar el canal de comunicación y validación fiscal.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/settings')}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all"
          >
            Ir a Configuración
          </motion.button>
        </motion.div>
      )}

      {/* Timeline chat */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {mensajes.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <MessageSquare className="w-12 h-12 mx-auto mb-3" />
            <p>Aún no hay mensajes. ¡Envía uno para comenzar!</p>
          </div>
        ) : (
          mensajes.map((entry, i) => {
            const isMyMessage = entry.remitente === 'usuario';
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${isMyMessage
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'bg-slate-700/50 border border-slate-600/50'
                  }`}>
                  <p className="text-sm" style={{ color: "hsl(210, 20%, 90%)" }}>{entry.mensaje}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>
                      {entry.fecha}
                    </p>
                    {entry.remitente === 'contador' && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-2" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Message input */}
      <div className="pt-4 border-t border-slate-700/50 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={sending}
          placeholder="Escribe un mensaje a tu contador..."
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          style={{ color: "hsl(210, 20%, 90%)" }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="p-2 rounded-lg disabled:opacity-50"
          style={{ background: "hsl(195, 100%, 50%)", color: "white" }}
        >
          {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
}
