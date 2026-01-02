
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Lock } from "lucide-react";

interface MonotaxCategory {
  category_code: string;
  annual_limit: number;
  monthly_limit: number;
  description: string;
}

// Categorías disponibles actualmente (las primeras 5: A-E)
const AVAILABLE_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

interface MonotaxCategorySelectorProps {
  currentCategory: string | null;
  categories: MonotaxCategory[];
  onCategoryChange: (categoryCode: string) => void;
}

export const MonotaxCategorySelector = ({ 
  currentCategory, 
  categories, 
  onCategoryChange 
}: MonotaxCategorySelectorProps) => {
  const currentCategoryData = categories.find(c => c.category_code === currentCategory);

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm text-blue-petrol/70 font-medium">Categoría Monotributo</p>
        {currentCategoryData ? (
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-green-mint/50 text-blue-petrol border-green-mint">
              Categoría {currentCategory}
            </Badge>
            <span className="text-xs text-blue-petrol/60">
              Límite anual: ${currentCategoryData.annual_limit.toLocaleString()}
            </span>
          </div>
        ) : (
          <Badge variant="destructive" className="mt-1 bg-red-100 text-red-700 border-red-300">
            No configurada
          </Badge>
        )}
      </div>
      
      <Select value={currentCategory || ''} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48 bg-white-warm border-2 border-blue-petrol/20 hover:border-blue-petrol/40 text-blue-petrol shadow-md">
          <Settings className="w-4 h-4 mr-2 text-blue-petrol" />
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          {categories.length === 0 ? (
            <div className="p-4 text-center text-sm text-blue-petrol/70">
              <p>No hay categorías disponibles</p>
              <p className="text-xs mt-1">Contacta al administrador</p>
            </div>
          ) : (
            categories.map((category) => {
              const isAvailable = AVAILABLE_CATEGORIES.includes(category.category_code);
              
              return (
                <SelectItem 
                  key={category.category_code} 
                  value={category.category_code}
                  disabled={!isAvailable}
                  className={!isAvailable ? 'opacity-60 cursor-not-allowed' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-petrol">Categoría {category.category_code}</span>
                        {!isAvailable && (
                          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
                            <Lock className="w-3 h-3 mr-1" />
                            En desarrollo
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-blue-petrol/70">
                        ${category.annual_limit.toLocaleString()} anual
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
