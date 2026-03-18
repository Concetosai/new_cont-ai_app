// CONT-AI Google Apps Script Backend API
const API_BASE = 'https://script.google.com/macros/s/AKfycbxSSNQBeG34yXwmgZNqh-qKx-lYrX9kzUQjefwXnNgqZFHPq4rm01ChhelWg8hWYJK_/exec';

// Google OAuth Client ID (configurable - replace with your own)
// To get your Client ID: https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '74609739082-h5keo1b8jmvo6sv5b3og70cu8ktd80jv.apps.googleusercontent.com';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const contAiApi = {
  // Get Google Client ID
  getGoogleClientId: (): string => GOOGLE_CLIENT_ID,

  // Dashboard KPIs
  getDashboard: async (userId: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'dashboard', userId });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  // Gastos Scanner
  scanTicket: async (userId: string, fileData: string): Promise<ApiResponse<any>> => {
    const url = API_BASE;
    const body = JSON.stringify({
      api: 'gastos_scan',
      userId,
      fileData
    });
    const res = await fetch(url, {
      method: 'POST',
      body: body,
      redirect: 'follow'
    });
    return res.json();
  },

  saveGasto: async (userId: string, gasto: any): Promise<ApiResponse<any>> => {
    const url = API_BASE;
    const body = JSON.stringify({
      api: 'gastos_save',
      userId,
      data: JSON.stringify(gasto)
    });
    const res = await fetch(url, {
      method: 'POST',
      body: body,
      redirect: 'follow'
    });
    return res.json();
  },

  // Vincular usuario a contador
  vincularContador: async (userId: string, contadorCode: string): Promise<ApiResponse<any>> => {
    const url = `${API_BASE}?api=vincular_contador`;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ userId, contadorCode }),
      redirect: 'follow'
    });
    return res.json();
  },

  // Impuestos SAT
  getImpuestos: async (userId: string, mes: string = ''): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'impuestos', userId, mes });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  pagarImpuesto: async (userId: string, impuestoId: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'impuestos_pagar', userId, impuestoId });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  // Alertas
  getAlertas: async (userId: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'alertas', userId });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  // Simulador
  simulador: async (scenario: {ingresos: number, gastos: number, deducciones: number}): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ 
      api: 'simulador',
      data: JSON.stringify(scenario)
    });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  // Integraciones (placeholder)
  connectPlataforma: async (userId: string, plataforma: string, token: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ 
      api: 'integracion_connect',
      userId,
      plataforma,
      token 
    });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  // Facturas CFDI
  getFacturas: async (userId: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'get_facturas', userId });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  saveFactura: async (factura: {
    userId: string;
    clienteId: string;
    monto: number;
    status?: string;
    rfcReceptor?: string;
    nombreReceptor?: string;
    usoCFDI?: string;
    regimenFiscal?: string;
    descripcion?: string;
  }): Promise<ApiResponse<any>> => {
    const url = API_BASE;
    const body = JSON.stringify({
      api: 'facturas_save',
      ...factura
    });
    const res = await fetch(url, {
      method: 'POST',
      body: body,
      redirect: 'follow'
    });
    return res.json();
  },

  // Chat Contador
  getChat: async (userId: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'chat', userId });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  sendMessage: async (userId: string, message: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'chat_send', userId, message });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  // User settings
  getUserSettings: async (userId: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'user_settings', userId });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  },

  // Register
  registerUser: async (userData: any): Promise<ApiResponse<any>> => {
    // Enviar como POST con redirect falso para Google Apps Script
    const url = `${API_BASE}?api=register`;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(userData),
      redirect: 'follow'
    });
    return res.json();
  },

  // Auth (simple)
  login: async (email: string, password: string): Promise<ApiResponse<{userId: string, role: string}>> => {
    const url = `${API_BASE}?api=login`;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    // Transformar la respuesta del backend para compatibilidad
    if (result.success && result.data && result.data.user) {
      return {
        success: true,
        data: {
          userId: result.data.user.id,
          role: result.data.user.role
        }
      };
    }
    return result;
  },

  // Google OAuth Login - receives user info from frontend (verified there)
  googleLogin: async (googleToken: string, userInfo?: { email: string; name?: string }): Promise<ApiResponse<{userId: string, role: string}>> => {
    const url = `${API_BASE}?api=google_login`;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ googleToken, userInfo }),
      redirect: 'follow'
    });
    const result = await res.json();
    // Transformar la respuesta del backend para compatibilidad
    if (result.success && result.data && result.data.user) {
      return {
        success: true,
        data: {
          userId: result.data.user.id,
          role: result.data.user.role
        }
      };
    }
    return result;
  },

  // Google OAuth Register - receives user info from frontend (verified there)
  googleRegister: async (googleToken: string, role: 'usuario' | 'contador', additionalData?: { nombre?: string; rfc?: string; contadorCode?: string; email?: string }, userInfo?: { email: string; name?: string }): Promise<ApiResponse<any>> => {
    const url = `${API_BASE}?api=google_register`;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ googleToken, role, ...additionalData, userInfo }),
      redirect: 'follow'
    });
    return res.json();
  },

  // Obtener gastos del usuario
  getGastos: async (userId: string, limit: number = 20): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ api: 'get_gastos', userId, limit: limit.toString() });
    const url = `${API_BASE}?${params}`;
    const res = await fetch(url);
    return res.json();
  }
};

export default contAiApi;
