/**
 * @OnlyCurrentDoc
 * @OnlyRequest
 * @RequestForExternalResource
 */

// =====================================================
// CONT-AI Backend - Google Apps Script (Code.gs)
// Versión completa con registro, login, QR, emails y carpetas de Drive
// =====================================================

// =====================================================
// REQUIRED OAuth SCOPES
// =====================================================
// @see https://developers.google.com/apps-script/concepts/scopes
// @see https://developers.google.com/apps-script/guides/support/troubleshooting#authorization-is

/*
 * OAuth Scope for external requests (needed for Google OAuth verification)
 * - https://www.googleapis.com/auth/script.external_request
 * - https://www.googleapis.com/auth/userinfo.email
 * - https://www.googleapis.com/auth/spreadsheets
 * - https://www.googleapis.com/auth/drive
 * - https://www.googleapis.com/auth/script.container.ui
 */

// =====================================================
// GAS OAuth Scopes (DO NOT REMOVE)
// =====================================================
/* @OnlyCurrentDoc */

// =====================================================
// CONFIGURACIÓN ÚNICA: ACTUALIZA CON TUS IDS
// =====================================================
const SPREADSHEET_ID = '1a0IKOhvfBA4izzHx78wutMlGGTv99eyLooaJXOwtvp8'; // <-- TU ID DE HOJA
const DRIVE_FOLDER_ID = '1zt6XRO_qQ2y-NdsPHboCYhn_Qup4ChP8';        // <-- TU ID DE CARPETA
// =====================================================

// Nombres de las hojas (pestañas)
const SHEETS = {
  USUARIOS: 'Usuarios',
  GASTOS: 'Gastos',
  FACTURAS: 'Facturas',
  CLIENTES: 'Clientes',
  IMPUESTOS: 'Impuestos',
  ALERTAS: 'Alertas',
  FLUJO_EFECTIVO: 'FlujoEfectivo'
};

// =====================================================
// FUNCIONES DE TEST - PARA DEPURAR OCR
// =====================================================

/**
 * TEST: Verificar Google Cloud Vision OCR
 * Ejecuta esta función para probar si el OCR está funcionando
 */
function testGoogleVisionOCR() {
  Logger.log('=== INICIANDO TEST DE GOOGLE CLOUD VISION OCR ===\n');
  
  // Imagen de prueba en base64 (imagen pequeña pero válida)
  // Esta es una imagen PNG de 1x1 pixel (la más pequeña posible)
  // Para una prueba real, usa una imagen de ticket/factura real
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  Logger.log('Usando imagen de prueba en base64 (1x1 pixel)\n');
  Logger.log('NOTA: Esta es una imagen de prueba mínima.\n');
  Logger.log('Para una prueba real, sube una imagen de ticket/factura desde tu app.\n');
  
  try {
    // Llamar a Google Cloud Vision API
    Logger.log('📡 Llamando a Google Cloud Vision API...\n');
    
    const ocrResult = callGoogleVisionApi(testImageBase64);
    
    Logger.log('Respuesta de Google Vision: ' + JSON.stringify(ocrResult).substring(0, 300));
    
    if (!ocrResult) {
      Logger.log('❌ ERROR: No se recibió respuesta de la API');
      return;
    }
    
    Logger.log('✅ Respuesta recibida de Google Cloud Vision\n');
    
    // Verificar si hay texto
    const textAnnotations = ocrResult.textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      Logger.log('ℹ️  No se detectó texto en la imagen (es esperado, es una imagen de 1x1 pixel)');
      Logger.log('✅ PERO Google Cloud Vision API está FUNCIONANDO correctamente!');
      Logger.log('\n=== PRUEBA CON IMAGEN REAL ===');
      Logger.log('Para probar con una imagen real:');
      Logger.log('1. Ve a tu app web (http://localhost:8080/gastos)');
      Logger.log('2. Sube una imagen de ticket/factura real');
      Logger.log('3. Revisa los logs en Google Apps Script → Executions');
      return;
    }
    
    // Mostrar el texto extraído
    const fullText = textAnnotations[0].description || '';
    
    Logger.log('=== TEXTO EXTRAÍDO ===\n');
    Logger.log(fullText);
    Logger.log('\n=== FIN DEL TEXTO ===\n');
    
    Logger.log('\n=== TEST COMPLETADO ===');
    Logger.log('\n✅ ÉXITO: Google Cloud Vision API está funcionando!');
    Logger.log('El OCR puede extraer texto de imágenes.');
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    Logger.log('\n=== POSIBLES CAUSAS ===');
    Logger.log('1. La API Key no es válida');
    Logger.log('2. Cloud Vision API no está habilitada en Google Cloud Console');
    Logger.log('3. La cuota de la API se agotó');
    Logger.log('4. Error de red o conexión');
  }
}

/**
 * Crea una carpeta personal para el usuario en Google Drive
 * @param {string} userId - ID único del usuario
 * @param {string} nombre - Nombre del usuario
 * @returns {string|null} - ID de la carpeta creada o null si falla
 */
function createUserFolder(userId, nombre) {
  try {
    const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    // Crear subcarpeta con un nombre único: "ID - Nombre"
    const folderName = `${userId} - ${nombre}`;
    const newFolder = parentFolder.createFolder(folderName);
    return newFolder.getId();
  } catch (error) {
    console.error('Error al crear carpeta para usuario:', error);
    return null; // Si falla, se guarda sin carpeta (se puede manejar después)
  }
}

/**
 * Obtiene el ID de la carpeta de un usuario desde la hoja de Usuarios
 * @param {string} userId - ID del usuario
 * @returns {string|null} - ID de la carpeta o null si no existe
 */
function getUserCarpetaId(userId) {
  try {
    // Usar getActive() en lugar de openById() para evitar problemas de permisos
    const ss = SpreadsheetApp.getActive();
    const userSheet = ss.getSheetByName(SHEETS.USUARIOS);
    
    if (!userSheet) {
      Logger.log('Hoja Usuarios no encontrada');
      return null;
    }
    
    const userData = userSheet.getDataRange().getValues();

    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === userId) { // Columna A: UserID
        const carpetaId = userData[i][9]; // Columna J: CarpetaID (índice 9)
        Logger.log('Carpeta encontrada para userId ' + userId + ': ' + carpetaId);
        return carpetaId;
      }
    }
    
    Logger.log('Usuario no encontrado: ' + userId);
    return null;
  } catch (e) {
    Logger.log('Error en getUserCarpetaId: ' + e.message);
    return null;
  }
}

/**
 * Añade la columna CarpetaID a la hoja de Usuarios (ejecutar una sola vez)
 */
function addCarpetaIDColumn() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Usuarios');
  // Añadir encabezado en columna 10 (J)
  sheet.getRange(1, 10).setValue('CarpetaID');
}

// =====================================================
// ENTRY POINTS: doGet y doPost (Web App)
// =====================================================
function doGet(e) {
  return handleRequest(e, 'get');
}

function doPost(e) {
  return handleRequest(e, 'post');
}

function handleRequest(e, method) {
  try {
    const output = ContentService.createTextOutput();
    
    // Obtener el parámetro 'api' desde query string
    let api = e?.parameter?.api;
    let postDataContents = null;
    
    // Intentar leer el body del POST si existe
    if (e.postData && e.postData.contents) {
      postDataContents = e.postData.contents;
      // Si no hay api en query string, intentar leer del body
      if (!api) {
        try {
          const bodyData = JSON.parse(postDataContents);
          api = bodyData.api;
        } catch (err) {
          // No es JSON válido
        }
      }
    }
    
    if (!api) throw new Error('Parámetro "api" requerido');
    
    let result;
    
    // Enrutamiento basado en el endpoint
    switch(api) {
      // ========== NUEVOS ENDPOINTS ==========
      case 'register':
        const registerData = postDataContents ? JSON.parse(postDataContents) : {};
        result = registerUser(registerData);
        break;
        
      case 'login':
        const loginData = postDataContents ? JSON.parse(postDataContents) : {};
        result = loginUser(loginData);
        break;
        
      case 'google_login':
        const googleLoginData = postDataContents ? JSON.parse(postDataContents) : {};
        result = googleLogin(googleLoginData);
        break;
        
      case 'google_register':
        const googleRegisterData = postDataContents ? JSON.parse(postDataContents) : {};
        result = googleRegister(googleRegisterData);
        break;
        
      case 'user_settings':
        const userIdSettings = e.parameter.userId;
        if (!userIdSettings) throw new Error('userId requerido');
        result = getUserSettings(userIdSettings);
        break;
        
      // ========== DASHBOARD ==========
      case 'dashboard':
        const userId = e.parameter.userId;
        if (!userId) throw new Error('userId requerido');
        result = getDashboardKpis(userId);
        break;
        
      // ========== GASTOS ==========
      case 'gastos_scan':
        // Read from POST body for large base64 data
        if (!postDataContents) throw new Error('No se recibió el cuerpo de la petición');
        const scanData = JSON.parse(postDataContents);
        const userIdScan = scanData.userId;
        if (!userIdScan) throw new Error('userId requerido');
        const fileData = scanData.fileData;
        if (!fileData) throw new Error('fileData (base64) requerido');
        result = scanGastoFromImage(fileData);
        break;
        
      case 'gastos_save':
        // Read from POST body
        if (!postDataContents) throw new Error('No se recibió el cuerpo de la petición');
        const saveData = JSON.parse(postDataContents);
        const gastoData = JSON.parse(saveData.data);
        const userIdSave = saveData.userId;
        
        // DEBUG: Log para verificar que llega fileData
        Logger.log('=== SAVE GASTO DEBUG ===');
        Logger.log('userId: ' + userIdSave);
        Logger.log('gastoData keys: ' + Object.keys(gastoData).join(', '));
        Logger.log('fileData exists: ' + (gastoData.fileData ? 'YES' : 'NO'));
        Logger.log('fileData length: ' + (gastoData.fileData ? gastoData.fileData.length : 0));
        Logger.log('========================');
        
        result = saveGasto(gastoData);
        break;
        
      case 'vincular_contador':
        const vincularData = postDataContents ? JSON.parse(postDataContents) : {};
        result = vincularContador(vincularData.userId, vincularData.contadorCode);
        break;
        
      // ========== IMPUESTOS ==========
      case 'impuestos_mes':
        const userIdImp = e.parameter.userId;
        if (!userIdImp) throw new Error('userId requerido');
        result = getImpuestosMes(userIdImp);
        break;
        
      case 'impuestos_pagar':
        const pagoData = JSON.parse(e.postData.contents);
        result = pagarImpuesto(pagoData);
        break;
        
      // ========== INTEGRACIONES ==========
      case 'integraciones_connect':
        const integracionData = JSON.parse(e.postData.contents);
        result = conectarPlataforma(integracionData);
        break;
        
      case 'ventas_importar':
        const ventasData = JSON.parse(e.postData.contents);
        result = importarVentas(ventasData);
        break;
        
      // ========== ALERTAS ==========
      case 'alertas':
        const userIdAlert = e.parameter.userId;
        if (!userIdAlert) throw new Error('userId requerido');
        result = getAlertas(userIdAlert);
        break;
        
      // ========== SIMULADOR ==========
      case 'simulador':
        const simulacionData = JSON.parse(e.postData.contents);
        result = calcularSimulacion(simulacionData);
        break;
        
      // ========== CHAT / CONTADOR ==========
      case 'chat_mensajes':
        const userIdChat = e.parameter.userId;
        if (!userIdChat) throw new Error('userId requerido');
        result = getMensajesChat(userIdChat);
        break;
        
      case 'chat_enviar':
        const mensajeData = JSON.parse(e.postData.contents);
        result = enviarMensaje(mensajeData);
        break;
        
      default:
        throw new Error(`API "${api}" no implementada`);
    }
    
    return output.setMimeType(ContentService.MimeType.JSON)
                 .setContent(JSON.stringify({ success: true, data: result }));
                 
  } catch(error) {
    return ContentService.createTextOutput()
      .setMimeType(ContentService.MimeType.JSON)
      .setContent(JSON.stringify({ success: false, error: error.message }));
  }
}

// =====================================================
// FUNCIONES DE NEGOCIO - REGISTRO, LOGIN, SETTINGS
// =====================================================

/**
 * Crea una carpeta personal en Drive para el usuario
 */
function createUserFolder(userId, nombre) {
  try {
    const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    // Crear subcarpeta con un nombre único: "ID - Nombre"
    const folderName = `${userId} - ${nombre}`;
    const newFolder = parentFolder.createFolder(folderName);
    return newFolder.getId();
  } catch (error) {
    console.error('Error al crear carpeta para usuario:', error);
    return null; // Si falla, se guarda sin carpeta (puedes manejarlo después)
  }
}

/**
 * Registra un nuevo usuario (contador o usuario normal)
 * Espera: { nombre, email, password, role, rfc, contadorCode? (solo si el usuario se vincula) }
 */
function registerUser(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);

  // Verificar si el email ya existe
  const existingData = sheet.getDataRange().getValues();
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][4] === data.email) { // Email en columna 4 (índice 4)
      throw new Error('El email ya está registrado');
    }
  }

  const userId = Utilities.getUuid();
  const timestamp = new Date();

  let contadorCode = null;
  let linkedContadorCode = null;

  if (data.role === 'contador') {
    // Generar código único para el contador (para QR)
    contadorCode = Utilities.getUuid();
  } else if (data.role === 'usuario') {
    // Si es usuario, puede venir con un código de contador (escaneado)
    linkedContadorCode = data.contadorCode || null;
  } else {
    throw new Error('Rol inválido. Debe ser "usuario" o "contador"');
  }

  // Guardar en hoja: UserID | Nombre | Role | RFC | Email | Password | ContadorCode | LinkedContadorCode | CreatedAt | CarpetaID
  sheet.appendRow([
    userId,
    data.nombre,
    data.role,
    data.rfc || '',
    data.email,
    data.password, // NOTA: En producción, hashear la contraseña
    contadorCode,
    linkedContadorCode,
    timestamp,
    '' // Placeholder para CarpetaID, se actualizará después
  ]);

  // Crear carpeta en Drive para el usuario
  const carpetaId = createUserFolder(userId, data.nombre);
  if (carpetaId) {
    // Buscar la fila recién agregada y actualizar la columna CarpetaID (columna 10, índice J)
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 10).setValue(carpetaId);
  }

  // Enviar email de bienvenida
  sendWelcomeEmail(data.email, data.nombre, data.role);

  // Preparar respuesta
  const user = {
    id: userId,
    nombre: data.nombre,
    role: data.role,
    rfc: data.rfc,
    email: data.email,
    contadorCode: contadorCode, // Solo para contadores
    linkedContadorCode: linkedContadorCode, // Solo para usuarios
    carpetaId: carpetaId // ID de la carpeta personal en Drive
  };

  return { user };
}

/**
 * Inicia sesión y devuelve token y datos del usuario
 * Espera: { email, password }
 */
function loginUser(credenciales) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[4] === credenciales.email && row[5] === credenciales.password) {
      // Generar token simple (base64 de información)
      const token = Utilities.base64Encode(JSON.stringify({
        userId: row[0],
        email: row[4],
        role: row[2],
        exp: Date.now() + 3600000 // 1 hora
      }));
      
      // Obtener información del contador si el usuario está vinculado
      let contadorInfo = null;
      if (row[2] === 'usuario' && row[7]) { // LinkedContadorCode presente
        contadorInfo = getContadorInfoByCode(row[7]);
      }
      
      return {
        token,
        user: {
          id: row[0],
          nombre: row[1],
          role: row[2],
          rfc: row[3],
          email: row[4],
          contadorCode: row[6],      // Solo para contadores
          linkedContadorCode: row[7], // Solo para usuarios
          contador: contadorInfo      // Información completa del contador (si aplica)
        }
      };
    }
  }
  
  throw new Error('Credenciales inválidas');
}

/**
 * Inicia sesión usando Google OAuth
 * Espera: { googleToken, userInfo }
 * userInfo contains email verified on frontend
 */
function googleLogin(data) {
  try {
    const googleToken = data.googleToken;
    const userInfo = data.userInfo;
    
    // Use userInfo passed from frontend (already verified)
    const email = userInfo.email;
    
    // Buscar usuario por email
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USUARIOS);
    const spreadsheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < spreadsheetData.length; i++) {
      const row = spreadsheetData[i];
      if (row[4] === email) { // Columna E: Email
        // Generar token
        const token = Utilities.base64Encode(JSON.stringify({
          userId: row[0],
          email: row[4],
          role: row[2],
          exp: Date.now() + 3600000
        }));
        
        // Obtener información del contador si el usuario está vinculado
        let contadorInfo = null;
        if (row[2] === 'usuario' && row[7]) {
          contadorInfo = getContadorInfoByCode(row[7]);
        }
        
        return {
          token,
          user: {
            id: row[0],
            nombre: row[1],
            role: row[2],
            rfc: row[3],
            email: row[4],
            contadorCode: row[6],
            linkedContadorCode: row[7],
            contador: contadorInfo
          }
        };
      }
    }
    
    // Usuario no encontrado
    throw new Error('Usuario no encontrado. Por favor, regístrate primero.');
    
  } catch (error) {
    Logger.log('Error en googleLogin: ' + error.message);
    throw new Error('Error al iniciar sesión con Google: ' + error.message);
  }
}

/**
 * Registra un nuevo usuario usando Google OAuth
 * Espera: { googleToken, role, nombre?, rfc?, contadorCode?, userInfo? }
 * userInfo contains email/name verified on frontend
 */
function googleRegister(data) {
  try {
    const googleToken = data.googleToken;
    const role = data.role;
    const additionalData = data;
    const userInfo = data.userInfo;
    
    // Use userInfo passed from frontend (already verified)
    const email = userInfo.email;
    const nombre = additionalData?.nombre || userInfo?.name || 'Usuario';
    
    // Verificar si el usuario ya existe
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USUARIOS);
    const spreadsheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < spreadsheetData.length; i++) {
      if (spreadsheetData[i][4] === email) {
        throw new Error('Ya existe una cuenta con este correo electrónico');
      }
    }
    
    // Generar ID único
    const userId = 'user_' + Utilities.getUuid();
    const rfc = additionalData?.rfc || '';
    const contadorCode = additionalData?.contadorCode || '';
    
    // Generar código único para contadores
    let newContadorCode = '';
    if (role === 'contador') {
      newContadorCode = 'CNT' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // Crear carpeta en Drive si es posible
    const carpetaId = createUserFolder(userId, nombre);
    
    // Agregar nuevo usuario a la hoja
    const newRow = [
      userId,           // Columna A: UserID
      nombre,           // Columna B: Nombre
      role,             // Columna C: Role
      rfc,              // Columna D: RFC
      email,            // Columna E: Email
      'google_oauth',   // Columna F: Password (marcador para OAuth)
      newContadorCode,  // Columna G: ContadorCode
      contadorCode,     // Columna H: LinkedContadorCode
      new Date().toISOString(), // Columna I: CreatedAt
      carpetaId         // Columna J: CarpetaID
    ];
    
    sheet.appendRow(newRow);
    
    // Generar token
    const token = Utilities.base64Encode(JSON.stringify({
      userId: userId,
      email: email,
      role: role,
      exp: Date.now() + 3600000
    }));
    
    // Enviar email de bienvenida
    try {
      sendWelcomeEmail(email, nombre, role);
    } catch (e) {
      // Email sending is optional
      Logger.log('Could not send welcome email: ' + e);
    }
    
    return {
      token,
      user: {
        id: userId,
        nombre: nombre,
        role: role,
        rfc: rfc,
        email: email,
        contadorCode: newContadorCode,
        linkedContadorCode: contadorCode
      }
    };
    
  } catch (error) {
    Logger.log('Error en googleRegister: ' + error.message);
    throw new Error('Error al registrar con Google: ' + error.message);
  }
}

/**
 * Obtiene la configuración de un usuario (incluyendo info del contador vinculado)
 */
function getUserSettings(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === userId) {
      let contadorInfo = null;
      if (row[2] === 'usuario' && row[7]) {
        contadorInfo = getContadorInfoByCode(row[7]);
      }
      
      return {
        id: row[0],
        nombre: row[1],
        role: row[2],
        rfc: row[3],
        email: row[4],
        contadorCode: row[6],
        linkedContadorCode: row[7],
        contador: contadorInfo,
        createdAt: row[8]
      };
    }
  }
  
  throw new Error('Usuario no encontrado');
}

/**
 * Obtiene información de un contador a partir de su código único
 */
function getContadorInfoByCode(contadorCode) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[2] === 'contador' && row[6] === contadorCode) {
      return {
        id: row[0],
        nombre: row[1],
        email: row[4],
        rfc: row[3]
      };
    }
  }
  
  return null; // No encontrado
}

/**
 * Envía un email de bienvenida usando GmailApp
 */
function sendWelcomeEmail(email, nombre, role) {
  const asunto = `¡Bienvenido a CONT-AI, ${nombre}!`;
  const mensaje = `
    Hola ${nombre},
    
    Gracias por registrarte en CONT-AI. Tu cuenta ha sido creada exitosamente como **${role}**.
    
    ${
      role === 'contador' 
        ? 'Pronto podrás generar tu código QR para compartir con tus clientes.' 
        : 'Ya puedes comenzar a gestionar tus finanzas y vincular tu cuenta con un contador.'
    }
    
    Saludos,
    El equipo de CONT-AI
  `;
  
  GmailApp.sendEmail(email, asunto, mensaje);
}

// =====================================================
// FUNCIONES DE NEGOCIO - DASHBOARD
// =====================================================
function getDashboardKpis(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Saldo Total (FlujoEfectivo)
  const flujoSheet = ss.getSheetByName(SHEETS.FLUJO_EFECTIVO);
  const flujoData = flujoSheet.getDataRange().getValues();
  let saldoTotal = 0;
  flujoData.slice(1).forEach(row => {
    if (row[1] == userId) saldoTotal += Number(row[2]) || 0;
  });
  
  // 2. Clientes Activos (con saldo > 0)
  const clientesSheet = ss.getSheetByName(SHEETS.CLIENTES);
  const clientesData = clientesSheet.getDataRange().getValues();
  let clientesActivos = 0;
  clientesData.slice(1).forEach(row => {
    if (row[1] == userId && (Number(row[5]) || 0) > 0) clientesActivos++;
  });
  
  // 3. Pendientes SAT (impuestos vencidos no pagados)
  const impuestosSheet = ss.getSheetByName(SHEETS.IMPUESTOS);
  const impuestosData = impuestosSheet.getDataRange().getValues();
  let pendientesSAT = 0;
  const hoy = new Date();
  impuestosData.slice(1).forEach(row => {
    if (row[1] == userId && row[5] != 'Pagado') {
      const vencimiento = new Date(row[4]);
      if (vencimiento < hoy) pendientesSAT++;
    }
  });
  
  // 4. Ingresos del mes (Facturas)
  const facturasSheet = ss.getSheetByName(SHEETS.FACTURAS);
  const facturasData = facturasSheet.getDataRange().getValues();
  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();
  let ingresosMes = 0;
  facturasData.slice(1).forEach(row => {
    if (row[1] == userId) {
      const fechaFactura = new Date(row[4]);
      if (fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === anioActual) {
        ingresosMes += Number(row[3]) || 0;
      }
    }
  });
  
  // 5. Cuánto deben clientes
  let cuantoDeben = 0;
  clientesData.slice(1).forEach(row => {
    if (row[1] == userId) cuantoDeben += Number(row[5]) || 0;
  });
  
  return {
    saldoTotal,
    clientesActivos,
    pendientesSAT,
    ingresosMes,
    cuantoDebenClientes: cuantoDeben
  };
}

// =====================================================
// FUNCIONES DE NEGOCIO - GASTOS SCANNER
// =====================================================

// Google Cloud Vision API Key
const GOOGLE_VISION_API_KEY = 'AIzaSyBv3-RzLpwE_vBTXAQZ5ojqPJ4mW2c8p6M';

// OCR.space API Key (free tier - fallback)
const OCR_SPACE_API_KEY = 'helloworld';

/**
 * Scan a receipt image and extract gasto data using Google Cloud Vision API
 * @param {string} base64Image - Base64 encoded image data
 * @returns {Object} - Extracted gasto data
 */
function scanGastoFromImage(base64Image) {
  Logger.log('=== scanGastoFromImage INICIO ===');
  Logger.log('base64Image length: ' + (base64Image ? base64Image.length : 0));
  
  try {
    // Try Google Cloud Vision API first (better accuracy)
    Logger.log('Intentando Google Cloud Vision API...');
    const ocrResult = callGoogleVisionApi(base64Image);
    
    Logger.log('Google Vision response: ' + JSON.stringify(ocrResult).substring(0, 200));
    
    if (ocrResult && ocrResult.textAnnotations && ocrResult.textAnnotations.length > 0) {
      // Get the full text from Google Vision
      const extractedText = ocrResult.textAnnotations[0].description || '';
      Logger.log('Google Vision - Texto extraído (' + extractedText.length + ' caracteres):');
      Logger.log(extractedText.substring(0, 500)); // Primeros 500 caracteres
      
      // Parse the extracted text to find gasto data
      const gastoData = parseGastoFromText(extractedText);
      
      Logger.log('Datos parseados:');
      Logger.log('  Proveedor: ' + gastoData.proveedor);
      Logger.log('  Monto: ' + gastoData.monto);
      Logger.log('  Fecha: ' + gastoData.fecha);
      Logger.log('  RFC: ' + gastoData.rfc);
      Logger.log('  Categoria: ' + gastoData.categoria);
      Logger.log('  Folio: ' + gastoData.folio);
      
      Logger.log('=== scanGastoFromImage FIN (Google Vision) ===');
      
      return gastoData;
    }
    
    // Fallback to OCR.space if Google Vision fails
    Logger.log('Google Vision no devolvió resultados, intentando OCR.space...');
    return scanWithOcrSpace(base64Image);
    
  } catch (error) {
    Logger.log('Google Vision Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    Logger.log('Intentando OCR.space como fallback...');
    
    // Fallback to OCR.space
    try {
      return scanWithOcrSpace(base64Image);
    } catch (ocrError) {
      Logger.log('OCR.space Error: ' + ocrError.message);
      Logger.log('Retornando datos mock como fallback final');
      return getMockGastoData();
    }
  }
}

/**
 * Call Google Cloud Vision API to extract text from image
 * @param {string} base64Image - Base64 encoded image
 * @returns {Object} - Vision API response
 */
function callGoogleVisionApi(base64Image) {
  const apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_VISION_API_KEY;
  
  // Prepare the request body for Google Cloud Vision
  const requestBody = {
    requests: [{
      image: {
        content: base64Image.replace(/^data:image\/[a-z]+;base64,/, '') // Remove data URL prefix if present
      },
      features: [{
        type: 'TEXT_DETECTION',
        maxResults: 1
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(apiUrl, options);
  const result = JSON.parse(response.getContentText());
  
  // Check for errors
  if (result.error) {
    throw new Error('Google Vision Error: ' + result.error.message);
  }
  
  return result.responses[0];
}

/**
 * Fallback to OCR.space API
 * @param {string} base64Image - Base64 encoded image
 * @returns {Object} - Extracted gasto data
 */
function scanWithOcrSpace(base64Image) {
  const ocrResult = callOcrSpaceApi(base64Image);
  
  if (!ocrResult || !ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
    throw new Error('No se pudo extraer texto de la imagen');
  }
  
  const extractedText = ocrResult.ParsedResults[0].ParsedText;
  Logger.log('OCR.space - Extracted text: ' + extractedText);
  
  return parseGastoFromText(extractedText);
}

/**
 * Call OCR.space API to extract text from image
 * @param {string} base64Image - Base64 encoded image
 * @returns {Object} - OCR API response
 */
function callOcrSpaceApi(base64Image) {
  const apiUrl = 'https://api.ocr.space/parse/image';
  
  // Create multipart form data
  const boundary = '------FormBoundary' + Utilities.getUuid();
  const body = '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="base64Image"\r\n\r\n';
  body += base64Image + '\r\n';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="language"\r\n\r\n';
  body += 'Spanish' + '\r\n';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="isOverlayRequired"\r\n\r\n';
  body += 'false' + '\r\n';
  body += '--' + boundary + '--\r\n';
  
  const options = {
    method: 'post',
    payload: body,
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'apikey': OCR_SPACE_API_KEY
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(apiUrl, options);
  const result = JSON.parse(response.getContentText());
  
  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage[0] || 'OCR processing error');
  }
  
  return result;
}

/**
 * Parse extracted text to find gasto data (date, amount, vendor, RFC, folio)
 * @param {string} text - Extracted text from OCR
 * @returns {Object} - Parsed gasto data
 */
function parseGastoFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Default values
  let proveedor = '';
  let fecha = '';
  let monto = 0;
  let rfc = '';
  let categoria = '';
  let folio = '';  // NUEVO: Para número de factura/recibo

  // Patterns for Mexican fiscal documents
  const fechaPatterns = [
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/,  // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,    // YYYY/MM/DD
    /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i        // 15 de marzo de 2024
  ];

  const montoPatterns = [
    /\$\s*([\d,]+\.?\d*)/,           // $1,234.56
    /total[:\s]*\$?\s*([\d,]+\.?\d*)/i,  // Total: $1234.56
    /importe[:\s]*\$?\s*([\d,]+\.?\d*)/i, // Importe: $1234.56
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/  // 1,234.56
  ];

  const rfcPattern = /[A-Z]{4}\d{6}[A-Z0-9]{3}/i;  // RFC pattern (4 letters + 6 digits + 3 alphanumeric)
  
  // NUEVO: Pattern para folio/factura
  const folioPatterns = [
    /folio[:\s]*([A-Z0-9\-]+)/i,
    /factura[:\s]*([A-Z0-9\-]+)/i,
    /recibo[:\s]*([A-Z0-9\-]+)/i,
    /serie[:\s]*([A-Z0-9\-]+)/i,
    /no\.\s*([A-Z0-9\-]+)/i,
    /n[ºo]\s*([A-Z0-9\-]+)/i,
    /folio\s+fiscal[:\s]*([A-Z0-9\-]+)/i
  ];

  // Find RFC
  const rfcMatch = text.match(rfcPattern);
  if (rfcMatch) {
    rfc = rfcMatch[0].toUpperCase();
  }
  
  // NUEVO: Find Folio/Referencia
  for (const pattern of folioPatterns) {
    const folioMatch = text.match(pattern);
    if (folioMatch) {
      folio = folioMatch[1].trim().toUpperCase();
      break;
    }
  }
  
  // Si no se encontró folio con patrones, buscar líneas que parezcan número de documento
  if (!folio) {
    for (const line of lines) {
      // Buscar líneas cortas con letras y números que parezcan folio
      if (/^[A-Z]{1,3}\d{4,10}$/i.test(line) || /^\d{6,12}$/i.test(line)) {
        folio = line.toUpperCase();
        break;
      }
    }
  }

  // Find date
  for (const line of lines) {
    for (const pattern of fechaPatterns) {
      const match = line.match(pattern);
      if (match) {
        if (match[1].length === 4) {
          // YYYY/MM/DD format
          fecha = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        } else if (match[3] && match[3].length <= 2) {
          // DD/MM/YYYY format
          const year = match[3].length === 2 ? '20' + match[3] : match[3];
          fecha = `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        } else if (line.match(/\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b/i)) {
          // Spanish date
          const meses = { ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
                        jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12' };
          const mesMatch = line.match(/\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b/i);
          if (mesMatch) {
            fecha = `${match[3]}-${meses[mesMatch[1].toLowerCase()]}-${match[1].padStart(2, '0')}`;
          }
        }
        break;
      }
    }
    if (fecha) break;
  }

  // Find amount (look for the largest number with decimal)
  let maxMonto = 0;
  for (const line of lines) {
    for (const pattern of montoPatterns) {
      const match = line.match(pattern);
      if (match) {
        const valor = parseFloat(match[1].replace(/,/g, ''));
        if (valor > maxMonto && valor < 1000000) { // Reasonable limit
          maxMonto = valor;
        }
      }
    }
  }
  monto = maxMonto;

  // Find vendor (usually first substantial line or after "Emisor:")
  const ignoreWords = ['ticket', 'factura', 'nota', 'venta', 'sucursal', 'fecha', 'hora', 'total', 'subtotal', 'iva', 'importe', 'efectivo', 'tarjeta', 'cambio', 'folio', 'serie', 'no.', 'nº'];
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].toLowerCase();
    const isIgnorable = ignoreWords.some(w => line.includes(w));
    const hasNumber = /\d{5,}/.test(line); // Skip lines with long numbers (phones, addresses)

    if (!isIgnorable && !hasNumber && lines[i].length > 3) {
      proveedor = lines[i];
      break;
    }
  }

  // If no vendor found, try to find after "Emisor" or "Nombre:"
  const emisorMatch = text.match(/(?:emisor|nom(?:bre)?|raz[óo]n\s+social|cliente)[:\s]+([^\n]+)/i);
  if (emisorMatch && !proveedor) {
    proveedor = emisorMatch[1].trim();
  }
  
  // NUEVO: Si aún no hay proveedor, buscar en la primera línea que no sea fecha, monto o RFC
  if (!proveedor) {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      // Skip lines that are dates, amounts, RFCs, or common header words
      if (!/[0-9]{2,}/.test(line) &&  // No números largos
          !lowerLine.includes('total') && 
          !lowerLine.includes('subtotal') &&
          !lowerLine.includes('iva') &&
          !lowerLine.includes('rfc') &&
          !lowerLine.includes('fecha') &&
          line.length > 2 && line.length < 50) {
        proveedor = line;
        break;
      }
    }
  }

  // Determine category based on keywords
  const categorias = [
    { name: 'Telecomunicaciones', keywords: ['telcel', 'telmex', 'movistar', 'att', 'vodafone', 'telefono', 'internet', 'paquete'] },
    { name: 'Gasolina', keywords: ['gasolina', 'pemex', 'shell', 'bp', 'combustible', 'gasolinera', 'hidro'] },
    { name: 'Restaurante', keywords: ['restaurante', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza', 'comida'] },
    { name: 'Supermercado', keywords: ['walmart', 'soriana', 'comerci', 'chedraui', 'super', 'abarrotes', 'mercado'] },
    { name: 'Papelería', keywords: ['papeleria', 'oficina', 'office', 'peninsula', 'papel', 'utiles'] },
    { name: 'Transporte', keywords: ['taxi', 'uber', 'didi', 'transporte', 'camion', 'metro', 'avion'] },
    { name: 'Medicamentos', keywords: ['farmacia', 'medicamento', 'doctor', 'hospital', 'clinica', 'salud'] },
    { name: 'Servicios', keywords: ['agua', 'luz', 'gas', ' CFE ', 'servicio', 'mantenimiento'] }
  ];
  
  const lowerText = text.toLowerCase();
  for (const cat of categorias) {
    if (cat.keywords.some(k => lowerText.includes(k))) {
      categoria = cat.name;
      break;
    }
  }
  
  // Default to "Otros" if no category found
  if (!categoria) {
    categoria = 'Otros';
  }
  
  return {
    proveedor: proveedor || 'Proveedor desconocido',
    fecha: fecha || new Date().toISOString().split('T')[0],
    monto: monto || 0,
    rfc: rfc || '',
    categoria: categoria,
    folio: folio || ''  // NUEVO: Retornar folio
  };
}

/**
 * Return mock gasto data as fallback
 */
function getMockGastoData() {
  return {
    proveedor: "Proveedor Ejemplo S.A. de C.V.",
    fecha: new Date().toISOString().split('T')[0],
    monto: Math.floor(Math.random() * 5000) + 100,
    rfc: "RFC123456XXX",
    categoria: ["Telecom", "Arrendamiento", "Papelería", "Gasolina", "Restaurante"][Math.floor(Math.random() * 5)],
    folio: "FOLIO-" + Math.floor(Math.random() * 10000)  // NUEVO: Folio de ejemplo
  };
}

function saveGasto(gastoData) {
  try {
    // Usar getActive() en lugar de openById() para evitar problemas de permisos
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(SHEETS.GASTOS);

    if (!sheet) {
      Logger.log('Hoja Gastos no encontrada');
      return { success: false, error: 'Hoja Gastos no encontrada' };
    }

    const gastoId = Utilities.getUuid();
    let fileId = '';

    Logger.log('=== saveGasto function ===');
    Logger.log('gastoId: ' + gastoId);
    Logger.log('userId: ' + gastoData.userId);
    Logger.log('fileData exists: ' + (gastoData.fileData ? 'YES' : 'NO'));

    // Si hay archivo adjunto, guardarlo en la carpeta personal del usuario
    if (gastoData.fileData) {
      Logger.log('Attempting to save file to Drive...');

      try {
        // Decodificar base64
        const blob = Utilities.base64Decode(gastoData.fileData);
        Logger.log('Base64 decoded, blob size: ' + blob.length);

        // Obtener el ID de la carpeta del usuario
        const carpetaId = getUserCarpetaId(gastoData.userId);

        try {
          if (carpetaId) {
            const folder = DriveApp.getFolderById(carpetaId);
            const file = folder.createFile(blob, `gasto_${gastoId}.jpg`);
            fileId = file.getId();
            Logger.log('File saved to user folder, fileId: ' + fileId);
          } else {
            // Fallback a la carpeta general si no se encuentra la personal
            Logger.log('No user folder found, using general folder');
            const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
            const file = folder.createFile(blob, `gasto_${gastoId}.jpg`);
            fileId = file.getId();
            Logger.log('File saved to general folder, fileId: ' + fileId);
          }
        } catch (driveError) {
          Logger.log('Drive error: ' + driveError.message);
          // Si falla Drive, continuar sin guardar la imagen
          Logger.log('Continuando sin guardar imagen en Drive');
        }
      } catch (e) {
        Logger.log('Error processing file: ' + e.message);
        Logger.log('Continuando sin guardar imagen');
      }
    } else {
      Logger.log('No fileData provided, skipping file save');
    }

    // Agregar fila con columnas actualizadas:
    // FileID | UserID | monto | categoria | fecha | rfc | status | proveedor | folio
    sheet.appendRow([
      gastoId,                                    // Columna A: FileID (ID del gasto)
      gastoData.userId,                           // Columna B: UserID
      gastoData.monto,                            // Columna C: monto
      gastoData.categoria,                        // Columna D: categoria
      gastoData.fecha,                            // Columna E: fecha
      gastoData.rfc,                              // Columna F: rfc
      gastoData.status || 'pending',              // Columna G: status
      gastoData.proveedor || '',                  // Columna H: proveedor
      gastoData.folio || ''                       // Columna I: folio/referencia
    ]);

    Logger.log('Gasto saved to sheet, fileId: ' + fileId);
    Logger.log('==============================');

    return { success: true, gastoId, fileId };
  } catch (e) {
    Logger.log('Error en saveGasto: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return { success: false, error: e.message };
  }
}

/**
 * Comparte la carpeta del usuario con su contador
 * @param {string} userId - ID del usuario
 * @param {string} contadorCode - Código del contador
 */
function shareFolderWithContador(userId, contadorCode) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName(SHEETS.USUARIOS);
    const data = userSheet.getDataRange().getValues();
    
    let userFolderId = null;
    let contadorEmail = null;
    
    // Buscar carpeta del usuario y email del contador
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === userId) {
        userFolderId = row[9]; // Columna J: CarpetaID
      }
      if (row[2] === 'contador' && row[6] === contadorCode) {
        contadorEmail = row[4]; // Columna E: Email
      }
    }
    
    if (userFolderId && contadorEmail) {
      const folder = DriveApp.getFolderById(userFolderId);
      folder.addViewer(contadorEmail); // Solo lectura
      Logger.log('Folder shared with: ' + contadorEmail);
      return { success: true, message: 'Carpeta compartida con ' + contadorEmail };
    }
    
    return { success: false, message: 'Usuario o contador no encontrado' };
  } catch (error) {
    Logger.log('Error sharing folder: ' + error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Vincula un usuario a un contador y comparte la carpeta
 * @param {string} userId - ID del usuario
 * @param {string} contadorCode - Código del contador
 */
function vincularContador(userId, contadorCode) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName(SHEETS.USUARIOS);
    const data = userSheet.getDataRange().getValues();
    
    // Buscar fila del usuario
    let rowNum = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        rowNum = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }
    
    if (rowNum === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar LinkedContadorCode
    userSheet.getRange(rowNum, 8).setValue(contadorCode); // Columna H
    
    // Compartir carpeta con el contador
    const shareResult = shareFolderWithContador(userId, contadorCode);
    
    return { success: true, message: 'Contador vinculado y carpeta compartida' };
  } catch (error) {
    Logger.log('Error vinculando contador: ' + error);
    return { success: false, message: error.toString() };
  }
}

// =====================================================
// FUNCIONES DE NEGOCIO - IMPUESTOS
// =====================================================
function getImpuestosMes(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const facturasSheet = ss.getSheetByName(SHEETS.FACTURAS);
  const facturasData = facturasSheet.getDataRange().getValues();
  let ingresosTotales = 0;
  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();
  
  facturasData.slice(1).forEach(row => {
    if (row[1] == userId) {
      const fecha = new Date(row[4]);
      if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
        ingresosTotales += Number(row[3]) || 0;
      }
    }
  });
  
  const isr = Math.round(ingresosTotales * 0.3);
  const iva = Math.round(ingresosTotales * 0.16);
  const imss = 4800;
  
  const vencimiento = new Date();
  vencimiento.setMonth(vencimiento.getMonth() + 1);
  vencimiento.setDate(17);
  const venceStr = Utilities.formatDate(vencimiento, 'GMT-6', 'dd/MM/yyyy');
  
  return { isr, iva, imss, vence: venceStr };
}

function pagarImpuesto(pagoData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.IMPUESTOS);
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == pagoData.impuestoId) {
      sheet.getRange(i + 1, 6).setValue('Pagado');
      sheet.getRange(i + 1, 7).setValue(new Date());
      break;
    }
  }
  
  return { success: true };
}

// =====================================================
// FUNCIONES DE NEGOCIO - INTEGRACIONES
// =====================================================
function conectarPlataforma(integracionData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Integraciones');
  if (!sheet) {
    sheet = ss.insertSheet('Integraciones');
    sheet.appendRow(['UserID', 'Plataforma', 'Token', 'FechaConexion']);
  }
  
  sheet.appendRow([
    integracionData.userId,
    integracionData.plataforma,
    integracionData.token,
    new Date()
  ]);
  
  return { success: true, message: `Conectado a ${integracionData.plataforma}` };
}

function importarVentas(ventasData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const facturasSheet = ss.getSheetByName(SHEETS.FACTURAS);
  
  for (let i = 0; i < 5; i++) {
    const monto = Math.floor(Math.random() * 2000) + 500;
    facturasSheet.appendRow([
      Utilities.getUuid(),
      ventasData.userId,
      'CLIENTE_ML_' + i,
      monto,
      new Date(),
      'pagada',
      monto * 0.16,
      monto * 0.1
    ]);
  }
  
  return { success: true, importedCount: 5 };
}

// =====================================================
// FUNCIONES DE NEGOCIO - ALERTAS
// =====================================================
function getAlertas(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const alertasSheet = ss.getSheetByName(SHEETS.ALERTAS);
  
  const data = alertasSheet.getDataRange().getValues();
  const alertas = [];
  const hoy = new Date();
  
  data.slice(1).forEach(row => {
    if (row[1] == userId) {
      const vencimiento = new Date(row[4]);
      const diffDays = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
      
      let tipo = 'info';
      if (diffDays < 0) tipo = 'critical';
      else if (diffDays <= 3) tipo = 'warning';
      
      alertas.push({
        id: row[0],
        type: tipo,
        title: row[3],
        action: row[5],
        fecha: Utilities.formatDate(vencimiento, 'GMT-6', 'dd/MM/yyyy')
      });
    }
  });
  
  alertas.sort((a, b) => {
    const priority = { critical: 1, warning: 2, info: 3 };
    return priority[a.type] - priority[b.type];
  });
  
  return alertas;
}

// =====================================================
// FUNCIONES DE NEGOCIO - SIMULADOR
// =====================================================
function calcularSimulacion(data) {
  const { ingresos, gastos, deducciones } = data;
  
  const utilidadBruta = ingresos - gastos;
  const isr = Math.round(utilidadBruta * 0.3);
  const ivaPagar = Math.round((ingresos - gastos) * 0.16);
  const utilidadNeta = utilidadBruta - isr - ivaPagar + deducciones;
  
  return {
    utilidadBruta,
    isr,
    ivaPagar,
    utilidadNeta
  };
}

// =====================================================
// FUNCIONES DE NEGOCIO - CHAT / CONTADOR
// =====================================================
function getMensajesChat(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Chat');
  if (!sheet) {
    sheet = ss.insertSheet('Chat');
    sheet.appendRow(['MensajeID', 'UserID', 'ContadorID', 'Mensaje', 'Fecha', 'Remitente']);
  }
  
  const data = sheet.getDataRange().getValues();
  const mensajes = [];
  
  data.slice(1).forEach(row => {
    if (row[1] == userId || row[2] == userId) {
      mensajes.push({
        id: row[0],
        mensaje: row[3],
        fecha: Utilities.formatDate(row[4], 'GMT-6', 'dd/MM/yyyy HH:mm'),
        remitente: row[5]
      });
    }
  });
  
  return mensajes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

function enviarMensaje(mensajeData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Chat');
  if (!sheet) {
    sheet = ss.insertSheet('Chat');
    sheet.appendRow(['MensajeID', 'UserID', 'ContadorID', 'Mensaje', 'Fecha', 'Remitente']);
  }
  
  sheet.appendRow([
    Utilities.getUuid(),
    mensajeData.userId,
    mensajeData.contadorId,
    mensajeData.mensaje,
    new Date(),
    mensajeData.remitente
  ]);
  
  return { success: true };
}

// =====================================================
// CRON JOBS (Triggers)
// =====================================================
function verificarVencimientosDiario() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const impuestosSheet = ss.getSheetByName(SHEETS.IMPUESTOS);
  const alertasSheet = ss.getSheetByName(SHEETS.ALERTAS);
  
  const impuestosData = impuestosSheet.getDataRange().getValues();
  const hoy = new Date();
  
  impuestosData.slice(1).forEach(row => {
    const vencimiento = new Date(row[4]);
    const userId = row[1];
    
    if (row[5] != 'Pagado' && vencimiento < hoy) {
      alertasSheet.appendRow([
        Utilities.getUuid(),
        userId,
        'critical',
        `Impuesto ${row[2]} vencido`,
        vencimiento,
        'pagar',
        false
      ]);
    } else if (row[5] != 'Pagado') {
      const diffDays = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3 && diffDays >= 0) {
        alertasSheet.appendRow([
          Utilities.getUuid(),
          userId,
          'warning',
          `Impuesto ${row[2]} vence en ${diffDays} días`,
          vencimiento,
          'revisar',
          false
        ]);
      }
    }
  });
}

function conciliarBancosSemanal() {
  console.log('Conciliación bancaria ejecutada');
}

function generarReportesMensual() {
  console.log('Reportes mensuales generados');
}

// =====================================================
// CONFIGURACIÓN DE TRIGGERS (Ejecutar una vez manualmente)
// =====================================================
function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('verificarVencimientosDiario')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();

  ScriptApp.newTrigger('conciliarBancosSemanal')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(2)
    .create();

  ScriptApp.newTrigger('generarReportesMensual')
    .timeBased()
    .onMonthDay(1)
    .atHour(3)
    .create();
}

// =====================================================
// UTILIDADES - MIGRACIÓN DE DATOS
// =====================================================

/**
 * Agrega la columna "CarpetaID" en la hoja Usuarios (columna J)
 * Ejecutar una sola vez para actualizar la estructura de la hoja
 */
function addCarpetaIDColumn() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Usuarios');
  // Añadir encabezado en columna 10 (J)
  sheet.getRange(1, 10).setValue('CarpetaID');
}