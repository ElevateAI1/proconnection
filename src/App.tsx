
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import { LandingPage } from "./pages/LandingPage";
import { DemoPage } from "./pages/DemoPage";
import { AuthPage } from "./pages/AuthPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminRedirect } from "./pages/AdminRedirect";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { SitemapPage } from "./pages/SitemapPage";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "./components/AdminRoute";
import { PatientDetailView } from "./components/PatientDetailView";
import { PatientEditView } from "./components/PatientEditView";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/app" element={<Index />} />
        <Route path="/patients/:patientId" element={<PatientDetailView />} />
        <Route path="/patients/edit/:patientId" element={<PatientEditView />} />
        <Route path="/perfil/:customUrl" element={<PublicProfilePage />} />
        <Route path="/sitemap.xml" element={<SitemapPage />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
