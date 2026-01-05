import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Crown,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  RefreshCw,
  Filter,
  AlertTriangle,
  Users,
} from "lucide-react";

interface ProfessionalData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  professional_code: string;
  subscription_status: string;
  plan_type: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
}

type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";
type PlanType = "starter" | "proconnection" | "clinicas" | "dev";

export const SuperAdminSubscriptions = () => {
  const { psychologistStats, refetch, forceRefresh } = useAdmin();
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<ProfessionalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Estados del formulario de edición
  const [editStatus, setEditStatus] = useState<SubscriptionStatus>("trial");
  const [editPlanType, setEditPlanType] = useState<PlanType>("starter");
  const [editSubscriptionDays, setEditSubscriptionDays] = useState<string>("30");
  const [editTrialDays, setEditTrialDays] = useState<string>("7");

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals();
  }, [searchQuery, statusFilter, planFilter, professionals]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      // Obtener todos los profesionales con sus perfiles
      const { data: psychologistsData, error: psychError } = await supabase
        .from("psychologists")
        .select("*")
        .order("created_at", { ascending: false });

      if (psychError) {
        console.error("Error fetching professionals:", psychError);
        toast({
          title: "Error",
          description: "No se pudieron cargar los profesionales",
          variant: "destructive",
        });
        return;
      }

      if (!psychologistsData || psychologistsData.length === 0) {
        setProfessionals([]);
        setFilteredProfessionals([]);
        setLoading(false);
        return;
      }

      // Obtener emails
      const ids = psychologistsData.map((p) => p.id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);

      const emailMap = new Map<string, string>();
      profilesData?.forEach((profile) => {
        emailMap.set(profile.id, profile.email);
      });

      // Transformar datos
      const professionalsData: ProfessionalData[] = psychologistsData.map((p) => ({
        id: p.id,
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        email: emailMap.get(p.id) || "Sin email",
        professional_code: p.professional_code || "",
        subscription_status: p.subscription_status || "trial",
        plan_type: p.plan_type || null,
        trial_start_date: p.trial_start_date || null,
        trial_end_date: p.trial_end_date || null,
        subscription_end_date: p.subscription_end_date || null,
        created_at: p.created_at || "",
      }));

      setProfessionals(professionalsData);
      setFilteredProfessionals(professionalsData);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast({
        title: "Error",
        description: "Error al cargar profesionales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfessionals = () => {
    let filtered = [...professionals];

    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.first_name.toLowerCase().includes(query) ||
          p.last_name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.professional_code.toLowerCase().includes(query)
      );
    }

    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.subscription_status === statusFilter);
    }

    // Filtro de plan
    if (planFilter !== "all") {
      filtered = filtered.filter((p) => p.plan_type === planFilter);
    }

    setFilteredProfessionals(filtered);
  };

  const openEditDialog = (professional: ProfessionalData) => {
    setSelectedProfessional(professional);
    setEditStatus(professional.subscription_status as SubscriptionStatus);
    setEditPlanType((professional.plan_type as PlanType) || "starter");
    
    // Calcular días restantes si hay fechas
    if (professional.subscription_end_date) {
      const endDate = new Date(professional.subscription_end_date);
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setEditSubscriptionDays(Math.max(0, daysRemaining).toString());
    } else {
      setEditSubscriptionDays("30");
    }

    if (professional.trial_end_date) {
      const endDate = new Date(professional.trial_end_date);
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setEditTrialDays(Math.max(0, daysRemaining).toString());
    } else {
      setEditTrialDays("7");
    }

    setEditDialogOpen(true);
  };

  const updateSubscription = async () => {
    if (!selectedProfessional) return;

    setUpdating(true);
    try {
      // Verificar que el usuario es admin antes de proceder
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }

      const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_admin_user", {
        user_id: user.id,
      });

      if (adminCheckError || !isAdmin) {
        throw new Error("No tienes permisos de administrador para realizar esta acción");
      }

      const now = new Date();
      const updateData: any = {
        subscription_status: editStatus,
        plan_type: editPlanType,
        updated_at: now.toISOString(),
      };

      // Calcular fechas según el status y días especificados
      if (editStatus === "active") {
        const days = parseInt(editSubscriptionDays) || 30;
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + days);
        updateData.subscription_end_date = endDate.toISOString();
        updateData.subscription_start_date = now.toISOString();
        
        // Si cambia a active, asegurar que no está en trial
        if (selectedProfessional.subscription_status === "trial") {
          // Mantener trial dates pero marcar como activo
        }
      } else if (editStatus === "trial") {
        // Si es trial, actualizar trial dates
        if (!selectedProfessional.trial_start_date) {
          updateData.trial_start_date = now.toISOString();
        } else {
          updateData.trial_start_date = selectedProfessional.trial_start_date;
        }
        const days = parseInt(editTrialDays) || 7;
        const trialEndDate = new Date(now);
        trialEndDate.setDate(trialEndDate.getDate() + days);
        updateData.trial_end_date = trialEndDate.toISOString();
      } else if (editStatus === "expired" || editStatus === "cancelled") {
        // Para expired/cancelled, mantener fechas existentes pero no actualizar fechas
        // Solo actualizar el status
      }

      console.log("🔄 Actualizando suscripción:", {
        professionalId: selectedProfessional.id,
        updateData,
      });

      const { error, data } = await supabase
        .from("psychologists")
        .update(updateData)
        .eq("id", selectedProfessional.id)
        .select();

      if (error) {
        console.error("❌ Error updating subscription:", error);
        
        // Si es error de RLS, dar mensaje más claro
        if (error.message?.includes("policy") || error.code === "42501") {
          throw new Error(
            "Error de permisos. Asegúrate de que la migración de permisos de admin esté aplicada."
          );
        }
        
        throw error;
      }

      console.log("✅ Suscripción actualizada correctamente:", data);

      toast({
        title: "✅ Suscripción actualizada",
        description: `Plan ${editPlanType} y status ${editStatus} asignados correctamente para ${selectedProfessional.first_name} ${selectedProfessional.last_name}`,
      });

      setEditDialogOpen(false);
      await fetchProfessionals();
      if (refetch) await refetch();
      if (forceRefresh) await forceRefresh();
    } catch (error: any) {
      console.error("❌ Error updating subscription:", error);
      toast({
        title: "Error al actualizar suscripción",
        description: error.message || "No se pudo actualizar la suscripción. Verifica los logs para más detalles.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800 border-green-300",
      trial: "bg-blue-100 text-blue-800 border-blue-300",
      expired: "bg-red-100 text-red-800 border-red-300",
      cancelled: "bg-gray-100 text-gray-800 border-gray-300",
    };

    const icons: Record<string, any> = {
      active: CheckCircle2,
      trial: Clock,
      expired: XCircle,
      cancelled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge
        variant="outline"
        className={`${variants[status] || "bg-gray-100 text-gray-800"} border`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status === "active" && "Activo"}
        {status === "trial" && "Prueba"}
        {status === "expired" && "Expirado"}
        {status === "cancelled" && "Cancelado"}
        {!["active", "trial", "expired", "cancelled"].includes(status) && status}
      </Badge>
    );
  };

  const getPlanBadge = (planType: string | null) => {
    if (!planType) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Sin plan
        </Badge>
      );
    }

    const variants: Record<string, string> = {
      starter: "bg-blue-100 text-blue-800 border-blue-300",
      proconnection: "bg-purple-100 text-purple-800 border-purple-300",
      clinicas: "bg-orange-100 text-orange-800 border-orange-300",
      dev: "bg-green-100 text-green-800 border-green-300",
    };

    const labels: Record<string, string> = {
      starter: "Starter",
      proconnection: "ProConnection",
      clinicas: "Clínicas",
      dev: "Dev (Beta)",
    };

    return (
      <Badge variant="outline" className={`${variants[planType] || "bg-gray-100"} border`}>
        <Crown className="w-3 h-3 mr-1" />
        {labels[planType] || planType}
      </Badge>
    );
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <p>Cargando profesionales...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Suscripciones Beta</h2>
          <p className="text-sm text-slate-600 mt-1">
            Asigna planes y estados de suscripción para usuarios beta
          </p>
        </div>
        <Button onClick={fetchProfessionals} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Nombre, email o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado de Suscripción</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="trial">Prueba</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="proconnection">ProConnection</SelectItem>
                  <SelectItem value="clinicas">Clínicas</SelectItem>
                  <SelectItem value="dev">Dev (Beta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Mostrando {filteredProfessionals.length} de {professionals.length} profesionales</span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de profesionales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profesionales</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProfessionals.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron profesionales</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProfessionals.map((professional) => {
                const subscriptionDays = getDaysRemaining(professional.subscription_end_date);
                const trialDays = getDaysRemaining(professional.trial_end_date);

                return (
                  <div
                    key={professional.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800">
                          {professional.first_name} {professional.last_name}
                        </h3>
                        {getStatusBadge(professional.subscription_status)}
                        {getPlanBadge(professional.plan_type)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Email:</span> {professional.email}
                        </div>
                        <div>
                          <span className="font-medium">Código:</span> {professional.professional_code}
                        </div>
                        {subscriptionDays !== null && (
                          <div>
                            <span className="font-medium">Suscripción:</span> {subscriptionDays} días restantes
                          </div>
                        )}
                        {trialDays !== null && professional.subscription_status === "trial" && (
                          <div>
                            <span className="font-medium">Trial:</span> {trialDays} días restantes
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => openEditDialog(professional)}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Suscripción</DialogTitle>
            <DialogDescription>
              Asignar plan y estado de suscripción para:{" "}
              <strong>
                {selectedProfessional?.first_name} {selectedProfessional?.last_name}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado de Suscripción</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as SubscriptionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Prueba (Trial)</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editPlanType} onValueChange={(v) => setEditPlanType(v as PlanType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="proconnection">ProConnection</SelectItem>
                  <SelectItem value="clinicas">Clínicas</SelectItem>
                  <SelectItem value="dev">Dev (Beta)</SelectItem>
                </SelectContent>
              </Select>
              {editPlanType === "dev" && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Plan Dev: acceso completo para betas y pruebas
                </p>
              )}
            </div>

            {editStatus === "active" && (
              <div className="space-y-2">
                <Label>Días de Suscripción</Label>
                <Input
                  type="number"
                  min="1"
                  value={editSubscriptionDays}
                  onChange={(e) => setEditSubscriptionDays(e.target.value)}
                  placeholder="30"
                />
                <p className="text-xs text-slate-500">
                  Duración de la suscripción activa desde hoy
                </p>
              </div>
            )}

            {editStatus === "trial" && (
              <div className="space-y-2">
                <Label>Días de Trial</Label>
                <Input
                  type="number"
                  min="1"
                  value={editTrialDays}
                  onChange={(e) => setEditTrialDays(e.target.value)}
                  placeholder="7"
                />
                <p className="text-xs text-slate-500">
                  Duración del periodo de prueba desde hoy
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateSubscription} disabled={updating}>
              {updating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

