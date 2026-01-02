import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useConversations } from "@/hooks/useConversations";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { MessageStatus } from "./MessageStatus";

interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  message_type?: string;
  read_at?: string;
  created_at: string;
}

interface PatientMessagingProps {
  onBack: () => void;
}

export const PatientMessaging = ({ onBack }: PatientMessagingProps) => {
  const { patient } = useProfile();
  const { sendMessage } = useConversations();
  const { markMessagesAsRead } = useMarkMessagesAsRead();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Messages realtime subscription
  useRealtimeChannel({
    channelName: `patient-messages-${conversationId}`,
    enabled: !!conversationId,
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
    onUpdate: () => {
      console.log('Patient messages updated, refetching...');
      fetchMessages();
    }
  });

  useEffect(() => {
    if (patient?.id) {
      fetchConversation();
    }
  }, [patient]);

  useEffect(() => {
    if (conversationId && patient?.id) {
      fetchMessages();
      // Mark messages as read immediately when conversation loads
      markMessagesAsRead(conversationId, patient.id).then((success) => {
        if (success) {
          // Update local state immediately
          setMessages(prev => prev.map(msg => ({
            ...msg,
            read_at: msg.sender_id !== patient.id ? new Date().toISOString() : msg.read_at
          })));
        }
      });
    }
  }, [conversationId, patient?.id]);

  const fetchConversation = async () => {
    if (!patient?.id) return;

    try {
      console.log('Fetching conversation for patient:', patient.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('patient_id', patient.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching conversation:', error);
        toast({
          title: "Error",
          description: "Error al cargar la conversación",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setConversationId(data.id);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
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

      console.log('Fetched messages for patient:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !patient?.id) return;

    const messageData = await sendMessage(conversationId, patient.id, newMessage);
    
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold text-slate-800">Mensajes</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold text-slate-800">Mensajes</h2>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No hay conversación activa
            </h3>
            <p className="text-slate-500">
              Tu psicólogo debe iniciar una conversación contigo para que puedas enviar mensajes
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-slate-800">Mensajes</h2>
      </div>

      <Card className="border-0 shadow-lg h-[600px] flex flex-col">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
              Dr
            </div>
            <div>
              <p className="text-slate-800">Tu Psicólogo</p>
              <p className="text-sm text-slate-600">Conversación segura</p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === patient?.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[70%] ${message.sender_id === patient?.id ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {message.sender_id === patient?.id ? patient.first_name?.[0] || "P" : "Dr"}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.sender_id === patient?.id
                          ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 ${message.sender_id === patient?.id ? "text-blue-100" : "text-slate-500"}`}>
                        <p className="text-xs">
                          {new Date(message.created_at).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <MessageStatus 
                          isOwnMessage={message.sender_id === patient?.id}
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
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
