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
        
      case 'get_contador_code':
        const userIdCode = e.parameter.userId;
        if (!userIdCode) throw new Error('userId requerido');
        result = getContadorCode(userIdCode);
        break;
        
      case 'change_password':
        if (!postDataContents) throw new Error('No se recibió el cuerpo de la petición');
        const passwordData = JSON.parse(postDataContents);
        const userIdPass = passwordData.userId;
        const currentPass = passwordData.currentPassword;
        const newPass = passwordData.newPassword;
        if (!userIdPass || !currentPass || !newPass) throw new Error('Datos incompletos');
        result = changePassword(userIdPass, currentPass, newPass);
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

      // ========== GET GASTOS (HISTORIAL) ==========
      case 'get_gastos':
        const userIdGastos = e.parameter.userId;
        const limitGastos = parseInt(e.parameter.limit) || 20;
        if (!userIdGastos) throw new Error('userId requerido');
        result = getGastosByUser(userIdGastos, limitGastos);
        break;
        
      case 'vincular_contador':
        const vincularData = postDataContents ? JSON.parse(postDataContents) : {};
        result = vincularContador(vincularData.userId, vincularData.contadorCode);
        break;
        
      // ========== IMPUESTOS ==========
      case 'impuestos': // Match api.ts
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
      case 'integracion_connect': // Match api.ts
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
      case 'chat': // Match api.ts
      case 'chat_mensajes':
        const userIdChat = e.parameter.userId;
        if (!userIdChat) throw new Error('userId requerido');
        result = getMensajesChat(userIdChat);
        break;
        
      case 'chat_send': // Match api.ts
      case 'chat_enviar':
        const mensajeData = JSON.parse(e.postData.contents);
        result = enviarMensaje(mensajeData);
        break;

      // ========== FACTURAS ==========
      case 'facturas_save':
        const facturaSaveData = postDataContents ? JSON.parse(postDataContents) : {};
        result = saveFactura(facturaSaveData);
        break;

      case 'get_facturas':
        const userIdFacturas = e.parameter.userId;
        result = getFacturas(userIdFacturas);
        break;

      case 'download_factura':
        const facturaId = e.parameter.facturaId;
        result = downloadFactura(facturaId);
        break;

      // ========== CONTADOR - CLIENTES VINCULADOS ==========
      case 'get_linked_clients':
        const contadorId = e.parameter.contadorId;
        if (!contadorId) throw new Error('contadorId requerido');
        result = getLinkedClients(contadorId);
        break;

      case 'get_client':
        const clientId = e.parameter.clientId;
        if (!clientId) throw new Error('clientId requerido');
        result = getClient(clientId);
        break;

      case 'get_client_gastos':
        const clientIdGastos = e.parameter.clientId;
        const limitClientGastos = parseInt(e.parameter.limit) || 50;
        if (!clientIdGastos) throw new Error('clientId requerido');
        result = getClientGastos(clientIdGastos, limitClientGastos);
        break;

      case 'save_contador_notes':
        const notesData = postDataContents ? JSON.parse(postDataContents) : {};
        result = saveContadorNotes(notesData.contadorId, notesData.clientId, notesData.notes);
        break;

      case 'get_contador_notes':
        const notesContadorId = e.parameter.contadorId;
        const notesClientId = e.parameter.clientId;
        result = getContadorNotes(notesContadorId, notesClientId);
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

/**
 * Registra un nuevo usuario (contador o usuario normal)
 * Espera: { nombre, email, password, role, rfc, contadorCode? (solo si el usuario se vincula) }
 */
function registerUser(data) {
  const ss = SpreadsheetApp.getActive();
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
    // Generar código amigable para el contador (ej: CONT-X821)
    contadorCode = generateShortContadorCode();
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
  const ss = SpreadsheetApp.getActive();
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
    const ss = SpreadsheetApp.getActive();
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
    const ss = SpreadsheetApp.getActive();
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
    
    if (role === 'contador') {
      newContadorCode = generateShortContadorCode();
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
  const ss = SpreadsheetApp.getActive();
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
 * Cambia la contraseña de un usuario
 */
function changePassword(userId, currentPassword, newPassword) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === userId) {
      // Columna 5 es la contraseña almacenada
      const storedPassword = row[5];
      
      // Verificar que la contraseña actual coincida
      if (storedPassword !== currentPassword) {
        throw new Error('La contraseña actual es incorrecta');
      }
      
      // Actualizar la contraseña
      sheet.getRange(i + 1, 6).setValue(newPassword);
      
      return { success: true, message: 'Contraseña actualizada correctamente' };
    }
  }
  
  throw new Error('Usuario no encontrado');
}

/**
 * Obtiene información de un contador a partir de su código único
 */
function getContadorInfoByCode(contadorCode) {
  const ss = SpreadsheetApp.getActive();
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
  const ss = SpreadsheetApp.getActive();
  
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
const GOOGLE_VISION_API_KEY = 'AIzaSyCYXf3gCe8hwonoW0B2Qhk7r77Y2XDjt6A';

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
      Logger.log('ERROR: Hoja Gastos no encontrada');
      return { success: false, error: 'Hoja Gastos no encontrada' };
    }

    const gastoId = Utilities.getUuid();
    let fileId = '';

    Logger.log('=== saveGasto function ===');
    Logger.log('gastoId: ' + gastoId);
    Logger.log('userId: ' + gastoData.userId);
    Logger.log('fileData exists: ' + (gastoData.fileData ? 'YES' : 'NO'));
    Logger.log('fileData length: ' + (gastoData.fileData ? gastoData.fileData.length : 0));

    // Si hay archivo adjunto, guardarlo en Drive
    let fileSaveError = null;
    if (gastoData.fileData && gastoData.fileData.length > 0) {
      Logger.log('=== SAVE FILE TO DRIVE ===');
      Logger.log('fileData length: ' + gastoData.fileData.length);
      Logger.log('userId: ' + gastoData.userId);

      try {
        // Determinar tipo de archivo primero
        let contentType = 'image/jpeg';
        if (gastoData.fileType && gastoData.fileType.includes('pdf')) {
          contentType = 'application/pdf';
        }
        const extension = contentType === 'application/pdf' ? '.pdf' : '.jpg';
        const fileName = 'gasto_' + gastoId + '_' + Date.now() + extension;
        
        // Decodificar base64 y crear blob
        const decoded = Utilities.base64Decode(gastoData.fileData);
        Logger.log('Decoded size: ' + decoded.length);
        
        // Crear Blob desde el arreglo de bytes
        const blob = Utilities.newBlob(decoded, contentType, fileName);
        Logger.log('Blob created: ' + fileName + ' (' + contentType + ')');

        // Usar siempre la carpeta principal como fallback
        let folder;
        try {
          // Intentar obtener carpeta del usuario
          const carpetaId = getUserCarpetaId(gastoData.userId);
          Logger.log('User folder ID: ' + carpetaId);
          
          if (carpetaId && carpetaId.length > 5) {
            folder = DriveApp.getFolderById(carpetaId);
            Logger.log('Using user folder: ' + folder.getName());
          } else {
            Logger.log('Invalid folder ID, using main folder');
            folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
          }
        } catch (e) {
          Logger.log('Error getting user folder: ' + e.message);
          Logger.log('Using main folder');
          folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        }
        
        Logger.log('Creating file: ' + fileName);
        
        // Crear archivo - usar solo el blob
        const file = folder.createFile(blob);
        fileId = file.getId();
        Logger.log('✅ File saved! ID: ' + fileId);
        Logger.log('✅ URL: https://drive.google.com/uc?id=' + fileId + '&export=download');
        
      } catch (e) {
        fileSaveError = e.message;
        Logger.log('❌ Error saving file: ' + e.message);
        Logger.log('Stack: ' + e.stack);
      }
      Logger.log('=== END SAVE FILE ===');
    } else {
      Logger.log('No fileData to save');
    }

    // Agregar fila con columnas actualizadas
    Logger.log('Guardando gasto en Sheets...');
    sheet.appendRow([
      gastoId,                                    // Columna A: FileID
      gastoData.userId,                           // Columna B: UserID
      gastoData.monto,                            // Columna C: monto
      gastoData.categoria,                        // Columna D: categoria
      gastoData.fecha,                            // Columna E: fecha
      gastoData.rfc,                              // Columna F: rfc
      gastoData.status || 'pending',              // Columna G: status
      gastoData.proveedor || '',                  // Columna H: proveedor
      gastoData.folio || ''                       // Columna I: folio
    ]);
    Logger.log('Gasto saved to sheet!');
    Logger.log('Final fileId: ' + fileId);
    Logger.log('File save error: ' + (fileSaveError || 'none'));
    Logger.log('==============================');

    return { success: true, gastoId, fileId, fileSaveError };
  } catch (e) {
    Logger.log('Error en saveGasto: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene los gastos de un usuario (últimos N registros)
 * @param {string} userId - ID del usuario
 * @param {number} limit - Cantidad de gastos a retornar (default: 20)
 */
function getGastosByUser(userId, limit = 20) {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(SHEETS.GASTOS);
    
    if (!sheet) {
      return { gastos: [], message: 'No hay gastos registrados' };
    }
    
    const data = sheet.getDataRange().getValues();
    const gastos = [];
    
    // Empezar desde el final (más recientes primero)
    for (let i = data.length - 1; i >= 1 && gastos.length < limit; i--) {
      const row = data[i];
      if (row[1] === userId) { // Columna B: UserID
        gastos.push({
          id: row[0],           // Columna A: FileID
          userId: row[1],       // Columna B: UserID
          monto: row[2],        // Columna C: monto
          categoria: row[3],    // Columna D: categoria
          fecha: row[4],        // Columna E: fecha
          rfc: row[5],          // Columna F: rfc
          status: row[6],       // Columna G: status
          proveedor: row[7],    // Columna H: proveedor
          folio: row[8]         // Columna I: folio
        });
      }
    }
    
    Logger.log(`Gastos encontrados para ${userId}: ${gastos.length}`);
    
    return { gastos, total: gastos.length };
  } catch (e) {
    Logger.log('Error en getGastosByUser: ' + e.message);
    return { gastos: [], error: e.message };
  }
}

/**
 * Comparte la carpeta del usuario con su contador
 * @param {string} userId - ID del usuario
 * @param {string} contadorCode - Código del contador
 */
function shareFolderWithContador(userId, contadorCode) {
  try {
    const ss = SpreadsheetApp.getActive();
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
    const ss = SpreadsheetApp.getActive();
    const userSheet = ss.getSheetByName(SHEETS.USUARIOS);
    const data = userSheet.getDataRange().getValues();
    
    // Buscar fila del usuario y verificar que el código del contador sea válido
    let rowNum = -1;
    let contadorExiste = false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        rowNum = i + 1;
      }
      if (data[i][2] === 'contador' && data[i][6] === contadorCode) {
        contadorExiste = true;
      }
    }
    
    if (rowNum === -1) throw new Error('Usuario no encontrado');
    if (!contadorExiste) throw new Error('El código del contador no es válido o no existe');
    
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
  const ss = SpreadsheetApp.getActive();
  
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
  const ss = SpreadsheetApp.getActive();
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
  const ss = SpreadsheetApp.getActive();
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
  const ss = SpreadsheetApp.getActive();
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
// FUNCIONES DE NEGOCIO - FACTURAS CFDI
// =====================================================

/**
 * Guarda una nueva factura en la hoja de Facturas
 * @param {Object} facturaData - Datos de la factura
 * Expected: { userId, clienteId, monto, status, rfcReceptor, nombreReceptor, usoCFDI, regimenFiscal, descripcion }
 */
function saveFactura(facturaData) {
  try {
    Logger.log('=== saveFactura function ===');
    Logger.log('facturaData: ' + JSON.stringify(facturaData));
    
    const ss = SpreadsheetApp.getActive();
    const facturasSheet = ss.getSheetByName(SHEETS.FACTURAS);
    
    if (!facturasSheet) {
      throw new Error('Hoja de Facturas no encontrada');
    }
    
    const userId = facturaData.userId;
    const clienteId = facturaData.clienteId || 'CLIENTE_' + Utilities.getUuid().substring(0, 8);
    const monto = parseFloat(facturaData.monto) || 0;
    const status = facturaData.status || 'pendiente';
    const iva = monto * 0.16;
    const comision = monto * 0.1;
    const fecha = facturaData.fecha ? new Date(facturaData.fecha) : new Date();
    
    // Generar folio único
    const year = fecha.getFullYear();
    const lastRow = facturasSheet.getLastRow();
    const folioNum = lastRow > 1 ? lastRow : 1;
    const folio = `CFDI-${year}-${String(folioNum).padStart(4, '0')}`;
    
    // Guardar en la hoja: ID | UserID | ClienteID | Monto | Fecha | Status | IVA | Comision | Folio | RFC | Nombre | UsoCFDI | Regimen | Descripcion
    facturasSheet.appendRow([
      Utilities.getUuid(),
      userId,
      clienteId,
      monto,
      fecha,
      status,
      iva,
      comision,
      folio,
      facturaData.rfcReceptor || '',
      facturaData.nombreReceptor || '',
      facturaData.usoCFDI || 'G03',
      facturaData.regimenFiscal || '601',
      facturaData.descripcion || ''
    ]);
    
    Logger.log('✅ Factura guardada exitosamente');
    Logger.log('Folio: ' + folio);
    
    return {
      success: true,
      message: 'Factura guardada exitosamente',
      folio: folio,
      data: {
        id: Utilities.getUuid(),
        userId,
        clienteId,
        monto,
        fecha: fecha.toISOString(),
        status,
        iva,
        comision,
        folio
      }
    };
    
  } catch (e) {
    Logger.log('Error en saveFactura: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Obtiene todas las facturas de un usuario
 * @param {string} userId - ID del usuario
 */
function getFacturas(userId) {
  try {
    Logger.log('=== getFacturas function ===');
    Logger.log('userId: ' + userId);
    
    const ss = SpreadsheetApp.getActive();
    const facturasSheet = ss.getSheetByName(SHEETS.FACTURAS);
    
    if (!facturasSheet) {
      throw new Error('Hoja de Facturas no encontrada');
    }
    
    const data = facturasSheet.getDataRange().getValues();
    const facturas = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Column A: ID, B: UserID, C: ClienteID, D: Monto, E: Fecha, F: Status, G: IVA, H: Comision, I: Folio
      if (row[1] == userId) {
        facturas.push({
          id: row[0],
          userId: row[1],
          clienteId: row[2],
          monto: row[3],
          fecha: row[4] instanceof Date ? Utilities.formatDate(row[4], 'GMT-6', 'dd/MM/yyyy HH:mm') : row[4],
          status: row[5],
          iva: row[6],
          comision: row[7],
          folio: row[8] || '',
          rfcReceptor: row[9] || '',
          nombreReceptor: row[10] || '',
          usoCFDI: row[11] || 'G03',
          regimenFiscal: row[12] || '601',
          descripcion: row[13] || ''
        });
      }
    }
    
    // Sort by date descending (most recent first)
    facturas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    Logger.log('✅ Facturas recuperadas: ' + facturas.length);
    
    return {
      success: true,
      facturas: facturas,
      total: facturas.length
    };
    
  } catch (e) {
    Logger.log('Error en getFacturas: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      facturas: []
    };
  }
}

/**
 * Descarga una factura en formato XML
 * @param {string} facturaId - ID de la factura
 */
function downloadFactura(facturaId) {
  try {
    Logger.log('=== downloadFactura function ===');
    Logger.log('facturaId: ' + facturaId);
    
    const ss = SpreadsheetApp.getActive();
    const facturasSheet = ss.getSheetByName(SHEETS.FACTURAS);
    
    if (!facturasSheet) {
      throw new Error('Hoja de Facturas no encontrada');
    }
    
    const data = facturasSheet.getDataRange().getValues();
    
    // Buscar la factura por ID
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] == facturaId) {
        const factura = {
          id: row[0],
          userId: row[1],
          clienteId: row[2],
          monto: row[3],
          fecha: row[4] instanceof Date ? Utilities.formatDate(row[4], 'GMT-6', 'yyyy-MM-dd HH:mm:ss') : row[4],
          status: row[5],
          iva: row[6],
          comision: row[7],
          folio: row[8],
          rfcReceptor: row[9] || '',
          nombreReceptor: row[10] || '',
          usoCFDI: row[11] || 'G03',
          regimenFiscal: row[12] || '601',
          descripcion: row[13] || ''
        };
        
        Logger.log('✅ Factura encontrada: ' + factura.folio);
        
        // Generar contenido XML CFDI simulado
        const xmlContent = generateCFDIXML(factura);
        
        // Intentar generar PDF (puede fallar si no hay permisos)
        let pdfBase64 = null;
        let pdfName = null;
        try {
          const pdfBlob = generateInvoicePDF(factura);
          pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
          pdfName = `Factura_${factura.folio || factura.id.substring(0, 8)}.pdf`;
        } catch (pdfError) {
          Logger.log('⚠️ PDF no disponible: ' + pdfError.message);
        }
        
        return {
          success: true,
          factura: factura,
          xml: xmlContent,
          pdf: pdfBase64,
          pdfName: pdfName,
          mensaje: pdfBase64 ? 'Factura encontrada' : 'Factura encontrada (PDF no disponible)'
        };
      }
    }
    
    throw new Error('Factura no encontrada');
    
  } catch (e) {
    Logger.log('Error en downloadFactura: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Genera un XML CFDI 4.0 simulado
 */
function generateCFDIXML(factura) {
  const uuid = Utilities.getUuid();
  const fecha = new Date();
  const fechaStr = Utilities.formatDate(fecha, 'GMT-6', "yyyy-MM-dd'T'HH:mm:ss");
  const noCertificado = '00001000000400000000';
  const sello = 'SIMULADO_SELLO_CFDI' + uuid;
  
  const subtotal = factura.monto;
  const iva = factura.iva || (subtotal * 0.16);
  const total = subtotal + iva;
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Serie="${factura.folio || 'CFDI'}" Folio="${factura.id.substring(0, 8)}" Fecha="${fechaStr}" Sello="${sello}" NoCertificado="${noCertificado}" Certificado="${noCertificado}" SubTotal="${subtotal.toFixed(2)}" Descuento="0.00" Moneda="MXN" TipoCambio="1" Total="${total.toFixed(2)}" FormaPago="01" MetodoPago="PUE" TipoDeComprobante="I" Exportacion="01" Confirmacion="">
  <cfdi:Emisor Rfc="XAXX010101000" Nombre="CONT-AI CONTABILIDAD INTELIGENTE S.A. DE C.V." RegimenFiscal="601" FacAtrAdquirente=""/>
  <cfdi:Receptor Rfc="${factura.rfcReceptor || 'XAXX010101000'}" Nombre="${factura.nombreReceptor || 'PUBLICO GENERAL'}" DomicilioFiscalReceptor="00000" RegimenFiscalReceptor="${factura.regimenFiscal || '601'}" UsoCFDI="${factura.usoCFDI || 'G03'}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111506" NoIdentificacion="${factura.id.substring(0, 8)}" Cantidad="1" ClaveUnidad="E48" Unidad="Servicio" Descripcion="${factura.descripcion || 'Servicios de consultoría'}" ValorUnitario="${subtotal.toFixed(2)}" Importe="${subtotal.toFixed(2)}" ObjetoImp="02"/>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${iva.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.16" Importe="${iva.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="${uuid}" FechaTimbrado="${fechaStr}" RfcProvCertif="${noCertificado}" SelloCFD="${sello}" NoCertificadoSAT="${noCertificado}" SelloSAT="${sello}_SAT"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;
  
  return xml;
}

/**
 * Genera un PDF de la factura en formato profesional
 * Intenta usar HtmlService primero, luego DocumentApp como fallback
 */
function generateInvoicePDF(factura) {
  const uuid = Utilities.getUuid();
  const fecha = new Date();
  const fechaStr = Utilities.formatDate(fecha, 'GMT-6', 'dd/MM/yyyy HH:mm:ss');
  
  const subtotal = factura.monto;
  const iva = factura.iva || (subtotal * 0.16);
  const total = subtotal + iva;
  
  // Create HTML content for the invoice
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; color: #0066cc; }
    .invoice-title { font-size: 28px; font-weight: bold; color: #333; text-align: right; }
    .invoice-number { font-size: 14px; color: #666; text-align: right; }
    .section { margin: 20px 0; }
    .section-title { font-size: 14px; font-weight: bold; color: #0066cc; margin-bottom: 10px; text-transform: uppercase; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-box { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .info-label { font-size: 11px; color: #666; text-transform: uppercase; }
    .info-value { font-size: 14px; font-weight: bold; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #0066cc; color: white; padding: 12px; text-align: left; font-size: 12px; }
    td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 13px; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; text-align: right; }
    .totals-row { display: flex; justify-content: flex-end; padding: 8px 0; }
    .totals-label { width: 150px; font-size: 14px; color: #666; }
    .totals-value { width: 120px; font-size: 14px; font-weight: bold; }
    .total-row { background: #0066cc; color: white; padding: 15px; border-radius: 5px; }
    .total-row .totals-label, .total-row .totals-value { color: white; font-size: 18px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666; text-align: center; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-timbrada { background: #d4edda; color: #155724; }
    .status-pendiente { background: #fff3cd; color: #856404; }
    .status-pagada { background: #d1ecf1; color: #0c5460; }
    .status-cancelada { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">CONT-AI</div>
      <div style="font-size: 14px; color: #666;">Contabilidad Inteligente S.A. de C.V.</div>
      <div style="font-size: 12px; color: #999;">RFC: XAXX010101000</div>
      <div style="font-size: 12px; color: #999;">Régimen Fiscal: 601 - General Ley Personas Morales</div>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-number">Folio: ${factura.folio || 'CFDI-' + (factura.id ? factura.id.substring(0, 8) : 'N/A')}</div>
      <div style="font-size: 12px; color: #666;">Fecha: ${factura.fecha || fechaStr}</div>
      <span class="status status-${factura.status || 'pendiente'}">${(factura.status || 'pendiente').toUpperCase()}</span>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Datos del Receptor</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">RFC</div>
        <div class="info-value">${factura.rfcReceptor || 'XAXX010101000'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Nombre / Razón Social</div>
        <div class="info-value">${factura.nombreReceptor || 'PÚBLICO GENERAL'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Régimen Fiscal</div>
        <div class="info-value">${factura.regimenFiscal || '601'} - General Ley Personas Morales</div>
      </div>
      <div class="info-box">
        <div class="info-label">Uso CFDI</div>
        <div class="info-value">${factura.usoCFDI || 'G03'} - Gastos en General</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Conceptos</div>
    <table>
      <thead>
        <tr>
          <th>Clave</th>
          <th>Descripción</th>
          <th class="text-right">Cantidad</th>
          <th class="text-right">Unitario</th>
          <th class="text-right">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>84111506</td>
          <td>${factura.descripcion || 'Servicios de consultoría'}</td>
          <td class="text-right">1</td>
          <td class="text-right">${subtotal.toFixed(2)}</td>
          <td class="text-right">${subtotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="totals">
    <div class="totals-row">
      <div class="totals-label">Subtotal:</div>
      <div class="totals-value">${subtotal.toFixed(2)}</div>
    </div>
    <div class="totals-row">
      <div class="totals-label">IVA (16%):</div>
      <div class="totals-value">${iva.toFixed(2)}</div>
    </div>
    <div class="totals-row total-row">
      <div class="totals-label">TOTAL:</div>
      <div class="totals-value">${total.toFixed(2)}</div>
    </div>
  </div>
  
  <div class="section" style="margin-top: 30px;">
    <div class="section-title">Datos del CFDI</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">UUID (Folio Fiscal)</div>
        <div class="info-value" style="font-size: 11px;">${uuid}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Fecha de Timbrado</div>
        <div class="info-value">${fechaStr}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Número de Certificado</div>
        <div class="info-value">00001000000400000000</div>
      </div>
      <div class="info-box">
        <div class="info-label">Versión CFDI</div>
        <div class="info-value">4.0</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Este documento es una representación impresa de un CFDI 4.0</p>
    <p>CONT-AI Contabilidad Inteligente S.A. de C.V. | www.cont-ai.com</p>
    <p>Este comprobante no tiene efectos fiscales reales - Es una simulación para propósitos de demostración</p>
  </div>
</body>
</html>`;
  
  // Try using HtmlService first (no extra permissions needed)
  try {
    const htmlOutput = HtmlService.createHtmlOutput(htmlContent);
    const pdfBlob = htmlOutput.getAs('application/pdf');
    pdfBlob.setName(`Factura_${factura.folio || factura.id}.pdf`);
    return pdfBlob;
  } catch (e) {
    // Fallback: Try DocumentApp if HtmlService fails
    try {
      const tempDoc = DocumentApp.create('TempInvoice_' + uuid);
      const tempDocBody = tempDoc.getBody();
      tempDocBody.setHtmlContent(htmlContent);
      tempDoc.saveAndClose();
      const pdfBlob = tempDoc.getAs('application/pdf');
      pdfBlob.setName(`Factura_${factura.folio || factura.id}.pdf`);
      DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
      return pdfBlob;
    } catch (e2) {
      Logger.log('Error generating PDF: ' + e2.message);
      throw new Error('PDF no disponible: ' + e2.message);
    }
  }
}

// =====================================================
// FUNCIONES DE NEGOCIO - ALERTAS
// =====================================================
function getAlertas(userId) {
  const ss = SpreadsheetApp.getActive();
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
  const ss = SpreadsheetApp.getActive();
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
  const ss = SpreadsheetApp.getActive();
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
  const ss = SpreadsheetApp.getActive();
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
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Usuarios');
  // Añadir encabezado en columna 10 (J)
  sheet.getRange(1, 10).setValue('CarpetaID');
}

/**
 * Crea carpetas en Google Drive para TODOS los usuarios que no tienen
 * Ejecutar esta función UNA VEZ para crear las carpetas de todos los usuarios
 */
function crearCarpetasParaUsuarios() {
  const ss = SpreadsheetApp.getActive();
  const userSheet = ss.getSheetByName('Usuarios');
  
  if (!userSheet) {
    Logger.log('❌ Hoja Usuarios no encontrada');
    return;
  }
  
  const userData = userSheet.getDataRange().getValues();
  const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  
  Logger.log('=== Creando carpetas para usuarios ===');
  Logger.log('Total de usuarios: ' + (userData.length - 1));
  
  let creadas = 0;
  let existentes = 0;
  let errores = 0;
  
  for (let i = 1; i < userData.length; i++) {
    const userId = userData[i][0]; // Columna A
    const nombre = userData[i][1]; // Columna B
    const carpetaId = userData[i][9]; // Columna J (índice 9)
    
    if (!carpetaId || carpetaId === '' || carpetaId === null) {
      try {
        // Crear carpeta para este usuario
        const folderName = `${userId} - ${nombre}`;
        const newFolder = parentFolder.createFolder(folderName);
        const newFolderId = newFolder.getId();
        
        // Guardar el ID en la hoja (Columna J = columna 10)
        userSheet.getRange(i + 1, 10).setValue(newFolderId);
        
        Logger.log(`✅ Carpeta creada para ${userId} (${nombre}): ${newFolderId}`);
        creadas++;
        
        // Pequeña pausa para evitar límites de API
        Utilities.sleep(100);
      } catch (e) {
        Logger.log(`❌ Error creando carpeta para ${userId}: ${e.message}`);
        errores++;
      }
    } else {
      Logger.log(`⏭️  Usuario ${userId} ya tiene carpeta: ${carpetaId}`);
      existentes++;
    }
  }
  
  Logger.log('=== Resumen ===');
  Logger.log(`✅ Carpetas creadas: ${creadas}`);
  Logger.log(`⏭️  Carpetas existentes: ${existentes}`);
  Logger.log(`❌ Errores: ${errores}`);
  Logger.log('=== Proceso completado ===');
}

/**
 * Crea carpeta para un usuario específico (se usa automáticamente al registrar)
 */
function createUserFolder(userId, nombre) {
  try {
    const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const folderName = `${userId} - ${nombre}`;
    const newFolder = parentFolder.createFolder(folderName);
    return newFolder.getId();
  } catch (error) {
    Logger.log('Error al crear carpeta para usuario: ' + error.message);
    return null;
  }
}

// =====================================================
// FUNCIONES PARA CONTADOR - CLIENTES VINCULADOS
// =====================================================

/**
 * Obtiene todos los clientes vinculados a un contador
 * @param {string} contadorId - ID del contador
 */
function getLinkedClients(contadorId) {
  try {
    const ss = SpreadsheetApp.getActive();
    const userSheet = ss.getSheetByName(SHEETS.USUARIOS);
    const gastosSheet = ss.getSheetByName(SHEETS.GASTOS);
    
    const usersData = userSheet.getDataRange().getValues();
    const gastosData = gastosSheet ? gastosSheet.getDataRange().getValues() : [];
    
    // Buscar el código del contador
    let contadorCode = '';
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][0] === contadorId && usersData[i][2] === 'contador') {
        contadorCode = usersData[i][6]; // Columna G - contadorCode
        break;
      }
    }
    
    if (!contadorCode) {
      return { success: false, error: 'Contador no encontrado' };
    }
    
    // Buscar clientes vinculados con este código
    const clientes = [];
    for (let i = 1; i < usersData.length; i++) {
      const row = usersData[i];
      if (row[2] === 'usuario' && row[7] === contadorCode) { // Columna H - linkedContadorCode
        const userId = row[0];
        
        // Contar gastos del cliente
        let gastosCount = 0;
        let totalGastos = 0;
        for (let j = 1; j < gastosData.length; j++) {
          if (gastosData[j][1] === userId) { // Columna B - userId
            gastosCount++;
            totalGastos += Number(gastosData[j][3]) || 0; // Columna D - monto
          }
        }
        
        // Calcular score fiscal simple
        const scoreFiscal = calcularScoreFiscal(userId, gastosData);
        
        clientes.push({
          id: userId,
          nombre: row[1],
          email: row[4],
          rfc: row[3],
          code: row[6] || '', // usuarioCode
          status: 'activo',
          linkedAt: row[8] ? new Date(row[8]).toLocaleDateString('es-MX') : 'N/A',
          gastosCount: gastosCount,
          totalGastos: totalGastos,
          scoreFiscal: scoreFiscal
        });
      }
    }
    
    return { success: true, data: clientes };
  } catch (error) {
    Logger.log('Error obteniendo clientes vinculados: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtiene información completa de un cliente
 * @param {string} clientId - ID del cliente
 */
function getClient(clientId) {
  try {
    const ss = SpreadsheetApp.getActive();
    const userSheet = ss.getSheetByName(SHEETS.USUARIOS);
    const data = userSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === clientId && row[2] === 'usuario') {
        return {
          success: true,
          data: {
            id: row[0],
            nombre: row[1],
            email: row[4],
            rfc: row[3],
            code: row[6] || '',
            status: 'activo',
            linkedAt: row[8] ? new Date(row[8]).toLocaleDateString('es-MX') : 'N/A'
          }
        };
      }
    }
    
    return { success: false, error: 'Cliente no encontrado' };
  } catch (error) {
    Logger.log('Error obteniendo cliente: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtiene los gastos de un cliente
 * @param {string} clientId - ID del cliente
 * @param {number} limit - Límite de gastos a retornar
 */
function getClientGastos(clientId, limit = 50) {
  try {
    const ss = SpreadsheetApp.getActive();
    const gastosSheet = ss.getSheetByName(SHEETS.GASTOS);
    
    if (!gastosSheet) {
      return { success: false, error: 'No hay gastos registrados' };
    }
    
    const data = gastosSheet.getDataRange().getValues();
    const gastos = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] === clientId) { // Columna B - userId
        gastos.push({
          id: row[0],
          descripcion: row[2] || '',
          monto: Number(row[3]) || 0,
          fecha: row[4] ? new Date(row[4]).toLocaleDateString('es-MX') : '',
          categoria: row[5] || 'Sin categoría',
          iva: Number(row[6]) || 0,
          retenido: Number(row[7]) || 0,
          tieneXML: row[8] === 'true' || row[8] === true
        });
        
        if (gastos.length >= limit) break;
      }
    }
    
    return { success: true, data: gastos };
  } catch (error) {
    Logger.log('Error obteniendo gastos del cliente: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Calcula un score fiscal simple para un cliente
 */
function calcularScoreFiscal(userId, gastosData) {
  let score = 70; // Score base
  
  let gastosConXML = 0;
  let gastosTotales = 0;
  
  for (let i = 1; i < gastosData.length; i++) {
    if (gastosData[i][1] === userId) {
      gastosTotales++;
      if (gastosData[i][8] === 'true' || gastosData[i][8] === true) {
        gastosConXML++;
      }
    }
  }
  
  if (gastosTotales > 0) {
    const porcentajeXML = (gastosConXML / gastosTotales) * 100;
    score += Math.floor(porcentajeXML / 10); // Hasta +10 puntos por XMLs
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Guarda notas privadas del contador sobre un cliente
 * @param {string} contadorId - ID del contador
 * @param {string} clientId - ID del cliente
 * @param {string} notes - Notas a guardar
 */
function saveContadorNotes(contadorId, clientId, notes) {
  try {
    const ss = SpreadsheetApp.getActive();
    let notesSheet = ss.getSheetByName('ContadorNotas');
    
    // Crear sheet si no existe
    if (!notesSheet) {
      notesSheet = ss.insertSheet('ContadorNotas');
      notesSheet.appendRow(['ContadorID', 'ClienteID', 'Notes', 'UpdatedAt']);
    }
    
    const data = notesSheet.getDataRange().getValues();
    let found = false;
    
    // Buscar si ya existe registro
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === contadorId && data[i][1] === clientId) {
        notesSheet.getRange(i + 1, 3).setValue(notes);
        notesSheet.getRange(i + 1, 4).setValue(new Date());
        found = true;
        break;
      }
    }
    
    // Si no existe, crear nuevo registro
    if (!found) {
      notesSheet.appendRow([contadorId, clientId, notes, new Date()]);
    }
    
    return { success: true, message: 'Notas guardadas' };
  } catch (error) {
    Logger.log('Error guardando notas: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtiene notas privadas del contador sobre un cliente
 * @param {string} contadorId - ID del contador
 * @param {string} clientId - ID del cliente
 */
function getContadorNotes(contadorId, clientId) {
  try {
    const ss = SpreadsheetApp.getActive();
    const notesSheet = ss.getSheetByName('ContadorNotas');
    
    if (!notesSheet) {
      return { success: true, data: '' };
    }
    
    const data = notesSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === contadorId && data[i][1] === clientId) {
        return { success: true, data: data[i][2] || '' };
      }
    }
    
    return { success: true, data: '' };
  } catch (error) {
    Logger.log('Error obteniendo notas: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtiene el código único de un contador
 * @param {string} userId - ID del contador
 */
function getContadorCode(userId) {
  try {
    const ss = SpreadsheetApp.getActive();
    const userSheet = ss.getSheetByName(SHEETS.USUARIOS);
    const data = userSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return { 
          success: true, 
          contadorCode: data[i][6] || '' // Columna G
        };
      }
    }
    return { success: false, error: 'Usuario no encontrado' };
  } catch (error) {
    Logger.log('Error en getContadorCode: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Genera un código corto y legible para contadores (ej: CONT-X821)
 */
function generateShortContadorCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evitar 0, O, 1, I para evitar confusiones
  let code = 'CONT-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// FIN DEL ARCHIVO
