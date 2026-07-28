import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import { createRateLimiter } from './server/middleware/rateLimiter';
import { authRouter } from './server/routes/auth.routes';
import { newsRouter } from './server/routes/news.routes';
import { academicRouter } from './server/routes/academic.routes';
import { admissionRouter } from './server/routes/admission.routes';
import { systemRouter } from './server/routes/system.routes';
import { personnelRouter } from './server/routes/personnel.routes';
import { coursesRouter } from './server/routes/courses.routes';
import { mediaRouter } from './server/routes/media.routes';
import { announcementsRouter } from './server/routes/announcements.routes';
import { usersRouter } from './server/routes/users.routes';
import { eventsRouter } from './server/routes/events.routes';
import { bannersRouter } from './server/routes/banners.routes';

// Strict Environment & Security Configuration Validation
function validateEnvironmentVariables() {
  const envMode = process.env.NODE_ENV || 'development';
  console.log(`[CONFIG LOG] Starting MCU-PKPM CMS Server in [${envMode}] mode...`);

  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    console.error('❌ [FATAL CONFIG ERROR] Invalid PORT environment variable. PORT must be a valid number.');
    process.exit(1);
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`[CONFIG LOG] Created upload directory at: ${uploadsDir}`);
    } catch (err: any) {
      console.error(`❌ [FATAL CONFIG ERROR] Unable to create upload directory (${uploadsDir}):`, err.message);
      process.exit(1);
    }
  }
}

validateEnvironmentVariables();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload & backup directories exist & static serving
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const BACKUPS_DIR = path.join(process.cwd(), 'backups');
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}
app.use('/backups', express.static(BACKUPS_DIR));

// 1. API Versioning & Header Rewrite
app.use((req, res, next) => {
  res.setHeader('X-API-Version', 'v1.0.0');
  res.setHeader('X-Powered-By', 'MCU-PKPM-CMS-API');
  
  if (req.url.startsWith('/api/v1/')) {
    req.url = req.url.replace('/api/v1/', '/api/');
  }
  next();
});

// 2. Structured Request Logging & Request ID
app.use((req, res, next) => {
  const requestId = 'req_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const startMs = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startMs;
    console.log(`[API LOG] ${new Date().toISOString()} | ID: ${requestId} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Time: ${durationMs}ms | IP: ${req.ip || '127.0.0.1'}`);
  });
  next();
});

// 3. Sliding Window Rate Limiting
app.use('/api', createRateLimiter(150, 60 * 1000));

// Health Check Endpoint for Production Probes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'MCU-PKPM-CMS-API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage()
  });
});

// 4. API ROUTERS
app.use('/api/auth', authRouter);
app.use('/api', newsRouter);
app.use('/api', academicRouter);
app.use('/api', admissionRouter);
app.use('/api', systemRouter);
app.use('/api', personnelRouter);
app.use('/api', coursesRouter);
app.use('/api', mediaRouter);
app.use('/api', announcementsRouter);
app.use('/api', usersRouter);
app.use('/api', eventsRouter);
app.use('/api', bannersRouter);

// 5. Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[GLOBAL ERROR HANDLER]:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์ (Internal Server Error)';
  
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message
    },
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId || 'req_' + Date.now()
  });
});

// 6. Vite Integration / Static Frontend Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [MCU-PKPM CMS] Server running on http://localhost:${PORT}`);
  });
}

startServer();
