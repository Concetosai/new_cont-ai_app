// CONT-AI Google Apps Script Backend API
const API_BASE = 'https://script.google.com/macros/s/AKfycbwAk-gsapFTRsdh6KWNaT1RFTWAn0QOo8Pzm8t-PSoGXedNrYT9F4ATvtsyCVVd3tYJ/exec';

// Google OAuth Client ID
export const GOOGLE_CLIENT_ID = '74609739082-h5keo1b8jmvo6sv5b3og70cu8ktd80jv.apps.googleusercontent.com';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper para peticiones al backend (GAS)
// Importante: No añadir headers custom para evitar preflight OPTIONS (CORS)
const apiRequest = async (api: string, data: any = {}, method: 'GET' | 'POST' = 'GET'): Promise<ApiResponse<any>> => {
  try {
    let url = API_BASE;
    let options: RequestInit = {
      redirect: 'follow', // Requerido para GAS
    };

    if (method === 'GET') {
      const params = new URLSearchParams({ api, ...data });
      url = `${API_BASE}?${params}`;
    } else {
      // Enviamos el body como string sin Content-Type custom para evitar preflight OPTIONS
      options = {
        ...options,
        method: 'POST',
        body: JSON.stringify({ api, ...data }),
      };
    }

    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const result = await res.json();
    return result;
  } catch (error: any) {
    console.error(`API Error (${api}):`, error);
    return { success: false, error: error.message };
  }
};

export const contAiApi = {
  getGoogleClientId: (): string => GOOGLE_CLIENT_ID,

  // Dashboard
  getDashboard: (userId: string) => apiRequest('dashboard', { userId }),

  // Gastos
  scanTicket: (userId: string, fileData: string) => 
    apiRequest('gastos_scan', { userId, fileData }, 'POST'),

  saveGasto: (userId: string, gasto: any) => 
    apiRequest('gastos_save', { userId, data: JSON.stringify(gasto) }, 'POST'),

  getGastos: (userId: string, limit: number = 20) => 
    apiRequest('get_gastos', { userId, limit }),

  // Vínculos
  vincularContador: (userId: string, contadorCode: string) => 
    apiRequest('vincular_contador', { userId, contadorCode }, 'POST'),

  getLinkedClients: (contadorId: string) => 
    apiRequest('get_linked_clients', { contadorId }),

  // Impuestos
  getImpuestos: (userId: string, mes: string = '') => 
    apiRequest('impuestos', { userId, mes }),

  pagarImpuesto: (userId: string, impuestoId: string) => 
    apiRequest('impuestos_pagar', { userId, impuestoId }, 'POST'),

  // Alertas
  getAlertas: (userId: string) => apiRequest('alertas', { userId }),

  // Simulador
  simulador: (scenario: any) => 
    apiRequest('simulador', { data: JSON.stringify(scenario) }, 'POST'),

  // Auth
  login: async (email: string, password: string) => {
    const result = await apiRequest('login', { email, password }, 'POST');
    // Mapeo para compatibilidad con código existente
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

  register: (data: any) => apiRequest('register', data, 'POST'),

  googleLogin: async (data: any) => {
    const result = await apiRequest('google_login', data, 'POST');
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

  googleRegister: (data: any) => apiRequest('google_register', data, 'POST'),

  // Perfil
  getUserSettings: (userId: string) => apiRequest('user_settings', { userId }),

  getContadorCode: (userId: string) => apiRequest('get_contador_code', { userId }),

  regenerateContadorCode: (userId: string) => apiRequest('regenerate_contador_code', { userId }),

  changePassword: (userId: string, currentPass: string, newPass: string) => 
    apiRequest('change_password', { userId, currentPassword: currentPass, newPassword: newPass }, 'POST'),

  // Chat
  getConversacion: (userId: string, otherId?: string) => 
    apiRequest('chat', { userId, otherId }),

  sendMessage: (userId: string, message: string, contadorId: string, remitente: string) => 
    apiRequest('chat_send', { userId, mensaje: message, contadorId, remitente }, 'POST'),

  getUsuario: (userId: string) => apiRequest('user_settings', { userId }),

  getClient: (clientId: string) => apiRequest('get_client', { clientId }),

  getClientGastos: (clientId: string, limit: number = 50) => 
    apiRequest('get_client_gastos', { clientId, limit }),

  // Facturas
  getFacturas: (userId: string) => apiRequest('get_facturas', { userId }),

  saveFactura: (data: any) => apiRequest('facturas_save', data, 'POST'),

  downloadFactura: (facturaId: string) => apiRequest('download_factura', { facturaId }),

  // Integraciones
  connectPlataforma: (userId: string, plataforma: string, token: string) => 
    apiRequest('integracion_connect', { userId, plataforma, token }, 'POST'),

  saveContadorNotes: (contadorId: string, clientId: string, notes: string) => 
    apiRequest('save_contador_notes', { contadorId, clientId, notes }, 'POST'),

  getContadorNotes: (contadorId: string, clientId: string) => 
    apiRequest('get_contador_notes', { contadorId, clientId }),

  // Bóveda
  getBovedaFiles: (userId: string) => apiRequest('boveda_list', { userId }),

  uploadBovedaFile: (userId: string, fileData: string, fileName: string, fileType: string) => 
    apiRequest('boveda_upload', { userId, fileData, fileName, fileType }, 'POST'),

  deleteBovedaFile: (userId: string, fileId: string) => 
    apiRequest('boveda_delete', { userId, fileId }, 'POST'),
};

export default contAiApi;
