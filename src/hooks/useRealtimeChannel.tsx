
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeContext } from '@/contexts/RealtimeContext';

interface UseRealtimeChannelProps {
  channelName: string;
  enabled?: boolean;
  onUpdate?: (payload: any) => void;
  table?: string;
  filter?: string;
  schema?: string;
}

export const useRealtimeChannel = ({
  channelName,
  enabled = true,
  onUpdate,
  table,
  filter,
  schema = 'public'
}: UseRealtimeChannelProps) => {
  const { isRealtimeEnabled, isChannelDisabled, disableChannel } = useRealtimeContext();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const mountedRef = useRef(true);
  const failureCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const maxFailures = 3;
  const silentPeriod = 60000; // 1 minuto de silencio después de fallar

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        // Silenciar errores de limpieza
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  const setup = useCallback(() => {
    // No configurar si realtime está deshabilitado globalmente o el canal específico está deshabilitado
    if (!enabled || !table || !mountedRef.current || !isRealtimeEnabled || isChannelDisabled(channelName)) {
      return;
    }

    // Si ya hay un canal activo, no crear otro
    if (channelRef.current || isSubscribedRef.current) {
      return;
    }

    // Si hemos fallado muchas veces, no intentar de nuevo por un tiempo
    if (failureCountRef.current >= maxFailures) {
      const now = Date.now();
      if (now - lastErrorTimeRef.current < silentPeriod) {
        return;
      }
      // Reset después del período de silencio
      failureCountRef.current = 0;
    }

    try {
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: channelName }
        }
      });
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema,
            table,
            ...(filter && { filter })
          },
          (payload) => {
            if (mountedRef.current && onUpdate) {
              onUpdate(payload);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
            failureCountRef.current = 0; // Reset en conexión exitosa
          } else if (status === 'CLOSED') {
            isSubscribedRef.current = false;
            channelRef.current = null;
          } else if (status === 'CHANNEL_ERROR') {
            isSubscribedRef.current = false;
            channelRef.current = null;
            failureCountRef.current++;
            lastErrorTimeRef.current = Date.now();
            
            // Deshabilitar canal después de muchos fallos
            if (failureCountRef.current >= maxFailures) {
              disableChannel(channelName);
            }
          }
        });

      channelRef.current = channel;
    } catch (error) {
      failureCountRef.current++;
      lastErrorTimeRef.current = Date.now();
      
      if (failureCountRef.current >= maxFailures) {
        disableChannel(channelName);
      }
    }
  }, [channelName, enabled, table, filter, schema, onUpdate, isRealtimeEnabled, isChannelDisabled, disableChannel]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled && isRealtimeEnabled && !isChannelDisabled(channelName)) {
      setup();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [enabled, setup, cleanup, isRealtimeEnabled, isChannelDisabled, channelName]);

  return {
    isSubscribed: isSubscribedRef.current,
    cleanup,
    isDisabled: isChannelDisabled(channelName)
  };
};
