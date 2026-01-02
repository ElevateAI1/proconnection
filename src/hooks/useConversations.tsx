
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  patient_id: string;
  psychologist_id: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useConversations = (psychologistId?: string, patientId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const createOrGetConversation = async (psychologistId: string, patientId: string) => {
    try {
      // First, check if conversation already exists
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .eq('patient_id', patientId)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error searching for conversation:', searchError);
        throw searchError;
      }

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation);
        return existingConversation;
      }

      // Create new conversation if it doesn't exist
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          psychologist_id: psychologistId,
          patient_id: patientId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw createError;
      }

      console.log('Created new conversation:', newConversation);
      return newConversation;

    } catch (error) {
      console.error('Error in createOrGetConversation:', error);
      toast({
        title: "Error",
        description: "Error al crear o buscar la conversación",
        variant: "destructive"
      });
      return null;
    }
  };

  const sendMessage = async (conversationId: string, senderId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Error al enviar el mensaje",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    conversations,
    loading,
    createOrGetConversation,
    sendMessage
  };
};
