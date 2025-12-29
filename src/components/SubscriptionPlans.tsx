
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, MessageCircle, Star, Crown, Zap, Sparkles, Users, CreditCard, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { EmailVerificationInput } from './EmailVerificationInput';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  plan_key: string;
  title: string;
  price_display: string;
  features: string[];
  is_recommended: boolean;
  is_premium?: boolean;
  savings_text?: string;
}

interface SubscriptionPlansProps {
  hideHeader?: boolean;
}

interface EmailVerificationResult {
  status: 'valid' | 'invalid' | 'disposable' | 'risky' | 'pending';
  reason: string;
}

export const SubscriptionPlans = ({ hideHeader = false }: SubscriptionPlansProps = {}) => {
  const { psychologist, profile } = useProfile();
  const { createSubscription, cancelSubscription, isLoading, isCancelling } = useMercadoPago();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [payerEmail, setPayerEmail] = useState('');
  const [emailVerification, setEmailVerification] = useState<EmailVerificationResult | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // Manejar callbacks post-pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get('result');
    const mpStatus = urlParams.get('status');
    const mpPreapprovalId = urlParams.get('preapproval_id');

    if (result === 'subscription' && mpPreapprovalId) {
      if (mpStatus === 'authorized' || mpStatus === 'active') {
        toast({
          title: '¡Suscripción activada!',
          description: 'Tu suscripción ha sido procesada exitosamente.',
        });
        // Refrescar perfil
        window.dispatchEvent(new CustomEvent('planUpdated'));
        window.dispatchEvent(new CustomEvent('forceRefreshCapabilities'));
      } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
        toast({
          title: 'Suscripción no completada',
          description: mpStatus === 'rejected' 
            ? 'El pago fue rechazado. Por favor intenta con otro método de pago.'
            : 'La suscripción fue cancelada. Puedes intentar nuevamente cuando lo desees.',
          variant: 'destructive'
        });
      }

      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const plans: Plan[] = [
    {
      id: 'starter',
      plan_key: 'starter',
      title: 'Plan Starter',
      price_display: 'Gratis',
      is_recommended: false,
      features: [
        'Dashboard básico: vista simple del estado del consultorio (pacientes, citas, notificaciones)',
        'Gestión de Pacientes (CRM simple): alta/baja/edición de pacientes, datos básicos y seguimiento general',
        'Calendario & Programación de Citas: agenda para agendar, mover y cancelar turnos manualmente',
        'Solicitudes de Citas: recepción y aprobación de solicitudes online de pacientes',
        'Gestión de Tarifas: configuración de aranceles por sesión/servicio',
        'Centro de Notificaciones básicas: recordatorios sencillos y avisos clave dentro de la plataforma'
      ]
    },
    {
      id: 'proconnection',
      plan_key: 'proconnection',
      title: 'Plan ProConnection',
      price_display: '$44.900',
      is_recommended: true,
      savings_text: '⭐ Más elegido',
      features: [
        'Todo lo del Plan Starter',
        'Finanzas (Sistema Contable Mensual completo): registro de ingresos por sesión, consolidado mensual y visión tipo "caja" del consultorio',
        'Validación de Comprobantes: control de que los pagos registrados tengan comprobantes válidos y consistentes',
        'Documentos (historial clínico, notas): módulo para almacenar historia clínica, evoluciones y notas por paciente',
        'Reportes Avanzados: métricas de facturación, ingresos por período y productividad',
        'Perfil SEO: perfil optimizado para aparecer en búsquedas y mejorar tu visibilidad online',
        'Notificaciones avanzadas: esquema más completo de recordatorios y avisos para reducir ausentismo'
      ]
    },
    {
      id: 'clinicas',
      plan_key: 'clinicas',
      title: 'Plan Clínicas',
      price_display: '$149.000',
      is_recommended: false,
      is_premium: true,
      features: [
        'Todo lo del Plan ProConnection',
        'Multiusuario: agregar otros psicólogos, asistentes o administrativos con usuarios separados',
        'Gestión de equipo (permisos, roles): definir qué puede ver y hacer cada usuario dentro del sistema',
        'Reportes de Clínica (consolidados): estadísticas y finanzas agregadas a nivel equipo/centro',
        'Early Access: acceso anticipado a nuevas funcionalidades antes del resto de los planes',
        'Consultoría de Visibilidad PRO: acompañamiento estratégico para mejorar presencia y captación de pacientes',
        'Integraciones (APIs para sistemas externos): conexión con otros sistemas (ERP, BI, etc.)',
        'Dashboard de administración: panel central para administración global del equipo/centro'
      ]
    }
  ];

  const openWhatsApp = (planTitle: string) => {
    const phoneNumber = "5491144133576";
    const message = `Hola! Quiero contratar el ${planTitle} de ProConnection`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.price_display === 'Gratis') {
      toast({
        title: "Plan Gratuito",
        description: "Ya tienes acceso al plan gratuito",
      });
      return;
    }

    setSelectedPlan(plan);
    setPayerEmail(profile?.email || '');
    setEmailVerification(null);
    setShowConfirmDialog(true);
  };

  const verifyEmailAndSubscribe = async () => {
    if (!selectedPlan || !payerEmail) return;

    setIsVerifyingEmail(true);
    setEmailVerification(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { email: payerEmail }
      });

      if (error) {
        throw new Error(error.message || 'Error al verificar email');
      }

      if (data?.status === 'valid') {
        setEmailVerification({ status: 'valid', reason: data.reason });
        await createSubscription(selectedPlan.plan_key, payerEmail);
      } else if (data?.status === 'risky') {
        setEmailVerification({ status: 'risky', reason: data.reason });
      } else {
        setEmailVerification({ status: data.status, reason: data.reason });
      }
    } catch (error: any) {
      toast({
        title: "Error al verificar email",
        description: error.message || "No se pudo verificar el email. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleConfirmSubscription = () => {
    if (emailVerification?.status === 'risky') {
      // Permitir continuar aunque sea risky
      if (selectedPlan && payerEmail) {
        createSubscription(selectedPlan.plan_key, payerEmail);
      }
    } else {
      verifyEmailAndSubscribe();
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const hasActiveSubscription = psychologist?.subscription_status === 'active' && 
                                 psychologist?.mercadopago_preapproval_id;

  const getSubscriptionResultAlert = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get('result');
    const mpStatus = urlParams.get('status');

    if (result !== 'subscription') return null;

    if (mpStatus === 'authorized' || mpStatus === 'active') {
      return (
        <Alert className="mb-8 max-w-2xl mx-auto border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>¡Suscripción exitosa!</AlertTitle>
          <AlertDescription>
            Tu suscripción ha sido activada correctamente. Ya puedes disfrutar de todas las funciones de tu plan.
          </AlertDescription>
        </Alert>
      );
    }

    if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      return (
        <Alert className="mb-8 max-w-2xl mx-auto border-red-500" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Suscripción no completada</AlertTitle>
          <AlertDescription>
            {mpStatus === 'rejected' 
              ? 'El pago fue rechazado. Por favor intenta con otro método de pago.'
              : 'La suscripción fue cancelada. Puedes intentar nuevamente cuando lo desees.'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="mb-8 max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Procesando tu suscripción</AlertTitle>
        <AlertDescription>
          Tu suscripción está siendo procesada. Puede tomar unos minutos en activarse.
          Recibirás un email de confirmación cuando esté lista.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className={hideHeader ? "py-0" : "py-4 sm:py-8"}>
      {getSubscriptionResultAlert()}
      
      {!hideHeader && (
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
            Elige tu Plan de Suscripción
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-4 sm:px-0">
            Selecciona el plan que mejor se adapte a tus necesidades profesionales. 
            Todos los planes incluyen acceso completo a la plataforma.
          </p>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 ${hideHeader ? 'max-w-full px-0' : 'max-w-7xl mx-auto px-4'}`}>
        {plans.map((plan) => {
          const isProConnection = plan.plan_key === 'proconnection';
          const isClinicas = plan.plan_key === 'clinicas';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative border-2 transition-all duration-300 hover:shadow-xl flex flex-col h-full ${
                isProConnection 
                  ? 'border-amber-400 shadow-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' 
                  : isClinicas
                  ? 'border-blue-petrol/30 shadow-md hover:scale-[1.02]'
                  : 'border-slate-200 shadow-md hover:scale-[1.02]'
              }`}
            >
              {isProConnection && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white px-2 sm:px-3 py-1 text-xs font-bold shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {plan.savings_text || '⭐ Más Popular'}
                  </Badge>
                </div>
              )}

              <CardHeader className={`text-center pb-2 p-3 sm:p-4 ${isProConnection ? 'pt-6 sm:pt-7' : 'pt-3 sm:pt-4'}`}>
                <CardTitle className={`text-base sm:text-lg font-bold flex items-center justify-center gap-1.5 ${
                  isProConnection ? 'text-amber-700' : isClinicas ? 'text-blue-petrol' : 'text-slate-800'
                }`}>
                  {isClinicas ? (
                    <Users className="w-4 h-4 text-blue-petrol" />
                  ) : isProConnection ? (
                    <Zap className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Star className="w-4 h-4 text-blue-500" />
                  )}
                  {plan.title}
                </CardTitle>
                <div className="mt-2">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    isProConnection 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent' 
                      : isClinicas 
                      ? 'text-blue-petrol' 
                      : plan.price_display === 'Gratis'
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                    {plan.price_display}
                  </span>
                  {plan.price_display !== 'Gratis' && (
                    <span className="text-slate-500 ml-1 text-xs sm:text-sm">ARS / mes</span>
                  )}
                  {isClinicas && (
                    <p className="text-xs text-slate-600 mt-1">
                      x 4 profesionales / $19.900 por adicional
                    </p>
                  )}
                </div>
                {isProConnection && (
                  <div className="mt-1.5">
                    <p className="text-xs text-amber-700 font-semibold bg-amber-100/50 rounded-full px-2 py-0.5 inline-block">
                      💎 Mejor relación precio/valor
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-2 p-3 sm:p-4 flex flex-col flex-1">
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                        isProConnection ? 'text-amber-600' : isClinicas ? 'text-green-500' : 'text-green-500'
                      }`} />
                      <span className={`text-xs sm:text-sm leading-tight ${
                        isProConnection || isClinicas ? 'text-slate-700 font-medium' : 'text-slate-600'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => plan.price_display === 'Gratis' ? openWhatsApp(plan.title) : handleSelectPlan(plan)}
                  disabled={isLoading && selectedPlan?.id === plan.id}
                  className={`w-full py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-300 mt-auto !text-white ${
                    isProConnection
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      : isClinicas
                      ? 'bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1'
                      : plan.price_display === 'Gratis'
                      ? 'bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 hover:border-green-700'
                      : 'bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1'
                  }`}
                  size="sm"
                >
                  {isLoading && selectedPlan?.id === plan.id ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 animate-spin" />
                      Procesando...
                    </>
                  ) : plan.price_display === 'Gratis' ? (
                    <>
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                      Contactar por WhatsApp
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                      Suscribirse
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!hideHeader && (
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto px-4 sm:px-0">
            {hasActiveSubscription 
              ? 'Tienes una suscripción activa. Puedes cancelarla cuando lo desees.'
              : 'Selecciona un plan y completa el pago de forma segura con MercadoPago.'}
          </p>
          {hasActiveSubscription && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) {
                  cancelSubscription();
                }
              }}
              disabled={isCancelling}
              className="mt-4"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Cancelar Suscripción'
              )}
            </Button>
          )}
        </div>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        setShowConfirmDialog(open);
        if (!open) {
          setPayerEmail('');
          setEmailVerification(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Suscripción</DialogTitle>
            <DialogDescription>
              Estás por suscribirte al plan <strong>{selectedPlan?.title}</strong> por{" "}
              <strong>{selectedPlan?.price_display}/mes</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <EmailVerificationInput
              value={payerEmail}
              onChange={setPayerEmail}
              onVerificationChange={setEmailVerification}
              disabled={isLoading}
            />

            <p className="text-sm text-slate-600">
              Serás redirigido a MercadoPago para completar el pago de forma segura.
              La suscripción se renovará automáticamente cada mes.
            </p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmSubscription}
              disabled={
                isLoading || 
                isVerifyingEmail || 
                !payerEmail || 
                !isValidEmail(payerEmail) ||
                emailVerification?.status === 'invalid' ||
                emailVerification?.status === 'disposable'
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirigiendo...
                </>
              ) : isVerifyingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando email...
                </>
              ) : emailVerification?.status === 'risky' ? (
                'Continuar de todos modos'
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ir a MercadoPago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
