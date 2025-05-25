
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatients } from '@/hooks/usePatients';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  age?: number;
}

interface PatientSelectorProps {
  selectedPatientId: string;
  onPatientSelect: (patientId: string, patientName: string) => void;
  required?: boolean;
}

export const PatientSelector = ({ selectedPatientId, onPatientSelect, required = false }: PatientSelectorProps) => {
  const { patients, loading, error } = usePatients();

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      const fullName = `${patient.first_name} ${patient.last_name}`;
      onPatientSelect(patientId, fullName);
    }
  };

  const getPatientDisplayName = (patient: Patient) => {
    return `${patient.first_name} ${patient.last_name}${patient.age ? ` (${patient.age} años)` : ''}`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Seleccionar Paciente</Label>
        <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-sm text-gray-500">
          Cargando pacientes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Seleccionar Paciente</Label>
        <div className="h-10 bg-red-50 border border-red-200 rounded-md flex items-center px-3 text-sm text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Seleccionar Paciente</Label>
        <div className="h-10 bg-yellow-50 border border-yellow-200 rounded-md flex items-center px-3 text-sm text-yellow-700">
          No hay pacientes registrados
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Seleccionar Paciente {required && <span className="text-red-500">*</span>}</Label>
      <Select value={selectedPatientId} onValueChange={handlePatientChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un paciente" />
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {getPatientDisplayName(patient)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
