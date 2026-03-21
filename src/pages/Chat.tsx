import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, ArrowLeft, User, UserCheck, Search, Users, ShieldCheck, MessageSquare } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import contAiApi from "@/lib/api";
import { useToast } from "../hooks/use-toast";

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sending, setSending] = useState(false);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = localStorage.getItem('userId');
  const currentUserRole = localStorage.getItem('userRole');
  const clienteIdParam = searchParams.get('clienteId');
  
  const isContador = currentUserRole === 'contador';
  
  useEffect(() => {
    if (!currentUserId) {
      navigate('/auth');
      return;
    }
    
    if (isContador) {
      loadLinkedClients();
    } else {
      loadAccountantInfo();
    }
  }, [currentUserId, isContador]);
  
  useEffect(() => {
    if (currentUserId && (clienteIdParam || (!isContador && otherUser?.id))) {
      const targetId = isContador ? clienteIdParam : otherUser?.id;
      if (targetId) {
        loadConversation(targetId);
        if (isContador) {
          loadSpecificUserInfo(targetId);
        }
      }
    } else {
      setLoading(false);
    }
    
    const interval = setInterval(() => {
      const targetId = isContador ? clienteIdParam : otherUser?.id;
      if (currentUserId && targetId) {
        loadConversation(targetId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, clienteIdParam, isContador, otherUser?.id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const loadLinkedClients = async () => {
    setLoadingContacts(true);
    try {
      const result = await contAiApi.getLinkedClients(currentUserId!);
      if (result.success) {
        setContacts(result.data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingContacts(false);
    }
  };
  
  const loadAccountantInfo = async () => {
    try {
      const result = await contAiApi.getUserSettings(currentUserId!);
      if (result.success && result.data?.contador) {
        setOtherUser(result.data.contador);
      }
    } catch (error) {
      console.error('Error loading accountant info:', error);
    }
  };
  
  const loadSpecificUserInfo = async (id: string) => {
    try {
      const result = await contAiApi.getUsuario(id);
      if (result.success) {
        setOtherUser(result.data);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };
  
  const loadConversation = async (targetId: string) => {
    try {
      let result;
      if (isContador) {
        result = await contAiApi.getConversacion(targetId, currentUserId!);
      } else {
        result = await contAiApi.getConversacion(currentUserId!, targetId);
      }
      
      if (result?.success) {
        setMensajes(result.data?.mensajes || []);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() || !currentUserId) return;
    
    const destId = isContador ? clienteIdParam : otherUser?.id;
    if (!destId) return;

    setSending(true);
    try {
      const result = await contAiApi.sendMessage(
        isContador ? destId : currentUserId,
        nuevoMensaje,
        isContador ? currentUserId : destId,
        isContador ? 'contador' : 'usuario'
      );
      
      if (result.success) {
        setNuevoMensaje("");
        loadConversation(destId);
      } else {
        toast({ title: "Error", description: result.error || "No se pudo enviar", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al enviar mensaje", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.rfc && c.rfc.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-slate-950/20">
      {/* Sidebar de Contactos */}
      <div className="w-80 border-r border-slate-800/50 bg-slate-900/40 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              {isContador ? "Mis Clientes" : "Mi Contador"}
            </h2>
          </div>
          
          {isContador && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {isContador ? (
            loadingContacts ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs text-slate-500">Cargando clientes...</span>
              </div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSearchParams({ clienteId: contact.id })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    clienteIdParam === contact.id 
                    ? 'bg-blue-500/20 border border-blue-500/30' 
                    : 'hover:bg-slate-800/30 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    clienteIdParam === contact.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {contact.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-slate-200">{contact.nombre}</p>
                    <p className="text-xs text-slate-500 truncate">{contact.rfc || contact.email}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No se encontraron clientes</p>
              </div>
            )
          ) : (
            otherUser ? (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{otherUser.nombre}</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Contador Verificado
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span>Email:</span>
                    <span className="text-slate-200">{otherUser.email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>RFC:</span>
                    <span className="text-slate-200">{otherUser.rfc || 'No disponible'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Cargando contador...</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Área del Chat */}
      <div className="flex-1 flex flex-col bg-slate-900/10">
        {!isContador || clienteIdParam ? (
          <>
            {/* Header del Chat */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  {isContador ? <User className="w-5 h-5 text-blue-400" /> : <UserCheck className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{otherUser?.nombre || 'Cargando...'}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">En Línea</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <AnimatePresence initial={false}>
                {mensajes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400">Sin mensajes anteriores</p>
                    <p className="text-xs text-slate-600">Comienza a escribir abajo</p>
                  </div>
                ) : (
                  mensajes.map((msg, index) => {
                    const isMyMessage = msg.remitente === currentUserRole;
                    return (
                      <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] p-3 rounded-2xl ${
                          isMyMessage 
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.mensaje}</p>
                          <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isMyMessage ? 'text-blue-100/60' : 'text-slate-500'}`}>
                            {msg.fecha}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Editor de Mensaje */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-800/50">
              <div className="max-w-4xl mx-auto flex items-end gap-3 p-2 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                <textarea
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-2 text-slate-200 placeholder-slate-600 text-sm"
                  rows={1}
                  style={{ minHeight: "2.5rem", maxHeight: "8rem" }}
                />
                <button
                  onClick={handleEnviar}
                  disabled={sending || !nuevoMensaje.trim()}
                  className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-blue-600/20"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50">
              <MessageSquare className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Buzón de Mensajería</h2>
            <p className="text-slate-500 max-w-sm mb-8">
              Selecciona un cliente de la lista de la izquierda para ver la conversación y enviar mensajes.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="p-4 rounded-2xl bg-slate-800/20 border border-slate-800/50">
                <p className="text-2xl font-bold text-slate-100">{contacts.length}</p>
                <p className="text-xs text-slate-500">Contactos totales</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/20 border border-slate-800/50">
                <p className="text-2xl font-bold text-blue-400">Online</p>
                <p className="text-xs text-slate-500">Estado del sistema</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
