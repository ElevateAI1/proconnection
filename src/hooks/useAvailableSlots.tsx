
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseAvailableSlotsProps {
  psychologistId: string;
  selectedDate: string;
}

// Helper para sumar minutos a un string "HH:mm"
function addMinutes(time: string, minutesToAdd: number): string {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date(0, 0, 0, hour, minute + minutesToAdd, 0, 0);
  // Siempre retorna en formato "HH:mm" con ceros iniciales
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Dado un horario inicial, retorna todos los slots de 30m ocupados por 1h
function getSlotsOccupiedBy(startTime: string): string[] {
  // Cada turno es 1h, bloquea el slot elegido y el siguiente
  return [startTime, addMinutes(startTime, 30)];
}

export const useAvailableSlots = ({ psychologistId, selectedDate }: UseAvailableSlotsProps) => {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const isValidUUID = (uuid: string) => {
    if (!uuid || typeof uuid !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Nuevo: traer citas y armar mapeo de slots ocupados considerando duración
  const fetchBookedSlots = useCallback(async () => {
    if (!psychologistId || 
        psychologistId.trim() === '' || 
        !selectedDate || 
        selectedDate.trim() === '' ||
        !isValidUUID(psychologistId)) {
      setBookedSlots([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [year, month, day] = selectedDate.split('-');
      const startOfDay = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      endOfDay.setHours(23, 59, 59, 999);

      // Traer todas las citas ese día
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('psychologist_id', psychologistId)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);

      if (error) {
        setBookedSlots([]);
        return;
      }

      // A partir de las fechas de las citas, armar slots ocupados (cada cita ocupa 1h = 2 slots)
      let occupiedSlots: string[] = [];
      (data || []).forEach(apt => {
        const aptDate = new Date(apt.appointment_date);
        const timeString = aptDate.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        occupiedSlots = occupiedSlots.concat(getSlotsOccupiedBy(timeString));
      });

      // Filtrar duplicidades y valores inconsistentes (ej: 19:30+30m = 20:00 que no existe)
      occupiedSlots = Array.from(new Set(occupiedSlots)).filter(s => timeSlots.includes(s));

      setBookedSlots(occupiedSlots);
    } catch (error) {
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  }, [psychologistId, selectedDate]);

  useEffect(() => {
    if (psychologistId && 
        psychologistId.trim() !== '' && 
        selectedDate && 
        selectedDate.trim() !== '' &&
        isValidUUID(psychologistId)) {
      fetchBookedSlots();
    } else {
      setBookedSlots([]);
      setLoading(false);
    }
  }, [fetchBookedSlots]);

  // El slot está disponible si: ni él ni el siguiente de 30m están ocupados
  const isSlotAvailable = (time: string) => {
    const slotIndexes = timeSlots.map((t, idx) => ({ t, idx }))
      .filter(item => item.t === time)
      .map(item => item.idx);
    if (slotIndexes.length === 0) return false;
    const idx = slotIndexes[0];

    // Si el slot siguiente existe, ambos deben estar libres (para reservar 1h desde `time`)
    const involvedSlots = [timeSlots[idx]];
    if (idx + 1 < timeSlots.length) {
      involvedSlots.push(timeSlots[idx + 1]);
    }
    // Para el último slot (19:30), no permitir reservas porque no hay suficiente tiempo para 1 hora
    if (involvedSlots.length < 2) return false;

    // Si alguno está ocupado, no está disponible
    return !involvedSlots.some((s) => bookedSlots.includes(s));
  };

  // Solo ofrecer como disponibles slots donde se puedan tomar 1h entera
  const getAvailableSlots = () => {
    return timeSlots.filter(slot => isSlotAvailable(slot));
  };

  return {
    timeSlots,
    bookedSlots,
    loading,
    isSlotAvailable,
    getAvailableSlots,
    refreshAvailability: fetchBookedSlots
  };
};
