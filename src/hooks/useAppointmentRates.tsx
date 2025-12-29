
import { useState, useEffect } from 'react';
import { usePsychologistRates } from './usePsychologistRates';
import { ARGENTINA_LOCALE } from '@/utils/dateFormatting';

interface AppointmentRate {
  sessionType: string;
  price: number;
  currency: string;
}

export const useAppointmentRates = (psychologistId?: string) => {
  const { rates, loading } = usePsychologistRates(psychologistId);
  const [appointmentRates, setAppointmentRates] = useState<Record<string, AppointmentRate>>({});

  useEffect(() => {
    if (rates.length > 0) {
      const ratesMap = rates.reduce((acc, rate) => {
        acc[rate.session_type] = {
          sessionType: rate.session_type,
          price: rate.price,
          currency: rate.currency
        };
        return acc;
      }, {} as Record<string, AppointmentRate>);
      setAppointmentRates(ratesMap);
    }
  }, [rates]);

  const getRateForType = (sessionType: string): AppointmentRate | null => {
    return appointmentRates[sessionType] || null;
  };

  const formatPrice = (price: number, currency: string = 'USD'): string => {
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'ARS': '$',
      'EUR': '€'
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${price.toLocaleString(ARGENTINA_LOCALE)}`;
  };

  return {
    rates: appointmentRates,
    loading,
    getRateForType,
    formatPrice
  };
};
