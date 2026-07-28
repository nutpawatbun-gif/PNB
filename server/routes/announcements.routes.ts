import { Router, Request, Response } from 'express';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter } from '../middleware/responseFormatter';

export const announcementsRouter = Router();

// GET /api/announcements
announcementsRouter.get('/announcements', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.announcements || [];
  const result = applyPaginationSearchSortFilter(
    list,
    req,
    ['title', 'titleEn', 'announcementNo', 'publisher', 'excerpt', 'content'],
    ['category', 'status', 'yearTh']
  );

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// GET /api/announcements/:id
announcementsRouter.get('/announcements/:id', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.announcements || [];
  const item = list.find((a: any) => String(a.id) === String(req.params.id));

  if (!item) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศที่ต้องการ' }
    });
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// POST /api/announcements - Create announcement
announcementsRouter.post('/announcements', (req: Request, res: Response) => {
  const db = readDB();
  db.announcements = db.announcements || [];

  const newId = 'anc_' + Date.now();
  const newItem = {
    id: newId,
    title: req.body.title || '',
    titleEn: req.body.titleEn || '',
    category: req.body.category || 'general',
    categoryLabel: req.body.categoryLabel || 'ประกาศทั่วไป',
    announcementNo: req.body.announcementNo || '',
    publisher: req.body.publisher || 'งานสารบรรณและวิทยาลัย',
    isPinned: Boolean(req.body.isPinned),
    isUrgent: Boolean(req.body.isUrgent),
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || '',
    yearTh: req.body.yearTh || '2569',
    excerpt: req.body.excerpt || req.body.title || '',
    content: req.body.content || '',
    attachments: req.body.attachments || [],
    allowDownload: req.body.allowDownload !== false,
    totalDownloads: 0,
    viewCount: 0,
    status: req.body.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.announcements.unshift(newItem);
  writeDB(db);

  logAuditAction('announcements', 'admin', 'CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', newItem.id, { title: newItem.title }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newItem
  });
});

// PUT /api/announcements/:id - Update announcement
announcementsRouter.put('/announcements/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.announcements = db.announcements || [];
  const isMatch = (a: any, targetId: string) => {
    const idA = String(a.id || '').trim();
    const idB = String(targetId || '').trim();
    if (idA === idB) return true;
    const cleanA = idA.replace(/^(anc_|ann_)/, '');
    const cleanB = idB.replace(/^(anc_|ann_)/, '');
    return cleanA === cleanB;
  };

  const idx = db.announcements.findIndex((a: any) => isMatch(a, req.params.id));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศที่ต้องการแก้ไข' }
    });
  }

  const updatedItem = {
    ...db.announcements[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.announcements[idx] = updatedItem;
  writeDB(db);

  logAuditAction('announcements', 'admin', 'UPDATE_ANNOUNCEMENT', 'ANNOUNCEMENT', updatedItem.id, { title: updatedItem.title }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: updatedItem
  });
});

// PATCH /api/announcements/:id/pin - Toggle Pin Status
announcementsRouter.patch('/announcements/:id/pin', (req: Request, res: Response) => {
  const db = readDB();
  db.announcements = db.announcements || [];

  const isMatch = (a: any, targetId: string) => {
    const idA = String(a.id || '').trim();
    const idB = String(targetId || '').trim();
    if (idA === idB) return true;
    const cleanA = idA.replace(/^(anc_|ann_)/, '');
    const cleanB = idB.replace(/^(anc_|ann_)/, '');
    return cleanA === cleanB;
  };

  const idx = db.announcements.findIndex((a: any) => isMatch(a, req.params.id));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศที่ต้องการปักหมุด' }
    });
  }

  db.announcements[idx].isPinned = !db.announcements[idx].isPinned;
  db.announcements[idx].updatedAt = new Date().toISOString();
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: db.announcements[idx]
  });
});

// DELETE /api/announcements/:id - Delete announcement
announcementsRouter.delete('/announcements/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.announcements = db.announcements || [];
  const initialLength = db.announcements.length;
  
  const isMatch = (a: any, targetId: string) => {
    const idA = String(a.id || '').trim();
    const idB = String(targetId || '').trim();
    if (idA === idB) return true;
    const cleanA = idA.replace(/^(anc_|ann_)/, '');
    const cleanB = idB.replace(/^(anc_|ann_)/, '');
    return cleanA === cleanB;
  };

  const targetItem = db.announcements.find((a: any) => isMatch(a, req.params.id));
  db.announcements = db.announcements.filter((a: any) => !isMatch(a, req.params.id));

  if (db.announcements.length === initialLength) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศที่ต้องการลบ' }
    });
  }

  writeDB(db);

  logAuditAction('announcements', 'admin', 'DELETE_ANNOUNCEMENT', 'ANNOUNCEMENT', req.params.id, { deleted: true }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { success: true, deletedId: req.params.id, deletedItem: targetItem }
  });
});
