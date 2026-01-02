
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  psychologist_id: string;
  title: string;
  description: string;
  type: 'technical' | 'feature' | 'billing' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  response_time?: number;
  resolved_at?: string;
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
}

export const useTicketSystem = () => {
  const { psychologist } = useProfile();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching tickets:', fetchError);
        setError('Error al cargar tickets');
        setTickets([]);
        return;
      }

      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Error al cargar tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: {
    title: string;
    description: string;
    type: SupportTicket['type'];
    priority: SupportTicket['priority'];
  }) => {
    if (!psychologist?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const { data: newTicket, error: createError } = await supabase
        .from('support_tickets')
        .insert({
          psychologist_id: psychologist.id,
          title: ticketData.title,
          description: ticketData.description,
          type: ticketData.type,
          priority: ticketData.priority,
          status: 'open'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating ticket:', createError);
        const errorMessage = createError.message || 'Error al crear ticket';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        return { data: null, error: errorMessage };
      }

      // Refresh tickets list
      await fetchTickets();
      
      toast({
        title: "Ticket creado",
        description: "Tu solicitud ha sido enviada. Te responderemos pronto.",
      });

      return { data: newTicket, error: null };
    } catch (err) {
      console.error('Error creating ticket:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear ticket';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [psychologist?.id]);

  return {
    tickets,
    loading,
    submitting,
    error,
    createTicket,
    refetch: fetchTickets
  };
};
