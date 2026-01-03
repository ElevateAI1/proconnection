import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTypingIndicatorProps {
  conversationId: string | null;
  userId: string;
  enabled?: boolean;
  onTypingChange?: (isTyping: boolean, userId: string) => void;
}

export const useTypingIndicator = ({ 
  conversationId, 
  userId, 
  enabled = true,
  onTypingChange
}: UseTypingIndicatorProps) => {
  const channelRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled || !conversationId || !userId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: {
        broadcast: { self: false }
      }
    });

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId: senderId, isTyping: typing } = payload.payload || {};
        if (senderId && senderId !== userId && onTypingChange) {
          onTypingChange(typing, senderId);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Canal listo
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [conversationId, enabled, userId, onTypingChange]);

  const sendTyping = useCallback(() => {
    if (!channelRef.current || !conversationId || !userId) return;

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Si no estaba escribiendo, enviar señal de comenzar a escribir
    if (!isTyping) {
      setIsTyping(true);
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, conversationId, isTyping: true }
      });
    }

    // Después de 3 segundos sin escribir más, enviar señal de dejar de escribir
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, conversationId, isTyping: false }
        });
      }
    }, 3000);
  }, [conversationId, userId, isTyping]);

  // Función para detener typing (usar cuando se envía un mensaje)
  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isTyping && channelRef.current) {
      setIsTyping(false);
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, conversationId, isTyping: false }
      });
    }
  }, [conversationId, userId, isTyping]);

  return { sendTyping, stopTyping, isTyping };
};

