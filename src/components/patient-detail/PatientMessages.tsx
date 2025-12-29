
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useConversations } from "@/hooks/useConversations";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { MessageStatus } from "../MessageStatus";
import { formatTimeArgentina } from "@/utils/dateFormatting";

interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  message_type?: string;
  read_at?: string;
  created_at: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface PatientMessagesProps {
  patientId: string;
}

export const PatientMessages = ({ patientId }: PatientMessagesProps) => {
  const { psychologist } = useProfile();
  const { sendMessage } = useConversations();
  const { markMessagesAsRead } = useMarkMessagesAsRead();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  
  // Messages realtime subscription
  useRealtimeChannel({
    channelName: `psychologist-messages-${conversationId}`,
    enabled: !!conversationId,
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
    onUpdate: () => {
      console.log('Psychologist messages updated, refetching...');
      fetchMessages();
    }
  });

  useEffect(() => {
    if (patientId && psychologist?.id) {
      fetchPatient();
      fetchOrCreateConversation();
    }
  }, [patientId, psychologist]);

  useEffect(() => {
    if (conversationId && psychologist?.id) {
      fetchMessages();
      // Mark messages as read when conversation loads
      markMessagesAsRead(conversationId, psychologist.id).then((success) => {
        if (success) {
          // Update local state immediately
          setMessages(prev => prev.map(msg => ({
            ...msg,
            read_at: msg.sender_id !== psychologist.id ? new Date().toISOString() : msg.read_at
          })));
        }
      });
    }
  }, [conversationId, psychologist?.id]);

  const fetchPatient = async () => {
    if (!psychologist?.id) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('id', patientId)
        .eq('psychologist_id', psychologist.id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const fetchOrCreateConversation = async () => {
    if (!psychologist?.id) return;

    try {
      console.log('Fetching conversation for patient:', patientId, 'psychologist:', psychologist.id);
      
      let { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', psychologist.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No conversation exists, create one
        console.log('Creating new conversation...');
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            patient_id: patientId,
            psychologist_id: psychologist.id
          })
          .select()
          .single();

        if (createError) throw createError;
        conversation = newConversation;
      } else if (error) {
        throw error;
      }

      console.log('Conversation found/created:', conversation);
      setConversationId(conversation.id);
    } catch (error) {
      console.error('Error with conversation:', error);
      toast({
        title: "Error",
        description: "Error al cargar la conversación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Fetched messages for psychologist:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !psychologist?.id) return;

    const messageData = await sendMessage(conversationId, psychologist.id, newMessage);
    
    if (messageData) {
      setMessages(prev => [...prev, messageData]);
      setNewMessage("");

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando mensajes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
            {patient ? `${patient.first_name[0]}${patient.last_name[0]}` : 'P'}
          </div>
          <div>
            <p className="text-slate-800">
              {patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente'}
            </p>
            <p className="text-sm text-slate-600">Conversación directa</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === psychologist?.id ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end gap-2 max-w-[70%] ${message.sender_id === psychologist?.id ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {message.sender_id === psychologist?.id ? "Dr" : (patient ? `${patient.first_name[0]}` : "P")}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.sender_id === psychologist?.id
                        ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 ${message.sender_id === psychologist?.id ? "text-blue-100" : "text-slate-500"}`}>
                      <p className="text-xs">
                        {formatTimeArgentina(message.created_at)}
                      </p>
                      <MessageStatus 
                        isOwnMessage={message.sender_id === psychologist?.id}
                        readAt={message.read_at}
                        createdAt={message.created_at}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay mensajes en esta conversación</p>
              <p className="text-sm">Envía el primer mensaje para comenzar</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
