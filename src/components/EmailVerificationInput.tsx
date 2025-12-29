import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, ShieldX, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationResult {
  status: 'valid' | 'invalid' | 'disposable' | 'risky' | 'pending';
  reason: string;
}

interface EmailVerificationInputProps {
  value: string;
  onChange: (email: string) => void;
  onVerificationChange?: (result: EmailVerificationResult | null) => void;
  disabled?: boolean;
}

export const EmailVerificationInput = ({
  value,
  onChange,
  onVerificationChange,
  disabled = false
}: EmailVerificationInputProps) => {
  const [verification, setVerification] = useState<EmailVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (email: string) => {
    onChange(email);

    // Reset verification
    setVerification(null);
    onVerificationChange?.(null);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si el email está vacío o no es válido, no verificar
    if (!email || !isValidEmail(email)) {
      return;
    }

    // Debounce: esperar 500ms después de que el usuario deje de escribir
    setIsVerifying(true);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-email', {
          body: { email }
        });

        if (error) {
          console.error('Error verifying email:', error);
          setIsVerifying(false);
          return;
        }

        const result = data as EmailVerificationResult;
        setVerification(result);
        onVerificationChange?.(result);
      } catch (err) {
        console.error('Error in email verification:', err);
      } finally {
        setIsVerifying(false);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getStatusIcon = () => {
    if (isVerifying) {
      return <Loader2 className="w-4 h-4 animate-spin text-slate-400" />;
    }

    if (!verification) {
      return null;
    }

    switch (verification.status) {
      case 'valid':
        return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'invalid':
      case 'disposable':
        return <ShieldX className="w-4 h-4 text-red-500" />;
      case 'risky':
        return <ShieldAlert className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (isVerifying) {
      return <p className="text-sm text-slate-500">Verificando email...</p>;
    }

    if (!verification) {
      return null;
    }

    switch (verification.status) {
      case 'valid':
        return <p className="text-sm text-green-600 flex items-center gap-1">{getStatusIcon()} Email verificado</p>;
      case 'invalid':
        return <p className="text-sm text-red-500 flex items-center gap-1">{getStatusIcon()} Por favor ingresá un email válido</p>;
      case 'disposable':
        return <p className="text-sm text-red-500 flex items-center gap-1">{getStatusIcon()} No se permiten emails desechables</p>;
      case 'risky':
        return <p className="text-sm text-yellow-600 flex items-center gap-1">{getStatusIcon()} No pudimos verificar este email. Podés continuar de todos modos.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="payer-email">Email de facturación</Label>
      <div className="relative">
        <Input
          id="payer-email"
          type="email"
          placeholder="tu@email.com"
          value={value}
          onChange={(e) => handleEmailChange(e.target.value)}
          disabled={disabled}
          className={verification?.status === 'invalid' || verification?.status === 'disposable' 
            ? 'border-red-500' 
            : verification?.status === 'valid' 
            ? 'border-green-500' 
            : ''}
        />
        {verification && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {getStatusIcon()}
          </div>
        )}
      </div>
      {getStatusMessage()}
      {value && !isValidEmail(value) && (
        <p className="text-sm text-red-500">Por favor ingresa un email válido</p>
      )}
    </div>
  );
};

