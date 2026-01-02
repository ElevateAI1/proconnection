
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, CheckCircle, AlertCircle, Phone, Zap, Send } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { useTicketSystem } from '@/hooks/useTicketSystem';

export const PrioritySupport = () => {
  const { tickets, loading, submitting, createTicket } = useTicketSystem();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'technical' as const,
    priority: 'medium' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const result = await createTicket(formData);
    if (result.data) {
      setFormData({
        title: '',
        description: '',
        type: 'technical',
        priority: 'medium'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-700">Resuelto</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-700">En Proceso</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-700">Cerrado</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700">Abierto</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
      default:
        return <Badge variant="secondary">Media</Badge>;
    }
  };

  return (
    <PlanGate capability="priority_support">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Soporte Prioritario</h2>
            <p className="text-slate-600">Asistencia exclusiva para usuarios Pro</p>
          </div>
          <Badge className="ml-auto bg-purple-100 text-purple-700">
            <Clock className="w-3 h-3 mr-1" />
            Respuesta en 15 min
          </Badge>
        </div>

        {/* Contacto directo */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              Contacto Directo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                className="bg-purple-500 hover:bg-purple-600 justify-start h-auto p-4"
                onClick={() => window.open('https://wa.me/5491123456789', '_blank')}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Chat Prioritario</div>
                    <div className="text-xs opacity-90">WhatsApp directo</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 border-purple-200"
                onClick={() => window.open('tel:+5491123456789', '_self')}
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Llamada Directa</div>
                    <div className="text-xs text-slate-600">+54 11 2345-6789</div>
                  </div>
                </div>
              </Button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-700">Beneficios Pro</span>
              </div>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• Respuesta garantizada en 15 minutos</li>
                <li>• Acceso a especialistas técnicos</li>
                <li>• Soporte por teléfono y video llamada</li>
                <li>• Atención personalizada de lunes a domingo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Crear nuevo ticket */}
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Consulta
                  </label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-md"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="technical">Problema Técnico</option>
                    <option value="feature">Nueva Funcionalidad</option>
                    <option value="billing">Facturación</option>
                    <option value="general">Consulta General</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prioridad
                  </label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-md"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="high">Alta - Problema crítico</option>
                    <option value="medium">Media - Funcionalidad afectada</option>
                    <option value="low">Baja - Consulta general</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Asunto
                </label>
                <Input 
                  placeholder="Describe brevemente el problema o consulta"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción Detallada
                </label>
                <Textarea 
                  placeholder="Explica en detalle tu consulta o problema. Incluye pasos para reproducir el error si aplica."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-500 hover:bg-purple-600"
                disabled={submitting || !formData.title || !formData.description}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Ticket Prioritario
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Historial de tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-slate-600">Cargando tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No tienes tickets de soporte aún</p>
                <p className="text-sm text-slate-500">Crea tu primer ticket arriba para obtener ayuda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ticket.status)}
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{ticket.title}</div>
                        <div className="text-sm text-slate-600">
                          Ticket {ticket.id} • {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                      {ticket.response_time && (
                        <Badge variant="outline" className="text-green-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {ticket.response_time} min
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
