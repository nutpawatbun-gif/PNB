import { Router, Request, Response } from 'express';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, applyPaginationSearchSortFilter } from '../middleware/responseFormatter';

export const academicRouter = Router();

// Default seed data for academic works if collection is empty
const DEFAULT_ACADEMIC_WORKS = [
  {
    id: 'acad_1',
    category: 'research',
    titleTh: 'การศึกษาประวัติศาสตร์พระพุทธศาสนาและวัฒนธรรมท้องถิ่นในเขตอำเภอหล่มเก่า จังหวัดเพชรบูรณ์',
    titleEn: 'A Study of Buddhist History and Local Culture in Lom Kao District, Phetchabun Province',
    authors: 'พระสุธีวชิราภรณ์, ผศ.ดร.',
    authorTh: 'พระสุธีวชิราภรณ์, ผศ.ดร.',
    coAuthors: 'ดร.อัครเดช บุณยเวช, นางสาวดวงใจ แก้วสะอาด',
    coResearchers: 'ดร.อัครเดช บุณยเวช, นางสาวดวงใจ แก้วสะอาด',
    publicationYear: '2568',
    year: '2568',
    publisherOrSource: 'ทุนวิจัยสถาบันวิจัยพุทธศาสตร์ มหาจุฬาลงกรณราชวิทยาลัย',
    fundingSource: 'ทุนวิจัยสถาบันวิจัยพุทธศาสตร์ มหาจุฬาลงกรณราชวิทยาลัย',
    abstract: 'งานวิจัยนี้มีวัตถุประสงค์เพื่อศึกษาประวัติศาสตร์ความเป็นมาของพระพุทธศาสนาและวิถีวัฒนธรรมท้องถิ่นในเขตอำเภอหล่มเก่า จังหวัดเพชรบูรณ์ เพื่อนำข้อมูลที่ได้มาสังเคราะห์และพัฒนาเป็นหลักสูตรท้องถิ่นและการท่องเที่ยวเชิงวัฒนธรรม',
    keywords: 'พระพุทธศาสนา, วัฒนธรรมไทหล่ม, เพชรบูรณ์, ท่องเที่ยวเชิงวัฒนธรรม',
    coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    fileUrl: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link',
    status: 'published',
    isPublished: true,
    createdAt: '2026-07-21T00:00:00.000Z'
  },
  {
    id: 'acad_2',
    category: 'research_article',
    titleTh: 'แนวทางการส่งเสริมจริยธรรมของเยาวชนตามหลักพุทธธรรมในศตวรรษที่ 21',
    titleEn: 'Guidelines for Promoting Youth Ethics According to Buddhist Dhamma in the 21st Century',
    authors: 'ดร.วิชัย พันธุ์คง',
    authorTh: 'ดร.วิชัย พันธุ์คง',
    coAuthors: 'พระมหาประเสริฐ สุจิตฺโต',
    publisherOrSource: 'วารสารพุทธจักร วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    journalName: 'วารสารพุทธจักร วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    publicationYear: '2568',
    year: '2568',
    abstract: 'บทความวิจัยนี้ศึกษาปัญหาเชิงพฤติกรรมจริยธรรมของเยาวชนในยุคดิจิทัล และเสนอแนะแนวทางส่งเสริมจริยธรรมตามพุทธวิธี โดยประยุกต์ใช้หลักกัลยาณมิตตาและสัปปุริสธรรม',
    keywords: 'จริยธรรมเยาวชน, พุทธธรรม, ศตวรรษที่ 21, กัลยาณมิตร',
    doi: 'https://so05.tci-thaijo.org/index.php/mcuphetchabun',
    coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    fileUrl: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link',
    status: 'published',
    isPublished: true,
    createdAt: '2026-07-20T00:00:00.000Z'
  },
  {
    id: 'acad_3',
    category: 'academic_article',
    titleTh: 'พระพุทธศาสนากับการเยียวยาจิตใจในสังคมหลังวิกฤตการณ์สุขภาพ',
    titleEn: 'Buddhism and Mental Healing in Post-Health Crisis Society',
    authors: 'พระครูสุตพัชรานุกูล',
    authorTh: 'พระครูสุตพัชรานุกูล',
    publisherOrSource: 'วารสารวิชาการมนุษยศาสตร์และสังคมศาสตร์ มหาจุฬาลงกรณราชวิทยาลัย',
    publicationYear: '2567',
    year: '2567',
    abstract: 'บทความวิชาการนี้นำเสนอการวิเคราะห์สัจธรรมทางพระพุทธศาสนาเรื่อง อริยสัจ 4 และการฝึกสติอานาปานสติในการเยียวยาฟื้นฟูสภาพจิตใจของผู้คนในสังคมที่ได้รับผลกระทบจากวิกฤต',
    keywords: 'จิตบำบัดแนวพุทธ, อริยสัจ 4, การมีสติ, สังคมยุคใหม่',
    coverImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    isPublished: true,
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'acad_4',
    category: 'book',
    titleTh: 'หลักการสืบค้นและศึกษาคัมภีร์พระไตรปิฎกฉบับภาษาไทย',
    authors: 'ผศ.ดร.ประเสริฐ แสนวิเศษ',
    authorTh: 'ผศ.ดร.ประเสริฐ แสนวิเศษ',
    coAuthors: 'พระมหาสมบูรณ์ วุฑฺฒิกโร',
    publisherOrSource: 'สำนักพิมพ์วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    publicationYear: '2567',
    year: '2567',
    abstract: 'คู่มือสำคัญสำหรับนิสิตและนักวิชาการในการสืบค้นข้อมูลเชิงพุทธศาสตร์อิงกับคัมภีร์พระไตรปิฎกฉบับสยามรัฐ ฉบับมหาจุฬาลงกรณราชวิทยาลัย',
    coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    isPublished: true,
    createdAt: '2026-07-10T00:00:00.000Z'
  }
];

// GET /api/academic-works & GET /api/academic_works
academicRouter.get(['/academic-works', '/academic_works'], (req: Request, res: Response) => {
  const db = readDB();
  let list = db.academic_works || [];
  
  if (!Array.isArray(list) || list.length === 0) {
    list = DEFAULT_ACADEMIC_WORKS;
    db.academic_works = DEFAULT_ACADEMIC_WORKS;
    writeDB(db);
  }

  const result = applyPaginationSearchSortFilter(
    list, 
    req, 
    ['titleTh', 'titleEn', 'title', 'authors', 'authorTh', 'publisherOrSource', 'abstract', 'category'], 
    ['category', 'status']
  );

  sendStandardResponse(res, 200, {
    success: true,
    data: result.items,
    meta: result.meta
  });
});

// GET /api/academic-works/:id
academicRouter.get(['/academic-works/:id', '/academic_works/:id'], (req: Request, res: Response) => {
  const db = readDB();
  const list = db.academic_works || DEFAULT_ACADEMIC_WORKS;
  const item = list.find((w: any) => w.id === req.params.id || String(w.id) === String(req.params.id));

  if (!item) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลผลงานวิชาการที่ต้องการ' }
    });
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// POST /api/academic-works & /api/academic_works
academicRouter.post(['/academic-works', '/academic_works'], (req: Request, res: Response) => {
  const db = readDB();
  db.academic_works = db.academic_works || [];

  const newId = 'acad_' + Date.now();
  const newItem = {
    id: newId,
    titleTh: req.body.titleTh || req.body.title || '',
    titleEn: req.body.titleEn || '',
    category: req.body.category || 'research',
    publicationYear: req.body.publicationYear || req.body.year || String(new Date().getFullYear() + 543),
    year: req.body.publicationYear || req.body.year || String(new Date().getFullYear() + 543),
    authors: req.body.authors || req.body.authorTh || 'คณาจารย์วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    authorTh: req.body.authors || req.body.authorTh || 'คณาจารย์วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    projectLeader: req.body.projectLeader || '',
    coResearchers: req.body.coResearchers || req.body.coAuthors || '',
    publisherOrSource: req.body.publisherOrSource || req.body.journalName || '',
    doi: req.body.doi || req.body.doiOrUrl || '',
    url: req.body.url || '',
    abstract: req.body.abstract || '',
    keywords: req.body.keywords || '',
    fileUrl: req.body.fileUrl || req.body.attachmentUrl || '',
    coverImageUrl: req.body.coverImageUrl || req.body.imageUrl || '',
    status: req.body.status || 'published',
    isPublished: req.body.status === 'published' || req.body.isPublished !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.academic_works.unshift(newItem);
  writeDB(db);

  logAuditAction('academic', 'admin', 'CREATE_ACADEMIC_WORK', 'ACADEMIC', newItem.id, { title: newItem.titleTh }, req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newItem
  });
});

// PUT /api/academic-works/:id & /api/academic_works/:id
academicRouter.put(['/academic-works/:id', '/academic_works/:id'], (req: Request, res: Response) => {
  const db = readDB();
  db.academic_works = db.academic_works || [];
  const targetId = req.params.id;
  const idx = db.academic_works.findIndex((w: any) => w.id === targetId || String(w.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลผลงานวิชาการที่ต้องการแก้ไข' }
    });
  }

  const updatedItem = {
    ...db.academic_works[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.academic_works[idx] = updatedItem;
  writeDB(db);

  logAuditAction('academic', 'admin', 'UPDATE_ACADEMIC_WORK', 'ACADEMIC', updatedItem.id, { title: updatedItem.titleTh }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: updatedItem
  });
});

// DELETE /api/academic-works/:id & /api/academic_works/:id
academicRouter.delete(['/academic-works/:id', '/academic_works/:id'], (req: Request, res: Response) => {
  const db = readDB();
  db.academic_works = db.academic_works || [];
  const targetId = req.params.id;
  const idx = db.academic_works.findIndex((w: any) => w.id === targetId || String(w.id) === String(targetId));

  if (idx === -1) {
    return sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลผลงานวิชาการที่ต้องการลบ' }
    });
  }

  const deletedItem = db.academic_works.splice(idx, 1)[0];
  writeDB(db);

  logAuditAction('academic', 'admin', 'DELETE_ACADEMIC_WORK', 'ACADEMIC', targetId, { title: deletedItem.titleTh }, req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: deletedItem
  });
});
