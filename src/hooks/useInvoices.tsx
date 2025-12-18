import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  psychologist_id: string;
  patient_id?: string;
  appointment_id?: string;
  payment_receipt_id?: string;
  invoice_type: 'A' | 'B' | 'C';
  point_of_sale: number;
  invoice_number: number;
  invoice_date: string;
  client_name: string;
  client_document_type?: string;
  client_document_number?: string;
  client_address?: string;
  client_email?: string;
  service_description: string;
  service_quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'generated' | 'sent' | 'cancelled' | 'voided';
  pdf_url?: string;
  pdf_file_path?: string;
  external_invoice_id?: string;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  appointment?: {
    id: string;
    appointment_date: string;
    type: string;
  };
}

export interface CreateInvoiceData {
  patient_id?: string;
  appointment_id?: string;
  payment_receipt_id?: string;
  invoice_type?: 'A' | 'B' | 'C';
  point_of_sale?: number;
  client_name: string;
  client_document_type?: string;
  client_document_number?: string;
  client_address?: string;
  client_email?: string;
  service_description: string;
  service_quantity?: number;
  unit_price: number;
  discount?: number;
  notes?: string;
}

export const useInvoices = (psychologistId?: string) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!user?.id && !psychologistId) return;

    setLoading(true);
    setError(null);

    try {
      const query = supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone),
          appointment:appointments(id, appointment_date, type)
        `)
        .order('invoice_date', { ascending: false })
        .order('invoice_number', { ascending: false });

      if (psychologistId) {
        query.eq('psychologist_id', psychologistId);
      } else if (user?.id) {
        query.eq('psychologist_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setInvoices(data || []);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las facturas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, psychologistId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getNextInvoiceNumber = useCallback(async (pointOfSale: number = 1): Promise<number> => {
    if (!user?.id && !psychologistId) throw new Error('No se pudo identificar al psicólogo');

    try {
      const { data, error: rpcError } = await supabase.rpc('get_next_invoice_number', {
        p_psychologist_id: psychologistId || user?.id,
        p_point_of_sale: pointOfSale,
      });

      if (rpcError) throw rpcError;

      return data || 1;
    } catch (err: any) {
      console.error('Error getting next invoice number:', err);
      throw err;
    }
  }, [user?.id, psychologistId]);

  const createInvoice = useCallback(async (invoiceData: CreateInvoiceData): Promise<Invoice> => {
    if (!user?.id && !psychologistId) throw new Error('No se pudo identificar al psicólogo');

    setLoading(true);
    setError(null);

    try {
      // Calcular subtotal y total
      const quantity = invoiceData.service_quantity || 1;
      const subtotal = quantity * invoiceData.unit_price;
      const discount = invoiceData.discount || 0;
      const totalAmount = subtotal - discount;

      // Obtener próximo número de factura
      const pointOfSale = invoiceData.point_of_sale || 1;
      const invoiceNumber = await getNextInvoiceNumber(pointOfSale);

      // Crear factura
      const { data, error: createError } = await supabase
        .from('invoices')
        .insert({
          psychologist_id: psychologistId || user?.id,
          patient_id: invoiceData.patient_id,
          appointment_id: invoiceData.appointment_id,
          payment_receipt_id: invoiceData.payment_receipt_id,
          invoice_type: invoiceData.invoice_type || 'C',
          point_of_sale: pointOfSale,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          client_name: invoiceData.client_name,
          client_document_type: invoiceData.client_document_type,
          client_document_number: invoiceData.client_document_number,
          client_address: invoiceData.client_address,
          client_email: invoiceData.client_email,
          service_description: invoiceData.service_description,
          service_quantity: quantity,
          unit_price: invoiceData.unit_price,
          subtotal: subtotal,
          discount: discount,
          total_amount: totalAmount,
          currency: 'ARS',
          status: 'draft',
          notes: invoiceData.notes,
        })
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone),
          appointment:appointments(id, appointment_date, type)
        `)
        .single();

      if (createError) throw createError;

      setInvoices((prev) => [data, ...prev]);

      toast({
        title: '✅ Factura creada',
        description: `Factura #${invoiceNumber} creada exitosamente`,
      });

      return data;
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      setError(err);
      toast({
        title: 'Error',
        description: err.message || 'No se pudo crear la factura',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, psychologistId, getNextInvoiceNumber]);

  const updateInvoice = useCallback(async (
    invoiceId: string,
    updates: Partial<CreateInvoiceData>
  ): Promise<Invoice> => {
    setLoading(true);
    setError(null);

    try {
      // Recalcular si se actualizan precios
      let updateData: any = { ...updates };

      if (updates.unit_price !== undefined || updates.service_quantity !== undefined || updates.discount !== undefined) {
        const currentInvoice = invoices.find((inv) => inv.id === invoiceId);
        if (currentInvoice) {
          const quantity = updates.service_quantity ?? currentInvoice.service_quantity;
          const unitPrice = updates.unit_price ?? currentInvoice.unit_price;
          const discount = updates.discount ?? currentInvoice.discount;
          const subtotal = quantity * unitPrice;
          const totalAmount = subtotal - discount;

          updateData = {
            ...updateData,
            service_quantity: quantity,
            unit_price: unitPrice,
            subtotal: subtotal,
            discount: discount,
            total_amount: totalAmount,
          };
        }
      }

      const { data, error: updateError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone),
          appointment:appointments(id, appointment_date, type)
        `)
        .single();

      if (updateError) throw updateError;

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? data : inv))
      );

      toast({
        title: '✅ Factura actualizada',
        description: 'La factura se actualizó exitosamente',
      });

      return data;
    } catch (err: any) {
      console.error('Error updating invoice:', err);
      setError(err);
      toast({
        title: 'Error',
        description: err.message || 'No se pudo actualizar la factura',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  const cancelInvoice = useCallback(async (
    invoiceId: string,
    reason?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { error: cancelError } = await supabase.rpc('cancel_invoice', {
        p_invoice_id: invoiceId,
        p_reason: reason || null,
      });

      if (cancelError) throw cancelError;

      // Actualizar estado local
      await fetchInvoices();

      toast({
        title: '✅ Factura cancelada',
        description: 'La factura se canceló exitosamente',
      });
    } catch (err: any) {
      console.error('Error cancelling invoice:', err);
      setError(err);
      toast({
        title: 'Error',
        description: err.message || 'No se pudo cancelar la factura',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInvoices]);

  const updateInvoiceStatus = useCallback(async (
    invoiceId: string,
    status: Invoice['status']
  ): Promise<Invoice> => {
    setLoading(true);
    setError(null);

    try {
      const updateData: any = { status };
      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone),
          appointment:appointments(id, appointment_date, type)
        `)
        .single();

      if (updateError) throw updateError;

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? data : inv))
      );

      return data;
    } catch (err: any) {
      console.error('Error updating invoice status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    cancelInvoice,
    updateInvoiceStatus,
    getNextInvoiceNumber,
  };
};

