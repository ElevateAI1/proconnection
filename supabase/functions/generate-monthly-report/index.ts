
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { psychologist_id, month, year } = await req.json()

    console.log(`=== GENERATING MONTHLY REPORT ===`)
    console.log(`Psychologist: ${psychologist_id}, Period: ${month}/${year}`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calcular fechas del mes correctamente
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Último día del mes
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    console.log(`Date range: ${startDateStr} to ${endDateStr}`)

    // Obtener comprobantes del mes - incluir TODOS los estados válidos
    const { data: receipts, error: receiptsError } = await supabaseClient
      .from('payment_receipts')
      .select('*')
      .eq('psychologist_id', psychologist_id)
      .gte('receipt_date', startDateStr)
      .lte('receipt_date', endDateStr)
      .in('validation_status', ['approved', 'pending'])
      .eq('include_in_report', true)

    if (receiptsError) {
      console.error('Error fetching receipts:', receiptsError)
      throw receiptsError
    }

    console.log(`Found ${receipts?.length || 0} receipts for the period`)

    // Separar comprobantes por estado de validación
    const approvedReceipts = receipts?.filter(r => r.validation_status === 'approved') || []
    const pendingReceipts = receipts?.filter(r => r.validation_status === 'pending') || []

    // Calcular totales
    const totalAmountApproved = approvedReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0)
    const totalAmountPending = pendingReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0)
    const totalAmount = totalAmountApproved + totalAmountPending
    const totalReceipts = receipts?.length || 0

    console.log(`Approved: ${approvedReceipts.length} receipts, $${totalAmountApproved}`)
    console.log(`Pending: ${pendingReceipts.length} receipts, $${totalAmountPending}`)
    console.log(`Total: ${totalReceipts} receipts, $${totalAmount}`)

    // Agrupar por método de pago
    const amountByPaymentMethod = (receipts || []).reduce((acc, receipt) => {
      const method = receipt.payment_method || 'no_especificado'
      acc[method] = (acc[method] || 0) + (receipt.amount || 0)
      return acc
    }, {} as Record<string, number>)

    // Agrupar por tipo de comprobante
    const amountByReceiptType = (receipts || []).reduce((acc, receipt) => {
      const type = receipt.receipt_type || 'no_especificado'
      acc[type] = (acc[type] || 0) + (receipt.amount || 0)
      return acc
    }, {} as Record<string, number>)

    // Calcular acumulado anual hasta este mes
    const { data: annualData, error: annualError } = await supabaseClient
      .from('payment_receipts')
      .select('amount')
      .eq('psychologist_id', psychologist_id)
      .gte('receipt_date', `${year}-01-01`)
      .lte('receipt_date', endDateStr)
      .eq('validation_status', 'approved')
      .eq('include_in_report', true)

    if (annualError) {
      console.error('Error calculating annual data:', annualError)
    }

    const annualAccumulated = (annualData || []).reduce((sum, receipt) => sum + (receipt.amount || 0), 0)

    console.log(`Annual accumulated through ${month}/${year}: $${annualAccumulated}`)

    // Contar comprobantes por estado de procesamiento
    const autoApprovedCount = approvedReceipts.filter(r => r.auto_approved === true).length
    const manuallyReviewedCount = approvedReceipts.filter(r => r.auto_approved !== true).length

    // Detectar alertas de monotributo (ejemplo básico)
    let monotaxAlert = null
    if (annualAccumulated > 8000000) { // Ejemplo: límite alto
      monotaxAlert = {
        level: 'critical',
        message: `Acumulado anual alto: $${annualAccumulated.toLocaleString()}. Revisar categoría de monotributo.`,
        percentage: Math.round((annualAccumulated / 10000000) * 100)
      }
    } else if (annualAccumulated > 6000000) {
      monotaxAlert = {
        level: 'warning',
        message: `Acumulado anual: $${annualAccumulated.toLocaleString()}. Monitorear límites.`,
        percentage: Math.round((annualAccumulated / 10000000) * 100)
      }
    }

    // Crear o actualizar el reporte
    const reportData = {
      psychologist_id,
      report_month: month,
      report_year: year,
      total_amount: totalAmount,
      total_receipts: totalReceipts,
      amount_by_payment_method: amountByPaymentMethod,
      amount_by_receipt_type: amountByReceiptType,
      annual_accumulated: annualAccumulated,
      auto_approved_receipts: autoApprovedCount,
      manually_reviewed_receipts: manuallyReviewedCount,
      generation_date: new Date().toISOString(),
      status: 'generated',
      monotax_alert: monotaxAlert
    }

    console.log('Creating/updating report with data:', reportData)

    const { data: report, error: reportError } = await supabaseClient
      .from('accounting_reports')
      .upsert(reportData, {
        onConflict: 'psychologist_id,report_month,report_year'
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating/updating report:', reportError)
      throw reportError
    }

    console.log('✅ Report generated successfully:', report.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        summary: {
          period: `${month}/${year}`,
          totalAmount,
          totalReceipts,
          approvedReceipts: approvedReceipts.length,
          pendingReceipts: pendingReceipts.length,
          annualAccumulated,
          monotaxAlert
        },
        message: `Reporte mensual de ${month}/${year} generado exitosamente` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in generate-monthly-report:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Check edge function logs for more information'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
