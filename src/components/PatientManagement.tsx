
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Plus, 
  MessageCircle, 
  Calendar, 
  User,
  Eye,
  Phone
} from "lucide-react";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  age?: number;
  notes?: string;
  created_at: string;
  psychologist_id: string;
}

export const PatientManagement = () => {
  const { psychologist } = useProfile();
  const { patients, loading, error, addPatient } = useOptimizedPatients(psychologist?.id);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    age: "",
    notes: ""
  });

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const handleAddPatient = async () => {
    if (!newPatient.first_name || !newPatient.last_name) return;

    const patientData = {
      first_name: newPatient.first_name,
      last_name: newPatient.last_name,
      phone: newPatient.phone || undefined,
      age: newPatient.age ? parseInt(newPatient.age) : undefined,
      notes: newPatient.notes || undefined
    };

    const success = await addPatient(patientData);
    
    if (success) {
      setNewPatient({
        first_name: "",
        last_name: "",
        phone: "",
        age: "",
        notes: ""
      });
      setIsAddingPatient(false);
    }
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800">Gestión de Pacientes</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-800">Gestión de Pacientes</h2>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-red-300" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error al cargar pacientes</h3>
            <p className="text-slate-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestión de Pacientes</h2>
        <Button 
          onClick={() => setIsAddingPatient(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Agregar Paciente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar pacientes por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Formulario para agregar paciente */}
      {isAddingPatient && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Agregar Nuevo Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Nombre"
                value={newPatient.first_name}
                onChange={(e) => setNewPatient(prev => ({ ...prev, first_name: e.target.value }))}
              />
              <Input
                placeholder="Apellido"
                value={newPatient.last_name}
                onChange={(e) => setNewPatient(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Teléfono"
                value={newPatient.phone}
                onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Edad"
                value={newPatient.age}
                onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>
            <Input
              placeholder="Notas adicionales"
              value={newPatient.notes}
              onChange={(e) => setNewPatient(prev => ({ ...prev, notes: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddPatient}>Agregar Paciente</Button>
              <Button variant="outline" onClick={() => setIsAddingPatient(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de pacientes */}
      <div className="grid gap-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {patient.first_name[0]}{patient.last_name[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {patient.age && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {patient.age} años
                          </span>
                        )}
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {patient.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(patient.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Botón principal para ver perfil completo */}
                    <Button 
                      onClick={() => handleViewPatient(patient.id)}
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Perfil Completo
                    </Button>
                    
                    {/* Accesos rápidos */}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {patient.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Notas:</span> {patient.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
              </h3>
              <p className="text-slate-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza agregando tu primer paciente'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsAddingPatient(true)}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-emerald-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Paciente
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
