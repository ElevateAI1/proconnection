import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2, Edit } from "lucide-react";
import { usePsychologistRates } from "@/hooks/usePsychologistRates";
import { useProfile } from "@/hooks/useProfile";

const SESSION_TYPES = [
  { value: 'individual', label: 'Terapia Individual' },
  { value: 'couple', label: 'Terapia de Pareja' },
  { value: 'family', label: 'Terapia Familiar' },
  { value: 'evaluation', label: 'Evaluación' },
  { value: 'follow_up', label: 'Seguimiento' }
];

export const PsychologistRatesManager = () => {
  const { psychologist } = useProfile();
  const { rates, loading, createOrUpdateRate, deleteRate } = usePsychologistRates(psychologist?.id);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [formData, setFormData] = useState({
    sessionType: '',
    price: '',
    currency: 'USD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sessionType || !formData.price) {
      return;
    }

    await createOrUpdateRate(
      formData.sessionType,
      parseFloat(formData.price),
      formData.currency
    );

    setFormData({ sessionType: '', price: '', currency: 'USD' });
    setShowForm(false);
    setEditingRate(null);
  };

  const handleEdit = (rate: any) => {
    setEditingRate(rate);
    setFormData({
      sessionType: rate.session_type,
      price: rate.price.toString(),
      currency: rate.currency
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ sessionType: '', price: '', currency: 'USD' });
    setShowForm(false);
    setEditingRate(null);
  };

  const getSessionTypeLabel = (type: string) => {
    return SESSION_TYPES.find(st => st.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <CardTitle className="text-slate-800">Gestión de Tarifas</CardTitle>
            </div>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-petrol hover:bg-blue-petrol/90 text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Nueva Tarifa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6 border-2 border-blue-petrol/30 bg-gradient-to-br from-blue-soft/10 to-green-mint/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-petrol">
                  <Plus className="w-5 h-5 text-blue-petrol" />
                  {editingRate ? 'Editar Tarifa' : 'Agregar Nueva Tarifa'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="sessionType">Tipo de Consulta *</Label>
                    <Select 
                      value={formData.sessionType} 
                      onValueChange={(value) => setFormData({...formData, sessionType: value})}
                      disabled={editingRate}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de consulta" />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map((type) => {
                          const hasRate = rates.some(r => r.session_type === type.value && r.id !== editingRate?.id);
                          return (
                            <SelectItem 
                              key={type.value} 
                              value={type.value}
                              disabled={hasRate && !editingRate}
                            >
                              {type.label}
                              {hasRate && !editingRate && ' (ya existe)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-1">
                      Selecciona el tipo de consulta para la cual quieres establecer una tarifa
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Precio *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Moneda *</Label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value) => setFormData({...formData, currency: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">ARS - Peso Argentino ($)</SelectItem>
                          <SelectItem value="USD">USD - Dólar Estadounidense ($)</SelectItem>
                          <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                          <SelectItem value="MXN">MXN - Peso Mexicano ($)</SelectItem>
                          <SelectItem value="COP">COP - Peso Colombiano ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="submit" 
                      className="bg-blue-petrol hover:bg-blue-petrol/90 text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {editingRate ? 'Actualizar' : 'Crear'} Tarifa
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                      className="border-blue-petrol/30 text-blue-petrol hover:bg-blue-soft/20"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando tarifas...</p>
            </div>
          ) : rates.length === 0 && !showForm ? (
            <div className="text-center py-12 border-2 border-dashed border-blue-petrol/30 rounded-lg bg-gradient-to-br from-blue-soft/10 via-white-warm to-green-mint/10">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-soft/30 to-green-mint/30 rounded-full flex items-center justify-center border-4 border-blue-petrol/20">
                <DollarSign className="w-10 h-10 text-blue-petrol" />
              </div>
              <h3 className="text-xl font-bold text-blue-petrol mb-2">No tienes tarifas configuradas</h3>
              <p className="text-sm text-blue-petrol/70 mb-8 max-w-md mx-auto">
                Agrega tarifas para que los pacientes puedan ver tus precios y solicitar citas
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-petrol hover:bg-blue-petrol/90 text-white-warm px-8 py-3 text-lg font-semibold border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Primera Tarifa
              </Button>
            </div>
          ) : rates.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-petrol">
                  Tarifas Configuradas ({rates.length})
                </h3>
                {!showForm && (
                  <Button 
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    size="sm"
                    className="border-blue-petrol/30 text-blue-petrol hover:bg-blue-soft/20 hover:border-blue-petrol/50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Otra Tarifa
                  </Button>
                )}
              </div>
              {rates.map((rate) => (
                <Card key={rate.id} className="border border-blue-petrol/20 hover:border-blue-petrol/40 hover:shadow-lg transition-all bg-white-warm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-petrol mb-2">
                          {getSessionTypeLabel(rate.session_type)}
                        </h4>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-lg font-semibold text-blue-petrol border-blue-petrol/30 bg-gradient-to-r from-blue-soft/20 to-green-mint/20 px-3 py-1">
                            {rate.price} {rate.currency}
                          </Badge>
                          {rate.is_active && (
                            <Badge variant="secondary" className="text-blue-petrol bg-green-mint/50 border-green-mint">
                              ✓ Activa
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(rate)}
                          className="border-blue-petrol/30 text-blue-petrol hover:bg-blue-soft/20 hover:border-blue-petrol/50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar esta tarifa?')) {
                              deleteRate(rate.id);
                            }
                          }}
                          className="border-red-300/50 text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
