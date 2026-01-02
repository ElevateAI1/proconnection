
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentsDashboard } from "./DocumentsDashboard";
import { DocumentNotifications } from "./DocumentNotifications";
import { DocumentTemplateManager } from "./DocumentTemplateManager";
import { DocumentReports } from "./DocumentReports";
import { TemplateUsageManager } from "./template-usage/TemplateUsageManager";
import { useProfile } from "@/hooks/useProfile";

export const DocumentsSection = () => {
  const { psychologist } = useProfile();

  if (!psychologist) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Cargando información del psicólogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Documentos</h1>
        <DocumentNotifications />
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="use-templates">Usar Plantillas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <DocumentsDashboard />
        </TabsContent>
        
        <TabsContent value="templates">
          <DocumentTemplateManager />
        </TabsContent>
        
        <TabsContent value="use-templates">
          <TemplateUsageManager 
            onDocumentCreated={() => {
              // Opcional: refrescar datos si es necesario
              console.log('Document created from template');
            }}
          />
        </TabsContent>
        
        <TabsContent value="reports">
          <DocumentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};
