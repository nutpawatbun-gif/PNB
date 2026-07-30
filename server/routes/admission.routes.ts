import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter, validatePayload } from '../middleware/responseFormatter';

export const admissionRouter = Router();

// Ensure upload directory exists
const ADMISSION_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'admissions');
if (!fs.existsSync(ADMISSION_UPLOADS_DIR)) {
  fs.mkdirSync(ADMISSION_UPLOADS_DIR, { recursive: true });
}

// Default seed data for admission projects if empty
const DEFAULT_ADMISSION_PROJECTS = [
  {
    id: 'adm_1',
    title: 'โครงการรับสมัครนิสิตใหม่ ระดับปริญญาตรี (ภาคปกติและภาคพิเศษ) ประจำปีการศึกษา 2569',
    academicYear: '2569',
    degreeLevel: 'ปริญญาตรี',
    startDate: '2568-11-01',
    endDate: '2569-05-31',
    status: 'open',
    description: 'เปิดรับสมัครผู้สำเร็จการศึกษาระดับ ม.6 / ปธ.3 หรือเทียบเท่า เข้าศึกษาต่อสาขาวิชาพระพุทธศาสนา และสาขาวิชาการจัดการเชิงพุทธ',
    quota: 120,
    fee: 'ฟรีค่าธรรมเนียมสมัคร',
    createdAt: '2026-07-01T00:00:00.000Z'
  },
  {
    id: 'adm_2',
    title: 'โครงการรับสมัครนิสิตใหม่ ระดับปริญญาโท สาขาวิชาพระพุทธศาสนา ประจำปีการศึกษา 2569',
    academicYear: '2569',
    degreeLevel: 'ปริญญาโท',
    startDate: '2568-12-01',
    endDate: '2569-06-15',
    status: 'open',
    description: 'เปิดรับสมัครผู้สำเร็จการศึกษาระดับปริญญาตรีทุกสาขาวิชา เข้าศึกษาต่อหลักสูตรพุทธศาสตรมหาบัณฑิต',
    quota: 30,
    fee: '500 บาท',
    createdAt: '2026-07-05T00:00:00.000Z'
  }
];

// Default seed data for applicants if empty (empty for real testing)
const DEFAULT_APPLICANTS: any[] = [];

// Helper to ensure applicants sequence code
function getNextApplicantCode(db: any): string {
  db.applicantCounter = (db.applicantCounter || 69000) + 1;
  writeDB(db);
  return `MCU-69-${db.applicantCounter}`;
}

// -------------------------------------------------------------
// SPECIFIC ROUTES FIRST (Must be before dynamic /:id routes!)
// -------------------------------------------------------------

// 1. GET APPLICANTS LIST (ADMIN CMS - CENTRALIZED DATABASE)
admissionRouter.get(['/admissions/applicants', '/applicants'], (req: Request, res: Response) => {
  const db = readDB();
  let list = db.applicants || [];

  if (!Array.isArray(list)) {
    list = [];
    db.applicants = [];
    writeDB(db);
  }

  const result = applyPaginationSearchSortFilter(list, req, ['fullName', 'firstName', 'lastName', 'nationalId', 'applicationCode', 'email', 'phone', 'programTitle', 'templeName'], ['status', 'programId', 'degreeLevel', 'personType']);

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// 2. EXPORT ALL APPLICANTS AS CSV REPORT (GET /api/admissions/export/csv)
admissionRouter.get('/admissions/export/csv', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.applicants || DEFAULT_APPLICANTS;

  const STATUS_TH: Record<string, string> = {
    pending: 'รอตรวจสอบ',
    interview: 'รอสัมภาษณ์',
    approved: 'อนุมัติผ่าน',
    rejected: 'ไม่อนุมัติ'
  };

  const headers = [
    'รหัสผู้สมัคร',
    'ประเภทผู้สมัคร',
    'คำนำหน้า',
    'ชื่อ',
    'นามสกุล',
    'ฉายาบาลี',
    'วัดที่สังกัด',
    'อำเภอวัด',
    'จังหวัดวัด',
    'เลขบัตรประชาชน/สุทธิ',
    'วันเกิด พ.ศ.',
    'เบอร์โทรศัพท์',
    'อีเมล',
    'วุฒิการศึกษาสูงสุดเดิม',
    'หลักสูตรที่สมัคร',
    'สถานะการคัดเลือก',
    'วันที่ยื่นสมัคร',
    'สำเนาบัตรประชาชน/สุทธิ',
    'สำเนาวุฒิการศึกษา',
    'รูปถ่าย',
    'สำเนาทะเบียนบ้าน',
    'เอกสารอื่นๆ (ใบเปลี่ยนชื่อ/สุทธิ)'
  ];

  const rows = list.map((a: any) => [
    `"${a.applicationCode || a.id}"`,
    `"${a.personType === 'monk' ? 'บรรพชิต' : 'คฤหัสถ์'}"`,
    `"${a.prefix || ''}"`,
    `"${a.firstName || ''}"`,
    `"${a.lastName || ''}"`,
    `"${a.ordinationName || '-'}"`,
    `"${a.templeName || '-'}"`,
    `"${a.templeDistrict || '-'}"`,
    `"${a.templeProvince || '-'}"`,
    `"${a.nationalId || ''}"`,
    `"${a.birthDate || ''}"`,
    `"${a.phone || ''}"`,
    `"${a.email || ''}"`,
    `"${a.educationalBackground || ''}"`,
    `"${a.programTitle || ''}"`,
    `"${STATUS_TH[a.status] || a.status || 'รอตรวจสอบ'}"`,
    `"${a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('th-TH') : ''}"`,
    `"${a.documents?.nationalIdCopy || ''}"`,
    `"${a.documents?.transcriptCopy || ''}"`,
    `"${a.documents?.photoCopy || ''}"`,
    `"${a.documents?.houseRegistrationCopy || ''}"`,
    `"${a.documents?.otherDocumentsCopy || ''}"`
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=applicants_report_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csvContent);
});

// 3. TRACK APPLICANT STATUS BY APPLICATION CODE, NATIONAL ID, PHONE, OR ID
admissionRouter.get('/admissions/track/:query', (req: Request, res: Response) => {
  const db = readDB();
  const list = db.applicants || DEFAULT_APPLICANTS;
  const q = req.params.query.trim().toLowerCase();

  const item = list.find((a: any) => 
    String(a.applicationCode || '').toLowerCase() === q || 
    String(a.nationalId || '').toLowerCase() === q ||
    String(a.phone || '').toLowerCase() === q ||
    String(a.id || '').toLowerCase() === q ||
    String(a.fullName || '').toLowerCase().includes(q)
  );

  if (!item) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลผู้สมัครที่ตรงกับ รหัสผู้สมัคร หรือ เลขบัตรประชาชน นี้' }
    });
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// 4. REAL DOCUMENT UPLOAD SERVICE (POST /api/upload/admission-documents)
admissionRouter.post(['/upload/admission-documents', '/admissions/upload-document'], (req: Request, res: Response) => {
  try {
    const { fileName, fileData, docType } = req.body;
    if (!fileData) {
      return sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'NO_FILE_DATA', message: 'ไม่พบข้อมูลไฟล์ที่อัปโหลด' }
      });
    }

    const ext = path.extname(fileName || 'document.pdf') || '.pdf';
    const docPrefix = docType?.includes('monk') || docType === 'nationalIdCopy' ? 'doc_monk' : 'doc_applicant';
    const uniqueFileName = `${docPrefix}_MCU69${Math.floor(1000 + Math.random() * 9000)}_${Date.now()}${ext}`;
    const filePath = path.join(ADMISSION_UPLOADS_DIR, uniqueFileName);

    if (typeof fileData === 'string' && fileData.includes('base64,')) {
      const base64Content = fileData.split('base64,')[1];
      const buffer = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, buffer);
    } else {
      fs.writeFileSync(filePath, Buffer.from(fileData));
    }

    const publicUrl = `/uploads/admissions/${uniqueFileName}`;
    sendStandardResponse(res, 200, {
      success: true,
      data: {
        fileName: uniqueFileName,
        originalName: fileName,
        fileUrl: publicUrl,
        size: fs.statSync(filePath).size
      }
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'UPLOAD_FAILED', message: 'เกิดข้อผิดพลาดในการบันทึกไฟล์: ' + err.message }
    });
  }
});

// 5. SUBMIT APPLICATION (ONLINE ADMISSION 5-STEP FORM PROCESS)
admissionRouter.post('/admissions/apply', (req: Request, res: Response) => {
  const errors = validatePayload(req.body, {
    required: ['firstName', 'lastName', 'nationalId', 'phone', 'email', 'educationalBackground', 'programId'],
    types: { firstName: 'string', lastName: 'string', nationalId: 'string', phone: 'string', email: 'string' }
  });

  if (errors.length > 0) {
    const errorMsg = errors.map(e => e.message).join(', ');
    return sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errorMsg }
    });
  }

  const db = readDB();
  db.applicants = db.applicants || [];

  const applicationCode = getNextApplicantCode(db);
  const isMonk = req.body.personType === 'monk' || req.body.personType === 'clergy';
  const prefix = req.body.prefix || (isMonk ? 'พระ' : 'นาย');
  const fullName = req.body.fullName || (isMonk
    ? `${prefix} ${req.body.firstName} ${req.body.lastName} (${req.body.templeName || ''})`
    : `${prefix} ${req.body.firstName} ${req.body.lastName}`);

  const newApplicant = {
    id: applicationCode,
    applicationCode,
    personType: isMonk ? 'monk' : 'layperson',
    prefix,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    ordinationName: req.body.ordinationName || '',
    templeName: req.body.templeName || '',
    templeDistrict: req.body.templeDistrict || '',
    templeProvince: req.body.templeProvince || '',
    fullName,
    nationalId: req.body.nationalId,
    birthDate: req.body.birthDate || '',
    phone: req.body.phone,
    email: req.body.email,
    educationalBackground: req.body.educationalBackground,
    programId: req.body.programId,
    programTitle: req.body.programTitle || 'หลักสูตรพุทธศาสตรบัณฑิต',
    degreeLevel: req.body.degreeLevel || 'ปริญญาตรี',
    documents: req.body.documents || {},
    status: 'pending', // ⏳ รอตรวจสอบ (default)
    submittedAt: new Date().toISOString()
  };

  db.applicants.unshift(newApplicant);
  writeDB(db);

  logAuditAction('system', 'guest', 'SUBMIT_APPLICATION', 'ADMISSION', newApplicant.id, { applicationCode, fullName }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: {
      applicationCode,
      applicant: newApplicant,
      message: `ยื่นใบสมัครเรียบร้อยแล้ว รหัสผู้สมัครของคุณคือ ${applicationCode}`
    }
  });
});

// 6. UPDATE APPLICANT SELECTION STATUS (รอตรวจสอบ, รอสัมภาษณ์, อนุมัติผ่าน, ไม่อนุมัติ)
admissionRouter.put(['/admissions/applicants/:id/status', '/applicants/:id/status'], (req: Request, res: Response) => {
  const db = readDB();
  db.applicants = db.applicants || [];
  const targetId = req.params.id;
  const item = db.applicants.find((a: any) => a.id === targetId || a.applicationCode === targetId || String(a.id) === String(targetId));

  if (!item) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'APPLICANT_NOT_FOUND', message: 'ไม่พบผู้สมัครที่ระบุ' }
    });
  }

  item.status = req.body.status || item.status;
  item.note = req.body.note !== undefined ? req.body.note : item.note;
  item.updatedAt = new Date().toISOString();

  writeDB(db);
  logAuditAction('system', 'admin', 'UPDATE_APPLICANT_STATUS', 'ADMISSION', item.id, { status: item.status, code: item.applicationCode }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// 7. DELETE APPLICANT RECORD
admissionRouter.delete(['/admissions/applicants/:id', '/applicants/:id'], (req: Request, res: Response) => {
  const db = readDB();
  db.applicants = db.applicants || [];
  const targetId = req.params.id;
  const idx = db.applicants.findIndex((a: any) => a.id === targetId || a.applicationCode === targetId || String(a.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลผู้สมัครที่ต้องการลบ' }
    });
  }

  const deletedApplicant = db.applicants.splice(idx, 1)[0];
  writeDB(db);

  logAuditAction('admission', 'admin', 'DELETE_APPLICANT', 'ADMISSION', targetId, { fullName: deletedApplicant.fullName }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: deletedApplicant
  });
});

// -------------------------------------------------------------
// ADMISSION PROJECTS ROUTES & DYNAMIC PARAMETER ROUTES LAST!
// -------------------------------------------------------------

// GET /api/admissions (List Projects)
admissionRouter.get(['/admissions', '/admission-projects'], (req: Request, res: Response) => {
  const db = readDB();
  let list = db.admissions || db.admission_projects || [];

  if (!Array.isArray(list) || list.length === 0) {
    list = DEFAULT_ADMISSION_PROJECTS;
    db.admissions = DEFAULT_ADMISSION_PROJECTS;
    writeDB(db);
  }

  const result = applyPaginationSearchSortFilter(list, req, ['title', 'description', 'academicYear'], ['degreeLevel', 'status']);

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// POST /api/admissions (Create Project)
admissionRouter.post(['/admissions', '/admission-projects'], (req: Request, res: Response) => {
  const db = readDB();
  db.admissions = db.admissions || [];

  const newProject = {
    id: 'adm_' + Date.now(),
    title: req.body.title || 'โครงการรับสมัครใหม่',
    academicYear: req.body.academicYear || '2569',
    degreeLevel: req.body.degreeLevel || 'ปริญญาตรี',
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || '',
    status: req.body.status || 'open',
    description: req.body.description || '',
    quota: Number(req.body.quota) || 50,
    fee: req.body.fee || 'ฟรีค่าธรรมเนียม',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.admissions.unshift(newProject);
  writeDB(db);

  logAuditAction('admission', 'admin', 'CREATE_ADMISSION_PROJECT', 'ADMISSION', newProject.id, { title: newProject.title }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newProject
  });
});

// GET /api/admissions/:id (Get Project by ID) - MUST BE AT THE BOTTOM!
admissionRouter.get(['/admissions/:id', '/admission-projects/:id'], (req: Request, res: Response) => {
  const db = readDB();
  const list = db.admissions || db.admission_projects || DEFAULT_ADMISSION_PROJECTS;
  const item = list.find((a: any) => a.id === req.params.id || String(a.id) === String(req.params.id));

  if (!item) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'ADMISSION_NOT_FOUND', message: 'ไม่พบข้อมูลโครงการรับสมัคร' }
    });
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// PUT /api/admissions/:id (Update Project by ID)
admissionRouter.put(['/admissions/:id', '/admission-projects/:id'], (req: Request, res: Response) => {
  const db = readDB();
  db.admissions = db.admissions || [];
  const targetId = req.params.id;
  const idx = db.admissions.findIndex((a: any) => a.id === targetId || String(a.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลโครงการที่ต้องการแก้ไข' }
    });
  }

  const updatedProject = {
    ...db.admissions[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.admissions[idx] = updatedProject;
  writeDB(db);

  logAuditAction('admission', 'admin', 'UPDATE_ADMISSION_PROJECT', 'ADMISSION', updatedProject.id, { title: updatedProject.title }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: updatedProject
  });
});

// DELETE /api/admissions/:id (Delete Project by ID)
admissionRouter.delete(['/admissions/:id', '/admission-projects/:id'], (req: Request, res: Response) => {
  const db = readDB();
  db.admissions = db.admissions || [];
  const targetId = req.params.id;
  const idx = db.admissions.findIndex((a: any) => a.id === targetId || String(a.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลโครงการที่ต้องการลบ' }
    });
  }

  const deletedItem = db.admissions.splice(idx, 1)[0];
  writeDB(db);

  logAuditAction('admission', 'admin', 'DELETE_ADMISSION_PROJECT', 'ADMISSION', targetId, { title: deletedItem.title }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: deletedItem
  });
});
