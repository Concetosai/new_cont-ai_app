import { motion } from "framer-motion";
import { Settings, Shield, Mail, User, Zap, QrCode, Copy, ArrowRight, Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import contAiApi from "@/lib/api";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

export default function UserSettings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contadorInfo, setContadorInfo] = useState<any>(null);
  const [contadorCode, setContadorCode] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      loadSettings(userId);
      loadContadorCode(userId);
    }
  }, []);

  const loadContadorCode = async (userId: string) => {
    try {
      const result = await contAiApi.getContadorCode(userId);
      if (result.success && result.data?.code) {
        setContadorCode(result.data.code);
      }
    } catch (error) {
      console.error('Error loading contador code:', error);
    }
  };

  const loadSettings = async (userId: string) => {
    setLoading(true);
    try {
      const result = await contAiApi.getUserSettings(userId);
      if (result.success) {
        setUser(result.data);
        if (result.data.linkedContador) {
          setContadorInfo(result.data.linkedContador);
        }
      }
    } catch (error) {
      console.error('Settings load error:', error);
    }
    setLoading(false);
  };

  const copyContadorCode = () => {
    navigator.clipboard.writeText(contadorCode || contadorInfo?.code || '');
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    // Get the canvas data URL
    const pngUrl = canvas.toDataURL('image/png');
    
    // Trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `codigo-qr-contai-${contadorCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(195 100% 50% / 0.15)", border: "1px solid hsl(195 100% 50% / 0.3)" }}>
          <Settings className="w-6 h-6" style={{ color: "hsl(195, 100%, 60%)" }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Configuración</h1>
          <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>
            Tu perfil y contador asignado
          </p>
        </div>
      </motion.div>

      {/* User Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "hsl(195, 100%, 65%)" }}>
          <User className="w-5 h-5" />
          Mi Perfil
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span style={{ color: "hsl(210, 15%, 55%)" }}>Nombre:</span>
            <p className="font-semibold ml-2" style={{ color: "hsl(210, 20%, 85%)" }}>{user?.nombre}</p>
          </div>
          <div>
            <span style={{ color: "hsl(210, 15%, 55%)" }}>Role:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${
              user?.role === 'contador' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {user?.role === 'contador' ? '👨‍💼 Contador' : '👤 Usuario'}
            </span>
          </div>
          {user?.rfc && (
            <div className="col-span-2">
              <span style={{ color: "hsl(210, 15%, 55%)" }}>RFC:</span>
              <p className="font-mono font-semibold ml-2 uppercase" style={{ color: "hsl(210, 20%, 85%)" }}>
                {user.rfc}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Contador QR Code Section - Only for contadores */}
      {user?.role === 'contador' && contadorCode && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "hsl(195, 100%, 65%)" }}>
            <QrCode className="w-5 h-5" />
            Mi Código QR para Clientes
          </h2>
          <p className="text-sm mb-6" style={{ color: "hsl(210, 15%, 50%)" }}>
            Tus clientes pueden escanear este código QR para vincularse contigo
          </p>
          
          <div className="flex flex-col items-center">
            <div ref={qrRef} className="bg-white p-4 rounded-2xl inline-block mb-4">
              <QRCodeCanvas
                value={contadorCode}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>
            
            <div className="mb-4">
              <p className="text-xs mb-2" style={{ color: "hsl(210, 15%, 50%)" }}>Código único:</p>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mono font-bold text-xl px-6 py-3 rounded-xl shadow-lg tracking-wider">
                {contadorCode}
              </div>
            </div>
            
            <div className="flex gap-3 w-full max-w-sm">
              <button 
                onClick={copyContadorCode}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
              >
                <Copy className="w-4 h-4" />
                Copiar Código
              </button>
              <button 
                onClick={downloadQRCode}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar QR
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Linked Contador */}
      {contadorInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "hsl(220, 90%, 65%)" }}>
            <Shield className="w-5 h-5" />
            Mi Contador Asignado
          </h2>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/20">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm glow-violet"
              style={{ background: "hsl(220 90% 55% / 0.15)", color: "hsl(220, 90%, 70%)" }}>
              {contadorInfo.nombre.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "hsl(210, 20%, 90%)" }}>
                {contadorInfo.nombre}
              </p>
              <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>
                Código: <span className="font-mono font-semibold text-purple-400">{contadorInfo.code}</span>
              </p>
            </div>
            <button 
              onClick={copyContadorCode}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
            >
              <Copy className="w-3 h-3" />
              Copiar
            </button>
          </div>
          <p className="text-xs mt-4 text-center italic" style={{ color: "hsl(210, 15%, 45%)" }}>
            Tus gastos van directo a este contador para revisión
          </p>
        </motion.div>
      )}

      {!contadorInfo && user?.role === 'usuario' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 text-center border-2 border-dashed border-purple-500/30"
        >
          <QrCode className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(270, 80%, 70%)" }}>
            Conectar con Contador
          </h3>
          <p className="text-sm mb-6" style={{ color: "hsl(210, 15%, 55%)" }}>
            Escanea el QR de tu contador o ingresa su código para vincularte
          </p>
          <div className="max-w-sm mx-auto">
            <input
              type="text"
              placeholder="Código del contador (ej: ABC123XY)"
              className="w-full px-4 py-3 rounded-xl text-sm bg-slate-800/50 border border-slate-700/50 focus:border-purple-500 focus:ring-1 mb-4 text-center uppercase tracking-wider font-mono"
              maxLength={8}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Link logic
                  loadSettings(user.userId);
                }
              }}
            />
            <button className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Vincular Contador
            </button>
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="vein-line mx-auto w-64" style={{ backgroundColor: "hsl(195, 100%, 50%)" }} />

      {/* Plan */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-6 max-w-lg mx-auto text-center"
      >
        <h3 className="font-bold mb-3 text-lg flex items-center justify-center gap-2 mx-auto" style={{ color: "hsl(195, 100%, 65%)" }}>
          <Zap className="w-5 h-5" />
          Plan Actual
        </h3>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Crédito:</span>
            <span className="font-semibold" style={{ color: "hsl(145, 60%, 65%)" }}>✅ ilimitado</span>
          </div>
          <div className="flex justify-between">
            <span>Alertas:</span>
            <span className="font-semibold" style={{ color: "hsl(145, 60%, 65%)" }}>✅ Realtime</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

