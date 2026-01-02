import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface ResultCardProps {
  result: AnalysisResult;
  isAiMode: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isAiMode }) => {
  const isRisky = result.nivel_riesgo > 50 || !result.es_valido;
  const riskColor = isRisky ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
  const riskBorder = isRisky ? 'border-red-500' : 'border-emerald-500';
  const isLowConfidence = result.confidence_score !== undefined && result.confidence_score < 0.7;

  const [showDebug, setShowDebug] = useState(false);

  // Constants for Gemini Flash Pricing (Hardcoded for visualization consistency)
  const COST_INPUT_1M = 0.075;
  const COST_OUTPUT_1M = 0.30;
  
  // Gemini Standard Image Token Cost is usually 258 tokens
  const IMG_TOKEN_COST = 258;

  return (
    <div className="mt-8 animate-fade-in-up">
      {/* Header Status */}
      <div className={`p-6 rounded-t-xl border-t-4 ${riskBorder} bg-white shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Resultado del Análisis</h2>
            <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold tracking-wide text-indigo-500 bg-indigo-50 rounded-full border border-indigo-100">
                    {result.detected_profile || (isAiMode ? "Modo Cloud" : "Modo Local")}
                </span>
                {result.estimated_cost_usd !== undefined && (
                     <span className="inline-block px-2 py-1 text-xs font-mono font-semibold tracking-wide text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100">
                        Gasto Real: ${result.estimated_cost_usd.toFixed(6)} USD
                    </span>
                )}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-bold flex items-center gap-2 self-start ${riskColor}`}>
            {isRisky ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>ALTO RIESGO</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>VÁLIDO</span>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-b-xl border border-t-0 border-slate-100 p-6">
        
        {/* Risk Score */}
        <div className="mb-8">
            <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                <span>Score de Integridad</span>
                <span>{Math.max(0, 100 - result.nivel_riesgo)}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${isRisky ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.max(5, 100 - result.nivel_riesgo)}%` }}
                ></div>
            </div>
        </div>
        
        {isLowConfidence && !isRisky && (
             <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
                <div className="text-sm">
                    <strong>Revisión Manual:</strong> La imagen es borrosa o compleja. Confirma el monto visualmente.
                </div>
             </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Datos Extraídos</h3>
                <div className="space-y-2">
                    {/* Importe */}
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="text-slate-500 text-sm">Importe</span>
                        <span className="text-xl font-bold text-slate-800">
                             {result.moneda} {result.importe_total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Emisor & Receptor */}
                    <div className="grid grid-cols-1 gap-2">
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase">De (Emisor)</span>
                            <span className="font-semibold text-slate-700 text-sm truncate" title={result.emisor || "No detectado"}>
                                {result.emisor || "No detectado"}
                            </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase">Para (Receptor)</span>
                            <span className="font-semibold text-slate-700 text-sm truncate" title={result.receptor || "No detectado"}>
                                {result.receptor || "No detectado"}
                            </span>
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 uppercase">Fecha</span>
                        <span className="font-semibold text-slate-700 text-sm">{result.fecha}</span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Análisis Técnico</h3>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 h-full text-sm text-slate-600 overflow-y-auto max-h-56">
                    <p>{result.razonamiento_fraude}</p>
                    {result.applied_rules && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase">Reglas RAG:</span>
                            <ul className="list-disc pl-4 text-xs mt-1">
                                {result.applied_rules.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- SECTION: REAL CONSUMPTION SIMULATION --- */}
        {(isAiMode && result.usage_metadata) && (
            <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
                <button 
                    onClick={() => setShowDebug(!showDebug)}
                    className="w-full bg-slate-50 hover:bg-slate-100 p-3 flex justify-between items-center text-xs font-semibold text-slate-600 transition-colors"
                >
                    <span>📊 TICKET DE CONSUMO (SIMULACIÓN REAL)</span>
                    <span>{showDebug ? '▼' : '▶'}</span>
                </button>
                
                {showDebug && (
                    <div className="bg-white p-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Visual Breakdown */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase">Composición del Costo</h4>
                                
                                {/* Input Bar */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-indigo-600 font-medium">Input (Prompt + Imagen)</span>
                                        <span className="text-slate-500">{result.usage_metadata.prompt_tokens} tokens</span>
                                    </div>
                                    <div className="h-2 flex rounded-full overflow-hidden bg-slate-100">
                                        {/* Image Portion (Approx 258 tokens usually) */}
                                        <div 
                                            className="bg-purple-400 h-full" 
                                            style={{ width: `${Math.min(100, (IMG_TOKEN_COST / result.usage_metadata.prompt_tokens) * 100)}%` }} 
                                            title="Costo de Imagen (~258 tokens)"
                                        ></div>
                                        {/* Text Portion */}
                                        <div className="bg-indigo-500 h-full flex-grow" title="Texto, Prompt y Reglas RAG"></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Imagen (~{IMG_TOKEN_COST})</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Texto (~{result.usage_metadata.prompt_tokens - IMG_TOKEN_COST})</span>
                                    </div>
                                </div>

                                {/* Output Bar */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-emerald-600 font-medium">Output (Respuesta JSON)</span>
                                        <span className="text-slate-500">{result.usage_metadata.candidates_tokens} tokens</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Mathematical Formula */}
                            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[10px] text-slate-600">
                                <h4 className="text-xs font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-1">Fórmula de Facturación (Flash)</h4>
                                
                                <div className="flex justify-between py-1">
                                    <span>INPUT:</span>
                                    <span>({result.usage_metadata.prompt_tokens} / 1M) × ${COST_INPUT_1M}</span>
                                </div>
                                <div className="text-right font-bold text-indigo-600 mb-2">
                                    = ${(result.usage_metadata.prompt_tokens / 1_000_000 * COST_INPUT_1M).toFixed(7)}
                                </div>

                                <div className="flex justify-between py-1">
                                    <span>OUTPUT:</span>
                                    <span>({result.usage_metadata.candidates_tokens} / 1M) × ${COST_OUTPUT_1M}</span>
                                </div>
                                <div className="text-right font-bold text-emerald-600 mb-2">
                                    = ${(result.usage_metadata.candidates_tokens / 1_000_000 * COST_OUTPUT_1M).toFixed(7)}
                                </div>

                                <div className="border-t border-slate-300 pt-1 mt-1 flex justify-between items-center">
                                    <span className="font-bold text-slate-800">TOTAL:</span>
                                    <span className="text-sm font-bold text-slate-900 bg-yellow-100 px-1 rounded">
                                        ${result.estimated_cost_usd?.toFixed(6)} USD
                                    </span>
                                </div>
                                <p className="mt-2 text-slate-400 italic text-[9px]">
                                    * Cálculo basado en tarifas de Gemini 1.5 Flash.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Raw Text Debug for Local Mode */}
        {!isAiMode && result.debug_texto_crudo && (
             <div className="mt-4 border-t pt-4">
                <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-slate-500 underline">Ver Texto OCR Crudo</button>
                {showDebug && <pre className="mt-2 text-[10px] bg-slate-100 p-2 overflow-x-auto">{result.debug_texto_crudo}</pre>}
             </div>
        )}

      </div>
    </div>
  );
};