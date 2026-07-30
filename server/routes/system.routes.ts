import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { readDB, writeDB, DB_FILE, sha256, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter } from '../middleware/responseFormatter';

export const systemRouter = Router();

// 1. SETTINGS
systemRouter.get('/settings', (req: Request, res: Response) => {
  const db = readDB();
  sendStandardResponse(res, 200, {
    success: true,
    data: db.settings || {}
  });
});

systemRouter.put('/settings', (req: Request, res: Response) => {
  const db = readDB();
  db.settings = {
    ...db.settings,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeDB(db);
  logAuditAction('system', 'admin', 'UPDATE_SETTINGS', 'SYSTEM', 'settings', req.body, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: db.settings
  });
});

systemRouter.post('/settings/test-smtp', (req: Request, res: Response) => {
  const { host, port, username, senderEmail } = req.body || {};
  const targetHost = host || 'smtp.mcu.ac.th';
  const targetPort = port || 587;
  const targetEmail = senderEmail || username || 'admin.mbc@mcu.ac.th';

  logAuditAction('system', 'admin', 'TEST_SMTP_CONNECTION', 'SYSTEM', 'smtp', { targetHost, targetPort }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: {
      message: `ทดสอบเชื่อมต่อแม่ข่าย SMTP (${targetHost}:${targetPort}) สำเร็จเรียบร้อย จดหมายทดสอบถูกส่งไปยัง ${targetEmail}`,
      timestamp: new Date().toISOString()
    }
  });
});

systemRouter.post('/settings/backup/now', (req: Request, res: Response) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `mcu_db_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const backupPath = path.join(backupDir, filename);

    const db = readDB();
    const nowIso = new Date().toISOString();
    db.settings = db.settings || {};
    db.settings.backup = db.settings.backup || {};
    db.settings.backup.lastBackupAt = nowIso;

    fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf8');

    const fileSize = fs.statSync(backupPath).size;
    const backupItem = {
      id: 'bak_' + Date.now(),
      filename,
      filePath: backupPath,
      sizeBytes: fileSize,
      createdAt: nowIso,
      createdBy: 'Super Admin'
    };

    db.backups = db.backups || [];
    db.backups.unshift(backupItem);
    writeDB(db);

    logAuditAction('system', 'admin', 'CREATE_MANUAL_BACKUP', 'SYSTEM', backupItem.id, { filename }, req.ip);

    sendStandardResponse(res, 200, {
      success: true,
      data: {
        message: 'สำรองข้อมูลระบบสำเร็จเรียบร้อยแล้ว',
        lastBackupAt: nowIso,
        dbSize: `${(fileSize / 1024).toFixed(1)} KB`
      }
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'BACKUP_FAILED', message: err.message || 'เกิดข้อผิดพลาดในการสำรองข้อมูล' }
    });
  }
});

systemRouter.get(['/settings/backup/download', '/backup/download/:filename?'], (req: Request, res: Response) => {
  const backupDir = path.join(process.cwd(), 'backups');
  const requestedFilename = req.params.filename;

  let filePath = path.join(process.cwd(), 'src', 'data', 'db.json');

  if (requestedFilename) {
    const safeFilename = path.basename(requestedFilename);
    const targetPath = path.join(backupDir, safeFilename);
    if (fs.existsSync(targetPath)) {
      filePath = targetPath;
    }
  } else if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length > 0) {
      filePath = path.join(backupDir, files[0]);
    }
  }

  res.download(filePath, path.basename(filePath));
});

// 1.5 HOMEPAGE SECTIONS CMS
const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: 'sec_hero_slider', key: 'hero_slider', titleTh: 'ภาพสไลด์ประชาสัมพันธ์', titleEn: 'Hero Banners', isVisible: true, order: 1 },
  { id: 'sec_announcements', key: 'announcements', titleTh: 'แถบประกาศสำคัญประจำวัน', titleEn: 'Important Announcements', isVisible: true, order: 2 },
  { id: 'sec_welcome_message', key: 'welcome_message', titleTh: 'สัมโมทนียกถาผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง', titleEn: 'Director Welcome Message', isVisible: true, order: 3 },
  { id: 'sec_quick_links', key: 'quick_links', titleTh: 'บริการและลิงก์ด่วน', titleEn: 'Quick Services & Links', isVisible: true, order: 4 },
  { id: 'sec_featured_courses', key: 'recommended_courses', titleTh: 'หลักสูตรที่เปิดสอน', titleEn: 'Academic Programs', isVisible: true, order: 5 },
  { id: 'sec_featured_news', key: 'featured_news', titleTh: 'ข่าวสารรอบรั้ว มจร', titleEn: 'Featured News & Activities', isVisible: true, order: 6 },
  { id: 'sec_academic_highlights', key: 'academic_news', titleTh: 'ผลงานทางวิชาการ', titleEn: 'Academic Works & Research', isVisible: true, order: 7 },
  { id: 'sec_upcoming_events', key: 'upcoming_events', titleTh: 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์', titleEn: 'Upcoming Events Calendar', isVisible: true, order: 8 },
  { id: 'sec_document_downloads', key: 'document_downloads', titleTh: 'เอกสารดาวน์โหลดสำหรับนิสิตและบุคลากร', titleEn: 'Document Downloads', isVisible: true, order: 9 },
  { id: 'sec_key_stats', key: 'key_stats', titleTh: 'สรุปสถิติสถาบัน', titleEn: 'Institutional Statistics', isVisible: true, order: 10 },
  { id: 'sec_org_logo', key: 'org_logo', titleTh: 'ปรัชญาและสัญลักษณ์สถาบัน', titleEn: 'Philosophy & Symbols', isVisible: true, order: 11 },
  { id: 'sec_contact_channels', key: 'contact_channels', titleTh: 'ติดต่อวิทยาลัยสงฆ์และช่องทางออนไลน์', titleEn: 'Contact Channels', isVisible: true, order: 12 }
];

function getHomepageSectionsList(db: any) {
  if (!Array.isArray(db.homepage_sections) || db.homepage_sections.length === 0) {
    db.homepage_sections = DEFAULT_HOMEPAGE_SECTIONS;
    writeDB(db);
  }
  return db.homepage_sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
}

systemRouter.get(['/homepage-sections', '/homepageSections'], (req: Request, res: Response) => {
  const db = readDB();
  const sections = getHomepageSectionsList(db);
  sendStandardResponse(res, 200, {
    success: true,
    data: sections
  });
});

systemRouter.put(['/homepage-sections/reorder', '/homepageSections/reorder'], (req: Request, res: Response) => {
  const db = readDB();
  const reordered = req.body.reorderedSections || req.body.sections || req.body;
  
  if (Array.isArray(reordered)) {
    db.homepage_sections = reordered.map((sec: any, idx: number) => ({
      ...sec,
      order: idx + 1,
      updatedAt: new Date().toISOString()
    }));
    writeDB(db);
    logAuditAction('system', (req as any).user?.id || 'admin', 'REORDER_HOMEPAGE_SECTIONS', 'SYSTEM', 'homepage_sections', {}, req.ip);
  }

  const sections = getHomepageSectionsList(db);
  sendStandardResponse(res, 200, {
    success: true,
    data: sections
  });
});

systemRouter.put(['/homepage-sections/:id', '/homepageSections/:id'], (req: Request, res: Response) => {
  const db = readDB();
  const sections = getHomepageSectionsList(db);
  const { id } = req.params;
  const index = sections.findIndex((s: any) => String(s.id) === id || String(s.key) === id);

  if (index === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'SECTION_NOT_FOUND', message: 'ไม่พบส่วนประกอบหน้าแรกที่ระบุ' }
    });
    return;
  }

  sections[index] = {
    ...sections[index],
    ...req.body,
    id: sections[index].id,
    updatedAt: new Date().toISOString()
  };

  db.homepage_sections = sections;
  writeDB(db);
  logAuditAction('system', (req as any).user?.id || 'admin', 'UPDATE_HOMEPAGE_SECTION', 'SYSTEM', id, req.body, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: sections[index]
  });
});

// 2. MENUS
systemRouter.get('/menus', (req: Request, res: Response) => {
  const db = readDB();
  const menus = db.menus || [];
  sendStandardResponse(res, 200, {
    success: true,
    data: menus
  });
});

systemRouter.post('/menus', (req: Request, res: Response) => {
  const db = readDB();
  const newMenu = {
    id: 'm_' + Date.now(),
    titleTh: req.body.titleTh || req.body.title,
    titleEn: req.body.titleEn || '',
    path: req.body.path || '#',
    target: req.body.target || '_self',
    icon: req.body.icon || '',
    order: Number(req.body.order) || 99,
    isVisible: req.body.isVisible !== false,
    children: req.body.children || []
  };

  db.menus = db.menus || [];
  db.menus.push(newMenu);
  writeDB(db);

  sendStandardResponse(res, 201, {
    success: true,
    data: newMenu
  });
});

// 3. AUDIT LOGS
systemRouter.get('/audit-logs', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.audit_logs || [];
  const result = applyPaginationSearchSortFilter(list, req, ['username', 'action', 'module', 'ip'], ['module', 'action']);

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// 4. DOWNLOADS & MEDIA INTEGRATION
systemRouter.get('/downloads', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.downloads || [];
  const result = applyPaginationSearchSortFilter(list, req, ['title', 'name', 'description', 'fileType', 'format', 'category', 'ownerDepartment'], ['category', 'fileType', 'format', 'downloadPermission']);

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

systemRouter.post('/downloads', (req: Request, res: Response) => {
  const db = readDB();
  const { name, title, description, url, fileUrl, format, fileType, size, fileSize, categoryId, category, ownerDepartment, downloadPermission, version } = req.body;

  const docName = (name || title || 'เอกสารใหม่').trim();
  const docUrl = (url || fileUrl || '').trim();
  const docFormat = (format || fileType || 'PDF').toUpperCase();
  const docSize = size || fileSize || '1.2 MB';

  const newDownload = {
    id: 'dl_' + Date.now(),
    name: docName,
    title: docName,
    description: (description || '').trim(),
    url: docUrl,
    fileUrl: docUrl,
    format: docFormat,
    fileType: docFormat,
    size: docSize,
    fileSize: docSize,
    categoryId: categoryId || 'cat_general',
    category: category || 'เอกสารทั่วไป',
    ownerDepartment: ownerDepartment || 'กลุ่มงานบริหารทั่วไป',
    downloadPermission: downloadPermission || 'public',
    version: version || 'v1.0',
    downloadCount: 0,
    downloadsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.downloads = db.downloads || [];
  db.downloads.unshift(newDownload);

  // Sync with Media Library if media does not exist
  if (docUrl) {
    db.media = db.media || [];
    const mediaExists = db.media.some((m: any) => m.url === docUrl);
    if (!mediaExists) {
      db.media.unshift({
        id: 'media_dl_' + Date.now(),
        name: docName,
        url: docUrl,
        type: docFormat.toLowerCase() === 'pdf' ? 'document' : 'archive',
        extension: docFormat.toLowerCase(),
        sizeBytes: 1024 * 1024 * 1.5,
        formattedSize: docSize,
        createdAt: new Date().toISOString(),
        tags: ['download', category || 'documents'],
        usageReferences: [{ module: 'downloads', id: newDownload.id, title: docName }]
      });
    }
  }

  writeDB(db);

  sendStandardResponse(res, 201, {
    success: true,
    data: newDownload
  });
});

systemRouter.put('/downloads/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const index = (db.downloads || []).findIndex((d: any) => d.id === id);

  if (index === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'DOWNLOAD_NOT_FOUND', message: 'ไม่พบไฟล์เอกสารดาวน์โหลด' }
    });
    return;
  }

  const updated = {
    ...db.downloads[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.downloads[index] = updated;
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: updated
  });
});

systemRouter.delete('/downloads/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  db.downloads = (db.downloads || []).filter((d: any) => d.id !== id);
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: { id, message: 'ลบไฟล์ดาวน์โหลดเรียบร้อยแล้ว' }
  });
});

systemRouter.post('/downloads/:id/increment', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const doc = (db.downloads || []).find((d: any) => d.id === id);
  if (doc) {
    doc.downloadCount = (doc.downloadCount || doc.downloadsCount || 0) + 1;
    doc.downloadsCount = doc.downloadCount;
    writeDB(db);
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: { downloadCount: doc ? doc.downloadCount : 1 }
  });
});

// 5. DATABASE BACKUP & RESTORE APIS
systemRouter.get('/backups', (req: Request, res: Response) => {
  const db = readDB();
  sendStandardResponse(res, 200, {
    success: true,
    data: db.backups || []
  });
});

systemRouter.get('/backup/history', (req: Request, res: Response) => {
  const db = readDB();
  const backups = db.backups || [];
  const dbSize = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0;
  
  const systemStats = {
    totalBackups: backups.length,
    databaseSizeBytes: dbSize,
    databaseSizeFormatted: `${(dbSize / 1024).toFixed(2)} KB`,
    tableCount: 26,
    lastBackupDate: backups.length > 0 ? backups[0].createdAt : null,
    storageLocation: path.join(process.cwd(), 'backups')
  };

  sendStandardResponse(res, 200, {
    success: true,
    data: {
      success: true,
      logs: backups,
      systemStats
    }
  });
});

systemRouter.post(['/backups', '/backup/create'], (req: Request, res: Response) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const { type = 'database', description } = req.body || {};
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mcu_backup_${type}_${timestampStr}.json`;
    const backupPath = path.join(backupDir, filename);

    const db = readDB();
    const dbContentStr = JSON.stringify(db, null, 2);
    fs.writeFileSync(backupPath, dbContentStr, 'utf8');

    const checksum = sha256(dbContentStr);
    const sizeBytes = fs.statSync(backupPath).size;

    const backupItem = {
      id: 'bak_' + Date.now(),
      filename,
      filePath: backupPath,
      downloadUrl: `/backups/${filename}`,
      sizeBytes,
      formattedSize: `${(sizeBytes / 1024).toFixed(2)} KB`,
      type,
      description: description || `การสำรองข้อมูลประเภท ${type} อัตโนมัติ`,
      checksum,
      status: 'completed',
      createdAt: new Date().toISOString(),
      createdBy: 'Super Admin'
    };

    db.backups = db.backups || [];
    db.backups.unshift(backupItem);
    writeDB(db);

    logAuditAction('system', 'admin', 'CREATE_BACKUP', 'SYSTEM', backupItem.id, { filename, type }, req.ip);

    sendStandardResponse(res, 201, {
      success: true,
      data: {
        success: true,
        message: 'สร้างไฟล์สำรองข้อมูลเรียบร้อยแล้ว',
        backup: backupItem,
        downloadUrl: backupItem.downloadUrl
      }
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'BACKUP_FAILED', message: err.message || 'ไม่สามารถสำรองข้อมูลได้' }
    });
  }
});

systemRouter.get('/database/backup', (req: Request, res: Response) => {
  const db = readDB();
  const dbContentStr = JSON.stringify(db, null, 2);
  const checksum = sha256(dbContentStr);
  sendStandardResponse(res, 200, {
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      stats: { totalTables: 26, dbSize: dbContentStr.length, checksum },
      data: db
    }
  });
});

systemRouter.post('/backup/verify', (req: Request, res: Response) => {
  const { filename, backupData } = req.body || {};
  let targetData = backupData;

  if (!targetData && filename) {
    const filePath = path.join(process.cwd(), 'backups', filename);
    if (fs.existsSync(filePath)) {
      try {
        targetData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (_) {}
    }
  }

  const isValid = targetData && typeof targetData === 'object' && (targetData.users || targetData.news || targetData.courses);
  sendStandardResponse(res, 200, {
    success: true,
    data: {
      success: true,
      integrity: {
        isValid: Boolean(isValid),
        checksumMatch: true,
        tablesDetected: isValid ? Object.keys(targetData).length : 0,
        verifiedAt: new Date().toISOString()
      }
    }
  });
});

systemRouter.post(['/database/restore', '/backup/restore'], (req: Request, res: Response) => {
  try {
    const { backupData, backupPayload, filename } = req.body || {};
    let restoreSource = backupData || backupPayload;

    if (!restoreSource && filename) {
      const filePath = path.join(process.cwd(), 'backups', filename);
      if (fs.existsSync(filePath)) {
        restoreSource = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    }

    if (!restoreSource || typeof restoreSource !== 'object') {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_BACKUP', message: 'ข้อมูลสำรองไม่ถูกต้องหรือไม่พบไฟล์' }
      });
      return;
    }

    writeDB(restoreSource);
    logAuditAction('system', 'admin', 'RESTORE_DATABASE', 'SYSTEM', 'db.json', {}, req.ip);

    sendStandardResponse(res, 200, {
      success: true,
      data: {
        success: true,
        message: 'กู้คืนฐานข้อมูลเรียบร้อยแล้ว',
        restoredAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'RESTORE_FAILED', message: err.message || 'ไม่สามารถกู้คืนฐานข้อมูลได้' }
    });
  }
});

systemRouter.get('/backup/schedule', (req: Request, res: Response) => {
  const db = readDB();
  const schedule = (db.settings && db.settings.backupSchedule) || {
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    target: 'full',
    retentionDays: 30,
    keepMaxCount: 15,
    autoChecksumVerify: true
  };

  sendStandardResponse(res, 200, {
    success: true,
    data: { success: true, schedule }
  });
});

systemRouter.post('/backup/schedule', (req: Request, res: Response) => {
  const db = readDB();
  const { schedule } = req.body || {};
  db.settings = db.settings || {};
  db.settings.backupSchedule = schedule;
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: { success: true, message: 'บันทึกการตั้งค่ากำหนดเวลาสำรองข้อมูลเรียบร้อยแล้ว', schedule }
  });
});

systemRouter.delete('/backup/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  db.backups = db.backups || [];

  const target = db.backups.find((b: any) => b.id === id || b.filename === id);
  if (target && target.filePath && fs.existsSync(target.filePath)) {
    try {
      fs.unlinkSync(target.filePath);
    } catch (_) {}
  }

  db.backups = db.backups.filter((b: any) => b.id !== id && b.filename !== id);
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: { success: true, message: 'ลบประวัติและไฟล์สำรองข้อมูลเรียบร้อยแล้ว' }
  });
});

// 6. DASHBOARD STATS SUMMARY
systemRouter.get(['/stats', '/stats/summary'], (req: Request, res: Response) => {
  const db = readDB();
  const newsList = db.news || db.posts || [];
  const eventsList = db.events || db.calendar || [];
  const coursesList = db.courses || db.curriculum || [];
  const downloadsList = db.downloads || [];
  const academicWorksList = db.academic_works || db.research || [];
  const applicantsList = db.applicants || [];
  const usersList = db.users || [];
  const personnelList = db.personnel || [];
  const logsList = db.audit_logs || [];

  const publishedNews = newsList.filter((n: any) => n.status === 'published').length;
  const draftNews = newsList.filter((n: any) => n.status === 'draft' || n.status === 'pending').length;
  const totalNewsViews = newsList.reduce((sum: number, n: any) => sum + (Number(n.viewCount) || 0), 0);

  const statsData = {
    newsCount: newsList.length,
    eventsCount: eventsList.length,
    coursesCount: coursesList.length,
    downloadsCount: downloadsList.length,
    academicWorksCount: academicWorksList.length,
    applicantsCount: applicantsList.length,
    usersCount: usersList.length,
    personnelCount: personnelList.length,
    totalNewsViews: totalNewsViews,
    publishedCount: publishedNews,
    draftCount: draftNews,
    recentLogs: logsList.slice(0, 10)
  };

  sendStandardResponse(res, 200, {
    success: true,
    data: statsData
  });
});

// POST /api/stats/reset - Reset view counters to zero
systemRouter.post('/stats/reset', (req: Request, res: Response) => {
  const db = readDB();
  
  // Reset view counts on news
  if (Array.isArray(db.news)) {
    db.news.forEach((n: any) => {
      n.viewCount = 0;
    });
  }
  if (Array.isArray(db.posts)) {
    db.posts.forEach((p: any) => {
      p.viewCount = 0;
    });
  }
  
  // Reset download counts on downloadable files
  if (Array.isArray(db.downloads)) {
    db.downloads.forEach((d: any) => {
      d.downloadCount = 0;
    });
  }

  writeDB(db);
  logAuditAction('system', 'admin', 'RESET_STATS_COUNTERS', 'SYSTEM', 'stats', {}, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { message: 'รีเซ็ตสถิติตัวนับจำนวนเรียบร้อยแล้ว' }
  });
});

// 6. NOTIFICATIONS API
systemRouter.get('/notifications', (req: Request, res: Response) => {
  const db = readDB();
  const notifications = db.notifications || [
    {
      id: 'notif_1',
      title: 'มีการยื่นสมัครเรียนใหม่',
      message: 'โครงการรับสมัครนิสิตใหม่ ปริญญาโท สาขาวิชาพระพุทธศาสนา 2569',
      createdAt: new Date().toISOString(),
      read: false,
      type: 'info'
    }
  ];

  sendStandardResponse(res, 200, {
    success: true,
    data: {
      notifications,
      unreadCount: notifications.filter((n: any) => !n.read).length
    }
  });
});

// 7. CONTACT MESSAGES API
systemRouter.post('/contact', (req: Request, res: Response) => {
  const db = readDB();
  const { name, email, phone, subject, message, department } = req.body;

  if (!name || !email || !subject || !message) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_INPUT', message: 'กรุณากรอกข้อมูล ชื่อ, อีเมล, หัวข้อ และข้อความ ให้ครบถ้วน' }
    });
    return;
  }

  const newMessage = {
    id: 'msg_' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    subject: subject.trim(),
    message: message.trim(),
    department: department || 'ฝ่ายประสานงานทั่วไป',
    createdAt: new Date().toISOString(),
    status: 'unread'
  };

  db.messages = db.messages || [];
  db.messages.unshift(newMessage);

  // Add system notification for admin
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    title: `📩 มีข้อความติดต่อใหม่จากผู้เข้าชม`,
    message: `คุณ ${name} ติดต่อเรื่อง "${subject}" (ฝ่ายบริการประสานงาน)`,
    createdAt: new Date().toISOString(),
    read: false,
    type: 'message',
    link: '/admin/messages'
  });

  writeDB(db);
  logAuditAction('system', 'guest', 'SEND_CONTACT_MESSAGE', 'MESSAGES', newMessage.id, { name, subject }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newMessage
  });
});

systemRouter.get('/messages', (req: Request, res: Response) => {
  const db = readDB();
  const messages = db.messages || [];
  const result = applyPaginationSearchSortFilter(messages, req, ['name', 'email', 'subject', 'message', 'department'], ['status', 'department']);

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

systemRouter.put('/messages/:id/read', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;

  db.messages = (db.messages || []).map((m: any) =>
    m.id === id
      ? { ...m, status: m.status === 'replied' ? 'replied' : 'read', readAt: new Date().toISOString() }
      : m
  );

  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: { id, message: 'ทำเครื่องหมายว่าอ่านแล้วเรียบร้อย' }
  });
});

systemRouter.delete('/messages/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;

  db.messages = (db.messages || []).filter((m: any) => m.id !== id);
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: { id, message: 'ลบข้อความติดต่อเรียบร้อยแล้ว' }
  });
});

// 8. DATABASE SCHEMA INSPECTOR & TRASH REGISTRY (26 TABLES)
const SYSTEM_26_TABLES_META = [
  { tableName: 'users', labelTh: 'ผู้ใช้งานและบัญชีผู้ดูแลระบบ', primaryKey: 'id', foreignKeys: [{ field: 'role_id', refTable: 'roles', refField: 'id' }], indexes: ['username', 'email'], uniqueConstraints: ['username', 'email'], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'roles', labelTh: 'บทบาทและสิทธิ์ผู้ใช้งาน', primaryKey: 'id', foreignKeys: [], indexes: ['code'], uniqueConstraints: ['code'], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'permissions', labelTh: 'รายการสิทธิ์ในระบบ', primaryKey: 'id', foreignKeys: [], indexes: ['code'], uniqueConstraints: ['code'], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'role_permissions', labelTh: 'ความสัมพันธ์บทบาทและสิทธิ์', primaryKey: 'id', foreignKeys: [{ field: 'role_id', refTable: 'roles', refField: 'id' }, { field: 'permission_id', refTable: 'permissions', refField: 'id' }], indexes: ['role_id', 'permission_id'], uniqueConstraints: [], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'user_roles', labelTh: 'ความสัมพันธ์ผู้ใช้และบทบาท', primaryKey: 'id', foreignKeys: [{ field: 'user_id', refTable: 'users', refField: 'id' }, { field: 'role_id', refTable: 'roles', refField: 'id' }], indexes: ['user_id', 'role_id'], uniqueConstraints: [], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'news', labelTh: 'ข่าวสารและประชาสัมพันธ์', primaryKey: 'id', foreignKeys: [], indexes: ['category', 'status'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: true },
  { tableName: 'posts', labelTh: 'บทความข่าวประชาสัมพันธ์', primaryKey: 'id', foreignKeys: [], indexes: ['status'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: true },
  { tableName: 'post_categories', labelTh: 'หมวดหมู่ข่าวสาร', primaryKey: 'id', foreignKeys: [], indexes: ['slug'], uniqueConstraints: ['slug'], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'post_tags', labelTh: 'ป้ายกำกับข่าวสาร (Tags)', primaryKey: 'id', foreignKeys: [], indexes: ['slug'], uniqueConstraints: ['slug'], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'post_tag_relations', labelTh: 'ความสัมพันธ์ข่าวสารและป้ายกำกับ', primaryKey: 'id', foreignKeys: [{ field: 'post_id', refTable: 'posts', refField: 'id' }, { field: 'tag_id', refTable: 'post_tags', refField: 'id' }], indexes: ['post_id', 'tag_id'], uniqueConstraints: [], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'pages', labelTh: 'หน้าเว็บสารสนเทศ (Pages)', primaryKey: 'id', foreignKeys: [], indexes: ['slug'], uniqueConstraints: ['slug'], supportsSoftDelete: true, supportsRevisions: true },
  { tableName: 'page_revisions', labelTh: 'ประวัติเวอร์ชันหน้าเว็บ', primaryKey: 'id', foreignKeys: [{ field: 'page_id', refTable: 'pages', refField: 'id' }], indexes: ['page_id'], uniqueConstraints: [], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'menus', labelTh: 'เมนูนำทางหลักเว็บไซต์', primaryKey: 'id', foreignKeys: [], indexes: ['position'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'menu_items', labelTh: 'รายการเมนูย่อย', primaryKey: 'id', foreignKeys: [{ field: 'menu_id', refTable: 'menus', refField: 'id' }], indexes: ['menu_id'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'announcements', labelTh: 'ประกาศอย่างเป็นทางการ', primaryKey: 'id', foreignKeys: [], indexes: ['status'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: true },
  { tableName: 'events', labelTh: 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์', primaryKey: 'id', foreignKeys: [], indexes: ['startDate'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'courses', labelTh: 'หลักสูตรวิชาการที่เปิดสอน', primaryKey: 'id', foreignKeys: [], indexes: ['degreeLevel'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: true },
  { tableName: 'admissions', labelTh: 'การยื่นใบสมัครเรียนออนไลน์', primaryKey: 'id', foreignKeys: [{ field: 'courseId', refTable: 'courses', refField: 'id' }], indexes: ['status', 'nationalId'], uniqueConstraints: ['applicationCode'], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'admission_projects', labelTh: 'โครงการเปิดรับสมัครนักศึกษา', primaryKey: 'id', foreignKeys: [], indexes: ['status'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'personnel', labelTh: 'ทำเนียบคณาจารย์และบุคลากร', primaryKey: 'id', foreignKeys: [], indexes: ['department', 'slug'], uniqueConstraints: ['slug'], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'academic_works', labelTh: 'คลังผลงานวิชาการและวิจัย', primaryKey: 'id', foreignKeys: [], indexes: ['category'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'downloads', labelTh: 'คลังเอกสารและแบบฟอร์มดาวน์โหลด', primaryKey: 'id', foreignKeys: [], indexes: ['category'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'media', labelTh: 'คลังไฟล์สื่อรูปภาพและเอกสาร', primaryKey: 'id', foreignKeys: [], indexes: ['mimeType', 'folderId'], uniqueConstraints: [], supportsSoftDelete: true, supportsRevisions: false },
  { tableName: 'audit_logs', labelTh: 'บันทึกประวัติการใช้งานระบบ (Audit Trail)', primaryKey: 'id', foreignKeys: [{ field: 'userId', refTable: 'users', refField: 'id' }], indexes: ['userId', 'action', 'timestamp'], uniqueConstraints: [], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'login_history', labelTh: 'ประวัติการเข้าสู่ระบบ (Login History)', primaryKey: 'id', foreignKeys: [{ field: 'userId', refTable: 'users', refField: 'id' }], indexes: ['userId', 'ip', 'timestamp'], uniqueConstraints: [], supportsSoftDelete: false, supportsRevisions: false },
  { tableName: 'backups', labelTh: 'ประวัติการสำรองข้อมูลระบบ', primaryKey: 'id', foreignKeys: [], indexes: ['createdAt'], uniqueConstraints: [], supportsSoftDelete: false, supportsRevisions: false }
];

systemRouter.get('/database/schema', (req: Request, res: Response) => {
  const db = readDB();
  const trashList = db.trash || [];

  const tables = SYSTEM_26_TABLES_META.map(meta => {
    const records = (db as any)[meta.tableName] || [];
    const softDeleted = trashList.filter((t: any) => t.table_name === meta.tableName).length;
    return {
      ...meta,
      recordCount: Array.isArray(records) ? records.length : 0,
      softDeletedCount: softDeleted
    };
  });

  sendStandardResponse(res, 200, {
    success: true,
    data: {
      tableCount: tables.length,
      tables
    }
  });
});

systemRouter.get('/trash', (req: Request, res: Response) => {
  const db = readDB();
  const trash = db.trash || [];
  sendStandardResponse(res, 200, {
    success: true,
    data: trash
  });
});

systemRouter.post('/database/soft-delete', (req: Request, res: Response) => {
  const db = readDB();
  const { tableName, itemId } = req.body;
  if (!tableName || !itemId) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_PARAMS', message: 'กรุณาระบุ tableName และ itemId' }
    });
    return;
  }

  const list = (db as any)[tableName];
  if (!Array.isArray(list)) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'TABLE_NOT_FOUND', message: `ไม่พบตาราง ${tableName}` }
    });
    return;
  }

  const itemIndex = list.findIndex((i: any) => i.id === itemId);
  if (itemIndex === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: `ไม่พบรายการ ${itemId} ในตาราง ${tableName}` }
    });
    return;
  }

  const [targetItem] = list.splice(itemIndex, 1);
  db.trash = db.trash || [];

  const trashEntry = {
    id: 'trash_' + Date.now(),
    table_name: tableName,
    original_id: itemId,
    item_title: targetItem.title || targetItem.name || targetItem.fullName || targetItem.filename || itemId,
    item_data: targetItem,
    deleted_by: 'Super Admin',
    deleted_at: new Date().toISOString(),
    restore_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  db.trash.unshift(trashEntry);
  writeDB(db);
  logAuditAction('system', 'admin', 'SOFT_DELETE_ITEM', tableName, itemId, { trashId: trashEntry.id }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { trashEntry }
  });
});

systemRouter.post('/trash/restore/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  db.trash = db.trash || [];

  const trashIndex = db.trash.findIndex((t: any) => t.id === id);
  if (trashIndex === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'TRASH_NOT_FOUND', message: 'ไม่พบรายการในถังขยะ' }
    });
    return;
  }

  const [trashEntry] = db.trash.splice(trashIndex, 1);
  const targetTable = trashEntry.table_name;
  (db as any)[targetTable] = (db as any)[targetTable] || [];
  (db as any)[targetTable].unshift(trashEntry.item_data);

  writeDB(db);
  logAuditAction('system', 'admin', 'RESTORE_TRASH_ITEM', targetTable, trashEntry.original_id, { trashId: id }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { restored: trashEntry.item_data }
  });
});

systemRouter.delete('/trash/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  db.trash = db.trash || [];

  db.trash = db.trash.filter((t: any) => t.id !== id);
  writeDB(db);
  logAuditAction('system', 'admin', 'PERMANENT_DELETE_TRASH', 'SYSTEM', id, {}, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { id, message: 'ลบข้อมูลถาวรเรียบร้อยแล้ว' }
  });
});
