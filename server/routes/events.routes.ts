import { Router, Request, Response } from 'express';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, validatePayload } from '../middleware/responseFormatter';

export const eventsRouter = Router();

const DEFAULT_EVENTS = [
  {
    id: 'evt_1',
    title: 'โครงการอบรมปฏิบัติธรรมและสัมมนาพระไตรปิฎก ประจำปี 2569',
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    startTime: '08:30',
    endTime: '16:30',
    isAllDay: false,
    isMultiDay: true,
    recurrence: 'none',
    location: 'อาคารธรรมศาลา วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
    organizer: 'สำนักวิชาการ วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    details: 'การอบรมปฏิบัติธรรมเข้มข้น ร่วมกับการสัมมนาวิชาการพระไตรปิฎกวิเคราะห์ เพื่อเสริมสร้างสมรรถภาพทางจิตและปัญญาแก่คณาจารย์ นิสิต และพุทธศาสนิกชน',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
    registrationUrl: '/admission/apply',
    onlineLink: 'https://zoom.us/j/9876543210',
    meetingPlatform: 'zoom',
    category: 'academic',
    categoryLabel: 'วิชาการ / สัมมนา',
    color: '#2563eb',
    reminderMinutes: 60,
    attachments: [
      { id: 'att_1', name: 'กำหนดการโครงการปฏิบัติธรรม2569.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    date: '15-17',
    month: 'ส.ค.',
    year: '2569',
    time: '08:30 น. - 16:30 น.'
  },
  {
    id: 'evt_2',
    title: 'พิธีไหว้ครูและมอบทุนการศึกษา ประจำปีการศึกษา 2569',
    startDate: '2026-09-05',
    endDate: '2026-09-05',
    startTime: '09:00',
    endTime: '12:00',
    isAllDay: false,
    isMultiDay: false,
    recurrence: 'none',
    location: 'หอประชุมใหญ่ วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    organizer: 'ฝ่ายกิจการนิสิต',
    details: 'พิธีแสดงความกตัญญูกตเวทิตาต่อครูอาจารย์ พร้อมการมอบทุนการศึกษาแก่นิสิตผู้มีผลการเรียนดีเด่นและขาดแคลนทุนทรัพย์',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    category: 'ceremony',
    categoryLabel: 'พิธีการ / รัฐพิธี',
    color: '#9333ea',
    date: '05',
    month: 'ก.ย.',
    year: '2569',
    time: '09:00 น. - 12:00 น.'
  }
];

// Helper to ensure events in DB
function getEventsList(db: any) {
  if (!Array.isArray(db.events) || db.events.length === 0) {
    db.events = DEFAULT_EVENTS;
    writeDB(db);
  }
  return db.events;
}

// 1. GET ALL EVENTS
eventsRouter.get('/events', (req: Request, res: Response) => {
  const db = readDB();
  const events = getEventsList(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: events,
    meta: { total: events.length }
  });
});

// 2. GET EVENT BY ID
eventsRouter.get('/events/:id', (req: Request, res: Response) => {
  const db = readDB();
  const events = getEventsList(db);
  const item = events.find((e: any) => String(e.id) === req.params.id);

  if (!item) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'EVENT_NOT_FOUND', message: 'ไม่พบรายการกิจกรรมในปฏิทิน' }
    });
    return;
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// 3. POST CREATE EVENT
eventsRouter.post('/events', (req: Request, res: Response) => {
  const errors = validatePayload(req.body, {
    required: ['title', 'startDate'],
    types: { title: 'string', startDate: 'string' }
  });

  if (errors.length > 0) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors.join(', ') }
    });
    return;
  }

  const db = readDB();
  const events = getEventsList(db);

  const newId = 'evt_' + Date.now();
  const newEvent = {
    id: newId,
    title: req.body.title,
    startDate: req.body.startDate,
    endDate: req.body.endDate || req.body.startDate,
    startTime: req.body.startTime || '09:00',
    endTime: req.body.endTime || '12:00',
    isAllDay: req.body.isAllDay || false,
    isMultiDay: req.body.isMultiDay || false,
    recurrence: req.body.recurrence || 'none',
    location: req.body.location || '',
    organizer: req.body.organizer || '',
    details: req.body.details || '',
    imageUrl: req.body.imageUrl || '',
    registrationUrl: req.body.registrationUrl || '',
    onlineLink: req.body.onlineLink || '',
    meetingPlatform: req.body.meetingPlatform || 'zoom',
    category: req.body.category || 'academic',
    categoryLabel: req.body.categoryLabel || 'กิจกรรมทั่วไป',
    color: req.body.color || '#2563eb',
    reminderMinutes: req.body.reminderMinutes ?? 60,
    attachments: req.body.attachments || [],
    date: req.body.date || req.body.startDate.split('-')[2] || '01',
    month: req.body.month || 'ม.ค.',
    year: req.body.year || '2569',
    time: req.body.time || '09:00 น. - 12:00 น.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  events.unshift(newEvent);
  db.events = events;
  writeDB(db);

  logAuditAction('CREATE_EVENT', `สร้างกิจกรรมปฏิทินใหม่: ${newEvent.title}`, (req as any).user?.id || 'admin', req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newEvent
  });
});

// 4. PUT UPDATE EVENT
eventsRouter.put('/events/:id', (req: Request, res: Response) => {
  const db = readDB();
  const events = getEventsList(db);
  const index = events.findIndex((e: any) => String(e.id) === req.params.id);

  if (index === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'EVENT_NOT_FOUND', message: 'ไม่พบรายการกิจกรรมที่ต้องการแก้ไข' }
    });
    return;
  }

  events[index] = {
    ...events[index],
    ...req.body,
    id: events[index].id,
    updatedAt: new Date().toISOString()
  };

  db.events = events;
  writeDB(db);

  logAuditAction('UPDATE_EVENT', `แก้ไขกิจกรรมปฏิทิน: ${events[index].title}`, (req as any).user?.id || 'admin', req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: events[index]
  });
});

// 5. DELETE EVENT
eventsRouter.delete('/events/:id', (req: Request, res: Response) => {
  const db = readDB();
  const events = getEventsList(db);
  const index = events.findIndex((e: any) => String(e.id) === req.params.id);

  if (index === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'EVENT_NOT_FOUND', message: 'ไม่พบรายการกิจกรรมที่ต้องการลบ' }
    });
    return;
  }

  const deleted = events.splice(index, 1)[0];
  db.events = events;
  writeDB(db);

  logAuditAction('DELETE_EVENT', `ลบกิจกรรมปฏิทิน: ${deleted.title}`, (req as any).user?.id || 'admin', req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { message: `ลบกิจกรรม "${deleted.title}" เรียบร้อยแล้ว` }
  });
});
