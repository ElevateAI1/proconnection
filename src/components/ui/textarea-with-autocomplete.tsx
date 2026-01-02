
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextareaWithAutocompleteProps 
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  suggestions: string[];
  isLoading: boolean;
  showSuggestions: boolean;
  selectedIndex: number;
  onGenerateSuggestions: (text: string, cursorPosition: number) => void;
  onHideSuggestions: () => void;
  onSelectSuggestion: (index: number) => string | null;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  getSelectedSuggestion: () => string | null;
  onManualGenerate?: () => void;
}

export const TextareaWithAutocomplete = forwardRef<
  HTMLTextAreaElement,
  TextareaWithAutocompleteProps
>(({
  suggestions,
  isLoading,
  showSuggestions,
  selectedIndex,
  onGenerateSuggestions,
  onHideSuggestions,
  onSelectSuggestion,
  onNavigateUp,
  onNavigateDown,
  getSelectedSuggestion,
  onManualGenerate,
  value,
  onChange,
  className,
  ...props
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Combinar refs
  const combinedRef = (node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    setCursorPosition(newCursorPosition);
    
    if (onChange) {
      onChange(e);
    }

    // Generar sugerencias automáticamente
    if (newValue.length > 10) {
      onGenerateSuggestions(newValue, newCursorPosition);
    } else {
      onHideSuggestions();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onNavigateUp();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onNavigateDown();
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          insertSuggestion(selectedIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onHideSuggestions();
        break;
    }
  };

  const insertSuggestion = (index: number) => {
    const suggestion = onSelectSuggestion(index);
    if (!suggestion || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const currentValue = textarea.value;
    const newValue = currentValue.slice(0, cursorPosition) + 
                    (cursorPosition > 0 && !currentValue[cursorPosition - 1]?.match(/\s/) ? ' ' : '') +
                    suggestion + 
                    currentValue.slice(cursorPosition);

    // Crear evento sintético para onChange
    const event = {
      target: {
        ...textarea,
        value: newValue
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;

    if (onChange) {
      onChange(event);
    }

    // Actualizar posición del cursor
    const newCursorPos = cursorPosition + suggestion.length + (cursorPosition > 0 && !currentValue[cursorPosition - 1]?.match(/\s/) ? 1 : 0);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);

    onHideSuggestions();
  };

  const handleManualGenerate = () => {
    if (onManualGenerate) {
      onManualGenerate();
    } else if (textareaRef.current) {
      const currentValue = textareaRef.current.value;
      const currentPos = textareaRef.current.selectionStart;
      onGenerateSuggestions(currentValue, currentPos);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Retrasar el ocultamiento para permitir clics en sugerencias
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        onHideSuggestions();
      }
    }, 150);
    
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            {...props}
            ref={combinedRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={cn(className)}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-none bg-transparent cursor-pointer",
                    index === selectedIndex && "bg-blue-50 text-blue-700"
                  )}
                  onClick={() => insertSuggestion(index)}
                  onMouseDown={(e) => e.preventDefault()} // Prevenir blur
                >
                  <div className="truncate">{suggestion}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleManualGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Sugerir</span>
        </Button>
      </div>
    </div>
  );
});

TextareaWithAutocomplete.displayName = "TextareaWithAutocomplete";
