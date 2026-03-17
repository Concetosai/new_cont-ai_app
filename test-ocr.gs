/**
 * TEST SCRIPT - Verificar Google Cloud Vision OCR
 * 
 * Instrucciones:
 * 1. Copia este código en un archivo nuevo en Google Apps Script
 * 2. Ejecuta la función testGoogleVisionOCR()
 * 3. Revisa los logs para ver si el OCR está funcionando
 */

// NOTA: GOOGLE_VISION_API_KEY ya está declarada en Code.gs
// No es necesario declararla aquí

/**
 * @OnlyCurrentDoc
 * @OnlyRequest
 * @RequestForExternalResource
 */

/**
 * Función principal de TEST
 */
function testGoogleVisionOCR() {
  Logger.log('=== INICIANDO TEST DE GOOGLE CLOUD VISION OCR ===\n');
  
  // Imagen de prueba (base64) - Un ticket real
  // Puedes reemplazar esto con una imagen de prueba
  const testImageBase64 = getTestImageBase64();
  
  if (!testImageBase64) {
    Logger.log('❌ ERROR: No hay imagen de prueba disponible');
    return;
  }
  
  Logger.log('✅ Imagen de prueba cargada (' + testImageBase64.length + ' caracteres)\n');
  
  // Llamar a Google Cloud Vision API
  Logger.log('📡 Llamando a Google Cloud Vision API...\n');
  
  try {
    const ocrResult = callGoogleVisionApi(testImageBase64);
    
    if (!ocrResult) {
      Logger.log('❌ ERROR: No se recibió respuesta de la API');
      return;
    }
    
    Logger.log('✅ Respuesta recibida de Google Cloud Vision\n');
    
    // Verificar si hay texto
    const textAnnotations = ocrResult.textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      Logger.log('❌ ERROR: No se detectó texto en la imagen');
      Logger.log('Respuesta completa: ' + JSON.stringify(ocrResult));
      return;
    }
    
    // Mostrar el texto extraído
    const fullText = textAnnotations[0].description || '';
    
    Logger.log('=== TEXTO EXTRAÍDO DEL TICKET ===\n');
    Logger.log(fullText);
    Logger.log('\n=== FIN DEL TEXTO EXTRAÍDO ===\n');
    
    // Parsear el texto
    Logger.log('=== PARSEANDO DATOS ===\n');
    const parsedData = parseReceipt(fullText);
    
    Logger.log('Proveedor: ' + parsedData.proveedor);
    Logger.log('Monto: ' + parsedData.monto);
    Logger.log('Fecha: ' + parsedData.fecha);
    Logger.log('RFC: ' + parsedData.rfc);
    Logger.log('Categoría: ' + parsedData.categoria);
    
    Logger.log('\n=== TEST COMPLETADO ===');
    
    // Verificar si los datos son reales o mock
    if (parsedData.proveedor.includes('Ejemplo') || 
        parsedData.rfc.includes('RFC123') ||
        parsedData.monto > 10000) {
      Logger.log('\n⚠️  ADVERTENCIA: Los datos parecen ser MOCK, no reales');
      Logger.log('El OCR podría no estar funcionando correctamente');
    } else {
      Logger.log('\n✅ ÉXITO: El OCR está funcionando correctamente!');
    }
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Llama a Google Cloud Vision API
 */
function callGoogleVisionApi(base64Image) {
  const apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_VISION_API_KEY;
  
  const requestBody = {
    requests: [{
      image: {
        content: base64Image.replace(/^data:image\/[a-z]+;base64,/, '')
      },
      features: [{
        type: 'TEXT_DETECTION',
        maxResults: 1
      }]
    }]
  };
  
  Logger.log('URL: ' + apiUrl);
  Logger.log('Request body size: ' + JSON.stringify(requestBody).length + ' bytes\n');
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(apiUrl, options);
  const responseCode = response.getResponseCode();
  
  Logger.log('Código de respuesta HTTP: ' + responseCode);
  
  const result = JSON.parse(response.getContentText());
  
  if (result.error) {
    Logger.log('❌ ERROR de la API: ' + JSON.stringify(result.error));
    throw new Error('Google Vision Error: ' + result.error.message);
  }
  
  return result.responses[0];
}

/**
 * Parsea el texto del ticket para extraer datos
 */
function parseReceipt(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let proveedor = '';
  let monto = 0;
  let fecha = '';
  let rfc = '';
  let categoria = 'Otros';
  
  // RFC mexicano pattern
  const rfcPattern = /[A-ZÑ&]{3,4}\d{2}[0-1][0-9][0-3][0-9][A-Z0-9]{2,3}/;
  const rfcMatch = text.match(rfcPattern);
  if (rfcMatch) {
    rfc = rfcMatch[0];
    Logger.log('✅ RFC encontrado: ' + rfc);
  }
  
  // Fecha pattern
  const fechaPatterns = [
    /\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/,
    /\d{2}[\/\-][A-Za-z]{3}[\/\-]\d{2,4}/i
  ];
  
  for (const pattern of fechaPatterns) {
    const fechaMatch = text.match(pattern);
    if (fechaMatch) {
      fecha = fechaMatch[0];
      Logger.log('✅ Fecha encontrada: ' + fecha);
      break;
    }
  }
  
  // Monto pattern (buscar TOTAL)
  const montoPatterns = [
    /total[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /importe[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)/
  ];
  
  for (const pattern of montoPatterns) {
    const montoMatch = text.match(pattern);
    if (montoMatch) {
      monto = parseFloat(montoMatch[1].replace(/,/g, ''));
      Logger.log('✅ Monto encontrado: ' + monto);
      break;
    }
  }
  
  // Proveedor (primera línea significativa)
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && 
        !line.includes('RFC') && 
        !line.includes('FECHA') &&
        !line.includes('FOLIO') &&
        !line.includes('TICKET') &&
        !line.includes('FACTURA')) {
      proveedor = line;
      Logger.log('✅ Proveedor encontrado: ' + proveedor);
      break;
    }
  }
  
  // Categoría
  const lowerText = text.toLowerCase();
  if (lowerText.includes('restaurante') || lowerText.includes('comida') || lowerText.includes('rest')) {
    categoria = 'Restaurante';
  } else if (lowerText.includes('gasolina') || lowerText.includes('pemex')) {
    categoria = 'Gasolina';
  } else if (lowerText.includes('farmacia') || lowerText.includes('medicamento')) {
    categoria = 'Medicamentos';
  }
  
  return {
    proveedor: proveedor || 'Proveedor desconocido',
    monto: monto || 0,
    fecha: fecha || '',
    rfc: rfc || '',
    categoria: categoria
  };
}

/**
 * Obtiene una imagen de prueba en base64
 * Puedes reemplazar esto con una imagen real
 */
function getTestImageBase64() {
  // Opción 1: Usar una imagen de URL pública
  try {
    const imageUrl = 'https://raw.githubusercontent.com/tesseract-ocr/tessdoc/main/testing/eurotext.png';
    const response = UrlFetchApp.fetch(imageUrl, { muteHttpExceptions: true });
    const blob = response.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    return base64;
  } catch (e) {
    Logger.log('Error al cargar imagen de prueba: ' + e.message);
    return null;
  }
}

/**
 * Función alternativa para probar con una imagen específica
 * Usa esta función si quieres probar con una imagen específica
 */
function testWithSpecificImage(imageUrl) {
  Logger.log('=== TEST CON IMAGEN ESPECÍFICA ===\n');
  Logger.log('URL: ' + imageUrl + '\n');
  
  try {
    const response = UrlFetchApp.fetch(imageUrl, { muteHttpExceptions: true });
    const blob = response.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    
    Logger.log('✅ Imagen cargada (' + base64.length + ' caracteres)\n');
    
    const ocrResult = callGoogleVisionApi(base64);
    const fullText = ocrResult.textAnnotations[0]?.description || '';
    
    Logger.log('=== TEXTO EXTRAÍDO ===\n');
    Logger.log(fullText);
    Logger.log('\n=== FIN DEL TEXTO ===\n');
    
    const parsedData = parseReceipt(fullText);
    
    Logger.log('Proveedor: ' + parsedData.proveedor);
    Logger.log('Monto: ' + parsedData.monto);
    Logger.log('Fecha: ' + parsedData.fecha);
    Logger.log('RFC: ' + parsedData.rfc);
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}
