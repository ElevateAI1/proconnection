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
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <CardTitle className="text-slate-800">Gestión de Tarifas</CardTitle>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarifa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="text-lg font-medium mb-4">
              {editingRate ? 'Editar Tarifa' : 'Nueva Tarifa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sessionType">Tipo de Consulta</Label>
                <Select 
                  value={formData.sessionType} 
                  onValueChange={(value) => setFormData({...formData, sessionType: value})}
                  disabled={editingRate} // No permitir cambiar tipo si estamos editando
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({...formData, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS ($)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="MXN">MXN ($)</SelectItem>
                      <SelectItem value="COP">COP ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingRate ? 'Actualizar' : 'Crear'} Tarifa
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando tarifas...</p>
          </div>
        ) : rates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes tarifas configuradas</p>
            <p className="text-sm">Agrega tarifas para que los pacientes puedan ver tus precios</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rates.map((rate) => (
              <div key={rate.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800">
                      {getSessionTypeLabel(rate.session_type)}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                        {rate.price} {rate.currency}
                      </Badge>
                      {rate.is_active && (
                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                          Activa
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(rate)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRate(rate.id)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
