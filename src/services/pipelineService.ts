export interface PipelineAnalysisResult {
  importe_total: number;
  moneda: string;
  fecha: string;
  emisor: string;
  receptor: string;
  tipo_comprobante?: string;
  metodo_pago?: string;
  cuit_paciente?: string;
  numero_comprobante?: string;
  es_valido: boolean;
  nivel_riesgo: number;
  confidence_score: number;
  razonamiento_fraude: string;
}

export interface PipelineExtractionResult {
  amount: number;
  receipt_date: string;
  receipt_type?: string;
  receipt_number?: string;
  payment_method?: string;
  patient_cuit?: string;
  issuer_name?: string;
  receiver_name?: string;
  extraction_method: string;
  confidence: number;
}

