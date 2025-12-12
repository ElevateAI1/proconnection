
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./components/AuthPage";

// Lazy load components for code splitting
const DemoPage = lazy(() => import("./pages/DemoPage").then(m => ({ default: m.DemoPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const PatientAuthPage = lazy(() => import("./components/PatientAuthPage").then(m => ({ default: m.PatientAuthPage })));
const PatientRegisterPage = lazy(() => import("./pages/PatientRegisterPage").then(m => ({ default: m.PatientRegisterPage })));
const AdminLogin = lazy(() => import("./pages/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminRedirect = lazy(() => import("./pages/AdminRedirect").then(m => ({ default: m.AdminRedirect })));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage").then(m => ({ default: m.PublicProfilePage })));
const SitemapPage = lazy(() => import("./pages/SitemapPage").then(m => ({ default: m.SitemapPage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminRoute = lazy(() => import("./components/AdminRoute").then(m => ({ default: m.AdminRoute })));
const PatientDetailView = lazy(() => import("./components/PatientDetailView").then(m => ({ default: m.PatientDetailView })));
const PatientEditView = lazy(() => import("./components/PatientEditView").then(m => ({ default: m.PatientEditView })));
const PlansPage = lazy(() => import("./pages/PlansPage").then(m => ({ default: m.PlansPage })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600">Cargando...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/patient" element={<PatientAuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/patient" element={<PatientRegisterPage />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/app" element={<Index />} />
          <Route path="/plans" element={<PlansPage />} />
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
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
