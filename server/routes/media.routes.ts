import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter } from '../middleware/responseFormatter';

export const mediaRouter = Router();

// GET /api/media - Get all media files
mediaRouter.get('/media', (req: Request, res: Response) => {
  const db = readDB();
  let list = (db.media || []).map((item: any) => {
    const fn = item.filename || item.name || item.title || 'file';
    const ext = item.extension || path.extname(fn).replace('.', '') || 'pdf';
    let defaultMime = 'application/pdf';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext.toLowerCase())) defaultMime = `image/${ext.toLowerCase()}`;
    else if (['mp4', 'webm'].includes(ext.toLowerCase())) defaultMime = `video/${ext.toLowerCase()}`;
    else if (['mp3', 'wav'].includes(ext.toLowerCase())) defaultMime = `audio/${ext.toLowerCase()}`;

    return {
      ...item,
      id: item.id || 'media_' + Date.now(),
      filename: fn,
      name: fn,
      originalFilename: item.originalFilename || fn,
      mimeType: item.mimeType || defaultMime,
      fileType: item.fileType || item.type || (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext.toLowerCase()) ? 'image' : 'document'),
      extension: ext,
      size: item.size || item.sizeBytes || 1024 * 500,
      formattedSize: item.formattedSize || item.size || '500 KB',
      url: item.url || item.fileUrl || '',
      altText: item.altText || fn,
      description: item.description || '',
      folderId: item.folderId || null,
      tags: Array.isArray(item.tags) ? item.tags : [],
      isCompressed: item.isCompressed || false,
      compressionRatio: item.compressionRatio || 0,
      usages: Array.isArray(item.usages) ? item.usages : (Array.isArray(item.usageReferences) ? item.usageReferences : []),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    };
  });
  
  const { folderId, type, search } = req.query;

  if (folderId && folderId !== 'all') {
    if (folderId === 'root') {
      list = list.filter((f: any) => !f.folderId);
    } else {
      list = list.filter((f: any) => f.folderId === folderId);
    }
  }

  if (type && type !== 'all') {
    list = list.filter((f: any) => f.fileType === type || (f.mimeType && f.mimeType.startsWith(String(type))));
  }

  const result = applyPaginationSearchSortFilter(
    list,
    req,
    ['filename', 'originalFilename', 'altText', 'description', 'tags'],
    ['fileType', 'folderId']
  );

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// POST /api/media/upload - Upload media file
mediaRouter.post('/media/upload', (req: Request, res: Response) => {
  const db = readDB();
  db.media = db.media || [];

  const { filename, originalFilename, mimeType, size, folderId, altText, description, tags, base64Data } = req.body;

  let publicUrl = '';

  if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
    try {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const ext = path.extname(filename || 'file.png') || '.png';
        const safeName = `upload_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, buffer);
        publicUrl = `/uploads/${safeName}`;
      }
    } catch (err) {
      console.error('Error saving uploaded base64 file:', err);
    }
  }

  if (!publicUrl) {
    publicUrl = req.body.url || `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800`;
  }

  const fileType = mimeType?.startsWith('image/') ? 'image' 
    : mimeType?.includes('pdf') || mimeType?.includes('document') || mimeType?.includes('word') ? 'document'
    : mimeType?.startsWith('video/') ? 'video'
    : mimeType?.startsWith('audio/') ? 'audio'
    : 'document';

  const newFile = {
    id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    filename: filename || originalFilename || 'file',
    originalFilename: originalFilename || filename || 'file',
    mimeType: mimeType || 'application/octet-stream',
    fileType,
    size: size || 1024,
    url: publicUrl,
    folderId: folderId || null,
    altText: altText || filename || '',
    description: description || '',
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.media.unshift(newFile);
  writeDB(db);

  logAuditAction('media', 'admin', 'UPLOAD_MEDIA', 'MEDIA', newFile.id, { filename: newFile.filename }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newFile
  });
});

// PUT /api/media/:id - Update media file metadata
mediaRouter.put('/media/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.media = db.media || [];
  const idx = db.media.findIndex((f: any) => f.id === req.params.id);

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบไฟล์สื่อที่ต้องการแก้ไข' }
    });
  }

  const updatedFile = {
    ...db.media[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.media[idx] = updatedFile;
  writeDB(db);

  logAuditAction('media', 'admin', 'UPDATE_MEDIA', 'MEDIA', updatedFile.id, { filename: updatedFile.filename }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: updatedFile
  });
});

// DELETE /api/media/:id - Delete media file
mediaRouter.delete('/media/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.media = db.media || [];
  const idx = db.media.findIndex((f: any) => f.id === req.params.id);

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบไฟล์สื่อที่ต้องการลบ' }
    });
  }

  const deletedFile = db.media.splice(idx, 1)[0];
  writeDB(db);

  logAuditAction('media', 'admin', 'DELETE_MEDIA', 'MEDIA', req.params.id, { filename: deletedFile.filename }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: deletedFile
  });
});

// POST /api/media/batch-delete - Batch delete
mediaRouter.post('/media/batch-delete', (req: Request, res: Response) => {
  const db = readDB();
  db.media = db.media || [];
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'BAD_REQUEST', message: 'กรุณาระบุรายการไอดีไฟล์ที่ต้องการลบ' }
    });
  }

  const idSet = new Set(ids);
  db.media = db.media.filter((f: any) => !idSet.has(f.id));
  writeDB(db);

  logAuditAction('media', 'admin', 'BATCH_DELETE_MEDIA', 'MEDIA', 'batch', { count: ids.length }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { deletedIds: ids, blockedFiles: [] }
  });
});

// POST /api/media/batch-move - Batch move files to a folder
mediaRouter.post('/media/batch-move', (req: Request, res: Response) => {
  const db = readDB();
  db.media = db.media || [];
  const { ids, folderId } = req.body;

  if (!Array.isArray(ids)) {
    return sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'BAD_REQUEST', message: 'กรุณาระบุรายการไอดีไฟล์ที่ต้องการย้าย' }
    });
  }

  const idSet = new Set(ids);
  db.media.forEach((f: any) => {
    if (idSet.has(f.id)) {
      f.folderId = folderId || null;
      f.updatedAt = new Date().toISOString();
    }
  });

  writeDB(db);
  logAuditAction('media', 'admin', 'BATCH_MOVE_MEDIA', 'MEDIA', 'batch', { count: ids.length, folderId }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { movedIds: ids }
  });
});

// ==========================================
// MEDIA FOLDERS MANAGEMENT
// ==========================================

// GET /api/media/folders - List all folders
mediaRouter.get('/media/folders', (req: Request, res: Response) => {
  const db = readDB();
  const folders = db.media_folders || [];

  sendStandardResponse(res, 200, {
    success: true,
    data: folders
  });
});

// POST /api/media/folders - Create new folder
mediaRouter.post('/media/folders', (req: Request, res: Response) => {
  const db = readDB();
  db.media_folders = db.media_folders || [];

  const { name, parentId, color } = req.body;

  if (!name || !name.trim()) {
    return sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'BAD_REQUEST', message: 'กรุณาระบุชื่อโฟลเดอร์' }
    });
  }

  const newFolder = {
    id: 'f_' + Date.now(),
    name: name.trim(),
    parentId: parentId || null,
    color: color || '#ec4899',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.media_folders.push(newFolder);
  writeDB(db);

  logAuditAction('media', 'admin', 'CREATE_MEDIA_FOLDER', 'MEDIA', newFolder.id, { name: newFolder.name }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newFolder
  });
});

// PUT /api/media/folders/:id - Update folder name/color
mediaRouter.put('/media/folders/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.media_folders = db.media_folders || [];
  const idx = db.media_folders.findIndex((f: any) => f.id === req.params.id);

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบโฟลเดอร์ที่ต้องการแก้ไข' }
    });
  }

  const { name, color } = req.body;
  if (name) db.media_folders[idx].name = name.trim();
  if (color) db.media_folders[idx].color = color;
  db.media_folders[idx].updatedAt = new Date().toISOString();

  writeDB(db);
  logAuditAction('media', 'admin', 'UPDATE_MEDIA_FOLDER', 'MEDIA', req.params.id, { name: db.media_folders[idx].name }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: db.media_folders[idx]
  });
});

// DELETE /api/media/folders/:id - Delete folder
mediaRouter.delete('/media/folders/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.media_folders = db.media_folders || [];
  const idx = db.media_folders.findIndex((f: any) => f.id === req.params.id);

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบโฟลเดอร์ที่ต้องการลบ' }
    });
  }

  const folderId = req.params.id;
  db.media_folders.splice(idx, 1);

  // Move files out to root
  if (Array.isArray(db.media)) {
    db.media.forEach((f: any) => {
      if (f.folderId === folderId) {
        f.folderId = null;
      }
    });
  }

  writeDB(db);
  logAuditAction('media', 'admin', 'DELETE_MEDIA_FOLDER', 'MEDIA', folderId, {}, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { deletedFolderId: folderId }
  });
});

// ==========================================
// MEDIA STORAGE SETTINGS
// ==========================================

// GET /api/media/settings
mediaRouter.get('/media/settings', (req: Request, res: Response) => {
  const db = readDB();
  const settings = db.media_settings || {
    provider: 'local',
    maxFileSizeMB: 20,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    autoWebPConversion: true,
    autoCompressImages: true,
    compressionQuality: 85,
    generateThumbnails: true
  };

  sendStandardResponse(res, 200, {
    success: true,
    data: settings
  });
});

// PUT /api/media/settings
mediaRouter.put('/media/settings', (req: Request, res: Response) => {
  const db = readDB();
  db.media_settings = {
    ...(db.media_settings || {}),
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);
  logAuditAction('media', 'admin', 'UPDATE_MEDIA_SETTINGS', 'MEDIA', 'settings', req.body, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: db.media_settings
  });
});
