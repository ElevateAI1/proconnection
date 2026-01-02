
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { formatArgentinePhoneNumber, isValidPhoneNumber } from '@/utils/notificationHelpers';

interface PhoneNumberValidatorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showFormatted?: boolean;
}

export const PhoneNumberValidator: React.FC<PhoneNumberValidatorProps> = ({
  value,
  onChange,
  placeholder = "+54 11 1234-5678",
  label = "Número de WhatsApp",
  required = false,
  showFormatted = true
}) => {
  const [formatted, setFormatted] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value) {
      const formattedNumber = formatArgentinePhoneNumber(value);
      const valid = isValidPhoneNumber(value);
      
      setFormatted(formattedNumber);
      setIsValid(valid);
      
      // Generate suggestions for common formats
      if (!valid && value.length >= 8) {
        const suggestions = generateSuggestions(value);
        setSuggestions(suggestions);
      } else {
        setSuggestions([]);
      }
    } else {
      setFormatted('');
      setIsValid(null);
      setSuggestions([]);
    }
  }, [value]);

  const generateSuggestions = (input: string): string[] => {
    const cleaned = input.replace(/[^\d]/g, '');
    const suggestions: string[] = [];

    // Si tiene 10 dígitos, asumir que falta el 9
    if (cleaned.length === 10 && !cleaned.startsWith('9')) {
      suggestions.push(formatArgentinePhoneNumber('+549' + cleaned));
    }

    // Si tiene 8 dígitos, asumir Buenos Aires (11)
    if (cleaned.length === 8) {
      suggestions.push(formatArgentinePhoneNumber('+54911' + cleaned));
    }

    // Si empieza con 0, quitarlo
    if (cleaned.startsWith('0') && cleaned.length > 8) {
      suggestions.push(formatArgentinePhoneNumber('+549' + cleaned.substring(1)));
    }

    return suggestions.slice(0, 3); // Máximo 3 sugerencias
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
  };

  const getValidationStatus = () => {
    if (isValid === null) return null;
    
    if (isValid) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        message: 'Número válido',
        color: 'text-green-600'
      };
    } else {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-600" />,
        message: 'Formato incorrecto',
        color: 'text-red-600'
      };
    }
  };

  const status = getValidationStatus();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${
            isValid === false ? 'border-red-300 focus:border-red-500' : 
            isValid === true ? 'border-green-300 focus:border-green-500' : ''
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {status?.icon}
        </div>
      </div>

      {/* Validation Status */}
      {status && (
        <div className={`flex items-center gap-1 text-xs ${status.color}`}>
          <span>{status.message}</span>
        </div>
      )}

      {/* Formatted Number Display */}
      {showFormatted && formatted && value && (
        <div className="space-y-2">
          <div className="text-xs text-slate-600">
            <span className="font-medium">Se enviará a:</span>
            <Badge variant="outline" className="ml-2">
              <Phone className="w-3 h-3 mr-1" />
              {formatted}
            </Badge>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">¿Quisiste decir?</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format Examples */}
      {!value && (
        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-medium">Formatos aceptados:</p>
          <ul className="space-y-1 ml-2">
            <li>• +54 9 11 1234-5678 (móvil)</li>
            <li>• 11 1234-5678 (se agrega +54 9)</li>
            <li>• 011 1234-5678 (se corrige formato)</li>
            <li>• +54 11 1234-5678 (fijo)</li>
          </ul>
        </div>
      )}
    </div>
  );
};
