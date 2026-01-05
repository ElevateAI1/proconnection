
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  Smartphone,
  TestTube,
  Shield
} from "lucide-react";
import { AffiliateAdminPanel } from "./AffiliateAdminPanel";
import { SeoAdminPanel } from "./SeoAdminPanel";
import { ReceiptValidationPanel } from "./ReceiptValidationPanel";
import { WhatsAppManager } from "./WhatsAppManager";
import { ReminderTestingTab } from "./ReminderTestingTab";
import { ReminderManagementTab } from "./ReminderManagementTab";
import { SuperAdminSubscriptions } from "./SuperAdminSubscriptions";

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - replace with real data from your hooks
  const stats = {
    totalUsers: 1250,
    totalRevenue: 45230,
    monthlyGrowth: 12.5,
    activeSubscriptions: 890
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Administración</h1>
        <Badge variant="outline" className="px-3 py-1">
          Sistema ProConnection
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <Smartphone className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="reminder-testing">
            <TestTube className="w-4 h-4 mr-2" />
            Pruebas
          </TabsTrigger>
          <TabsTrigger value="reminder-management">
            <Shield className="w-4 h-4 mr-2" />
            Recordatorios
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="affiliates">
            <DollarSign className="w-4 h-4 mr-2" />
            Afiliados
          </TabsTrigger>
          <TabsTrigger value="seo">
            <TrendingUp className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="receipts">
            <Calendar className="w-4 h-4 mr-2" />
            Recibos
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +15.3% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crecimiento Mensual</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthlyGrowth}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  +18.2% desde el mes pasado
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Nuevo usuario registrado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dr. García se unió al sistema hace 2 minutos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Pago procesado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Suscripción renovada por $49.99
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Mensaje de soporte
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nueva consulta sobre facturación
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppManager />
        </TabsContent>

        <TabsContent value="reminder-testing">
          <ReminderTestingTab />
        </TabsContent>

        <TabsContent value="reminder-management">
          <ReminderManagementTab />
        </TabsContent>

        <TabsContent value="users">
          <SuperAdminSubscriptions />
        </TabsContent>

        <TabsContent value="affiliates">
          <AffiliateAdminPanel />
        </TabsContent>

        <TabsContent value="seo">
          <SeoAdminPanel />
        </TabsContent>

        <TabsContent value="receipts">
          <ReceiptValidationPanel psychologistId={null} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium mb-2">Sistema de Notificaciones</h4>
                  <p className="text-sm text-slate-600">
                    Configurar notificaciones por email, SMS y WhatsApp
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Integración WhatsApp</h4>
                  <p className="text-sm text-slate-600">
                    Sistema WhatsApp completamente funcional e integrado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
