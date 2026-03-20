import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Auth from "./pages/Auth.tsx";
import UserSettings from "./pages/Settings.tsx";
import Clients from "./pages/Clients.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Gastos from "./pages/Gastos.tsx";
import Analisis from "./pages/Analisis.tsx";
import Pronostico from "./pages/Pronostico.tsx";
import Facturacion from "./pages/Facturacion.tsx";
import MiContador from "./pages/MiContador.tsx";
import BovedaFiscal from "./pages/BovedaFiscal.tsx";
import NotFound from "./pages/NotFound.tsx";
import Impuestos from "./pages/Impuestos.tsx";
import Integraciones from "./pages/Integraciones.tsx";
import Alerts from "./pages/Alerts.tsx";
import Simulador from "./pages/Simulador.tsx";
import Chat from "./pages/Chat.tsx";
import ScoreFiscal from "./pages/ScoreFiscal.tsx";
import ClientDashboard from "./pages/ClientDashboard.tsx";
import ClientLayout from "./components/ClientLayout.tsx";
import ClientProxyDashboard from "./pages/client/Dashboard.tsx";
import ClientProxyGastos from "./pages/client/Gastos.tsx";
import ClientProxyFacturacion from "./pages/client/Facturacion.tsx";
import ClientProxyImpuestos from "./pages/client/Impuestos.tsx";
import ClientProxyAnalisis from "./pages/client/Analisis.tsx";
import ClientProxyScore from "./pages/client/Score.tsx";
import { Layout } from "./components/Layout.tsx";

const queryClient = new QueryClient();

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

// Componente para redirigir si ya está logueado
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
<Route element={<Layout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/gastos" element={<ProtectedRoute><Gastos /></ProtectedRoute>} />
            <Route path="/analisis" element={<ProtectedRoute><Analisis /></ProtectedRoute>} />
            <Route path="/pronostico" element={<ProtectedRoute><Pronostico /></ProtectedRoute>} />
            <Route path="/facturacion" element={<ProtectedRoute><Facturacion /></ProtectedRoute>} />
            <Route path="/contador" element={<ProtectedRoute><MiContador /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            {/* Client Proxy Routes - Full Dashboard Access for Contadores */}
            <Route path="/client/:clientId" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ClientProxyDashboard />} />
              <Route path="gastos" element={<ClientProxyGastos />} />
              <Route path="facturacion" element={<ClientProxyFacturacion />} />
              <Route path="impuestos" element={<ClientProxyImpuestos />} />
              <Route path="analisis" element={<ClientProxyAnalisis />} />
              <Route path="score" element={<ClientProxyScore />} />
            </Route>
            <Route path="/boveda" element={<ProtectedRoute><BovedaFiscal /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            {/* NEW FEATURE ROUTES */}
            <Route path="/impuestos" element={<ProtectedRoute><Impuestos /></ProtectedRoute>} />
            <Route path="/integraciones" element={<ProtectedRoute><Integraciones /></ProtectedRoute>} />
            <Route path="/alertas" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/simulador" element={<ProtectedRoute><Simulador /></ProtectedRoute>} />
            <Route path="/score" element={<ProtectedRoute><ScoreFiscal /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

