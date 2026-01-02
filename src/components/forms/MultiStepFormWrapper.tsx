
import React, { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isValid?: () => boolean;
}

interface MultiStepFormWrapperProps {
  title: string;
  steps: Step[];
  onComplete: (data: any) => void;
  onSave?: (data: any) => void;
  initialData?: any;
}

export const MultiStepFormWrapper: React.FC<MultiStepFormWrapperProps> = ({
  title,
  steps,
  onComplete,
  onSave,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    const step = steps[currentStep];
    if (step.isValid && !step.isValid()) {
      return;
    }
    
    if (isLastStep) {
      onComplete(formData);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Paso {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Step Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentStep
                      ? 'bg-blue-500 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="text-right">
              <h3 className="font-medium text-slate-800">{steps[currentStep].title}</h3>
              {steps[currentStep].description && (
                <p className="text-sm text-slate-600">{steps[currentStep].description}</p>
              )}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] mb-6">
            {React.cloneElement(steps[currentStep].component as React.ReactElement, {
              data: formData,
              onDataChange: updateFormData
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isFirstStep}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              {onSave && (
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Guardando...' : 'Guardar Borrador'}
                </Button>
              )}
            </div>
            
            <Button onClick={handleNext}>
              {isLastStep ? 'Completar' : 'Siguiente'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
