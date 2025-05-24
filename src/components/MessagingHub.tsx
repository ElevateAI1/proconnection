
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Search } from "lucide-react";

export const MessagingHub = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Ana Martínez",
      lastMessage: "Buenos días doctora, quería confirmar mi cita de mañana...",
      time: "hace 5 min",
      unread: 2,
      avatar: "AM"
    },
    {
      id: 2,
      name: "Carlos López",
      lastMessage: "Muchas gracias por la sesión de ayer, me ayudó mucho...",
      time: "hace 1 hora",
      unread: 0,
      avatar: "CL"
    },
    {
      id: 3,
      name: "María Rodriguez",
      lastMessage: "¿Podríamos reprogramar la cita del viernes?",
      time: "hace 2 horas",
      unread: 1,
      avatar: "MR"
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "patient",
      text: "Buenos días doctora, quería confirmar mi cita de mañana a las 10:00",
      time: "10:30",
      avatar: "AM"
    },
    {
      id: 2,
      sender: "psychologist",
      text: "Buenos días Ana. Sí, tu cita está confirmada para mañana a las 10:00. ¿Hay algo específico que te gustaría trabajar en la sesión?",
      time: "10:32",
      avatar: "Dr"
    },
    {
      id: 3,
      sender: "patient",
      text: "Me gustaría hablar sobre las técnicas de relajación que me enseñó la semana pasada. He estado practicando pero tengo algunas dudas.",
      time: "10:35",
      avatar: "AM"
    },
    {
      id: 4,
      sender: "psychologist",
      text: "Perfecto, dedicaremos tiempo a revisar las técnicas y resolver tus dudas. Nos vemos mañana.",
      time: "10:37",
      avatar: "Dr"
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Centro de Mensajes</h2>
        <p className="text-slate-600">Comunicación segura con tus pacientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MessageCircle className="w-5 h-5" />
              Conversaciones
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Buscar conversaciones..." className="pl-10 h-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-l-4 ${
                    selectedChat === conversation.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {conversation.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-slate-800 truncate">{conversation.name}</p>
                        <span className="text-xs text-slate-500">{conversation.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">{conversation.unread}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg h-full flex flex-col">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  AM
                </div>
                <div>
                  <CardTitle className="text-slate-800">Ana Martínez</CardTitle>
                  <p className="text-sm text-slate-600">En línea</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "psychologist" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[70%] ${message.sender === "psychologist" ? "flex-row-reverse" : ""}`}>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {message.avatar}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.sender === "psychologist"
                            ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === "psychologist" ? "text-blue-100" : "text-slate-500"}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
