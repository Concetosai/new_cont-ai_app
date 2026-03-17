import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import contAiLogo from "@/assets/cont-ai-logo.png";
import { MessageCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0A1929 0%, #050c14 60%, #000000 100%)" }}>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Ambient glow circles */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(195 100% 50% / 0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(220 90% 55% / 0.06) 0%, transparent 70%)" }} />

      {/* Top spacer */}
      <div />

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 z-10 px-8 text-center">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="float-anim"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full glow-cyan opacity-60 blur-xl scale-110" />
            <img
              src={contAiLogo}
              alt="CONT-AI Logo"
              className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <h1 className="font-brand text-5xl font-black text-glow tracking-widest"
            style={{ color: "hsl(195, 100%, 85%)", letterSpacing: "0.2em" }}>
            CONT-AI
          </h1>
          <div className="vein-line w-48 my-1" />
          <p className="text-sm tracking-[0.4em] uppercase font-medium"
            style={{ color: "hsl(195, 60%, 70%)" }}>
            Contabilidad Inteligente
          </p>
          <p className="text-xs tracking-[0.3em] uppercase mt-1"
            style={{ color: "hsl(210, 20%, 55%)" }}>
            Panuco Ver. 2026
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-sm max-w-xs italic"
          style={{ color: "hsl(210, 20%, 60%)" }}
        >
          "El puente inteligente entre el usuario y su contabilidad"
        </motion.p>

        {/* Enter button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-10 py-3 rounded-full font-semibold text-sm tracking-widest uppercase relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(195, 100%, 50%), hsl(220, 90%, 55%))",
            color: "hsl(210, 50%, 5%)",
            boxShadow: "0 0 24px hsl(195 100% 50% / 0.5), 0 4px 20px hsl(0 0% 0% / 0.4)"
          }}
        >
          <span className="relative z-10">Acceder al Sistema</span>
        </motion.button>

        {/* Loading bar */}
        {loading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.6, ease: "linear" }}
            className="h-0.5 rounded-full mt-2"
            style={{ background: "linear-gradient(90deg, hsl(195, 100%, 50%), hsl(220, 90%, 55%))", maxWidth: "200px" }}
          />
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="z-10 pb-8 flex flex-col items-center gap-3"
      >
        <div className="vein-line w-32" />

        {/* WhatsApp */}
        <a
          href="https://wa.me/528332892730"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
          style={{
            background: "hsl(210 35% 12% / 0.8)",
            border: "1px solid hsl(210 30% 20%)",
            color: "hsl(120, 60%, 60%)"
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Ventas y Servicio</span>
        </a>

        <p className="text-xs tracking-widest uppercase"
          style={{ color: "hsl(210, 15%, 35%)" }}>
          Conceptos AI MX · Panuco Ver. 2026 · +52 833 289 2730
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
