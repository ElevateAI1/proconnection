
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
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

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  config?: any;
}

interface DraggableFieldProps {
  field: FormField;
  index: number;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
}

const getFieldIcon = (type: string) => {
  const iconMap = {
    text: Type,
    textarea: AlignLeft,
    checkbox: CheckSquare,
    radio: Circle,
    select: List,
    date: Calendar,
    number: Hash,
    email: Mail,
    phone: Phone
  };
  
  return iconMap[type as keyof typeof iconMap] || Type;
};

const getFieldTypeName = (type: string) => {
  const typeNames = {
    text: 'Texto',
    textarea: 'Texto Largo',
    checkbox: 'Casilla',
    radio: 'Selección Única',
    select: 'Lista',
    date: 'Fecha',
    number: 'Número',
    email: 'Email',
    phone: 'Teléfono'
  };
  
  return typeNames[type as keyof typeof typeNames] || type;
};

export const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  onEdit,
  onDelete
}) => {
  const IconComponent = getFieldIcon(field.type);

  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 ${snapshot.isDragging ? 'opacity-75' : ''}`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  {...provided.dragHandleProps}
                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                >
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800">{field.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {getFieldTypeName(field.type)}
                    </Badge>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                  </div>
                  {field.placeholder && (
                    <p className="text-sm text-slate-500">"{field.placeholder}"</p>
                  )}
                  {field.options && field.options.length > 0 && (
                    <p className="text-sm text-slate-500">
                      Opciones: {field.options.join(', ')}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(field)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(field.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
