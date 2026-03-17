import { motion } from "framer-motion";
import { FileText, FolderOpen, Shield, Upload, Search, Download, Lock } from "lucide-react";

const folders = [
  { name: "CFDIs 2026", count: 42, icon: FileText, color: "hsl(195, 100%, 50%)" },
  { name: "CFDIs 2025", count: 128, icon: FileText, color: "hsl(220, 90%, 60%)" },
  { name: "Contratos", count: 8, icon: FolderOpen, color: "hsl(270, 80%, 60%)" },
  { name: "Declaraciones SAT", count: 12, icon: Shield, color: "hsl(145, 60%, 50%)" },
  { name: "Comprobantes de Pago", count: 67, icon: FileText, color: "hsl(35, 95%, 55%)" },
  { name: "Nóminas", count: 24, icon: FolderOpen, color: "hsl(195, 70%, 60%)" },
];

const recentFiles = [
  { name: "CFDI_TEL141016KT4_20260315.xml", size: "12 KB", date: "Hoy", type: "xml" },
  { name: "Declaracion_ISR_Feb2026.pdf", size: "248 KB", date: "12 Mar", type: "pdf" },
  { name: "Contrato_Arrendamiento_2026.pdf", size: "1.2 MB", date: "10 Mar", type: "pdf" },
  { name: "Nomina_Quincenal_Mar1_2026.pdf", size: "380 KB", date: "08 Mar", type: "pdf" },
  { name: "CFDI_XAXX010101000_20260308.xml", size: "9 KB", date: "08 Mar", type: "xml" },
];

export default function BovedaFiscal() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: "hsl(210, 20%, 90%)" }}>Bóveda Fiscal</h1>
            <Lock className="w-4 h-4" style={{ color: "hsl(195, 100%, 60%)" }} />
          </div>
          <p className="text-sm mt-1" style={{ color: "hsl(210, 15%, 50%)" }}>
            Repositorio cifrado de documentos fiscales
          </p>
          <div className="vein-line w-48 mt-3" />
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, hsl(195, 100%, 45%), hsl(220, 90%, 50%))",
            color: "hsl(210, 50%, 5%)",
            boxShadow: "0 0 16px hsl(195 100% 50% / 0.25)"
          }}>
          <Upload className="w-4 h-4" />
          Subir Documento
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "hsl(210, 15%, 45%)" }} />
        <input
          placeholder="Buscar documentos, RFC, fecha..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "hsl(210 35% 9%)",
            border: "1px solid hsl(210 30% 18%)",
            color: "hsl(210, 20%, 85%)",
          }}
        />
      </motion.div>

      {/* Storage indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="glass-card rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(195 100% 50% / 0.1)", border: "1px solid hsl(195 100% 50% / 0.2)" }}>
          <Shield className="w-5 h-5" style={{ color: "hsl(195, 100%, 60%)" }} />
        </div>
        <div className="flex-1">
          <p className="text-xs mb-1.5" style={{ color: "hsl(210, 15%, 55%)" }}>Almacenamiento seguro — 2.4 GB / 10 GB</p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(210 30% 15%)" }}>
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }} animate={{ width: "24%" }} transition={{ delay: 0.4, duration: 0.8 }}
              style={{ background: "linear-gradient(90deg, hsl(195, 100%, 50%), hsl(220, 90%, 55%))" }} />
          </div>
        </div>
        <span className="text-xs font-medium" style={{ color: "hsl(195, 100%, 60%)" }}>24%</span>
      </motion.div>

      {/* Folders grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {folders.map((folder, i) => (
          <motion.div key={folder.name}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="kpi-card rounded-xl p-4 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${folder.color}18`, border: `1px solid ${folder.color}28` }}>
              <folder.icon className="w-4.5 h-4.5" style={{ color: folder.color }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>{folder.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(210, 15%, 45%)" }}>{folder.count} archivos</p>
          </motion.div>
        ))}
      </div>

      {/* Recent files */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: "hsl(210 30% 14%)" }}>
          <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(195, 100%, 60%)" }}>
            Archivos Recientes
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: "hsl(210 30% 12%)" }}>
          {recentFiles.map((file, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: file.type === "pdf" ? "hsl(0 72% 51% / 0.15)" : "hsl(145 60% 40% / 0.15)",
                  color: file.type === "pdf" ? "hsl(0, 72%, 65%)" : "hsl(145, 60%, 65%)"
                }}>
                {file.type.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "hsl(210, 20%, 82%)" }}>{file.name}</p>
                <p className="text-xs" style={{ color: "hsl(210, 15%, 45%)" }}>{file.size} · {file.date}</p>
              </div>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors"
                style={{ color: "hsl(210, 15%, 50%)" }}>
                <Download className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
