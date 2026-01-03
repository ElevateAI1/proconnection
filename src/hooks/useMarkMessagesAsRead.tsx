
import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Guard global para todas las instancias del hook
const globalProcessingRef = new Map<string, Promise<boolean>>();

export const useMarkMessagesAsRead = () => {
  const markMessagesAsRead = async (conversationId: string, userId: string) => {
    const key = `${conversationId}-${userId}`;
    
    // Si ya hay una operación en curso, esperarla
    if (globalProcessingRef.has(key)) {
      return globalProcessingRef.get(key)!;
    }

    const promise = (async () => {
      try {
        // First, get all unread messages from the other person in this conversation
        const { data: unreadMessages, error: fetchError } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversationId)
          .neq('sender_id', userId)
          .is('read_at', null);

        if (fetchError) {
          console.error('Error fetching unread messages:', fetchError);
          return false;
        }

        if (!unreadMessages || unreadMessages.length === 0) {
          return true;
        }

        // Mark all these messages as read
        const messageIds = unreadMessages.map(msg => msg.id);
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', messageIds);

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
          toast({
            title: "Error",
            description: "Error al marcar mensajes como leídos",
            variant: "destructive"
          });
          return false;
        }

        return true;

      } catch (error) {
        console.error('Unexpected error marking messages as read:', error);
        return false;
      } finally {
        // Limpiar después de completar
        globalProcessingRef.delete(key);
      }
    })();

    globalProcessingRef.set(key, promise);
    return promise;
  };

  return { markMessagesAsRead };
};
