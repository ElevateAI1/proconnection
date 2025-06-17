import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Search } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useConversations } from "@/hooks/useConversations";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { MessageStatus } from "./MessageStatus";

interface Conversation {
  id: string;
  patient_id: string;
  psychologist_id: string;
  last_message_at: string | null;
  patient: {
    first_name: string;
    last_name: string;
  };
  messages: Message[];
}

interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  message_type?: string;
  read_at?: string;
  created_at: string;
}

export const MessagingHub = () => {
  const { psychologist } = useProfile();
  const { createOrGetConversation, sendMessage } = useConversations();
  const { markMessagesAsRead } = useMarkMessagesAsRead();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Conversations realtime subscription
  useRealtimeChannel({
    channelName: `conversations-${psychologist?.id}`,
    enabled: !!psychologist?.id,
    table: 'conversations',
    filter: `psychologist_id=eq.${psychologist?.id}`,
    onUpdate: () => {
      console.log('Conversations updated, refetching...');
      fetchConversations();
    }
  });

  // Messages realtime subscription for selected conversation
  useRealtimeChannel({
    channelName: `messages-${selectedConversation}`,
    enabled: !!selectedConversation,
    table: 'messages',
    filter: `conversation_id=eq.${selectedConversation}`,
    onUpdate: () => {
      console.log('Messages updated, refetching...');
      if (selectedConversation) {
        fetchMessages(selectedConversation);
        setTimeout(() => fetchConversations(), 100);
      }
    }
  });

  useEffect(() => {
    if (psychologist?.id) {
      fetchConversations();
    }
  }, [psychologist?.id]);

  useEffect(() => {
    if (selectedConversation && psychologist?.id) {
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation, psychologist.id).then((success) => {
        if (success) {
          setMessages(prev => prev.map(msg => ({
            ...msg,
            read_at: msg.sender_id !== psychologist.id ? new Date().toISOString() : msg.read_at
          })));
          setTimeout(() => fetchConversations(), 100);
        }
      });
    }
  }, [selectedConversation, psychologist?.id]);

  const fetchConversations = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      console.log('Fetching conversations for psychologist:', psychologist.id);

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          patient_id,
          psychologist_id,
          last_message_at,
          patients!inner(
            first_name,
            last_name
          ),
          messages(
            id,
            content,
            created_at,
            read_at,
            sender_id,
            conversation_id
          )
        `)
        .eq('psychologist_id', psychologist.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Error al cargar las conversaciones",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched conversations:', data);

      const formattedConversations: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        patient_id: conv.patient_id,
        psychologist_id: conv.psychologist_id,
        last_message_at: conv.last_message_at,
        patient: {
          first_name: conv.patients.first_name,
          last_name: conv.patients.last_name
        },
        messages: (conv.messages || []).map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          conversation_id: msg.conversation_id || conv.id,
          content: msg.content,
          message_type: 'text',
          read_at: msg.read_at || undefined,
          created_at: msg.created_at
        }))
      }));

      setConversations(formattedConversations);

      if (!selectedConversation && formattedConversations.length > 0) {
        setSelectedConversation(formattedConversations[0].id);
      }

    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar conversaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
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

      console.log('Fetched messages for conversation:', conversationId, data);
      setMessages(data || []);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !psychologist?.id) return;

    const messageData = await sendMessage(selectedConversation, psychologist.id, newMessage);
    
    if (messageData) {
      setMessages(prev => [...prev, messageData]);
      setNewMessage("");
      fetchConversations();

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

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const getLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "Sin mensajes";
    }
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.content;
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (!conversation.messages || !psychologist?.id) return 0;
    return conversation.messages.filter(
      msg => !msg.read_at && msg.sender_id !== psychologist.id
    ).length;
  };

  const getLastMessageTime = (conversation: Conversation) => {
    if (!conversation.last_message_at) return "";
    const date = new Date(conversation.last_message_at);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Hace menos de 1h";
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = conversations.filter(conv =>
    `${conv.patient.first_name} ${conv.patient.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Centro de Mensajes</h2>
          <p className="text-slate-600">Comunicación segura con tus pacientes</p>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Centro de Mensajes</h2>
        <p className="text-slate-600">Comunicación segura con tus pacientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MessageCircle className="w-5 h-5" />
              Conversaciones ({conversations.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Buscar conversaciones..." 
                className="pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const unreadCount = getUnreadCount(conversation);
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-l-4 ${
                        selectedConversation === conversation.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {conversation.patient.first_name[0]}{conversation.patient.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-slate-800 truncate">
                              {conversation.patient.first_name} {conversation.patient.last_name}
                            </p>
                            <span className="text-xs text-slate-500">
                              {getLastMessageTime(conversation)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">
                            {getLastMessage(conversation)}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-semibold">
                              {unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay conversaciones</p>
                  <p className="text-sm">Las conversaciones aparecerán aquí</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg h-full flex flex-col">
            {selectedConv ? (
              <>
                <CardHeader className="border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConv.patient.first_name[0]}{selectedConv.patient.last_name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-slate-800">
                        {selectedConv.patient.first_name} {selectedConv.patient.last_name}
                      </CardTitle>
                      <p className="text-sm text-slate-600">Paciente</p>
                    </div>
                  </div>
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
                              {message.sender_id === psychologist?.id ? "Dr" : selectedConv.patient.first_name[0]}
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
                                  {new Date(message.created_at).toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
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
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Selecciona una conversación</p>
                  <p className="text-sm">Elige una conversación de la lista para comenzar a chatear</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
