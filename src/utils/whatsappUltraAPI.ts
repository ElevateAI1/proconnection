
// 🔥 Cliente TypeScript Ultra-Optimizado para WhatsApp Server v4.0
// Integración perfecta con React y Supabase
import { formatDateArgentina, formatTimeArgentina, dateFormatOptions } from './dateFormatting';

interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
  notificationId?: string;
  priority?: 'normal' | 'high' | 'urgent';
}

interface WhatsAppMessageResponse {
  id: string;
  from_number: string;
  to_number: string;
  message_body: string;
  direction: 'incoming' | 'outgoing';
  contact_name?: string;
  message_timestamp: string;
  is_media: boolean;
  media_type?: string;
  delivery_status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

interface WhatsAppContact {
  id: string;
  phone_number: string;
  contact_name?: string;
  last_message_at: string;
  message_count: number;
  is_blocked: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface WhatsAppStatus {
  connected: boolean;
  phoneNumber?: string;
  deviceInfo?: any;
  qrCode?: string;
  metrics?: any;
  queueStats?: any;
  reconnectAttempts?: number;
  timestamp: string;
}

interface MessageStats {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  totals: {
    sent: number;
    received: number;
    total: number;
  };
  dailyStats: Array<{
    date: string;
    messages_sent: number;
    messages_received: number;
  }>;
  topContacts: Array<{
    phone_number: string;
    contact_name?: string;
    message_count: number;
    last_message_at: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

class WhatsAppUltraAPI {
  private baseURL: string;
  private token: string | null = null;
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(baseURL: string = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  // 🔐 Autenticación
  async login(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        this.token = data.token;
        this.saveTokenToStorage();
        return { success: true, data: { token: data.token } };
      } else {
        return { success: false, error: data.error || 'Error de autenticación' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error de red' };
    }
  }

  logout(): void {
    this.token = null;
    this.removeTokenFromStorage();
    this.disconnectWebSocket();
  }

  // 💾 Gestión de tokens
  private saveTokenToStorage(): void {
    if (typeof window !== 'undefined' && this.token) {
      localStorage.setItem('whatsapp_ultra_token', this.token);
    }
  }

  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('whatsapp_ultra_token');
    }
  }

  private removeTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('whatsapp_ultra_token');
    }
  }

  // 🌐 Métodos de API
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, ...data };
      } else {
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error de red' 
      };
    }
  }

  // 📱 Estado del sistema
  async getStatus(): Promise<ApiResponse<WhatsAppStatus>> {
    return this.makeRequest<WhatsAppStatus>('/api/status');
  }

  async getDetailedStatus(): Promise<ApiResponse<WhatsAppStatus>> {
    return this.makeRequest<WhatsAppStatus>('/api/status/detailed');
  }

  async getSession(): Promise<ApiResponse> {
    return this.makeRequest('/api/session');
  }

  async getHealthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  async getMetrics(): Promise<ApiResponse> {
    return this.makeRequest('/api/metrics');
  }

  // 📤 Envío de mensajes
  async sendMessage(
    phoneNumber: string, 
    message: string, 
    options: {
      priority?: 'normal' | 'high' | 'urgent';
    } = {}
  ): Promise<ApiResponse> {
    return this.makeRequest('/api/send', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber,
        message,
        priority: options.priority || 'normal'
      })
    });
  }

  async sendBulkMessages(messages: WhatsAppMessage[]): Promise<ApiResponse> {
    return this.makeRequest('/api/send-bulk', {
      method: 'POST',
      body: JSON.stringify({ messages })
    });
  }

  // 📨 Consulta de mensajes
  async getMessages(options: {
    page?: number;
    limit?: number;
    direction?: 'incoming' | 'outgoing';
    phone?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}): Promise<ApiResponse<{
    messages: WhatsAppMessageResponse[];
    pagination: PaginationInfo;
    filters: any;
  }>> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest(`/api/messages?${params.toString()}`);
  }

  async getMessageStats(days: number = 7): Promise<ApiResponse<MessageStats>> {
    return this.makeRequest(`/api/messages/stats?days=${days}`);
  }

  // 👥 Gestión de contactos
  async getContacts(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<{
    contacts: WhatsAppContact[];
    pagination: PaginationInfo;
  }>> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest(`/api/contacts?${params.toString()}`);
  }

  // 🔧 Control del bot
  async restartBot(): Promise<ApiResponse> {
    return this.makeRequest('/api/bot/restart', {
      method: 'POST'
    });
  }

  async clearSession(): Promise<ApiResponse> {
    return this.makeRequest('/api/bot/clear-session', {
      method: 'POST'
    });
  }

  // 🔌 WebSocket en tiempo real
  connectWebSocket(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) return;

    const wsURL = this.baseURL.replace('http', 'ws').replace('3001', '3002');
    this.wsConnection = new WebSocket(wsURL);

    this.wsConnection.onopen = () => {
      console.log('🔌 WebSocket conectado');
      this.emit('connected');
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
        
        if (data.type) {
          this.emit(data.type, data.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('🔌 WebSocket desconectado');
      this.emit('disconnected');
      
      setTimeout(() => {
        if (this.wsConnection?.readyState !== WebSocket.OPEN) {
          this.connectWebSocket();
        }
      }, 5000);
    };

    this.wsConnection.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      this.emit('error', error);
    };
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // 🎧 Sistema de eventos
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // 🎯 Métodos de conveniencia para psicólogos
  async sendAppointmentReminder(
    patientPhone: string,
    patientName: string,
    psychologistName: string,
    appointmentDate: Date,
    notificationId?: string
  ): Promise<ApiResponse> {
    const message = `Hola ${patientName}, te recordamos tu cita con ${psychologistName} para el ${formatDateArgentina(appointmentDate, dateFormatOptions.full)} a las ${formatTimeArgentina(appointmentDate)}. ¡Te esperamos!`;
    
    return this.sendMessage(patientPhone, message, { priority: 'high' });
  }

  async sendPaymentConfirmation(
    patientPhone: string,
    patientName: string,
    amount: number,
    paymentDate: Date,
    notificationId?: string
  ): Promise<ApiResponse> {
    const message = `Hola ${patientName}, hemos confirmado tu pago de $${amount} realizado el ${formatDateArgentina(paymentDate)}. ¡Gracias!`;
    
    return this.sendMessage(patientPhone, message, { priority: 'high' });
  }

  async sendDocumentReady(
    patientPhone: string,
    patientName: string,
    documentType: string,
    notificationId?: string
  ): Promise<ApiResponse> {
    const message = `Hola ${patientName}, tu ${documentType} está listo para ser revisado en el portal del paciente. Puedes acceder cuando gustes.`;
    
    return this.sendMessage(patientPhone, message, { priority: 'normal' });
  }

  // 📊 Utilidades de formato
  formatArgentinePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+') && !cleaned.startsWith('54')) {
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.length === 10 && !cleaned.startsWith('9')) {
        cleaned = '9' + cleaned;
      }
      cleaned = '+54' + cleaned;
    } else if (cleaned.startsWith('54') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  isValidArgentinePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return /^(\+54|54)?9?\d{8,12}$/.test(cleaned);
  }

  // 🔄 Auto-polling para mantener estado actualizado
  private pollInterval: NodeJS.Timeout | null = null;

  startStatusPolling(intervalMs: number = 30000): void {
    this.stopStatusPolling();
    
    this.pollInterval = setInterval(async () => {
      const status = await this.getStatus();
      if (status.success) {
        this.emit('status_update', status.data);
      }
    }, intervalMs);
  }

  stopStatusPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // 🧹 Limpieza
  destroy(): void {
    this.stopStatusPolling();
    this.disconnectWebSocket();
    this.eventListeners.clear();
  }
}

// 🎣 Hook de React para usar la API
import { useState, useEffect, useCallback } from 'react';

export function useWhatsAppUltra(autoConnect: boolean = true) {
  const [api] = useState(() => new WhatsAppUltraAPI());
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación inicial
  useEffect(() => {
    const token = localStorage.getItem('whatsapp_ultra_token');
    setIsAuthenticated(!!token);
  }, []);

  // Auto-conectar WebSocket y polling
  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      api.connectWebSocket();
      api.startStatusPolling();
      
      // Listeners de eventos
      api.on('status_update', setStatus);
      api.on('error', setError);
      
      // Obtener estado inicial
      api.getStatus().then(response => {
        if (response.success) {
          setStatus(response.data);
        }
      });
    }

    return () => {
      api.destroy();
    };
  }, [api, autoConnect, isAuthenticated]);

  // Métodos de autenticación
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.login(username, password);
      
      if (response.success) {
        setIsAuthenticated(true);
        return response;
      } else {
        setError(response.error || 'Error de autenticación');
        return response;
      }
    } finally {
      setLoading(false);
    }
  }, [api]);

  const logout = useCallback(() => {
    api.logout();
    setIsAuthenticated(false);
    setStatus(null);
    setError(null);
  }, [api]);

  // Métodos de envío
  const sendMessage = useCallback(async (
    phoneNumber: string, 
    message: string, 
    options?: { priority?: 'normal' | 'high' | 'urgent' }
  ) => {
    setLoading(true);
    try {
      const response = await api.sendMessage(phoneNumber, message, options);
      if (!response.success) {
        setError(response.error || 'Error enviando mensaje');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const sendBulkMessages = useCallback(async (messages: WhatsAppMessage[]) => {
    setLoading(true);
    try {
      const response = await api.sendBulkMessages(messages);
      if (!response.success) {
        setError(response.error || 'Error en envío masivo');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Métodos de consulta
  const getMessages = useCallback(async (options?: any) => {
    setLoading(true);
    try {
      const response = await api.getMessages(options);
      if (!response.success) {
        setError(response.error || 'Error obteniendo mensajes');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getContacts = useCallback(async (options?: any) => {
    setLoading(true);
    try {
      const response = await api.getContacts(options);
      if (!response.success) {
        setError(response.error || 'Error obteniendo contactos');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getMessageStats = useCallback(async (days?: number) => {
    setLoading(true);
    try {
      const response = await api.getMessageStats(days);
      if (!response.success) {
        setError(response.error || 'Error obteniendo estadísticas');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Métodos específicos para psicólogos
  const sendAppointmentReminder = useCallback(async (
    patientPhone: string,
    patientName: string,
    psychologistName: string,
    appointmentDate: Date,
    notificationId?: string
  ) => {
    return api.sendAppointmentReminder(
      patientPhone, 
      patientName, 
      psychologistName, 
      appointmentDate, 
      notificationId
    );
  }, [api]);

  const sendPaymentConfirmation = useCallback(async (
    patientPhone: string,
    patientName: string,
    amount: number,
    paymentDate: Date,
    notificationId?: string
  ) => {
    return api.sendPaymentConfirmation(
      patientPhone, 
      patientName, 
      amount, 
      paymentDate, 
      notificationId
    );
  }, [api]);

  const sendDocumentReady = useCallback(async (
    patientPhone: string,
    patientName: string,
    documentType: string,
    notificationId?: string
  ) => {
    return api.sendDocumentReady(
      patientPhone, 
      patientName, 
      documentType, 
      notificationId
    );
  }, [api]);

  // Control del bot
  const restartBot = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.restartBot();
      if (!response.success) {
        setError(response.error || 'Error reiniciando bot');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const clearSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.clearSession();
      if (!response.success) {
        setError(response.error || 'Error limpiando sesión');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    // Estado
    status,
    isAuthenticated,
    loading,
    error,
    
    // API instance
    api,
    
    // Autenticación
    login,
    logout,
    
    // Envío de mensajes
    sendMessage,
    sendBulkMessages,
    
    // Consulta de datos
    getMessages,
    getContacts,
    getMessageStats,
    
    // Métodos específicos
    sendAppointmentReminder,
    sendPaymentConfirmation,
    sendDocumentReady,
    
    // Control del bot
    restartBot,
    clearSession,
    
    // Utilidades
    formatPhoneNumber: api.formatArgentinePhoneNumber.bind(api),
    isValidPhoneNumber: api.isValidArgentinePhoneNumber.bind(api),
    
    // Limpieza de errores
    clearError: () => setError(null)
  };
}

// Exportar instancia singleton para uso directo
export const whatsappUltraAPI = new WhatsAppUltraAPI();
export default whatsappUltraAPI;
