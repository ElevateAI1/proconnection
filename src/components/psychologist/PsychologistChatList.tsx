import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, MoreVertical, Edit, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { formatMessageTime } from "@/utils/messageFormatting";
import { formatTimeArgentina } from "@/utils/dateFormatting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";

interface Conversation {
  id: string;
  patient_id: string;
  psychologist_id: string;
  last_message_at: string | null;
  patient_nickname?: string | null;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url?: string | null;
  };
  unread_count?: number;
}

interface PsychologistChatListProps {
  onSelectConversation: (patientId: string, conversationId?: string) => void;
  selectedPatientId?: string;
}

export const PsychologistChatList = ({ onSelectConversation, selectedPatientId }: PsychologistChatListProps) => {
  const { psychologist } = useProfile();
  const { markMessagesAsRead } = useMarkMessagesAsRead();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNickname, setEditingNickname] = useState<string | null>(null);
  const [newNickname, setNewNickname] = useState("");
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});
  const presenceChannelsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (psychologist?.id) {
      fetchConversations();
    }
  }, [psychologist?.id]);

  // Realtime subscription para cambios en conversaciones (nickname, etc)
  useRealtimeChannel({
    channelName: `psychologist-conversations-list-${psychologist?.id}`,
    enabled: !!psychologist?.id,
    table: 'conversations',
    filter: `psychologist_id=eq.${psychologist?.id}`,
    onUpdate: () => {
      fetchConversations();
    }
  });

  // Escuchar mensajes para refrescar conteos/orden cuando llegue algo nuevo
  useRealtimeChannel({
    channelName: `psychologist-messages-listener-${psychologist?.id}`,
    enabled: !!psychologist?.id,
    table: 'messages',
    filter: undefined, // escuchamos todos y filtramos por conversaciones del psicólogo en fetch
    onUpdate: (payload) => {
      if (payload.eventType !== 'INSERT' || !payload.new) return;
      const msg = payload.new;
      setConversations(prev => {
        const found = prev.find(c => c.id === msg.conversation_id);
        if (!found) return prev;
        const isOpen = selectedPatientId && found.patient_id === selectedPatientId;
        const fromOther = msg.sender_id !== psychologist?.id;
        const unread = isOpen ? 0 : fromOther ? (found.unread_count || 0) + 1 : found.unread_count || 0;
        const updated = prev.map(c =>
          c.id === found.id
            ? { ...c, unread_count: unread, last_message_at: msg.created_at }
            : c
        );
        return sortByLastMessage(updated);
      });
    }
  });

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
          patient_nickname,
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
      
      // Setup presence tracking for each conversation
      conversationsWithUnread.forEach(conv => {
        setupPresenceTracking(conv.id, conv.patient_id);
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupPresenceTracking = (conversationId: string, patientId: string) => {
    // Cleanup previous channel if exists
    if (presenceChannelsRef.current[conversationId]) {
      supabase.removeChannel(presenceChannelsRef.current[conversationId]);
    }

    const channel = supabase.channel(`presence-${conversationId}`, {
      config: {
        presence: {
          key: psychologist?.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const patientPresence = Object.values(presenceState).find(
          (presences: any) => presences?.[0]?.user_id === patientId
        );
        
        if (patientPresence?.[0]?.online_at) {
          setLastSeenMap(prev => ({
            ...prev,
            [patientId]: patientPresence[0].online_at
          }));
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (newPresences[0]?.user_id === patientId) {
          setLastSeenMap(prev => ({
            ...prev,
            [patientId]: newPresences[0].online_at || new Date().toISOString()
          }));
        }
      })
      .subscribe();

    presenceChannelsRef.current[conversationId] = channel;
  };

  const handleChangeNickname = async (conversationId: string, patientId: string) => {
    if (!psychologist?.id) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ patient_nickname: newNickname.trim() || null })
        .eq('id', conversationId);

      if (error) throw error;

      const updatedConv = conversations.find(c => c.id === conversationId);
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, patient_nickname: newNickname.trim() || null }
          : conv
      ));

      setEditingNickname(null);
      setNewNickname("");
      toast({
        title: "Apodo actualizado",
        description: "El apodo se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating nickname:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el apodo",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!psychologist?.id) return;

    try {
      // Delete all messages first (CASCADE should handle this, but being explicit)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete conversation
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (convError) throw convError;

      // Cleanup presence channel
      if (presenceChannelsRef.current[conversationId]) {
        supabase.removeChannel(presenceChannelsRef.current[conversationId]);
        delete presenceChannelsRef.current[conversationId];
      }

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setDeletingConversation(null);
      
      if (selectedPatientId) {
        const deletedConv = conversations.find(c => c.id === conversationId);
        if (deletedConv?.patient_id === selectedPatientId) {
          onSelectConversation('');
        }
      }

      toast({
        title: "Chat eliminado",
        description: "El chat ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el chat",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup all presence channels
      Object.values(presenceChannelsRef.current).forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredConversations = conversations.filter(conv => {
    const displayName = conv.patient_nickname || `${conv.patient.first_name} ${conv.patient.last_name}`;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortByLastMessage = (list: Conversation[]) =>
    [...list].sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });

  const handleSelectConversation = async (conv: Conversation) => {
    // Optimista: limpiar badge
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
    // Marcar como leídos en DB
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conv.id)
        .neq('sender_id', psychologist?.id || '')
        .is('read_at', null);
    } catch (e) {
      // si falla, no hacemos rollback del badge; el chat hará el mark en montaje
      console.warn('No se pudo marcar como leído desde la lista', e);
    }
    onSelectConversation(conv.patient.id, conv.id);
  };

  // Si la conversación seleccionada tiene unread_count, marcarlas como leídas en cuanto se abre la vista
  useEffect(() => {
    if (!selectedPatientId || !psychologist?.id) return;
    const conv = conversations.find(c => c.patient_id === selectedPatientId);
    if (!conv || (conv.unread_count || 0) === 0) return;

    markMessagesAsRead(conv.id, psychologist.id).then((ok) => {
      if (ok) {
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
      }
    });
  }, [selectedPatientId, psychologist?.id, conversations, markMessagesAsRead]);

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
              const displayName = conv.patient_nickname || patientName;
              const isSelected = selectedPatientId === conv.patient.id;
              const lastSeen = lastSeenMap[conv.patient.id];
              const timeSinceLastSeen = lastSeen ? Date.now() - new Date(lastSeen).getTime() : null;
              const isOnline = lastSeen && timeSinceLastSeen !== null && timeSinceLastSeen < 60000;
              const unread = Number(conv.unread_count ?? 0);
              
              return (
                <ContextMenu key={conv.id}>
                  <ContextMenuTrigger asChild>
                    <div className={`relative w-full ${isSelected ? 'bg-blue-soft/20' : ''}`}>
                          <div
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full p-4 hover:bg-blue-soft/10 transition-colors text-left cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {conv.patient.profile_image_url ? (
                              <img
                                src={conv.patient.profile_image_url}
                                alt={displayName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-soft"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials(displayName)}
                              </div>
                            )}
                            {isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white-warm"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <p className="font-semibold text-blue-petrol truncate">
                                  {displayName}
                                </p>
                                {conv.patient_nickname && (
                                  <span className="text-xs text-blue-petrol/50 truncate">
                                    ({patientName})
                                  </span>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    type="button"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingNickname(conv.id);
                                      setNewNickname(conv.patient_nickname || '');
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Cambiar apodo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingConversation(conv.id);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar chat
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                {lastSeen && (
                                  <span className="text-xs text-blue-petrol/50">
                                    {isOnline ? 'En línea' : `Última vez: ${formatTimeArgentina(lastSeen)}`}
                                  </span>
                                )}
                                {unread > 0 && (
                                  <Badge className="bg-blue-petrol text-white-warm w-fit">
                                    {unread} nuevo{unread > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              {conv.last_message_at && (
                                <span className="text-xs text-blue-petrol/60 whitespace-nowrap ml-2">
                                  {formatMessageTime(conv.last_message_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setEditingNickname(conv.id);
                        setNewNickname(conv.patient_nickname || '');
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Cambiar apodo
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => setDeletingConversation(conv.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar chat
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
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

      {/* Dialog para cambiar apodo */}
      <Dialog open={editingNickname !== null} onOpenChange={(open) => !open && setEditingNickname(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar apodo</DialogTitle>
            <DialogDescription>
              Establece un apodo personalizado para este paciente en esta conversación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Apodo</Label>
              <Input
                id="nickname"
                placeholder="Ej: Juanito, J..."
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && editingNickname) {
                    const conv = conversations.find(c => c.id === editingNickname);
                    if (conv) {
                      handleChangeNickname(conv.id, conv.patient_id);
                    }
                  }
                }}
              />
              <p className="text-xs text-blue-petrol/60">
                Deja vacío para usar el nombre real
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingNickname(null);
                setNewNickname("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editingNickname) {
                  const conv = conversations.find(c => c.id === editingNickname);
                  if (conv) {
                    handleChangeNickname(conv.id, conv.patient_id);
                  }
                }
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deletingConversation !== null} onOpenChange={(open) => !open && setDeletingConversation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente todos los mensajes de esta conversación. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingConversation) {
                  handleDeleteConversation(deletingConversation);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

