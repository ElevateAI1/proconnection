import { useState, useEffect, useRef, useCallback } from "react";
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
import { MessageStatus } from "@/components/MessageStatus";
import { formatMessageTime } from "@/utils/messageFormatting";
import { formatTimeArgentina } from "@/utils/dateFormatting";
import { useAttachmentUpload } from "@/hooks/useAttachmentUpload";
import { encryptForConversation } from "@/utils/secureMessaging";
import { decodeMessage, DecodedMessage } from "@/utils/messages";

interface PsychologistChatProps {
  patientId: string;
  patientName?: string;
  patientImage?: string | null;
  conversationId?: string;
}

const ATTACHMENT_BUCKET = "message-attachments";

export const PsychologistChat = ({ patientId, patientName, patientImage, conversationId: propConversationId }: PsychologistChatProps) => {
  const { user } = useAuth();
  const { psychologist } = useProfile();
  const { sendMessage, createOrGetConversation } = useConversations();
  const { markMessagesAsRead } = useMarkMessagesAsRead();
  const { uploadAttachment, uploading } = useAttachmentUpload();

  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(propConversationId || null);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<{ id: string; first_name: string; last_name: string; profile_image_url?: string | null } | null>(null);
  const [patientNickname, setPatientNickname] = useState<string | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceChannelRef = useRef<any>(null);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const prepareContent = useCallback(
    async (payload: any) => {
      if (!conversationId) return typeof payload === "string" ? payload : JSON.stringify(payload);
      const asString = typeof payload === "string" ? payload : JSON.stringify(payload);
      const encrypted = await encryptForConversation(asString, conversationId);
      return encrypted ? JSON.stringify(encrypted) : asString;
    },
    [conversationId]
  );

  const resolveAttachmentUrl = useCallback(
    async (path: string) => {
      if (attachmentUrls[path]) return attachmentUrls[path];
      const { data, error } = await supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
      if (error) {
        console.error("Error creando signed url", error);
        return "";
      }
      const url = data?.signedUrl || "";
      setAttachmentUrls((prev) => ({ ...prev, [path]: url }));
      return url;
    },
    [attachmentUrls]
  );

  // Realtime subscription para mensajes - memoizar callback para evitar re-renders
  const handleRealtimeUpdate = useCallback(
    (payload: any) => {
      const eventType = payload.eventType;

      if (eventType === "INSERT" && payload.new) {
        decodeMessage(payload.new, payload.new.conversation_id).then((decoded) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === decoded.id);
            if (exists) {
              return prev;
            }
            const sorted = [...prev, decoded].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            if (decoded.sender_id !== psychologist?.id && !decoded.read_at && conversationId) {
              setTimeout(() => {
                markMessagesAsRead(conversationId, psychologist?.id || "");
              }, 500);
            }
            return sorted;
          });
        });
      } else if (eventType === "UPDATE" && payload.new) {
        decodeMessage(payload.new, payload.new.conversation_id).then((decoded) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === decoded.id
                ? decoded
                : msg
            )
          );
        });
      } else if (eventType === "DELETE" && payload.old) {
        setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
      }
    },
    [conversationId, psychologist?.id, markMessagesAsRead]
  );

  const { isDisabled: isRealtimeDisabled } = useRealtimeChannel({
    channelName: `psychologist-messages-${conversationId}`,
    enabled: !!conversationId,
    table: "messages",
    filter: `conversation_id=eq.${conversationId}`,
    onUpdate: handleRealtimeUpdate
  });

  // Typing indicator
  const { sendTyping, stopTyping } = useTypingIndicator({
    conversationId,
    userId: user?.id || "",
    enabled: !!conversationId && !!user?.id,
    onTypingChange: (typing, senderId) => {
      if (senderId !== user?.id) {
        setOtherUserTyping(typing);
      }
    }
  });

  // Scroll to bottom cuando hay nuevos mensajes (solo si el usuario está al final)
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  const fetchConversationNickname = async (convId: string) => {
    try {
      const { data } = await supabase
        .from("conversations")
        .select("patient_nickname")
        .eq("id", convId)
        .single();

      if (data?.patient_nickname) {
        setPatientNickname(data.patient_nickname);
      }
    } catch (error) {
      console.error("Error fetching nickname:", error);
    }
  };

  const fetchMessagesWhenReady = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      const decoded = await Promise.all(
        (data || []).map((msg) => decodeMessage(msg, msg.conversation_id))
      );
      setMessages(decoded);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Actualizar conversationId cuando propConversationId cambia
  useEffect(() => {
    if (propConversationId) {
      console.log("[PSYCHOLOGIST] propConversationId cambió:", propConversationId);
      setConversationId(propConversationId);
    }
  }, [propConversationId]);

  useEffect(() => {
    if (patientId && psychologist?.id) {
      setLoading(true);
      fetchPatient();
      if (propConversationId) {
        console.log("[PSYCHOLOGIST] Inicializando con propConversationId:", propConversationId);
        Promise.all([
          fetchConversationNickname(propConversationId),
          fetchMessagesWhenReady(propConversationId)
        ]).finally(() => {
          setLoading(false);
        });
      } else {
        fetchOrCreateConversation();
      }
    }
  }, [patientId, psychologist?.id, propConversationId]);

  useEffect(() => {
    if (conversationId && psychologist?.id && !propConversationId) {
      fetchMessages();
    }
  }, [conversationId, psychologist?.id, propConversationId]);

  // Marcar mensajes como leídos solo una vez cuando se carga la conversación
  useEffect(() => {
    if (conversationId && psychologist?.id && messages.length > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead(conversationId, psychologist.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [conversationId, psychologist?.id, messages.length, markMessagesAsRead]);

  // Presence tracking
  useEffect(() => {
    if (!patientId || !user?.id || !conversationId) return;

    const channel = supabase.channel(`presence-${conversationId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const patientPresence = Object.values(presenceState).find(
          (presences: any) => presences?.[0]?.user_id === patientId && presences?.[0]?.user_id !== user.id
        );

        if (patientPresence?.[0]) {
          const onlineAt = patientPresence[0].online_at;
          setIsOnline(true);
          setLastSeen(onlineAt);
        } else {
          setIsOnline(false);
        }
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        if (newPresences[0]?.user_id === patientId) {
          setIsOnline(true);
          setLastSeen(newPresences[0].online_at || new Date().toISOString());
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (leftPresences[0]?.user_id === patientId) {
          setIsOnline(false);
          setLastSeen(leftPresences[0]?.online_at || null);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });

    presenceChannelRef.current = channel;

    return () => {
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
      }
    };
  }, [patientId, user?.id, conversationId]);

  const fetchPatient = async () => {
    if (!psychologist?.id) return;

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, profile_image_url")
        .eq("id", patientId)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  const fetchOrCreateConversation = async () => {
    if (!patientId || !psychologist?.id) return;

    try {
      setLoading(true);
      const conversation = await createOrGetConversation(psychologist.id, patientId);
      if (conversation) {
        setConversationId(conversation.id);
        await fetchConversationNickname(conversation.id);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      const decoded = await Promise.all(
        (data || []).map((msg) => decodeMessage(msg, msg.conversation_id))
      );
      setMessages(decoded);
      return data || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !psychologist?.id) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    stopTyping();

    // Optimista
    const tempId = `temp-${Date.now()}`;
    const optimistic: DecodedMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: psychologist.id,
      content: messageText,
      message_type: "text",
      read_at: null,
      created_at: new Date().toISOString(),
      attachment: null,
      _raw: null
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const payload = await prepareContent(messageText);
      const messageData = await sendMessage(conversationId, psychologist.id, messageText, {
        messageType: "text",
        contentPayload: payload
      });

      if (messageData) {
        const decoded = await decodeMessage(messageData, conversationId);
        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => msg.id !== tempId);
          const exists = withoutTemp.some((msg) => msg.id === decoded.id);
          if (!exists) {
            return [...withoutTemp, decoded].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          }
          return withoutTemp;
        });
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(messageText);
    }
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversationId || !psychologist?.id) return;
    event.target.value = "";

    const uploaded = await uploadAttachment(file, conversationId);
    if (!uploaded) return;

    const messageType = uploaded.kind === "image" ? "image" : uploaded.kind === "audio" ? "audio" : "file";
    const payload = await prepareContent(uploaded.meta);
    const sent = await sendMessage(conversationId, psychologist.id, uploaded.meta.path, {
      messageType,
      contentPayload: payload
    });

    if (sent) {
      const decoded = await decodeMessage(sent, conversationId);
      setMessages((prev) => [...prev, decoded]);
    }
  };

  const stopMediaTracks = (stream?: MediaStream) => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
  };

  const startRecording = async () => {
    if (isRecording || !conversationId || !psychologist?.id) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) mediaChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stopMediaTracks(stream);
        setIsRecording(false);
        const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size === 0) return;
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: blob.type });
        const uploaded = await uploadAttachment(file, conversationId!);
        if (!uploaded) return;
        const payload = await prepareContent(uploaded.meta);
        const sent = await sendMessage(conversationId!, psychologist.id, uploaded.meta.path, {
          messageType: "audio",
          contentPayload: payload
        });
        if (sent) {
          const decoded = await decodeMessage(sent, conversationId!);
          setMessages((prev) => [...prev, decoded]);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error iniciando grabación", error);
      // Podrías mostrar toast si tienes hook aquí; reusamos console para evitar dependencias adicionales.
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      sendTyping();
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    sendTyping();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    setShouldAutoScroll(distanceFromBottom < 80);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const actualPatientName = patient ? `${patient.first_name} ${patient.last_name}` : patientName || "Paciente";
  const displayName = patientNickname || patientName || actualPatientName;
  const displayImage = patientImage || patient?.profile_image_url;

  const renderMessageBody = (message: DecodedMessage) => {
    if (message.message_type === "image" && message.attachment?.path) {
      const url = attachmentUrls[message.attachment.path];
      if (!url) return <p className="text-sm">Adjunto de imagen</p>;
      return (
        <div className="w-[180px] h-[180px] relative">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block w-full h-full rounded-lg overflow-hidden shadow-sm border border-celeste-gray/40"
          >
            <img
              src={url}
              alt={message.attachment.name || "imagen"}
              className="w-full h-full object-cover"
            />
          </a>
          <a
            href={url}
            download={message.attachment.name || "imagen"}
            className="absolute bottom-2 right-2 bg-white/80 text-blue-petrol text-xs px-2 py-1 rounded shadow"
          >
            Descargar
          </a>
        </div>
      );
    }
    if (message.message_type === "audio" && message.attachment?.path) {
      const url = attachmentUrls[message.attachment.path];
      return url ? (
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-soft/15 to-celeste-gray/25 rounded-lg px-3 py-2 shadow-sm border border-celeste-gray/40 min-w-[240px] max-w-[320px]">
          <div className="w-2 h-2 rounded-full bg-blue-petrol animate-pulse" />
          <audio controls className="w-full">
            <source src={url} type={message.attachment.mime || "audio/webm"} />
            Tu navegador no soporta audio.
          </audio>
        </div>
      ) : (
        <p className="text-sm">Audio adjunto</p>
      );
    }
    if (message.message_type === "file" && message.attachment?.path) {
      const url = attachmentUrls[message.attachment.path];
      const isPdf = (message.attachment.mime || "").includes("pdf");
      return url ? (
        <div className="w-[220px] h-[220px] bg-white/70 border border-celeste-gray/40 rounded-lg p-3 shadow-sm flex flex-col justify-between">
          <div className="flex-1 overflow-hidden">
            {isPdf ? (
              <iframe src={`${url}#toolbar=0&zoom=80`} className="w-full h-[140px] rounded border border-celeste-gray/30" />
            ) : (
              <div className="w-full h-[140px] bg-celeste-gray/30 text-blue-petrol flex items-center justify-center rounded">
                <span className="text-sm font-semibold">Documento</span>
              </div>
            )}
            <p className="text-xs text-blue-petrol/80 mt-2 line-clamp-2">
              {message.attachment.name || "Documento"}
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center text-xs bg-blue-soft text-white py-1 rounded"
            >
              Abrir
            </a>
            <a
              href={url}
              download={message.attachment.name || "documento"}
              className="flex-1 text-center text-xs bg-celeste-gray/70 text-blue-petrol py-1 rounded"
            >
              Descargar
            </a>
          </div>
        </div>
      ) : (
        <p className="text-sm">Documento adjunto</p>
      );
    }
    return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
  };

  useEffect(() => {
    const attachments = messages.filter((m) => m.attachment?.path);
    attachments.forEach((m) => {
      if (m.attachment?.path) resolveAttachmentUrl(m.attachment.path);
    });
  }, [messages, resolveAttachmentUrl]);

  // Fallback polling cuando realtime está deshabilitado o con bindings rotos
  useEffect(() => {
    if (!conversationId || !psychologist?.id) return;

    const startPolling = () => {
      if (pollIntervalRef.current) return;
      pollIntervalRef.current = setInterval(() => {
        fetchMessagesWhenReady(conversationId);
      }, 2000);
      console.log("[PSYCHOLOGIST] Iniciando polling de mensajes (fallback realtime)");
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        console.log("[PSYCHOLOGIST] Deteniendo polling de mensajes (realtime OK)");
      }
    };

    if (isRealtimeDisabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [conversationId, psychologist?.id, isRealtimeDisabled]);

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
          <p className="text-blue-petrol/70">Inicia una conversación con el paciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white-warm">
      <div className="border-b border-celeste-gray/30 pb-3 px-4 pt-4">
        <div className="flex items-center gap-3">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-soft"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {getInitials(displayName)}
            </div>
          )}
          <div className="flex-1">
            <p className="text-blue-petrol font-semibold">{displayName}</p>
            <p className="text-xs text-blue-petrol/60">
              {lastSeen && !isOnline && `Última vez: ${formatTimeArgentina(lastSeen)}`}
              {!lastSeen && !isOnline && "Conversación segura"}
              {isOnline && "En línea"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
            <span className="text-xs text-blue-petrol/60">{isOnline ? "En línea" : "Desconectado"}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll}>
          {messages.length > 0 ? (
            <>
              {messages.map((message) => {
                const isOwn = message.sender_id === psychologist?.id;
                const senderName = isOwn
                  ? psychologist?.first_name && psychologist?.last_name
                    ? `${psychologist.first_name} ${psychologist.last_name}`
                    : "Tú"
                  : displayName;
                const senderImage = isOwn ? psychologist?.profile_image_url : displayImage;

                return (
                  <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}>
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
                        {renderMessageBody(message)}
                        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                          <span className={`text-xs ${isOwn ? "text-blue-100" : "text-blue-petrol/60"}`}>
                            {formatMessageTime(message.created_at)}
                          </span>
                          <MessageStatus
                            isOwnMessage={isOwn}
                            readAt={message.read_at || undefined}
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
                          Dr
                        </div>
                      )
                    )}
                  </div>
                );
              })}
              {otherUserTyping && (
                <div className="flex justify-start gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {getInitials(displayName)}
                  </div>
                  <div className="bg-celeste-gray/30 text-blue-petrol px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-petrol/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-blue-petrol/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-blue-petrol/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
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
            <label className="cursor-pointer px-3 py-2 bg-celeste-gray/40 text-blue-petrol rounded-md text-sm hover:bg-celeste-gray/60">
              Adjuntar
              <input
                type="file"
                accept="image/*,audio/*,application/pdf"
                className="hidden"
                onChange={handleFileSelected}
              />
            </label>
            <Button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "secondary"}
              className={isRecording ? "bg-red-500 text-white" : ""}
            >
              {isRecording ? "Detener" : "Grabar"}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || uploading}
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
