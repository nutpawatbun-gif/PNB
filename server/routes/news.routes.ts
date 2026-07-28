import { Router, Request, Response } from 'express';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter, validatePayload } from '../middleware/responseFormatter';

export const newsRouter = Router();

// ==========================================
// 1. NEWS & ARTICLES
// ==========================================
newsRouter.get('/news', (req: Request, res: Response) => {
  const db = readDB();
  const newsList = db.news || db.posts || [];
  const result = applyPaginationSearchSortFilter(newsList, req, ['title', 'summary', 'content', 'author'], ['category', 'status', 'isPinned']);
  
  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

newsRouter.get('/news/:id', (req: Request, res: Response) => {
  const db = readDB();
  const newsList = db.news || db.posts || [];
  const item = newsList.find((n: any) => n.id === req.params.id || String(n.id) === req.params.id);

  if (!item) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NEWS_NOT_FOUND', message: 'ไม่พบรายการข่าวสารที่ระบุ' }
    });
    return;
  }

  // Increment views
  item.views = (item.views || 0) + 1;
  writeDB(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

newsRouter.post('/news', (req: Request, res: Response) => {
  const errors = validatePayload(req.body, {
    required: ['title', 'content'],
    types: { title: 'string', content: 'string' }
  });

  if (errors.length > 0) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'INVALID_PAYLOAD', message: errors[0].message, details: errors }
    });
    return;
  }

  const db = readDB();
  const newNews = {
    id: 'n_' + Date.now(),
    title: req.body.title,
    summary: req.body.summary || req.body.title,
    content: req.body.content,
    category: req.body.category || 'ข่าวประชาสัมพันธ์',
    imageUrl: req.body.imageUrl || '/assets/images/default_news.jpg',
    author: req.body.author || 'ฝ่ายประชาสัมพันธ์',
    status: req.body.status || 'published',
    isPinned: Boolean(req.body.isPinned),
    views: 0,
    publishedAt: req.body.publishedAt || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.news = db.news || [];
  db.news.unshift(newNews);
  writeDB(db);

  logAuditAction('system', 'admin', 'CREATE', 'NEWS', newNews.id, { title: newNews.title }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newNews
  });
});

newsRouter.put('/news/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.news = db.news || [];
  const idx = db.news.findIndex((n: any) => n.id === req.params.id);

  if (idx === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NEWS_NOT_FOUND', message: 'ไม่พบข่าวสารที่ต้องการแก้ไข' }
    });
    return;
  }

  const updatedItem = {
    ...db.news[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.news[idx] = updatedItem;
  writeDB(db);

  logAuditAction('system', 'admin', 'UPDATE', 'NEWS', updatedItem.id, { title: updatedItem.title }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: updatedItem
  });
});

newsRouter.delete('/news/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.news = db.news || [];
  const initialLen = db.news.length;
  db.news = db.news.filter((n: any) => n.id !== req.params.id);

  if (db.news.length === initialLen) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NEWS_NOT_FOUND', message: 'ไม่พบข่าวสารที่ต้องการลบ' }
    });
    return;
  }

  writeDB(db);
  logAuditAction('system', 'admin', 'DELETE', 'NEWS', req.params.id, null, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { id: req.params.id, message: 'ลบข่าวสารเรียบร้อยแล้ว' }
  });
});

// ==========================================
// 3. EVENTS / CALENDAR
// ==========================================
newsRouter.get('/events', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.events || [];
  const result = applyPaginationSearchSortFilter(list, req, ['title', 'description', 'location'], ['category', 'status']);

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});
