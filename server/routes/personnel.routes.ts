import { Router, Request, Response } from 'express';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter } from '../middleware/responseFormatter';

export const personnelRouter = Router();

// GET /api/personnel - List all personnel with filtering & pagination
personnelRouter.get('/personnel', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.personnel || [];
  const result = applyPaginationSearchSortFilter(
    list,
    req,
    ['firstNameTh', 'lastNameTh', 'firstNameEn', 'lastNameEn', 'position', 'department', 'workgroup'],
    ['workgroup', 'status', 'department']
  );

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// GET /api/personnel/:id
personnelRouter.get('/personnel/:id', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.personnel || [];
  const item = list.find((p: any) => p.id === req.params.id || p.profileSlug === req.params.id || String(p.id) === String(req.params.id));

  if (!item) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลบุคลากรที่ต้องการ' }
    });
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// POST /api/personnel - Create new personnel
personnelRouter.post('/personnel', (req: Request, res: Response) => {
  const db = readDB();
  db.personnel = db.personnel || [];

  const newId = 'p_' + Date.now();
  const newItem = {
    id: newId,
    prefixTh: req.body.prefixTh || 'นาย',
    firstNameTh: req.body.firstNameTh || '',
    lastNameTh: req.body.lastNameTh || '',
    prefixEn: req.body.prefixEn || 'Mr.',
    firstNameEn: req.body.firstNameEn || '',
    lastNameEn: req.body.lastNameEn || '',
    position: req.body.position || 'อาจารย์ประจำหลักสูตร',
    academicPosition: req.body.academicPosition || 'อาจารย์',
    department: req.body.department || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
    workgroup: req.body.workgroup || 'กลุ่มงานวิชาการ',
    phone: req.body.phone || '',
    email: req.body.email || '',
    avatarUrl: req.body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    sortOrder: req.body.sortOrder || (db.personnel.length + 1),
    status: req.body.status || 'active',
    profileSlug: req.body.profileSlug || `staff-${Date.now()}`,
    expertise: req.body.expertise || [],
    educationHistory: req.body.educationHistory || [],
    academicWorks: req.body.academicWorks || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.personnel.push(newItem);
  writeDB(db);

  logAuditAction('personnel', 'admin', 'CREATE_PERSONNEL', 'PERSONNEL', newItem.id, { name: `${newItem.prefixTh}${newItem.firstNameTh} ${newItem.lastNameTh}` }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newItem
  });
});

// PUT /api/personnel/:id - Update personnel
personnelRouter.put('/personnel/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.personnel = db.personnel || [];
  const targetId = req.params.id;
  const idx = db.personnel.findIndex((p: any) => p.id === targetId || p.profileSlug === targetId || String(p.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลบุคลากรที่ต้องการแก้ไข' }
    });
  }

  const updatedItem = {
    ...db.personnel[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.personnel[idx] = updatedItem;
  writeDB(db);

  logAuditAction('personnel', 'admin', 'UPDATE_PERSONNEL', 'PERSONNEL', updatedItem.id, { name: `${updatedItem.prefixTh}${updatedItem.firstNameTh} ${updatedItem.lastNameTh}` }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: updatedItem
  });
});

// PATCH /api/personnel/:id/status - Quick status update
personnelRouter.patch('/personnel/:id/status', (req: Request, res: Response) => {
  const db = readDB();
  db.personnel = db.personnel || [];
  const targetId = req.params.id;
  const idx = db.personnel.findIndex((p: any) => p.id === targetId || p.profileSlug === targetId || String(p.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลบุคลากรที่ต้องการปรับสถานะ' }
    });
  }

  db.personnel[idx].status = req.body.status || 'active';
  db.personnel[idx].updatedAt = new Date().toISOString();
  writeDB(db);

  logAuditAction('personnel', 'admin', 'UPDATE_PERSONNEL_STATUS', 'PERSONNEL', targetId, { status: req.body.status }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: db.personnel[idx]
  });
});

// DELETE /api/personnel/:id - Delete personnel
personnelRouter.delete('/personnel/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.personnel = db.personnel || [];
  const targetId = req.params.id;
  const idx = db.personnel.findIndex((p: any) => p.id === targetId || p.profileSlug === targetId || String(p.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลบุคลากรที่ต้องการลบ' }
    });
  }

  const deletedItem = db.personnel.splice(idx, 1)[0];
  writeDB(db);

  logAuditAction('personnel', 'admin', 'DELETE_PERSONNEL', 'PERSONNEL', targetId, { name: `${deletedItem.prefixTh}${deletedItem.firstNameTh} ${deletedItem.lastNameTh}` }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: deletedItem
  });
});
