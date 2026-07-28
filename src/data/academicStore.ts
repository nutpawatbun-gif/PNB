/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AcademicWork, AcademicCategory } from '../types';

const STORAGE_KEY = 'mcu_academic_data';

export const initialAcademicData: AcademicWork[] = [
  {
    id: 'acad_1',
    category: 'research',
    titleTh: 'การศึกษาประวัติศาสตร์พระพุทธศาสนาและวัฒนธรรมท้องถิ่นในเขตอำเภอหล่มเก่า จังหวัดเพชรบูรณ์',
    titleEn: 'A Study of Buddhist History and Local Culture in Lom Kao District, Phetchabun Province',
    authorTh: 'พระสุธีวชิราภรณ์, ผศ.ดร.',
    coAuthors: 'ดร.อัครเดช บุณยเวช, นางสาวดวงใจ แก้วสะอาด',
    year: '2568',
    fundingSource: 'ทุนวิจัยสถาบันวิจัยพุทธศาสตร์ มหาจุฬาลงกรณราชวิทยาลัย',
    abstract: 'งานวิจัยนี้มีวัตถุประสงค์เพื่อศึกษาประวัติศาสตร์ความเป็นมาของพระพุทธศาสนาและวิถีวัฒนธรรมท้องถิ่นในเขตอำเภอหล่มเก่า จังหวัดเพชรบูรณ์ เพื่อนำข้อมูลที่ได้มาสังเคราะห์และพัฒนาเป็นหลักสูตรท้องถิ่นและการท่องเที่ยวเชิงวัฒนธรรม ผลการศึกษาพบว่าพุทธศาสนาในดินแดนหล่มเก่ามีความผูกพันกับกลุ่มชาติพันธุ์ไทหล่มมาอย่างยาวนาน มีประเพณีที่สำคัญคือประเพณีบุญบั้งไฟ และประเพณีตักบาตรข้าวเหนียว ซึ่งสะท้อนหลักธรรมทางศาสนาในการสามัคคีและทานบารมีอย่างเด่นชัด โดยการประยุกต์ใช้ทุนทางศาสนานี้จะเพิ่มขีดความสามารถการอนุรักษ์ประเพณีดั้งเดิม',
    keywords: 'พระพุทธศาสนา, วัฒนธรรมไทหล่ม, เพชรบูรณ์, ท่องเที่ยวเชิงวัฒนธรรม',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    attachmentUrl: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link',
    isPublished: true,
    createdAt: '2026-07-21T00:00:00.000Z'
  },
  {
    id: 'acad_2',
    category: 'research_article',
    titleTh: 'แนวทางการส่งเสริมจริยธรรมของเยาวชนตามหลักพุทธธรรมในศตวรรษที่ 21',
    titleEn: 'Guidelines for Promoting Youth Ethics According to Buddhist Dhamma in the 21st Century',
    authorTh: 'ดร.วิชัย พันธุ์คง',
    coAuthors: 'พระมหาประเสริฐ สุจิตฺโต',
    journalName: 'วารสารพุทธจักร วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    journalDetails: 'ปีที่ 10 ฉบับที่ 2 (กุมภาพันธ์ - พฤษภาคม 2568) หน้า 120-135',
    databaseIndex: 'TCI กลุ่ม 1',
    year: '2568',
    abstract: 'บทความวิจัยนี้ศึกษาปัญหาเชิงพฤติกรรมจริยธรรมของเยาวชนในยุคดิจิทัล และเสนอแนะแนวทางส่งเสริมจริยธรรมตามพุทธวิธี โดยประยุกต์ใช้หลักกัลยาณมิตตาและสัปปุริสธรรม ผลการศึกษาเชิงปริมาณและเชิงคุณภาพในสถานศึกษาเขตจังหวัดเพชรบูรณ์ พบว่าเยาวชนต้องการต้นแบบทางจริยธรรมที่เป็นมิตรและการเรียนรู้ผ่านกิจกรรมแบบมีส่วนร่วมมากกว่าการบรรยายในห้องเรียนเฉยๆ',
    keywords: 'จริยธรรมเยาวชน, พุทธธรรม, ศตวรรษที่ 21, กัลยาณมิตร',
    doiOrUrl: 'https://so05.tci-thaijo.org/index.php/mcuphetchabun',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    attachmentUrl: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link',
    isPublished: true,
    createdAt: '2026-07-20T00:00:00.000Z'
  },
  {
    id: 'acad_3',
    category: 'academic_article',
    titleTh: 'พระพุทธศาสนากับการเยียวยาจิตใจในสังคมหลังวิกฤตการณ์สุขภาพ',
    titleEn: 'Buddhism and Mental Healing in Post-Health Crisis Society',
    authorTh: 'พระครูสุตพัชรานุกูล',
    coAuthors: '',
    journalName: 'วารสารวิชาการมนุษยศาสตร์และสังคมศาสตร์ มหาจุฬาลงกรณราชวิทยาลัย',
    journalDetails: 'ปีที่ 15 ฉบับที่ 1 (มกราคม - มิถุนายน 2567) หน้า 55-68',
    year: '2567',
    abstract: 'บทความวิชาการนี้นำเสนอการวิเคราะห์สัจธรรมทางพระพุทธศาสนาเรื่อง อริยสัจ 4 และการฝึกสติอานาปานสติในการเยียวยาฟื้นฟูสภาพจิตใจของผู้คนในสังคมที่ได้รับผลกระทบจากวิกฤตเศรษฐกิจและสังคมหลังโรคระบาด การประยุกต์ใช้พุทธธรรมช่วยปรับมุมมองความคิด (โยนิโสมนสิการ) ให้เกิดความยืดหยุ่นและก้าวผ่านความทุกข์ได้',
    keywords: 'จิตบำบัดแนวพุทธ, อริยสัจ 4, การมีสติ, สังคมยุคใหม่',
    doiOrUrl: 'https://tci-thaijo.org/mcu',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    isPublished: true,
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'acad_4',
    category: 'book',
    titleTh: 'หลักการสืบค้นและศึกษาคัมภีร์พระไตรปิฎกฉบับภาษาไทย',
    authorTh: 'ผศ.ดร.ประเสริฐ แสนวิเศษ',
    coAuthors: 'พระมหาสมบูรณ์ วุฑฺฒิกโร',
    publisher: 'สำนักพิมพ์วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    year: '2567',
    edition: 'พิมพ์ครั้งที่ 3',
    isbn: '978-616-432-125-9',
    abstract: 'คู่มือสำคัญสำหรับนิสิตและนักวิชาการในการสืบค้นข้อมูลเชิงพุทธศาสตร์อิงกับคัมภีร์พระไตรปิฎกฉบับสยามรัฐ ฉบับมหาจุฬาลงกรณราชวิทยาลัย และการใช้งานระบบสารสนเทศพระไตรปิฎกออนไลน์ พร้อมวิธีการเปรียบเทียบข้ออรรถธรรมที่ถูกต้องตามหลักภาษาบาลีและอักษรไทย',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    doiOrUrl: 'https://phetchabun.mcu.ac.th',
    attachmentUrl: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link',
    isPublished: true,
    createdAt: '2026-07-10T00:00:00.000Z'
  },
  {
    id: 'acad_5',
    category: 'textbook',
    titleTh: 'ตำราวิชา พระพุทธศาสนากับการบริหารและการจัดการร่วมสมัย',
    authorTh: 'ผศ.ดร.จตุรัส พัฒนพงษ์',
    courseName: 'พระพุทธศาสนากับการบริหารร่วมสมัย',
    courseCode: 'พธ 4022',
    curriculum: 'หลักสูตรรัฐศาสตรบัณฑิต คณะสังคมศาสตร์',
    year: '2566',
    abstract: 'ตำราวิชาสำหรับประกอบการเรียนการสอนในระดับปริญญาตรี คณะสังคมศาสตร์ โดยอธิบายการนำหลักพุทธธรรม เช่น สังคหวัตถุ 4 พรหมวิหาร 4 และสาราณียธรรม 6 มาประยุกต์ร่วมกับทฤษฎีการจัดการยุคใหม่ เช่น OKRs, Agile, และ Lean Management เพื่อนำไปสู่ธรรมาภิบาลและความยั่งยืนในองค์กรพุทธศาสนาและวิสาหกิจทั่วไป',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    attachmentUrl: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link',
    isPublished: true,
    createdAt: '2026-07-05T00:00:00.000Z'
  },
  {
    id: 'acad_6',
    category: 'teaching_material',
    titleTh: 'เอกสารประกอบการสอน รายวิชา ประวัติพุทธศาสนาในประเทศไทย (พธ 2011)',
    authorTh: 'พระครูอมรพัชรสาร, ดร.',
    year: '2568',
    courseName: 'ประวัติพุทธศาสนาในประเทศไทย',
    courseCode: 'พธ 2011',
    curriculum: 'หลักสูตรพุทธศาสตรบัณฑิต คณะพุทธศาสตร์',
    semesterAndYear: 'ภาคการศึกษาที่ 1 ปีการศึกษา 2568',
    abstract: 'เอกสารนำเสนอเนื้อหาประวัติศาสตร์พุทธศาสนาในดินแดนไทย ตั้งแต่ยุคสุวรรณภูมิ ทวารวดี ศรีวิชัย สุโขทัย อยุธยา ธนบุรี จนถึงยุครัตนโกสินทร์ มุ่งเน้นการวิเคราะห์พัฒนาการของคณะสงฆ์ การปฏิรูปศาสนา และบทบาทพุทธศาสนาต่อสังคมไทยในมิติต่าง ๆ พร้อมมีคำถามประเมินผลท้ายบทเรียนเพื่อความเข้าใจในพุทธศิลป์และวัฒนธรรมไทย',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    attachmentUrl: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link',
    isPublished: true,
    createdAt: '2026-07-01T00:00:00.000Z'
  }
];

// Initialize local storage if not present
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAcademicData));
  }
}

let listeners: (() => void)[] = [];

export const academicStore = {
  getWorks(): AcademicWork[] {
    if (typeof window === 'undefined') return initialAcademicData;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialAcademicData;
  },
  
  saveWorks(works: AcademicWork[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
      listeners.forEach(listener => listener());
    }
  },
  
  addWork(work: Omit<AcademicWork, 'id' | 'createdAt'>) {
    const works = this.getWorks();
    const newWork: AcademicWork = {
      ...work,
      id: 'acad_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    works.unshift(newWork); // Add to beginning (latest first)
    this.saveWorks(works);
    return newWork;
  },
  
  updateWork(id: string, updatedFields: Partial<Omit<AcademicWork, 'id' | 'createdAt'>>) {
    const works = this.getWorks();
    const index = works.findIndex(item => item.id === id);
    if (index !== -1) {
      works[index] = { ...works[index], ...updatedFields };
      this.saveWorks(works);
    }
  },
  
  deleteWork(id: string) {
    const works = this.getWorks();
    const filtered = works.filter(item => item.id !== id);
    this.saveWorks(filtered);
  },
  
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
