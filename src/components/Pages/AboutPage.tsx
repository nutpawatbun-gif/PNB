/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import LucideIcon from '../LucideIcon';
// @ts-ignore
import directorImg from '../../assets/images/regenerated_image_1784362493747.jpg';
// @ts-ignore
import academicImg from '../../assets/images/regenerated_image_1784622077436.jpg';
// @ts-ignore
import adminImg from '../../assets/images/siriphatcharasophit.jpg';
// @ts-ignore
import academicOfficeDirImg from '../../assets/images/regenerated_image_1784623831605.jpg';

interface AboutPageProps {
  lang: 'th' | 'en';
}

export default function AboutPage({ lang }: AboutPageProps) {
  const t = {
    title: lang === 'th' ? 'เกี่ยวกับวิทยาลัยสงฆ์พ่อขุนผาเมือง' : 'About Our Buddhist College',
    sub: lang === 'th' ? 'ประวัติ ความเป็นมา ปรัชญา คณะผู้บริหาร และโครงสร้างองค์กรสารสนเทศ' : 'Discover our spiritual heritage, values, leadership team, and organizational goals.',
    historyTitle: lang === 'th' ? 'ประวัติความเป็นมา' : 'Historical Background',
    historyDesc1: lang === 'th'
      ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย จัดตั้งขึ้นตามมติสภาสถาบันและประกาศกระทรวง เพื่อขยายโอกาสทางการศึกษาระดับอุดมศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ให้แก่พระสังฆาธิการ พระภิกษุสามเณร และคฤหัสถ์ทั่วไปในเขตจังหวัดเพชรบูรณ์และจังหวัดใกล้เคียง'
      : 'Phokhun Phamuang Buddhist College, Phetchabun of Mahachulalongkornrajavidyalaya University was established by the decree of the University Council to expand higher educational opportunities in Buddhist studies and integrated disciplines to monastics and laypersons across Phetchabun and neighboring territories.',
    historyDesc2: lang === 'th'
      ? 'วิทยาลัยได้รับพระมหากรุณาธิคุณตั้งชื่อตามนาม "พ่อขุนผาเมือง" วีรบุรุษผู้กอบกู้เอกราชของชาติไทย เพื่อระลึกถึงวีรกรรมความกล้าหาญ ความเป็นระเบียบ และการเชิดชูคุณธรรมเป็นรากฐานของแผ่นดิน โดยมีที่ตั้งท่ามกลางธรรมชาติอันสงบเงียบ เหมาะแก่การเพาะบ่มปัญญา ฝึกปฏิบัติธรรม และการวิจัยวิชาการชั้นสูง'
      : 'Named after the historic Thai hero "King Phokhun Phamuang" to commemorate courage, loyalty, and justice as the foundation of the sovereign state. It is nestled within Lom Sak valley, offering a tranquil environment for spiritual growth, meditation retreat, and professional research.',
    philosophyTitle: lang === 'th' ? 'ปรัชญา ปณิธาน และอัตลักษณ์' : 'Philosophy, Vision & Identity',
    philosophy: lang === 'th' ? 'ปรัชญา (Philosophy)' : 'Philosophy',
    philosophyVal: lang === 'th' ? '“จัดการศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ พัฒนาจิตใจและสังคม”' : '“Integrating Buddhist Wisdom with Modern Sciences to Develop Mind and Society”',
    determination: lang === 'th' ? 'ปณิธาน (Determination)' : 'Mantra / Determination',
    determinationVal: lang === 'th' ? '“มุ่งมั่นพัฒนาวิชาการ นำหลักพุทธธรรมขับเคลื่อนสุขภาวะสังคมและจริยธรรมระดับสากล”' : '“Striving to advance academics, deploying Dharma to drive social wellbeing and global morals.”',
    identity: lang === 'th' ? 'อัตลักษณ์นิสิต (Student Identity)' : 'Student Identity',
    identityVal: lang === 'th' ? '“มีศิลาจารวัตรงดงาม เปี่ยมคุณธรรม เป็นผู้นำทางสติปัญญาและจิตใจ”' : '“Exemplary conduct, ethical purity, and mindfulness leaders.”',
    visionTitle: lang === 'th' ? 'วิสัยทัศน์ (Vision 2570)' : 'Academic Vision (2027)',
    visionVal: lang === 'th'
      ? '“เป็นศูนย์กลางแห่งการเรียนรู้พุทธประยุกต์และรัฐประศาสนศาสตร์เพื่อความมั่นคงของชุมชนท้องถิ่นภาคเหนือตอนล่างอย่างเป็นรูปธรรม ภายในปี พ.ศ. 2570”'
      : '“To become the ultimate center of applied Buddhist studies and public administration, reinforcing local communities’ ethical and economic resilience by 2027.”',
    missionTitle: lang === 'th' ? 'พันธกิจ 4 ด้าน (Core Missions)' : 'Four Operational Missions',
    m1: lang === 'th' ? 'ผลิตบัณฑิตทางพุทธประยุกต์และรัฐประศาสนศาสตร์ให้มีคุณธรรมคู่ปัญญา มีจริยวัตรงดงาม' : 'Produce high-caliber graduates with wisdom, compassion, and professional skills.',
    m2: lang === 'th' ? 'วิจัยพัฒนางานวิชาการเพื่อต่อยอดนวัตกรรมท้องถิ่น เสริมสร้างศีลธรรมสู้ภัยสังคมยุคใหม่' : 'Conduct intensive research to support local culture, local ethics, and community sustainability.',
    m3: lang === 'th' ? 'บริการวิชาการแก่คณะสงฆ์และสังคม บำเพ็ญสาธารณประโยชน์เพื่อความสงบสุขชุมชน' : 'Provide religious consulting and academic outreach services to monastics and general citizens.',
    m4: lang === 'th' ? 'ทำนุบำรุงพระพุทธศาสนา ศิลปะ วัฒนธรรมท้องถิ่น และรักษาอัตลักษณ์ไทยให้ยืนนาน' : 'Preserve Buddhist monastic disciplines, regional cultural legacies, and Thai traditional arts.',
    execTitle: lang === 'th' ? 'คณะผู้บริหารวิทยาลัยสงฆ์' : 'College Administration Executives',
    structureTitle: lang === 'th' ? 'โครงสร้างองค์กรวิทยาลัยสงฆ์' : 'Organizational Flow & Governance'
  };

  const executives = [
    {
      name: lang === 'th' ? "พระราชพัชรธรรมเมธี, ดร." : "Phra Rajphatcharadhammamedhi, Dr.",
      position: lang === 'th' ? "ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์" : "Director, Phokhun Phamuang Buddhist College",
      image: directorImg,
      role: "director"
    },
    {
      name: lang === 'th' ? "พระสุธีวชิราภรณ์, ผศ.ดร." : "Asst. Prof. Dr. Phra Suthi Vachiraphorn",
      position: lang === 'th' ? "รองผู้อำนวยการฝ่ายวิชาการ" : "Deputy Director of Academic Affairs",
      image: academicImg,
      role: "academic"
    },
    {
      name: lang === 'th' ? "พระสิริพัชรโสภิต, ดร." : "Phra Siriphatcharasophit, Dr.",
      position: lang === 'th' ? "รองผู้อำนวยการฝ่ายบริหาร" : "Deputy Director of Administrative Affairs",
      image: adminImg,
      role: "administration"
    }
  ];

  const officeDirectors = [
    {
      name: lang === 'th' ? "นางบุณยนุช สุนประโคน" : "Mrs. Boonyanut Sunprakhon",
      position: lang === 'th' ? "ผู้อำนวยการสำนักงานวิชาการ" : "Director of the Academic Office",
      image: academicOfficeDirImg,
      role: "academic_director"
    },
    {
      name: lang === 'th' ? "พระมนูศักดิ์ อุตฺตโร" : "Phra Manusak Uttaro",
      position: lang === 'th' ? "ผู้อำนวยการสำนักงานวิทยาลัย" : "Director of the College Office",
      image: "https://images.unsplash.com/photo-1548625361-155deee223d2?auto=format&fit=crop&q=80&w=400",
      role: "college_director"
    }
  ];

  return (
    <div className="bg-white min-h-screen py-10 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white rounded-2xl p-8 sm:p-12 text-center border-b-4 border-mcu-gold relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-black/15 z-0"></div>
          <div className="relative z-10 space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-mcu-gold-light">{t.title}</h1>
            <p className="text-xs sm:text-base text-mcu-pink-soft/90 font-light max-w-2xl mx-auto">{t.sub}</p>
          </div>
        </div>

        {/* 1. ประวัติความเป็นมา */}
        <div id="history" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-mcu-pink-deep font-sans flex items-center">
              <LucideIcon name="Compass" className="text-mcu-gold mr-2.5" size={22} />
              <span>{t.historyTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-mcu font-light leading-relaxed indent-8">
              {t.historyDesc1}
            </p>
            <p className="text-xs sm:text-sm text-text-mcu font-light leading-relaxed indent-8">
              {t.historyDesc2}
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden border-4 border-mcu-pink-light shadow-lg h-64 sm:h-80 relative bg-mcu-pink-soft">
              <img 
                src="https://lh3.googleusercontent.com/d/11-28Y9a0juhfvZlxOY5Z9qzmVOMbNWf2" 
                alt="Buddhist College Campus" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* 2. ปรัชญา ปณิธาน อัตลักษณ์ */}
        <div id="philosophy" className="bg-mcu-pink-soft/35 rounded-2xl border border-mcu-pink-light p-6 sm:p-8 space-y-6 pt-6">
          <h2 className="text-xl font-bold text-mcu-pink-deep text-center font-sans">
            {t.philosophyTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-mcu-pink-light/50 text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-mcu-pink-soft rounded-full flex items-center justify-center text-mcu-pink mx-auto">
                <LucideIcon name="Compass" size={18} />
              </div>
              <h3 className="text-sm font-bold text-mcu-pink-deep font-sans">{t.philosophy}</h3>
              <p className="text-xs text-text-mcu font-light leading-relaxed">{t.philosophyVal}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-mcu-pink-light/50 text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-mcu-pink-soft rounded-full flex items-center justify-center text-mcu-pink mx-auto">
                <LucideIcon name="Award" size={18} />
              </div>
              <h3 className="text-sm font-bold text-mcu-pink-deep font-sans">{t.determination}</h3>
              <p className="text-xs text-text-mcu font-light leading-relaxed">{t.determinationVal}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-mcu-pink-light/50 text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-mcu-pink-soft rounded-full flex items-center justify-center text-mcu-pink mx-auto">
                <LucideIcon name="Users" size={18} />
              </div>
              <h3 className="text-sm font-bold text-mcu-pink-deep font-sans">{t.identity}</h3>
              <p className="text-xs text-text-mcu font-light leading-relaxed">{t.identityVal}</p>
            </div>
          </div>
        </div>

        {/* 3. วิสัยทัศน์ & พันธกิจ (โครงสร้างองค์กร) */}
        <div id="structure" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
          <div className="md:col-span-5 bg-gradient-to-b from-mcu-pink-deep to-mcu-pink-dark text-white p-6 sm:p-8 rounded-2xl border-2 border-mcu-gold shadow-md space-y-4">
            <h2 className="text-lg font-bold text-mcu-gold-light font-sans flex items-center">
              <LucideIcon name="ShieldCheck" className="mr-2 text-mcu-gold" size={20} />
              <span>{t.visionTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm font-light leading-relaxed italic text-mcu-pink-soft text-center">
              {t.visionVal}
            </p>
          </div>
          
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-xl font-bold text-mcu-pink-deep font-sans flex items-center">
              <LucideIcon name="GraduationCap" className="text-mcu-gold mr-2.5" size={22} />
              <span>{t.missionTitle}</span>
            </h2>
            <div className="space-y-3.5 text-xs sm:text-sm text-text-mcu">
              {[t.m1, t.m2, t.m3, t.m4].map((mission, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-mcu-pink-soft/10 p-3 rounded-lg border border-mcu-pink-light/30">
                  <div className="w-6 h-6 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm">
                    {idx+1}
                  </div>
                  <p className="font-light leading-relaxed">{mission}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ผู้บริหาร */}
        <div id="executives" className="space-y-8 pt-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-mcu-pink-deep font-sans pb-1.5 border-b-2 border-mcu-gold inline-block">
              {t.execTitle}
            </h2>
          </div>
          
          {/* แถวที่ 1: คณะผู้บริหารระดับสูง */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {executives.map((exec, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-xl border border-border-mcu shadow-mcu-card p-6 flex flex-col items-center text-center w-full max-w-sm ${
                  exec.role === 'director' ? 'md:order-1 border-2 border-mcu-gold bg-mcu-pink-soft/5 shadow-lg' : idx === 1 ? 'md:order-2' : 'md:order-3'
                }`}
              >
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-mcu-gold shadow-md mb-4 relative bg-mcu-pink-soft">
                  <img 
                    src={exec.image} 
                    alt={exec.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-mcu-pink-deep font-sans">{exec.name}</h3>
                <p className="text-xs text-muted-text-mcu font-light mt-1">{exec.position}</p>
                <div className="w-10 h-0.5 bg-mcu-gold mt-3"></div>
              </div>
            ))}
          </div>

          {/* แถวที่ 2: ผู้อำนวยการสำนักงาน */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 pt-4">
            {officeDirectors.map((exec, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl border border-border-mcu shadow-mcu-card p-6 flex flex-col items-center text-center w-full max-w-sm hover:shadow-md transition-shadow"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-mcu-pink-light shadow-md mb-4 relative bg-mcu-pink-soft">
                  <img 
                    src={exec.image} 
                    alt={exec.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-mcu-pink-deep font-sans">{exec.name}</h3>
                <p className="text-xs text-muted-text-mcu font-light mt-1">{exec.position}</p>
                <div className="w-10 h-0.5 bg-mcu-pink mt-3"></div>
              </div>
            ))}
          </div>

          {/* CTA Link to Personnel Directory */}
          <div className="text-center pt-6">
            <a
              href="/personnel"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, '', '/personnel');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mcu-pink hover:bg-mcu-pink-deep text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <LucideIcon name="Users" size={18} />
              <span>{lang === 'th' ? 'ดูทำเนียบบุคลากรและอาจารย์ทั้งหมด' : 'View Full Personnel & Faculty Directory'}</span>
              <LucideIcon name="ArrowRight" size={16} />
            </a>
          </div>
        </div>

        {/* 5. โครงสร้างองค์กรวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ */}
        <div id="structure" className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-mcu-pink-deep font-sans pb-1.5 border-b-2 border-mcu-gold inline-block">
              {t.structureTitle}
            </h2>
            <p className="text-xs text-slate-500 font-light max-w-2xl mx-auto">
              ผังแสดงสายการบริหารและการดำเนินงานของวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>

          <div className="bg-gradient-to-b from-slate-50 to-amber-50/30 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-3xl max-w-5xl mx-auto space-y-8 shadow-sm">
            {/* คณะกรรมการประจำวิทยาลัยสงฆ์ */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white border-2 border-mcu-gold px-8 py-4 rounded-2xl shadow-md text-center max-w-xl w-full space-y-1 transform hover:scale-[1.01] transition-transform">
                <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider block">สภาสถาบัน & นโยบายสูงสุด</span>
                <h3 className="text-base sm:text-lg font-bold text-mcu-gold-light">
                  คณะกรรมการประจำวิทยาลัยสงฆ์
                </h3>
                <p className="text-xs text-amber-100/90 font-light leading-relaxed">
                  สภาสถาบันและนโยบายสูงสุด กำกับดูแลนโยบายการบริหารและแผนยุทธศาสตร์วิทยาลัย
                </p>
              </div>
            </div>

            {/* Connecting Line 1 */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-amber-600 to-amber-500 mx-auto"></div>

            {/* ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white border-2 border-mcu-gold p-5 sm:p-6 rounded-2xl shadow-lg text-center max-w-2xl w-full flex flex-col sm:flex-row items-center gap-5 transform hover:scale-[1.01] transition-transform">
                <img 
                  src={executives[0].image} 
                  alt={executives[0].name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-mcu-gold shrink-0 shadow-md"
                />
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[10px] bg-mcu-gold text-amber-950 font-bold px-2.5 py-0.5 rounded-full inline-block">
                    ผู้บริหารสูงสุด
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-mcu-gold-light">
                    ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-white">
                    {executives[0].name}
                  </p>
                  <p className="text-xs text-mcu-pink-soft font-light">
                    ผู้บริหารสูงสุด (พระราชพัชรธรรมเมธี, ดร.) บริหารงานวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มจร
                  </p>
                </div>
              </div>
            </div>

            {/* Connecting Line 2 */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500 to-mcu-pink mx-auto"></div>

            {/* รองผู้อำนวยการฝ่ายวิชาการ & รองผู้อำนวยการฝ่ายบริหาร */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* ฝั่งบริหารวิชาการ */}
              <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/80 p-6 rounded-2xl shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <img 
                      src={executives[1].image} 
                      alt={executives[1].name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-500 shrink-0 shadow-xs"
                    />
                    <div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                        ฝั่งบริหารวิชาการ
                      </span>
                      <h4 className="text-base font-bold text-mcu-pink-deep dark:text-amber-400 mt-1">
                        รองผู้อำนวยการฝ่ายวิชาการ
                      </h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                        {executives[1].name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    ฝั่งบริหารวิชาการ: พระสุธีวชิราภรณ์, ผศ.ดร. (กำกับดูแลงานวิชาการ การเรียนการสอน และนวัตกรรมการศึกษา)
                  </p>
                </div>

                {/* ฝ่ายวิชาการและกิจการนิสิต */}
                <div className="p-4 bg-amber-50/60 dark:bg-slate-800/60 rounded-xl border border-amber-200/60 dark:border-slate-700 space-y-2.5 mt-2">
                  <h5 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 border-b border-amber-200/50 pb-1.5">
                    <span>ฝ่ายวิชาการและกิจการนิสิต</span>
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 pt-1">
                    <li className="flex items-start gap-2">
                      <span className="text-base leading-none">📚</span>
                      <span className="font-semibold">งานพัฒนาหลักสูตรและการเรียนการสอน</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-base leading-none">🎓</span>
                      <span className="font-semibold">งานทะเบียน ผลการเรียน และการวัดผล</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-base leading-none">🌟</span>
                      <span className="font-semibold">งานกิจการนิสิต ทุนการศึกษา สวัสดิการ & ทำนุบำรุงศิลปวัฒนธรรม</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* ฝั่งบริหารสำนักงาน */}
              <div className="bg-white dark:bg-slate-900 border-2 border-mcu-pink/80 p-6 rounded-2xl shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <img 
                      src={executives[2].image} 
                      alt={executives[2].name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-mcu-pink shrink-0 shadow-xs"
                    />
                    <div>
                      <span className="text-[10px] font-bold bg-mcu-pink-soft text-mcu-pink-deep px-2.5 py-0.5 rounded-full">
                        ฝั่งบริหารสำนักงาน
                      </span>
                      <h4 className="text-base font-bold text-mcu-pink-deep dark:text-amber-400 mt-1">
                        รองผู้อำนวยการฝ่ายบริหาร
                      </h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                        {executives[2].name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    ฝั่งบริหารสำนักงาน: พระสิริพัชรโสภิต, ดร. (กำกับดูแลงานสารบรรณ การเงิน งบประมาณ และอาคารสถานที่)
                  </p>
                </div>

                {/* ฝ่ายบริหารและงานสารบรรณ */}
                <div className="p-4 bg-mcu-pink-soft/20 dark:bg-slate-800/60 rounded-xl border border-mcu-pink-light/60 dark:border-slate-700 space-y-2.5 mt-2">
                  <h5 className="text-xs sm:text-sm font-bold text-mcu-pink-deep dark:text-mcu-pink-light flex items-center gap-1.5 border-b border-mcu-pink-light/50 pb-1.5">
                    <span>ฝ่ายบริหารและงานสารบรรณ</span>
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 pt-1">
                    <li className="flex items-start gap-2">
                      <span className="text-base leading-none">📜</span>
                      <span className="font-semibold">งานสารบรรณ เอกสาร และธุรการกลาง</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-base leading-none">💰</span>
                      <span className="font-semibold">งานการเงิน งบประมาณ แผนงาน & พัสดุ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-base leading-none">🏢</span>
                      <span className="font-semibold">งานเทคโนโลยีสารสนเทศ & อาคารสถานที่</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
