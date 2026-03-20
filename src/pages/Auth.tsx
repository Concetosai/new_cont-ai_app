"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Mail, Lock, UserPlus, QrCode, ArrowRight, Copy, CheckCircle, Check, Calculator, Briefcase, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import contAiApi, { GOOGLE_CLIENT_ID } from "@/lib/api";

// Extend Window interface for Google OAuth
interface GoogleOAuth2TokenClient {
  requestAccessToken: () => void;
}

interface GoogleOAuth2InitTokenClientConfig {
  client_id: string;
  scope: string;
  redirect_uri?: string;
  callback: (response: { access_token?: string; error?: string }) => void;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GoogleOAuth2InitTokenClientConfig) => GoogleOAuth2TokenClient;
        };
      };
    };
  }
}

interface FormData {
  nombre: string;
  email: string;
  password: string;
  role: 'usuario' | 'contador';
  rfc?: string;
  contadorCode?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'register-type' | 'register-contador' | 'register-usuario' | 'success'>('login');
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    password: '',
    role: 'usuario'
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [contadorCode, setContadorCode] = useState('');
  const [linkedContadorCode, setLinkedContadorCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleOAuth = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: (response: any) => {
            if (response.access_token) {
              handleGoogleAuth(response.access_token);
            }
          },
        });
      }
    };

    // Wait for Google script to load
    if (window.google && window.google.accounts) {
      initializeGoogleOAuth();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          initializeGoogleOAuth();
          clearInterval(checkGoogle);
        }
      }, 100);
      setTimeout(() => clearInterval(checkGoogle), 5000);
    }
  }, []);

  // Handle Google OAuth authentication
  const handleGoogleAuth = useCallback(async (accessToken: string) => {
    setGoogleLoading(true);
    setError('');
    try {
      // Get user info from Google on frontend (no backend permission needed)
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userInfo = await userInfoResponse.json();
      
      // Send user info to backend for login
      const result = await contAiApi.googleLogin({ googleToken: accessToken, userInfo });
      if (result.success) {
        localStorage.setItem('userId', result.data.userId);
        localStorage.setItem('userRole', result.data.role);
        localStorage.setItem('googleToken', accessToken);
        
        toast.success(`¡Bienvenido de nuevo!`, {
          description: "Redirigiendo al dashboard...",
          duration: 3000,
        });
        
        navigate('/dashboard');
      } else if (result.error && result.error.includes('no encontrado')) {
        // User doesn't exist, prompt to register
        toast.info('No tienes una cuenta. Por favor, regístrate primero.', {
          description: 'Serás redirigido al registro...',
          duration: 3000,
        });
        setView('register-type');
      } else {
        setError(result.error || 'Error al iniciar sesión con Google');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    }
    setGoogleLoading(false);
  }, [navigate]);

  // Trigger Google OAuth login
  const handleGoogleLogin = useCallback(() => {
    if (window.google && window.google.accounts) {
      // Get current origin dynamically
      const currentOrigin = window.location.origin;
      
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        redirect_uri: currentOrigin,
        callback: (response: any) => {
          if (response.access_token) {
            handleGoogleAuth(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } else {
      toast.error('Error al cargar Google OAuth. Por favor, recarga la página.');
    }
  }, [handleGoogleAuth]);

  // Trigger Google OAuth for registration
  const handleGoogleRegister = useCallback((role: 'usuario' | 'contador') => {
    if (window.google && window.google.accounts) {
      // Get current origin dynamically
      const currentOrigin = window.location.origin;
      
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        redirect_uri: currentOrigin,
        callback: async (response: any) => {
          if (response.access_token) {
            await handleGoogleAuthWithRegistration(response.access_token, role);
          }
        },
      });
      client.requestAccessToken();
    } else {
      toast.error('Error al cargar Google OAuth. Por favor, recarga la página.');
    }
  }, []);

  // Handle Google OAuth registration
  const handleGoogleAuthWithRegistration = useCallback(async (accessToken: string, role: 'usuario' | 'contador') => {
    setGoogleLoading(true);
    setError('');
    try {
      // Get user info from Google on frontend (no backend permission needed)
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userInfo = await userInfoResponse.json();

      // Register with Google info - pass userInfo to backend
      const result = await contAiApi.googleRegister({
        googleToken: accessToken,
        role,
        nombre: userInfo.name,
        email: userInfo.email,
        userInfo
      });

      if (result.success) {
        if (role === 'contador') {
          setRegisteredUser(result.data.user);
          setContadorCode(result.data.user.contadorCode);
          setView('success');
          toast.success(`¡Bienvenido a CONT-AI, ${result.data.user.nombre}!`, {
            description: "Tu cuenta ha sido creada exitosamente. Comparte tu código QR con tus clientes.",
            duration: 8000,
          });
        } else {
          localStorage.setItem('userId', result.data.user.id);
          localStorage.setItem('userRole', 'usuario');
          localStorage.setItem('googleToken', accessToken);
          
          toast.success(`¡Bienvenido a CONT-AI, ${result.data.user.nombre}!`, {
            description: linkedContadorCode 
              ? "Tu cuenta ha sido creada y vinculada a tu contador."
              : "Tu cuenta ha sido creada exitosamente.",
            duration: 5000,
          });
          
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Error al registrar con Google');
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar con Google');
    }
    setGoogleLoading(false);
  }, [navigate, linkedContadorCode]);

  const handleRegisterContador = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await contAiApi.register({
        ...formData,
        role: 'contador'
      });
      if (result.success) {
        setRegisteredUser(result.data.user);
        setContadorCode(result.data.user.contadorCode);
        setView('success');
        // Mostrar mensaje de bienvenida
        toast.success(`¡Bienvenido a CONT-AI, ${result.data.user.nombre}!`, {
          description: "Te hemos enviado un correo de confirmación. Comparte tu código QR con tus clientes.",
          duration: 8000,
        });
      } else {
        setError(result.error || 'Error al registrar');
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    }
    setLoading(false);
  };

  const handleRegisterUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await contAiApi.register({
        ...formData,
        role: 'usuario',
        contadorCode: linkedContadorCode || undefined
      });
      if (result.success) {
        // Guardar token y redirigir al dashboard
        localStorage.setItem('userId', result.data.user.id);
        localStorage.setItem('userRole', 'usuario');
        
        // Mostrar mensaje de bienvenida antes de redirigir
        toast.success(`¡Bienvenido a CONT-AI, ${result.data.user.nombre}!`, {
          description: linkedContadorCode 
            ? "Te hemos enviado un correo de confirmación. Tu cuenta está vinculada a tu contador."
            : "Te hemos enviado un correo de confirmación. Ya puedes comenzar a usar la plataforma.",
          duration: 5000,
        });
        
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al registrar');
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await contAiApi.login(formData.email, formData.password);
      if (result.success) {
        localStorage.setItem('userId', result.data.userId);
        localStorage.setItem('userRole', result.data.role);
        
        // Mensaje de bienvenida
        toast.success(`¡Bienvenido de nuevo!`, {
          description: "Redirigiendo al dashboard...",
          duration: 3000,
        });
        
        navigate('/dashboard');
      } else {
        setError(result.error || 'Credenciales inválidas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(contadorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      role: 'usuario'
    });
    setContadorCode('');
    setLinkedContadorCode('');
    setError('');
    setView('login');
  };

  // Vista: Login
  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900/25 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full p-8 rounded-3xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              CONT-AI
            </h1>
            <p className="text-slate-400 text-sm">Tu asistente contable inteligente</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="tu@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                "Acceder al Dashboard"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/80 text-slate-500">o</span>
            </div>
          </div>

          {/* Google Login Button */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continuar con Google
          </motion.button>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">¿No tienes cuenta?</p>
            <button 
              onClick={() => setView('register-type')}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm mt-1 flex items-center justify-center gap-1 mx-auto"
            >
              <UserPlus className="w-4 h-4" />
              Crear una cuenta
            </button>
          </div>
        </motion.div>

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse delay-[2s]" />
        </div>
      </div>
    );
  }

  // Vista: Selección de tipo de registro
  if (view === 'register-type') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900/25 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-lg w-full p-8 rounded-3xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Regístrate en CONT-AI
            </h1>
            <p className="text-slate-400 text-sm">Selecciona cómo te registrarás</p>
          </div>

          <div className="space-y-4">
            <motion.button
              onClick={() => setView('register-contador')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Soy Contador</h3>
                  <p className="text-slate-400 text-sm">
                    Registra tu bufete contable y genera códigos QR para tus clientes
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            <motion.button
              onClick={() => setView('register-usuario')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-6 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Soy Usuario</h3>
                  <p className="text-slate-400 text-sm">
                    Registra tu negocio y vincúlalo con tu contador escaneando su QR
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>

          {/* Google Registration */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/80 text-slate-500">o regístrate con</span>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => handleGoogleRegister('usuario')}
            disabled={googleLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Registrarse con Google
          </motion.button>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setView('login')}
              className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Volver al login
            </button>
          </div>
        </motion.div>

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse delay-[2s]" />
        </div>
      </div>
    );
  }

  // Vista: Registro Contador
  if (view === 'register-contador') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900/25 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full p-8 rounded-3xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Registro de Contador
            </h1>
            <p className="text-slate-400 text-sm">Crea tu cuenta profesional</p>
          </div>

          <form onSubmit={handleRegisterContador} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="C.P. Juan Pérez García"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="contador@bufete.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">RFC (Opcional)</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="XAXX010101XXX"
                  value={formData.rfc || ''}
                  onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})}
                />
              </div>
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </div>
              ) : (
                "Registrarme como Contador"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setView('register-type')}
              className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Cambiar tipo de cuenta
            </button>
          </div>
        </motion.div>

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse delay-[2s]" />
        </div>
      </div>
    );
  }

  // Vista: Registro Usuario
  if (view === 'register-usuario') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900/25 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full p-8 rounded-3xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Registro de Usuario
            </h1>
            <p className="text-slate-400 text-sm">Crea tu cuenta empresarial</p>
          </div>

          <form onSubmit={handleRegisterUsuario} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Nombre Completo / Empresa</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="Mi Empresa S.A. de C.V."
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="contacto@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">RFC (Opcional)</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="EMA940125JHA"
                  value={formData.rfc || ''}
                  onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Código de Contador
                <span className="text-xs text-slate-500">(Opcional - escaneado del QR)</span>
              </label>
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-200 placeholder-slate-500"
                  placeholder="Pega el código que te dio tu contador"
                  value={linkedContadorCode}
                  onChange={(e) => setLinkedContadorCode(e.target.value.toUpperCase())}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                💡 Pega el código que obtuviste al escanear el QR de tu contador para vincularte automáticamente
              </p>
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </div>
              ) : linkedContadorCode ? (
                "Registrarme y Vincular"
              ) : (
                "Registrarme"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setView('register-type')}
              className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Cambiar tipo de cuenta
            </button>
          </div>
        </motion.div>

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse delay-[2s]" />
        </div>
      </div>
    );
  }

  // Vista: Éxito (QR para contador)
  if (view === 'success' && contadorCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900/25 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8 rounded-3xl text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Registro Exitoso!
          </h2>
          <p className="text-slate-400 mb-6">
            Tu cuenta de contador ha sido creada. Comparte este código con tus clientes.
          </p>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-2xl inline-block mb-6">
            <QRCodeSVG
              value={contadorCode}
              size={200}
              level={"H"}
              includeMargin={true}
            />
          </div>

          {/* Código textual */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-2">Código único:</p>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mono font-bold text-2xl px-6 py-4 rounded-xl shadow-2xl tracking-wider">
              {contadorCode}
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Tus clientes pueden escanear este QR o usar el código de arriba para vincularse contigo.
          </p>

          <div className="flex gap-3">
            <motion.button 
              onClick={copyCode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 inline mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 inline mr-2" />
                  Copiar Código
                </>
              )}
            </motion.button>
            <motion.button 
              onClick={resetForm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-slate-800/50 border border-slate-700 text-slate-300 py-3 px-6 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
            >
              Ir al Login
            </motion.button>
          </div>
        </motion.div>

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-green-400/5 to-emerald-400/5 rounded-full blur-3xl animate-pulse delay-[2s]" />
        </div>
      </div>
    );
  }

  return null;
}
