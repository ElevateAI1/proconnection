import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { analyzeReceipt } from './services/geminiService';
import { analyzeReceiptLocal } from './services/localService';
import { analyzeBillingPipeline } from './services/pipelineService';
import { convertPdfToImage, resizeImage } from './utils/pdfUtils';
import { AnalysisResult } from './types';

type AnalysisMode = 'simple-cloud' | 'billing-pipeline' | 'local';

const MODE_INFO = {
  'simple-cloud': {
    title: "Estándar (Single Shot)",
    description: "Envía el documento directamente a Gemini 3 Flash con un prompt general. Rápido y eficiente para la mayoría de los casos.",
    tech: "Gemini 3 Flash",
    cost: "Bajo (~$0.0002)"
  },
  'billing-pipeline': {
    title: "Arquitectura Enterprise (RAG)",
    description: "Flujo de 3 pasos: 1. Clasifica el Emisor → 2. Recupera reglas específicas (RAG) → 3. Valida y Extrae. Máxima seguridad fiscal.",
    tech: "Gemini 3 Flash + RAG Simulado",
    cost: "Medio (~$0.0003)"
  },
  'local': {
    title: "Procesamiento Local (Offline)",
    description: "Ejecuta OCR (Tesseract.js) en el navegador. Privacidad total, sin costo de API, pero menor precisión en documentos complejos.",
    tech: "Tesseract.js / Regex",
    cost: "Gratis ($0.00)"
  }
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<AnalysisMode>('simple-cloud');

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadingStep("Procesando imagen...");
    setError(null);
    setResult(null);

    try {
      let base64Image: string;
      let mimeType: string = file.type;

      // Determine scale based on mode. Local OCR needs higher resolution (3.0) than Gemini (2.0 is enough)
      const renderScale = mode === 'local' ? 3.0 : 2.0;

      if (file.type === 'application/pdf') {
        base64Image = await convertPdfToImage(file, renderScale);
        mimeType = 'image/jpeg';
      } else if (file.type.startsWith('image/')) {
        let rawBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const res = reader.result as string;
                resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        
        // Resize massive images to prevent API errors (aim for max 1536px if in Cloud mode)
        if (mode !== 'local') {
            base64Image = await resizeImage(rawBase64, 1536);
        } else {
            base64Image = rawBase64;
        }
      } else {
        throw new Error('Formato no soportado. Por favor sube un PDF o una imagen (JPG, PNG).');
      }

      let analysis: AnalysisResult;
      
      if (mode === 'billing-pipeline') {
          // New Pipeline Mode
          analysis = await analyzeBillingPipeline(base64Image, mimeType, (step) => setLoadingStep(step));
      } else if (mode === 'simple-cloud') {
          // Standard Gemini Mode
          setLoadingStep("Analizando con Gemini 3 Flash...");
          analysis = await analyzeReceipt(base64Image, mimeType);
      } else {
          // Local Tesseract Mode
          setLoadingStep("Ejecutando OCR Local...");
          analysis = await analyzeReceiptLocal(base64Image, mimeType);
      }
      
      setResult(analysis);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al procesar el archivo.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  }, [mode]);

  // Global Paste Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1 || item.type === 'application/pdf') {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
            break; 
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isLoading, handleFileSelect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                VeriScan <span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-slate-600 max-w-lg mx-auto mb-6">
                Plataforma de validación fiscal.
            </p>

            {/* Mode Tabs */}
            <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 inline-flex">
                    <button
                        onClick={() => setMode('simple-cloud')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                            ${mode === 'simple-cloud' ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                        </svg>
                        Estándar
                    </button>
                    
                    <button
                        onClick={() => setMode('billing-pipeline')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                            ${mode === 'billing-pipeline' ? 'bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm0 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" clipRule="evenodd" />
                        </svg>
                        Pipeline Facturación (RAG)
                    </button>

                    <button
                        onClick={() => setMode('local')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                            ${mode === 'local' ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                        </svg>
                        Local
                    </button>
                </div>
                
                {/* Mode Description Box */}
                <div className="text-sm text-slate-500 bg-white/50 border border-slate-100 px-4 py-2 rounded-lg flex gap-4 items-center animate-fade-in">
                    <span className="font-semibold text-slate-700">{MODE_INFO[mode].title}:</span>
                    <span>{MODE_INFO[mode].description}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-500 ml-auto">
                        Costo: {MODE_INFO[mode].cost}
                    </span>
                </div>
            </div>
        </header>

        {/* Main Interface */}
        <main className="space-y-8">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            
            {/* Pipeline Step Indicator */}
            {isLoading && mode === 'billing-pipeline' && (
                <div className="flex justify-center animate-pulse">
                    <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-purple-200">
                        {loadingStep}
                    </span>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm animate-fade-in-up">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {result && <ResultCard result={result} isAiMode={mode !== 'local'} />}
        </main>
        
        {/* Footer */}
        <footer className="mt-16 text-center text-slate-400 text-sm">
            <p>© {new Date().getFullYear()} VeriScan AI. Powered by Google Gemini & Tesseract JS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;