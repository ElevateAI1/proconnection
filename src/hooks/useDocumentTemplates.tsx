import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from './use-toast';

interface Template {
  id: string;
  psychologist_id: string;
  name: string;
  document_type: string;
  template_content: any;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useDocumentTemplates = (psychologistId?: string) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { psychologist } = useProfile();

  // Determine the correct psychologist ID to use
  const effectivePsychologistId = psychologistId || psychologist?.id;

  useEffect(() => {
    if (effectivePsychologistId) {
      fetchTemplates();
    } else {
      console.log('Missing psychologist ID:', { psychologistId, psychologist });
      setLoading(false);
    }
  }, [effectivePsychologistId]);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates for psychologist:', effectivePsychologistId);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('psychologist_id', effectivePsychologistId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      console.log('Templates fetched:', data);
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas de documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (newTemplate: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'psychologist_id'>) => {
    try {
      console.log('Creating template:', newTemplate);
      
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          ...newTemplate,
          psychologist_id: effectivePsychologistId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }
      
      console.log('Template created:', data);
      setTemplates(prev => [...prev, data]);
      toast({
        title: "Plantilla creada",
        description: `Se ha creado la plantilla "${newTemplate.name}"`,
      });
      return data;
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la plantilla",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<Omit<Template, 'id' | 'created_at' | 'updated_at' | 'psychologist_id'>>) => {
    try {
      console.log('Updating template:', { templateId, updates });
      
      const { data, error } = await supabase
        .from('document_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        throw error;
      }
      
      console.log('Template updated:', data);
      setTemplates(prev => prev.map(template => template.id === templateId ? data : template));
      toast({
        title: "Plantilla actualizada",
        description: `Se ha actualizado la plantilla "${data.name}"`,
      });
      return data;
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la plantilla",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      console.log('Deleting template:', templateId);
      
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }
      
      console.log('Template deleted:', templateId);
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se ha eliminado correctamente",
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la plantilla",
        variant: "destructive"
      });
      throw error;
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      console.log('Duplicating template:', template);

      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          psychologist_id: effectivePsychologistId,
          name: `${template.name} (Copia)`,
          document_type: template.document_type,
          template_content: template.template_content,
          is_active: template.is_active,
          is_default: template.is_default
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error duplicating template:', error);
        throw error;
      }

      console.log('Template duplicated:', data);
      setTemplates(prev => [...prev, data]);
      toast({
        title: "Plantilla duplicada",
        description: `Se ha duplicado la plantilla "${template.name}"`,
      });
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo duplicar la plantilla",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createPatientEditableDocument = async (templateId: string, patientId: string, editableUntilDays: number = 7) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const editDeadline = new Date();
      editDeadline.setDate(editDeadline.getDate() + editableUntilDays);

      const { data, error } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: patientId,
          psychologist_id: effectivePsychologistId,
          title: template.name,
          type: template.document_type,
          content: {},
          template_content: template.template_content,
          status: 'draft',
          patient_can_edit: true,
          patient_edit_deadline: editDeadline.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Documento editable creado",
        description: `Se ha enviado el documento "${template.name}" al paciente para completar`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating patient editable document:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el documento editable",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createPatientEditableDocument
  };
};
