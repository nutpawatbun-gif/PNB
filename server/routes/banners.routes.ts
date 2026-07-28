import { Router, Request, Response } from 'express';
import { readDB, writeDB, logAuditAction } from '../services/db.service';
import { sendStandardResponse, validatePayload } from '../middleware/responseFormatter';

export const bannersRouter = Router();

const DEFAULT_BANNERS = [
  {
    id: 'banner_1',
    titleTh: 'ยินดีต้อนรับสู่วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
    titleEn: 'Welcome to Phokhun Phamuang Buddhist College, Phetchabun',
    subTh: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    subEn: 'Mahachulalongkornrajavidyalaya University',
    descTh: 'สถาบันอุดมศึกษาพระพุทธศาสนาชั้นนำของไทย มุ่งเน้นสร้างศาสนทายาทและพัฒนาระบบสังคมด้วยหลักพุทธธรรมและนวัตกรรมสร้างสรรค์',
    descEn: 'Thailand’s premier Buddhist university, dedicated to developing spiritual leaders and modern professionals with wisdom and ethics.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1600',
    bgClass: 'bg-mcu-pink-deep/75',
    onlyImage: false,
    linkType: 'viewDetails',
    order: 1
  },
  {
    id: 'banner_2',
    titleTh: 'เปิดรับสมัครนิสิตใหม่ ประจำปีการศึกษา 2569',
    titleEn: 'Student Admission Open for Academic Year 2026',
    subTh: 'รับสมัครทั้งบรรพชิต (พระภิกษุ-สามเณร) และคฤหัสถ์',
    subEn: 'Open for Monks, Novices, and Laypersons',
    descTh: 'เปิดรับสมัครระดับปริญญาตรี ปริญญาโท ปริญญาเอก และหลักสูตรประกาศนียบัตร พร้อมโอกาสรับทุนการศึกษาพิเศษและบริการภัตตาหารเพล',
    descEn: 'Apply now for Undergraduate, Master, Doctoral, and Certificate programs with complete scholarships and academic facilities.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600',
    bgClass: 'bg-mcu-pink-deep/80',
    onlyImage: false,
    linkType: 'applyNow',
    order: 2
  },
  {
    id: 'banner_3',
    titleTh: 'พุทธศาสตร์บูรณาการ ร่วมขับเคลื่อนศาสตร์สมัยใหม่',
    titleEn: 'Buddhist Studies Integrated with Modern Disciplines',
    subTh: 'พัฒนาจิตวิญญาณ ควบคู่การบริหารงานและสังคมคุณธรรม',
    subEn: 'Spiritual Growth Coupled with Public Administration and Social Morals',
    descTh: 'หลอมรวมหลักพุทธธรรม ปรัชญา สันติภาพ เข้ากับการรัฐประศาสนศาสตร์สมัยใหม่ เพื่อสร้างผู้นำยุคใหม่ที่มีคุณภาพทั้งทางโลกและทางธรรม',
    descEn: 'Blending classical Buddhist virtues with modern public management to cultivate mindful, ethical governance and community leaders.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600',
    bgClass: 'bg-mcu-pink-deep/75',
    onlyImage: false,
    linkType: 'viewDetails',
    order: 3
  }
];

function getBannersList(db: any) {
  if (!Array.isArray(db.banners) || db.banners.length === 0) {
    db.banners = DEFAULT_BANNERS;
    writeDB(db);
  }
  return db.banners;
}

// 1. GET ALL BANNERS
bannersRouter.get('/banners', (req: Request, res: Response) => {
  const db = readDB();
  const banners = getBannersList(db);

  sendStandardResponse(res, 200, {
    success: true,
    data: banners,
    meta: { total: banners.length }
  });
});

// 2. GET BANNER BY ID
bannersRouter.get('/banners/:id', (req: Request, res: Response) => {
  const db = readDB();
  const banners = getBannersList(db);
  const item = banners.find((b: any) => String(b.id) === req.params.id);

  if (!item) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'BANNER_NOT_FOUND', message: 'ไม่พบข้อมูลแบนเนอร์ที่ระบุ' }
    });
    return;
  }

  sendStandardResponse(res, 200, {
    success: true,
    data: item
  });
});

// 3. POST CREATE BANNER
bannersRouter.post('/banners', (req: Request, res: Response) => {
  const errors = validatePayload(req.body, {
    required: ['image'],
    types: { image: 'string' }
  });

  if (errors.length > 0) {
    sendStandardResponse(res, 400, {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors.join(', ') }
    });
    return;
  }

  const db = readDB();
  const banners = getBannersList(db);

  const newId = 'banner_' + Date.now();
  const newBanner = {
    id: newId,
    titleTh: req.body.titleTh || '',
    titleEn: req.body.titleEn || '',
    subTh: req.body.subTh || '',
    subEn: req.body.subEn || '',
    descTh: req.body.descTh || '',
    descEn: req.body.descEn || '',
    image: req.body.image,
    bgClass: req.body.bgClass || 'bg-mcu-pink-deep/75',
    onlyImage: !!req.body.onlyImage,
    linkType: req.body.linkType || 'none',
    externalUrl: req.body.externalUrl || '',
    order: banners.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  banners.push(newBanner);
  db.banners = banners;
  writeDB(db);

  logAuditAction('CREATE_BANNER', `สร้างแบนเนอร์ใหม่: ${newBanner.titleTh || newBanner.id}`, (req as any).user?.id || 'admin', req.ip);

  sendStandardResponse(res, 201, {
    success: true,
    data: newBanner
  });
});

// 4. PUT UPDATE BANNER
bannersRouter.put('/banners/:id', (req: Request, res: Response) => {
  const db = readDB();
  const banners = getBannersList(db);
  const index = banners.findIndex((b: any) => String(b.id) === req.params.id);

  if (index === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'BANNER_NOT_FOUND', message: 'ไม่พบแบนเนอร์ที่ต้องการแก้ไข' }
    });
    return;
  }

  banners[index] = {
    ...banners[index],
    ...req.body,
    id: banners[index].id,
    updatedAt: new Date().toISOString()
  };

  db.banners = banners;
  writeDB(db);

  logAuditAction('UPDATE_BANNER', `แก้ไขแบนเนอร์: ${banners[index].titleTh || banners[index].id}`, (req as any).user?.id || 'admin', req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: banners[index]
  });
});

// 5. DELETE BANNER
bannersRouter.delete('/banners/:id', (req: Request, res: Response) => {
  const db = readDB();
  const banners = getBannersList(db);
  const index = banners.findIndex((b: any) => String(b.id) === req.params.id);

  if (index === -1) {
    sendStandardResponse(res, 404, {
      success: false,
      error: { code: 'BANNER_NOT_FOUND', message: 'ไม่พบแบนเนอร์ที่ต้องการลบ' }
    });
    return;
  }

  const deleted = banners.splice(index, 1)[0];
  db.banners = banners;
  writeDB(db);

  logAuditAction('DELETE_BANNER', `ลบแบนเนอร์: ${deleted.titleTh || deleted.id}`, (req as any).user?.id || 'admin', req.ip);

  sendStandardResponse(res, 200, {
    success: true,
    data: { message: `ลบแบนเนอร์เรียบร้อยแล้ว` }
  });
});
