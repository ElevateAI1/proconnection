
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  AlignLeft, 
  CheckSquare, 
  Circle, 
  List, 
  Calendar,
  Hash,
  Mail,
  Phone
} from 'lucide-react';

interface FieldType {
  id: string;
  name: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  defaultConfig: any;
}

const fieldTypes: FieldType[] = [
  {
    id: 'text',
    name: 'text',
    label: 'Texto',
    icon: Type,
    description: 'Campo de texto simple',
    defaultConfig: { placeholder: 'Ingrese texto...', required: false }
  },
  {
    id: 'textarea',
    name: 'textarea',
    label: 'Texto Largo',
    icon: AlignLeft,
    description: 'Área de texto multilínea',
    defaultConfig: { placeholder: 'Ingrese texto...', rows: 4, required: false }
  },
  {
    id: 'checkbox',
    name: 'checkbox',
    label: 'Casilla de Verificación',
    icon: CheckSquare,
    description: 'Casilla para marcar/desmarcar',
    defaultConfig: { required: false }
  },
  {
    id: 'radio',
    name: 'radio',
    label: 'Selección Única',
    icon: Circle,
    description: 'Botones de radio para una opción',
    defaultConfig: { options: ['Opción 1', 'Opción 2'], required: false }
  },
  {
    id: 'select',
    name: 'select',
    label: 'Lista Desplegable',
    icon: List,
    description: 'Lista de opciones desplegable',
    defaultConfig: { options: ['Opción 1', 'Opción 2'], required: false }
  },
  {
    id: 'date',
    name: 'date',
    label: 'Fecha',
    icon: Calendar,
    description: 'Selector de fecha',
    defaultConfig: { required: false }
  },
  {
    id: 'number',
    name: 'number',
    label: 'Número',
    icon: Hash,
    description: 'Campo numérico',
    defaultConfig: { placeholder: '0', min: 0, required: false }
  },
  {
    id: 'email',
    name: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Campo de correo electrónico',
    defaultConfig: { placeholder: 'correo@ejemplo.com', required: false }
  },
  {
    id: 'phone',
    name: 'phone',
    label: 'Teléfono',
    icon: Phone,
    description: 'Campo de número telefónico',
    defaultConfig: { placeholder: '+54 11 1234-5678', required: false }
  },
  {
    id: 'patient_editable_text',
    name: 'patient_editable_text',
    label: 'Campo Editable por Paciente',
    icon: Type,
    description: 'Campo que el paciente puede editar una sola vez',
    defaultConfig: { 
      placeholder: 'El paciente puede editar esto una sola vez...', 
      required: false,
      patient_editable: true,
      editable_until_days: 7
    }
  }
];

interface FieldTypeSelectorProps {
  onFieldSelect: (fieldType: FieldType) => void;
}

export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({ onFieldSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Tipos de Campo</h3>
      <div className="grid grid-cols-1 gap-2">
        {fieldTypes.map((fieldType) => {
          const IconComponent = fieldType.icon;
          
          return (
            <Card 
              key={fieldType.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-slate-200 hover:border-blue-300"
              onClick={() => onFieldSelect(fieldType)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{fieldType.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {fieldType.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{fieldType.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
