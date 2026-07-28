/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// AUTH & ROLE-BASED ACCESS CONTROL (RBAC) TYPES
// ============================================================================

export type RoleName = 'Super Admin' | 'Admin' | 'Editor' | 'Author' | 'Viewer';

export type Permission =
  | 'view'            // เข้าดูข้อมูลหลังบ้าน
  | 'create'          // เพิ่มข้อมูล
  | 'edit_own'        // แก้ไขข้อมูลของตนเอง
  | 'edit_all'        // แก้ไขข้อมูลของทุกคน
  | 'delete'          // ลบข้อมูล
  | 'publish'         // เผยแพร่ข้อมูล
  | 'approve'         // ตรวจสอบ / อนุมัติข้อมูล
  | 'export'          // ส่งออกข้อมูล (CSV/Excel/JSON)
  | 'manage_users'    // จัดการผู้ใช้งานและสิทธิ์
  | 'manage_settings';// ตั้งค่าระบบ, ดูประวัติ Audit Log, จัดการฐานข้อมูลและสำรองข้อมูล

export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  name: string;
  role: RoleName;
  customPermissions?: Permission[];
  permissions?: Permission[];
  email: string;
  department?: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  mustChangePassword?: boolean;
  is2FAEnabled?: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  failedLoginAttempts?: number;
  lockoutUntil?: string;
}

export interface LoginHistoryItem {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  device: string;
  status: 'success' | 'failed_password' | 'failed_captcha' | 'locked';
  location?: string;
}

export interface ActiveSession {
  id: string;
  userId: string;
  username: string;
  role: string;
  name: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  ip: string;
  userAgent: string;
  device: string;
  isCurrent?: boolean;
}

export interface CaptchaChallenge {
  captchaId: string;
  question: string;
}

export interface TwoFactorSetupData {
  secret: string;
  otpauthUrl: string;
  backupCodes: string[];
}

export interface RoleDefinition {
  name: RoleName;
  labelTh: string;
  descriptionTh: string;
  color: string;
  badgeBg: string;
  defaultPermissions: Permission[];
}

export const PERMISSION_LABELS: Record<Permission, { labelTh: string; descriptionTh: string }> = {
  view: { labelTh: 'เข้าดูข้อมูล (View)', descriptionTh: 'เข้าถึงหน้าควบคุมหลังบ้านและดูข้อมูลในระบบ' },
  create: { labelTh: 'สร้างข้อมูล (Create)', descriptionTh: 'สร้างเนื้อหา ข่าว ประกาศ หลักสูตร หรือรายการใหม่' },
  edit_own: { labelTh: 'แก้ไขของตนเอง (Edit Own)', descriptionTh: 'แก้ไขเฉพาะข้อมูลที่ตนเองเป็นผู้สร้าง' },
  edit_all: { labelTh: 'แก้ไขของทุกคน (Edit All)', descriptionTh: 'แก้ไขข้อมูลที่ผู้อื่นสร้างขึ้นได้ทั้งหมด' },
  delete: { labelTh: 'ลบข้อมูล (Delete)', descriptionTh: 'ลบรายการข้อมูลออกจากระบบ' },
  publish: { labelTh: 'เผยแพร่ (Publish)', descriptionTh: 'เผยแพร่เนื้อหาลงหน้าเว็บไซต์หลักโดยตรง' },
  approve: { labelTh: 'อนุมัติ/ตรวจสอบ (Approve)', descriptionTh: 'ตรวจสอบและอนุมัติเนื้อหาที่ส่งมาจากผู้อื่น' },
  export: { labelTh: 'ส่งออกข้อมูล (Export)', descriptionTh: 'ดาวน์โหลดรายงานหรือส่งออกข้อมูลเป็น CSV/Excel/JSON' },
  manage_users: { labelTh: 'จัดการผู้ใช้ (Manage Users)', descriptionTh: 'เพิ่ม แก้ไข ลบผู้ใช้งาน และกำหนดบทบาทสิทธิ์' },
  manage_settings: { labelTh: 'ตั้งค่าและฐานข้อมูล (Manage Settings)', descriptionTh: 'ตั้งค่าระบบ ดู Audit Logs จัดการและสำรองข้อมูล DB' }
};

export const ROLE_DEFINITIONS: Record<RoleName, RoleDefinition> = {
  'Super Admin': {
    name: 'Super Admin',
    labelTh: 'ผู้ดูแลระบบสูงสุด',
    descriptionTh: 'จัดการได้ทุกระบบ เพิ่ม แก้ไข และลบผู้ใช้งาน กำหนดสิทธิ์ ตั้งค่าระบบ ดูประวัติทั้งหมด จัดการฐานข้อมูลและการสำรองข้อมูล',
    color: 'bg-purple-600 text-white',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    defaultPermissions: ['view', 'create', 'edit_own', 'edit_all', 'delete', 'publish', 'approve', 'export', 'manage_users', 'manage_settings']
  },
  'Admin': {
    name: 'Admin',
    labelTh: 'ผู้ดูแลระบบ',
    descriptionTh: 'จัดการหน้าเว็บไซต์ จัดการเมนู จัดการเนื้อหา ข่าว ประกาศ หลักสูตร ปฏิทิน ดาวน์โหลด และจัดการผู้ใช้งานตามสิทธิ์ที่กำหนด',
    color: 'bg-blue-600 text-white',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultPermissions: ['view', 'create', 'edit_own', 'edit_all', 'delete', 'publish', 'approve', 'export', 'manage_users']
  },
  'Editor': {
    name: 'Editor',
    labelTh: 'บรรณาธิการ',
    descriptionTh: 'เพิ่มและแก้ไขเนื้อหา ส่งเนื้อหาให้ตรวจสอบ เผยแพร่ได้เฉพาะเมื่อได้รับสิทธิ์',
    color: 'bg-emerald-600 text-white',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultPermissions: ['view', 'create', 'edit_own', 'edit_all', 'approve', 'export']
  },
  'Author': {
    name: 'Author',
    labelTh: 'ผู้เขียนเนื้อหา',
    descriptionTh: 'เพิ่มข้อมูลของตนเอง แก้ไขข้อมูลของตนเอง ไม่สามารถแก้ไขข้อมูลของผู้อื่น และไม่สามารถเผยแพร่ได้โดยตรง เว้นแต่ได้รับสิทธิ์',
    color: 'bg-amber-600 text-white',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    defaultPermissions: ['view', 'create', 'edit_own']
  },
  'Viewer': {
    name: 'Viewer',
    labelTh: 'ผู้เข้าชมระบบหลังบ้าน',
    descriptionTh: 'เข้าดูข้อมูลหลังบ้านได้ ไม่สามารถเพิ่ม แก้ไข หรือลบข้อมูล',
    color: 'bg-slate-600 text-white',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    defaultPermissions: ['view']
  }
};

export type NewsStatus = 
  | 'Draft'
  | 'Pending Review'
  | 'Scheduled'
  | 'Published'
  | 'Archived'
  | 'Expired'
  | 'Hidden'
  | 'Flagged';

export interface NewsAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  format?: string;
}

export interface NewsCategory {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  color?: string;
  description?: string;
}

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
}

export interface NewsItem {
  id: string;
  title: string;
  titleEn?: string;
  slug?: string;
  category: string;
  categoryLabel: string;
  tags?: string[];
  isFeatured?: boolean;
  date: string;
  publishedAt?: string;
  scheduledAt?: string;
  expiredAt?: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  galleryUrls?: string[];
  albumTitle?: string;
  videoUrl?: string;
  attachments?: NewsAttachment[];
  attachmentUrl?: string;
  attachmentName?: string;
  authorName?: string;
  authorRole?: string;
  status: NewsStatus;
  viewCount: number;
  relatedNewsIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurriculumStructureCategory {
  categoryName: string;
  creditAmount: number;
  description?: string;
}

export interface CurriculumInstructor {
  name: string;
  title?: string;
  academicPosition?: string;
  email?: string;
  avatarUrl?: string;
}

export interface CurriculumDocument {
  name: string;
  url: string;
  format?: string;
  size?: string;
}

export interface CurriculumSEO {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface Course {
  id: string;
  code: string;
  nameTh?: string;
  nameEn?: string;
  degreeLevel?: DegreeLevel;
  major?: string;
  faculty?: string;
  description?: string;
  highlights?: string[];
  qualifications?: string[];
  structure?: CurriculumStructureCategory[];
  totalCredits?: number | string;
  tuitionFee?: string;
  duration?: string;
  careerOpportunities?: string[];
  instructors?: CurriculumInstructor[];
  documents?: CurriculumDocument[];
  applyUrl?: string;
  applyMethod?: 'internal' | 'external_form';
  status?: 'active' | 'inactive';
  coverImageUrl?: string;
  galleryUrls?: string[];
  seo?: CurriculumSEO;
  createdAt?: string;
  updatedAt?: string;

  // Backward compatibility fields
  name?: string;
  degree?: string;
  degreeEn?: string;
  studyMode?: string;
  qualification?: string[];
  estimatedFee?: string;
  careerPath?: string[];
  level?: DegreeLevel;
}

export type EventCategory = 'academic' | 'activity' | 'buddhism' | 'admission' | 'meeting' | 'ceremony' | 'other';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type OnlinePlatform = 'zoom' | 'google_meet' | 'teams' | 'other';

export interface EventAttachment {
  id?: string;
  name: string;
  url: string;
  size?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  isAllDay?: boolean;
  isMultiDay?: boolean;
  recurrence?: RecurrenceType;
  location?: string;
  organizer?: string; // ผู้รับผิดชอบ / หน่วยงานที่จัด
  details?: string;
  imageUrl?: string;
  attachments?: EventAttachment[];
  registrationUrl?: string; // ลิงก์ลงทะเบียน
  onlineLink?: string; // ลิงก์ Zoom หรือ Google Meet
  meetingPlatform?: OnlinePlatform;
  category?: EventCategory;
  categoryLabel?: string;
  color?: string; // Hex color code or Tailwind color
  reminderMinutes?: number; // 15, 30, 60, 1440
  googleCalendarUrl?: string;

  // Backward compatibility fields
  date?: string; // "15"
  month?: string; // "ก.ค."
  year?: string; // "2569"
  time?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FileFormat = 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX' | 'PPT' | 'PPTX' | 'ZIP' | 'PNG' | 'JPG' | 'JPEG' | 'WEBP' | 'SVG' | string;

export type DownloadPermission = 'public' | 'student' | 'staff' | 'executive';

export interface DocumentCategory {
  id: string;
  nameTh: string;
  nameEn: string;
  description?: string;
  iconName?: string;
  color?: string;
  sortOrder?: number;
}

export interface DownloadableFile {
  id: string;
  name: string; // ชื่อไฟล์
  description?: string; // คำอธิบาย
  categoryId?: string; // ID หมวดหมู่
  categoryName?: string; // ชื่อหมวดหมู่
  category?: 'student' | 'staff' | 'regulation' | 'handbook' | 'study_plan' | 'brochure' | string; // legacy / secondary key
  format: FileFormat; // ประเภทไฟล์ (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, รูปภาพ)
  size: string; // ขนาดไฟล์ (e.g. "1.2 MB")
  url: string; // ลิงก์ดาวน์โหลด
  version?: string; // เวอร์ชันเอกสาร e.g. "v1.0"
  ownerDepartment?: string; // หน่วยงานเจ้าของเอกสาร e.g. "สำนักวิชาการ"
  downloadPermission?: DownloadPermission; // สิทธิ์การดาวน์โหลด: public, student, staff, executive
  publishDate?: string; // วันที่เผยแพร่ YYYY-MM-DD
  expiryDate?: string; // วันหมดอายุ YYYY-MM-DD (หรือ null/empty)
  downloadCount?: number; // จำนวนดาวน์โหลด
  createdAt?: string;
  updatedAt?: string;
  replacedAt?: string; // วันที่เปลี่ยนไฟล์ล่าสุด
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SystemService {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  url: string;
  iconName: string;
}

export interface StatItem {
  id: string;
  label: string;
  labelEn: string;
  value: number;
  prefix?: string;
  suffix?: string;
  iconName: string;
}

export interface DirectorMessage {
  title: string;
  name: string;
  position: string;
  avatarUrl: string;
  messageText: string;
  fullMessageText: string[];
}

export type AcademicCategory = 
  | 'research'            // งานวิจัย
  | 'research_article'    // บทความวิจัย
  | 'academic_article'    // บทความวิชาการ
  | 'book'                // หนังสือ
  | 'textbook'            // ตำรา
  | 'teaching_material'   // เอกสารประกอบการสอน
  | 'lecture_notes'       // เอกสารคำสอน
  | 'research_report'     // รายงานวิจัย
  | 'innovation'          // ผลงานนวัตกรรม
  | 'academic_service'    // ผลงานบริการวิชาการ
  | 'culture_preservation';// ผลงานทำนุบำรุงศิลปวัฒนธรรม

export interface AcademicWork {
  id: string;
  titleTh: string;              // ชื่อผลงานภาษาไทย
  titleEn?: string;             // ชื่อผลงานภาษาอังกฤษ
  category: AcademicCategory;   // ประเภทผลงาน (11 หมวด)
  publicationYear?: string;     // ปีที่เผยแพร่
  authors?: string;             // ผู้แต่งหรือผู้วิจัย
  projectLeader?: string;       // หัวหน้าโครงการ
  coResearchers?: string;       // ผู้ร่วมโครงการ
  publisherOrSource?: string;   // แหล่งเผยแพร่
  doi?: string;                 // DOI
  url?: string;                 // URL
  abstract?: string;            // บทคัดย่อ
  keywords?: string;            // คำสำคัญ
  fileUrl?: string;             // ไฟล์ผลงาน
  coverImageUrl?: string;       // รูปภาพปก
  status?: 'published' | 'draft' | 'archived'; // สถานะเผยแพร่

  // Legacy / Compatibility fields
  authorTh?: string;
  coAuthors?: string;
  year?: string;
  fundingSource?: string;
  journalName?: string;
  journalDetails?: string;
  databaseIndex?: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  courseName?: string;
  courseCode?: string;
  curriculum?: string;
  semesterAndYear?: string;
  attachmentUrl?: string;
  imageUrl?: string;
  doiOrUrl?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerItem {
  id: string;
  titleTh: string;
  titleEn: string;
  subTh: string;
  subEn: string;
  descTh: string;
  descEn: string;
  image: string;
  bgClass: string;
  onlyImage: boolean;
  linkType: 'viewDetails' | 'applyNow' | 'external' | 'none';
  externalUrl?: string;
}

export interface HomepageSection {
  id: string;
  key: string;
  titleTh: string;
  titleEn?: string;
  description?: string;
  isVisible: boolean;
  order: number;
  config?: Record<string, any>;
}

// ============================================================================
// OFFICIAL ANNOUNCEMENTS SYSTEM TYPES
// ============================================================================

export type AnnouncementCategory =
  | 'general'      // ประกาศทั่วไป
  | 'academic'     // ประกาศทางวิชาการ
  | 'admission'    // ประกาศรับสมัคร
  | 'procurement'  // ประกาศจัดซื้อจัดจ้าง
  | 'results'      // ประกาศผลการคัดเลือก
  | 'documents'    // ประกาศดาวน์โหลดเอกสาร
  | 'urgent';      // ประกาศเร่งด่วน

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  fileType: 'pdf' | 'doc' | 'xls' | 'zip' | 'img' | 'other';
  size: string;
  downloadCount: number;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  titleEn?: string;
  category: AnnouncementCategory;
  categoryLabel: string;
  announcementNo?: string; // เลขที่ประกาศ เช่น วส.พม. 015/2569
  publisher?: string;      // หน่วยงานเจ้าของประกาศ เช่น ฝ่ายวิชาการ, งานพัสดุ
  isPinned: boolean;       // ปักหมุดประกาศ
  isUrgent?: boolean;      // ประกาศเร่งด่วน
  startDate: string;       // วันเริ่มต้น YYYY-MM-DD
  endDate?: string;        // วันสิ้นสุด YYYY-MM-DD
  yearTh: string;          // ปี พ.ศ. เช่น "2569", "2568"
  excerpt: string;
  content?: string;
  attachments: AnnouncementAttachment[];
  allowDownload: boolean;  // เปิด/ปิดปุ่มดาวน์โหลด
  totalDownloads: number;  // จำนวนดาวน์โหลดรวม
  viewCount: number;       // จำนวนผู้เข้าชม
  status: 'active' | 'scheduled' | 'expired' | 'draft'; // สถานะประกาศ
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ADMISSION PROJECT MANAGEMENT SYSTEM TYPES
// ============================================================================

export type DegreeLevel = 'bachelor' | 'master' | 'doctor' | 'certificate';

export interface AdmissionProject {
  id: string;
  projectName: string;             // ชื่อโครงการรับสมัคร
  title?: string;                  // ชื่อโครงการ (alias)
  projectNameEn?: string;           // ชื่อโครงการภาษาอังกฤษ
  recruitmentType: string;         // ประเภทการรับสมัคร เช่น "โควตาพิเศษ", "รับตรงทั่วไป", "ทุนคณะสงฆ์"
  curriculumName: string;          // หลักสูตร เช่น "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา"
  academicYear?: string;           // ปีการศึกษา เช่น "2569"
  degreeLevel: DegreeLevel;        // ระดับการศึกษา: ปริญญาตรี | ปริญญาโท | ปริญญาเอก | ประกาศนียบัตร
  qualifications: string[];        // คุณสมบัติผู้สมัคร (รายการข้อกำหนด)
  quotaSeats: number;              // จำนวนที่รับ (คน)
  startDate: string;               // วันเปิดรับสมัคร YYYY-MM-DD
  endDate: string;                 // วันปิดรับสมัคร YYYY-MM-DD
  applicationFee: string;          // ค่าธรรมเนียมการสมัคร เช่น "ไม่มีค่าธรรมเนียม", "300 บาท"
  prospectusUrl?: string;          // ลิงก์แนบระเบียบการ (PDF)
  prospectusName?: string;         // ชื่อไฟล์ระเบียบการ
  enableOnlineApply: boolean;      // แสดงปุ่มสมัครออนไลน์ (true/false)
  applyMethod: 'internal' | 'external_form'; // วิธีสมัคร: ระบบภายใน หรือ Google Forms
  externalFormUrl?: string;        // ลิงก์ Google Forms / ระบบภายนอก
  statusOverride?: 'auto' | 'open' | 'closed' | 'results'; // ควบคุมสถานะอัตโนมัติ หรือบังคับเปิด/ปิด/ประกาศผล
  status?: string;                 // สถานะ เช่น open / closed / draft
  announcementResultsUrl?: string; // ลิงก์ประกาศผลการคัดเลือก
  description?: string;            // รายละเอียดโครงการเพิ่มเติม
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// PERSONNEL / STAFF MANAGEMENT SYSTEM TYPES (ระบบจัดการบุคลากร)
// ============================================================================

export type PersonnelStatus = 'active' | 'on_leave' | 'transferred' | 'retired';

export interface StaffEducation {
  id?: string;
  degreeLevel: string; // e.g. "ปริญญาเอก", "ปริญญาโท", "ปริญญาตรี", "เปรียญธรรม"
  degreeName: string;  // e.g. "พุทธศาสตรดุษฎีบัณฑิต (พธ.ด.)"
  major: string;       // e.g. "สาขาวิชาพระพุทธศาสนา"
  institution: string; // e.g. "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
  yearGraduated?: string; // e.g. "2562"
}

export interface StaffAcademicWorkItem {
  id?: string;
  category: 'research' | 'article' | 'book' | 'textbook' | 'teaching_material'; // งานวิจัย | บทความ | หนังสือ | ตำรา | เอกสารประกอบการสอน
  titleTh: string;
  titleEn?: string;
  year: string; // ปี พ.ศ.
  publisherOrSource?: string; // วารสาร / สำนักพิมพ์ / แหล่งทุน / รหัสวิชา
  isbnOrDoi?: string;
  url?: string;
  description?: string;
}

export interface StaffMember {
  id: string;
  prefixTh: string;         // คำนำหน้าชื่อ e.g. "พระครูศรีพัชโรทัย, ดร.", "ผศ.ดร.", "นาย", "นาง", "นางสาว"
  firstNameTh: string;      // ชื่อภาษาไทย
  lastNameTh: string;       // นามสกุลภาษาไทย
  prefixEn?: string;        // คำนำหน้าภาษาอังกฤษ e.g. "Phrakru", "Asst. Prof. Dr."
  firstNameEn?: string;     // ชื่อภาษาอังกฤษ
  lastNameEn?: string;      // นามสกุลภาษาอังกฤษ
  position: string;         // ตำแหน่งบริหาร e.g. "ผู้อำนวยการวิทยาลัย", "หัวหน้ากลุ่มงานวิชาการ"
  academicPosition: string; // ตำแหน่งทางวิชาการ e.g. "อาจารย์", "ผู้ช่วยศาสตราจารย์", "รองศาสตราจารย์", "ศาสตราจารย์"
  department: string;       // หน่วยงาน e.g. "วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์", "สำนักวิชาการ"
  workgroup: string;        // กลุ่มงาน e.g. "กลุ่มงานบริหาร", "กลุ่มงานวิชาการ", "งานทะเบียนและวัดผล", "งานพัสดุ"
  educationHistory: StaffEducation[]; // ประวัติการศึกษา
  expertise: string[];      // ความเชี่ยวชาญ
  academicWorks: StaffAcademicWorkItem[]; // ผลงานวิชาการ (งานวิจัย, บทความ, หนังสือ, ตำรา, เอกสารประกอบการสอน)
  phone: string;            // เบอร์โทรศัพท์
  email: string;            // อีเมล
  avatarUrl: string;        // รูปประจำตัว
  sortOrder: number;        // ลำดับการแสดงผล
  status: PersonnelStatus;  // สถานะปฏิบัติงาน: 'active' | 'on_leave' | 'transferred' | 'retired'
  profileSlug: string;      // URL โปรไฟล์เฉพาะบุคคล e.g. "phrakru-sripatcharothai"
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// MEDIA LIBRARY & FILE MANAGEMENT TYPES (คลังสื่อและระบบจัดการไฟล์กลาง)
// ============================================================================

export type StorageProvider = 'local' | 's3' | 'gcs' | 'gdrive';

export type MediaFileType = 'image' | 'document' | 'audio' | 'video' | 'archive' | 'other';

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string | null;
  slug?: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaUsageReference {
  module: string;       // e.g. 'news', 'events', 'personnel', 'banners', 'courses', 'academic_works', 'downloads', 'announcements'
  id: string;           // Entity ID
  title: string;        // Entity Title or Name
  field: string;        // Field name e.g. 'imageUrl', 'avatarUrl', 'fileUrl'
}

export interface MediaFile {
  id: string;
  filename: string;           // Display filename / title
  name?: string;              // Optional alias name
  originalFilename: string;   // Original uploaded file name e.g., photo_2026.png
  extension?: string;         // File extension e.g., pdf, png
  path: string;               // File path e.g. /uploads/2026/07/photo_2026.webp
  url: string;                // Accessible relative or absolute URL
  thumbnailUrl?: string;      // Generated WebP thumbnail
  webpUrl?: string;           // WebP converted image path
  mimeType: string;           // e.g., image/jpeg, application/pdf
  fileType: MediaFileType;    // 'image' | 'document' | 'archive' | 'audio' | 'video' | 'other'
  size: number;               // Bytes
  formattedSize: string;      // e.g. "1.4 MB"
  dimensions?: { width: number; height: number }; // If image
  folderId?: string | null;    // Folder ID or null for root
  altText?: string;           // Accessibility & SEO Alt text
  description?: string;       // Extended description
  tags?: string[];            // Keywords / Tags
  storageProvider: StorageProvider; // 'local' | 's3' | 'gcs' | 'gdrive'
  isCompressed?: boolean;     // Compression status
  originalSize?: number;      // Pre-compression size in bytes
  compressionRatio?: number;  // Percentage saved e.g. 68 (%)
  createdAt: string;
  updatedAt?: string;
  usages?: MediaUsageReference[]; // Usage references found in DB
}

export type ContentType = 'page' | 'news' | 'announcement' | 'academic_work' | 'curriculum' | 'admission_project' | 'event' | 'download';

export interface ContentRevision {
  id: string;
  contentType: ContentType | string;
  contentId: string;
  revisionNumber: number;
  title: string;
  changeSummary: string; // เหตุผลการแก้ไข
  snapshot: any; // ข้อมูลฉบับเต็มของเนื้อหา ณ เวอร์ชันนั้น
  createdBy: string; // Username ผู้แก้ไข
  createdByName?: string; // ชื่อจริงผู้แก้ไข
  createdByRole?: string; // บทบาทผู้แก้ไข
  createdAt: string; // วันที่และเวลา ISO
}

export interface MediaStorageSettings {
  provider: StorageProvider;
  maxFileSizeMB: number; // e.g. 20 MB
  allowedTypes: string[]; // MIME types allowed
  autoWebPConversion: boolean;
  autoCompressImages: boolean;
  compressionQuality: number; // 0-100
  generateThumbnails: boolean;
  s3Config?: { bucket: string; region: string; endpoint?: string };
  gdriveConfig?: { folderId: string; accountEmail?: string };
}

// ============================================================================
// DASHBOARD NOTIFICATION SYSTEM & FUTURE EMAIL DISPATCH TYPES
// ============================================================================

export type NotificationType = 
  | 'pending_review'           // มีเนื้อหาใหม่รอตรวจสอบ
  | 'approved'                 // เนื้อหาถูกอนุมัติ
  | 'returned_for_revision'    // เนื้อหาถูกส่งกลับแก้ไข
  | 'expiring_soon'            // เนื้อหาใกล้หมดอายุ
  | 'admission_closing'        // การรับสมัครใกล้ปิด
  | 'event_upcoming'           // กิจกรรมใกล้ถึงวันจัด
  | 'failed_logins'            // มีผู้ใช้งานเข้าสู่ระบบผิดหลายครั้ง
  | 'critical_setting_changed' // มีการแก้ไขข้อมูลสำคัญ
  | 'upload_failed'            // มีไฟล์อัปโหลดล้มเหลว
  | 'general';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';
export type EmailDispatchStatus = 'pending' | 'queued' | 'sent' | 'failed' | 'disabled';

export interface DashboardNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  sourceType?: 'news' | 'announcement' | 'admission' | 'event' | 'academic' | 'security' | 'settings' | 'upload' | 'system';
  sourceId?: string;
  link?: string; // Deep link in admin e.g. /admin?tab=news
  targetRoles?: string[];
  targetUserId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  
  // Future Email Dispatch Architecture
  emailStatus: EmailDispatchStatus;
  emailRecipient?: string;
  emailSentAt?: string;
  emailError?: string;
  emailTemplateId?: string;
}

export interface EmailTemplate {
  id: string;
  type: NotificationType;
  nameTh: string;
  subjectTh: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isEnabled: boolean;
}





