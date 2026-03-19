import { motion } from "framer-motion";
import { Settings, Shield, Mail, User, Zap, QrCode, Copy, ArrowRight, Download, Sun, Moon, Lock, KeyRound, Check, Eye, EyeOff, Users, CheckCircle } from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import contAiApi from "@/lib/api";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

export default function UserSettings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contadorInfo, setContadorInfo] = useState<any>(null);
  const [contadorCode, setContadorCode] = useState<string>('');
  const [linkedClients, setLinkedClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkedSuccess, setLinkedSuccess] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (userId) {
      loadSettings(userId);
      if (role === 'contador') {
        loadContadorCode(userId);
        loadLinkedClients(userId);
      }
    }
  }, []);

  const loadLinkedClients = async (contadorId: string) => {
    setLoadingClients(true);
    try {
      const result = await contAiApi.getLinkedClients(contadorId);
      if (result.success && result.data) {
        setLinkedClients(result.data);
      }
    } catch (error) {
      console.error('Error loading linked clients:', error);
    }
    setLoadingClients(false);
  };

  const loadContadorCode = async (userId: string) => {
    try {
      const result = await contAiApi.getContadorCode(userId);
      if (result.success && result.data?.code) {
        setContadorCode(result.data.code);
      } else {
        // Si no hay código, generar uno automáticamente
        const generatedCode = generateContadorCode();
        setContadorCode(generatedCode);
        // Aquí se podría guardar en el backend si existe el endpoint
      }
    } catch (error) {
      console.error('Error loading contador code:', error);
      // Generar código por defecto si falla la API
      const generatedCode = generateContadorCode();
      setContadorCode(generatedCode);
    }
  };

  const generateContadorCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CONT-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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
    const codeToCopy = contadorCode || contadorInfo?.code || '';
    navigator.clipboard.writeText(codeToCopy);
    toast.success('Código copiado al portapapeles');
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `codigo-qr-contai-${contadorCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

const handleVincularContador = async () => {
  const code = codeInputRef.current?.value?.toUpperCase().trim();
  if (!code || code.length < 6) {
    toast.error('Ingresa un código válido (mín 6 caracteres)');
    return;
  }

  setLinking(true);
  setLinkedSuccess(false);
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('Usuario no identificado');

    const result = await contAiApi.vincularContador(userId, code);
    if (result.success) {
      toast.success('¡Contador vinculado correctamente!');
      setLinkedSuccess(true);
      codeInputRef.current!.value = '';
      setTimeout(() => loadSettings(userId), 1500); // Refresh settings
    } else {
      toast.error(result.error || 'Error al vincular');
    }
  } catch (error: any) {
    toast.error(error.message || 'Error de conexión');
  } finally {
    setLinking(false);
  }
};

const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Usuario no identificado');
        return;
      }

      const result = await contAiApi.changePassword(userId, currentPassword, newPassword);
      
      if (result.success) {
        toast.success('Contraseña actualizada correctamente');
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.error || 'Error al cambiar la contraseña');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
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
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
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
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
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

      {/* Password Change Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "hsl(195, 100%, 65%)" }}>
            <Lock className="w-5 h-5" />
            Seguridad
          </h2>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              Cambiar contraseña
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs mb-1 block" style={{ color: "hsl(210, 15%, 55%)" }}>
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-slate-800/50 border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs mb-1 block" style={{ color: "hsl(210, 15%, 55%)" }}>
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-slate-800/50 border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs mb-1 block" style={{ color: "hsl(210, 15%, 55%)" }}>
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-slate-800/50 border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Guardar nueva contraseña
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-slate-700/50 hover:bg-slate-600/50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Contador QR Code Section - Only for contadores */}
      {user?.role === 'contador' && (
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

          {contadorCode ? (
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
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm" style={{ color: "hsl(210, 15%, 50%)" }}>Generando tu código único...</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Nuevos Clientes Vinculados - Solo para contadores */}
      {user?.role === 'contador' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: "hsl(195, 100%, 65%)" }}>
            <Users className="w-5 h-5" />
            Clientes Vinculados
          </h2>
          <p className="text-sm mb-6" style={{ color: "hsl(210, 15%, 50%)" }}>
            Clientes que se han vinculado con tu código de contador (Mock data - requiere backend)
          </p>
          
          <div className="space-y-3">
            {loadingClients ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">Cargando clientes...</p>
              </div>
            ) : linkedClients.length > 0 ? (
              linkedClients.map((cliente) => (
                <div 
                  key={cliente.id} 
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-blue-500/30 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer group"
                  onClick={() => navigate(`/client/${cliente.id}/dashboard`)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-xs transition-transform group-hover:scale-110"
                      style={{ background: "hsl(195 100% 50% / 0.15)", color: "hsl(195, 100%, 60%)" }}>
                      {cliente.nombre.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "hsl(210, 20%, 85%)" }}>{cliente.nombre}</p>
                      <p className="text-xs font-mono" style={{ color: "hsl(210, 15%, 55%)" }}>RFC: {cliente.rfc || 'Sin RFC'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      cliente.status === 'activo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {cliente.status}
                    </span>
                    <span style={{ color: "hsl(210, 15%, 45%)" }}>{cliente.linkedAt}</span>
                  </div>
                  <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => navigate(`/client/${cliente.id}/dashboard`)}
                      className="p-2 rounded-lg hover:bg-blue-500/20 transition-all text-blue-400 hover:text-blue-200"
                      title="Ver Dashboard"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(cliente.id);
                        toast.success('ID de cliente copiado');
                      }}
                      className="p-2 rounded-lg hover:bg-slate-700/50 transition-all text-slate-400 hover:text-slate-200"
                      title="Copiar ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-2xl">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-bold mb-2 text-slate-300">No hay clientes vinculados</h3>
                <p className="text-sm text-slate-500 mb-6 px-4">
                  Comparte tu código QR arriba para que tus clientes se vinculen contigo. Recibirás una notificación cuando alguien se conecte.
                </p>
              </div>
            )}
          </div>

          {false && ( // Empty state if no clients
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(210, 20%, 70%)" }}>No hay clientes vinculados</h3>
              <p className="text-sm mb-6" style={{ color: "hsl(210, 15%, 45%)" }}>
                Comparte tu código QR para que tus clientes se vinculen contigo
              </p>
            </div>
          )}
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
            <div className="relative">
              <input
                id="contador-code"
                type="text"
                placeholder="Código del contador (ej: ABC123XY)"
                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 mb-3 text-center uppercase tracking-wider font-mono pr-28"
                maxLength={8}
                ref={codeInputRef}
              />
              <button
                onClick={handleVincularContador}
                disabled={linking}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
              >
                {linking ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Vincular
                  </>
                )}
              </button>
            </div>
            {linkedSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/50 text-emerald-400 font-bold text-sm shadow-lg shadow-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <span className="tracking-wide">🟢 LÍNEA VERDE ACTIVA - CONTADOR CONECTADO</span>
                </div>
                <p className="text-xs mt-2 text-emerald-500/70 text-center">
                  Tu contador tiene acceso de solo lectura a tu información
                </p>
              </motion.div>
            )}
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

