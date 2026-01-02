import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Edit3, Save, X, Trash2, Plus, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

interface PatientDocument {
  id: string;
  patient_id: string;
  psychologist_id: string;
  type: string;
  title: string;
  content: Record<string, any>;
  status: 'draft' | 'completed' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date?: string;
  workflow_step: number;
  created_at: string;
  updated_at: string;
}

interface PatientEditableDocumentsProps {
  patientId: string;
}

export const PatientEditableDocuments: React.FC<PatientEditableDocumentsProps> = ({ patientId }) => {
  const { psychologist } = useProfile();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDocument, setEditingDocument] = useState<PatientDocument | null>(null);
  const [newDocumentType, setNewDocumentType] = useState('');
  const [showNewDocumentForm, setShowNewDocumentForm] = useState(false);

  const documentTypes = [
    { value: 'assessment', label: 'Evaluación Psicológica' },
    { value: 'treatment_plan', label: 'Plan de Tratamiento' },
    { value: 'progress_report', label: 'Informe de Progreso' },
    { value: 'consent', label: 'Consentimiento Informado' },
    { value: 'discharge', label: 'Informe de Alta' }
  ];

  const fetchDocuments = async () => {
    if (!psychologist?.id || !patientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', psychologist.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast content from Json to Record<string, any>
      const typedDocuments = (data || []).map(doc => ({
        ...doc,
        content: doc.content as Record<string, any>
      })) as PatientDocument[];
      
      setDocuments(typedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [psychologist?.id, patientId]);

  const handleCreateDocument = async (type: string, title: string) => {
    if (!psychologist?.id) return;

    try {
      const { data, error } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: patientId,
          psychologist_id: psychologist.id,
          type,
          title,
          content: {},
          status: 'draft',
          priority: 'normal',
          workflow_step: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Cast content from Json to Record<string, any>
      const typedDocument = {
        ...data,
        content: data.content as Record<string, any>
      } as PatientDocument;

      setDocuments(prev => [typedDocument, ...prev]);
      setShowNewDocumentForm(false);
      setNewDocumentType('');
      
      toast({
        title: "✅ Documento creado",
        description: "El documento se ha creado correctamente"
      });
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo crear el documento",
        variant: "destructive"
      });
    }
  };

  const handleSaveDocument = async (document: PatientDocument) => {
    try {
      const { error } = await supabase
        .from('patient_documents')
        .update({
          title: document.title,
          content: document.content,
          status: document.status,
          priority: document.priority,
          due_date: document.due_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id);

      if (error) throw error;

      setDocuments(prev => prev.map(doc => 
        doc.id === document.id ? { ...document, updated_at: new Date().toISOString() } : doc
      ));
      
      setEditingDocument(null);
      
      toast({
        title: "✅ Documento guardado",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('patient_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "✅ Documento eliminado",
        description: "El documento se ha eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Documentos del Paciente
        </h2>
        <Button 
          onClick={() => setShowNewDocumentForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Documento
        </Button>
      </div>

      {showNewDocumentForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Crear Nuevo Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select value={newDocumentType} onValueChange={setNewDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const selectedType = documentTypes.find(t => t.value === newDocumentType);
                  if (selectedType) {
                    handleCreateDocument(newDocumentType, selectedType.label);
                  }
                }}
                disabled={!newDocumentType}
              >
                Crear Documento
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewDocumentForm(false);
                  setNewDocumentType('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{document.title}</h3>
                    <p className="text-sm text-slate-600">
                      Creado: {new Date(document.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(document.status)}>
                    {document.status === 'draft' ? 'Borrador' : 
                     document.status === 'completed' ? 'Completado' : 'Archivado'}
                  </Badge>
                  <Badge className={getPriorityColor(document.priority)}>
                    {document.priority === 'urgent' ? 'Urgente' : 
                     document.priority === 'high' ? 'Alta' : 
                     document.priority === 'normal' ? 'Normal' : 'Baja'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingDocument(document)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El documento será eliminado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteDocument(document.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                <p>Última modificación: {new Date(document.updated_at).toLocaleDateString()}</p>
                {document.due_date && (
                  <p className="flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    Fecha límite: {new Date(document.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 mb-4">No hay documentos creados para este paciente</p>
            <Button onClick={() => setShowNewDocumentForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primer documento
            </Button>
          </CardContent>
        </Card>
      )}

      {editingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Editar Documento</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setEditingDocument(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingDocument.title}
                  onChange={(e) => setEditingDocument({
                    ...editingDocument,
                    title: e.target.value
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select 
                    value={editingDocument.status} 
                    onValueChange={(value: 'draft' | 'completed' | 'archived') => 
                      setEditingDocument({
                        ...editingDocument,
                        status: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-priority">Prioridad</Label>
                  <Select 
                    value={editingDocument.priority} 
                    onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                      setEditingDocument({
                        ...editingDocument,
                        priority: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-due-date">Fecha límite (opcional)</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editingDocument.due_date?.split('T')[0] || ''}
                  onChange={(e) => setEditingDocument({
                    ...editingDocument,
                    due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                  })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSaveDocument(editingDocument)}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
