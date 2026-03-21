import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Send, Plus, CheckCircle, Clock, XCircle, Download, Loader2 } from "lucide-react";
import { contAiApi } from "../lib/api";
import { useToast } from "../hooks/use-toast";

// Interface for Factura
interface Factura {
  id: string;
  userId: string;
  clienteId: string;
  monto: number;
  fecha: string;
  status: "pagada" | "pendiente" | "timbrada" | "cancelada";
  iva: number;
  comision: number;
  folio: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  usoCFDI?: string;
  regimenFiscal?: string;
  descripcion?: string;
}

const statusConfig = {
  timbrada: { label: "Timbrada SAT", color: "hsl(145, 60%, 50%)", bg: "hsl(145 60% 40% / 0.1)", icon: CheckCircle },
  pendiente: { label: "Pendiente", color: "hsl(35, 95%, 55%)", bg: "hsl(35 95% 55% / 0.1)", icon: Clock },
  pagada: { label: "Pagada", color: "hsl(145, 60%, 50%)", bg: "hsl(145 60% 40% / 0.1)", icon: CheckCircle },
  cancelada: { label: "Cancelada", color: "hsl(0, 72%, 55%)", bg: "hsl(0 72% 51% / 0.1)", icon: XCircle },
};

// Get real user ID from auth
const getUserId = () => localStorage.getItem('userId') || "";

export default function Facturacion() {
  const userId = getUserId();
  const [showNew, setShowNew] = useState(false);
  const [invoices, setInvoices] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    rfcReceptor: "",
    nombreReceptor: "",
    usoCFDI: "G03",
    regimenFiscal: "601",
    descripcion: "",
    monto: "",
    clienteId: "",
    status: "pendiente"
  });

  // Load invoices on mount
  useEffect(() => {
    loadFacturas();
  }, []);

  const loadFacturas = async () => {
    try {
      setLoading(true);
      const response = await contAiApi.getFacturas(userId);
      if (response.success && response.data) {
        const facturas = response.data.facturas || [];
        setInvoices(facturas);
      }
    } catch (error) {
      console.error("Error loading facturas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.rfcReceptor || !formData.nombreReceptor || !formData.monto) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa RFC, Nombre y Monto",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      const response = await contAiApi.saveFactura({
        userId: userId,
        clienteId: formData.clienteId || `CLIENTE_${formData.rfcReceptor}`,
        monto: parseFloat(formData.monto),
        status: formData.status,
        rfcReceptor: formData.rfcReceptor,
        nombreReceptor: formData.nombreReceptor,
        usoCFDI: formData.usoCFDI,
        regimenFiscal: formData.regimenFiscal,
        descripcion: formData.descripcion
      });

      if (response.success) {
        toast({
          title: "Factura guardada",
          description: `Folio: ${response.data?.folio || 'N/A'}`,
          variant: "default"
        });
        
        // Reset form
        setFormData({
          rfcReceptor: "",
          nombreReceptor: "",
          usoCFDI: "G03",
          regimenFiscal: "601",
          descripcion: "",
          monto: "",
          clienteId: "",
          status: "pendiente"
        });
        
        // Close form and reload invoices
        setShowNew(false);
        loadFacturas();
      } else {
        throw new Error(response.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving factura:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la factura",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (facturaId: string, folio: string) => {
    try {
      console.log('Downloading factura with ID:', facturaId);
      
      const response = await contAiApi.downloadFactura(facturaId);
      console.log('Download response:', JSON.stringify(response, null, 2));
      
      // Check for nested success (backend wraps responses with { success, data })
      if (response.success && response.data && response.data.success) {
        // Try PDF first, fallback to XML
        if (response.data.pdf) {
          // Decode base64 PDF and download
          const pdfBase64 = response.data.pdf;
          const pdfName = response.data.pdfName || `Factura_${folio || facturaId.substring(0, 8)}.pdf`;
          
          // Convert base64 to binary
          const binaryString = atob(pdfBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create blob and download
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = pdfName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Descarga completada",
            description: `Factura ${folio} descargada exitosamente`,
            variant: "default"
          });
        } else if (response.data.xml) {
          // Fallback to XML if PDF not available
          const xmlContent = response.data.xml;
          const blob = new Blob([xmlContent], { type: 'application/xml' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `${folio || 'factura'}_${facturaId.substring(0, 8)}.xml`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Descarga completada (XML)",
            description: `Factura ${folio} descargada en formato XML`,
            variant: "default"
          });
        } else {
          throw new Error('No se encontró PDF ni XML en la respuesta');
        }
      } else {
        // Handle error case - check both nested and top-level error messages
        const errorMsg = response.data?.error || response.error || 'Error al descargar';
        console.error('Download error details:', {
          response,
          errorMsg,
          hasData: !!response.data,
          dataSuccess: response.data?.success,
          hasPdf: !!response.data?.pdf,
          hasXml: !!response.data?.xml
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error downloading factura:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar la factura",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Facturación CFDI</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
            Generación y envío de facturas — Integración directa SAT
          </p>
          <div className="vein-line w-48 mt-3" />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, hsl(195, 100%, 45%), hsl(220, 90%, 50%))",
            color: "hsl(210, 50%, 5%)",
            boxShadow: "0 0 16px hsl(195 100% 50% / 0.25)"
          }}
        >
          <Plus className="w-4 h-4" />
          Nueva Factura
        </motion.button>
      </motion.div>

      {/* New invoice form */}
      {showNew && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 space-y-4 overflow-hidden">
          <h2 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 65%)" }}>
            Nueva Factura CFDI 4.0
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  RFC Receptor *
                </label>
                <input
                  name="rfcReceptor"
                  value={formData.rfcReceptor}
                  onChange={handleInputChange}
                  placeholder="ABC123456XYZ"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  Nombre / Razón Social *
                </label>
                <input
                  name="nombreReceptor"
                  value={formData.nombreReceptor}
                  onChange={handleInputChange}
                  placeholder="Empresa S.A. de C.V."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  Uso de CFDI
                </label>
                <select
                  name="usoCFDI"
                  value={formData.usoCFDI}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }}
                >
                  <option value="G01">G01 - Adquisición de mercancias</option>
                  <option value="G02">G02 - Devoluciones, descuentos o bonificaciones</option>
                  <option value="G03">G03 - Gastos en general</option>
                  <option value="I01">I01 - Construcciones</option>
                  <option value="I02">I02 - Mobilario y equipo de oficina</option>
                  <option value="I03">I03 - Equipo de transporte</option>
                  <option value="I04">I04 - Equipo de computo</option>
                  <option value="I05">I05 - Dados, troqueles, moldes</option>
                  <option value="I06">I06 - Refacciones</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  Régimen Fiscal
                </label>
                <select
                  name="regimenFiscal"
                  value={formData.regimenFiscal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }}
                >
                  <option value="601">601 - General Ley Personas Morales</option>
                  <option value="603">603 - Personas Morales con fines no lucrativos</option>
                  <option value="605">605 - Sueldos y salarios</option>
                  <option value="606">606 - Arrendamiento</option>
                  <option value="607">607 - Regimen de actividades empresariales</option>
                  <option value="608">608 - Ingresos por intereses</option>
                  <option value="610">610 - Residentes en el extranjero</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  Descripción
                </label>
                <input
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Servicios de consultoría"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  Monto *
                </label>
                <input
                  name="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                  <option value="timbrada">Timbrada</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.03 }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, hsl(195, 100%, 45%), hsl(220, 90%, 50%))",
                  color: "hsl(210, 50%, 5%)",
                }}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {saving ? "Guardando..." : "Timbrar y Enviar al SAT"}
              </motion.button>
              <button 
                type="button"
                onClick={() => setShowNew(false)} 
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "hsl(210 35% 12%)", border: "1px solid hsl(210 30% 20%)", color: "hsl(210, 15%, 60%)" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Invoice table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: "hsl(210 30% 14%)" }}>
          <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(195, 100%, 60%)" }}>
            CFDIs Recientes
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: "hsl(210 30% 12%)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(195, 100%, 50%)" }} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8" style={{ color: "hsl(210, 15%, 50%)" }}>
              No hay facturas registradas
            </div>
          ) : (
            invoices.map((inv, i) => {
              const cfg = statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.pendiente;
              return (
                <motion.div key={inv.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-primary/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(210 35% 12%)" }}>
                    <FileText className="w-4 h-4" style={{ color: "hsl(195, 100%, 55%)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>{inv.folio}</p>
                    <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>
                      {inv.nombreReceptor || inv.clienteId} · {inv.fecha}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>
                    {formatCurrency(inv.monto)}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                    <cfg.icon className="w-3 h-3" />
                    {cfg.label}
                  </div>
                  <button 
                    onClick={() => handleDownload(inv.id, inv.folio)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-primary/10"
                    style={{ color: "hsl(210, 15%, 50%)" }}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
