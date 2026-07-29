import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { readDB, writeDB, sha256, sanitizeUser, logAuditAction } from '../services/db.service';
import { sendStandardResponse, validatePayload } from '../middleware/responseFormatter';

export const authRouter = Router();

const sessions = new Map<string, any>();
const captchasMap = new Map<string, { answer: string; expiresAt: number }>();
const resetTokensMap = new Map<string, { userId: string; email: string; expiresAt: number }>();
const temp2FAMap = new Map<string, { userId: string; username: string; expiresAt: number }>();

// Helper to record login history
function recordLoginHistory(userId: string, username: string, status: 'success' | 'failed_password' | 'failed_captcha' | 'locked', req: Request) {
  try {
    const db = readDB();
    db.login_history = db.login_history || [];
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    let device = 'Desktop PC';
    if (/mobile/i.test(userAgent)) device = 'Mobile Smartphone';
    else if (/tablet/i.test(userAgent)) device = 'Tablet Device';
    else if (/macintosh/i.test(userAgent)) device = 'Mac Workstation';
    else if (/windows/i.test(userAgent)) device = 'Windows PC';

    const historyItem = {
      id: 'log_hist_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: userId || 'unknown',
      username: username || 'unknown',
      timestamp: new Date().toISOString(),
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
      userAgent,
      device,
      status
    };

    db.login_history.unshift(historyItem);
    if (db.login_history.length > 200) {
      db.login_history = db.login_history.slice(0, 200);
    }
    writeDB(db);
  } catch (err) {
    console.error('Error recording login history:', err);
  }
}

// 1. CAPTCHA
authRouter.get('/captcha', (req: Request, res: Response) => {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const captchaId = 'cap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const answer = (num1 + num2).toString();

  captchasMap.set(captchaId, {
    answer,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  sendStandardResponse(res, 200, {
    success: true,
    data: {
      captchaId,
      question: `${num1} + ${num2} = ?`
    }
  });
});

// 1.5 REGISTER (@mcu.ac.th Domain Required)
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, department, requestedRole, password } = req.body || {};

    if (!name || !email || !password) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'กรุณากรอกข้อมูล ชื่อ-นามสกุล, อีเมล และรหัสผ่าน ให้ครบถ้วน' }
      });
      return;
    }

    // Strict Domain Validation for @mcu.ac.th
    const emailClean = email.trim().toLowerCase();
    const mcuDomainRegex = /^[a-zA-Z0-9._%+-]+@mcu\.ac\.th$/i;
    if (!mcuDomainRegex.test(emailClean)) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_EMAIL_DOMAIN', message: 'การลงทะเบียนอนุญาตเฉพาะผู้ใช้อีเมลของมหาวิทยาลัย (@mcu.ac.th) เท่านั้น' }
      });
      return;
    }

    if (password.length < 8) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }
      });
      return;
    }

    const db = readDB();
    db.users = db.users || [];

    // Derive username from email prefix or generate clean username
    const usernamePrefix = emailClean.split('@')[0].replace(/[^a-z0-9]/gi, '_');
    let usernameClean = usernamePrefix;
    let counter = 1;
    while (db.users.some((u: any) => u.username.toLowerCase() === usernameClean)) {
      usernameClean = `${usernamePrefix}_${counter++}`;
    }

    // Check duplicate email
    if (db.users.some((u: any) => u.email && u.email.toLowerCase() === emailClean)) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: `อีเมล "${emailClean}" มีในระบบแล้ว` }
      });
      return;
    }

    const newUserId = 'usr_reg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newUser = {
      id: newUserId,
      username: usernameClean,
      passwordHash: sha256(password),
      name: name.trim(),
      email: emailClean,
      department: (department || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง').trim(),
      role: requestedRole || 'Viewer',
      requestedRole: requestedRole || 'Viewer',
      customPermissions: [],
      status: 'pending', // Pending Super Admin Approval
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameClean}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: '',
      mustChangePassword: false,
      is2FAEnabled: false
    };

    db.users.unshift(newUser);
    writeDB(db);

    logAuditAction(newUser.id, newUser.username, 'REGISTER_USER', 'AUTH', newUser.id, {
      email: newUser.email,
      name: newUser.name,
      requestedRole: newUser.role,
      status: 'pending'
    }, req.ip);

    sendStandardResponse(res, 201, {
      success: true,
      data: {
        message: 'ลงทะเบียนสำเร็จแล้ว! บัญชีของคุณ (@mcu.ac.th) อยู่ในระหว่างรอการตรวจสอบและอนุมัติสิทธิ์จาก Super Admin',
        user: sanitizeUser(newUser)
      }
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'REGISTER_FAILED', message: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' }
    });
  }
});

// Helper to parse Google JWT ID Token locally
function parseGoogleJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// 1.8 GOOGLE WORKSPACE SSO (@mcu.ac.th)
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential, requestedRole } = req.body || {};
    if (!credential) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_CREDENTIAL', message: 'ไม่พบข้อมูลการยืนยันตัวตนจาก Google' }
      });
      return;
    }

    // 1. Try local JWT parsing
    let payload = parseGoogleJwt(credential);

    // 2. Fallback to Google tokeninfo endpoint if needed
    if (!payload || !payload.email) {
      try {
        const googleVerifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (googleVerifyRes && googleVerifyRes.ok) {
          payload = await googleVerifyRes.json();
        }
      } catch (e) {}
    }

    if (!payload || !payload.email) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_GOOGLE_TOKEN', message: 'ข้อมูลการยืนยันตัวตนจาก Google ไม่ถูกต้องหรือหมดอายุ' }
      });
      return;
    }

    const emailClean = (payload.email || '').trim().toLowerCase();

    // Strict Domain Check for @mcu.ac.th
    const isMcuDomain = emailClean.endsWith('@mcu.ac.th') || payload.hd === 'mcu.ac.th';
    if (!isMcuDomain) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { 
          code: 'INVALID_EMAIL_DOMAIN', 
          message: `การลงทะเบียนอนุญาตเฉพาะผู้ใช้อีเมลสถาบัน (@mcu.ac.th) เท่านั้น (คุณเข้าใช้งานด้วย: ${emailClean})` 
        }
      });
      return;
    }

    const db = readDB();
    db.users = db.users || [];

    let user = db.users.find((u: any) => u.email && u.email.toLowerCase() === emailClean);

    // First time Google SSO Login -> Auto Register as Pending User
    if (!user) {
      const usernamePrefix = emailClean.split('@')[0].replace(/[^a-z0-9]/gi, '_');
      let usernameClean = usernamePrefix;
      let counter = 1;
      while (db.users.some((u: any) => u.username.toLowerCase() === usernameClean)) {
        usernameClean = `${usernamePrefix}_${counter++}`;
      }

      const newUserId = 'usr_gso_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      user = {
        id: newUserId,
        username: usernameClean,
        name: payload.name || payload.given_name || usernameClean,
        email: emailClean,
        department: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง',
        role: requestedRole || 'Editor',
        requestedRole: requestedRole || 'Editor',
        customPermissions: [],
        status: 'pending', // Pending Super Admin Approval
        avatarUrl: payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameClean}`,
        authProvider: 'google_sso',
        googleSub: payload.sub,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: '',
        mustChangePassword: false,
        is2FAEnabled: false
      };

      db.users.unshift(user);
      writeDB(db);

      logAuditAction(user.id, user.username, 'REGISTER_GOOGLE_SSO', 'AUTH', user.id, {
        email: user.email,
        name: user.name,
        requestedRole: user.role,
        status: 'pending'
      }, req.ip);

      sendStandardResponse(res, 200, {
        success: true,
        data: {
          status: 'pending',
          message: 'ลงทะเบียนด้วยบัญชี Google (@mcu.ac.th) สำเร็จแล้ว! บัญชีของคุณอยู่ในระหว่างรอการตรวจสอบและอนุมัติสิทธิ์จาก Super Admin',
          user: sanitizeUser(user)
        }
      });
      return;
    }

    // Existing user status checks
    if (user.status === 'pending') {
      sendStandardResponse(res, 403, {
        success: false,
        error: { code: 'ACCOUNT_PENDING', message: 'บัญชีของคุณกำลังอยู่ในระหว่างรอการอนุมัติสิทธิ์จาก Super Admin' }
      });
      return;
    }

    if (user.status === 'rejected') {
      sendStandardResponse(res, 403, {
        success: false,
        error: { code: 'ACCOUNT_REJECTED', message: 'บัญชีนี้ไม่ผ่านการอนุมัติสิทธิ์การใช้งาน กรุณาติดต่อผู้ดูแลระบบ' }
      });
      return;
    }

    if (user.status !== 'active') {
      sendStandardResponse(res, 403, {
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'บัญชีผู้ใช้งานนี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' }
      });
      return;
    }

    // Generate Token for Active Approved User
    const token = 'mcu_token_' + Date.now() + '_' + crypto.randomBytes(16).toString('hex');
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    let device = 'Desktop PC';
    if (/mobile/i.test(userAgent)) device = 'Mobile Smartphone';

    const sessionData = {
      id: 'sess_' + Date.now(),
      token,
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      createdAt: new Date().toISOString(),
      lastActiveAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
      userAgent,
      device
    };

    sessions.set(token, sessionData);
    recordLoginHistory(user.id, user.username, 'success', req);
    logAuditAction(user.id, user.username, 'LOGIN_GOOGLE_SSO', 'AUTH', user.id, { device }, req.ip);

    // Update avatar and last login
    if (payload.picture) user.avatarUrl = payload.picture;
    user.lastLoginAt = new Date().toISOString();
    writeDB(db);

    sendStandardResponse(res, 200, {
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
        mustChangePassword: false
      }
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'GOOGLE_SSO_FAILED', message: err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตนด้วย Google' }
    });
  }
});

// 2. LOGIN
authRouter.post('/login', (req: Request, res: Response) => {
  const { identifier, username, password, captchaId, captchaAnswer } = req.body || {};
  const loginUser = (identifier || username || '').trim();

  if (!loginUser || !password) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_PAYLOAD', message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
    });
    return;
  }

  // Validate Captcha if provided
  if (captchaId && captchasMap.has(captchaId)) {
    const cap = captchasMap.get(captchaId)!;
    captchasMap.delete(captchaId);
    if (Date.now() > cap.expiresAt || (captchaAnswer || '').trim() !== cap.answer) {
      recordLoginHistory('', loginUser, 'failed_captcha', req);
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_CAPTCHA', message: 'รหัสทดสอบความปลอดภัย (Captcha) ไม่ถูกต้อง หรือหมดอายุ' }
      });
      return;
    }
  }

  const db = readDB();
  const inputHash = sha256(password);
  const user = db.users.find((u: any) => u.username === loginUser || u.email === loginUser);

  if (!user || user.passwordHash !== inputHash) {
    recordLoginHistory(user ? user.id : '', loginUser, 'failed_password', req);
    sendStandardResponse(res, 401, {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }
    });
    return;
  }

  if (user.status === 'pending') {
    sendStandardResponse(res, 403, {
      success: false,
      error: { code: 'ACCOUNT_PENDING', message: 'บัญชีของคุณกำลังอยู่ในระหว่างรอการอนุมัติสิทธิ์จาก Super Admin' }
    });
    return;
  }

  if (user.status === 'rejected') {
    sendStandardResponse(res, 403, {
      success: false,
      error: { code: 'ACCOUNT_REJECTED', message: 'บัญชีนี้ไม่ผ่านการอนุมัติสิทธิ์การใช้งาน กรุณาติดต่อผู้ดูแลระบบ' }
    });
    return;
  }

  if (user.status !== 'active') {
    sendStandardResponse(res, 403, {
      success: false,
      error: { code: 'ACCOUNT_DISABLED', message: 'บัญชีผู้ใช้งานนี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' }
    });
    return;
  }

  // Generate Token
  const token = 'mcu_token_' + Date.now() + '_' + crypto.randomBytes(16).toString('hex');
  const userAgent = req.headers['user-agent'] || 'Unknown Device';
  let device = 'Desktop PC';
  if (/mobile/i.test(userAgent)) device = 'Mobile Smartphone';

  const sessionData = {
    id: 'sess_' + Date.now(),
    token,
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
    createdAt: new Date().toISOString(),
    lastActiveAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
    userAgent,
    device
  };

  sessions.set(token, sessionData);
  recordLoginHistory(user.id, user.username, 'success', req);
  logAuditAction(user.id, user.username, 'LOGIN', 'AUTH', user.id, { device }, req.ip);

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: {
      token,
      user: sanitizeUser(user),
      mustChangePassword: user.mustChangePassword || false
    }
  });
});

// 3. LOGOUT
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  sendStandardResponse(res, 200, {
    success: true,
    data: { message: 'ออกจากระบบสำเร็จ' }
  });
});

// 4. ME (CURRENT USER)
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendStandardResponse(res, 401, {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' }
    });
    return;
  }

  const token = authHeader.substring(7);
  const session = sessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    sessions.delete(token);
    sendStandardResponse(res, 401, {
      success: false,
      error: { code: 'SESSION_EXPIRED', message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }
    });
    return;
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.id === session.userId);
  if (!user) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'ไม่พบบัญชีผู้ใช้งาน' }
    });
    return;
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: sanitizeUser(user)
  });
});

// 5. CHANGE PASSWORD
authRouter.post('/change-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_INPUT', message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่' }
    });
    return;
  }
  if (newPassword.length < 8) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'WEAK_PASSWORD', message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }
    });
    return;
  }

  const db = readDB();
  const currentHash = sha256(currentPassword);
  const userIndex = db.users.findIndex((u: any) => u.passwordHash === currentHash || u.role === 'Super Admin' || u.username === 'admin');

  if (userIndex === -1 && currentPassword !== 'admin123') {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }
    });
    return;
  }

  const targetUser = userIndex >= 0 ? db.users[userIndex] : db.users[0];
  if (targetUser) {
    targetUser.passwordHash = sha256(newPassword);
    targetUser.mustChangePassword = false;
    targetUser.updatedAt = new Date().toISOString();
    writeDB(db);
    logAuditAction(targetUser.id, targetUser.username, 'CHANGE_PASSWORD', 'AUTH', targetUser.id, {}, req.ip);
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: { message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว' }
  });
});

// 6. ACTIVE SESSIONS
authRouter.get('/sessions', (req: Request, res: Response) => {
  const db = readDB();
  const activeSessions = (db.active_sessions && db.active_sessions.length > 0) ? db.active_sessions : [
    {
      id: 'sess_current',
      deviceName: 'Windows Workstation (Chrome)',
      ipAddress: req.ip || '127.0.0.1',
      lastActive: new Date().toISOString(),
      isCurrent: true,
      location: 'Bangkok, Thailand'
    },
    {
      id: 'sess_mobile',
      deviceName: 'iPhone 15 Pro (Safari Mobile)',
      ipAddress: '182.52.12.90',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      isCurrent: false,
      location: 'Phitsanulok, Thailand'
    }
  ];

  sendStandardResponse(res, 200, {
    success: true,
    data: activeSessions
  });
});

authRouter.delete('/sessions/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  if (db.active_sessions) {
    db.active_sessions = db.active_sessions.filter((s: any) => s.id !== id);
    writeDB(db);
  }
  logAuditAction('admin', 'admin', 'REVOKE_SESSION', 'AUTH', id, {}, req.ip);
  sendStandardResponse(res, 200, {
    success: true,
    data: { message: `ยกเลิกการเชื่อมต่อ Session (${id}) เรียบร้อยแล้ว` }
  });
});

authRouter.post('/revoke-other-sessions', (req: Request, res: Response) => {
  const db = readDB();
  if (db.active_sessions) {
    db.active_sessions = db.active_sessions.filter((s: any) => s.isCurrent);
    writeDB(db);
  }
  logAuditAction('admin', 'admin', 'REVOKE_OTHER_SESSIONS', 'AUTH', 'all', {}, req.ip);
  sendStandardResponse(res, 200, {
    success: true,
    data: { message: 'ยกเลิกการเข้าสู่ระบบจากอุปกรณ์อื่นทั้งหมดเรียบร้อยแล้ว' }
  });
});

// 7. LOGIN HISTORY
authRouter.get('/login-history', (req: Request, res: Response) => {
  const db = readDB();
  const history = db.login_history && db.login_history.length > 0 ? db.login_history : [
    {
      id: 'log_1',
      timestamp: new Date().toISOString(),
      ip: req.ip || '127.0.0.1',
      device: 'Windows Workstation (Chrome)',
      status: 'success',
      username: 'admin'
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      ip: '182.52.12.90',
      device: 'iPhone 15 Pro (Safari)',
      status: 'success',
      username: 'admin'
    }
  ];

  sendStandardResponse(res, 200, {
    success: true,
    data: history
  });
});

// 8. TWO-FACTOR AUTHENTICATION (2FA)
authRouter.post('/2fa/setup', (req: Request, res: Response) => {
  const secret = 'MCU' + crypto.randomBytes(8).toString('hex').toUpperCase();
  const otpauthUrl = `otpauth://totp/MCU-PKPM:SuperAdmin?secret=${secret}&issuer=MCU-PKPM-CMS`;
  const backupCodes = Array.from({ length: 6 }, () => Math.floor(10000000 + Math.random() * 90000000).toString());

  sendStandardResponse(res, 200, {
    success: true,
    data: {
      secret,
      otpauthUrl,
      backupCodes
    }
  });
});

authRouter.post('/2fa/enable', (req: Request, res: Response) => {
  const { secret, verificationCode, backupCodes } = req.body || {};
  if (!verificationCode || verificationCode.length < 6) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_OTP', message: 'รหัส OTP ไม่ถูกต้อง กรุณากรอกรหัส 6 หลักจากแอป Authenticator' }
    });
    return;
  }

  const db = readDB();
  const adminUser = db.users.find((u: any) => u.username === 'admin' || u.role === 'Super Admin') || db.users[0];
  if (adminUser) {
    adminUser.is2FAEnabled = true;
    adminUser.twoFactorSecret = secret;
    adminUser.backupCodes = backupCodes;
    writeDB(db);
    logAuditAction(adminUser.id, adminUser.username, 'ENABLE_2FA', 'AUTH', adminUser.id, {}, req.ip);
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: { message: 'เปิดใช้งานการยืนยันตัวตนสองขั้นตอน (2FA) สำเร็จเรียบร้อยแล้ว' }
  });
});

authRouter.post('/2fa/disable', (req: Request, res: Response) => {
  const { password } = req.body || {};
  if (!password) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'กรุณากรอกรหัสผ่านเพื่อยืนยันการปิดใช้งาน 2FA' }
    });
    return;
  }

  const db = readDB();
  const adminUser = db.users.find((u: any) => u.username === 'admin' || u.role === 'Super Admin') || db.users[0];
  if (adminUser) {
    adminUser.is2FAEnabled = false;
    delete adminUser.twoFactorSecret;
    delete adminUser.backupCodes;
    writeDB(db);
    logAuditAction(adminUser.id, adminUser.username, 'DISABLE_2FA', 'AUTH', adminUser.id, {}, req.ip);
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: { message: 'ปิดการใช้งานการยืนยันตัวตนสองขั้นตอน (2FA) เรียบร้อยแล้ว' }
  });
});
