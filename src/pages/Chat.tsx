import { motion } from "framer-motion";
import { MessageCircle, Send, Loader2, ArrowLeft, User, UserCheck } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import contAiApi from "@/lib/api";
import { useToast } from "../hooks/use-toast";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = localStorage.getItem('userId');
  const currentUserRole = localStorage.getItem('userRole');
  const clienteId = searchParams.get('clienteId');
  const contadorIdParam = searchParams.get('contadorId');
  
  // If current user is cliente, the contadorId is in the URL or from user settings
  // If current user is contador, the clienteId is in the URL
  const isContador = currentUserRole === 'contador';
  const otherId = isContador ? clienteId : contadorIdParam;
  
  useEffect(() => {
    if (!currentUserId || !otherId) {
      toast({ title: "Error", description: "Parámetros faltantes", variant: "destructive" });
      navigate('/settings');
      return;
    }
    
    loadConversation();
    loadOtherUserInfo();
    
    // Polling for new messages every 5 seconds
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, otherId, clienteId, contadorIdParam]);
  
  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const loadOtherUserInfo = async () => {
    try {
      // If I'm a contador, get the cliente info
      if (isContador && clienteId) {
        const result = await contAiApi.getUsuario(clienteId);
        if (result.success && result.data) {
          setOtherUser(result.data);
        }
      } 
      // If I'm a cliente, get my contador info from settings
      else if (!isContador && currentUserId) {
        const result = await contAiApi.getUserSettings(currentUserId);
        if (result.success && result.data?.contador) {
          setOtherUser(result.data.contador);
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };
  
  const loadConversation = async () => {
    try {
      let result;
      
      if (isContador && clienteId) {
        result = await contAiApi.getConversacion(clienteId, currentUserId);
      } else {
        // For cliente, we need the contadorId
        const userSettings = await contAiApi.getUserSettings(currentUserId);
        if (userSettings.success && userSettings.data?.contador?.id) {
          result = await contAiApi.getConversacion(currentUserId, userSettings.data.contador.id);
        }
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
    if (!nuevoMensaje.trim()) return;
    
    setSending(true);
    try {
      let contadorIdToSend: string | undefined;
      let clienteIdToSend: string | undefined;
      
      if (isContador && clienteId) {
        clienteIdToSend = clienteId;
        contadorIdToSend = currentUserId || undefined;
      } else {
        clienteIdToSend = currentUserId || undefined;
        const userSettings = await contAiApi.getUserSettings(currentUserId || '');
        if (userSettings.success && userSettings.data?.contador?.id) {
          contadorIdToSend = userSettings.data.contador.id;
        }
      }
      
      const result = await contAiApi.sendMessage(
        clienteIdToSend || '', 
        nuevoMensaje,
        contadorIdToSend || '',
        isContador ? 'contador' : 'usuario'
      );
      
      if (result.success) {
        setNuevoMensaje("");
        loadConversation();
      } else {
        toast({ title: "Error", description: result.error || "No se pudo enviar el mensaje", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al enviar mensaje", variant: "destructive" });
    }
    setSending(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "hsl(195, 100%, 50%)" }} />
          <p style={{ color: "hsl(210, 15%, 50%)" }}>Cargando conversación...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "hsl(210, 15%, 70%)" }} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(195 100% 50% / 0.15)", border: "1px solid hsl(195 100% 50% / 0.3)" }}>
          {isContador ? <User className="w-5 h-5" style={{ color: "hsl(195, 100%, 60%)" }} /> : <UserCheck className="w-5 h-5" style={{ color: "hsl(195, 100%, 60%)" }} />}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
            {isContador ? 'Chat con Cliente' : 'Chat con Mi Contador'}
          </h1>
          {otherUser && (
            <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>
              {otherUser.nombre} {otherUser.rfc ? `(${otherUser.rfc})` : ''}
            </p>
          )}
        </div>
      </motion.div>
      
      {/* Messages */}
      <div className="glass-card rounded-2xl p-4 mb-4" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          {mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 mb-4" style={{ color: "hsl(210, 15%, 30%)" }} />
              <p className="text-lg font-semibold" style={{ color: "hsl(210, 20%, 70%)" }}>
                No hay mensajes aún
              </p>
              <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>
                Envía un mensaje para comenzar la conversación
              </p>
            </div>
          ) : (
            mensajes.map((msg, index) => {
              const isMyMessage = msg.remitente === currentUserRole || 
                (msg.remitente === 'usuario' && currentUserRole === 'usuario') ||
                (msg.remitente === 'contador' && currentUserRole === 'contador');
              
              return (
                <motion.div 
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      isMyMessage 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                        : 'bg-white/10 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{msg.mensaje}</p>
                    <p className={`text-xs mt-1 ${isMyMessage ? 'text-white/70' : 'text-gray-400'}`}>
                      {msg.fecha}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex gap-3">
          <textarea
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent border-none outline-none resize-none text-gray-100 placeholder-gray-500"
            style={{ minHeight: "40px", maxHeight: "120px" }}
            rows={1}
          />
          <button
            onClick={handleEnviar}
            disabled={sending || !nuevoMensaje.trim()}
            className="p-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(195, 100%, 45%), hsl(220, 90%, 50%))",
              color: "white"
            }}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
