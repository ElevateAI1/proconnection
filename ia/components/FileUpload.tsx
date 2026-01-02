import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!isLoading && e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [isLoading, onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoading && e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden
        ${isLoading ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-70' : 'border-indigo-300 bg-white hover:bg-indigo-50 hover:border-indigo-500 cursor-pointer shadow-sm'}
      `}
    >
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      
      <div className="text-center p-6 space-y-4 pointer-events-none">
        <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full ${isLoading ? 'bg-slate-200' : 'bg-indigo-100 text-indigo-600'}`}>
          {isLoading ? (
             <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
            </svg>
          )}
        </div>
        
        <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-700">
                {isLoading ? 'Analizando Documento...' : 'Sube tu comprobante'}
            </p>
            <p className="text-sm text-slate-500">
                {isLoading 
                  ? 'Nuestra IA está verificando la autenticidad' 
                  : <>Arrastra, selecciona o <span className="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">Pega (Ctrl + V)</span> un archivo</>
                }
            </p>
        </div>
        
        {!isLoading && (
            <div className="flex gap-2 justify-center pt-2">
                <span className="px-2 py-1 bg-slate-100 text-xs text-slate-600 rounded">PDF</span>
                <span className="px-2 py-1 bg-slate-100 text-xs text-slate-600 rounded">JPG</span>
                <span className="px-2 py-1 bg-slate-100 text-xs text-slate-600 rounded">PNG</span>
            </div>
        )}
      </div>
    </div>
  );
};
