import { Request, Response, NextFunction } from 'express';

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

export function createRateLimiter(limit: number = 120, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const isAuthPath = req.path.includes('/auth') || req.path.includes('/login');
    const pathLimit = isAuthPath ? 15 : limit;
    const key = `${ip}:${isAuthPath ? 'auth' : 'general'}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);
    if (!record || (now - record.windowStart) > windowMs) {
      record = { count: 1, windowStart: now };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, pathLimit - record.count);
    const resetSec = Math.ceil((record.windowStart + windowMs - now) / 1000);

    res.setHeader('X-RateLimit-Limit', pathLimit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetSec.toString());

    if (record.count > pathLimit) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'คำขอเข้าถึงระบบถี่เกินกำหนด (Rate Limit Exceeded) กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
          details: { resetInSeconds: resetSec, limit: pathLimit }
        },
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId
      });
      return;
    }
    next();
  };
}
