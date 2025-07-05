import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

// Route imports
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import inventoryRoutes from './routes/inventory';
import analyticsRoutes from './routes/analytics';
import reportsRoutes from './routes/reports';
import alertRoutes from './routes/alerts';
import trendRoutes from './routes/trends';

// Middleware imports
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

// Services
import { WebSocketService } from './services/websocket';
import { ForecastService } from './services/forecast';
import { AlertService } from './services/alert';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Initialize Prisma client with connection logging
const prisma = new PrismaClient();

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('📡 Connected to database');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
  });

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Much higher limit in dev
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting entirely in development for localhost
  skip: (req) => {
    const isDev = process.env.NODE_ENV === 'development';
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || Boolean(req.ip && req.ip.includes('localhost'));
    return Boolean(isDev && isLocalhost);
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/alerts', authenticateToken, alertRoutes);
app.use('/api/trends', authenticateToken, trendRoutes);

// Error handling
app.use(errorHandler);

// Initialize services
const websocketService = new WebSocketService(io);
const forecastService = new ForecastService();
const alertService = new AlertService(websocketService);

// Start background processes
forecastService.startDailyForecasting();
alertService.startAlertMonitoring();

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server initialized`);
  console.log(`🔄 Background services started`);
});

export { io, websocketService };
