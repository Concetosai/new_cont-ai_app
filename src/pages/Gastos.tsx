import { useState, useCallback } from "react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, FileText, CheckCircle, AlertCircle, Edit3, History, TrendingUp } from "lucide-react";
import Tesseract from 'tesseract.js';
import heic2any from "heic2any";
import contAiApi from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema de validación para el gasto
const gastoSchema = z.object({
  proveedor: z.string().min(1, "El proveedor es obligatorio"),
  monto: z.number({ invalid_type_error: "Monto inválido" }).positive("Debe ser mayor a 0"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  rfc: z.string().optional(),
  folio: z.string().optional(),
  categoria: z.string().min(1, "Selecciona una categoría"),
});

type GastoFormValues = z.infer<typeof gastoSchema>;

const categorias = [
  "Telecomunicaciones",
  "Papelería",
  "Transporte",
  "Combustible",
  "Restaurante",
  "Hotel",
  "Servicios",
  "Materiales",
  "Equipo",
  "Otros",
];

export default function Gastos() {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<Partial<GastoFormValues> | null>(null);
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [isSaving, setIsSaving] = useState(false);
  const [savedFileId, setSavedFileId] = useState<string | null>(null);
  const [gastosHistory, setGastosHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const form = useForm<GastoFormValues>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      proveedor: "",
      monto: 0,
      fecha: new Date().toISOString().split("T")[0],
      rfc: "",
      folio: "",
      categoria: "",
    },
  });

  // Obtener userId
  const getUserId = (): string => {
    return localStorage.getItem('userId') || '';
  };

  // Cargar historial de gastos
  const loadGastosHistory = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    setIsLoadingHistory(true);
    try {
      const response = await contAiApi.getGastos(userId, 20);
      if (response.success && response.data) {
        setGastosHistory(response.data.gastos || []);
      }
    } catch (error) {
      console.error('Error loading gastos history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Cargar historial al montar el componente
  React.useEffect(() => {
    loadGastosHistory();
  }, [loadGastosHistory]);

  // Convertir File a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
    });
  };

  // Convertir HEIC a JPEG si es necesario
  const processFile = async (inputFile: File): Promise<File> => {
    if (inputFile.type === "image/heic" || inputFile.name.toLowerCase().endsWith(".heic")) {
      try {
        toast.info("Convirtiendo archivo HEIC...");
        const convertedBlob = await heic2any({ blob: inputFile, toType: "image/jpeg" });
        const convertedFile = new File(
          [convertedBlob as Blob],
          inputFile.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );
        toast.success("Archivo HEIC convertido a JPEG");
        return convertedFile;
      } catch (error) {
        toast.error("Error al convertir HEIC. Intenta con otro formato.");
        throw error;
      }
    }
    return inputFile;
  };

  // Convertir fecha a formato yyyy-MM-dd
  const parseFecha = (fechaRaw: string): string => {
    try {
      let day, month, year;
      
      // Intentar diferentes formatos
      const patterns = [
        // DD/MM/YYYY o DD-MM-YYYY
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        // DD-MMM-YYYY (ej: 01-Feb-2018)
        /(\d{1,2})[\/\-]([A-Za-z]{3})[\/\-](\d{2,4})/i,
        // DD de MMMM de YYYY (ej: 15 de marzo de 2024)
        /(\d{1,2}) de ([A-Za-z]+) de (\d{4})/i
      ];
      
      for (const pattern of patterns) {
        const match = fechaRaw.match(pattern);
        if (match) {
          if (pattern.toString().includes('de')) {
            // Formato: DD de MMMM de YYYY
            day = parseInt(match[1]);
            const monthNames: { [key: string]: number } = {
              'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
              'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
              'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
            };
            month = monthNames[match[2].toLowerCase()] || parseInt(match[2]);
            year = parseInt(match[3]);
          } else if (pattern.toString().includes('[A-Za-z]{3}')) {
            // Formato: DD-MMM-YYYY
            day = parseInt(match[1]);
            const monthShortNames: { [key: string]: number } = {
              'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6,
              'jul': 7, 'ago': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dic': 12
            };
            month = monthShortNames[match[2].toLowerCase()] || parseInt(match[2]);
            year = parseInt(match[3]);
          } else {
            // Formato: DD/MM/YYYY
            day = parseInt(match[1]);
            month = parseInt(match[2]);
            year = parseInt(match[3]);
          }
          
          // Ajustar año de 2 dígitos a 4 dígitos
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          
          // Retornar en formato yyyy-MM-dd
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      }
      
      // Si no se pudo parsear, retornar fecha actual
      return new Date().toISOString().split('T')[0];
    } catch (e) {
      // Si hay error, retornar fecha actual
      return new Date().toISOString().split('T')[0];
    }
  };

  // Parsear texto extraído del OCR para obtener datos del ticket
  const parseReceiptText = (text: string): Partial<GastoFormValues> => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let proveedor = '';
    let monto = 0;
    let fecha = '';
    let rfc = '';
    let folio = '';
    let categoria = '';

    // Buscar RFC (formato mexicano)
    const rfcRegex = /[A-ZÑ&]{3,4}\d{2}[0-1][0-9][0-3][0-9][A-Z0-9]{2,3}/;
    const rfcMatch = text.match(rfcRegex);
    if (rfcMatch) {
      rfc = rfcMatch[0];
    }

    // Buscar Folio (patrones comunes)
    const folioPatterns = [
      /folio[:\s]*([A-Z0-9\-]+)/i,
      /factura[:\s]*([A-Z0-9\-]+)/i,
      /recibo[:\s]*([A-Z0-9\-]+)/i,
      /serie[:\s]*([A-Z0-9\-]+)/i,
      /no\.\s*([A-Z0-9\-]+)/i,
      /n[ºo]\s*([A-Z0-9\-]+)/i,
      /folio\s+fiscal[:\s]*([A-Z0-9\-]+)/i
    ];
    
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
        if (/^[A-Z]{1,3}\d{4,10}$/i.test(line) || /^\d{6,12}$/i.test(line)) {
          folio = line.toUpperCase();
          break;
        }
      }
    }

    // Buscar fecha (formatos comunes)
    const fechaPatterns = [
      /\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/,
      /\d{2}[\/\-][A-Za-z]{3}[\/\-]\d{2,4}/i,
      /\d{1,2} de [A-Za-z]+ de \d{4}/i
    ];
    
    for (const pattern of fechaPatterns) {
      const fechaMatch = text.match(pattern);
      if (fechaMatch) {
        const fechaRaw = fechaMatch[0];
        // Convertir a formato yyyy-MM-dd
        fecha = parseFecha(fechaRaw);
        break;
      }
    }

    // Buscar total (palabras clave TOTAL, MONTO, IMPORTE)
    const montoPatterns = [
      /total[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      /importe[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      /\$\s*([\d,]+\.?\d*)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/
    ];
    
    let maxMonto = 0;
    for (const pattern of montoPatterns) {
      const montoMatch = text.match(pattern);
      if (montoMatch) {
        const valor = parseFloat(montoMatch[1].replace(/,/g, ''));
        if (valor > maxMonto && valor < 1000000) {
          maxMonto = valor;
        }
      }
    }
    monto = maxMonto;

    // Buscar proveedor (primera línea significativa)
    const ignoreWords = ['ticket', 'factura', 'nota', 'venta', 'sucursal', 'fecha', 'hora', 'total', 'subtotal', 'iva', 'importe', 'efectivo', 'tarjeta', 'cambio', 'folio', 'serie', 'rfc'];
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].toLowerCase();
      const isIgnorable = ignoreWords.some(w => line.includes(w));
      const hasNumber = /\d{5,}/.test(line);

      if (!isIgnorable && !hasNumber && lines[i].trim().length > 3) {
        proveedor = lines[i].trim();
        break;
      }
    }

    // Determinar categoría basada en palabras clave
    const lowerText = text.toLowerCase();
    const categoriasKeywords = [
      { name: 'Telecomunicaciones', keywords: ['telcel', 'telmex', 'movistar', 'att', 'telefono', 'internet'] },
      { name: 'Combustible', keywords: ['gasolina', 'pemex', 'shell', 'bp', 'combustible'] },
      { name: 'Restaurante', keywords: ['restaurante', 'cafe', 'coffee', 'comida', 'alimentos'] },
      { name: 'Papelería', keywords: ['papeleria', 'oficina', 'office', 'papel'] },
      { name: 'Transporte', keywords: ['taxi', 'uber', 'didi', 'transporte', 'metro'] },
      { name: 'Medicamentos', keywords: ['farmacia', 'medicamento', 'doctor', 'hospital', 'salud'] },
      { name: 'Servicios', keywords: ['agua', 'luz', 'gas', 'cfe', 'servicio'] }
    ];
    
    for (const cat of categoriasKeywords) {
      if (cat.keywords.some(k => lowerText.includes(k))) {
        categoria = cat.name;
        break;
      }
    }

    return {
      proveedor: proveedor || '',
      monto: monto || 0,
      fecha: fecha || new Date().toISOString().split('T')[0],
      rfc: rfc || '',
      folio: folio || '',
      categoria: categoria || ''
    };
  };

  // Escanear archivo con Tesseract.js OCR
  const scanFile = async (inputFile: File) => {
    setIsScanning(true);
    try {
      const processedFile = await processFile(inputFile);
      
      // Usar Tesseract.js para OCR local
      toast.info("Escaneando con IA (Tesseract OCR)...");
      
      const { data: { text } } = await Tesseract.recognize(
        processedFile,
        'spa', // idioma español
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`Progreso OCR: ${(m.progress * 100).toFixed(0)}%`);
            }
          }
        }
      );
      
      console.log('Texto extraído:', text);
      
      // Parsear el texto para obtener los datos
      const parsedData = parseReceiptText(text);
      
      console.log('Datos parseados:', parsedData);
      
      setScannedData(parsedData);
      form.reset({
        proveedor: parsedData.proveedor || "",
        monto: parsedData.monto || 0,
        fecha: parsedData.fecha || new Date().toISOString().split("T")[0],
        rfc: parsedData.rfc || "",
        categoria: parsedData.categoria || "",
      });
      
      if (parsedData.proveedor || parsedData.monto > 0) {
        toast.success("Datos extraídos correctamente");
      } else {
        toast.warning("Se extrajo texto pero no se detectaron datos claros. Revisa manualmente.");
      }
    } catch (error) {
      console.error("Error scanning:", error);
      toast.error("Error al escanear el archivo");
      setMode("manual");
    } finally {
      setIsScanning(false);
    }
  };

  // Dropzone configuración
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".heic", ".heif"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      await scanFile(selectedFile);
    },
  });

  // Guardar gasto
  const onSave = async (data: GastoFormValues) => {
    setIsSaving(true);
    try {
      const userId = getUserId();

      if (!userId) {
        toast.error("Usuario no autenticado");
        return;
      }

      console.log('=== GUARDANDO GASTO ===');
      console.log('userId:', userId);
      console.log('data:', data);
      console.log('file existe:', !!file);

      const gastoData: any = {
        userId,
        ...data,
        status: "pending",
      };

      // Si hay archivo, convertirlo y adjuntarlo
      if (file) {
        console.log('Convirtiendo archivo a base64...');
        const processedFile = await processFile(file);
        const base64 = await fileToBase64(processedFile);
        console.log('base64 length:', base64.length);
        gastoData.fileData = base64;
      } else {
        console.log('No hay archivo adjunto');
      }

      console.log('Enviando a backend:', gastoData);

      const response = await contAiApi.saveGasto(userId, gastoData);

      console.log('Respuesta del backend:', response);

      if (response.success) {
        // Guardar fileId para mostrar enlace - verificar ambas rutas
        const responseData = response as any;
        // La respuesta del backend está anidada: response.data.data.fileId
        const fileId = responseData.data?.fileId || responseData.data?.data?.fileId || null;
        const fileSaveError = responseData.data?.fileSaveError || responseData.data?.data?.fileSaveError || null;
        
        setSavedFileId(fileId);
        
        console.log('✅ Gasto guardado correctamente, fileId:', fileId);
        if (fileSaveError) {
          console.log('⚠️ Error guardando archivo:', fileSaveError);
          toast.error("Error al guardar archivo: " + fileSaveError);
        } else {
          toast.success("Gasto guardado correctamente");
        }
        
        // Recargar el historial después de guardar
        loadGastosHistory();
        
        // Limpiar después de un momento
        setTimeout(() => {
          setFile(null);
          setScannedData(null);
          setSavedFileId(null);
          form.reset();
        }, 3000);
      } else {
        console.error('Error en respuesta:', response);
        toast.error("Error al guardar el gasto: " + (response.error || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error saving:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error("Error al guardar: " + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Limpiar todo
  const handleReset = () => {
    setFile(null);
    setScannedData(null);
    setSavedFileId(null);
    form.reset();
    setMode("scan");
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Mis Gastos</h1>
        <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
          Escáner IA — Carga automática de comprobantes
        </p>
        <div className="vein-line w-48 mt-3" />
      </motion.div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "scan" | "manual")}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger 
            value="scan" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Escanear con IA
          </TabsTrigger>
          <TabsTrigger 
            value="manual"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Ingreso manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          {/* Dropzone */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-slate-600 hover:border-blue-500/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-400">Suelta el archivo aquí...</p>
                ) : (
                  <>
                    <p className="text-slate-300">
                      Arrastra tu ticket, recibo o factura (imagen o PDF)
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      JPG, PNG, HEIC, PDF soportados
                    </p>
                  </>
                )}
              </div>

              {file && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-300 truncate flex-1">
                    {file.name}
                  </span>
                  {isScanning && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulario con datos escaneados */}
          {(scannedData || isScanning) && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {isScanning ? "Procesando..." : "Datos extraídos"}
                </h3>
                {isScanning ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  </div>
                ) : (
                  <GastoForm
                    form={form}
                    onSubmit={onSave}
                    onCancel={handleReset}
                    isSaving={isSaving}
                    savedFileId={savedFileId}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Ingreso manual de gasto
              </h3>
              <GastoForm
                form={form}
                onSubmit={onSave}
                onCancel={handleReset}
                isSaving={isSaving}
                savedFileId={savedFileId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Historial de Gastos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>
                  Historial de Gastos
                </h2>
              </div>
              {gastosHistory.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-400/20 text-blue-400">
                  {gastosHistory.length} gastos
                </span>
              )}
            </div>

            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : gastosHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay gastos registrados aún</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gastosHistory.map((gasto, index) => (
                  <motion.div
                    key={gasto.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          gasto.status === 'approved' ? 'bg-green-400/20' : 'bg-yellow-400/20'
                        }`}>
                          {gasto.status === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-200 truncate">
                              {gasto.proveedor || 'Sin proveedor'}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              gasto.status === 'approved' 
                                ? 'bg-green-400/20 text-green-400'
                                : 'bg-yellow-400/20 text-yellow-400'
                            }`}>
                              {gasto.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                            <span>${gasto.monto?.toFixed(2) || '0.00'}</span>
                            <span>•</span>
                            <span>{gasto.categoria || 'Sin categoría'}</span>
                            <span>•</span>
                            <span>{new Date(gasto.fecha).toLocaleDateString()}</span>
                          </div>
                          {gasto.folio && (
                            <p className="text-xs text-slate-500 mt-1">
                              Folio: {gasto.folio}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
                          ${gasto.monto?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Componente de formulario reutilizable
function GastoForm({
  form,
  onSubmit,
  onCancel,
  isSaving,
  savedFileId,
}: {
  form: any;
  onSubmit: (data: GastoFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  savedFileId: string | null;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="proveedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">Proveedor</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej. Soriana, CFE, Telcel..." 
                  className="bg-slate-800/50 border-slate-700 text-slate-200"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Monto ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-slate-800/50 border-slate-700 text-slate-200"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Fecha</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-slate-800/50 border-slate-700 text-slate-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="rfc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">RFC (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="XAXX010101XXX"
                  className="bg-slate-800/50 border-slate-700 text-slate-200 uppercase"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="folio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">Folio / Referencia (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="A12345, F0001234, etc."
                  className="bg-slate-800/50 border-slate-700 text-slate-200 uppercase"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categorias.map((cat) => (
                    <SelectItem 
                      key={cat} 
                      value={cat}
                      className="text-slate-200 focus:bg-slate-700"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Link to saved file */}
        {savedFileId && (
          <a 
            href={`https://drive.google.com/file/d/${savedFileId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <FileText className="w-4 h-4" />
            Ver comprobante
          </a>
        )}

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              "Guardar gasto"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
