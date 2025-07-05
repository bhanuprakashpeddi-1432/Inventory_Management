import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

export class WebSocketService {
  private io: Server;
  private prisma: PrismaClient;

  constructor(io: Server) {
    this.io = io;
    this.prisma = new PrismaClient();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join user to their specific room for personalized updates
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
      });

      // Join inventory updates room
      socket.on('join-inventory-room', () => {
        socket.join('inventory-updates');
      });

      // Join analytics room
      socket.on('join-analytics-room', () => {
        socket.join('analytics-updates');
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast inventory updates
  broadcastInventoryUpdate(data: any) {
    this.io.to('inventory-updates').emit('inventory-update', data);
  }

  // Broadcast new alerts
  broadcastAlert(alert: any) {
    this.io.emit('new-alert', alert);
  }

  // Broadcast trend updates
  broadcastTrendUpdate(trends: any[]) {
    this.io.to('analytics-updates').emit('trend-update', trends);
  }

  // Broadcast forecast updates
  broadcastForecastUpdate(forecast: any) {
    this.io.to('analytics-updates').emit('forecast-update', forecast);
  }

  // Send personalized notification to specific user
  sendUserNotification(userId: string, notification: any) {
    this.io.to(`user-${userId}`).emit('notification', notification);
  }

  // Broadcast stock movement
  broadcastStockMovement(movement: any) {
    this.io.to('inventory-updates').emit('stock-movement', movement);
  }

  // Broadcast real-time sales data
  broadcastSalesUpdate(salesData: any) {
    this.io.to('analytics-updates').emit('sales-update', salesData);
  }
}
