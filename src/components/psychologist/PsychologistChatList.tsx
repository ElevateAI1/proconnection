import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { formatMessageTime } from "@/utils/messageFormatting";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  patient_id: string;
  psychologist_id: string;
  last_message_at: string | null;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url?: string | null;
  };
  unread_count?: number;
}

interface PsychologistChatListProps {
  onSelectConversation: (patientId: string) => void;
  selectedPatientId?: string;
}

export const PsychologistChatList = ({ onSelectConversation, selectedPatientId }: PsychologistChatListProps) => {
  const { psychologist } = useProfile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (psychologist?.id) {
      fetchConversations();
    }
  }, [psychologist?.id]);

  const fetchConversations = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          patient_id,
          psychologist_id,
          last_message_at,
          patient:patients!inner(
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .eq('psychologist_id', psychologist.id)
        .order('last_message_at', { ascending: false, nullsLast: true });

      if (error) throw error;

      // Get unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', psychologist.id)
            .is('read_at', null);

          return {
            ...conv,
            unread_count: count || 0
          };
        })
      );

      setConversations(conversationsWithUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredConversations = conversations.filter(conv =>
    `${conv.patient.first_name} ${conv.patient.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-petrol border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-petrol/70">Cargando conversaciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-petrol" />
          <span className="text-blue-petrol">Mensajes</span>
        </CardTitle>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-petrol/60" />
            <Input
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-celeste-gray/50"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {filteredConversations.length > 0 ? (
          <div className="divide-y divide-celeste-gray/30">
            {filteredConversations.map((conv) => {
              const patientName = `${conv.patient.first_name} ${conv.patient.last_name}`;
              const isSelected = selectedPatientId === conv.patient.id;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.patient.id)}
                  className={`w-full p-4 hover:bg-blue-soft/10 transition-colors text-left ${
                    isSelected ? 'bg-blue-soft/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {conv.patient.profile_image_url ? (
                      <img
                        src={conv.patient.profile_image_url}
                        alt={patientName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-soft"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(patientName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-blue-petrol truncate">
                          {patientName}
                        </p>
                        {conv.last_message_at && (
                          <span className="text-xs text-blue-petrol/60 whitespace-nowrap ml-2">
                            {formatMessageTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <Badge className="bg-blue-petrol text-white-warm">
                          {conv.unread_count} nuevo{conv.unread_count > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className="w-16 h-16 text-blue-petrol/30 mb-4" />
            <p className="text-blue-petrol/70 font-medium">
              {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
            </p>
            <p className="text-sm text-blue-petrol/60 mt-1">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Las conversaciones aparecerán aquí'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

