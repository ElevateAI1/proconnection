
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatArgentinePhoneNumber, isValidArgentinePhoneNumber, displayPhoneNumber } from "@/utils/phoneValidation";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const PhoneInput = ({ 
  value, 
  onChange, 
  label = "Teléfono", 
  placeholder = "+54 9 11 1234-5678",
  required = false,
  error 
}: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState(value ? displayPhoneNumber(value) : "");
  const [validationError, setValidationError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    if (inputValue.trim() === "") {
      setValidationError("");
      onChange("");
      return;
    }

    try {
      const formatted = formatArgentinePhoneNumber(inputValue);
      const isValid = isValidArgentinePhoneNumber(formatted);
      
      if (isValid) {
        setValidationError("");
        onChange(formatted);
      } else {
        setValidationError("Formato inválido. Ej: +54 9 11 1234-5678");
        onChange(inputValue); // Keep the input value for further editing
      }
    } catch (error) {
      setValidationError("Formato inválido");
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    if (value && isValidArgentinePhoneNumber(value)) {
      setDisplayValue(displayPhoneNumber(value));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id="phone"
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`${(error || validationError) ? 'border-red-500' : ''}`}
      />
      {(error || validationError) && (
        <p className="text-sm text-red-600">
          {error || validationError}
        </p>
      )}
      <p className="text-xs text-gray-500">
        Ingresa tu número con código de área (ej: 11 1234-5678 o +54 9 11 1234-5678)
      </p>
    </div>
  );
};
