import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Bell, TrendingDown, FileCheck, Zap } from "lucide-react";

const notifications = [
  { icon: Bell, text: "Tienes 3 facturas pendientes de validar", type: "warning" },
  { icon: TrendingDown, text: "Deducción detectada: $4,500 en servicios de telecomunicaciones", type: "success" },
  { icon: FileCheck, text: "Tu declaración mensual vence en 5 días", type: "alert" },
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);

  const activeNotifs = notifications.filter((_, i) => !dismissed.includes(i));

  return (
    <motion.div 
      drag
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      style={{ touchAction: 'none' }}
    >
      {/* Notification cards */}
      <AnimatePresence>
        {open && activeNotifs.map((notif, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl max-w-xs relative"
            style={{
              background: "hsl(210 40% 8% / 0.95)",
              border: "1px solid hsl(195 100% 50% / 0.2)",
              boxShadow: "0 8px 32px hsl(0 0% 0% / 0.4), 0 0 12px hsl(195 100% 50% / 0.1)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "hsl(195 100% 50% / 0.15)" }}>
              <notif.icon className="w-3.5 h-3.5" style={{ color: "hsl(195, 100%, 65%)" }} />
            </div>
            <p className="text-xs leading-relaxed flex-1" style={{ color: "hsl(210, 20%, 75%)" }}>
              {notif.text}
            </p>
            <button
              onClick={() => setDismissed(prev => [...prev, notifications.indexOf(notif)])}
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
              style={{ color: "hsl(210, 15%, 50%)" }}
            >
              <X className="w-3 h-3" />
            </button>
            {/* Data flow line connecting to avatar */}
            {i === activeNotifs.length - 1 && (
              <div className="absolute -bottom-3 right-6 w-0.5 h-3 overflow-hidden"
                style={{ background: "linear-gradient(to bottom, hsl(195 100% 50% / 0.4), transparent)" }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Avatar orb */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at 35% 35%, hsl(195, 100%, 70%) 0%, hsl(220, 90%, 50%) 50%, hsl(240, 80%, 30%) 100%)",
          boxShadow: "0 0 20px hsl(195 100% 50% / 0.5), 0 0 40px hsl(195 100% 50% / 0.25), inset 0 1px 0 hsl(195 100% 80% / 0.3)"
        }}
      >
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full pulse-ring"
          style={{ border: "1px solid hsl(195 100% 50% / 0.4)" }} />
        <div className="absolute inset-0 rounded-full pulse-ring"
          style={{ border: "1px solid hsl(195 100% 50% / 0.2)", animationDelay: "0.5s" }} />

        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <X className="w-5 h-5" style={{ color: "hsl(210, 50%, 10%)" }} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Bot className="w-5 h-5" style={{ color: "hsl(210, 50%, 10%)" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        {!open && activeNotifs.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "hsl(0, 72%, 51%)", color: "hsl(0, 0%, 100%)" }}
          >
            {activeNotifs.length}
          </motion.div>
        )}
      </motion.button>

      {/* Label */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium text-center"
            style={{ color: "hsl(195, 60%, 60%)" }}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            CONT-AI
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
