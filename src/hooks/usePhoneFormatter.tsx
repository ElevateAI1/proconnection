
import { useState, useEffect } from 'react';
import { formatArgentinePhoneNumber, isValidPhoneNumber } from '@/utils/notificationHelpers';

export const usePhoneFormatter = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  const [formatted, setFormatted] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (value) {
      const formattedNumber = formatArgentinePhoneNumber(value);
      const valid = isValidPhoneNumber(value);
      
      setFormatted(formattedNumber);
      setIsValid(valid);
    } else {
      setFormatted('');
      setIsValid(null);
    }
  }, [value]);

  const updateValue = (newValue: string) => {
    setValue(newValue);
  };

  const getFormattedValue = () => {
    return formatted || value;
  };

  const validateAndFormat = () => {
    if (value && !isValid) {
      // Auto-correct common mistakes
      setValue(formatted);
      return formatted;
    }
    return value;
  };

  return {
    value,
    formatted,
    isValid,
    setValue: updateValue,
    getFormattedValue,
    validateAndFormat
  };
};
