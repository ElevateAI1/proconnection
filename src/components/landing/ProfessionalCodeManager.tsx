import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PsychologistRelation {
  id: string;
  psychologist_id: string;
  professional_code: string;
  is_primary: boolean;
  psychologist: {
    first_name: string;
    last_name: string;
    professional_code: string;
  };
}

interface ProfessionalCodeManagerProps {
  patientId: string;
  onUpdate?: () => void;
}

export const ProfessionalCodeManager = ({ patientId, onUpdate }: ProfessionalCodeManagerProps) => {
  const [relations, setRelations] = useState<PsychologistRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchRelations();
  }, [patientId]);

  const fetchRelations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_psychologists')
        .select(`
          id,
          psychologist_id,
          professional_code,
          is_primary,
          psychologist:psychologists!inner(
            first_name,
            last_name,
            professional_code
          )
        `)
        .eq('patient_id', patientId)
        .order('is_primary', { ascending: false })
        .order('added_at', { ascending: false });

      if (error) throw error;
      setRelations(data || []);
    } catch (error: any) {
      console.error('Error fetching psychologist relations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los psicólogos vinculados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCode = async () => {
    if (!newCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código profesional",
        variant: "destructive"
      });
      return;
    }

    try {
      setAdding(true);
      
      // Validar y agregar usando la función RPC
      const { data, error } = await supabase.rpc('add_psychologist_to_patient', {
        patient_id_param: patientId,
        professional_code_param: newCode.trim().toUpperCase()
      });

      if (error) {
        if (error.message.includes('not found')) {
          toast({
            title: "Código inválido",
            description: "El código profesional ingresado no existe",
            variant: "destructive"
          });
        } else if (error.message.includes('already linked')) {
          toast({
            title: "Ya vinculado",
            description: "Ya estás vinculado a este psicólogo",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "¡Psicólogo agregado!",
        description: "El psicólogo ha sido vinculado exitosamente",
      });

      setNewCode('');
      setShowAddDialog(false);
      fetchRelations();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error adding psychologist:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el psicólogo",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveRelation = async (relationId: string, psychologistName: string) => {
    if (!confirm(`¿Estás seguro de que quieres desvincular a ${psychologistName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('patient_psychologists')
        .delete()
        .eq('id', relationId);

      if (error) throw error;

      toast({
        title: "Psicólogo desvinculado",
        description: "El psicólogo ha sido removido exitosamente",
      });

      fetchRelations();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error removing relation:', error);
      toast({
        title: "Error",
        description: "No se pudo desvincular el psicólogo",
        variant: "destructive"
      });
    }
  };

  const handleSetPrimary = async (relationId: string) => {
    try {
      // Primero quitar primary de todos
      await supabase
        .from('patient_psychologists')
        .update({ is_primary: false })
        .eq('patient_id', patientId);

      // Luego establecer el nuevo primary
      const { error } = await supabase
        .from('patient_psychologists')
        .update({ is_primary: true })
        .eq('id', relationId);

      if (error) throw error;

      toast({
        title: "Psicólogo principal actualizado",
        description: "El psicólogo principal ha sido actualizado",
      });

      fetchRelations();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error setting primary:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el psicólogo principal",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-2 border-celeste-gray/50 shadow-lg bg-white-warm/90 backdrop-blur-md rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-petrol font-bold">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-xl flex items-center justify-center shadow-lg shadow-blue-soft/30">
              <User className="w-5 h-5 text-white" />
            </div>
            Mis Psicólogos
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[6px_6px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Psicólogo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="professionalCode">Código Profesional</Label>
                  <Input
                    id="professionalCode"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="PS-ABC123"
                    className="mt-1"
                  />
                  <p className="text-sm text-blue-petrol/70 mt-2">
                    Ingresa el código profesional que te proporcionó tu psicólogo
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddCode}
                    disabled={adding || !newCode.trim()}
                    className="bg-blue-petrol text-white-warm"
                  >
                    {adding ? "Agregando..." : "Agregar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-blue-petrol/70">Cargando...</p>
          </div>
        ) : relations.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-blue-petrol/50 mx-auto mb-4" />
            <p className="text-blue-petrol/70 font-medium mb-4">
              No tienes psicólogos vinculados
            </p>
            <p className="text-sm text-blue-petrol/60 mb-4">
              Agrega un código profesional para vincular a tu psicólogo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {relations.map((relation) => (
              <div
                key={relation.id}
                className="flex items-center justify-between p-4 bg-white-warm border-2 border-lavender-soft/50 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-blue-petrol">
                        {relation.psychologist.first_name} {relation.psychologist.last_name}
                      </p>
                      {relation.is_primary && (
                        <span className="px-2 py-0.5 bg-green-mint/20 text-green-mint text-xs font-bold rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-petrol/70">
                      Código: {relation.professional_code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!relation.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(relation.id)}
                      className="text-xs"
                    >
                      Establecer Principal
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRelation(
                      relation.id,
                      `${relation.psychologist.first_name} ${relation.psychologist.last_name}`
                    )}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

