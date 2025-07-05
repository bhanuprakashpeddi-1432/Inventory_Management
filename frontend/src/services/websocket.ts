import { io, Socket } from 'socket.io-client';
import authService from './auth';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) return;

    const token = authService.getToken();
    if (!token) return;

    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      const user = authService.getCurrentUser();
      if (user) {
        this.socket?.emit('join-user-room', user.id);
        this.socket?.emit('join-inventory-room');
        this.socket?.emit('join-analytics-room');
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    
    setTimeout(() => {
      console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  // Subscribe to events
  onInventoryUpdate(callback: (data: any) => void) {
    this.socket?.on('inventory-update', callback);
  }

  onAlert(callback: (alert: any) => void) {
    this.socket?.on('new-alert', callback);
  }

  onTrendUpdate(callback: (trends: any[]) => void) {
    this.socket?.on('trend-update', callback);
  }

  onForecastUpdate(callback: (forecast: any) => void) {
    this.socket?.on('forecast-update', callback);
  }

  onStockMovement(callback: (movement: any) => void) {
    this.socket?.on('stock-movement', callback);
  }

  onSalesUpdate(callback: (salesData: any) => void) {
    this.socket?.on('sales-update', callback);
  }

  onUserNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  // Unsubscribe from events
  off(eventName: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(eventName, callback);
    } else {
      this.socket?.off(eventName);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
