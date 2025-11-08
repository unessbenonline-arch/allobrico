import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

// Import database connection
try {
  import('./database');
  console.log('Database module imported successfully');
} catch (error) {
  console.error('Failed to import database module:', error);
}

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import projectRoutes from './routes/projects';
import requestRoutes from './routes/requests';
import workerRoutes from './routes/workers';
import adminRoutes from './routes/admin';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';

console.log('Routes imported successfully');

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const PORT = parseInt(process.env.PORT || '5001', 10);

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlloObbrico API',
      version: '1.0.0',
      description: 'API for AlloObbrico professional services marketplace',
    },
    servers: [
      {
        url: `http://localhost:80/api`,
        description: 'Production server (via nginx)',
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Direct backend access',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (for demo purposes, use MemoryStore; do NOT use in production)
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'dev_session_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set true if behind HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8 // 8 hours
  }
}));

// Socket.IO middleware for session sharing
io.use((socket, next) => {
  const req = socket.request as any;
  const res = {} as any;

  // Parse cookies from socket handshake
  const cookieParser = require('cookie-parser');
  cookieParser()(req, res, () => {});

  // Initialize session
  const sessionMiddleware = session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev_session_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  });

  sessionMiddleware(req, res, (err?: any) => {
    if (err) return next(err);
    next();
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const session = (socket.request as any).session;
  console.log('User connected:', session?.userId || 'anonymous');

  // Join user-specific room for notifications
  if (session?.userId) {
    socket.join(`user_${session.userId}`);
    console.log(`User ${session.userId} joined room user_${session.userId}`);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', session?.userId || 'anonymous');
  });
});

// Make io available globally for emitting notifications
(global as any).io = io;

// Disable caching in development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'AlloObbrico Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      projects: '/api/projects',
      requests: '/api/requests',
      workers: '/api/workers',
      admin: '/api/admin'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on our end'
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AlloObbrico Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:80/health`);
  console.log(`📚 API Documentation: http://localhost:80/api-docs`);
  console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
  console.log(`🔗 Frontend access: http://localhost:80 (via nginx proxy)`);
  console.log(`🔌 WebSocket server ready`);
});

export default app;