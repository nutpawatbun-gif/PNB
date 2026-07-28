/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  NewsItem, 
  Course, 
  CalendarEvent, 
  DownloadableFile, 
  DocumentCategory,
  FAQItem, 
  SystemService, 
  StatItem, 
  DirectorMessage 
} from '../types';

export const directorData: DirectorMessage = {
  title: "สารจากผู้อำนวยการวิทยาลัยสงฆ์",
  name: "พระราชพัชรธรรมเมธี, ดร.",
  position: "ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์",
  avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600", // Will render as placeholder, styled roundly
  messageText: "วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มุ่งมั่นที่จะจัดการศึกษาระดับอุดมศึกษาทางพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ เพื่อพัฒนาบัณฑิตให้เป็นผู้มีปัญญา ศีลธรรม และความเชี่ยวชาญในวิชาชีพ นำหลักธรรมทางพระพุทธศาสนาไปประยุกต์ใช้ในการขับเคลื่อนสังคมให้เกิดความสงบสุขร่มเย็น",
  fullMessageText: [
    "ขอเจริญพรคณาจารย์ เจ้าหน้าที่ และนิสิตทุกท่าน รวมถึงผู้สนใจเข้าศึกษาและประชาชนทั่วไปทุกท่าน",
    "วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ในฐานะที่เป็นสถาบันการศึกษาระดับอุดมศึกษาพระพุทธศาสนา มีปณิธานและภารกิจสำคัญในการจัดการศึกษาและบริการวิชาการแก่สังคม โดยมุ่งเน้นการ 'จัดการศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ พัฒนาจิตใจและสังคม'",
    "พวกเรามีความมุ่งมั่นที่จะพัฒนาหลักสูตรการเรียนการสอนให้ทันสมัย ทันต่อกระแสโลกาภิวัตน์ แต่ยังคงเปี่ยมด้วยหลักธรรมคำสอนของพระสัมมาสัมพุทธเจ้าเป็นรากฐาน เพื่อเสริมสร้างปัญญา พัฒนาจิตใจ และขยายโอกาสทางการศึกษาให้แก่พระภิกษุ สามเณร และคฤหัสถ์ผู้ครองเรือน ในจังหวัดเพชรบูรณ์และภูมิภาคใกล้เคียง",
    "ในโอกาสนี้ วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ ยินดีต้อนรับทุกท่านเข้ามาศึกษา เรียนรู้ และร่วมงานกับสถาบันเพื่อจรรโลงพระพุทธศาสนาและพัฒนาสังคมไทยสืบไป"
  ]
};

export const coursesData: Course[] = [
  // Bachelor
  {
    id: "b1",
    code: "B.A. RP",
    name: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา",
    nameEn: "Bachelor of Arts Program in Religion and Philosophy",
    degree: "พุทธศาสตรบัณฑิต (พธ.บ.)",
    degreeEn: "Bachelor of Arts (B.A.)",
    duration: "4 ปี",
    studyMode: "ภาคปกติ (วันจันทร์ - พุธ)",
    qualification: [
      "สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.6) หรือเทียบเท่า",
      "สำเร็จการศึกษาพระปริยัติธรรมแผนกธรรมชั้นเอก หรือแผนกบาลีประโยค 1-2 ขึ้นไป",
      "เป็นภิกษุ สามเณร หรือคฤหัสถ์ทั่วไปที่มีความประพฤติเรียบร้อย"
    ],
    estimatedFee: "ประมาณ 2,500 - 3,500 บาท ต่อภาคการศึกษา",
    careerPath: [
      "นักวิชาการศาสนาและปรัชญา",
      "อาจารย์สอนศีลธรรมและวิชาสังคมศึกษา",
      "บุคลากรในหน่วยงานภาครัฐและเอกชน",
      "นักวิจัยด้านพุทธศาสนาและสังคมศาสตร์"
    ],
    level: "bachelor"
  },
  {
    id: "b2",
    code: "B.A. BUD",
    name: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา",
    nameEn: "Bachelor of Arts Program in Buddhism",
    degree: "พุทธศาสตรบัณฑิต (พธ.บ.)",
    degreeEn: "Bachelor of Arts (B.A.)",
    duration: "4 ปี",
    studyMode: "ภาคปกติ (วันจันทร์ - พุธ)",
    qualification: [
      "สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.6) หรือเทียบเท่า",
      "สำเร็จการศึกษาพระปริยัติธรรมแผนกธรรมชั้นเอก หรือแผนกบาลีประโยค 1-2 ขึ้นไป",
      "เป็นภิกษุ สามเณร หรือคฤหัสถ์ทั่วไปที่มีความประพฤติเรียบร้อย"
    ],
    estimatedFee: "ประมาณ 2,500 - 3,500 บาท ต่อภาคการศึกษา",
    careerPath: [
      "พระธรรมทูต/นักเผยแผ่พระพุทธศาสนา",
      "นักวิชาการพระพุทธศาสนาประจำสำนักงานพระพุทธศาสนาแห่งชาติ",
      "บุคลากรทางการศึกษาและนักพัฒนาคุณธรรม",
      "ผู้ประสานงานโครงการพัฒนาชุมชนและสังคมเด่น"
    ],
    level: "bachelor"
  },
  {
    id: "b3",
    code: "B.P.A. PA",
    name: "หลักสูตรรัฐประศาสนศาสตรบัณฑิต สาขาวิชารัฐประศาสนศาสตร์",
    nameEn: "Bachelor of Public Administration Program in Public Administration",
    degree: "รัฐประศาสนศาสตรบัณฑิต (รป.บ.)",
    degreeEn: "Bachelor of Public Administration (B.P.A.)",
    duration: "4 ปี",
    studyMode: "ภาคปกิต (บรรพชิต) (วันจันทร์ - พุธ) คฤหัสถ์ (วันเสาร์ - อาทิตย์)",
    qualification: [
      "สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.6) หรือเทียบเท่า",
      "ข้าราชการ พนักงานรัฐวิสาหกิจ ผู้บริหารท้องถิ่น หรือประชาชนทั่วไปที่สนใจ"
    ],
    estimatedFee: "ประมาณ 3,500 - 6,000 บาท ต่อภาคการศึกษา",
    careerPath: [
      "ปลัดอำเภอและข้าราชการพลเรือนในกระทรวงต่าง ๆ",
      "เจ้าหน้าที่วิเคราะห์นโยบายและแผน",
      "นักบริหารส่วนท้องถิ่น (อบต. เทศบาล และ อบจ.)",
      "ผู้จัดการฝ่ายบริหารทรัพยากรบุคคล"
    ],
    level: "bachelor"
  },
  // Master
  {
    id: "m1",
    code: "M.A. BUD",
    name: "หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาพระพุทธศาสนา",
    nameEn: "Master of Arts Program in Buddhism",
    degree: "พุทธศาสตรมหาบัณฑิต (พธ.ม.)",
    degreeEn: "Master of Arts (M.A.)",
    duration: "2 ปี",
    studyMode: "ภาคพิเศษ (วันเสาร์ - อาทิตย์)",
    qualification: [
      "สำเร็จการศึกษาระดับปริญญาตรีทุกสาขาวิชาจากสถาบันการศึกษาที่ได้รับรองวุฒิ",
      "เป็นพระภิกษุ สามเณร หรือคฤหัสถ์ทั่วไปที่มีความตั้งใจศึกษาวิจัยทางพุทธศาสตร์"
    ],
    estimatedFee: "ประมาณ 20,000 - 25,000 บาท ต่อภาคการศึกษา",
    careerPath: [
      "อาจารย์สอนวิชาพระพุทธศาสนาในระดับอุดมศึกษา",
      "นักวิจัยทางพุทธศาสนาและวิปัสสนากรรมฐานชั้นสูง",
      "ที่ปรึกษาองค์กรภาคประชาสังคมและศูนย์ปฏิบัติธรรม",
      "นักพัฒนาและวิเคราะห์ข้อมูลพุทธศาสน์ประยุกต์"
    ],
    level: "master"
  },
  {
    id: "m2",
    code: "M.P.A. PA",
    name: "หลักสูตรรัฐประศาสนศาสตรมหาบัณฑิต สาขาวิชารัฐประศาสนศาสตร์",
    nameEn: "Master of Public Administration Program in Public Administration",
    degree: "รัฐประศาสนศาสตรมหาบัณฑิต (รป.ม.)",
    degreeEn: "Master of Public Administration (M.P.A.)",
    duration: "2 ปี",
    studyMode: "ภาคพิเศษ (วันเสาร์ - อาทิตย์)",
    qualification: [
      "สำเร็จการศึกษาระดับปริญญาตรีทุกสาขาวิชาจากหน่วยงานรัฐหรือเอกชน",
      "มีประสบการณ์บริหารงานหรือความสนใจเป็นพิเศษด้านนโยบายสาธารณะ"
    ],
    estimatedFee: "ประมาณ 22,000 - 25,000 บาท ต่อภาคการศึกษา",
    careerPath: [
      "ผู้บริหารระดับกลางถึงสูงในหน่วยงานราชการหรือท้องถิ่น",
      "ผู้เชี่ยวชาญด้านยุทธศาสตร์และการประเมินนโยบายภาครัฐ",
      "ผู้บริหารองค์กรพัฒนาเอกชน (NGOs)",
      "นักวิชาการวิเคราะห์นโยบายและแผนอาวุโส"
    ],
    level: "master"
  },
  // Doctor
  {
    id: "d1",
    code: "Ph.D. BUD",
    name: "หลักสูตรพุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระพุทธศาสนา",
    nameEn: "Doctor of Philosophy Program in Buddhism",
    degree: "พุทธศาสตรดุษฎีบัณฑิต (พธ.ด.)",
    degreeEn: "Doctor of Philosophy (Ph.D.)",
    duration: "3 ปี",
    studyMode: "ภาคเรียนการค้นคว้าอิสระทางพุทธศาสตรวิจัยและการสัมมนานานาชาติ",
    qualification: [
      "สำเร็จการศึกษาระดับปริญญาโทด้านพุทธศาสตร์หรือสาขาที่เกี่ยวข้อง",
      "ผู้ผ่านการประเมินโครงร่างงานวิจัยเบื้องต้น (Concept Paper) โดยคณะกรรมการบริหารหลักสูตร"
    ],
    estimatedFee: "ประมาณ 35,000 - 45,000 บาท ต่อภาคการศึกษา",
    careerPath: [
      "ศาสตราจารย์ นักวิชาการ หรืออาจารย์ประจำคณะพุทธศาสตร์ในมหาวิทยาลัย",
      "นักวิจัยระดับผู้เชี่ยวชาญเฉพาะทางทางพระพุทธศาสนา",
      "ที่ปรึกษาด้านการพัฒนาศีลธรรมและสันติภาพระดับนานาชาติ"
    ],
    level: "doctor"
  },
  // Certificates
  {
    id: "c1",
    code: "Cert. MA",
    name: "หลักสูตรประกาศนียบัตรการบริหารกิจการคณะสงฆ์ (ป.บส.)",
    nameEn: "Certificate Program in Monastic Administration",
    degree: "ประกาศนียบัตรการบริหารกิจการคณะสงฆ์",
    degreeEn: "Certificate in Monastic Administration",
    duration: "1 ปี",
    studyMode: "ภาคพิเศษวันหยุด (เสาร์ - อาทิตย์)",
    qualification: [
      "เป็นพระภิกษุสามสังฆาธิการ เจ้าอาวาส รองเจ้าอาวาส หรือเลขานุการคณะสงฆ์",
      "สำเร็จการศึกษาไม่ต่ำกว่าชั้นมัธยมศึกษาตอนต้น หรือมีวุฒินักธรรมชั้นเอก"
    ],
    estimatedFee: "ได้รับการอุดหนุนกองทุนศาสนศึกษาของมหาวิทยาลัยตลอดหลักสูตร (เรียนฟรี)",
    careerPath: [
      "ผู้บริหารจัดการและเลขาธิการในหน่วยงานกิจการคณะสงฆ์",
      "เจ้าหน้าที่บริหารศาสนสมบัติและสารสนเทศวัด",
      "ผู้ประสานงานกิจการพระพุทธศาสนาระดับท้องถิ่น"
    ],
    level: "certificate"
  },
  {
    id: "c2",
    code: "Cert. VM",
    name: "หลักสูตรประกาศนียบัตรวิปัสสนาภาวนา",
    nameEn: "Certificate Program in Vipassana Meditation",
    degree: "ประกาศนียบัตรวิปัสสนาภาวนา",
    degreeEn: "Certificate in Vipassana Meditation",
    duration: "1 ปี",
    studyMode: "ฝึกอบรมปฏิบัติวิปัสสนากรรมฐานเข้มข้นตามแนวสติปัฏฐาน 4",
    qualification: [
      "เป็นพระภิกษุ สามเณร แม่ชี หรืออุบาสก อุบาสิกา ที่ประพฤติเคร่งครัดในศีล",
      "ผ่านหลักสูตรอบรมธรรมะขั้นพื้นฐาน และมีความมั่นคงในจิตใจ"
    ],
    estimatedFee: "ได้รับการสนับสนุนทุนศึกษาโดยมูลนิธิวัดและวิทยาลัยสงฆ์ (ไม่มีค่าใช้จ่าย)",
    careerPath: [
      "วิปัสสนาจารย์ผู้ช่วยสอนกรรมฐานประจำสถานปฏิบัติธรรม",
      "พระวิทยากรนำการพัฒนาจิตเยาวชนและประชาชน",
      "ผู้เผยแผ่ศีลธรรมด้านการปฏิบัติกรรมฐาน"
    ],
    level: "certificate"
  },
  {
    id: "c3",
    code: "Cert. MT",
    name: "หลักสูตรประกาศนียบัตรการสอนศีลธรรมในโรงเรียน (ป.สศ.)",
    nameEn: "Certificate Program in Moral Teaching in Schools",
    degree: "ประกาศนียบัตรการสอนศีลธรรมในโรงเรียน",
    degreeEn: "Certificate in Moral Teaching",
    duration: "1 ปี",
    studyMode: "การอบรมทฤษฎีควบคู่กับการทดลองฝึกสอนจริงในสถานศึกษา",
    qualification: [
      "พระภิกษุสงฆ์และสามเณรผู้ประสงค์ทำหน้าที่เผยแผ่ธรรมในโรงเรียนทั่วประเทศ",
      "สำเร็จการศึกษาไม่ต่ำกว่าระดับปริญญาตรี หรือเปรียญธรรม 3 ประโยคขึ้นไป"
    ],
    estimatedFee: "ได้รับการจัดสรรงบประมาณสนับสนุนจากสำนักงานพระพุทธศาสนาแห่งชาติ",
    careerPath: [
      "พระสอนศีลธรรมในโรงเรียนของรัฐบาล เอกชน และเทศบาล",
      "พระธรรมวิทยากรค่ายอบรมคุณธรรมจริยธรรมเยาวชน",
      "บุคลากรสังกัดสมาคมพุทธศาสน์ศึกษาจังหวัดเพชรบูรณ์"
    ],
    level: "certificate"
  }
];

export const newsData: NewsItem[] = [
  {
    id: "n1",
    title: "เปิดรับสมัครนิสิตใหม่ระดับปริญญาตรี ปริญญาโท และปริญญาเอก ประจำปีการศึกษา 2569",
    titleEn: "Admissions Open for Undergraduate, Postgraduate and Doctoral Programs for Academic Year 2026",
    category: "pr",
    categoryLabel: "ข่าวประชาสัมพันธ์",
    date: "2569-07-15",
    status: "Published",
    viewCount: 342,
    excerpt: "วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประกาศเปิดรับสมัครบุคคลเข้าศึกษาต่อประจำปีการศึกษา 2569 โดยครอบคลุมทั้งบรรพชิตและคฤหัสถ์",
    content: "วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประกาศเปิดรับสมัครบุคคลเพื่อเข้าศึกษาต่อในระดับปริญญาตรี ปริญญาโท ปริญญาเอก และหลักสูตรประกาศนียบัตร ประจำปีการศึกษา 2569 โดยเปิดรับทั้งบรรพชิต (พระภิกษุ สามเณร) และคฤหัสถ์ (ประชาชนทั่วไป) โดยมุ่งเน้นการเสริมสร้างคุณธรรมความรู้ ทักษะทางวิชาการ และการฝึกปฏิบัติกรรมฐานอย่างถูกต้องสมบูรณ์ สามารถดาวน์โหลดคู่มือผู้สมัครและส่งใบสมัครได้ผ่านระบบทะเบียนออนไลน์ ได้รับการส่งเสริมทุนวิชาการสำหรับพระสังฆาธิการและสามเณรตลอดหลักสูตร",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    attachmentUrl: "https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link",
    attachmentName: "คู่มือการสมัครเรียนประจำปีการศึกษา_2569.pdf",
    galleryUrls: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
      "https://drive.google.com/file/d/1vA5K8W1K8P9n3D7r_N9s8M7nS0p9rT7gY/view?usp=sharing",
      "https://drive.google.com/open?id=1T7p6f4k2H9d1L8m5N0_v8gS4kL7d8s9F",
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "n2",
    title: "ขอเชิญร่วมงานสัมมนาวิชาการระดับชาติ 'พุทธธรรมกับนวัตกรรมทางสังคมและรัฐประศาสนศาสตร์'",
    titleEn: "Invitation to National Academic Conference on Buddhism, Social Innovation and Public Administration",
    category: "academic",
    categoryLabel: "ข่าววิชาการ",
    date: "2569-07-10",
    status: "Published",
    viewCount: 189,
    excerpt: "ฝ่ายวิชาการและการวิจัย ขอเชิญคณาจารย์ นิสิตนักศึกษา และผู้สนใจร่วมงานประชุมวิชาการระดับท้องถิ่นและระดับชาติ เพื่อการพัฒนาที่ยั่งยืน",
    content: "ฝ่ายวิชาการและการวิจัย วิทยาลัยสงฆ์พ่อขุนผาเมือง ขอเรียนเชิญคณาจารย์ นักวิจัย นิสิตนักศึกษา และประชาชนทั่วไป เข้าร่วมการสัมมนาวิชาการระดับชาติ ประจำปี 2569 เพื่อนำเสนอบทความวิชาการ บทความวิจัยในหลากหลายศาสตร์ที่บูรณาการกับหลักธรรมทางพระพุทธศาสนา เพื่อผลักดันความรู้ใหม่สู่นวัตกรรมสังคม ท้องถิ่น และการบริหารกิจการภาครัฐ ในงานจะมีปาฐกถาพิเศษโดยวิทยากรผู้ทรงคุณวุฒิระดับชาติและพิธีมอบรางวัลงานวิจัยดีเด่น",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    galleryUrls: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
      "https://drive.google.com/file/d/1X8hN8P9s2D3D7r_N9s8M7nS0p9rT7gY/view",
      "https://drive.google.com/open?id=2T7p6f4k2H9d1L8m5N0_v8gS4kL7d8s9F",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "n3",
    title: "พิธีปฐมนิเทศนิสิตใหม่และพิธีถวายตัวเป็นศิษย์ ประจำปีการศึกษา 2569 ณ หอประชุมหลวงพ่อคง",
    titleEn: "Orientation and Initiation Ceremony for New Students, Academic Year 2026",
    category: "activity",
    categoryLabel: "ข่าวกิจกรรม",
    date: "2569-06-25",
    status: "Published",
    viewCount: 278,
    excerpt: "พระราชพัชรธรรมเมธี, ดร. ผู้อำนวยการวิทยาลัยสงฆ์ฯ เป็นประธานเปิดพิธีปฐมนิเทศ พร้อมแนะหลักการเรียนรู้แบบพุทธบูรณาการ",
    content: "เมื่อวันที่ผ่านมา ที่อาคารหอประชุมหลักหลวงพ่อคง วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ได้จัดพิธีปฐมนิเทศนิสิตใหม่และพิธีถวายตัวเป็นศิษย์อย่างเป็นทางการ เพื่อชี้แจงระเบียบข้อบังคับ การบริการของห้องสมุด ระบบการเรียนแบบดิจิทัล และทุนการศึกษา โดยมีคณาจารย์ พระวิทยากร และตัวแทนคฤหัสถ์ผู้บริหารสมาคมศิษย์เก่าเข้าร่วมชื่นชมและถวายการต้อนรับนิสิตใหม่อย่างอุ่นหนาฝาคั่ง",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
    galleryUrls: [
      "https://images.unsplash.com/photo-1525921429624-479b6c29454f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
      "https://drive.google.com/file/d/3vA5K8W1K8P9n3D7r_N9s8M7nS0p9rT7gY/view",
      "https://drive.google.com/open?id=3T7p6f4k2H9d1L8m5N0_v8gS4kL7d8s9F",
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "n4",
    title: "วิทยาลัยสงฆ์พ่อขุนผาเมือง ลงนามบันทึกความร่วมมือพัฒนาการเรียนการสอนศีลธรรมร่วมกับเครือข่ายโรงเรียนจังหวัดเพชรบูรณ์",
    titleEn: "MOU Signed Between Buddhist College and School Networks for Moral Education",
    category: "pr",
    categoryLabel: "ข่าวประชาสัมพันธ์",
    date: "2569-05-18",
    status: "Published",
    viewCount: 145,
    excerpt: "ขับเคลื่อนโครงการยกระดับโรงเรียนคุณธรรม แปรรูปหลักสูตรพัฒนาบุคลากรครูสายพุทธวิทยากรระดับสพป.เพชรบูรณ์",
    content: "เพื่อยกระดับและขับเคลื่อนศีลธรรมในวัยเรียนอย่างเป็นระบบ วิทยาลัยสงฆ์พ่อขุนผาเมือง ได้ร่วมลงนามบันทึกข้อตกลง (MOU) ความร่วมมือร่วมกับเครือข่ายผู้บริหารโรงเรียนสังกัด สพป.เพชรบูรณ์ เพื่อจัดทำหลักสูตร 'พุทธวิทยากรครูศีลธรรมในยุคดิจิทัล' และส่งสริมงานวิชาการพุทธศาสนาเพื่อสู้ภัยออนไลน์และค่านิยมบิดเบือนในวัยเด็ก",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    galleryUrls: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&q=80&w=800",
      "https://drive.google.com/file/d/4vA5K8W1K8P9n3D7r_N9s8M7nS0p9rT7gY/view",
      "https://drive.google.com/open?id=4T7p6f4k2H9d1L8m5N0_v8gS4kL7d8s9F",
      "https://images.unsplash.com/photo-1552581230-c01bc911b044?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "n5",
    title: "กิจกรรมจิตอาสาสโมสรนิสิต พัฒนาชุมชนและจัดกิจกรรมส่งเสริมวิถีศีลธรรมเนื่องในเทศกาลวันอาสาฬหบูชา",
    titleEn: "Student Council Organizes Voluntary Community Clean Up for Asalha Puja Day",
    category: "activity",
    categoryLabel: "ข่าวกิจกรรม",
    date: "2569-07-01",
    status: "Published",
    viewCount: 210,
    excerpt: "คณะคณาจารย์และนิสิตร่วมทำความสะอาดโบราณสถานวัดราษฎร์ บำเพ็ญประโยชน์ต่อชุมชนรอบนอกอำเภอหล่มสัก",
    content: "สโมสรนิสิตวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ นำทีมโดยฝ่ายกิจการนิสิต ได้จัดโครงการจิตอาสาทำนุบำรุงพระพุทธศาสนาและบำเพ็ญประโยชน์ต่อสาธารณชน โดยมีตัวแทนนิสิตบรรพชิตและคฤหัสถ์ลงพื้นที่ทำความสะอาด พัฒนาสิ่งแวดล้อม และส่งมอบชุดยังชีพรวมถึงสิ่งของอุปโภคบริโภคที่ได้รับบิณฑบาตเพื่อแจกจ่ายแก่ประชากรผู้มีรายได้น้อยรอบแนวรอยต่อหล่มสักอย่างอบอุ่น",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    galleryUrls: [
      "https://images.unsplash.com/photo-1559027615-cd4487df3499?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1469571486040-0b9b17574b7d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1489084917528-a57e68a79a1e?auto=format&fit=crop&q=80&w=800",
      "https://drive.google.com/file/d/5vA5K8W1K8P9n3D7r_N9s8M7nS0p9rT7gY/view",
      "https://drive.google.com/open?id=5T7p6f4k2H9d1L8m5N0_v8gS4kL7d8s9F",
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "n6",
    title: "โครงการฝึกอบรมวิปัสสนากรรมฐานนิสิต 10 วัน เสริมสร้างสมาธิปัญญาตามเกณฑ์มาตรฐานมหาจุฬาฯ",
    titleEn: "Annual 10-Day Intensive Vipassana Meditation Program for Students Under MCU Standard",
    category: "academic",
    categoryLabel: "ข่าววิชาการ",
    date: "2569-04-12",
    status: "Published",
    viewCount: 312,
    excerpt: "มุ่งเน้นการขัดเกลาทางใจตามหลักวิปัสสนาธุระ สรุปผลประเมินพึงพอใจนิสิตยอดเยี่ยมระดับเขตภาคเหนือ",
    content: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย บังคับใช้และส่งเสริมการอบรมปฏิบัติตามหลักวิปัสสนากรรมฐานเข้ม 10 วันประจำทุกปีการศึกษา โดยทางวิทยาลัยสงฆ์พ่อขุนผาเมืองได้จัดส่งนิสิตทุกระดับชั้นร่วมกิจกรรม ณ สำนักปฏิบัติธรรมหลวงพ่อทองคำ เพื่อส่งเสริมวิถีแห่งความรอบรู้ตามคำสอนพระตถาคต เพื่อให้บัณฑิตเป็นผู้มีความประพฤติสว่างและนอบน้อมในการทำงานจริงในทุกแวดวง",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    galleryUrls: [
      "https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507502707541-f369a3b18502?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800",
      "https://drive.google.com/file/d/6vA5K8W1K8P9n3D7r_N9s8M7nS0p9rT7gY/view",
      "https://drive.google.com/open?id=6T7p6f4k2H9d1L8m5N0_v8gS4kL7d8s9F",
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800"
    ]
  }
];

export const eventsData: CalendarEvent[] = [
  {
    id: "e1",
    title: "โครงการสัมมนาเชิงปฏิบัติการ 'การประกันคุณภาพการศึกษาภายในระดับหลักสูตร' ประจำปีการศึกษา 2568",
    startDate: "2026-07-25",
    endDate: "2026-07-25",
    startTime: "09:00",
    endTime: "16:30",
    date: "25",
    month: "ก.ค.",
    year: "2569",
    time: "09:00 น. - 16:30 น.",
    location: "อาคารเรียนรวม ห้องประชุมหลวงพ่อคง ชั้น 2",
    details: "โครงการประเมินศักยภาพและมาตรฐานหลักสูตร เพื่อรองรับมาตรฐานการศึกษาระดับกระทรวง สป.อว.",
    category: "academic",
    categoryLabel: "งานวิชาการ",
    color: "#2563eb"
  },
  {
    id: "e2",
    title: "พิธีถวายเทียนจำนำพรรษาและผ้าอาบน้ำฝน เพื่อส่งเสริมบุญกิริยาวัตถุ ณ วัดป่าเขาอุ้มธรรม อำเภอหล่มเก่า",
    startDate: "2026-07-28",
    endDate: "2026-07-28",
    startTime: "13:00",
    endTime: "17:00",
    date: "28",
    month: "ก.ค.",
    year: "2569",
    time: "13:00 น. เป็นต้นไป",
    location: "วัดป่าเขาอุ้มธรรม ต.นาซำ อ.หล่มเก่า จ.เพชรบูรณ์",
    details: "สโมสรนิสิตร่วมประสานงานพุทธศาสนิกชนท้องถิ่น สืบสานกิจกรรมประเพณีวัฒนธรรมอันดีงามในพุทธศาสน์",
    category: "buddhism",
    categoryLabel: "ศาสนพิธี",
    color: "#d97706"
  },
  {
    id: "e3",
    title: "กิจกรรมเฉลิมพระเกียรติสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง 12 สิงหา",
    startDate: "2026-08-12",
    endDate: "2026-08-12",
    startTime: "08:30",
    endTime: "11:30",
    date: "12",
    month: "ส.ค.",
    year: "2569",
    time: "08:30 น. - 11:30 น.",
    location: "ลานอเนกประสงค์อนุสาวรีย์พ่อขุนผาเมือง ประจำวิทยาลัยสงฆ์",
    details: "พิธีเจริญพระพุทธมนต์ ตักบาตรข้าวสารอาหารแห้งถวายเป็นพระราชกุศล และโครงการปลูกป่ารักษ์โลก",
    category: "ceremony",
    categoryLabel: "พิธีการ",
    color: "#9333ea"
  },
  {
    id: "e4",
    title: "การสอบป้องกันวิทยานิพนธ์/ดุษฎีนิพนธ์ของนิสิตวิชาเอกพุทธศาสตร์ รุ่นที่ 15 และ 8 ตามมาตรฐานวิชาการ",
    startDate: "2026-08-22",
    endDate: "2026-08-22",
    startTime: "09:00",
    endTime: "16:00",
    date: "22",
    month: "ส.ค.",
    year: "2569",
    time: "09:00 น. - 16:00 น.",
    location: "อาคารวิชาการ ชั้น 3 ห้องสัมมนาระดับบัณฑิตศึกษา",
    details: "งานนำเสนอผลการวิจัยเชิงลึกเพื่อพัฒนาจิตใจสังคมและส่งเสริมมาตรฐานคลังบทความวิจัยสถาบัน มจร",
    category: "academic",
    categoryLabel: "งานวิชาการ",
    color: "#2563eb"
  }
];

export const faqsData: FAQItem[] = [
  {
    id: "fq1",
    question: "คุณสมบัติพื้นฐานของผู้ที่ต้องการสมัครเข้าศึกษาระดับปริญญาตรีคืออะไร?",
    answer: "ผู้สมัครต้องสำเร็จการศึกษาไม่ต่ำกว่ามัธยมศึกษาตอนปลาย (ม.6) หรือเทียบเท่าจากกระทรวงศึกษาธิการ หรือเป็นพระภิกษุสามเณรผู้สอบได้เปรียญธรรม 3 ประโยคขึ้นไป และมีความประพฤติเรียบร้อย สุขภาพแข็งแรง สำหรับพระภิกษุสามเณรต้องมีใบรับรองจากเจ้าอาวาสหรือผู้ปกครองสงฆ์ต้นสังกัด"
  },
  {
    id: "fq2",
    question: "พระภิกษุและสามเณรมีทุนการศึกษาหรือสิทธิพิเศษอย่างไรบ้าง?",
    answer: "วิทยาลัยสงฆ์พ่อขุนผาเมืองมีกองทุนอุปถัมภ์พุทธศาสนศึกษา ซึ่งให้ทุนการศึกษาอุดหนุนช่วยเหลือค่าลงทะเบียนและค่าบำรุงการศึกษาสูงถึงเกือบ 100% สำหรับนิสิตที่เป็นพระภิกษุและสามเณร ตลอดระยะเวลาการศึกษาตามแผนหลักสูตร นอกจากนี้ยังมีภัตตาหารเพลและบริการหอพักสงฆ์เอื้อเฟื้อโดยไม่มีค่าใช้จ่ายเพิ่มเติม"
  },
  {
    id: "fq3",
    question: "คฤหัสถ์หรือประชาชนทั่วไป ที่ไม่ได้บวชสามารถสมัครเข้าศึกษาได้หรือไม่?",
    answer: "สามารถสมัครเรียนได้ตามปกติในทุกสาขาวิชา ทั้งระดับปริญญาตรี ปริญญาโท และปริญญาเอก โดยทั่วไปนิสิตที่เป็นคฤหัสถ์นิยมสมัครเรียนใน 'ภาคพิเศษ' (เรียนเฉพาะเสาร์-อาทิตย์) เพื่อไม่ให้กระทบกับการทำงานประจำ โดยได้รับวุฒิปริญญาบัตรและมาตรฐานการศึกษาที่เท่าเทียมกับภาคปกติทุกประการ"
  },
  {
    id: "fq4",
    question: "รูปแบบและวิธีการเรียนการสอนเป็นอย่างไรในช่วงเทคโนโลยีสมัยใหม่?",
    answer: "วิทยาลัยจัดการเรียนการสอนแบบผสมผสาน (Blended Learning) โดยจัดการเรียนการสอนแบบออนไซต์เป็นหลักเพื่อให้ได้รับอรรถรสทางพุทธปัญญาศึกษาและการปฏิบัติวิปัสสนา ร่วมกับการใช้แพลตฟอร์มการเรียนรู้แบบดิจิทัล (MCU E-Learning, Google Classroom และระบบประชุมซูมส่วนตัวของสถาบัน) อำนวยความสะดวกในการดาวน์โหลดเอกสารและส่งงานวิจัย"
  },
  {
    id: "fq5",
    question: "หลักสูตรระดับประกาศนียบัตรเหมาะสำหรับใคร และใช้เวลาเรียนนานเท่าใด?",
    answer: "หลักสูตรประกาศนียบัตร (ป.บส., ป.สศ. และวิปัสสนาภาวนา) เป็นหลักสูตรระยะสั้น 1 ปี (2 ภาคการศึกษา) เหมาะสำหรับพระสังฆาธิการ คณะทำงานในวัด พระสอนศีลธรรม หรือประชาชนทั่วไปที่ต้องการเพิ่มพูนความรู้ ความเข้าใจเฉพาะด้านในระยะสั้น สามารถนำวุฒิประกาศนียบัตรไปรับรองผลงานหรือประกอบเกณฑ์คุณสมบัติต่อไปได้"
  }
];

export const downloadCategoriesData: DocumentCategory[] = [
  {
    id: "cat_student_forms",
    nameTh: "แบบฟอร์มคำร้องนิสิต",
    nameEn: "Student Forms & Petitions",
    description: "ใบสมัครเรียน คำร้องทั่วไป คำร้องขอจบ และแบบฟอร์มฝ่ายกิจการนิสิต",
    iconName: "FileText",
    color: "#2563eb",
    sortOrder: 1
  },
  {
    id: "cat_handbooks",
    nameTh: "คู่มือการศึกษาและแผนการเรียน",
    nameEn: "Handbooks & Study Plans",
    description: "คู่มือนิสิต คู่มือการทำสารนิพนธ์/วิทยานิพนธ์ และแผนการศึกษาหลักสูตร",
    iconName: "BookOpen",
    color: "#059669",
    sortOrder: 2
  },
  {
    id: "cat_regulations",
    nameTh: "ระเบียบ ข้อบังคับ และประกาศ",
    nameEn: "Regulations & Policies",
    description: "ระเบียบมหาวิทยาลัย ข้อบังคับว่าด้วยวินัยนิสิต และประกาศเกณฑ์การศึกษา",
    iconName: "ShieldAlert",
    color: "#d97706",
    sortOrder: 3
  },
  {
    id: "cat_staff_forms",
    nameTh: "แบบฟอร์มอาจารย์และบุคลากร",
    nameEn: "Faculty & Staff Forms",
    description: "แบบฟอร์ม มคอ.3-มคอ.7 เอกสารเสนอโครงการ และแบบประเมินผลการสอน",
    iconName: "Users",
    color: "#9333ea",
    sortOrder: 4
  },
  {
    id: "cat_academic_papers",
    nameTh: "เอกสารการวิจัยและผลงานวิชาการ",
    nameEn: "Academic Papers & Templates",
    description: "แบบฟอร์มเสนอโครงการวิจัย แม่แบบบทความวิจัย และตารางคำนวณสถิติ",
    iconName: "FileSpreadsheet",
    color: "#0284c7",
    sortOrder: 5
  },
  {
    id: "cat_media_brochures",
    nameTh: "สื่อประชาสัมพันธ์และดาวน์โหลดสื่อ",
    nameEn: "Brochures & Media Kits",
    description: "แผ่นพับแนะแนวศึกษาต่อ โลโก้สถาบัน รูปภาพสื่อ และไฟล์บีบอัดชุดเครื่องมือ",
    iconName: "Image",
    color: "#e11d48",
    sortOrder: 6
  }
];

export const downloadsData: DownloadableFile[] = [];

export const servicesData: SystemService[] = [
  {
    id: "s1",
    name: "ระบบทะเบียนนิสิต (REG-MCU)",
    nameEn: "Student Registration System",
    description: "ตรวจสอบประวัติ ผลการเรียน ลงทะเบียนเรียนออนไลน์ และพิมพ์ใบเสร็จเพื่อทำธุรกรรมการเรียน",
    url: "https://regweb.mcu.ac.th/registrar/home.asp",
    iconName: "FileText"
  },
  {
    id: "s2",
    name: "ระบบ E-Service บริการอิเล็กทรอนิกส์",
    nameEn: "MCU E-Service System",
    description: "บริการยื่นคำร้อง ขอใบรับรอง ผลการเรียน ดำเนินคำร้องทั่วไป และติดตามสถานะทางดิจิทัล",
    url: "https://eservice.mcu.ac.th",
    iconName: "Globe"
  },
  {
    id: "s3",
    name: "ระบบคณาจารย์และบุคลากร (HR-MCU)",
    nameEn: "Staff and Faculty Portal",
    description: "บันทึกเวลาทำงาน ยื่นแบบประเมินผลการสอน ส่งบทความวิจัย และสืบค้นระบบสลิปเงินเดือนสำหรับเจ้าหน้าที่",
    url: "https://hr.mcu.ac.th",
    iconName: "Users"
  },
  {
    id: "s4",
    name: "ระบบวิทยานิพนธ์ E-thesis System",
    nameEn: "MCU E-Thesis System",
    description: "ฐานข้อมูลสำหรับการค้นคว้าวิทยานิพนธ์ ของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ที่รวบรวมผลงานทางวิชาการที่มีคุณภาพ",
    url: "https://e-thesis.mcu.ac.th/",
    iconName: "BookOpen"
  },
  {
    id: "s5",
    name: "ระบบการเรียนการสอนออนไลน์ (E-Learning)",
    nameEn: "MCU Online Classroom",
    description: "เข้าเรียนออนไลน์ บทเรียนอิเล็กทรอนิกส์ สื่อวิดีโอ ทักษะการพัฒนาจิต และประเมินวิชาการทางไกล",
    url: "https://elearning.mcu.ac.th",
    iconName: "Video"
  },
  {
    id: "s6",
    name: "ระบบตรวจสอบผลสัมฤทธิ์การเรียน (GPA Check)",
    nameEn: "Grade and GPA Verifier",
    description: "ตรวจสอบผลสอบรายภาควิชา เกรดเฉลี่ยสะสม และผลการอนุมัติหน่วยกิตสะสมอย่างเป็นส่วนตัว",
    url: "https://gpa.mcu.ac.th",
    iconName: "GraduationCap"
  }
];

export const statsData: StatItem[] = [
  {
    id: "st_1",
    label: "จำนวนนิสิตปัจจุบัน",
    labelEn: "Active Students",
    value: 356,
    suffix: "รูป/คน",
    iconName: "Users"
  },
  {
    id: "st_2",
    label: "จำนวนสาขาวิชาที่เปิดสอน",
    labelEn: "Offered Curricula",
    value: 3,
    suffix: "สาขาวิชา",
    iconName: "BookOpen"
  },
  {
    id: "st_3",
    label: "จำนวนคณาจารย์และบุคลากร",
    labelEn: "Faculty and Staff",
    value: 35,
    suffix: "รูป/คน",
    iconName: "GraduationCap"
  },
  {
    id: "st_4",
    label: "จำนวนเครือข่ายความร่วมมือ",
    labelEn: "MOU Partners",
    value: 12,
    suffix: "แห่ง",
    iconName: "Network"
  }
];
