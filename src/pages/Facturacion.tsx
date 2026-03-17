import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Send, Plus, CheckCircle, Clock, XCircle, Download } from "lucide-react";

const invoices = [
  { folio: "CFDI-2026-0042", cliente: "TechCorp MX", monto: "$12,500.00", fecha: "15/03/2026", status: "timbrada" },
  { folio: "CFDI-2026-0041", cliente: "Grupo Innovación", monto: "$8,200.00", fecha: "12/03/2026", status: "pendiente" },
  { folio: "CFDI-2026-0040", cliente: "SAPI de CV MXN", monto: "$21,000.00", fecha: "08/03/2026", status: "timbrada" },
  { folio: "CFDI-2026-0039", cliente: "Consultores MX", monto: "$5,800.00", fecha: "05/03/2026", status: "cancelada" },
];

const statusConfig = {
  timbrada: { label: "Timbrada SAT", color: "hsl(145, 60%, 50%)", bg: "hsl(145 60% 40% / 0.1)", icon: CheckCircle },
  pendiente: { label: "Pendiente", color: "hsl(35, 95%, 55%)", bg: "hsl(35 95% 55% / 0.1)", icon: Clock },
  cancelada: { label: "Cancelada", color: "hsl(0, 72%, 55%)", bg: "hsl(0 72% 51% / 0.1)", icon: XCircle },
};

export default function Facturacion() {
  const [showNew, setShowNew] = useState(false);

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
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "RFC Receptor", placeholder: "ABC123456XYZ" },
              { label: "Nombre / Razón Social", placeholder: "Empresa S.A. de C.V." },
              { label: "Uso de CFDI", placeholder: "G03 - Gastos en general" },
              { label: "Régimen Fiscal", placeholder: "601 - General Ley PF" },
              { label: "Descripción", placeholder: "Servicios de consultoría" },
              { label: "Monto", placeholder: "$0.00" },
            ].map(field => (
              <div key={field.label} className={field.label.includes("Descripción") ? "col-span-2" : ""}>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "hsl(195, 60%, 65%)" }}>
                  {field.label}
                </label>
                <input placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "hsl(210 35% 8%)",
                    border: "1px solid hsl(210 30% 18%)",
                    color: "hsl(210, 20%, 85%)",
                  }} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, hsl(195, 100%, 45%), hsl(220, 90%, 50%))",
                color: "hsl(210, 50%, 5%)",
              }}>
              <Send className="w-3.5 h-3.5" />
              Timbrar y Enviar al SAT
            </motion.button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "hsl(210 35% 12%)", border: "1px solid hsl(210 30% 20%)", color: "hsl(210, 15%, 60%)" }}>
              Cancelar
            </button>
          </div>
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
          {invoices.map((inv, i) => {
            const cfg = statusConfig[inv.status as keyof typeof statusConfig];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                className="flex items-center gap-4 px-4 py-3 hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(210 35% 12%)" }}>
                  <FileText className="w-4 h-4" style={{ color: "hsl(195, 100%, 55%)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>{inv.folio}</p>
                  <p className="text-xs" style={{ color: "hsl(210, 15%, 50%)" }}>{inv.cliente} · {inv.fecha}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>{inv.monto}</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                  <cfg.icon className="w-3 h-3" />
                  {cfg.label}
                </div>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-primary/10"
                  style={{ color: "hsl(210, 15%, 50%)" }}>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
