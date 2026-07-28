import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const DB_FILE = path.join(process.cwd(), 'src', 'data', 'db.json');

export function sha256(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

let globalCacheVersion = Date.now();

export function getGlobalCacheVersion(): number {
  return globalCacheVersion;
}

export function updateCacheVersion(): number {
  globalCacheVersion = Date.now();
  return globalCacheVersion;
}

export function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, twoFactorSecret, backupCodes, ...safeUser } = user;
  return safeUser;
}

export function readDB(): any {
  let db: any = {};
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file, initializing default schema:', err);
  }

  // Ensure all 26 core relational collections exist
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.roles)) db.roles = [];
  if (!Array.isArray(db.permissions)) db.permissions = [];
  if (!Array.isArray(db.role_permissions)) db.role_permissions = [];
  if (!Array.isArray(db.user_roles)) db.user_roles = [];
  if (!Array.isArray(db.pages)) db.pages = [];
  if (!Array.isArray(db.page_revisions)) db.page_revisions = [];
  if (!Array.isArray(db.menus)) db.menus = [];
  if (!Array.isArray(db.menu_items)) db.menu_items = [];
  if (!Array.isArray(db.posts)) db.posts = db.news || [];
  if (!Array.isArray(db.news)) db.news = db.posts || [];
  if (!Array.isArray(db.post_categories)) db.post_categories = [];
  if (!Array.isArray(db.post_tags)) db.post_tags = [];
  if (!Array.isArray(db.post_tag_relations)) db.post_tag_relations = [];
  if (!Array.isArray(db.announcements)) db.announcements = [];
  if (!Array.isArray(db.events)) db.events = [];
  if (!Array.isArray(db.courses)) db.courses = [];
  if (!Array.isArray(db.admissions)) db.admissions = db.admission_projects || [];
  if (!Array.isArray(db.admission_projects)) db.admission_projects = db.admissions || [];
  if (!Array.isArray(db.personnel)) db.personnel = [];
  if (!Array.isArray(db.academic_works)) db.academic_works = [];
  if (!Array.isArray(db.downloads)) db.downloads = [];
  if (!Array.isArray(db.media)) db.media = [];
  if (!Array.isArray(db.audit_logs)) db.audit_logs = [];
  if (!Array.isArray(db.login_history)) db.login_history = [];
  if (!Array.isArray(db.backups)) db.backups = [];
  if (!db.settings || typeof db.settings !== 'object') {
    db.settings = {
      siteName: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
      siteNameEn: 'Pho Khun Pha Mueang Buddhist College, Phetchabun',
      motto: 'ปญฺญา โลกสฺมิ ปชฺโชโต - ปัญญาเป็นแสงสว่างในโลก',
      contactEmail: 'phetchabun@mcu.ac.th',
      contactPhone: '056-711-234',
      address: 'เลขที่ 99 หมู่ 2 ต.สะเดียง อ.เมือง จ.เพชรบูรณ์ 67000'
    };
  }

  return db;
}

export function writeDB(data: any): boolean {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    updateCacheVersion();
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
}

export function logAuditAction(
  userId: string,
  username: string,
  action: string,
  module: string,
  targetId?: string,
  details?: any,
  ip?: string
) {
  try {
    const db = readDB();
    let detailsStr = '';
    if (typeof details === 'object' && details !== null) {
      detailsStr = details.title || details.name || details.message || JSON.stringify(details);
    } else {
      detailsStr = String(details || '');
    }

    const logItem = {
      id: 'audit_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      userId: userId || 'system',
      username: username || 'system',
      action,
      module,
      targetId: targetId || null,
      details: detailsStr,
      ip: ip || '127.0.0.1'
    };
    db.audit_logs = db.audit_logs || [];
    db.audit_logs.unshift(logItem);
    if (db.audit_logs.length > 500) {
      db.audit_logs = db.audit_logs.slice(0, 500);
    }
    writeDB(db);
  } catch (e) {
    console.error('Failed to log audit action:', e);
  }
}
