
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpandedPublicProfileManager } from '@/components/ExpandedPublicProfileManager';
import { Badge } from '@/components/ui/badge';
import { Globe, Settings, Sparkles } from 'lucide-react';

export const SeoProfileManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Gestión de Perfil Público Profesional
            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-300">
              <Sparkles className="w-3 h-3 mr-1" />
              Mejorado
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración Completa del Perfil
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <ExpandedPublicProfileManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
