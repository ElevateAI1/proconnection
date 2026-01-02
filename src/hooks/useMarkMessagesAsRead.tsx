
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useMarkMessagesAsRead = () => {
  const markMessagesAsRead = async (conversationId: string, userId: string) => {
    try {
      console.log('Marking messages as read for conversation:', conversationId, 'user:', userId);
      
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

      console.log('Found unread messages:', unreadMessages);

      if (!unreadMessages || unreadMessages.length === 0) {
        console.log('No unread messages to mark');
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

      console.log('Successfully marked', messageIds.length, 'messages as read');
      return true;

    } catch (error) {
      console.error('Unexpected error marking messages as read:', error);
      return false;
    }
  };

  return { markMessagesAsRead };
};
