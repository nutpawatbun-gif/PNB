import { Router, Request, Response } from 'express';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter } from '../middleware/responseFormatter';

export const coursesRouter = Router();

// GET /api/courses
coursesRouter.get('/courses', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.courses || [];
  const result = applyPaginationSearchSortFilter(
    list,
    req,
    ['code', 'titleTh', 'titleEn', 'degree', 'description'],
    ['degreeLevel', 'isActive']
  );

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// GET /api/courses/:id
coursesRouter.get('/courses/:id', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.courses || [];
  const item = list.find((c: any) => c.id === req.params.id || c.code === req.params.id);

  if (!item) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลหลักสูตรที่ต้องการ' }
    });
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// POST /api/courses - Create course
coursesRouter.post('/courses', (req: Request, res: Response) => {
  const db = readDB();
  db.courses = db.courses || [];

  const newId = 'c_' + Date.now();
  const newItem = {
    id: newId,
    code: req.body.code || `COURSE-${Date.now()}`,
    titleTh: req.body.titleTh || '',
    titleEn: req.body.titleEn || '',
    degree: req.body.degree || '',
    degreeLevel: req.body.degreeLevel || 'bachelor',
    description: req.body.description || '',
    credits: Number(req.body.credits) || 120,
    durationYears: Number(req.body.durationYears) || 4,
    tuitionFeePerSemester: Number(req.body.tuitionFeePerSemester) || 0,
    careerPaths: req.body.careerPaths || [],
    curriculumFileUrl: req.body.curriculumFileUrl || '',
    coverImageUrl: req.body.coverImageUrl || '',
    isActive: req.body.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.courses.push(newItem);
  writeDB(db);

  logAuditAction('courses', 'admin', 'CREATE_COURSE', 'COURSES', newItem.id, { title: newItem.titleTh }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newItem
  });
});

// PUT /api/courses/:id - Update course
coursesRouter.put('/courses/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.courses = db.courses || [];
  const idx = db.courses.findIndex((c: any) => c.id === req.params.id);

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลหลักสูตรที่ต้องการแก้ไข' }
    });
  }

  const updatedItem = {
    ...db.courses[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.courses[idx] = updatedItem;
  writeDB(db);

  logAuditAction('courses', 'admin', 'UPDATE_COURSE', 'COURSES', updatedItem.id, { title: updatedItem.titleTh }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: updatedItem
  });
});

// DELETE /api/courses/:id - Delete course
coursesRouter.delete('/courses/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.courses = db.courses || [];
  const idx = db.courses.findIndex((c: any) => c.id === req.params.id);

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลหลักสูตรที่ต้องการลบ' }
    });
  }

  const deletedItem = db.courses.splice(idx, 1)[0];
  writeDB(db);

  logAuditAction('courses', 'admin', 'DELETE_COURSE', 'COURSES', req.params.id, { title: deletedItem.titleTh }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: deletedItem
  });
});
