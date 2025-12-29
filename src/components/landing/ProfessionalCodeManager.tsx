import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  psychologistRelations?: any[];
  psychologistInfo?: any;
  onUpdate?: () => void;
}

export const ProfessionalCodeManager = ({ patientId, psychologistRelations, psychologistInfo, onUpdate }: ProfessionalCodeManagerProps) => {
  const [relations, setRelations] = useState<PsychologistRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [adding, setAdding] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [relationToRemove, setRelationToRemove] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Si tenemos relaciones pasadas como prop, usarlas primero
    if (psychologistRelations && psychologistRelations.length > 0) {
      console.log('ProfessionalCodeManager: Using psychologistRelations from props:', psychologistRelations);
      setRelations(psychologistRelations);
      setLoading(false);
    } else if (psychologistInfo) {
      // Si tenemos psychologistInfo pero no relaciones, crear una relación temporal
      console.log('ProfessionalCodeManager: Using psychologistInfo from props, creating temp relation:', psychologistInfo);
      const tempRelation: PsychologistRelation = {
        id: `temp-${psychologistInfo.id}`,
        patient_id: patientId,
        psychologist_id: psychologistInfo.id,
        professional_code: psychologistInfo.professional_code || '',
        is_primary: true,
        added_at: new Date().toISOString(),
        psychologist: {
          id: psychologistInfo.id,
          first_name: psychologistInfo.first_name,
          last_name: psychologistInfo.last_name,
          professional_code: psychologistInfo.professional_code
        }
      };
      setRelations([tempRelation]);
      setLoading(false);
    } else {
      // Si no hay props, hacer la query normal
      fetchRelations();
    }
  }, [patientId, psychologistRelations, psychologistInfo]);

  const fetchRelations = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING RELATIONS ===');
      console.log('Patient ID:', patientId);
      
      // Primero intentar obtener las relaciones sin el join para verificar si existen
      console.log('Step 1: Fetching relations without join...');
      const { data: relationsOnly, error: relationsError } = await supabase
        .from('patient_psychologists')
        .select(`
          id,
          patient_id,
          psychologist_id,
          professional_code,
          is_primary,
          added_at
        `)
        .eq('patient_id', patientId)
        .order('is_primary', { ascending: false })
        .order('added_at', { ascending: false });

      console.log('Relations without join:', { relationsOnly, relationsError });

      if (relationsError) {
        console.error('Error fetching relations:', relationsError);
        throw relationsError;
      }

      if (!relationsOnly || relationsOnly.length === 0) {
        console.log('No relations found in patient_psychologists table');
        setRelations([]);
        return;
      }

      console.log(`Found ${relationsOnly.length} relation(s) in patient_psychologists`);

      // Ahora intentar obtener los datos de los psicólogos
      const psychologistIds = relationsOnly.map(r => r.psychologist_id);
      console.log('Step 2: Fetching psychologists data for IDs:', psychologistIds);
      
      const { data: psychologistsData, error: psychError } = await supabase
        .from('psychologists')
        .select('id, first_name, last_name, professional_code')
        .in('id', psychologistIds);

      console.log('Psychologists data:', { psychologistsData, psychError });

      if (psychError) {
        console.error('Error fetching psychologists:', psychError);
        // Aún así, mostrar las relaciones sin los datos del psicólogo
        const relationsWithNullPsych = relationsOnly.map(rel => ({
          ...rel,
          psychologist: null
        }));
        setRelations(relationsWithNullPsych);
        console.log('Set relations with null psychologist data due to RLS error');
        return;
      }

      // Combinar los datos manualmente
      const combinedData = relationsOnly.map(rel => ({
        ...rel,
        psychologist: psychologistsData?.find(p => p.id === rel.psychologist_id) || null
      }));

      console.log('Combined relations data:', JSON.stringify(combinedData, null, 2));
      
      // Verificar estructura de datos
      if (combinedData && combinedData.length > 0) {
        console.log('First relation structure:', {
          id: combinedData[0].id,
          psychologist_id: combinedData[0].psychologist_id,
          professional_code: combinedData[0].professional_code,
          is_primary: combinedData[0].is_primary,
          psychologist: combinedData[0].psychologist
        });
      }
      
      setRelations(combinedData);
      console.log('Relations state updated, count:', combinedData.length);
    } catch (error: any) {
      console.error('Error fetching psychologist relations:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
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
      const codeToUse = newCode.trim().toUpperCase();
      console.log('=== ADDING PSYCHOLOGIST ===');
      console.log('Code entered:', newCode);
      console.log('Code after trim/uppercase:', codeToUse);
      console.log('Patient ID:', patientId);
      console.log('Patient ID type:', typeof patientId);
      
      // Primero validar el código con la función validate_professional_code
      console.log('Step 1: Validating professional code...');
      const { data: validatedId, error: validateError } = await supabase.rpc('validate_professional_code', {
        code: codeToUse
      });
      
      console.log('Validation result:', { validatedId, validateError });
      
      if (validateError) {
        console.error('Code validation failed:', validateError);
        toast({
          title: "Código inválido",
          description: validateError.message || "El código profesional ingresado no existe",
          variant: "destructive"
        });
        return;
      }
      
      if (!validatedId) {
        console.error('No psychologist ID returned from validation');
        toast({
          title: "Código inválido",
          description: "El código profesional no retornó un ID válido",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Step 2: Adding psychologist to patient...');
      console.log('Calling add_psychologist_to_patient with:', {
        patient_id_param: patientId,
        professional_code_param: codeToUse,
        patientIdType: typeof patientId,
        codeType: typeof codeToUse
      });
      
      const { data, error } = await supabase.rpc('add_psychologist_to_patient', {
        patient_id_param: patientId,
        professional_code_param: codeToUse
      });
      
      console.log('RPC response:', { data, error });
      console.log('Error details:', error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status,
        statusCode: error.statusCode
      } : 'No error');

      if (error) {
        console.error('=== ERROR ADDING PSYCHOLOGIST ===');
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Verificar primero si es "already linked" (incluso con código P0001)
        if (error.message.includes('already linked')) {
          console.log('Patient already linked - reloading relations...');
          // Recargar relaciones primero para mostrar el que ya existe
          await fetchRelations();
          setNewCode('');
          setShowAddDialog(false);
          toast({
            title: "Ya vinculado",
            description: "Ya estás vinculado a este psicólogo. Se ha actualizado la lista.",
            variant: "default"
          });
          onUpdate?.();
        } else if (error.message.includes('not found') || error.code === 'P0001') {
          toast({
            title: "Código inválido",
            description: "El código profesional ingresado no existe",
            variant: "destructive"
          });
        } else if (error.code === '23505' || error.status === 409 || error.statusCode === 409) {
          console.log('Conflict error - reloading relations...');
          await fetchRelations();
          setNewCode('');
          setShowAddDialog(false);
          toast({
            title: "Ya vinculado",
            description: "Ya estás vinculado a este psicólogo. Se ha actualizado la lista.",
            variant: "default"
          });
          onUpdate?.();
        } else if (error.message.includes('Can only add psychologists to your own account')) {
          toast({
            title: "Error de autenticación",
            description: "Solo puedes agregar psicólogos a tu propia cuenta",
            variant: "destructive"
          });
        } else {
          console.error('Error adding psychologist:', error);
          toast({
            title: "Error",
            description: error.message || error.details || "No se pudo agregar el psicólogo",
            variant: "destructive"
          });
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

  const handleRemoveClick = (relationId: string, psychologistName: string) => {
    setRelationToRemove({ id: relationId, name: psychologistName });
    setRemoveDialogOpen(true);
  };

  const handleRemoveRelation = async () => {
    if (!relationToRemove) return;

    try {
      const { error } = await supabase
        .from('patient_psychologists')
        .delete()
        .eq('id', relationToRemove.id);

      if (error) throw error;

      toast({
        title: "Psicólogo desvinculado",
        description: "El psicólogo ha sido removido exitosamente",
      });

      setRemoveDialogOpen(false);
      setRelationToRemove(null);
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
    <>
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desvincular psicólogo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres desvincular a {relationToRemove?.name}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRelation}
              className="bg-red-600 hover:bg-red-700"
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {/* Debug info */}
            <p className="text-xs text-blue-petrol/40 mt-4">
              Debug: relations.length = {relations.length}, loading = {loading ? 'true' : 'false'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Debug info */}
            <div className="text-xs text-blue-petrol/40 mb-2">
              Mostrando {relations.length} psicólogo(s) vinculado(s)
            </div>
            {relations.map((relation) => {
              console.log('Rendering relation:', relation);
              return (
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
                        {relation.psychologist?.first_name || 'Sin nombre'} {relation.psychologist?.last_name || ''}
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
                    {/* Debug info - solo en desarrollo */}
                    {!relation.psychologist && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ No se pudo cargar información del psicólogo
                      </p>
                    )}
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
                    onClick={() => handleRemoveClick(
                      relation.id,
                      `${relation.psychologist?.first_name || ''} ${relation.psychologist?.last_name || ''}`.trim() || 'este psicólogo'
                    )}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

