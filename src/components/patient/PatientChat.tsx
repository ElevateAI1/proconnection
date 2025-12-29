import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MessageStatus } from "@/components/MessageStatus";
import { formatMessageTime } from "@/utils/messageFormatting";

interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  message_type?: string;
  read_at?: string | null;
  created_at: string;
}

interface PatientChatProps {
  psychologistId?: string;
  psychologistName?: string;
  psychologistImage?: string | null;
}

export const PatientChat = ({ psychologistId, psychologistName, psychologistImage }: PatientChatProps) => {
  const { user } = useAuth();
  const { patient } = useProfile();
  const { sendMessage, createOrGetConversation } = useConversations();
  const { markMessagesAsRead } = useMarkMessagesAsRead();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Realtime subscription para mensajes
  useRealtimeChannel({
    channelName: `patient-messages-${conversationId}`,
    enabled: !!conversationId,
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
    onUpdate: () => {
      fetchMessages();
    }
  });

  // Typing indicator
  const { sendTyping } = useTypingIndicator({
    conversationId,
    userId: user?.id || '',
    enabled: !!conversationId && !!user?.id,
    onTypingChange: (typing, senderId) => {
      if (senderId !== user?.id) {
        setOtherUserTyping(typing);
      }
    }
  });

  // Scroll to bottom cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (patient?.id && psychologistId) {
      fetchOrCreateConversation();
    }
  }, [patient?.id, psychologistId]);

  useEffect(() => {
    if (conversationId && patient?.id) {
      fetchMessages();
      markMessagesAsRead(conversationId, patient.id).then((success) => {
        if (success) {
          setMessages(prev => prev.map(msg => ({
            ...msg,
            read_at: msg.sender_id !== patient.id ? new Date().toISOString() : msg.read_at
          })));
        }
      });
    }
  }, [conversationId, patient?.id]);

  const fetchOrCreateConversation = async () => {
    if (!patient?.id || !psychologistId) return;

    try {
      setLoading(true);
      const conversation = await createOrGetConversation(psychologistId, patient.id);
      if (conversation) {
        setConversationId(conversation.id);
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
      
      // Marcar como leído inmediatamente (optimista)
      markMessagesAsRead(conversationId, patient.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      // Enviar indicador de escritura
      sendTyping();
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    sendTyping();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-petrol border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-petrol/70">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-petrol/30" />
          <h3 className="text-xl font-semibold text-blue-petrol mb-2">No hay conversación disponible</h3>
          <p className="text-blue-petrol/70">Tu psicólogo debe iniciar una conversación contigo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white-warm">
      <div className="border-b border-celeste-gray/30 pb-3 px-4 pt-4">
        <div className="flex items-center gap-3">
          {psychologistImage ? (
            <img
              src={psychologistImage}
              alt={psychologistName || 'Psicólogo'}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-soft"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {psychologistName ? getInitials(psychologistName) : 'Dr'}
            </div>
          )}
          <div className="flex-1">
            <p className="text-blue-petrol font-semibold">{psychologistName || 'Tu Psicólogo'}</p>
            <p className="text-xs text-blue-petrol/60">Conversación segura</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-blue-petrol/60">En línea</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            <>
              {messages.map((message) => {
                const isOwn = message.sender_id === patient?.id;
                const senderName = isOwn 
                  ? `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() 
                  : psychologistName || 'Psicólogo';
                const senderImage = isOwn ? patient?.profile_image_url : psychologistImage;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}
                  >
                    {!isOwn && (
                      senderImage ? (
                        <img
                          src={senderImage}
                          alt={senderName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {getInitials(senderName)}
                        </div>
                      )
                    )}
                    <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? "bg-gradient-to-r from-blue-soft to-celeste-gray text-white rounded-br-sm"
                            : "bg-celeste-gray/30 text-blue-petrol rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                          <span className={`text-xs ${isOwn ? "text-blue-100" : "text-blue-petrol/60"}`}>
                            {formatMessageTime(message.created_at)}
                          </span>
                          <MessageStatus 
                            isOwnMessage={isOwn}
                            readAt={message.read_at}
                            createdAt={message.created_at}
                            className={isOwn ? "" : "hidden"}
                          />
                        </div>
                      </div>
                    </div>
                    {isOwn && (
                      senderImage ? (
                        <img
                          src={senderImage}
                          alt={senderName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {getInitials(senderName)}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
              {otherUserTyping && (
                <div className="flex justify-start gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {psychologistName ? getInitials(psychologistName) : 'Dr'}
                  </div>
                  <div className="bg-celeste-gray/30 text-blue-petrol px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-petrol/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-petrol/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-petrol/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-petrol/30" />
                <p className="text-blue-petrol/70 font-medium">No hay mensajes aún</p>
                <p className="text-sm text-blue-petrol/60 mt-1">Envía el primer mensaje para comenzar</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-celeste-gray/30 bg-white-warm">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu mensaje..."
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-2 border-celeste-gray/50 focus:border-blue-soft"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-petrol text-white-warm hover:bg-blue-petrol/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

