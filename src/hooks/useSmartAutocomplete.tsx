
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

interface AutocompleteOptions {
  professionType: string;
  specialties: string[];
  yearsExperience?: number;
  firstName?: string;
  lastName?: string;
}

export const useSmartAutocomplete = (options: AutocompleteOptions) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const lastRequestRef = useRef<string>('');

  const debouncedGenerateSuggestions = useDebounce(async (
    text: string, 
    cursorPosition: number
  ) => {
    if (text.length < 10) return; // No generar sugerencias para textos muy cortos
    
    const requestKey = `${text}-${cursorPosition}`;
    if (lastRequestRef.current === requestKey) return;
    
    lastRequestRef.current = requestKey;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-autocomplete-suggestions', {
        body: {
          currentText: text,
          cursorPosition,
          professionType: options.professionType,
          specialties: options.specialties,
          yearsExperience: options.yearsExperience || 0,
          firstName: options.firstName || '',
          lastName: options.lastName || ''
        }
      });

      if (error) {
        console.error('Error generating suggestions:', error);
        return;
      }

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  const generateSuggestions = useCallback((text: string, cursorPosition: number) => {
    debouncedGenerateSuggestions(text, cursorPosition);
  }, [debouncedGenerateSuggestions]);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }, []);

  const selectSuggestion = useCallback((index: number) => {
    if (index >= 0 && index < suggestions.length) {
      setSelectedIndex(index);
      return suggestions[index];
    }
    return null;
  }, [suggestions]);

  const navigateUp = useCallback(() => {
    setSelectedIndex(prev => Math.max(-1, prev - 1));
  }, []);

  const navigateDown = useCallback(() => {
    setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1));
  }, [suggestions.length]);

  const getSelectedSuggestion = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      return suggestions[selectedIndex];
    }
    return null;
  }, [selectedIndex, suggestions]);

  return {
    suggestions,
    isLoading,
    showSuggestions,
    selectedIndex,
    generateSuggestions,
    hideSuggestions,
    selectSuggestion,
    navigateUp,
    navigateDown,
    getSelectedSuggestion
  };
};
