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
  const onUpdateRef = useRef(onUpdate);
  const setupRef = useRef<() => void>(() => {});
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxFailures = 3;
  const silentPeriod = 60000; // 1 minuto de silencio despues de fallar

  // Mantener onUpdate en un ref para no recrear el canal en cada render
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        // Ignorar errores de cleanup
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback(() => {
    if (retryTimeoutRef.current) return;
    const attempt = failureCountRef.current + 1;
    const delay = Math.min(1000 * attempt, 5000); // backoff lineal hasta 5s
    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null;
      if (mountedRef.current && enabled && isRealtimeEnabled && !isChannelDisabled(channelName) && table) {
        setupRef.current();
      }
    }, delay);
  }, [enabled, isRealtimeEnabled, isChannelDisabled, channelName, table]);

  const setup = useCallback(() => {
    // No configurar si realtime está deshabilitado globalmente o el canal específico está deshabilitado
    if (!enabled || !table || !mountedRef.current || !isRealtimeEnabled || isChannelDisabled(channelName)) {
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

    // Si ya hay un canal activo y suscrito, no crear otro
    if (channelRef.current && isSubscribedRef.current) {
      return;
    }

    // Si hay un canal previo no suscrito, limpiarlo
    if (channelRef.current && !isSubscribedRef.current) {
      cleanup();
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
            if (mountedRef.current && onUpdateRef.current) {
              const eventType =
                payload.eventType ||
                (payload.new ? 'INSERT' : payload.old ? 'DELETE' : 'UPDATE');

              console.log(`[REALTIME] Event recibido en canal ${channelName}:`, {
                eventType,
                table,
                filter,
                payload: {
                  new: payload.new?.id
                    ? { id: payload.new.id, sender_id: payload.new.sender_id, conversation_id: payload.new.conversation_id }
                    : null,
                  old: payload.old?.id ? { id: payload.old.id } : null
                }
              });

              const enhancedPayload = {
                ...payload,
                eventType
              };

              onUpdateRef.current(enhancedPayload);
            }
          }
        )
        .subscribe((status, err) => {
          console.log(`[REALTIME] Canal ${channelName} - Status: ${status}`, err || '');
          if (status === 'SUBSCRIBED') {
            console.log(`[REALTIME] Suscrito a ${channelName} para tabla ${table} con filtro: ${filter || 'ninguno'}`);
            isSubscribedRef.current = true;
            failureCountRef.current = 0; // Reset en conexion exitosa
          } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
            if (mountedRef.current) {
              isSubscribedRef.current = false;
              channelRef.current = null;
              scheduleRetry();
            }
          } else if (status === 'CHANNEL_ERROR') {
            isSubscribedRef.current = false;
            channelRef.current = null;

            const errMessage = err?.message || err?.toString() || String(err || '');
            const isBindingError =
              errMessage.includes('mismatch between server and client bindings') ||
              errMessage.includes('bindings');

            if (isBindingError) {
              disableChannel(channelName);
              return;
            }

            failureCountRef.current++;
            lastErrorTimeRef.current = Date.now();
            console.error(`Channel error: ${channelName}`, err);

            if (failureCountRef.current >= maxFailures) {
              disableChannel(channelName);
            } else {
              scheduleRetry();
            }
          }
        });

      channelRef.current = channel;
    } catch (error) {
      failureCountRef.current++;
      lastErrorTimeRef.current = Date.now();

      if (failureCountRef.current >= maxFailures) {
        disableChannel(channelName);
      } else {
        scheduleRetry();
      }
    }
  }, [channelName, enabled, table, filter, schema, isRealtimeEnabled, isChannelDisabled, disableChannel, cleanup, scheduleRetry]);

  // Mantener referencia actualizada para reintentos
  useEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  useEffect(() => {
    mountedRef.current = true;

    // Siempre limpiar y reconfigurar cuando cambien deps relevantes
    cleanup();
    if (enabled && isRealtimeEnabled && !isChannelDisabled(channelName) && table) {
      setup();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isRealtimeEnabled, channelName, table, filter]);

  return {
    isSubscribed: isSubscribedRef.current,
    cleanup,
    isDisabled: isChannelDisabled(channelName)
  };
};
