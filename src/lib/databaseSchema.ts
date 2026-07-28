/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SYSTEMATIC RELATIONAL DATABASE SCHEMA DEFINITION
 * MCU Nakhon Sawan College Data Architecture
 */

// ============================================================================
// COMMON ENTITY AUDIT & LIFECYCLE FIELDS INTERFACE
// ============================================================================
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  published_at?: string | null;
  deleted_at?: string | null;
  status: 'published' | 'draft' | 'scheduled' | 'hidden' | 'trash' | 'active' | 'inactive';
}

// ============================================================================
// 1. USERS & RBAC TABLES
// ============================================================================
export interface DBUser extends BaseEntity {
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role_id: string;
  department?: string;
  avatar_url?: string;
  is_2fa_enabled: boolean;
  failed_login_attempts: number;
  lockout_until?: string | null;
}

export interface DBRole {
  id: string;
  name: string;
  code: string;
  description_th: string;
  color: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface DBPermission {
  id: string;
  code: string;
  category: 'content' | 'user' | 'system' | 'approval';
  label_th: string;
  description_th: string;
  created_at: string;
}

export interface DBRolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface DBUserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  created_at: string;
}

// ============================================================================
// 2. PAGES & REVISIONS
// ============================================================================
export interface DBPage extends BaseEntity {
  slug: string;
  title_th: string;
  title_en?: string;
  content_th: string;
  content_en?: string;
  layout_template: string;
  meta_title?: string;
  meta_description?: string;
  view_count: number;
}

export interface DBPageRevision {
  id: string;
  page_id: string;
  revision_number: number;
  title_th: string;
  content_th: string;
  change_summary?: string;
  created_by: string;
  created_at: string;
}

// ============================================================================
// 3. MENUS & NAVIGATION
// ============================================================================
export interface DBMenu extends BaseEntity {
  code: string;
  name_th: string;
  location: 'header' | 'footer' | 'sidebar' | 'topbar';
  is_active: boolean;
}

export interface DBMenuItem extends BaseEntity {
  menu_id: string;
  parent_id?: string | null;
  label_th: string;
  label_en?: string;
  url: string;
  target: '_self' | '_blank';
  sort_order: number;
  icon_name?: string;
  is_visible: boolean;
}

// ============================================================================
// 4. POSTS, CATEGORIES & TAGS
// ============================================================================
export interface DBPost extends BaseEntity {
  slug: string;
  title_th: string;
  title_en?: string;
  excerpt_th?: string;
  body_th: string;
  category_id: string;
  thumbnail_url?: string;
  is_featured: boolean;
  is_pinned: boolean;
  view_count: number;
  scheduled_at?: string | null;
  expired_at?: string | null;
}

export interface DBPostCategory extends BaseEntity {
  slug: string;
  name_th: string;
  name_en?: string;
  description_th?: string;
  parent_id?: string | null;
  sort_order: number;
}

export interface DBPostTag {
  id: string;
  slug: string;
  name_th: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface DBPostTagRelation {
  id: string;
  post_id: string;
  tag_id: string;
  created_at: string;
}

// ============================================================================
// 5. ANNOUNCEMENTS, EVENTS & COURSES
// ============================================================================
export interface DBAnnouncement extends BaseEntity {
  code_no: string;
  title_th: string;
  title_en?: string;
  category: 'general' | 'academic' | 'procurement' | 'job' | 'urgent';
  year_th: string;
  content_th?: string;
  attachment_url?: string;
  is_pinned: boolean;
  is_urgent: boolean;
  download_count: number;
  scheduled_at?: string | null;
  expired_at?: string | null;
}

export interface DBEvent extends BaseEntity {
  title_th: string;
  title_en?: string;
  description_th?: string;
  start_date: string;
  end_date?: string;
  location_th?: string;
  category: 'academic' | 'activity' | 'buddhism' | 'meeting' | 'holiday';
  organizer?: string;
  cover_url?: string;
}

export interface DBCourse extends BaseEntity {
  code: string;
  name_th: string;
  name_en?: string;
  degree_level: 'bachelor' | 'master' | 'doctorate' | 'certificate';
  faculty_name: string;
  duration_years: string;
  total_credits: number;
  tuition_fee: string;
  description_th?: string;
}

// ============================================================================
// 6. ADMISSIONS, PERSONNEL & ACADEMIC WORKS
// ============================================================================
export interface DBAdmission extends BaseEntity {
  title_th: string;
  academic_year: string;
  semester: string;
  degree_level: string;
  quota_count: number;
  start_date: string;
  end_date: string;
  requirements_th?: string;
  application_url?: string;
}

export interface DBPersonnel extends BaseEntity {
  prefix: string;
  name_th: string;
  name_en?: string;
  position_th: string;
  position_en?: string;
  department: string;
  academic_rank?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  sort_order: number;
}

export interface DBAcademicWork extends BaseEntity {
  title_th: string;
  title_en?: string;
  authors: string;
  category: 'research' | 'article' | 'book' | 'innovation';
  publication_year: string;
  publisher?: string;
  doi?: string;
  file_url?: string;
  abstract_th?: string;
}

// ============================================================================
// 7. DOWNLOADS, MEDIA & SETTINGS
// ============================================================================
export interface DBDownload extends BaseEntity {
  title_th: string;
  category: string;
  file_url: string;
  file_size: string;
  file_type: string;
  download_count: number;
  description_th?: string;
}

export interface DBMedia extends BaseEntity {
  filename: string;
  original_name: string;
  mime_type: string;
  file_type: 'image' | 'pdf' | 'document' | 'video' | 'archive';
  size_bytes: number;
  url: string;
  alt_text?: string;
  folder_id?: string | null;
  is_compressed: boolean;
}

export interface DBSetting {
  id: string;
  key: string;
  value: string;
  group_name: 'general' | 'security' | 'seo' | 'contact' | 'cache';
  description_th?: string;
  is_encrypted: boolean;
  updated_at: string;
  updated_by?: string;
}

// ============================================================================
// 8. LOGS, NOTIFICATIONS & TRASH
// ============================================================================
export interface DBActivityLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  module_name: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface DBLoginLog {
  id: string;
  user_id: string;
  username: string;
  status: 'success' | 'failed_password' | 'failed_captcha' | 'locked';
  ip_address: string;
  user_agent: string;
  device: string;
  created_at: string;
}

export interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  is_read: boolean;
  link_url?: string;
  created_at: string;
  deleted_at?: string | null;
}

export interface DBTrashItem {
  id: string;
  table_name: string;
  original_id: string;
  item_title: string;
  item_data: any;
  deleted_by: string;
  deleted_at: string;
  restore_deadline: string;
}

// ============================================================================
// COMPLETE DATABASE SCHEMAS REGISTRY & RELATIONSHIPS METADATA
// ============================================================================
export interface TableSchemaMeta {
  tableName: string;
  labelTh: string;
  primaryKey: string;
  foreignKeys: Array<{ field: string; refTable: string; refField: string }>;
  indexes: string[];
  uniqueConstraints: string[];
  supportsSoftDelete: boolean;
  supportsRevisions: boolean;
}

export const DATABASE_TABLE_REGISTRY: Record<string, TableSchemaMeta> = {
  users: {
    tableName: 'users',
    labelTh: 'ผู้ใช้งานระบบ (Users)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'role_id', refTable: 'roles', refField: 'id' }],
    indexes: ['idx_users_username', 'idx_users_email', 'idx_users_status'],
    uniqueConstraints: ['username', 'email'],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  roles: {
    tableName: 'roles',
    labelTh: 'บทบาทและกลุ่มสิทธิ์ (Roles)',
    primaryKey: 'id',
    foreignKeys: [],
    indexes: ['idx_roles_code'],
    uniqueConstraints: ['code', 'name'],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  permissions: {
    tableName: 'permissions',
    labelTh: 'สิทธิ์การใช้งาน (Permissions)',
    primaryKey: 'id',
    foreignKeys: [],
    indexes: ['idx_permissions_code', 'idx_permissions_category'],
    uniqueConstraints: ['code'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  role_permissions: {
    tableName: 'role_permissions',
    labelTh: 'จับคู่สิทธิ์กับบทบาท (Role Permissions)',
    primaryKey: 'id',
    foreignKeys: [
      { field: 'role_id', refTable: 'roles', refField: 'id' },
      { field: 'permission_id', refTable: 'permissions', refField: 'id' },
    ],
    indexes: ['idx_rp_role', 'idx_rp_permission'],
    uniqueConstraints: ['role_id, permission_id'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  user_roles: {
    tableName: 'user_roles',
    labelTh: 'จับคู่บทบาทกับผู้ใช้ (User Roles)',
    primaryKey: 'id',
    foreignKeys: [
      { field: 'user_id', refTable: 'users', refField: 'id' },
      { field: 'role_id', refTable: 'roles', refField: 'id' },
    ],
    indexes: ['idx_ur_user', 'idx_ur_role'],
    uniqueConstraints: ['user_id, role_id'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  pages: {
    tableName: 'pages',
    labelTh: 'หน้าเว็บไดนามิก (Pages)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_pages_slug', 'idx_pages_status', 'idx_pages_published_at'],
    uniqueConstraints: ['slug'],
    supportsSoftDelete: true,
    supportsRevisions: true,
  },
  page_revisions: {
    tableName: 'page_revisions',
    labelTh: 'ประวัติการแก้ไขหน้าเว็บ (Page Revisions)',
    primaryKey: 'id',
    foreignKeys: [
      { field: 'page_id', refTable: 'pages', refField: 'id' },
      { field: 'created_by', refTable: 'users', refField: 'id' },
    ],
    indexes: ['idx_revisions_page', 'idx_revisions_num'],
    uniqueConstraints: ['page_id, revision_number'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  menus: {
    tableName: 'menus',
    labelTh: 'กลุ่มเมนูหลัก (Menus)',
    primaryKey: 'id',
    foreignKeys: [],
    indexes: ['idx_menus_code', 'idx_menus_location'],
    uniqueConstraints: ['code'],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  menu_items: {
    tableName: 'menu_items',
    labelTh: 'รายการเมนูย่อย (Menu Items)',
    primaryKey: 'id',
    foreignKeys: [
      { field: 'menu_id', refTable: 'menus', refField: 'id' },
      { field: 'parent_id', refTable: 'menu_items', refField: 'id' },
    ],
    indexes: ['idx_menuitems_menu', 'idx_menuitems_parent', 'idx_menuitems_sort'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  posts: {
    tableName: 'posts',
    labelTh: 'บทความและข่าวสาร (Posts)',
    primaryKey: 'id',
    foreignKeys: [
      { field: 'category_id', refTable: 'post_categories', refField: 'id' },
      { field: 'created_by', refTable: 'users', refField: 'id' },
    ],
    indexes: ['idx_posts_slug', 'idx_posts_category', 'idx_posts_status', 'idx_posts_published_at'],
    uniqueConstraints: ['slug'],
    supportsSoftDelete: true,
    supportsRevisions: true,
  },
  post_categories: {
    tableName: 'post_categories',
    labelTh: 'หมวดหมู่ข่าวสาร (Post Categories)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'parent_id', refTable: 'post_categories', refField: 'id' }],
    indexes: ['idx_postcat_slug', 'idx_postcat_parent'],
    uniqueConstraints: ['slug'],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  post_tags: {
    tableName: 'post_tags',
    labelTh: 'แท็กบทความ (Post Tags)',
    primaryKey: 'id',
    foreignKeys: [],
    indexes: ['idx_tags_slug', 'idx_tags_name'],
    uniqueConstraints: ['slug', 'name_th'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  post_tag_relations: {
    tableName: 'post_tag_relations',
    labelTh: 'ความสัมพันธ์ข่าวกับแท็ก (Post Tag Relations)',
    primaryKey: 'id',
    foreignKeys: [
      { field: 'post_id', refTable: 'posts', refField: 'id' },
      { field: 'tag_id', refTable: 'post_tags', refField: 'id' },
    ],
    indexes: ['idx_ptr_post', 'idx_ptr_tag'],
    uniqueConstraints: ['post_id, tag_id'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  announcements: {
    tableName: 'announcements',
    labelTh: 'ประกาศอย่างเป็นทางการ (Announcements)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_ann_code', 'idx_ann_category', 'idx_ann_status', 'idx_ann_published_at'],
    uniqueConstraints: ['code_no'],
    supportsSoftDelete: true,
    supportsRevisions: true,
  },
  events: {
    tableName: 'events',
    labelTh: 'ปฏิทินกิจกรรม (Events)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_events_dates', 'idx_events_category', 'idx_events_status'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  courses: {
    tableName: 'courses',
    labelTh: 'หลักสูตรการศึกษา (Courses)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_courses_code', 'idx_courses_level', 'idx_courses_status'],
    uniqueConstraints: ['code'],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  admissions: {
    tableName: 'admissions',
    labelTh: 'โครงการรับสมัครนักศึกษา (Admissions)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_adm_year', 'idx_adm_status', 'idx_adm_dates'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  personnel: {
    tableName: 'personnel',
    labelTh: 'ทำเนียบบุคลากร (Personnel)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_personnel_dept', 'idx_personnel_sort', 'idx_personnel_status'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  academic_works: {
    tableName: 'academic_works',
    labelTh: 'ผลงานวิชาการและวิจัย (Academic Works)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_acwork_year', 'idx_acwork_cat', 'idx_acwork_status'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  downloads: {
    tableName: 'downloads',
    labelTh: 'เอกสารดาวน์โหลด (Downloads)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_dl_cat', 'idx_dl_status'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  media: {
    tableName: 'media',
    labelTh: 'คลังสื่อและรูปภาพ (Media Library)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'created_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_media_type', 'idx_media_folder', 'idx_media_created'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  settings: {
    tableName: 'settings',
    labelTh: 'การตั้งค่าระบบ (Settings)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'updated_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_settings_key', 'idx_settings_group'],
    uniqueConstraints: ['key'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  activity_logs: {
    tableName: 'activity_logs',
    labelTh: 'บันทึกประวัติการทำงาน (Activity Logs)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'user_id', refTable: 'users', refField: 'id' }],
    indexes: ['idx_actlogs_user', 'idx_actlogs_action', 'idx_actlogs_date'],
    uniqueConstraints: [],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  login_logs: {
    tableName: 'login_logs',
    labelTh: 'บันทึกประวัติเข้าสู่ระบบ (Login Logs)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'user_id', refTable: 'users', refField: 'id' }],
    indexes: ['idx_loginlogs_user', 'idx_loginlogs_status', 'idx_loginlogs_date'],
    uniqueConstraints: [],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
  notifications: {
    tableName: 'notifications',
    labelTh: 'การแจ้งเตือนระบบ (Notifications)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'user_id', refTable: 'users', refField: 'id' }],
    indexes: ['idx_notif_user', 'idx_notif_read', 'idx_notif_created'],
    uniqueConstraints: [],
    supportsSoftDelete: true,
    supportsRevisions: false,
  },
  trash_items: {
    tableName: 'trash_items',
    labelTh: 'ถังขยะและกู้คืนข้อมูล (Trash / Recycle Bin)',
    primaryKey: 'id',
    foreignKeys: [{ field: 'deleted_by', refTable: 'users', refField: 'id' }],
    indexes: ['idx_trash_table', 'idx_trash_orig_id', 'idx_trash_date'],
    uniqueConstraints: ['table_name, original_id'],
    supportsSoftDelete: false,
    supportsRevisions: false,
  },
};
