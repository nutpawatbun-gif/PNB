-- ========================================================
-- MCU University Database Dump for phpMyAdmin / MySQL
-- Export Date: 2026-07-23T16:22:41.357Z
-- Encoding: UTF-8 (utf8mb4)
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- Table structure & Data for `users` (6 records)
-- ========================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `username` LONGTEXT NULL,
  `passwordHash` LONGTEXT NULL,
  `name` LONGTEXT NULL,
  `role` LONGTEXT NULL,
  `email` LONGTEXT NULL,
  `department` LONGTEXT NULL,
  `status` LONGTEXT NULL,
  `mustChangePassword` LONGTEXT NULL,
  `is2FAEnabled` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `lastLoginAt` LONGTEXT NULL,
  `failedLoginAttempts` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL,
  `customPermissions` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `passwordHash`, `name`, `role`, `email`, `department`, `status`, `mustChangePassword`, `is2FAEnabled`, `createdAt`, `lastLoginAt`, `failedLoginAttempts`, `updatedAt`, `customPermissions`) VALUES
  ('u0', 'akkharadet', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'นายอัครเดช บุญหิรัญไพศาล (Super Admin)', 'Super Admin', 'superadmin@mcu.ac.th', 'ผู้ดูแลระบบสารสนเทศกลาง', 'active', 0, 0, '2026-07-22T11:12:05.118Z', '2026-07-23T13:47:45.232Z', 0, '2026-07-22T15:46:34.164Z', '["view","create","edit_own","edit_all","delete","publish","approve","export","manage_users","manage_settings"]'),
  ('u1', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'พระมหาสมชาย สุขจิตฺโต (Super Admin)', 'Super Admin', 'superadmin@mcu.ac.th', 'ผู้ดูแลระบบสารสนเทศกลาง', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '["view","create","edit_own","edit_all","delete","publish","approve","export","manage_users","manage_settings"]'),
  ('u2', 'siteadmin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ดร.วิชัย มั่นคง (Admin)', 'Admin', 'admin@mcu.ac.th', 'สำนักวิชาการและวิทยาลัย', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '["view","create","edit_own","edit_all","delete","publish","approve","export","manage_users"]'),
  ('u3', 'editor', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'นายสมชาย ใจดี (Editor)', 'Editor', 'editor@mcu.ac.th', 'ศูนย์ประชาสัมพันธ์และบรรณาธิการ', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '["view","create","edit_own","edit_all","approve","export"]'),
  ('u4', 'author', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'อาจารย์สุรศักดิ์ นักเขียน (Author)', 'Author', 'author@mcu.ac.th', 'สาขาวิชาพระพุทธศาสนา', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '["view","create","edit_own"]'),
  ('u5', 'viewer', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'นางสาวนภา ดูงาน (Viewer)', 'Viewer', 'viewer@mcu.ac.th', 'งานประกันคุณภาพการศึกษา', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '["view"]');

-- ========================================================
-- Table structure & Data for `menus` (9 records)
-- ========================================================
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `labelTh` LONGTEXT NULL,
  `labelEn` LONGTEXT NULL,
  `url` LONGTEXT NULL,
  `target` LONGTEXT NULL,
  `isVisible` LONGTEXT NULL,
  `order` LONGTEXT NULL,
  `icon` LONGTEXT NULL,
  `submenus` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `menus` (`id`, `labelTh`, `labelEn`, `url`, `target`, `isVisible`, `order`, `icon`, `submenus`) VALUES
  ('m_home', 'หน้าแรก', 'Home', '/', '_self', 1, 1, 'Home', '[]'),
  ('m_about', 'เกี่ยวกับเรา', 'About College', '/about', '_self', 1, 2, 'Building', '[{"id":"sm_history","labelTh":"ประวัติความเป็นมา","labelEn":"History","url":"/about#history"},{"id":"sm_philosophy","labelTh":"ปรัชญา ปณิธาน อัตลักษณ์","labelEn":"Philosophy & Identity","url":"/about#philosophy"},{"id":"sm_executives","labelTh":"ผู้บริหารวิทยาลัย","labelEn":"Executives","url":"/about#executives"},{"id":"sm_personnel","labelTh":"ทำเนียบบุคลากร","labelEn":"Personnel Directory","url":"/personnel"}]'),
  ('m_courses', 'หลักสูตรที่เปิดสอน', 'Academic Programs', '/courses', '_self', 1, 3, 'GraduationCap', '[{"id":"sm_b1","labelTh":"ระดับปริญญาตรี (พุทธศาสตรบัณฑิต)","labelEn":"Bachelor Programs (B.A.)","url":"/courses?level=bachelor"},{"id":"sm_m1","labelTh":"ระดับปริญญาโท (พุทธศาสตรมหาบัณฑิต)","labelEn":"Master Programs (M.A.)","url":"/courses?level=master"},{"id":"sm_d1","labelTh":"ระดับปริญญาเอก (พุทธศาสตรดุษฎีบัณฑิต)","labelEn":"Doctoral Programs (Ph.D.)","url":"/courses?level=doctor"},{"id":"sm_c1","labelTh":"หลักสูตรประกาศนียบัตร","labelEn":"Certificate Programs","url":"/courses?level=certificate"}]'),
  ('m_academic', 'ผลงานวิชาการ', 'Academic Works', '/academic', '_self', 1, 4, 'BookOpen', '[{"id":"sm_ac_all","labelTh":"คลังผลงานวิชาการทั้งหมด","labelEn":"All Publications","url":"/academic"},{"id":"sm_ac_res","labelTh":"โครงการงานวิจัย","labelEn":"Research Projects","url":"/academic?cat=research"},{"id":"sm_ac_res_art","labelTh":"บทความวิจัย","labelEn":"Research Articles","url":"/academic?cat=research_article"},{"id":"sm_ac_art","labelTh":"บทความวิชาการ","labelEn":"Academic Papers","url":"/academic?cat=academic_article"},{"id":"sm_ac_book","labelTh":"หนังสือวิชาการ","labelEn":"Academic Books","url":"/academic?cat=book"},{"id":"sm_ac_textbook","labelTh":"ตำราเรียน","labelEn":"Textbooks","url":"/academic?cat=textbook"},{"id":"sm_ac_teach","labelTh":"เอกสารประกอบการสอน","labelEn":"Instructional Materials","url":"/academic?cat=teaching_material"}]'),
  ('m_news', 'ข่าวสารและกิจกรรม', 'News & Events', '/news', '_self', 1, 5, 'Newspaper', '[{"id":"sm_news_all","labelTh":"ข่าวสารทั้งหมด","labelEn":"All News Feed","url":"/news"},{"id":"sm_news_cal","labelTh":"ปฏิทินกิจกรรมวิทยาลัย","labelEn":"Activity Calendar","url":"/calendar"}]'),
  ('m_admission', 'รับสมัครนักศึกษา', 'Admissions', '/admission', '_self', 1, 6, 'UserPlus', '[{"id":"sm_adm_info","labelTh":"ประกาศและระเบียบการ","labelEn":"Announcements","url":"/admission/announcements"},{"id":"sm_adm_steps","labelTh":"ขั้นตอนการสมัครเรียน","labelEn":"Admission Steps","url":"/admission/steps"},{"id":"sm_adm_apply","labelTh":"สมัครเรียนออนไลน์ 2569","labelEn":"Apply Online 2026","url":"/admission/apply"},{"id":"sm_adm_status","labelTh":"ตรวจสอบสถานะผู้สมัคร","labelEn":"Track Application Status","url":"/admission/status"}]'),
  ('m_downloads', 'คลังเอกสารดาวน์โหลด', 'Document Center', '/downloads', '_self', 1, 7, 'FileText', '[{"id":"sm_dl_std","labelTh":"เอกสารสำหรับนิสิต","labelEn":"Student Forms","url":"/downloads?cat=student"},{"id":"sm_dl_stf","labelTh":"เอกสารสำหรับอาจารย์และบุคลากร","labelEn":"Faculty & Staff Forms","url":"/downloads?cat=staff"},{"id":"sm_dl_rul","labelTh":"ระเบียบ ข้อบังคับ และข้อตกลง","labelEn":"Regulations & Bylaws","url":"/downloads?cat=rules"}]'),
  ('m_services', 'ระบบบริการออนไลน์', 'Online Services', '/services', '_self', 1, 8, 'LayoutGrid', '[]'),
  ('m_contact', 'ติดต่อเรา', 'Contact Us', '/contact', '_self', 1, 9, 'Phone', '[]');

-- ========================================================
-- Table structure & Data for `newsCategories` (5 records)
-- ========================================================
DROP TABLE IF EXISTS `newsCategories`;
CREATE TABLE `newsCategories` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nameTh` LONGTEXT NULL,
  `nameEn` LONGTEXT NULL,
  `slug` LONGTEXT NULL,
  `color` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `newsCategories` (`id`, `nameTh`, `nameEn`, `slug`, `color`) VALUES
  ('cat_pr', 'ข่าวประชาสัมพันธ์', 'PR & Announcements', 'pr-news', 'bg-blue-500'),
  ('cat_academic', 'ข่าววิชาการ', 'Academic News', 'academic-news', 'bg-purple-500'),
  ('cat_activity', 'กิจกรรมวิทยาลัย', 'College Activities', 'college-activities', 'bg-emerald-500'),
  ('cat_admission', 'ข่าวการรับสมัคร', 'Admissions', 'admissions', 'bg-pink-500'),
  ('cat_buddhism', 'ข่าวศาสนกิจและคุณธรรม', 'Dhamma & Religion', 'dhamma-religion', 'bg-amber-500');

-- ========================================================
-- Table structure & Data for `newsTags` (6 records)
-- ========================================================
DROP TABLE IF EXISTS `newsTags`;
CREATE TABLE `newsTags` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` LONGTEXT NULL,
  `slug` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `newsTags` (`id`, `name`, `slug`) VALUES
  ('tag1', 'รับสมัคร2569', 'admission-2569'),
  ('tag2', 'วิชาการ', 'academic'),
  ('tag3', 'สัมมนา', 'seminar'),
  ('tag4', 'กิจกรรมนิสิต', 'student-activity'),
  ('tag5', 'เพชรบูรณ์', 'phetchabun'),
  ('tag6', 'ทุนการศึกษา', 'scholarship');

-- ========================================================
-- Table structure & Data for `news` (4 records)
-- ========================================================
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `title` LONGTEXT NULL,
  `titleEn` LONGTEXT NULL,
  `slug` LONGTEXT NULL,
  `category` LONGTEXT NULL,
  `categoryLabel` LONGTEXT NULL,
  `tags` LONGTEXT NULL,
  `isFeatured` LONGTEXT NULL,
  `date` LONGTEXT NULL,
  `publishedAt` LONGTEXT NULL,
  `scheduledAt` LONGTEXT NULL,
  `expiredAt` LONGTEXT NULL,
  `excerpt` LONGTEXT NULL,
  `content` LONGTEXT NULL,
  `imageUrl` LONGTEXT NULL,
  `albumTitle` LONGTEXT NULL,
  `galleryUrls` LONGTEXT NULL,
  `videoUrl` LONGTEXT NULL,
  `attachmentUrl` LONGTEXT NULL,
  `attachmentName` LONGTEXT NULL,
  `attachments` LONGTEXT NULL,
  `authorName` LONGTEXT NULL,
  `authorRole` LONGTEXT NULL,
  `status` LONGTEXT NULL,
  `viewCount` LONGTEXT NULL,
  `relatedNewsIds` LONGTEXT NULL,
  `seoTitle` LONGTEXT NULL,
  `seoDescription` LONGTEXT NULL,
  `seoKeywords` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `news` (`id`, `title`, `titleEn`, `slug`, `category`, `categoryLabel`, `tags`, `isFeatured`, `date`, `publishedAt`, `scheduledAt`, `expiredAt`, `excerpt`, `content`, `imageUrl`, `albumTitle`, `galleryUrls`, `videoUrl`, `attachmentUrl`, `attachmentName`, `attachments`, `authorName`, `authorRole`, `status`, `viewCount`, `relatedNewsIds`, `seoTitle`, `seoDescription`, `seoKeywords`, `createdAt`, `updatedAt`) VALUES
  ('n1', 'เปิดรับสมัครนิสิตใหม่ระดับปริญญาตรี ปริญญาโท และปริญญาเอก ประจำปีการศึกษา 2569', 'Admissions Open for Undergraduate, Postgraduate and Doctoral Programs for Academic Year 2026', 'admissions-open-academic-year-2569', 'cat_admission', 'ข่าวการรับสมัคร', '["รับสมัคร2569","ทุนการศึกษา","เพชรบูรณ์"]', 1, '2569-07-15', '2026-07-15T09:00:00.000Z', '', '2026-10-31T23:59:59.000Z', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประกาศเปิดรับสมัครบุคคลเข้าศึกษาต่อประจำปีการศึกษา 2569 โดยครอบคลุมทั้งบรรพชิตและคฤหัสถ์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประกาศเปิดรับสมัครบุคคลเพื่อเข้าศึกษาต่อในระดับปริญญาตรี ปริญญาโท ปริญญาเอก และหลักสูตรประกาศนียบัตร ประจำปีการศึกษา 2569 โดยเปิดรับทั้งบรรพชิต (พระภิกษุ สามเณร) และคฤหัสถ์ (ประชาชนทั่วไป) โดยมุ่งเน้นการเสริมสร้างคุณธรรมความรู้ ทักษะทางวิชาการ และการฝึกปฏิบัติกรรมฐานอย่างถูกต้องสมบูรณ์ สามารถดาวน์โหลดคู่มือผู้สมัครและส่งใบสมัครได้ผ่านระบบทะเบียนออนไลน์ ได้รับการส่งเสริมทุนวิชาการสำหรับพระสังฆาธิการและสามเณรตลอดหลักสูตร\n\nการศึกษาเน้นสร้างปัญญาและศีลธรรม พร้อมสิ่งอำนวยความสะดวก อาคารเรียนรู้เทคโนโลยี และหอพักนิสิต', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800', 'ภาพบรรยากาศเปิดบ้านรับสมัครนิสิตใหม่ และห้องปฏิบัติการเรียนรู้', '["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800"]', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link', 'คู่มือการสมัครเรียนประจำปีการศึกษา_2569.pdf', '[{"id":"att1","name":"คู่มือการสมัครเรียนประจำปีการศึกษา_2569.pdf","url":"#","size":"1.8 MB","format":"PDF"},{"id":"att2","name":"แบบฟอร์มคำขอรับทุนการศึกษาพระภิกษุสามเณร.docx","url":"#","size":"340 KB","format":"DOCX"}]', 'งานประชาสัมพันธ์ วิทยาลัยสงฆ์พ่อขุนผาเมือง', 'เจ้าหน้าที่ประชาสัมพันธ์', 'Published', 384, '["n2","n3"]', 'เปิดรับสมัครนิสิตใหม่ 2569 | วิทยาลัยสงฆ์พ่อขุนผาเมือง มจร', 'สมัครเรียนปริญญาตรี โท เอก มหาจุฬาลงกรณราชวิทยาลัย เพชรบูรณ์ บรรพชิตและประชาชนทั่วไป', 'รับสมัครนิสิตใหม่, มจร เพชรบูรณ์, วิทยาลัยสงฆ์พ่อขุนผาเมือง, เรียนต่อปริญญาตรี', '2026-07-15T08:00:00.000Z', '2026-07-15T09:00:00.000Z'),
  ('n2', 'ขอเชิญร่วมงานสัมมนาวิชาการระดับชาติ ''พุทธธรรมกับนวัตกรรมทางสังคมและรัฐประศาสนศาสตร์''', 'National Academic Conference on Buddhism, Social Innovation and Public Administration', 'national-academic-conference-buddhism-social-innovation-2569', 'cat_academic', 'ข่าววิชาการ', '["วิชาการ","สัมมนา"]', 1, '2569-07-10', '2026-07-10T10:00:00.000Z', '', '', 'ฝ่ายวิชาการและการวิจัย ขอเชิญคณาจารย์ นิสิตนักศึกษา และผู้สนใจร่วมงานประชุมวิชาการระดับท้องถิ่นและระดับชาติ เพื่อการพัฒนาที่ยั่งยืน', 'ฝ่ายวิชาการและการวิจัย วิทยาลัยสงฆ์พ่อขุนผาเมือง ขอเรียนเชิญคณาจารย์ นักวิจัย นิสิตนักศึกษา และประชาชนทั่วไป เข้าร่วมการสัมมนาวิชาการระดับชาติ ประจำปี 2569 เพื่อนำเสนอบทความวิชาการ บทความวิจัยในหลากหลายศาสตร์ที่บูรณาการกับหลักธรรมทางพระพุทธศาสนา เพื่อผลักดันความรู้ใหม่สู่นวัตกรรมสังคม ท้องถิ่น และการบริหารกิจการภาครัฐ ในงานจะมีปาฐกถาพิเศษโดยวิทยากรผู้ทรงคุณวุฒิระดับชาติและพิธีมอบรางวัลงานวิจัยดีเด่น', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', 'ภาพบรรยากาศการสัมมนาวิชาการปีที่ผ่านมา', '["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"]', '', NULL, NULL, '[{"id":"att3","name":"กำหนดการสัมมนาวิชาการระดับชาติ_2569.pdf","url":"#","size":"820 KB","format":"PDF"}]', 'ฝ่ายวิชาการและงานวิจัย', 'ผู้ช่วยผู้อำนวยการฝ่ายวิชาการ', 'Published', 215, '["n1"]', 'สัมมนาวิชาการระดับชาติ พุทธธรรมและนวัตกรรมสังคม | มจร', 'การประชุมสัมมนาวิชาการระดับชาติ มอบรางวัลงานวิจัยดีเด่นและนำเสนอบทความวิจัย', 'งานวิจัยมจร, สัมมนาวิชาการ, พุทธศาสนิกชน, เพชรบูรณ์', '2026-07-10T09:00:00.000Z', '2026-07-10T10:00:00.000Z'),
  ('n3', 'โครงการอบรมเชิงปฏิบัติการการพัฒนาทักษะดิจิทัลเพื่อการเผยแผ่พระพุทธศาสนา', 'Workshop on Digital Skills for Propagation of Buddhism', 'digital-skills-workshop-buddhism-propagation', 'cat_activity', 'กิจกรรมวิทยาลัย', '["กิจกรรมนิสิต","เพชรบูรณ์"]', 0, '2569-07-20', '', '2026-08-01T08:00:00.000Z', '', 'อบรมเชิงปฏิบัติการเพื่อเสริมสร้างศักยภาพพระสังฆาธิการและนิสิตในการใช้สื่อดิจิทัลเพื่อการสื่อสารธรรมะอย่างสร้างสรรค์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง จัดโครงการอบรมการใช้เทคโนโลยีสารสนเทศ การตัดต่อวิดีโออย่างง่าย การผลิตสื่ออินโฟกราฟิกธรรมะ และการจัดการเนื้อหาสื่อออนไลน์ เพื่อสร้างศาสนบุคลากรยุคดิจิทัลที่มีความรู้ความเข้าใจ และสื่อสารธรรมะเข้าถึงคนรุ่นใหม่', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800', NULL, '["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"]', NULL, NULL, NULL, NULL, 'สโมสรนิสิต มจร เพชรบูรณ์', 'นายกสโมสรนิสิต', 'Scheduled', 42, NULL, 'อบรมทักษะดิจิทัลเผยแผ่ธรรมะ | มจร เพชรบูรณ์', 'การพัฒนาทักษะการผลิตสื่อดิจิทัลและการสื่อสารธรรมะ', 'ดิจิทัลธรรมะ, สื่อออนไลน์, อบรมพระสังฆาธิการ', '2026-07-20T08:00:00.000Z', '2026-07-20T08:00:00.000Z'),
  ('n4', 'รายงานผลการดำเนินงานโครงการบริการวิชาการแก่สังคม ประจำปี 2568 (ร่างรอการอนุมัติ)', 'Academic Social Service Annual Report 2025 (Draft)', 'academic-social-service-report-2025-draft', 'cat_academic', 'ข่าววิชาการ', '["วิชาการ"]', 0, '2569-07-21', '', '', '', 'สรุปโครงการส่งเสริมคุณธรรมและพัฒนาคุณภาพชีวิตชุมชนในเขตจังหวัดเพชรบูรณ์', 'เนื้อหารายงานผลการให้บริการวิชาการแก่ชุมชน ท้องถิ่น และศาสนสถานประจำปี อยู่ระหว่างการตรวจทานโดยคณะกรรมการวิชาการวิทยาลัย', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800', NULL, '[]', NULL, NULL, NULL, NULL, 'ผศ.ดร.อัครเดช บุนนาค', 'รองผู้อำนวยการฝ่ายวิชาการ', 'Pending Review', 12, NULL, 'รายงานการบริการวิชาการแก่สังคม 2568', 'สรุปโครงการบริการวิชาการ มจร เพชรบูรณ์', NULL, '2026-07-21T02:00:00.000Z', '2026-07-21T02:00:00.000Z');

-- ========================================================
-- Table structure & Data for `events` (6 records)
-- ========================================================
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `title` LONGTEXT NULL,
  `startDate` LONGTEXT NULL,
  `endDate` LONGTEXT NULL,
  `startTime` LONGTEXT NULL,
  `endTime` LONGTEXT NULL,
  `isAllDay` LONGTEXT NULL,
  `isMultiDay` LONGTEXT NULL,
  `recurrence` LONGTEXT NULL,
  `location` LONGTEXT NULL,
  `organizer` LONGTEXT NULL,
  `details` LONGTEXT NULL,
  `imageUrl` LONGTEXT NULL,
  `category` LONGTEXT NULL,
  `categoryLabel` LONGTEXT NULL,
  `color` LONGTEXT NULL,
  `onlineLink` LONGTEXT NULL,
  `meetingPlatform` LONGTEXT NULL,
  `registrationUrl` LONGTEXT NULL,
  `reminderMinutes` LONGTEXT NULL,
  `attachments` LONGTEXT NULL,
  `date` LONGTEXT NULL,
  `month` LONGTEXT NULL,
  `year` LONGTEXT NULL,
  `time` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `events` (`id`, `title`, `startDate`, `endDate`, `startTime`, `endTime`, `isAllDay`, `isMultiDay`, `recurrence`, `location`, `organizer`, `details`, `imageUrl`, `category`, `categoryLabel`, `color`, `onlineLink`, `meetingPlatform`, `registrationUrl`, `reminderMinutes`, `attachments`, `date`, `month`, `year`, `time`) VALUES
  ('e1', 'โครงการสัมมนาเชิงปฏิบัติการ ''การประกันคุณภาพการศึกษาภายในระดับหลักสูตร'' ประจำปีการศึกษา 2568', '2026-07-25', '2026-07-25', '09:00', '16:30', 0, 0, 'none', 'อาคารเรียนรวม ห้องประชุมหลวงพ่อคง ชั้น 2', 'สำนักงานประกันคุณภาพการศึกษา', 'โครงการประเมินศักยภาพและมาตรฐานหลักสูตร เพื่อรองรับมาตรฐานการศึกษาระดับกระทรวง สป.อว. พร้อมการบรรยายพิเศษจากวิทยากรผู้ทรงคุณวุฒิ', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'academic', 'งานวิชาการ', '#2563eb', 'https://zoom.us/j/9876543210', 'zoom', 'https://forms.google.com/sample-reg-1', 60, '[{"name":"กำหนดการสัมมนาประกันคุณภาพ_2568.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","size":"1.2 MB"}]', '25', 'ก.ค.', '2569', '09:00 น. - 16:30 น.'),
  ('e2', 'พิธีถวายเทียนจำนำพรรษาและผ้าอาบน้ำฝน เพื่อส่งเสริมบุญกิริยาวัตถุ ณ วัดป่าเขาอุ้มธรรม', '2026-07-28', '2026-07-28', '13:00', '17:00', 0, 0, 'yearly', 'วัดป่าเขาอุ้มธรรม ต.นาซำ อ.หล่มเก่า จ.เพชรบูรณ์', 'สโมสรนิสิต มจร เพชรบูรณ์', 'สโมสรนิสิตร่วมประสานงานพุทธศาสนิกชนท้องถิ่น สืบสานกิจกรรมประเพณีวัฒนธรรมอันดีงามในพุทธศาสน์เนื่องในวันเข้าพรรษา', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800', 'buddhism', 'ศาสนพิธี', '#d97706', '', NULL, '', 1440, '[]', '28', 'ก.ค.', '2569', '13:00 น. - 17:00 น.'),
  ('e3', 'มหกรรมเปิดรับสมัครนิสิตใหม่ ค่ายวิชาการและแนะแนวการศึกษาต่อระดับปริญญาตรี-โท-เอก', '2026-08-01', '2026-08-03', '08:30', '17:00', 1, 1, 'none', 'หอประชุมใหญ่ วิทยาลัยสงฆ์พ่อขุนผาเมือง และระบบออนไลน์', 'กลุ่มงานทะเบียนและวัดผล', 'กิจกรรมแนะแนวการศึกษาต่อ เปิดรับสมัครนิสิตใหม่พร้อมให้คำปรึกษาทุนการศึกษา บูธจัดแสดงผลงานวิชาการ และทดลองเรียนฟรี', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'admission', 'รับสมัครนิสิต', '#e11d48', 'https://meet.google.com/abc-defg-hij', 'google_meet', 'https://mcu.ac.th/admission/apply', 60, '[{"name":"แผ่นพับแนะแนวหลักสูตร2569.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","size":"3.5 MB"}]', '01', 'ส.ค.', '2569', 'ตลอดวัน (1-3 ส.ค. 2569)'),
  ('e4', 'การประชุมสภาวิทยาลัยสงฆ์พ่อขุนผาเมือง วาระพิเศษ ประจำเดือนสิงหาคม', '2026-08-10', '2026-08-10', '09:30', '12:00', 0, 0, 'monthly', 'ห้องประชุมผาเมือง ชั้น 3 และ Zoom Meeting', 'สำนักงานผู้อำนวยการวิทยาลัย', 'การประชุมสภาวิทยาลัยเพื่อพิจารณาอนุมัติหลักสูตรใหม่ และการพิจารณาตำแหน่งทางวิชาการของคณาจารย์', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 'meeting', 'การประชุม', '#059669', 'https://zoom.us/j/1234567890', 'zoom', '', 30, '[{"name":"ระเบียบวาระการประชุม_สิงหาคม2569.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","size":"850 KB"}]', '10', 'ส.ค.', '2569', '09:30 น. - 12:00 น.'),
  ('e5', 'โครงการอบรมพระธรรมวิทยากรและแผนงานยุทธศาสตร์การพัฒนาวิทยาลัยสงฆ์ ประจำปีการศึกษา 2569', '2026-08-20', '2026-08-22', '08:30', '16:30', 1, 1, 'none', 'อาคารเรียนรวมชั้น 3 วิทยาลัยสงฆ์พ่อขุนผาเมือง', 'สำนักวิชาการ วิทยาลัยสงฆ์พ่อขุนผาเมือง', 'โครงการขับเคลื่อนยุทธศาสตร์การพัฒนาการจัดการเรียนรู้พระพุทธศาสนาและนวัตกรรมการสอนของคณาจารย์ประจำปีการศึกษา 2569', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', 'academic', 'งานวิชาการ', '#2563eb', '', NULL, 'https://mcu.ac.th/academic/project2569', 60, '[]', '20', 'ส.ค.', '2569', '08:30 น. - 16:30 น. (20-22 ส.ค.)'),
  ('e6', 'พิธีประสาทปริญญาบัตร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประจำปีการศึกษา 2569', '2026-11-15', '2026-11-16', '07:00', '17:00', 1, 1, 'yearly', 'อาคาร มจร อ.วังน้อย จ.พระนครศรีอยุธยา', 'ส่วนงานบริหาร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', 'พิธีมอบปริญญาบัตรแก่ดุษฎีบัณฑิต มหาบัณฑิต และบัณฑิต ประจำปีการศึกษา 2569 พร้อมพิธีประสาทเข็มเกียรติคุณ', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 'ceremony', 'พิธีการทางวิชาการ', '#7c3aed', '', NULL, '', 1440, '[]', '15', 'พ.ย.', '2569', 'ตลอดวัน (15-16 พ.ย. 2569)');

-- ========================================================
-- Table structure & Data for `courses` (1 records)
-- ========================================================
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `code` LONGTEXT NULL,
  `name` LONGTEXT NULL,
  `nameEn` LONGTEXT NULL,
  `degree` LONGTEXT NULL,
  `degreeEn` LONGTEXT NULL,
  `duration` LONGTEXT NULL,
  `studyMode` LONGTEXT NULL,
  `qualification` LONGTEXT NULL,
  `estimatedFee` LONGTEXT NULL,
  `careerPath` LONGTEXT NULL,
  `level` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`id`, `code`, `name`, `nameEn`, `degree`, `degreeEn`, `duration`, `studyMode`, `qualification`, `estimatedFee`, `careerPath`, `level`) VALUES
  ('b1', 'B.A. RP', 'หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา', 'Bachelor of Arts Program in Religion and Philosophy', 'พุทธศาสตรบัณฑิต (พธ.บ.)', 'Bachelor of Arts (B.A.)', '4 ปี', 'ภาคปกติ (วันจันทร์ - พุธ)', '["สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.6) หรือเทียบเท่า","สำเร็จการศึกษาพระปริยัติธรรมแผนกธรรมชั้นเอก หรือแผนกบาลีประโยค 1-2 ขึ้นไป","เป็นภิกษุ สามเณร หรือคฤหัสถ์ทั่วไปที่มีความประพฤติเรียบร้อย"]', 'ประมาณ 2,500 - 3,500 บาท ต่อภาคการศึกษา', '["นักวิชาการศาสนาและปรัชญา","อาจารย์สอนศีลธรรมและวิชาสังคมศึกษา","บุคลากรในหน่วยงานภาครัฐและเอกชน","นักวิจัยด้านพุทธศาสนาและสังคมศาสตร์"]', 'bachelor');

-- ========================================================
-- Table structure & Data for `downloadCategories` (6 records)
-- ========================================================
DROP TABLE IF EXISTS `downloadCategories`;
CREATE TABLE `downloadCategories` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nameTh` LONGTEXT NULL,
  `nameEn` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `iconName` LONGTEXT NULL,
  `color` LONGTEXT NULL,
  `sortOrder` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `downloadCategories` (`id`, `nameTh`, `nameEn`, `description`, `iconName`, `color`, `sortOrder`) VALUES
  ('cat_student_forms', 'แบบฟอร์มคำร้องนิสิต', 'Student Forms & Petitions', 'ใบสมัครเรียน คำร้องทั่วไป คำร้องขอจบ และแบบฟอร์มฝ่ายกิจการนิสิต', 'FileText', '#2563eb', 1),
  ('cat_handbooks', 'คู่มือการศึกษาและแผนการเรียน', 'Handbooks & Study Plans', 'คู่มือนิสิต คู่มือการทำสารนิพนธ์/วิทยานิพนธ์ และแผนการศึกษาหลักสูตร', 'BookOpen', '#059669', 2),
  ('cat_regulations', 'ระเบียบ ข้อบังคับ และประกาศ', 'Regulations & Policies', 'ระเบียบมหาวิทยาลัย ข้อบังคับว่าด้วยวินัยนิสิต และประกาศเกณฑ์การศึกษา', 'ShieldAlert', '#d97706', 3),
  ('cat_staff_forms', 'แบบฟอร์มอาจารย์และบุคลากร', 'Faculty & Staff Forms', 'แบบฟอร์ม มคอ.3-มคอ.7 เอกสารเสนอโครงการ และแบบประเมินผลการสอน', 'Users', '#9333ea', 4),
  ('cat_academic_papers', 'เอกสารการวิจัยและผลงานวิชาการ', 'Academic Papers & Templates', 'แบบฟอร์มเสนอโครงการวิจัย แม่แบบบทความวิจัย และตารางคำนวณสถิติ', 'FileSpreadsheet', '#0284c7', 5),
  ('cat_media_brochures', 'สื่อประชาสัมพันธ์และดาวน์โหลดสื่อ', 'Brochures & Media Kits', 'แผ่นพับแนะแนวศึกษาต่อ โลโก้สถาบัน รูปภาพสื่อ และไฟล์บีบอัดชุดเครื่องมือ', 'Image', '#e11d48', 6);

-- ========================================================
-- Table structure & Data for `downloads` (13 records)
-- ========================================================
DROP TABLE IF EXISTS `downloads`;
CREATE TABLE `downloads` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `categoryId` LONGTEXT NULL,
  `categoryName` LONGTEXT NULL,
  `category` LONGTEXT NULL,
  `format` LONGTEXT NULL,
  `size` LONGTEXT NULL,
  `url` LONGTEXT NULL,
  `version` LONGTEXT NULL,
  `ownerDepartment` LONGTEXT NULL,
  `downloadPermission` LONGTEXT NULL,
  `publishDate` LONGTEXT NULL,
  `expiryDate` LONGTEXT NULL,
  `downloadCount` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `downloads` (`id`, `name`, `description`, `categoryId`, `categoryName`, `category`, `format`, `size`, `url`, `version`, `ownerDepartment`, `downloadPermission`, `publishDate`, `expiryDate`, `downloadCount`, `createdAt`) VALUES
  ('d_st1', 'แบบฟอร์มใบสมัครเรียนออนไลน์ ประจำปีการศึกษา 2569', 'ใบสมัครสำหรับผู้ประสงค์เข้าศึกษาต่อระดับปริญญาตรี ปริญญาโท และปริญญาเอก วิทยาลัยสงฆ์พ่อขุนผาเมือง', 'cat_student_forms', 'แบบฟอร์มคำร้องนิสิต', 'student', 'PDF', '450 KB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v2.0', 'กลุ่มงานทะเบียนและวัดผล', 'public', '2026-05-01', '2027-05-31', 384, '2026-05-01T08:00:00Z'),
  ('d_st2', 'คำร้องทั่วไปสำหรับนิสิตวิทยาลัยสงฆ์พ่อขุนผาเมือง', 'แบบฟอร์มยื่นคำร้องขอลาหยุด ขอลงทะเบียนล่าช้า ขอเปลี่ยนกลุ่มเรียน หรือคำร้องทั่วไป', 'cat_student_forms', 'แบบฟอร์มคำร้องนิสิต', 'student', 'DOCX', '120 KB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v1.2', 'กลุ่มงานทะเบียนและวัดผล', 'student', '2026-01-10', '', 215, '2026-01-10T09:30:00Z'),
  ('d_st3', 'คำร้องขอสำเร็จการศึกษาและขออนุมัติปริญญาบัตร (มจร.07)', 'แบบฟอร์มขออนุมัติสำเร็จการศึกษา ตรวจสอบเงื่อนไขหน่วยกิต และยื่นอนุมัติสภาสถาบัน', 'cat_student_forms', 'แบบฟอร์มคำร้องนิสิต', 'student', 'PDF', '350 KB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v1.0', 'กลุ่มงานทะเบียนและวัดผล', 'student', '2026-03-15', '', 142, '2026-03-15T11:00:00Z'),
  ('d_hb1', 'คู่มือนิสิตใหม่ วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ ปีการศึกษา 2569', 'คู่มือแนะแนวการปฏิบัติตน ระเบียบการแต่งกาย การใช้บริการห้องไลบรารี และทุนการศึกษา', 'cat_handbooks', 'คู่มือการศึกษาและแผนการเรียน', 'handbook', 'PDF', '4.8 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v2026.1', 'สำนักวิชาการ', 'public', '2026-06-01', '2027-06-01', 520, '2026-06-01T10:00:00Z'),
  ('d_hb2', 'คู่มือการจัดทำสารนิพนธ์และวิทยานิพนธ์พุทธศาสตรระดับบัณฑิตศึกษา พ.ศ. 2568', 'รูปแบบการพิมพ์ การอ้างอิงเชิงอรรถ บรรณานุกรม และหลักเกณฑ์การเขียนบทความวิจัยระดับสูง', 'cat_handbooks', 'คู่มือการศึกษาและแผนการเรียน', 'handbook', 'PDF', '3.5 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v3.0', 'สำนักวิชาการ', 'student', '2025-11-20', '', 310, '2025-11-20T14:00:00Z'),
  ('d_rg1', 'ระเบียบมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ว่าด้วยการศึกษาระดับปริญญาตรี พ.ศ. 2565', 'ฉบับสมบูรณ์ครอบคลุมการวัดผลประเมินผล เกณฑ์สอบได้/สอบตก การพ้นสภาพนิสิต', 'cat_regulations', 'ระเบียบ ข้อบังคับ และประกาศ', 'regulation', 'PDF', '1.2 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v1.0', 'สำนักงานผู้อำนวยการ', 'public', '2022-08-10', '', 680, '2022-08-10T09:00:00Z'),
  ('d_rg2', 'ข้อบังคับว่าด้วยความประพฤติและวินัยนิสิตวิทยาลัยสงฆ์ พ.ศ. 2567', 'เกณฑ์วินัยพระภิกษุสามเณรและคฤหัสถ์ บทลงโทษ และขั้นตอนการอุทธรณ์ทางวินัย', 'cat_regulations', 'ระเบียบ ข้อบังคับ และประกาศ', 'regulation', 'PDF', '850 KB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v1.1', 'สำนักงานผู้อำนวยการ', 'public', '2024-02-15', '', 290, '2024-02-15T08:00:00Z'),
  ('d_sf1', 'แบบฟอร์มรายงานผลสัมฤทธิ์การสอนวิชาการประจำภาคการศึกษา (มคอ.5)', 'แบบฟอร์มสรุปเกรด การประเมินผลการเรียนรู้ และรายงานปัญหาอุปสรรคการสอนสำหรับอาจารย์', 'cat_staff_forms', 'แบบฟอร์มอาจารย์และบุคลากร', 'staff', 'DOCX', '240 KB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v2.1', 'สำนักวิชาการ', 'staff', '2025-09-01', '', 185, '2025-09-01T08:00:00Z'),
  ('d_sf2', 'แบบเสนอขออนุมัติโครงการบริการวิชาการแก่ชุมชนและสังฆสมาคม', 'แบบฟอร์มขอตั้งงบประมาณ รายละเอียดกิจกรรม และตัวชีวัดสำเร็จของโครงการบริการวิชาการ', 'cat_staff_forms', 'แบบฟอร์มอาจารย์และบุคลากร', 'staff', 'DOCX', '180 KB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v1.0', 'กลุ่มงานบริการวิชาการ', 'staff', '2026-02-01', '', 96, '2026-02-01T10:00:00Z'),
  ('d_ac1', 'ตารางสรุปคำนวณภาระงานสอนและงานวิจัยอาจารย์ประจำ (Excel Template)', 'แผ่นตารางคำนวณอัตโนมัติสำหรับคำนวณสัดส่วนภาระงานสอนและสถิติบทความวิจัย', 'cat_academic_papers', 'เอกสารการวิจัยและผลงานวิชาการ', 'staff', 'XLSX', '520 KB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v1.5', 'สถาบันวิจัยพุทธศาสตร์', 'staff', '2026-04-10', '', 140, '2026-04-10T09:00:00Z'),
  ('d_ac2', 'สไลด์นำเสนอเทมเพลตมาตรฐานวิทยาลัยสงฆ์พ่อขุนผาเมือง (PowerPoint)', 'แม่แบบไฟล์นำเสนอผลงานสัมมนาวิชาการ พร้อมตราสัญลักษณ์ มจร เพชรบูรณ์ แบบทางการ', 'cat_academic_papers', 'เอกสารการวิจัยและผลงานวิชาการ', 'staff', 'PPTX', '8.4 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v2026', 'กลุ่มงานเทคโนโลยีสารสนเทศ', 'public', '2026-01-05', '', 420, '2026-01-05T12:00:00Z'),
  ('d_bc1', 'แผ่นพับแนะแนวศึกษาต่อ แหล่งทุน และหลักสูตรวิทยาลัยสงฆ์เพชรบูรณ์ ประจำปี 2569', 'แผ่นพับสี่สีสรุปรายละเอียดสาขาวิชา ค่าธรรมเนียมการศึกษา ทุนอุดหนุนสงฆ์ และขั้นตอนสมัคร', 'cat_media_brochures', 'สื่อประชาสัมพันธ์และดาวน์โหลดสื่อ', 'brochure', 'PDF', '2.1 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v1.0', 'กลุ่มงานประชาสัมพันธ์', 'public', '2026-05-10', '2027-05-10', 890, '2026-05-10T08:30:00Z'),
  ('d_media_zip', 'ชุดไฟล์โลโก้มหาจุฬาฯ และตราสัญลักษณ์วิทยาลัยสงฆ์พ่อขุนผาเมือง (ZIP Archive)', 'รวบรวมไฟล์ตราสัญลักษณ์ PNG โปร่งใส, Vector SVG, JPG ความละเอียดสูง สำหรับสื่อสิ่งพิมพ์', 'cat_media_brochures', 'สื่อประชาสัมพันธ์และดาวน์โหลดสื่อ', 'brochure', 'ZIP', '15.2 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'v2.0', 'กลุ่มงานประชาสัมพันธ์', 'public', '2026-02-14', '', 350, '2026-02-14T09:00:00Z');

-- ========================================================
-- Table structure & Data for `academic_works` (1 records)
-- ========================================================
DROP TABLE IF EXISTS `academic_works`;
CREATE TABLE `academic_works` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `category` LONGTEXT NULL,
  `titleTh` LONGTEXT NULL,
  `titleEn` LONGTEXT NULL,
  `authorTh` LONGTEXT NULL,
  `coAuthors` LONGTEXT NULL,
  `year` LONGTEXT NULL,
  `fundingSource` LONGTEXT NULL,
  `abstract` LONGTEXT NULL,
  `keywords` LONGTEXT NULL,
  `isPublished` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `academic_works` (`id`, `category`, `titleTh`, `titleEn`, `authorTh`, `coAuthors`, `year`, `fundingSource`, `abstract`, `keywords`, `isPublished`, `createdAt`) VALUES
  ('ac1', 'research', 'การศึกษาวิเคราะห์การบูรณาการหลักพุทธธรรมเพื่อส่งเสริมความสามัคคีในชุมชนจังหวัดเพชรบูรณ์', 'An Analytical Study of Integrating Buddhist Dhamma for Community Unity in Phetchabun Province', 'พระราชพัชรธรรมเมธี, ดร.', 'และคณะ', '2568', 'ทุนอุดหนุนสถาบันวิจัย มหาจุฬาลงกรณราชวิทยาลัย', 'งานวิจัยนี้มีวัตถุประสงค์เพื่อศึกษาบริบทของชุมชนและประยุกต์หลักพุทธธรรมสู่การสร้างกระบวนการมีส่วนร่วมของประชาชน...', 'พุทธธรรม, ความสามัคคี, ชุมชนเพชรบูรณ์', 1, '2026-07-21T00:00:00Z');

-- ========================================================
-- Table structure & Data for `applicants` (1 records)
-- ========================================================
DROP TABLE IF EXISTS `applicants`;
CREATE TABLE `applicants` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `program` LONGTEXT NULL,
  `firstName` LONGTEXT NULL,
  `lastName` LONGTEXT NULL,
  `phone` LONGTEXT NULL,
  `email` LONGTEXT NULL,
  `education` LONGTEXT NULL,
  `status` LONGTEXT NULL,
  `timestamp` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `applicants` (`id`, `program`, `firstName`, `lastName`, `phone`, `email`, `education`, `status`, `timestamp`) VALUES
  ('app_1', 'b1', 'นายวิชัย', 'รักเรียน', '089-999-9999', 'wichai@example.com', 'ม.6 หรือเทียบเท่า', 'pending', '2026-07-21T07:15:00.000Z');

-- ========================================================
-- Table structure & Data for `banners` (1 records)
-- ========================================================
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `titleTh` LONGTEXT NULL,
  `titleEn` LONGTEXT NULL,
  `subEn` LONGTEXT NULL,
  `descTh` LONGTEXT NULL,
  `descEn` LONGTEXT NULL,
  `image` LONGTEXT NULL,
  `bgClass` LONGTEXT NULL,
  `onlyImage` LONGTEXT NULL,
  `linkType` LONGTEXT NULL,
  `subTh` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `banners` (`id`, `titleTh`, `titleEn`, `subEn`, `descTh`, `descEn`, `image`, `bgClass`, `onlyImage`, `linkType`, `subTh`) VALUES
  ('banner_1', 'ยินดีต้อนรับสู่วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์', 'Welcome to Phokhun Phamuang Buddhist College, Phetchabun', 'Mahachulalongkornrajavidyalaya University', 'สถาบันอุดมศึกษาพระพุทธศาสนาชั้นนำของไทย มุ่งเน้นสร้างศาสนทายาทและพัฒนาระบบสังคมด้วยหลักพุทธธรรมและนวัตกรรมสร้างสรรค์', 'Thailand’s premier Buddhist university, dedicated to developing spiritual leaders and modern professionals with wisdom and ethics.', 'https://s.imgz.io/2026/07/19/ChatGPT-Image-9-..-2569-19_54_52-1c1a9e17891136e0a.jpg?auto=format&fit=crop&q=80&w=1600', 'bg-mcu-pink-deep/75', 0, 'viewDetails', 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย');

-- Table: settings (Empty)
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table structure & Data for `audit_logs` (4 records)
-- ========================================================
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `username` LONGTEXT NULL,
  `action` LONGTEXT NULL,
  `module` LONGTEXT NULL,
  `details` LONGTEXT NULL,
  `timestamp` LONGTEXT NULL,
  `ip` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`id`, `username`, `action`, `module`, `details`, `timestamp`, `ip`) VALUES
  ('log_1784688813146_587', 'admin', 'Login', 'Authentication', 'User logged in successfully', '2026-07-22T02:53:33.146Z', '127.0.0.1'),
  ('log_1784683290121_610', 'admin', 'Logout', 'Authentication', 'User logged out', '2026-07-22T01:21:30.121Z', '127.0.0.1'),
  ('log_1784683172855_441', 'admin', 'Login', 'Authentication', 'User logged in successfully', '2026-07-22T01:19:32.855Z', '127.0.0.1'),
  ('log_1', 'system', 'Initialization', 'System', 'Database initialized with secure seed data', '2026-07-21T12:00:00.000Z', '127.0.0.1');

-- ========================================================
-- Table structure & Data for `homepageSections` (20 records)
-- ========================================================
DROP TABLE IF EXISTS `homepageSections`;
CREATE TABLE `homepageSections` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `key` LONGTEXT NULL,
  `titleTh` LONGTEXT NULL,
  `titleEn` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `isVisible` LONGTEXT NULL,
  `order` LONGTEXT NULL,
  `config` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `homepageSections` (`id`, `key`, `titleTh`, `titleEn`, `description`, `isVisible`, `order`, `config`) VALUES
  ('sec_hero_slider', 'hero_slider', 'ภาพสไลด์ประชาสัมพันธ์', 'Hero Banner Slider', 'ส่วนแสดงสไลด์ภาพและแคมเปญหลักด้านบนสุดของเว็บไซต์', 1, 1, '{"autoplay":true,"intervalSeconds":5}'),
  ('sec_welcome_message', 'welcome_message', 'ข้อความต้อนรับจากผู้บริหาร', 'Welcome Message', 'สารจากผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง', 1, 2, '{"directorName":"พระครูศรีพัชโรทัย, ดร.","directorPosition":"ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง","directorAvatar":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400","welcomeTitle":"สาส์นจากผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง","welcomeExcerpt":"วิทยาลัยสงฆ์พ่อขุนผาเมือง มุ่งมั่นจัดการศึกษาวิชาการพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ เพื่อพัฒนาจิตใจและสังคมอย่างยั่งยืน"}'),
  ('sec_announcements', 'announcements', 'ประกาศสำคัญ', 'Important Announcements', 'แถบประกาศด่วน ข้อความวิ่ง หรือประกาศสำคัญประจำวัน', 1, 3, '{"badgeText":"ประกาศด่วน","announcementText":"เปิดรับสมัครนิสิตใหม่ ประจำปีการศึกษา 2569 ระดับปริญญาตรี โท เอก และหลักสูตรประกาศนียบัตร ตั้งแต่วันนี้เป็นต้นไป","linkUrl":"/admission"}'),
  ('sec_quick_links', 'quick_links', 'ปุ่มลิงก์ด่วน', 'Quick Links', 'ทางลัดเข้าสู่ระบบบริการออนไลน์สำหรับนิสิตและบุคลากร', 1, 4, '{"showTitle":true,"items":[{"title":"สมัครเรียนออนไลน์","url":"/admission/apply","icon":"UserPlus","color":"bg-pink-500"},{"title":"ระบบทะเบียนนิสิต","url":"https://reg.mcu.ac.th","icon":"GraduationCap","color":"bg-amber-500"},{"title":"ห้องดนตรี & ผลงานวิชาการ","url":"/academic","icon":"BookOpen","color":"bg-blue-500"},{"title":"ดาวน์โหลดเอกสาร","url":"/downloads","icon":"Download","color":"bg-emerald-500"}]}'),
  ('sec_banner', 'banner', 'แบนเนอร์ประชาสัมพันธ์', 'Promotional Banner', 'แบนเนอร์เน้นแคมเปญพิเศษหรือรับสมัครเรียน', 0, 5, '{"title":"เปิดรับสมัครนิสิตใหม่ ปีการศึกษา 2569","subtitle":"ปัญญา โลกสฺมิ ปชฺโชโต - ปัญญาเป็นแสงสว่างในโลก","buttonText":"สมัครเรียนเลย","buttonLink":"/admission/apply","bannerImage":"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200"}'),
  ('sec_featured_news', 'featured_news', 'ข่าวสารและกิจกรรมล่าสุด (ส่วนที่ 1: ข่าวเด่นและกิจกรรมไฮไลท์)', 'Latest News & Activities (Section 1: Featured Highlights)', 'ไฮไลท์ข่าวสารสำคัญ กิจกรรมเด่นรอบรั้ววิทยาลัยสงฆ์', 1, 6, '{"limit":6,"layout":"grid"}'),
  ('sec_latest_news', 'latest_news', 'ข่าวสารและกิจกรรมล่าสุด (ส่วนที่ 2: ข่าววิชาการ และบริการวิชาการ)', 'Latest News & Activities (Section 2: Academics & Research)', 'รายการข่าวประชาสัมพันธ์ วิชาการ บทความวิจัย และบริการสังคม', 1, 7, '{"limit":6}'),
  ('sec_recommended_courses', 'recommended_courses', 'หลักสูตรแนะนำ', 'Recommended Curricula', 'ตารางหลักสูตรการศึกษา ปริญญาตรี โท เอก และหลักสูตรประกาศนียบัตร', 1, 8, '{"showCategories":true}'),
  ('sec_upcoming_events', 'upcoming_events', 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์ (ส่วนที่ 1: กำหนดการและพิธีการเด่นประจำเดือน)', 'College Activity Calendar (Section 1: Monthly Agenda)', 'รายการกิจกรรม เสวนา อบรมวิชาการ และวันสำคัญทางศาสนาประจำเดือน', 1, 9, '{"limit":4}'),
  ('sec_event_calendar', 'event_calendar', 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์ (ส่วนที่ 2: กำหนดการและโครงการสำคัญประจำปีการศึกษา 2569)', 'College Activity Calendar (Section 2: Annual Academic Milestones)', 'ปฏิทินกิจกรรม การลงทะเบียน สอบวัดผล และโครงการประจำปีของวิทยาลัยสงฆ์', 1, 10, '{"showMonthView":true}'),
  ('sec_featured_staff', 'featured_staff', 'บุคลากรแนะนำ', 'Featured Personnel', 'แนะนําผู้บริหารและอาจารย์ประจำวิทยาลัย', 1, 11, '{"staffList":[{"name":"พระครูศรีพัชโรทัย, ดร.","position":"ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง","image":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300","degree":"พธ.ด. (พระพุทธศาสนา)"},{"name":"ผศ.ดร.อัครเดช บุนนาค","position":"รองผู้อำนวยการฝ่ายวิชาการ","image":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300","degree":"ปร.ด. (การบริหารการศึกษา)"},{"name":"พระมหาสมชาย สุขจิตฺโต","position":"อาจารย์ประจำหลักสูตรพุทธศาสตร์","image":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300","degree":"พธ.ม. (ปรัชญา)"}]}'),
  ('sec_document_downloads', 'document_downloads', 'ดาวน์โหลดเอกสาร', 'Document Downloads', 'เอกสารดาวน์โหลดสำหรับ นิสิต บุคลากร และระเบียบการ', 1, 12, '{"limit":5}'),
  ('sec_pr_video', 'pr_video', 'วิดีโอประชาสัมพันธ์', 'PR Video', 'วิดีโอแนะนําสถาบัน บรรยากาศการเรียนการสอน และกิจกรรม', 1, 13, '{"videoTitle":"แนะนำวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์","videoEmbedUrl":"https://www.youtube.com/embed/dQw4w9WgXcQ","description":"วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย มุ่งผลิตศาสนทายาทและสร้างสรรค์ปัญญาเพื่อสังคม"}'),
  ('sec_event_gallery', 'event_gallery', 'ภาพกิจกรรม', 'Event Gallery', 'ประมวลภาพบรรยากาศกิจกรรมงานพิธีและงานวิชาการ', 1, 14, '{"galleryImages":[{"title":"พิธีไหว้ครูและประธานปฐมนิเทศ","url":"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600"},{"title":"โครงการสัมมนาพระพุทธศาสนา","url":"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600"},{"title":"กิจกรรมทำบุญและธรรมสากัจฉา","url":"https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600"},{"title":"บรรยากาศการเรียนการสอนห้องปฏิบัติการ","url":"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600"}]}'),
  ('sec_key_stats', 'key_stats', 'ตัวเลขสถิติ', 'Key Statistics', 'ตัวเลขสรุปผลงาน จำนวนนิสิต คณาจารย์ และผลงานวิจัย', 1, 15, '{"style":"gold-pink"}'),
  ('sec_org_logo', 'org_logo', 'โลโก้หน่วยงาน', 'Organization Logo & Branding', 'ตราสัญลักษณ์ทางการและคติพจน์สถาบัน', 1, 16, '{"mottoTh":"ปัญญา โลกสฺมิ ปชฺโชโต (ปัญญาเป็นแสงสว่างในโลก)","mottoEn":"Wisdom is the Light of the World","subText":"มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์"}'),
  ('sec_affiliate_agencies', 'affiliate_agencies', 'หน่วยงานที่เกี่ยวข้อง', 'Affiliate Agencies', 'เครือข่ายสถาบัน องค์กรทางพระพุทธศาสนา และหน่วยงานพันธมิตร', 1, 17, '{"partners":[{"name":"มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","logo":"https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=200","url":"https://www.mcu.ac.th"},{"name":"สำนักงานพระพุทธศาสนาแห่งชาติ","logo":"https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=200","url":"https://www.onab.go.th"},{"name":"จังหวัดเพชรบูรณ์","logo":"https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=200","url":"http://www.phetchabun.go.th"},{"name":"สมาคมสภาการศึกษาพระพุทธศาสนา","logo":"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=200","url":"#"}]}'),
  ('sec_contact_channels', 'contact_channels', 'ช่องทางติดต่อ', 'Contact Channels', 'ข้อมูลการติดต่อสายตรง เบอร์โทรศัพท์ และสถานที่ตั้ง', 1, 18, '{"phone":"081-462-5663","email":"akkharadet.bun@mcu.ac.th","workingHours":"วันจันทร์ - ศุกร์ 08:30 - 16:30 น."}'),
  ('sec_google_map', 'google_map', 'แผนที่', 'Google Map Location', 'แผนที่นำทาง Google Map แสดงที่ตั้งวิทยาลัยสงฆ์พ่อขุนผาเมือง', 1, 19, '{"mapEmbedUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15317.935105220462!2d101.14!3d16.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTYgw40yNScwMC4wIk4gMTAxwrAwOCcwMC4wIkU!5e0!3m2!1sth!2sth!4v1650000000000!5m2!1sth!2sth","locationName":"วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์","address":"วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ เลขที่ 109/2 หมู่ 5 ต.ปากช่อง อ.หล่มสัก จ.เพชรบูรณ์ 67110"}'),
  ('sec_social_media', 'social_media', 'Social Media', 'Social Media Channels', 'ลิงก์ติดตามโซเชียลมีเดีย Facebook, Line, YouTube, TikTok', 1, 20, '{"facebook":"https://facebook.com/mcuphetchabun","line":"https://line.me/R/ti/p/@mcuphetchabun","youtube":"https://youtube.com","tiktok":"https://tiktok.com"}');

-- ========================================================
-- Table structure & Data for `announcements` (7 records)
-- ========================================================
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `title` LONGTEXT NULL,
  `titleEn` LONGTEXT NULL,
  `category` LONGTEXT NULL,
  `categoryLabel` LONGTEXT NULL,
  `announcementNo` LONGTEXT NULL,
  `publisher` LONGTEXT NULL,
  `isPinned` LONGTEXT NULL,
  `isUrgent` LONGTEXT NULL,
  `startDate` LONGTEXT NULL,
  `endDate` LONGTEXT NULL,
  `yearTh` LONGTEXT NULL,
  `excerpt` LONGTEXT NULL,
  `content` LONGTEXT NULL,
  `attachments` LONGTEXT NULL,
  `allowDownload` LONGTEXT NULL,
  `totalDownloads` LONGTEXT NULL,
  `viewCount` LONGTEXT NULL,
  `status` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`id`, `title`, `titleEn`, `category`, `categoryLabel`, `announcementNo`, `publisher`, `isPinned`, `isUrgent`, `startDate`, `endDate`, `yearTh`, `excerpt`, `content`, `attachments`, `allowDownload`, `totalDownloads`, `viewCount`, `status`, `createdAt`, `updatedAt`) VALUES
  ('anc_001', 'ประกาศเร่งด่วน: ปิดปรับปรุงระบบเครือข่ายอินเทอร์เน็ตและเซิร์ฟเวอร์สำนักบริการคอมพิวเตอร์ชั่วคราว', 'Urgent Notice: Temporary Network Maintenance and Server Service Interruption', 'urgent', 'ประกาศเร่งด่วน', 'วส.พม. รด. 001/2569', 'ศูนย์เทคโนโลยีสารสนเทศและคอมพิวเตอร์', 1, 1, '2026-07-20', '2026-07-25', '2569', 'เพื่อยกระดับความเร็วและมาตรฐานความปลอดภัยของระบบฐานข้อมูล จึงขอปิดปรับปรุงระบบอินเทอร์เน็ตและระบบทะเบียนเรียนชั่วคราว ในวันที่ 25 กรกฎาคม 2569 ตั้งแต่เวลา 22:00 น. ถึง 05:00 น.', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ขอแจ้งปิดปรับปรุงระบบเครือข่ายอินเทอร์เน็ตและเซิร์ฟเวอร์ศูนย์สารสนเทศเป็นการเร่งด่วน เพื่อทำการอัปเกรดแบนด์วิธและติดตั้งแพตช์ความปลอดภัยประจำไตรมาส\n\nระยะเวลาดำเนินการ:\nวันที่ 25 กรกฎาคม 2569 เวลา 22:00 น. - 05:00 น. (เช้าวันรุ่งขึ้น)\n\nระบบที่ไม่สามารถใช้งานได้ชั่วคราว:\n1. ระบบลงทะเบียนนิสิตออนไลน์ (REG MCU)\n2. ระบบส่งผลการเรียนอาจารย์\n3. สัญญาณ Wi-Fi อาคารเรียนรวมหลวงพ่อคง\n\nขออภัยในความไม่สะดวกมา ณ ที่นี้ หากมีข้อสงสัยเร่งด่วนกรุณาติดต่อเบอร์สายด่วนไอที 081-462-5663', '[{"id":"att_001_1","name":"ตารางเวลาการปิดปรับปรุงระบบ_ไอที_2569.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"pdf","size":"1.2 MB","downloadCount":142}]', 1, 142, 589, 'active', '2026-07-20T08:00:00.000Z', '2026-07-20T08:00:00.000Z'),
  ('anc_002', 'ประกาศประกวดราคาจ้างก่อสร้างอาคารปฏิบัติการศาสนกิจและปรับปรุงภูมิทัศน์ ด้วยวิธีประกวดราคาอิเล็กทรอนิกส์ (e-bidding)', 'E-Bidding Announcement for Construction of Religious Operation Building & Landscape Improvement', 'procurement', 'ประกาศจัดซื้อจัดจ้าง', 'วส.พม. พสด. 018/2569', 'งานพัสดุและอาคารสถานที่', 1, 0, '2026-07-10', '2026-08-15', '2569', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง มีความประสงค์จะประกวดราคาจ้างก่อสร้างอาคารปฏิบัติการศาสนกิจ ด้วยวิธี e-bidding ราคากลาง 18,500,000 บาท ผู้สนใจสามารถดาวน์โหลดเอกสารประกวดราคาได้ฟรี', 'ประกาศวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย\nเรื่อง ประกวดราคาจ้างก่อสร้างอาคารปฏิบัติการศาสนกิจและปรับปรุงภูมิทัศน์\n\nด้วย วิทยาลัยสงฆ์พ่อขุนผาเมือง มีความประสงค์จะประกวดราคาจ้างก่อสร้างอาคารปฏิบัติการศาสนกิจ ขนาด 3 ชั้น พร้อมตกแต่งภายในและงานภูมิทัศน์รอบอาคาร ด้วยวิธีประกวดราคาอิเล็กทรอนิกส์ (e-bidding)\n\nราคากลางของงานก่อสร้างในการประกวดราคาครั้งนี้ เป็นเงินทั้งสิ้น 18,500,000.- บาท (สิบแปดล้านห้าแสนบาทถ้วน)\n\nผู้ยื่นข้อเสนอต้องยื่นข้อเสนอและเสนอราคาทางระบบจัดซื้อจัดจ้างภาครัฐด้วยอิเล็กทรอนิกส์ ในวันที่ 12 สิงหาคม 2569 ระหว่างเวลา 08.30 น. ถึง 16.30 น.\nผู้สนใจสามารถขอรับเอกสารประกวดราคาอิเล็กทรอนิกส์ โดยดาวน์โหลดเอกสารผ่านทางระบบจัดซื้อจัดจ้างภาครัฐด้วยอิเล็กทรอนิกส์ได้ตั้งแต่วันที่ประกาศเป็นต้นไป', '[{"id":"att_002_1","name":"เอกสารประกวดราคา_e_bidding_อาคารศาสนกิจ.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"pdf","size":"4.5 MB","downloadCount":310},{"id":"att_002_2","name":"BOQ_ราคากลาง_และแบบแปลนก่อสร้าง.xlsx","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"xls","size":"2.1 MB","downloadCount":198}]', 1, 508, 1240, 'active', '2026-07-10T09:30:00.000Z', '2026-07-10T09:30:00.000Z'),
  ('anc_003', 'ประกาศผลการคัดเลือกผู้มีสิทธิ์เข้าศึกษาต่อและกำหนดการสอบสัมภาษณ์ ระดับปริญญาโท และปริญญาเอก ประจำปี 2569', 'Selection Results and Interview Schedule for Master''s and Doctoral Applicants Academic Year 2026', 'results', 'ประกาศผลการคัดเลือก', 'วส.พม. วิชาการ 022/2569', 'สำนักวิชาการและงานบัณฑิตศึกษา', 1, 0, '2026-07-01', '2026-08-31', '2569', 'ตรวจสอบรายชื่อผู้ผ่านการคัดเลือกเข้าศึกษาระดับบัณฑิตศึกษา สาขาวิชาพระพุทธศาสนา และสาขาการบริหารการศึกษา พร้อมกำหนดการรายงานตัวและสอบสัมภาษณ์ออนไลน์', 'ตามที่ วิทยาลัยสงฆ์พ่อขุนผาเมือง ได้ดำเนินการเปิดรับสมัครและคัดเลือกบุคคลเข้าศึกษาต่อระดับบัณฑิตศึกษา ประจำปีการศึกษา 2569 นั้น บัดนี้การพิจารณาคุณสมบัติขั้นต้นได้เสร็จสิ้นเรียบร้อยแล้ว\n\nจึงขอประกาศรายชื่อผู้มีสิทธิ์เข้าสอบสัมภาษณ์และสอบวัดความรู้พื้นฐานทางพระพุทธศาสนา ดังมีรายนามแนบท้ายประกาศนี้\n\nกำหนดการสอบสัมภาษณ์:\nวันที่ 5 สิงหาคม 2569 เวลา 09.00 น. ณ อาคารบัณฑิตศึกษา และผ่านระบบ Zoom Meeting\n\nเอกสารที่ต้องนำมาแสดงในวันสัมภาษณ์:\n1. บัตรประจำตัวประชาชน / บัตรสุทธิ\n2. ใบแสดงผลการเรียน (Transcript) ฉบับจริง\n3. สลิปชำระเงินค่าสมัคร', '[{"id":"att_003_1","name":"ประกาศรายชื่อผู้มีสิทธิ์สอบสัมภาษณ์_ป.โท_ป.เอก.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"pdf","size":"1.8 MB","downloadCount":275},{"id":"att_003_2","name":"ตารางสอบสัมภาษณ์และลิงก์Zoom_แบ่งตามสาขา.docx","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"doc","size":"850 KB","downloadCount":160}]', 1, 435, 980, 'active', '2026-07-01T10:00:00.000Z', '2026-07-01T10:00:00.000Z'),
  ('anc_004', 'ประกาศเปิดรับสมัครคัดเลือกบุคคลเข้าศึกษาต่อ ระดับปริญญาตรี ปริญญาโท และปริญญาเอก ประจำปีการศึกษา 2569', 'Official Announcement for Student Recruitment Year 2026 (Bachelor, Master, Doctorate)', 'admission', 'ประกาศรับสมัคร', 'วส.พม. รับสมัคร 005/2569', 'ฝ่ายรับสมัครและทะเบียนนิสิต', 0, 0, '2026-06-01', '2026-10-15', '2569', 'รายละเอียดการเปิดรับสมัครนิสิตใหม่ ทั้งบรรพชิตและคฤหัสถ์ พร้อมระเบียบการ คุณสมบัติผู้สมัคร และรายละเอียดทุนการศึกษาพระสงฆ์-สามเณร', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประกาศรับสมัครคัดเลือกบุคคลเข้าศึกษาต่อประจำปีการศึกษา 2569 โดยมีรายละเอียดดังนี้:\n\n1. หลักสูตรที่เปิดรับสมัคร:\n - พุทธศาสตรบัณฑิต (พธ.บ.) สาขาวิชาพระพุทธศาสนา\n - รัฐศาสตรบัณฑิต (ร.บ.) สาขาวิชารัฐศาสตร์\n - พุทธศาสตรมหาบัณฑิต (พธ.ม.) สาขาวิชาพระพุทธศาสนา\n - พุทธศาสตรดกษฎีบัณฑิต (พธ.ด.) สาขาวิชาพระพุทธศาสนา\n\n2. คุณสมบัติผู้สมัคร:\n - พระภิกษุ สามเณร นักธรรมชั้นเอก/บาลี หรือคฤหัสถ์สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือเทียบเท่า\n\n3. ทุนการศึกษา:\n - สนับสนุนทุนเรียนฟรีตลอดหลักสูตรสำหรับพระสังฆาธิการและสามเณรดีเด่น', '[{"id":"att_004_1","name":"ระเบียบการรับสมัครและคู่มือนิสิตใหม่_2569.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"pdf","size":"5.2 MB","downloadCount":612},{"id":"att_004_2","name":"ใบสมัครเข้าศึกษาต่อ_กรอกข้อมูลมือ.docx","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"doc","size":"620 KB","downloadCount":405}]', 1, 1017, 2150, 'active', '2026-06-01T08:30:00.000Z', '2026-06-01T08:30:00.000Z'),
  ('anc_005', 'ประกาศดาวน์โหลดเอกสารแบบฟอร์มขอเสนอโครงการวิจัย และขออนุมัติจัดโครงการอบรมคุณธรรม ประจำปี 2569', 'Download Notice for Research Project Proposal Forms and Ethical Training Approval Forms 2026', 'documents', 'ประกาศดาวน์โหลดเอกสาร', 'วส.พม. เอกสาร 012/2569', 'สถาบันวิจัยและส่งเสริมพระพุทธศาสนา', 0, 0, '2026-05-15', '2026-12-31', '2569', 'รวบรวมแบบฟอร์มขอรับทุนวิจัย แบบฟอร์มขอเสนอจริยธรรมการวิจัยในมนุษย์ และแบบฟอร์มขอจัดโครงการสำหรับคณาจารย์และนิสิต', 'สถาบันวิจัยและส่งเสริมพระพุทธศาสนา วิทยาลัยสงฆ์พ่อขุนผาเมือง ได้จัดทำและปรับปรุงชุดแบบฟอร์มเอกสารทางวิชาการและการขอทุนวิจัย ประจำปีงบประมาณ 2569 เพื่อให้มีความสะดวกและสอดคล้องกับมาตรฐานคุณภาพการวิจัย\n\nท่านสามารถดาวน์โหลดไฟล์เอกสารฉบับแก้ไขล่าสุด (Word & Excel) ด้านล่างนี้เพื่อนำไปกรอกข้อมูลเสนอโครงการ', '[{"id":"att_005_1","name":"แบบฟอร์มขอรับทุนวิจัย_สถาบันวิจัย_2569.docx","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"doc","size":"540 KB","downloadCount":380},{"id":"att_005_2","name":"ตารางคำนวณงบประมาณวิจัย_และประมาณการ.xlsx","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"xls","size":"1.1 MB","downloadCount":290},{"id":"att_005_3","name":"ชุดเอกสารทั้งหมด_ZIP_Archive.zip","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"zip","size":"8.4 MB","downloadCount":150}]', 1, 820, 1430, 'active', '2026-05-15T09:00:00.000Z', '2026-05-15T09:00:00.000Z'),
  ('anc_006', 'ประกาศกำหนดการสอบกลางภาค และแนวปฏิบัติการเข้าสอบของนิสิตบรรพชิตและคฤหัสถ์ ภาคการศึกษาที่ 1/2569', 'Midterm Examination Schedule and Examination Rules for Semester 1/2026', 'academic', 'ประกาศทางวิชาการ', 'วส.พม. วิชาการ 014/2569', 'ฝ่ายวิชาการและการจัดการเรียนรู้', 0, 0, '2026-08-01', '2026-09-30', '2569', 'ตารางสอบกลางภาคเรียนที่ 1/2569 สำหรับทุกชั้นปี พร้อมข้อปฏิบัติตามระเบียบมหาวิทยาลัยในการเข้าห้องสอบ', 'ประกาศฝ่ายวิชาการ เรื่อง ตารางสอบกลางภาคการศึกษาที่ 1/2569\n\nให้นิสิตทุกระดับชั้นปฏิบัติตามตารางสอบที่กำหนด และแต่งกายด้วยจีวร/ชุดนิสิตเรียบร้อย ห้ามนำโทรศัพท์มือถือเข้าห้องสอบโดยเด็ดขาด', '[{"id":"att_006_1","name":"ตารางสอบกลางภาค_ภาคเรียนที่1_2569.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"pdf","size":"2.3 MB","downloadCount":510}]', 1, 510, 1120, 'scheduled', '2026-07-18T11:00:00.000Z', '2026-07-18T11:00:00.000Z'),
  ('anc_007', 'ประกาศเรื่อง วันหยุดราชการและวันทำบุญใหญ่เนื่องในวันมาฆบูชา และพิธีเวียนเทียน ประจำปี 2568 (หมดอายุ)', 'Notice of Public Holiday for Makha Bucha Day 2025 (Expired Notice)', 'general', 'ประกาศทั่วไป', 'วส.พม. ทั่วไป 003/2568', 'สำนักงานผู้อำนวยการ', 0, 0, '2025-02-01', '2025-02-28', '2568', 'แจ้งวันหยุดทำการและกำหนดการร่วมงานทำบุญเวียนเทียนเนื่องในวันมาฆบูชา ณ พุทธมณฑลเพชรบูรณ์', 'ประกาศสำนักงานผู้อำนวยการ แจ้งวันหยุดเนื่องในวันมาฆบูชา ประจำปี 2568', '[{"id":"att_007_1","name":"กำหนดการวันมาฆบูชา_2568.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","fileType":"pdf","size":"980 KB","downloadCount":210}]', 0, 210, 640, 'expired', '2025-02-01T08:00:00.000Z', '2025-02-01T08:00:00.000Z');

-- ========================================================
-- Table structure & Data for `admission_projects` (3 records)
-- ========================================================
DROP TABLE IF EXISTS `admission_projects`;
CREATE TABLE `admission_projects` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `projectName` LONGTEXT NULL,
  `projectNameEn` LONGTEXT NULL,
  `recruitmentType` LONGTEXT NULL,
  `curriculumName` LONGTEXT NULL,
  `degreeLevel` LONGTEXT NULL,
  `qualifications` LONGTEXT NULL,
  `quotaSeats` LONGTEXT NULL,
  `startDate` LONGTEXT NULL,
  `endDate` LONGTEXT NULL,
  `applicationFee` LONGTEXT NULL,
  `prospectusUrl` LONGTEXT NULL,
  `prospectusName` LONGTEXT NULL,
  `enableOnlineApply` LONGTEXT NULL,
  `applyMethod` LONGTEXT NULL,
  `statusOverride` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL,
  `externalFormUrl` LONGTEXT NULL,
  `announcementResultsUrl` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admission_projects` (`id`, `projectName`, `projectNameEn`, `recruitmentType`, `curriculumName`, `degreeLevel`, `qualifications`, `quotaSeats`, `startDate`, `endDate`, `applicationFee`, `prospectusUrl`, `prospectusName`, `enableOnlineApply`, `applyMethod`, `statusOverride`, `description`, `createdAt`, `updatedAt`, `externalFormUrl`, `announcementResultsUrl`) VALUES
  ('proj_001', 'โครงการรับสมัครนิสิตใหม่ รอบโควตาพิเศษ และทุนการศึกษาพระสงฆ์-สามเณร ประจำปีการศึกษา 2569', 'Special Quota & Sangha Scholarship Admission Project 2026', 'โควตาพิเศษและทุนการศึกษา', 'พุทธศาสตรบัณฑิต (สาขาวิชาพระพุทธศาสนา)', 'bachelor', '["เป็นพระภิกษุ สามเณร หรือคฤหัสถ์ (ชาย-หญิง)","สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือเทียบเท่า หรือสอบได้นักธรรมชั้นเอก / บาลีสนามหลวง","มีความประพฤติเรียบร้อย สังกัดวัดถูกต้องตามพระธรรมวินัย"]', 40, '2026-05-01', '2026-08-31', 'ฟรี (ไม่มีค่าธรรมเนียมสมัคร)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ระเบียบการรับสมัครนิสิตใหม่_โควตาพิเศษ2569.pdf', 1, 'internal', 'auto', 'ทุนการศึกษาเรียนฟรีตลอดหลักสูตร 4 ปี สำหรับพระภิกษุสามเณรผู้มีผลการเรียนดีและอุทิศตนเพื่อพระพุทธศาสนา', '2026-05-01T08:00:00.000Z', '2026-05-01T08:00:00.000Z', NULL, NULL),
  ('proj_002', 'โครงการรับตรงทั่วไป ระดับปริญญาโท และปริญญาเอก สาขาวิชาพระพุทธศาสนา ประจำปีการศึกษา 2569', 'General Direct Admission for Master & Doctoral Programs 2026', 'รับตรงทั่วไป (บัณฑิตศึกษา)', 'พุทธศาสตรมหาบัณฑิต และ พุทธศาสตรดุษฎีบัณฑิต (สาขาวิชาพระพุทธศาสนา)', 'master', '["สำเร็จการศึกษาระดับปริญญาตรีหรือปริญญาโทจากสถาบันการศึกษาที่กระทรวงรับรอง","มีผลการเรียนเฉลี่ยสะสมไม่ต่ำกว่า 2.50","ผ่านการสัมภาษณ์และทดสอบความรู้พื้นฐานทางพระพุทธศาสนา"]', 25, '2026-06-01', '2026-09-15', '500 บาท', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ระเบียบการรับสมัครระดับบัณฑิตศึกษา2569.pdf', 1, 'external_form', 'auto', 'รับสมัครผู้สนใจศึกษาต่อเชิงลึกทางวิชาการพระพุทธศาสนา การวิจัย และนวัตกรรมเพื่อสังคม', '2026-06-01T09:00:00.000Z', '2026-06-01T09:00:00.000Z', 'https://docs.google.com/forms/d/e/1FAIpQLSc-sample/viewform', NULL),
  ('proj_003', 'โครงการรับสมัครหลักสูตรประกาศนียบัตรการบริหารกิจการคณะสงฆ์ (ป.บ.ส.) ประจำปี 2569', 'Sangha Administration Certificate Admission Program 2026', 'โครงการพิเศษสำหรับพระสังฆาธิการ', 'ประกาศนียบัตรการบริหารกิจการคณะสงฆ์ (ป.บ.ส.)', 'certificate', '["พระภิกษุสังฆาธิการ เจ้าอาวาส รองเจ้าอาวาส หรือเลขานุการวัด","ได้รับหนังสือยินยอมและอนุมัติจากเจ้าคณะปกครองต้นสังกัด"]', 50, '2026-04-01', '2026-06-30', 'ฟรี (ไม่มีค่าธรรมเนียม)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ระเบียบการสมัครประกาศนียบัตรปบส_2569.pdf', 1, 'internal', 'results', 'ประกาศผลการคัดเลือกเรียบร้อยแล้ว พระสังฆาธิการผู้ผ่านการคัดเลือกกรุณาตรวจสอบรายชื่อตามเอกสารแนบ', '2026-04-01T08:00:00.000Z', '2026-07-01T10:00:00.000Z', NULL, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- ========================================================
-- Table structure & Data for `curricula` (4 records)
-- ========================================================
DROP TABLE IF EXISTS `curricula`;
CREATE TABLE `curricula` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `code` LONGTEXT NULL,
  `nameTh` LONGTEXT NULL,
  `nameEn` LONGTEXT NULL,
  `degreeLevel` LONGTEXT NULL,
  `major` LONGTEXT NULL,
  `faculty` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `highlights` LONGTEXT NULL,
  `qualifications` LONGTEXT NULL,
  `structure` LONGTEXT NULL,
  `totalCredits` LONGTEXT NULL,
  `tuitionFee` LONGTEXT NULL,
  `duration` LONGTEXT NULL,
  `careerOpportunities` LONGTEXT NULL,
  `instructors` LONGTEXT NULL,
  `documents` LONGTEXT NULL,
  `applyUrl` LONGTEXT NULL,
  `applyMethod` LONGTEXT NULL,
  `status` LONGTEXT NULL,
  `coverImageUrl` LONGTEXT NULL,
  `galleryUrls` LONGTEXT NULL,
  `seo` LONGTEXT NULL,
  `name` LONGTEXT NULL,
  `degree` LONGTEXT NULL,
  `degreeEn` LONGTEXT NULL,
  `studyMode` LONGTEXT NULL,
  `qualification` LONGTEXT NULL,
  `estimatedFee` LONGTEXT NULL,
  `careerPath` LONGTEXT NULL,
  `level` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `curricula` (`id`, `code`, `nameTh`, `nameEn`, `degreeLevel`, `major`, `faculty`, `description`, `highlights`, `qualifications`, `structure`, `totalCredits`, `tuitionFee`, `duration`, `careerOpportunities`, `instructors`, `documents`, `applyUrl`, `applyMethod`, `status`, `coverImageUrl`, `galleryUrls`, `seo`, `name`, `degree`, `degreeEn`, `studyMode`, `qualification`, `estimatedFee`, `careerPath`, `level`, `createdAt`, `updatedAt`) VALUES
  ('curr_001', '01-BACHELOR', 'หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา', 'Bachelor of Arts in Buddhism (B.A. Buddhism)', 'bachelor', 'สาขาวิชาพระพุทธศาสนา', 'วิทยาลัยสงฆ์แพร่ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', 'หลักสูตรมุ่งสร้างบัณฑิตผู้มีความรู้ความเข้าใจในพระไตรปิฎก หลักธรรมทางพระพุทธศาสนา ประวัติศาสตร์ และการประยุกต์ใช้พุทธธรรมเพื่อการพัฒนาจิตใจ และสังคมร่วมสมัยอย่างยั่งยืน', '["เรียนฟรีตลอดหลักสูตร สำหรับพระภิกษุและสามเณร","บูรณาการวิชาการพระพุทธศาสนากับศาสตร์สมัยใหม่และการพัฒนามนุษย์","มีอาจารย์ผู้ทรงคุณวุฒิด้านพระไตรปิฎกและปรัชญาดูแลอย่างใกล้ชิด","สนับสนุนทุนการวิจัยและการเผยแผ่พระพุทธศาสนาทั้งในและต่างประเทศ"]', '["เป็นพระภิกษุ สามเณร หรือคฤหัสถ์ (ชาย-หญิง)","สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือเทียบเท่า หรือสอบได้นักธรรมชั้นเอก / บาลีสนามหลวง","มีความประพฤติเรียบร้อยตามพระธรรมวินัยและกฎระเบียบมหาวิทยาลัย"]', '[{"categoryName":"หมวดวิชาศึกษาทั่วไป (General Education)","creditAmount":30,"description":"ภาษาอังกฤษ คอมพิวเตอร์ สังคมศาสตร์ และมนุษยศาสตร์"},{"categoryName":"หมวดวิชาเฉพาะ (Core & Major Courses)","creditAmount":84,"description":"พระไตรปิฎกศึกษา ปรัชญาพุทธศาสนา ภาษาบาลี และวรรณคดีพุทธ"},{"categoryName":"หมวดวิชาเลือกเสรี (Free Electives)","creditAmount":6,"description":"วิชาเลือกตามความสนใจของผู้เรียน"}]', 120, 'ฟรีสำหรับพระภิกษุสามเณร / คฤหัสถ์ 6,500 บาทต่อภาคการศึกษา', '4 ปี (8 ภาคการศึกษา)', '["นักวิชาการด้านศาสนาและวัฒนธรรม","นักเผยแผ่พระพุทธศาสนา และพระธรรมทูต","อาจารย์ผู้สอนวิชาพระพุทธศาสนาและสังคมศึกษา","เจ้าหน้าที่ในหน่วยงานภาครัฐ มูลนิธิ และองค์กรไม่แสวงหาผลกำไร"]', '[{"name":"ผศ.ดร. สุจินต์ พิชิตชัย","title":"ผศ.ดร.","academicPosition":"อาจารย์ประจำหลักสูตร","email":"sujin@mcu.ac.th","avatarUrl":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}]', '[{"name":"แผ่นพับประชาสัมพันธ์หลักสูตรพุทธศาสตรบัณฑิต.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","format":"PDF","size":"2.4 MB"},{"name":"เล่มมคอ.2_หลักสูตรปรับปรุง2568.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","format":"PDF","size":"5.1 MB"}]', '/admission/apply', 'internal', 'active', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800', '["https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600","https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600"]', '{"title":"หลักสูตรพุทธศาสตรบัณฑิต | วิทยาลัยสงฆ์แพร่ มจร","description":"รับสมัครเข้าศึกษาต่อระดับปริญญาตรี สาขาวิชาพระพุทธศาสนา วิทยาลัยสงฆ์แพร่ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","keywords":"ปริญญาตรี, พระพุทธศาสนา, เรียนฟรี, วิทยาลัยสงฆ์แพร่, มจร แพร่"}', 'หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา', 'หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา', 'Bachelor of Arts in Buddhism (B.A. Buddhism)', '4 ปี (8 ภาคการศึกษา)', '["เป็นพระภิกษุ สามเณร หรือคฤหัสถ์ (ชาย-หญิง)","สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือเทียบเท่า หรือสอบได้นักธรรมชั้นเอก / บาลีสนามหลวง","มีความประพฤติเรียบร้อยตามพระธรรมวินัยและกฎระเบียบมหาวิทยาลัย"]', 'ฟรีสำหรับพระภิกษุสามเณร / คฤหัสถ์ 6,500 บาทต่อภาคการศึกษา', '["นักวิชาการด้านศาสนาและวัฒนธรรม","นักเผยแผ่พระพุทธศาสนา และพระธรรมทูต","อาจารย์ผู้สอนวิชาพระพุทธศาสนาและสังคมศึกษา","เจ้าหน้าที่ในหน่วยงานภาครัฐ มูลนิธิ และองค์กรไม่แสวงหาผลกำไร"]', 'bachelor', '2026-05-01T08:00:00.000Z', '2026-07-22T15:37:20.649Z'),
  ('curr_002', '02-MASTER', 'หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาพระพุทธศาสนา', 'Master of Arts in Buddhism (M.A. Buddhism)', 'master', 'สาขาวิชาพระพุทธศาสนา', 'วิทยาลัยสงฆ์แพร่ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', 'เน้นกระบวนการวิจัยขั้นสูง ค้นคว้าคำสอนพระพุทธศาสนาเชิงลึก เชื่อมโยงกับนวัตกรรมสังคมและการแก้ปัญหามนุษยชาติในโลกการเปลี่ยนแปลง', '["คณาจารย์ระดับศาสตราจารย์และรองศาสตราจารย์ดูแลวิทยานิพนธ์อย่างเข้มข้น","รองรับการตีพิมพ์บทความวิชาการในวารสาร TCI กลุ่ม 1","จัดสัมมนาวิชาการระดับชาติและนานาชาติอย่างต่อเนื่อง"]', '["สำเร็จการศึกษาระดับปริญญาตรีทุกสาขาวิชาจากสถาบันการศึกษาที่กระทรวงรับรอง","มีเกรดเฉลี่ยสะสมไม่ต่ำกว่า 2.50 หรือผ่านการพิจารณาของคณะกรรมการหลักสูตร"]', '[{"categoryName":"หมวดวิชาแกนหลัก (Core Courses)","creditAmount":12,"description":"สัมมนาพระไตรปิฎก และระเบียบวิธีวิจัยทางพระพุทธศาสนา"},{"categoryName":"หมวดวิชาเฉพาะสาขา (Specialized Courses)","creditAmount":12,"description":"พุทธปรัชญากับสังคมร่วมสมัย และการบริหารเชิงพุทธ"},{"categoryName":"วิทยานิพนธ์ (Thesis)","creditAmount":12,"description":"ทำวิทยานิพนธ์และตีพิมพ์เผยแพร่"}]', 36, '18,500 บาทต่อภาคการศึกษา', '2 ปี (4 ภาคการศึกษา)', '["นักวิจัยและนักวิชาการระดับสูงด้านพุทธศาสนาและปรัชญา","อาจารย์มหาวิทยาลัยและสถาบันอุดมศึกษา","ผู้บริหารองค์กรพุทธศาสนาและสังคมพัฒนา"]', '[{"name":"รศ.ดร. สุวิทย์ ธรรมธีโร","title":"รศ.ดร.","academicPosition":"ประธานหลักสูตรปริญญาโท","email":"suwit@mcu.ac.th","avatarUrl":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"}]', '[{"name":"โครงสร้างหลักสูตรพุทธศาสตรมหาบัณฑิต.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","format":"PDF","size":"3.2 MB"}]', '/admission/apply', 'internal', 'active', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800', '[]', '{"title":"ปริญญาโท พระพุทธศาสนา | วิทยาลัยสงฆ์แพร่ มจร","description":"ศึกษาต่อระดับปริญญาโท พุทธศาสตรมหาบัณฑิต สาขาวิชาพระพุทธศาสนา วิทยาลัยสงฆ์แพร่","keywords":"ปริญญาโท, มหาบัณฑิต, พระพุทธศาสนา, มจร แพร่"}', 'หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาพระพุทธศาสนา', 'พุทธศาสตรมหาบัณฑิต (พธ.ม.)', 'Master of Arts (M.A.)', 'เรียนเสาร์-อาทิตย์ (hybrid / on-site)', '["ปริญญาตรีทุกสาขา"]', '18,500 บาท / ภาคการศึกษา', '["นักวิจัย","อาจารย์มหาวิทยาลัย"]', 'master', '2026-06-01T08:00:00.000Z', '2026-06-01T08:00:00.000Z'),
  ('curr_003', '03-DOCTOR', 'หลักสูตรพุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระพุทธศาสนา', 'Doctor of Philosophy in Buddhism (Ph.D. Buddhism)', 'doctor', 'สาขาวิชาพระพุทธศาสนา', 'วิทยาลัยสงฆ์แพร่ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', 'หลักสูตรการศึกษาระดับสูงสุดเพื่อการสร้างองค์ความรู้ใหม่ นวัตกรรมทางปัญญา และนวัตกรรมสังคมพุทธธรรม', '["สร้างงานวิจัยระดับนวัตกรรมความรู้ทางพระพุทธศาสนา","ได้รับการนิเทศและที่ปรึกษาโดยผู้ทรงคุณวุฒิระดับประเทศ"]', '["สำเร็จการศึกษาระดับปริญญาโทจากสถาบันการศึกษาที่กระทรวงรับรอง","เสนอเค้าโครงการวิจัยเบื้องต้นเพื่อเข้ารับการสอบสัมภาษณ์"]', '[{"categoryName":"สัมมนาวิชาการขั้นสูง (Advanced Seminars)","creditAmount":12},{"categoryName":"ดุษฎีนิพนธ์ (Dissertation)","creditAmount":36}]', 48, '35,000 บาทต่อภาคการศึกษา', '3 ปี (6 ภาคการศึกษา)', '["ผู้เชี่ยวชาญอิสระและนักวิชาการระดับดุษฎีบัณฑิต","อาจารย์ระดับอุดมศึกษา และผู้ทรงคุณวุฒิด้านพุทธศาสนา"]', '[]', '[]', '/admission/apply', 'internal', 'active', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', '[]', '{}', 'หลักสูตรพุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระพุทธศาสนา', 'พุทธศาสตรดุษฎีบัณฑิต (พธ.ด.)', 'Doctor of Philosophy (Ph.D.)', 'การวิจัยและสัมมนาขั้นสูง', '["ปริญญาโททุกสาขา"]', '35,000 บาท / ภาคการศึกษา', '["ศาสตราจารย์","ผู้เชี่ยวชาญทางศาสนา"]', 'doctor', '2026-06-01T08:00:00.000Z', '2026-06-01T08:00:00.000Z'),
  ('curr_004', '04-CERTIFICATE', 'หลักสูตรประกาศนียบัตรการบริหารกิจการคณะสงฆ์ (ป.บ.ส.)', 'Certificate Program in Sangha Administration', 'certificate', 'การบริหารกิจการคณะสงฆ์', 'วิทยาลัยสงฆ์แพร่ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', 'หลักสูตรพัฒนาศักยภาพพระสังฆาธิการ เจ้าอาวาส และบุคลากรทางการปกครองคณะสงฆ์ ให้มีความรู้ด้านกฎหมาย ศาสนสมบัติ และเทคโนโลยีสารสนเทศ', '["หลักสูตรตรงสำหรับพระสังฆาธิการและเจ้าอาวาส","เรียนรู้เทคโนโลยีสมัยใหม่และการจัดการวัดอย่างโปร่งใส"]', '["เป็นพระภิกษุสังฆาธิการ เจ้าอาวาส รองเจ้าอาวาส หรือเลขาฯ วัด","ได้รับการอนุมัติจากเจ้าคณะปกครองต้นสังกัด"]', '[{"categoryName":"วิชาการบริหารการปกครองคณะสงฆ์","creditAmount":12},{"categoryName":"วิชาการศาสนศึกษาและการเผยแผ่","creditAmount":12},{"categoryName":"วิชาการสาธารณูปการและการศึกษาสงเคราะห์","creditAmount":6}]', 30, 'ฟรี (ไม่มีค่าธรรมเนียม)', '1 ปี (2 ภาคการศึกษา)', '["การบริหารกิจการคณะสงฆ์และการปกครองวัดอย่างมีประสิทธิภาพ"]', '[]', '[]', '/admission/apply', 'internal', 'active', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800', '[]', '{}', 'หลักสูตรประกาศนียบัตรการบริหารกิจการคณะสงฆ์ (ป.บ.ส.)', 'ประกาศนียบัตร (ป.บ.ส.)', 'Certificate in Sangha Admin', 'อบรมสัมมนาเสาร์-อาทิตย์', '["พระสังฆาธิการ / เจ้าอาวาส"]', 'ไม่มีค่าใช้จ่าย', '["เจ้าหน้าที่ปกครองคณะสงฆ์"]', 'certificate', '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z');

-- ========================================================
-- Table structure & Data for `personnel` (6 records)
-- ========================================================
DROP TABLE IF EXISTS `personnel`;
CREATE TABLE `personnel` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `prefixTh` LONGTEXT NULL,
  `firstNameTh` LONGTEXT NULL,
  `lastNameTh` LONGTEXT NULL,
  `prefixEn` LONGTEXT NULL,
  `firstNameEn` LONGTEXT NULL,
  `lastNameEn` LONGTEXT NULL,
  `position` LONGTEXT NULL,
  `academicPosition` LONGTEXT NULL,
  `department` LONGTEXT NULL,
  `workgroup` LONGTEXT NULL,
  `phone` LONGTEXT NULL,
  `email` LONGTEXT NULL,
  `avatarUrl` LONGTEXT NULL,
  `sortOrder` LONGTEXT NULL,
  `status` LONGTEXT NULL,
  `profileSlug` LONGTEXT NULL,
  `expertise` LONGTEXT NULL,
  `educationHistory` LONGTEXT NULL,
  `academicWorks` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `personnel` (`id`, `prefixTh`, `firstNameTh`, `lastNameTh`, `prefixEn`, `firstNameEn`, `lastNameEn`, `position`, `academicPosition`, `department`, `workgroup`, `phone`, `email`, `avatarUrl`, `sortOrder`, `status`, `profileSlug`, `expertise`, `educationHistory`, `academicWorks`, `createdAt`, `updatedAt`) VALUES
  ('staff_001', 'พระครูศรีพัชโรทัย, ดร.', 'สุรศักดิ์', 'พัชรสิริ', 'Phrakru Sripatcharothai, Ph.D.', 'Surasak', 'Patcharasiri', 'ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง', 'ผู้ช่วยศาสตราจารย์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์', 'กลุ่มงานบริหาร', '081-462-5663', 'surasak.pat@mcu.ac.th', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', 1, 'active', 'phrakru-sripatcharothai', '["ปรัชญาพระพุทธศาสนา","การบริหารการศึกษาพระพุทธศาสนา","วิปัสสนากรรมฐาน","การพัฒนาชุมชนเชิงพุทธ"]', '[{"id":"edu_1_1","degreeLevel":"ปริญญาเอก","degreeName":"พุทธศาสตรดุษฎีบัณฑิต (พธ.ด.)","major":"สาขาวิชาพระพุทธศาสนา","institution":"มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","yearGraduated":"2558"},{"id":"edu_1_2","degreeLevel":"ปริญญาโท","degreeName":"พุทธศาสตรมหาบัณฑิต (พธ.ม.)","major":"สาขาวิชาปรัชญา","institution":"มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","yearGraduated":"2552"},{"id":"edu_1_3","degreeLevel":"ปริญญาตรี","degreeName":"พุทธศาสตรบัณฑิต (พธ.บ.)","major":"สาขาวิชาพระพุทธศาสนา","institution":"มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","yearGraduated":"2547"},{"id":"edu_1_4","degreeLevel":"เปรียญธรรม","degreeName":"เปรียญธรรม 6 ประโยค (ป.ธ.6)","major":"ภาษาบาลีและพระไตรปิฎก","institution":"สำนักเรียนคณะจังหวัดเพชรบูรณ์","yearGraduated":"2542"}]', '[{"id":"pw_1_1","category":"research","titleTh":"การศึกษาวิเคราะห์การบูรณาการหลักพุทธธรรมเพื่อส่งเสริมความสามัคคีในชุมชนจังหวัดเพชรบูรณ์","titleEn":"An Analytical Study of Integrating Buddhist Dhamma for Community Unity in Phetchabun","year":"2568","publisherOrSource":"ทุนอุดหนุนสถาบันวิจัย มหาจุฬาลงกรณราชวิทยาลัย","isbnOrDoi":"DOI: 10.1234/mcu.2025.001","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","description":"งานวิจัยสร้างรูปแบบการน้อมนำหลักสาราณียธรรม 6 สู่การขับเคลื่อนกิจกรรมชุมชนคุณธรรม"},{"id":"pw_1_2","category":"article","titleTh":"การประยุกต์ใช้ภาวนา 4 ในการพัฒนาสุขภาวะของพระสังฆาธิการยุคดิจิทัล","titleEn":"Application of Bhavana 4 for Health Promotion of Sangha Administrators in Digital Era","year":"2567","publisherOrSource":"วารสาร มจร พุทธปัญญาปริทรรศน์ ปีที่ 9 ฉบับที่ 3 (TCI กลุ่ม 1)","isbnOrDoi":"ISSN: 2630-0125","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"},{"id":"pw_1_3","category":"book","titleTh":"พุทธธรรมเพื่อการบริหารองค์กรสงฆ์ยุคใหม่","titleEn":"Buddhist Principles for Modern Monastic Governance","year":"2566","publisherOrSource":"สำนักพิมพ์มหาจุฬาลงกรณราชวิทยาลัย","isbnOrDoi":"ISBN 978-616-300-123-4"},{"id":"pw_1_4","category":"textbook","titleTh":"ตำราวิชาการบริหารการศึกษาพระพุทธศาสนา","titleEn":"Textbook of Buddhist Educational Administration","year":"2565","publisherOrSource":"รหัสวิชา 102 304 วิทยาลัยสงฆ์พ่อขุนผาเมือง"},{"id":"pw_1_5","category":"teaching_material","titleTh":"เอกสารประกอบการสอนวิชาพระไตรปิฎกศึกษา","titleEn":"Course Material for Tipitaka Studies","year":"2566","publisherOrSource":"วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}]', '2026-01-10T08:00:00.000Z', '2026-07-21T10:00:00.000Z'),
  ('staff_002', 'ผศ.ดร.', 'อัครเดช', 'บุนนาค', 'Asst. Prof. Dr.', 'Akkharadet', 'Bunnag', 'รองผู้อำนวยการฝ่ายวิชาการ', 'ผู้ช่วยศาสตราจารย์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์', 'กลุ่มงานวิชาการ', '089-555-1234', 'akkharadet.bun@mcu.ac.th', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', 2, 'active', 'akkharadet-bunnag', '["การบริหารการศึกษา","รัฐประศาสนศาสตร์","เทคโนโลยีสารสนเทศเพื่อการเรียนรู้","การประกันคุณภาพการศึกษา"]', '[{"id":"edu_2_1","degreeLevel":"ปริญญาเอก","degreeName":"ปรัชญาดุษฎีบัณฑิต (ปร.ด.)","major":"สาขาวิชาการบริหารการศึกษา","institution":"มหาวิทยาลัยนเรศวร","yearGraduated":"2559"},{"id":"edu_2_2","degreeLevel":"ปริญญาโท","degreeName":"ศึกษาศาสตรมหาบัณฑิต (ศษ.ม.)","major":"สาขาวิชาเทคโนโลยีและสื่อสารการศึกษา","institution":"มหาวิทยาลัยเชียงใหม่","yearGraduated":"2553"},{"id":"edu_2_3","degreeLevel":"ปริญญาตรี","degreeName":"ครุศาสตรบัณฑิต (ค.บ.)","major":"สาขาวิชาคอมพิวเตอร์ศึกษา","institution":"มหาวิทยาลัยราชภัฏเพชรบูรณ์","yearGraduated":"2549"}]', '[{"id":"pw_2_1","category":"research","titleTh":"โมเดลการพัฒนาสมรรถนะการสอนดิจิทัลของอาจารย์มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","titleEn":"Digital Teaching Competency Model for Faculty Members of MCU","year":"2567","publisherOrSource":"ทุนวิจัยกองทุนส่งเสริมการวิจัย มจร","isbnOrDoi":"DOI: 10.5678/mcu.2024.015"},{"id":"pw_2_2","category":"article","titleTh":"นวัตกรรมการจัดการเรียนรู้ฐานเทคโนโลยีสำหรับนิสิตบรรพชิตในยุคปัญญาประดิษฐ์","titleEn":"AI-Driven Learning Innovations for Monastic Students in Higher Education","year":"2568","publisherOrSource":"วารสารครุศาสตร์ปริทรรศน์ ปีที่ 12 ฉบับที่ 1"},{"id":"pw_2_3","category":"textbook","titleTh":"ตำราเทคโนโลยีและนวัตกรรมการศึกษาเชิงพุทธ","titleEn":"Textbook of Educational Technology and Buddhist Innovations","year":"2566","publisherOrSource":"สำนักวิชาการ วิทยาลัยสงฆ์พ่อขุนผาเมือง"}]', '2026-01-15T09:00:00.000Z', '2026-07-20T11:00:00.000Z'),
  ('staff_003', 'พระมหาสมชาย', 'สมชาย', 'สุขจิตฺโต', 'Phramaha Samchai', 'Samchai', 'Sukhajitto', 'อาจารย์ประจำหลักสูตรพุทธศาสตรบัณฑิต', 'อาจารย์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์', 'กลุ่มงานวิชาการ', '081-999-8877', 'samchai.suk@mcu.ac.th', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', 3, 'active', 'phramaha-samchai', '["พระไตรปิฎกศึกษา","ภาษาบาลีและสันสกฤต","วรรณคดีพุทธศาสนา","การแปลพระสูตร"]', '[{"id":"edu_3_1","degreeLevel":"ปริญญาโท","degreeName":"พุทธศาสตรมหาบัณฑิต (พธ.ม.)","major":"สาขาวิชาปรัชญา","institution":"มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","yearGraduated":"2561"},{"id":"edu_3_2","degreeLevel":"ปริญญาตรี","degreeName":"พุทธศาสตรบัณฑิต (พธ.บ.)","major":"สาขาวิชาภาษาบาลี","institution":"มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย","yearGraduated":"2556"},{"id":"edu_3_3","degreeLevel":"เปรียญธรรม","degreeName":"เปรียญธรรม 9 ประโยค (ป.ธ.9)","major":"ภาษาบาลีและวรรณคดี","institution":"วัดมหาธาตุยุวราชรังสฤษฎิ์","yearGraduated":"2554"}]', '[{"id":"pw_3_1","category":"article","titleTh":"การวิเคราะห์ศัพท์ธรรมในอรรถกถาธัมมปทัฏฐกถาเพื่อการสั่งสอนศีลธรรม","titleEn":"Linguistic Analysis of Dhamma Terms in Dhammapada Commentary","year":"2567","publisherOrSource":"วารสารบัณฑิตศึกษามหาจุฬาปริทรรศน์"},{"id":"pw_3_2","category":"teaching_material","titleTh":"เอกสารประกอบการสอนวิชาไวยากรณ์บาลีเพื่อการแปล","titleEn":"Pali Grammar Courseware for Translation","year":"2566","publisherOrSource":"วิทยาลัยสงฆ์พ่อขุนผาเมือง"}]', '2026-02-01T10:00:00.000Z', '2026-07-22T15:36:18.531Z'),
  ('staff_004', 'นาง', 'บุณยนุช', 'สุนประโคน', 'Mrs.', 'Boonyanut', 'Sunprakhon', 'หัวหน้ากลุ่มงานทะเบียนและวัดผล', 'เจ้าหน้าที่บริหารงานทั่วไป ชำนาญการ', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์', 'งานทะเบียนและวัดผล', '086-333-2211', 'boonyanut.sun@mcu.ac.th', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', 4, 'active', 'boonyanut-sunprakhon', '["ระบบสารสนเทศทะเบียนนิสิต","การตรวจสอบคุณวุฒิและการสำเร็จการศึกษา","งานสารบรรณและระเบียบการศึกษา"]', '[{"id":"edu_4_1","degreeLevel":"ปริญญาโท","degreeName":"รัฐประศาสนศาสตรมหาบัณฑิต (ร.ม.)","major":"สาขาวิชาการบริหารภาครัฐและเอกชน","institution":"มหาวิทยาลัยรามคำแหง","yearGraduated":"2557"},{"id":"edu_4_2","degreeLevel":"ปริญญาตรี","degreeName":"วิทยาศาสตรบัณฑิต (วท.บ.)","major":"สาขาวิชาวิทยาการคอมพิวเตอร์","institution":"มหาวิทยาลัยราชภัฏเพชรบูรณ์","yearGraduated":"2551"}]', '[{"id":"pw_4_1","category":"teaching_material","titleTh":"คู่มือขั้นตอนการขอรับบริการทะเบียนและบริการนิสิตออนไลน์ REG MCU","titleEn":"Manual for Online Registrar System REG MCU Services","year":"2567","publisherOrSource":"สำนักวิชาการ วิทยาลัยสงฆ์พ่อขุนผาเมือง"}]', '2026-02-10T11:00:00.000Z', '2026-07-22T15:36:18.313Z'),
  ('staff_005', 'นาย', 'ธีรภาพ', 'พิพัฒนาการ', 'Mr.', 'Theerapat', 'Pipattanakan', 'หัวหน้างานพัสดุและอาคารสถานที่', 'นักจัดการงานทั่วไป', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์', 'งานพัสดุและอาคารสถานที่', '084-222-1100', 'theerapat.pip@mcu.ac.th', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', 5, 'active', 'theerapat-pipattanakan', '["การจัดซื้อจัดจ้างภาครัฐ e-GP","บริหารงานพัสดุและอาคารสถานที่","ความปลอดภัยและสิ่งแวดล้อมสถาบัน"]', '[{"id":"edu_5_1","degreeLevel":"ปริญญาตรี","degreeName":"บริหารธุรกิจบัณฑิต (บธ.บ.)","major":"สาขาวิชาการจัดการทั่วไป","institution":"มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี","yearGraduated":"2555"}]', '[]', '2026-03-01T08:00:00.000Z', '2026-07-01T10:00:00.000Z'),
  ('staff_006', 'รศ.ดร.', 'เกียรติศักดิ์', 'ประเสริฐยิ่ง', 'Assoc. Prof. Dr.', 'Kiattisak', 'Prasertying', 'อาจารย์พิเศษ และที่ปรึกษาด้านการวิจัย', 'รองศาสตราจารย์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์', 'กลุ่มงานวิชาการ', '081-888-7766', 'kiattisak.pra@mcu.ac.th', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', 6, 'on_leave', 'kiattisak-prasertying', '["สังคมวิทยาและมานุษยวิทยาศาสนา","ระเบียบวิธีวิจัยทางสังคมศาสตร์","พุทธชีวถิรภาพ"]', '[{"id":"edu_6_1","degreeLevel":"ปริญญาเอก","degreeName":"Ph.D. in Sociology","major":"Sociology of Religion","institution":"University of Delhi, India","yearGraduated":"2550"}]', '[{"id":"pw_6_1","category":"book","titleTh":"สังคมวิทยาพุทธศาสนาในประเทศไทย","titleEn":"Sociology of Buddhism in Thailand","year":"2564","publisherOrSource":"สำนักพิมพ์จุฬาลงกรณ์มหาวิทยาลัย","isbnOrDoi":"ISBN 978-616-400-555-1"}]', '2026-01-05T08:00:00.000Z', '2026-06-15T09:00:00.000Z');

-- ========================================================
-- Table structure & Data for `media_folders` (5 records)
-- ========================================================
DROP TABLE IF EXISTS `media_folders`;
CREATE TABLE `media_folders` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` LONGTEXT NULL,
  `parentId` LONGTEXT NULL,
  `color` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `media_folders` (`id`, `name`, `parentId`, `color`, `createdAt`) VALUES
  ('f_news', 'ภาพข่าวและกิจกรรม PR', NULL, '#ec4899', '2026-01-10T08:00:00.000Z'),
  ('f_personnel', 'รูปภาพบุคลากรอาจารย์', NULL, '#3b82f6', '2026-01-10T08:00:00.000Z'),
  ('f_academic', 'เอกสารผลงานวิชาการและวิจัย', NULL, '#10b981', '2026-01-10T08:00:00.000Z'),
  ('f_documents', 'แบบฟอร์มและคู่มือบริการ', NULL, '#f59e0b', '2026-01-10T08:00:00.000Z'),
  ('f_banners', 'ภาพแบนเนอร์สไลด์หน้าแรก', NULL, '#8b5cf6', '2026-01-10T08:00:00.000Z');

-- Table: media_settings (Empty)
DROP TABLE IF EXISTS `media_settings`;
CREATE TABLE `media_settings` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table structure & Data for `media` (5 records)
-- ========================================================
DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `filename` LONGTEXT NULL,
  `originalFilename` LONGTEXT NULL,
  `path` LONGTEXT NULL,
  `url` LONGTEXT NULL,
  `thumbnailUrl` LONGTEXT NULL,
  `webpUrl` LONGTEXT NULL,
  `mimeType` LONGTEXT NULL,
  `fileType` LONGTEXT NULL,
  `size` LONGTEXT NULL,
  `formattedSize` LONGTEXT NULL,
  `dimensions` LONGTEXT NULL,
  `folderId` LONGTEXT NULL,
  `altText` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `tags` LONGTEXT NULL,
  `storageProvider` LONGTEXT NULL,
  `isCompressed` LONGTEXT NULL,
  `originalSize` LONGTEXT NULL,
  `compressionRatio` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `media` (`id`, `filename`, `originalFilename`, `path`, `url`, `thumbnailUrl`, `webpUrl`, `mimeType`, `fileType`, `size`, `formattedSize`, `dimensions`, `folderId`, `altText`, `description`, `tags`, `storageProvider`, `isCompressed`, `originalSize`, `compressionRatio`, `createdAt`) VALUES
  ('m_1', 'ภาพกิจกรรมพิธีมอบปริญญาบัตรประจำปี_2569.webp', 'graduation_2026_hd.jpg', '/uploads/2026/01/graduation_2026.webp', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=300', '/uploads/2026/01/graduation_2026.webp', 'image/webp', 'image', 842000, '822 KB', '{"width":1920,"height":1080}', 'f_news', 'พิธีมอบปริญญาบัตร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', 'ภาพบรรยากาศพิธีประสาทปริญญาบัตร นิสิตระดับปริญญาตรี โท และเอก', '["พิธีพระราชทานปริญญาบัตร","ข่าวประชาสัมพันธ์","มจร"]', 'local', 1, 2450000, 65, '2026-01-15T10:30:00.000Z'),
  ('m_2', 'รูปประจำตัว_พระครูวิสุทธิ์พัชโรทัย.jpg', 'monk_profile_hd.png', '/uploads/2026/01/monk_profile.jpg', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', NULL, 'image/jpeg', 'image', 312000, '304 KB', '{"width":800,"height":800}', 'f_personnel', 'พระครูศรีพัชโรทัย, ดร. ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง', 'ภาพประจำตัวสำหรับการเผยแพร่ข้อมูลบุคลากรและทำเนียบผู้บริหาร', '["ผู้บริหาร","อาจารย์","บุคลากร"]', 'local', 1, 980000, 68, '2026-01-12T09:15:00.000Z'),
  ('m_3', 'คู่มือการลงทะเบียนเรียนและคู่มือนิสิต_2569.pdf', 'student_guidebook_2569.pdf', '/uploads/2026/01/student_guidebook_2569.pdf', '/uploads/2026/01/student_guidebook_2569.pdf', NULL, NULL, 'application/pdf', 'document', 3450000, '3.2 MB', NULL, 'f_documents', 'คู่มือนิสิต ประจำปีการศึกษา 2569', 'เอกสารคู่มือแนะนำหลักสูตร กฎระเบียบ ข้อบังคับ และขั้นตอนการลงทะเบียน', '["คู่มือนิสิต","ดาวน์โหลด","งานทะเบียน"]', 'local', 0, 3450000, 0, '2026-02-01T14:00:00.000Z'),
  ('m_4', 'แบนเนอร์ประชาสัมพันธ์เปิดรับสมัครนิสิตใหม่_2569.png', 'admission_banner_2569.png', '/uploads/2026/01/admission_banner_2569.png', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=300', NULL, 'image/png', 'image', 1250000, '1.19 MB', '{"width":1920,"height":600}', 'f_banners', 'แบนเนอร์รับสมัครนิสิตใหม่ ปริญญาตรี-โท-เอก ประจำปี 2569', 'ภาพแบนเนอร์ใหญ่สไลด์หน้าแรก เว็บไซต์วิทยาลัยสงฆ์พ่อขุนผาเมือง', '["แบนเนอร์","รับสมัคร","ปี2569"]', 'local', 1, 3800000, 67, '2026-02-10T11:20:00.000Z'),
  ('m_5', 'รายงานวิจัย_การพัฒนาคุณธรรมจริยธรรมในยุคดิจิทัล.pdf', 'research_morality_digital.pdf', '/uploads/2026/01/research_morality_digital.pdf', '/uploads/2026/01/research_morality_digital.pdf', NULL, NULL, 'application/pdf', 'document', 5200000, '4.9 MB', NULL, 'f_academic', 'งานวิจัยการพัฒนาคุณธรรมจริยธรรมดิจิทัล', 'รายงานฉบับสมบูรณ์ โครงการวิจัยเพื่อพัฒนานวัตกรรมส่งเสริมธรรมะและจริยธรรม', '["งานวิจัย","ผลงานวิชาการ","พุทธศาสนา"]', 'local', 0, 5200000, 0, '2026-03-05T16:45:00.000Z');

-- Table: roles (Empty)
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: permissions (Empty)
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: role_permissions (Empty)
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_roles (Empty)
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: pages (Empty)
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: page_revisions (Empty)
DROP TABLE IF EXISTS `page_revisions`;
CREATE TABLE `page_revisions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: menu_items (Empty)
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table structure & Data for `posts` (4 records)
-- ========================================================
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `title` LONGTEXT NULL,
  `titleEn` LONGTEXT NULL,
  `slug` LONGTEXT NULL,
  `category` LONGTEXT NULL,
  `categoryLabel` LONGTEXT NULL,
  `tags` LONGTEXT NULL,
  `isFeatured` LONGTEXT NULL,
  `date` LONGTEXT NULL,
  `publishedAt` LONGTEXT NULL,
  `scheduledAt` LONGTEXT NULL,
  `expiredAt` LONGTEXT NULL,
  `excerpt` LONGTEXT NULL,
  `content` LONGTEXT NULL,
  `imageUrl` LONGTEXT NULL,
  `albumTitle` LONGTEXT NULL,
  `galleryUrls` LONGTEXT NULL,
  `videoUrl` LONGTEXT NULL,
  `attachmentUrl` LONGTEXT NULL,
  `attachmentName` LONGTEXT NULL,
  `attachments` LONGTEXT NULL,
  `authorName` LONGTEXT NULL,
  `authorRole` LONGTEXT NULL,
  `status` LONGTEXT NULL,
  `viewCount` LONGTEXT NULL,
  `relatedNewsIds` LONGTEXT NULL,
  `seoTitle` LONGTEXT NULL,
  `seoDescription` LONGTEXT NULL,
  `seoKeywords` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `posts` (`id`, `title`, `titleEn`, `slug`, `category`, `categoryLabel`, `tags`, `isFeatured`, `date`, `publishedAt`, `scheduledAt`, `expiredAt`, `excerpt`, `content`, `imageUrl`, `albumTitle`, `galleryUrls`, `videoUrl`, `attachmentUrl`, `attachmentName`, `attachments`, `authorName`, `authorRole`, `status`, `viewCount`, `relatedNewsIds`, `seoTitle`, `seoDescription`, `seoKeywords`, `createdAt`, `updatedAt`) VALUES
  ('n1', 'เปิดรับสมัครนิสิตใหม่ระดับปริญญาตรี ปริญญาโท และปริญญาเอก ประจำปีการศึกษา 2569', 'Admissions Open for Undergraduate, Postgraduate and Doctoral Programs for Academic Year 2026', 'admissions-open-academic-year-2569', 'cat_admission', 'ข่าวการรับสมัคร', '["รับสมัคร2569","ทุนการศึกษา","เพชรบูรณ์"]', 1, '2569-07-15', '2026-07-15T09:00:00.000Z', '', '2026-10-31T23:59:59.000Z', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประกาศเปิดรับสมัครบุคคลเข้าศึกษาต่อประจำปีการศึกษา 2569 โดยครอบคลุมทั้งบรรพชิตและคฤหัสถ์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประกาศเปิดรับสมัครบุคคลเพื่อเข้าศึกษาต่อในระดับปริญญาตรี ปริญญาโท ปริญญาเอก และหลักสูตรประกาศนียบัตร ประจำปีการศึกษา 2569 โดยเปิดรับทั้งบรรพชิต (พระภิกษุ สามเณร) และคฤหัสถ์ (ประชาชนทั่วไป) โดยมุ่งเน้นการเสริมสร้างคุณธรรมความรู้ ทักษะทางวิชาการ และการฝึกปฏิบัติกรรมฐานอย่างถูกต้องสมบูรณ์ สามารถดาวน์โหลดคู่มือผู้สมัครและส่งใบสมัครได้ผ่านระบบทะเบียนออนไลน์ ได้รับการส่งเสริมทุนวิชาการสำหรับพระสังฆาธิการและสามเณรตลอดหลักสูตร\n\nการศึกษาเน้นสร้างปัญญาและศีลธรรม พร้อมสิ่งอำนวยความสะดวก อาคารเรียนรู้เทคโนโลยี และหอพักนิสิต', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800', 'ภาพบรรยากาศเปิดบ้านรับสมัครนิสิตใหม่ และห้องปฏิบัติการเรียนรู้', '["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800"]', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link', 'คู่มือการสมัครเรียนประจำปีการศึกษา_2569.pdf', '[{"id":"att1","name":"คู่มือการสมัครเรียนประจำปีการศึกษา_2569.pdf","url":"#","size":"1.8 MB","format":"PDF"},{"id":"att2","name":"แบบฟอร์มคำขอรับทุนการศึกษาพระภิกษุสามเณร.docx","url":"#","size":"340 KB","format":"DOCX"}]', 'งานประชาสัมพันธ์ วิทยาลัยสงฆ์พ่อขุนผาเมือง', 'เจ้าหน้าที่ประชาสัมพันธ์', 'Published', 384, '["n2","n3"]', 'เปิดรับสมัครนิสิตใหม่ 2569 | วิทยาลัยสงฆ์พ่อขุนผาเมือง มจร', 'สมัครเรียนปริญญาตรี โท เอก มหาจุฬาลงกรณราชวิทยาลัย เพชรบูรณ์ บรรพชิตและประชาชนทั่วไป', 'รับสมัครนิสิตใหม่, มจร เพชรบูรณ์, วิทยาลัยสงฆ์พ่อขุนผาเมือง, เรียนต่อปริญญาตรี', '2026-07-15T08:00:00.000Z', '2026-07-15T09:00:00.000Z'),
  ('n2', 'ขอเชิญร่วมงานสัมมนาวิชาการระดับชาติ ''พุทธธรรมกับนวัตกรรมทางสังคมและรัฐประศาสนศาสตร์''', 'National Academic Conference on Buddhism, Social Innovation and Public Administration', 'national-academic-conference-buddhism-social-innovation-2569', 'cat_academic', 'ข่าววิชาการ', '["วิชาการ","สัมมนา"]', 1, '2569-07-10', '2026-07-10T10:00:00.000Z', '', '', 'ฝ่ายวิชาการและการวิจัย ขอเชิญคณาจารย์ นิสิตนักศึกษา และผู้สนใจร่วมงานประชุมวิชาการระดับท้องถิ่นและระดับชาติ เพื่อการพัฒนาที่ยั่งยืน', 'ฝ่ายวิชาการและการวิจัย วิทยาลัยสงฆ์พ่อขุนผาเมือง ขอเรียนเชิญคณาจารย์ นักวิจัย นิสิตนักศึกษา และประชาชนทั่วไป เข้าร่วมการสัมมนาวิชาการระดับชาติ ประจำปี 2569 เพื่อนำเสนอบทความวิชาการ บทความวิจัยในหลากหลายศาสตร์ที่บูรณาการกับหลักธรรมทางพระพุทธศาสนา เพื่อผลักดันความรู้ใหม่สู่นวัตกรรมสังคม ท้องถิ่น และการบริหารกิจการภาครัฐ ในงานจะมีปาฐกถาพิเศษโดยวิทยากรผู้ทรงคุณวุฒิระดับชาติและพิธีมอบรางวัลงานวิจัยดีเด่น', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', 'ภาพบรรยากาศการสัมมนาวิชาการปีที่ผ่านมา', '["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"]', '', NULL, NULL, '[{"id":"att3","name":"กำหนดการสัมมนาวิชาการระดับชาติ_2569.pdf","url":"#","size":"820 KB","format":"PDF"}]', 'ฝ่ายวิชาการและงานวิจัย', 'ผู้ช่วยผู้อำนวยการฝ่ายวิชาการ', 'Published', 215, '["n1"]', 'สัมมนาวิชาการระดับชาติ พุทธธรรมและนวัตกรรมสังคม | มจร', 'การประชุมสัมมนาวิชาการระดับชาติ มอบรางวัลงานวิจัยดีเด่นและนำเสนอบทความวิจัย', 'งานวิจัยมจร, สัมมนาวิชาการ, พุทธศาสนิกชน, เพชรบูรณ์', '2026-07-10T09:00:00.000Z', '2026-07-10T10:00:00.000Z'),
  ('n3', 'โครงการอบรมเชิงปฏิบัติการการพัฒนาทักษะดิจิทัลเพื่อการเผยแผ่พระพุทธศาสนา', 'Workshop on Digital Skills for Propagation of Buddhism', 'digital-skills-workshop-buddhism-propagation', 'cat_activity', 'กิจกรรมวิทยาลัย', '["กิจกรรมนิสิต","เพชรบูรณ์"]', 0, '2569-07-20', '', '2026-08-01T08:00:00.000Z', '', 'อบรมเชิงปฏิบัติการเพื่อเสริมสร้างศักยภาพพระสังฆาธิการและนิสิตในการใช้สื่อดิจิทัลเพื่อการสื่อสารธรรมะอย่างสร้างสรรค์', 'วิทยาลัยสงฆ์พ่อขุนผาเมือง จัดโครงการอบรมการใช้เทคโนโลยีสารสนเทศ การตัดต่อวิดีโออย่างง่าย การผลิตสื่ออินโฟกราฟิกธรรมะ และการจัดการเนื้อหาสื่อออนไลน์ เพื่อสร้างศาสนบุคลากรยุคดิจิทัลที่มีความรู้ความเข้าใจ และสื่อสารธรรมะเข้าถึงคนรุ่นใหม่', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800', NULL, '["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"]', NULL, NULL, NULL, NULL, 'สโมสรนิสิต มจร เพชรบูรณ์', 'นายกสโมสรนิสิต', 'Scheduled', 42, NULL, 'อบรมทักษะดิจิทัลเผยแผ่ธรรมะ | มจร เพชรบูรณ์', 'การพัฒนาทักษะการผลิตสื่อดิจิทัลและการสื่อสารธรรมะ', 'ดิจิทัลธรรมะ, สื่อออนไลน์, อบรมพระสังฆาธิการ', '2026-07-20T08:00:00.000Z', '2026-07-20T08:00:00.000Z'),
  ('n4', 'รายงานผลการดำเนินงานโครงการบริการวิชาการแก่สังคม ประจำปี 2568 (ร่างรอการอนุมัติ)', 'Academic Social Service Annual Report 2025 (Draft)', 'academic-social-service-report-2025-draft', 'cat_academic', 'ข่าววิชาการ', '["วิชาการ"]', 0, '2569-07-21', '', '', '', 'สรุปโครงการส่งเสริมคุณธรรมและพัฒนาคุณภาพชีวิตชุมชนในเขตจังหวัดเพชรบูรณ์', 'เนื้อหารายงานผลการให้บริการวิชาการแก่ชุมชน ท้องถิ่น และศาสนสถานประจำปี อยู่ระหว่างการตรวจทานโดยคณะกรรมการวิชาการวิทยาลัย', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800', NULL, '[]', NULL, NULL, NULL, NULL, 'ผศ.ดร.อัครเดช บุนนาค', 'รองผู้อำนวยการฝ่ายวิชาการ', 'Pending Review', 12, NULL, 'รายงานการบริการวิชาการแก่สังคม 2568', 'สรุปโครงการบริการวิชาการ มจร เพชรบูรณ์', NULL, '2026-07-21T02:00:00.000Z', '2026-07-21T02:00:00.000Z');

-- Table: post_categories (Empty)
DROP TABLE IF EXISTS `post_categories`;
CREATE TABLE `post_categories` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: post_tags (Empty)
DROP TABLE IF EXISTS `post_tags`;
CREATE TABLE `post_tags` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: post_tag_relations (Empty)
DROP TABLE IF EXISTS `post_tag_relations`;
CREATE TABLE `post_tag_relations` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table structure & Data for `admissions` (3 records)
-- ========================================================
DROP TABLE IF EXISTS `admissions`;
CREATE TABLE `admissions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `projectName` LONGTEXT NULL,
  `projectNameEn` LONGTEXT NULL,
  `recruitmentType` LONGTEXT NULL,
  `curriculumName` LONGTEXT NULL,
  `degreeLevel` LONGTEXT NULL,
  `qualifications` LONGTEXT NULL,
  `quotaSeats` LONGTEXT NULL,
  `startDate` LONGTEXT NULL,
  `endDate` LONGTEXT NULL,
  `applicationFee` LONGTEXT NULL,
  `prospectusUrl` LONGTEXT NULL,
  `prospectusName` LONGTEXT NULL,
  `enableOnlineApply` LONGTEXT NULL,
  `applyMethod` LONGTEXT NULL,
  `statusOverride` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `updatedAt` LONGTEXT NULL,
  `externalFormUrl` LONGTEXT NULL,
  `announcementResultsUrl` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admissions` (`id`, `projectName`, `projectNameEn`, `recruitmentType`, `curriculumName`, `degreeLevel`, `qualifications`, `quotaSeats`, `startDate`, `endDate`, `applicationFee`, `prospectusUrl`, `prospectusName`, `enableOnlineApply`, `applyMethod`, `statusOverride`, `description`, `createdAt`, `updatedAt`, `externalFormUrl`, `announcementResultsUrl`) VALUES
  ('proj_001', 'โครงการรับสมัครนิสิตใหม่ รอบโควตาพิเศษ และทุนการศึกษาพระสงฆ์-สามเณร ประจำปีการศึกษา 2569', 'Special Quota & Sangha Scholarship Admission Project 2026', 'โควตาพิเศษและทุนการศึกษา', 'พุทธศาสตรบัณฑิต (สาขาวิชาพระพุทธศาสนา)', 'bachelor', '["เป็นพระภิกษุ สามเณร หรือคฤหัสถ์ (ชาย-หญิง)","สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือเทียบเท่า หรือสอบได้นักธรรมชั้นเอก / บาลีสนามหลวง","มีความประพฤติเรียบร้อย สังกัดวัดถูกต้องตามพระธรรมวินัย"]', 40, '2026-05-01', '2026-08-31', 'ฟรี (ไม่มีค่าธรรมเนียมสมัคร)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ระเบียบการรับสมัครนิสิตใหม่_โควตาพิเศษ2569.pdf', 1, 'internal', 'auto', 'ทุนการศึกษาเรียนฟรีตลอดหลักสูตร 4 ปี สำหรับพระภิกษุสามเณรผู้มีผลการเรียนดีและอุทิศตนเพื่อพระพุทธศาสนา', '2026-05-01T08:00:00.000Z', '2026-05-01T08:00:00.000Z', NULL, NULL),
  ('proj_002', 'โครงการรับตรงทั่วไป ระดับปริญญาโท และปริญญาเอก สาขาวิชาพระพุทธศาสนา ประจำปีการศึกษา 2569', 'General Direct Admission for Master & Doctoral Programs 2026', 'รับตรงทั่วไป (บัณฑิตศึกษา)', 'พุทธศาสตรมหาบัณฑิต และ พุทธศาสตรดุษฎีบัณฑิต (สาขาวิชาพระพุทธศาสนา)', 'master', '["สำเร็จการศึกษาระดับปริญญาตรีหรือปริญญาโทจากสถาบันการศึกษาที่กระทรวงรับรอง","มีผลการเรียนเฉลี่ยสะสมไม่ต่ำกว่า 2.50","ผ่านการสัมภาษณ์และทดสอบความรู้พื้นฐานทางพระพุทธศาสนา"]', 25, '2026-06-01', '2026-09-15', '500 บาท', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ระเบียบการรับสมัครระดับบัณฑิตศึกษา2569.pdf', 1, 'external_form', 'auto', 'รับสมัครผู้สนใจศึกษาต่อเชิงลึกทางวิชาการพระพุทธศาสนา การวิจัย และนวัตกรรมเพื่อสังคม', '2026-06-01T09:00:00.000Z', '2026-06-01T09:00:00.000Z', 'https://docs.google.com/forms/d/e/1FAIpQLSc-sample/viewform', NULL),
  ('proj_003', 'โครงการรับสมัครหลักสูตรประกาศนียบัตรการบริหารกิจการคณะสงฆ์ (ป.บ.ส.) ประจำปี 2569', 'Sangha Administration Certificate Admission Program 2026', 'โครงการพิเศษสำหรับพระสังฆาธิการ', 'ประกาศนียบัตรการบริหารกิจการคณะสงฆ์ (ป.บ.ส.)', 'certificate', '["พระภิกษุสังฆาธิการ เจ้าอาวาส รองเจ้าอาวาส หรือเลขานุการวัด","ได้รับหนังสือยินยอมและอนุมัติจากเจ้าคณะปกครองต้นสังกัด"]', 50, '2026-04-01', '2026-06-30', 'ฟรี (ไม่มีค่าธรรมเนียม)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ระเบียบการสมัครประกาศนียบัตรปบส_2569.pdf', 1, 'internal', 'results', 'ประกาศผลการคัดเลือกเรียบร้อยแล้ว พระสังฆาธิการผู้ผ่านการคัดเลือกกรุณาตรวจสอบรายชื่อตามเอกสารแนบ', '2026-04-01T08:00:00.000Z', '2026-07-01T10:00:00.000Z', NULL, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- ========================================================
-- Table structure & Data for `activity_logs` (4 records)
-- ========================================================
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `username` LONGTEXT NULL,
  `action` LONGTEXT NULL,
  `module` LONGTEXT NULL,
  `details` LONGTEXT NULL,
  `timestamp` LONGTEXT NULL,
  `ip` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activity_logs` (`id`, `username`, `action`, `module`, `details`, `timestamp`, `ip`) VALUES
  ('log_1784688813146_587', 'admin', 'Login', 'Authentication', 'User logged in successfully', '2026-07-22T02:53:33.146Z', '127.0.0.1'),
  ('log_1784683290121_610', 'admin', 'Logout', 'Authentication', 'User logged out', '2026-07-22T01:21:30.121Z', '127.0.0.1'),
  ('log_1784683172855_441', 'admin', 'Login', 'Authentication', 'User logged in successfully', '2026-07-22T01:19:32.855Z', '127.0.0.1'),
  ('log_1', 'system', 'Initialization', 'System', 'Database initialized with secure seed data', '2026-07-21T12:00:00.000Z', '127.0.0.1');

-- ========================================================
-- Table structure & Data for `login_logs` (1 records)
-- ========================================================
DROP TABLE IF EXISTS `login_logs`;
CREATE TABLE `login_logs` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `userId` LONGTEXT NULL,
  `username` LONGTEXT NULL,
  `timestamp` LONGTEXT NULL,
  `ip` LONGTEXT NULL,
  `userAgent` LONGTEXT NULL,
  `device` LONGTEXT NULL,
  `status` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `login_logs` (`id`, `userId`, `username`, `timestamp`, `ip`, `userAgent`, `device`, `status`) VALUES
  ('log_hist_1784734426915_919', 'u1', 'akkharadet', '2026-07-22T15:33:46.915Z', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'Windows PC', 'failed_password');

-- ========================================================
-- Table structure & Data for `login_history` (1 records)
-- ========================================================
DROP TABLE IF EXISTS `login_history`;
CREATE TABLE `login_history` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `userId` LONGTEXT NULL,
  `username` LONGTEXT NULL,
  `timestamp` LONGTEXT NULL,
  `ip` LONGTEXT NULL,
  `userAgent` LONGTEXT NULL,
  `device` LONGTEXT NULL,
  `status` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `login_history` (`id`, `userId`, `username`, `timestamp`, `ip`, `userAgent`, `device`, `status`) VALUES
  ('log_hist_1784734426915_919', 'u1', 'akkharadet', '2026-07-22T15:33:46.915Z', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'Windows PC', 'failed_password');

-- ========================================================
-- Table structure & Data for `notifications` (9 records)
-- ========================================================
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `type` LONGTEXT NULL,
  `title` LONGTEXT NULL,
  `message` LONGTEXT NULL,
  `severity` LONGTEXT NULL,
  `sourceType` LONGTEXT NULL,
  `sourceId` LONGTEXT NULL,
  `link` LONGTEXT NULL,
  `targetRoles` LONGTEXT NULL,
  `isRead` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `emailStatus` LONGTEXT NULL,
  `emailRecipient` LONGTEXT NULL,
  `emailTemplateId` LONGTEXT NULL,
  `emailSentAt` LONGTEXT NULL,
  `readAt` LONGTEXT NULL,
  `emailError` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `severity`, `sourceType`, `sourceId`, `link`, `targetRoles`, `isRead`, `createdAt`, `emailStatus`, `emailRecipient`, `emailTemplateId`, `emailSentAt`, `readAt`, `emailError`) VALUES
  ('notif_seed_1', 'pending_review', 'มีเนื้อหาใหม่รอการตรวจสอบอนุมัติ', 'อาจารย์ ดร. สมชาย เพิ่มบทความ "ผลงานวิจัยธรรมะประยุกต์ยุคดิจิทัล" รอการตรวจสอบเนื้อหาจากผู้ดูแลระบบ', 'warning', 'academic', 'ac_101', '/admin?tab=academic', '["Super Admin","Admin","Editor"]', 0, '2026-07-22T15:03:46.915Z', 'queued', 'editor.mbc@mcu.ac.th', 'tpl_pending_review', NULL, NULL, NULL),
  ('notif_seed_2', 'approved', 'เนื้อหาข่าวสารได้รับการอนุมัติแล้ว', 'ข่าว "พิธีไหว้ครูประเพณี ประจำปีการศึกษา 2569" ผ่านการอนุมัติและเผยแพร่ลงหน้าเว็บไซต์เรียบร้อยแล้ว', 'success', 'news', 'news_202', '/admin?tab=news', '["Author","Editor"]', 0, '2026-07-22T13:33:46.915Z', 'sent', 'author.mbc@mcu.ac.th', 'tpl_content_approved', '2026-07-22T13:35:46.915Z', NULL, NULL),
  ('notif_seed_3', 'returned_for_revision', 'เนื้อหาประกาศถูกส่งกลับแก้ไข', 'ประกาศ "กำหนดการลงทะเบียนเรียนภาคค่ำ" ถูกส่งกลับเนื่องจากรูปแบบไฟล์ PDF แนบไม่ชัดเจน', 'error', 'announcement', 'anc_303', '/admin?tab=announcements', '["Author","Editor"]', 0, '2026-07-22T11:33:46.915Z', 'sent', 'staff.mbc@mcu.ac.th', 'tpl_returned_revision', '2026-07-22T11:38:46.915Z', NULL, NULL),
  ('notif_seed_4', 'expiring_soon', 'ประกาศเรื่องทุนการศึกษาใกล้หมดอายุ', 'ประกาศ "ทุนการศึกษาเฉลิมพระเกียรติ ประจำปี 2569" จะหมดอายุการแสดงผลในอีก 2 วัน', 'warning', 'announcement', 'anc_404', '/admin?tab=announcements', '["Super Admin","Admin","Editor"]', 0, '2026-07-22T09:33:46.915Z', 'queued', 'admin.mbc@mcu.ac.th', 'tpl_expiring_soon', NULL, NULL, NULL),
  ('notif_seed_5', 'admission_closing', 'โครงการรับสมัครนิสิตระดับปริญญาตรี ใกล้ปิดรับสมัคร', 'โครงการรับสมัครนิสิตใหม่ รอบที่ 1 (TCAS69) จะปิดรับสมัครในวันที่ 25 กรกฎาคม 2569 นี้', 'warning', 'admission', 'adm_505', '/admin?tab=admission_manager', '["Super Admin","Admin"]', 0, '2026-07-22T07:13:46.915Z', 'queued', 'academic.mbc@mcu.ac.th', 'tpl_admission_closing', NULL, NULL, NULL),
  ('notif_seed_6', 'event_upcoming', 'กิจกรรมเสวนาพระพุทธศาสนาใกล้ถึงวันจัดงาน', 'กิจกรรม "สัมมนาวิชาการพระไตรปิฎกศึกษา" จะจัดขึ้นในวันที่ 28 กรกฎาคม 2569 ณ หอประชุมสถาบัน', 'info', 'event', 'ev_606', '/admin?tab=events', '["Super Admin","Admin","Editor"]', 1, '2026-07-22T03:53:46.915Z', 'sent', 'events.mbc@mcu.ac.th', 'tpl_event_upcoming', '2026-07-22T04:03:46.915Z', '2026-07-22T05:33:46.915Z', NULL),
  ('notif_seed_7', 'failed_logins', 'ตรวจพบการกรอกรหัสผ่านผิดหลายครั้ง', 'IP 182.52.12.99 พยายามเข้าสู่ระบบด้วยชื่อผู้ใช้ "editor_test" ผิดพลาดติดต่อกัน 5 ครั้ง (ระบบบล็อก IP ชั่วคราว)', 'error', 'security', 'sec_707', '/admin?tab=users_rbac', '["Super Admin","Admin"]', 0, '2026-07-22T15:18:46.915Z', 'queued', 'security.mbc@mcu.ac.th', 'tpl_failed_logins', NULL, NULL, NULL),
  ('notif_seed_8', 'critical_setting_changed', 'มีการแก้ไขข้อมูลการตั้งค่าความปลอดภัยระบบ', 'ผู้ดูแลระบบ Super Admin ได้ทำการปรับเปลี่ยนพารามิเตอร์ SMTP และนโยบายการล็อกเอาต์ผู้ใช้งาน', 'warning', 'settings', 'set_808', '/admin?tab=settings', '["Super Admin"]', 1, '2026-07-21T19:33:46.915Z', 'sent', 'superadmin.mbc@mcu.ac.th', 'tpl_critical_settings', '2026-07-21T19:43:46.915Z', '2026-07-21T22:53:46.915Z', NULL),
  ('notif_seed_9', 'upload_failed', 'มีไฟล์อัปโหลดล้มเหลว (Upload Failure)', 'ผู้ใช้พยายามอัปโหลดไฟล์ "annual_report_2026.pdf" แต่ขนาดไฟล์เกินขีดจำกัดที่กำหนด (15MB > 10MB)', 'error', 'upload', 'up_909', '/admin?tab=media', '["Super Admin","Admin","Editor"]', 0, '2026-07-22T14:48:46.915Z', 'failed', 'admin.mbc@mcu.ac.th', 'tpl_upload_failed', NULL, NULL, 'SMTP server response code 550 - recipient address rejected');

-- Table: trash_items (Empty)
DROP TABLE IF EXISTS `trash_items`;
CREATE TABLE `trash_items` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: content_revisions (Empty)
DROP TABLE IF EXISTS `content_revisions`;
CREATE TABLE `content_revisions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table structure & Data for `sessions` (2 records)
-- ========================================================
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `token` LONGTEXT NULL,
  `userId` LONGTEXT NULL,
  `username` LONGTEXT NULL,
  `role` LONGTEXT NULL,
  `name` LONGTEXT NULL,
  `email` LONGTEXT NULL,
  `createdAt` LONGTEXT NULL,
  `lastActiveAt` LONGTEXT NULL,
  `expiresAt` LONGTEXT NULL,
  `ip` LONGTEXT NULL,
  `userAgent` LONGTEXT NULL,
  `device` LONGTEXT NULL,
  `customPermissions` LONGTEXT NULL,
  `permissions` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sessions` (`id`, `token`, `userId`, `username`, `role`, `name`, `email`, `createdAt`, `lastActiveAt`, `expiresAt`, `ip`, `userAgent`, `device`, `customPermissions`, `permissions`) VALUES
  ('sess_1784735085145_3125', '06191c71fb30c9cd36dc235e74f3a0624aa6eaba55bbd8d75630fdaf588c0c9e', 'u1', 'admin', 'Super Admin', 'พระมหาสมชาย สุขจิตฺโต (Super Admin)', 'superadmin@mcu.ac.th', '2026-07-22T15:44:45.145Z', 1784735085145, 1784821485145, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'Desktop PC', '["view","create","edit_own","edit_all","delete","publish","approve","export","manage_users","manage_settings"]', '["view","create","edit_own","edit_all","delete","publish","approve","export","manage_users","manage_settings"]'),
  ('sess_1784814448602_2470', '93b319016aa801d2ed23709fb884448df7b9801d34b269864895020a0bcd739b', 'u1', 'admin', 'Super Admin', 'พระมหาสมชาย สุขจิตฺโต (Super Admin)', 'superadmin@mcu.ac.th', '2026-07-23T13:47:28.602Z', 1784814448602, 1784900848602, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'Desktop PC', '["view","create","edit_own","edit_all","delete","publish","approve","export","manage_users","manage_settings"]', '["view","create","edit_own","edit_all","delete","publish","approve","export","manage_users","manage_settings"]');

SET FOREIGN_KEY_CHECKS = 1;
