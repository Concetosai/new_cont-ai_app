import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, XCircle, MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { contAiApi } from "@/lib/api";

const timeline = [
  { type: "system", text: "Gasto enviado para validación: Telecomunicaciones $2,450", time: "10:32 AM", date: "Hoy" },
  { type: "contador", text: "Revisado. Gasto válido y categorizado correctamente bajo telecomunicaciones. Dedución aplicada.", time: "11:05 AM", date: "Hoy", status: "validated" },
  { type: "system", text: "Gasto enviado para validación: Arrendamiento $18,000", time: "09:15 AM", date: "Ayer" },
  { type: "contador", text: "Necesito el contrato de arrendamiento para respaldar esta deducción. ¿Puedes subirlo a la Bóveda?", time: "02:40 PM", date: "Ayer", status: "comment" },
  { type: "user", text: "Ya subí el contrato a la Bóveda Fiscal.", time: "03:12 PM", date: "Ayer" },
  { type: "contador", text: "Perfecto, gasto validado.", time: "04:00 PM", date: "Ayer", status: "validated" },
];

export default function MiContador() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [contador, setContador] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadContadorInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        {timeline.map((entry, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
            className={`flex gap-3 ${entry.type === "user" ? "flex-row-reverse" : ""}`}
          >
            {entry.type !== "user" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: entry.type === "system" ? "hsl(195 100% 50% / 0.15)" : "hsl(220 90% 55% / 0.15)"
                }}>
                {entry.type === "system"
                  ? <MessageSquare className="w-3.5 h-3.5" style={{ color: "hsl(195, 100%, 65%)" }} />
                  : <User className="w-3.5 h-3.5" style={{ color: "hsl(220, 90%, 65%)" }} />}
              </div>
            )}

            <div className={`max-w-xs ${entry.type === "user" ? "ml-auto" : ""}`}>
              {entry.date && i > 0 && timeline[i - 1].date !== entry.date && (
                <p className="text-xs text-center mb-2" style={{ color: "hsl(210, 15%, 40%)" }}>{entry.date}</p>
              )}
              <div className="rounded-xl px-4 py-3"
                style={{
                  background: entry.type === "user"
                    ? "hsl(195 100% 50% / 0.15)"
                    : entry.type === "system"
                      ? "hsl(210 35% 10%)"
                      : "hsl(220 35% 12%)",
                  border: `1px solid ${entry.type === "user"
                    ? "hsl(195 100% 50% / 0.3)"
                    : "hsl(210 30% 18%)"}`,
                }}>
                {entry.status === "validated" && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <CheckCircle className="w-3 h-3" style={{ color: "hsl(145, 60%, 55%)" }} />
                    <span className="text-xs font-semibold" style={{ color: "hsl(145, 60%, 60%)" }}>Validado</span>
                  </div>
                )}
                {entry.status === "comment" && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <XCircle className="w-3 h-3" style={{ color: "hsl(35, 95%, 60%)" }} />
                    <span className="text-xs font-semibold" style={{ color: "hsl(35, 95%, 60%)" }}>Solicita información</span>
                  </div>
                )}
                <p className="text-xs leading-relaxed" style={{ color: "hsl(210, 15%, 75%)" }}>{entry.text}</p>
                <p className="text-xs mt-1.5" style={{ color: "hsl(210, 15%, 40%)" }}>{entry.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Message input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="flex gap-3">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setMessage("")}
          placeholder="Escribe un mensaje a tu contador..."
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: "hsl(210 35% 9%)",
            border: "1px solid hsl(210 30% 18%)",
            color: "hsl(210, 20%, 85%)",
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setMessage("")}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, hsl(195, 100%, 45%), hsl(220, 90%, 50%))",
            boxShadow: "0 0 14px hsl(195 100% 50% / 0.25)"
          }}
        >
          <Send className="w-4 h-4" style={{ color: "hsl(210, 50%, 5%)" }} />
        </motion.button>
      </motion.div>
    </div>
  );
}
