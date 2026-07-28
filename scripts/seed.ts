import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const DB_FILE = process.env.DB_FILE_PATH || './data/mcu_database.json';
const UPLOADS_DIR = process.env.UPLOADS_DIR || './public/uploads';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

console.log('====================================================');
console.log('MCU PKPM CMS - Production Database Seeder & Init');
console.log('====================================================');

// Ensure parent data directory exists
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`[OK] Created database directory: ${dbDir}`);
}

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`[OK] Created uploads directory: ${UPLOADS_DIR}`);
}

const envUsername = process.env.INITIAL_ADMIN_USERNAME || 'superadmin';
const envPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMeStrongPassword2026!';
const envEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin.mbc@mcu.ac.th';
const envFullName = process.env.INITIAL_ADMIN_FULLNAME || 'ผู้ดูแลระบบหลัก (Super Administrator)';

const initialSchema = {
  users: [
    {
      id: 'usr_super_admin_01',
      username: envUsername,
      passwordHash: sha256(envPassword),
      name: envFullName,
      role: 'Super Admin',
      email: envEmail,
      department: 'สำนักงานผู้ดูแลระบบสารสนเทศกลาง',
      status: 'active',
      mustChangePassword: true,
      is2FAEnabled: false,
      createdAt: new Date().toISOString()
    }
  ],
  roles: [
    {
      id: 'role_super_admin',
      name: 'Super Admin',
      description: 'ผู้ดูแลระบบสูงสุด มีสิทธิ์จัดการทุกส่วนงานและโครงสร้างระบบ',
      permissions: ['*'],
      isSystem: true
    },
    {
      id: 'role_editor',
      name: 'บรรณาธิการ (Editor)',
      description: 'สามารถจัดการข่าวประชาสัมพันธ์ กิจกรรม และอนุมัติเนื้อหาได้',
      permissions: ['manage_news', 'manage_events', 'manage_academic', 'manage_downloads'],
      isSystem: false
    },
    {
      id: 'role_author',
      name: 'ผู้เขียนข่าว (Author)',
      description: 'สามารถสร้างข่าวสารและร่างเนื้อหา รอการอนุมัติ',
      permissions: ['create_news', 'create_events'],
      isSystem: false
    }
  ],
  permissions: [
    { id: 'manage_settings', name: 'จัดการตั้งค่าระบบ', category: 'ระบบ' },
    { id: 'manage_users', name: 'จัดการผู้ใช้งานและสิทธิ์', category: 'ผู้ใช้งาน' },
    { id: 'manage_news', name: 'จัดการข่าวประชาสัมพันธ์', category: 'เนื้อหา' },
    { id: 'manage_events', name: 'จัดการปฏิทินกิจกรรม', category: 'เนื้อหา' },
    { id: 'manage_academic', name: 'จัดการผลงานวิชาการ', category: 'วิชาการ' },
    { id: 'manage_downloads', name: 'จัดการเอกสารดาวน์โหลด', category: 'เอกสาร' },
    { id: 'manage_personnel', name: 'จัดการข้อมูลบุคลากร', category: 'องค์กร' },
    { id: 'manage_media', name: 'จัดการคลังสื่อและรูปภาพ', category: 'สื่อ' }
  ],
  role_permissions: [],
  user_roles: [],
  pages: [],
  page_revisions: [],
  menus: [
    {
      id: 'main_menu',
      name: 'เมนูหลัก (Main Navigation)',
      location: 'header',
      items: [
        { id: 'm1', title: 'หน้าแรก', url: '/', icon: 'Home' },
        { id: 'm2', title: 'เกี่ยวกับสถาบัน', url: '/about', icon: 'Info' },
        { id: 'm3', title: 'หลักสูตรที่เปิดสอน', url: '/courses', icon: 'GraduationCap' },
        { id: 'm4', title: 'ข่าวสาร & กิจกรรม', url: '/news', icon: 'Newspaper' },
        { id: 'm5', title: 'การรับสมัครนิสิต', url: '/admission', icon: 'UserPlus' },
        { id: 'm6', title: 'ดาวน์โหลดเอกสาร', url: '/downloads', icon: 'Download' },
        { id: 'm7', title: 'ติดต่อเรา', url: '/contact', icon: 'PhoneCall' }
      ]
    }
  ],
  menu_items: [],
  posts: [],
  news: [],
  post_categories: [
    { id: 'cat_academic', name: 'ข่าววิชาการ', slug: 'academic', color: 'bg-blue-100 text-blue-800' },
    { id: 'cat_activity', name: 'ข่าวกิจกรรม', slug: 'activity', color: 'bg-pink-100 text-pink-800' },
    { id: 'cat_announcement', name: 'ประกาศสถาบัน', slug: 'announcement', color: 'bg-amber-100 text-amber-800' }
  ],
  post_tags: [],
  post_tag_relations: [],
  announcements: [],
  events: [],
  courses: [],
  admissions: [],
  admission_projects: [],
  personnel: [],
  academic_works: [],
  downloads: [],
  media: [],
  settings: {
    siteName: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
    siteNameEn: 'Pho Khun Pha Mueang Buddhist College, Phetchabun',
    organizationName: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    organizationNameEn: 'Mahachulalongkornrajavidyalaya University',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/MCU_Logo.svg/1200px-MCU_Logo.svg.png',
    faviconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/MCU_Logo.svg/1200px-MCU_Logo.svg.png',
    address: 'เลขที่ 111 หมู่ 2 ตำบลสระเปียก อำเภอเมือง จังหวัดเพชรบูรณ์ 67000',
    addressEn: '111 Moo 2, Sa Piak Sub-district, Mueang Phetchabun District, Phetchabun 67000',
    phone: '056-711-222, 056-711-223',
    fax: '056-711-224',
    email: 'mbc@mcu.ac.th',
    contactEmail: 'admin.mbc@mcu.ac.th',
    socialMedia: {
      facebook: 'https://facebook.com/mcuphetchabun',
      line: '@mcuphetchabun',
      youtube: 'https://youtube.com/@mcuphetchabun',
      tiktok: 'https://tiktok.com/@mcuphetchabun',
      twitterX: 'https://x.com/mcuphetchabun'
    },
    footerText: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    footerTextEn: 'Pho Khun Pha Mueang Buddhist College, MCU Phetchabun',
    footerDescription: 'ศูนย์กลางการศึกษาวิชาการพระพุทธศาสนา วิจัย และบริการวิชาการแก่สังคมในเขตพื้นที่จังหวัดเพชรบูรณ์',
    copyrightNotice: '© 2026 วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์. สงวนลิขสิทธิ์ตามกฎหมาย.',
    itemsPerPage: 10,
    dateFormat: 'DD/MM/YYYY (พ.ศ.)',
    defaultLanguage: 'th',
    timezone: 'Asia/Bangkok',
    upload: {
      maxFileSizeMB: 20,
      allowedExtensions: '.jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx, .xls, .xlsx, .zip',
      storageProvider: 'local',
      autoCompressImages: true
    }
  },
  audit_logs: [
    {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: envUsername,
      action: 'Database Initialization',
      module: 'System Management',
      details: 'Production database initialized cleanly with initial Super Admin setup.',
      ip: '127.0.0.1'
    }
  ],
  login_history: [],
  backup_logs: []
};

try {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf8');
  console.log(`[SUCCESS] Production Database initialized at: ${DB_FILE}`);
  console.log('----------------------------------------------------');
  console.log(`Super Admin Username: ${envUsername}`);
  console.log(`Super Admin Email:    ${envEmail}`);
  console.log('Password set from process.env.INITIAL_ADMIN_PASSWORD');
  console.log('Note: Super Admin must change password on first login.');
  console.log('====================================================');
} catch (err) {
  console.error('[ERROR] Failed to seed production database:', err);
  process.exit(1);
}
