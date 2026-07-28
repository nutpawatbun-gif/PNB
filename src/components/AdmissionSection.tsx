/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LucideIcon from './LucideIcon';
import { api } from '../lib/api';

interface AdmissionSectionProps {
  lang: 'th' | 'en';
  onGoToAdmissionTab: (subTab?: string) => void;
  onGoToCoursesTab: () => void;
}

export default function AdmissionSection({
  lang,
  onGoToAdmissionTab,
  onGoToCoursesTab
}: AdmissionSectionProps) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [applicantId, setApplicantId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [admissionProjects, setAdmissionProjects] = useState<any[]>([]);

  useEffect(() => {
    api.getAdmissions()
      .then(data => {
        if (Array.isArray(data)) setAdmissionProjects(data);
      })
      .catch(err => console.warn('Failed to load admissions in section:', err));
  }, []);

  // Demo registration records
  const mockApplicants: Record<string, any> = {
    "69001": {
      name: "พระมหาสมบูรณ์ กิตฺติญาโณ",
      program: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา",
      level: "ปริญญาตรี (ภาคปกติ)",
      status: "approved",
      statusText: "ผ่านการคัดเลือกเข้าศึกษาต่อ",
      details: "ผ่านการตรวจสอบคุณสมบัติและสอบสัมภาษณ์เรียบร้อยแล้ว กรุณารายงานตัวและขึ้นทะเบียนนิสิตใหม่ในวันที่ 1-5 สิงหาคม 2569 ณ ฝ่ายทะเบียนและวัดผล"
    },
    "69002": {
      name: "นายปกรณ์ บุญช่วยเหลือ",
      program: "หลักสูตรรัฐประศาสนศาสตรบัณฑิต สาขาวิชารัฐประศาสนศาสตร์",
      level: "ปริญญาตรี (ภาคพิเศษ เสาร์-อาทิตย์)",
      status: "pending",
      statusText: "อยู่ระหว่างการตรวจสอบเอกสารและหลักฐาน",
      details: "เจ้าหน้าที่ได้รับเอกสารของท่านแล้ว กำลังตรวจสอบความถูกต้องของสำเนาวุฒิการศึกษา ม.6 จะแจ้งกำหนดการสอบสัมภาษณ์ผ่านอีเมลหรือเบอร์โทรศัพท์ของท่าน"
    },
    "69003": {
      name: "พระสุทธิพงษ์ ฐิตปญฺโญ",
      program: "หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาพระพุทธศาสนา",
      level: "ปริญญาโท (ภาคพิเศษ)",
      status: "interview",
      statusText: "ได้รับสิทธิ์เข้าสอบสัมภาษณ์",
      details: "ขอเชิญเข้าสอบสัมภาษณ์ทางวิชาการและการปฏิบัติจิตภาวนา ในวันที่ 25 กรกฎาคม 2569 เวลา 09.00 น. ณ อาคารบัณฑิตศึกษา ห้องสัมมนา 1"
    }
  };

  const handleStatusSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearchResult(null);

    const cleanId = applicantId.trim();
    if (!cleanId) {
      setErrorMsg(lang === 'th' ? 'กรุณากรอกเลขประจำตัวผู้สมัคร' : 'Please input your Applicant ID.');
      return;
    }

    const found = mockApplicants[cleanId];
    if (found) {
      setSearchResult(found);
    } else {
      setErrorMsg(lang === 'th' 
        ? 'ไม่พบเลขประจำตัวผู้สมัครในระบบทะเบียน (กรุณาลองกรอก 69001, 69002 หรือ 69003 เพื่อทดสอบตัวอย่างการแสดงผล)' 
        : 'Applicant ID not found. (Please enter 69001, 69002, or 69003 to test the tracking display)'
      );
    }
  };

  const t = {
    title: lang === 'th' ? 'ขั้นตอนการสมัครเข้าศึกษาต่อ' : 'Admission Steps & Enrollment',
    sub: lang === 'th' ? 'ขั้นตอนการสมัครเรียนออนไลน์ง่าย ๆ เพียง 4 ขั้นตอนเพื่อเริ่มต้นสิทธิ์เรียน มจร' : 'Four easy steps to join Phokhun Phamuang Buddhist College.',
    step1Title: lang === 'th' ? '1. ศึกษารายละเอียดหลักสูตร' : '1. Study Programs',
    step1Desc: lang === 'th' ? 'เลือกหลักสูตรที่เหมาะสมกับความประสงค์และการทำงานในระดับปริญญาต่าง ๆ' : 'Select a program and degree tier fitting your goals.',
    step2Title: lang === 'th' ? '2. ตรวจสอบคุณสมบัติ' : '2. Check Qualifications',
    step2Desc: lang === 'th' ? 'ตรวจสอบวุฒิการศึกษา ข้อบังคับสงฆ์ หรือเกณฑ์เฉพาะของสถาบันที่ท่านเลือก' : 'Verify academic prerequisites and clergy recommendations.',
    step3Title: lang === 'th' ? '3. กรอกใบสมัครออนไลน์' : '3. Apply Online',
    step3Desc: lang === 'th' ? 'กรอกข้อมูลส่วนบุคคล แนบไฟล์สำเนาวุฒิการศึกษาและหลักฐานผ่านหน้าเว็บไซต์' : 'Fill out personal details and upload required academic paper scans.',
    step4Title: lang === 'th' ? '4. ตรวจสอบสถานะการสมัคร' : '4. Check Progress',
    step4Desc: lang === 'th' ? 'ติดตามการอนุมัติเอกสารและผลการคัดเลือกได้รวดเร็วผ่านเลขรหัสผู้สมัคร' : 'Follow review notes and interview times through your applicant code.',
    btnGuide: lang === 'th' ? 'ดูประกาศรับสมัคร' : 'View Admission Guidelines',
    btnApply: lang === 'th' ? 'สมัครเรียนออนไลน์' : 'Apply Online Now',
    btnStatus: lang === 'th' ? 'ตรวจสอบสถานะผู้สมัคร' : 'Track Status (Demo)',
    modalTitle: lang === 'th' ? 'ตรวจสอบสถานะการสมัครเรียน (ระบบสาธิต)' : 'Track Admission Status (Demo Portal)',
    modalDesc: lang === 'th' ? 'กรอกรหัสประจำตัวผู้สมัครเรียนเพื่อสืบค้นผลการส่งใบสมัครและสิทธิ์คัดเลือกเข้าเรียนต่อ' : 'Input your candidate ID to check review progress.',
    inputId: lang === 'th' ? 'รหัสผู้สมัคร (เช่น: 69001)' : 'Applicant ID (e.g., 69001)',
    searchBtn: lang === 'th' ? 'ค้นหา' : 'Search',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    appInfo: lang === 'th' ? 'ข้อมูลผู้สมัคร' : 'Candidate Details',
    appName: lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name / Monastic Name',
    appProg: lang === 'th' ? 'หลักสูตรที่ยื่นสมัคร' : 'Selected Curriculum',
    appLevel: lang === 'th' ? 'ระดับการศึกษา' : 'Academic Level',
    appStatus: lang === 'th' ? 'สถานะล่าสุด' : 'Current Status',
    appResult: lang === 'th' ? 'รายละเอียดเพิ่มเติม' : 'Next Steps & Guidance'
  };

  return (
    <section className="py-16 bg-white border-b border-mcu-pink-light" id="admission">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">{lang === 'th' ? 'รับสมัครนักศึกษาใหม่' : 'Student Admissions'}</span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep mb-3 font-sans thai-gold-border pb-2 inline-block">
            {t.title}
          </h2>
          <p className="text-sm text-muted-text-mcu max-w-2xl mx-auto font-light mt-3">
            {t.sub}
          </p>
        </div>

        {/* 4.7 4-Steps Visual Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Step 1 */}
          <div className="bg-mcu-pink-soft/30 p-6 rounded-2xl border border-mcu-pink-light flex flex-col items-center text-center relative group hover:bg-white hover:shadow-mcu-card duration-300 transition-all">
            <div className="w-14 h-14 rounded-full bg-mcu-pink-light flex items-center justify-center text-mcu-pink-deep mb-4 group-hover:bg-mcu-pink group-hover:text-white duration-300 transition-all shadow-inner">
              <LucideIcon name="BookOpen" size={24} />
            </div>
            <h3 className="text-base font-bold text-mcu-pink-deep mb-2 font-sans">{t.step1Title}</h3>
            <p className="text-xs sm:text-sm text-text-mcu font-light leading-relaxed">{t.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="bg-mcu-pink-soft/30 p-6 rounded-2xl border border-mcu-pink-light flex flex-col items-center text-center relative group hover:bg-white hover:shadow-mcu-card duration-300 transition-all">
            <div className="w-14 h-14 rounded-full bg-mcu-pink-light flex items-center justify-center text-mcu-pink-deep mb-4 group-hover:bg-mcu-pink group-hover:text-white duration-300 transition-all shadow-inner">
              <LucideIcon name="CheckCircle" size={24} />
            </div>
            <h3 className="text-base font-bold text-mcu-pink-deep mb-2 font-sans">{t.step2Title}</h3>
            <p className="text-xs sm:text-sm text-text-mcu font-light leading-relaxed">{t.step2Desc}</p>
          </div>

          {/* Step 3 */}
          <div className="bg-mcu-pink-soft/30 p-6 rounded-2xl border border-mcu-pink-light flex flex-col items-center text-center relative group hover:bg-white hover:shadow-mcu-card duration-300 transition-all">
            <div className="w-14 h-14 rounded-full bg-mcu-pink-light flex items-center justify-center text-mcu-pink-deep mb-4 group-hover:bg-mcu-pink group-hover:text-white duration-300 transition-all shadow-inner">
              <LucideIcon name="FileText" size={24} />
            </div>
            <h3 className="text-base font-bold text-mcu-pink-deep mb-2 font-sans">{t.step3Title}</h3>
            <p className="text-xs sm:text-sm text-text-mcu font-light leading-relaxed">{t.step3Desc}</p>
          </div>

          {/* Step 4 */}
          <div className="bg-mcu-pink-soft/30 p-6 rounded-2xl border border-mcu-pink-light flex flex-col items-center text-center relative group hover:bg-white hover:shadow-mcu-card duration-300 transition-all">
            <div className="w-14 h-14 rounded-full bg-mcu-pink-light flex items-center justify-center text-mcu-pink-deep mb-4 group-hover:bg-mcu-pink group-hover:text-white duration-300 transition-all shadow-inner">
              <LucideIcon name="Search" size={24} />
            </div>
            <h3 className="text-base font-bold text-mcu-pink-deep mb-2 font-sans">{t.step4Title}</h3>
            <p className="text-xs sm:text-sm text-text-mcu font-light leading-relaxed">{t.step4Desc}</p>
          </div>

        </div>

        {/* ACTIVE ADMISSION PROJECTS CARDS (DYNAMIC FROM BACKEND CMS) */}
        {admissionProjects.length > 0 && (
          <div className="mb-10 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-mcu-pink-soft/30 p-6 sm:p-8 rounded-3xl border border-mcu-gold/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-mcu-gold/20 text-amber-800 border border-mcu-gold/40 mb-1">
                  <LucideIcon name="Sparkles" size={14} className="text-amber-600" />
                  <span>{lang === 'th' ? 'โครงการรับสมัครที่กำลังเปิดรับสมัคร' : 'Active Admission Programs'}</span>
                </div>
                <h3 className="text-xl font-bold text-mcu-pink-deep">
                  {lang === 'th' ? 'โครงการรับสมัครนิสิตใหม่ ประจำปีการศึกษา 2569' : 'Academic Admissions 2569'}
                </h3>
              </div>
              <button
                onClick={() => onGoToAdmissionTab('overview')}
                className="text-xs font-bold text-mcu-pink-deep hover:text-mcu-pink flex items-center gap-1 cursor-pointer bg-white px-4 py-2 rounded-full border border-mcu-pink-light shadow-xs"
              >
                <span>{lang === 'th' ? 'ดูโครงการรับสมัครทั้งหมด' : 'View All Programs'}</span>
                <LucideIcon name="ChevronRight" size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {admissionProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white p-5 rounded-2xl border border-mcu-pink-light/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        proj.degreeLevel?.includes('โท') ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {proj.degreeLevel || 'ปริญญาโท'}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ● กำลังเปิดรับสมัคร
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-light line-clamp-2">
                      {proj.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">ปีการศึกษา:</span> {proj.academicYear || '2569'}
                      {proj.quota && <span className="ml-2">| <strong>จำนวน:</strong> {proj.quota} อัตรา</span>}
                    </div>
                    <button
                      onClick={() => onGoToAdmissionTab('apply')}
                      className="px-4 py-1.5 bg-mcu-pink hover:bg-mcu-pink-dark text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <LucideIcon name="GraduationCap" size={14} />
                      <span>{lang === 'th' ? 'สมัครเรียน' : 'Apply'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => onGoToAdmissionTab('guide')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-mcu-pink hover:bg-mcu-pink-dark text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            <LucideIcon name="Info" size={16} className="mr-1.5" />
            <span>{t.btnGuide}</span>
          </button>
          <button
            onClick={() => onGoToAdmissionTab('apply')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-mcu-pink-soft text-mcu-pink border-2 border-mcu-pink font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center"
          >
            <LucideIcon name="GraduationCap" size={16} className="mr-1.5" />
            <span>{t.btnApply}</span>
          </button>
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-mcu-gold hover:bg-mcu-gold-light text-mcu-pink-deep hover:text-mcu-pink-deep font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center border-2 border-transparent"
          >
            <LucideIcon name="Search" size={16} className="mr-1.5" />
            <span>{t.btnStatus}</span>
          </button>
        </div>

      </div>

      {/* 4.7 & 8 Student Admission Tracker Demo Popup */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-mcu-pink-deep/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-mcu-gold max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white px-6 py-4 flex justify-between items-center border-b border-mcu-gold sticky top-0">
              <div className="flex items-center space-x-2">
                <LucideIcon name="Search" className="text-mcu-gold" size={18} />
                <h3 className="text-sm sm:text-base font-bold text-mcu-gold-light">{t.modalTitle}</h3>
              </div>
              <button 
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setSearchResult(null);
                  setApplicantId('');
                  setErrorMsg('');
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full cursor-pointer focus:outline-none"
                aria-label="Close dialog"
              >
                <LucideIcon name="X" size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <p className="text-xs sm:text-sm text-muted-text-mcu font-light mb-4">
                {t.modalDesc}
              </p>

              {/* Form */}
              <form onSubmit={handleStatusSearch} className="flex gap-2 mb-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mcu-pink-deep">
                    <LucideIcon name="Users" size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder={t.inputId}
                    value={applicantId}
                    onChange={(e) => setApplicantId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border-mcu rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink focus:border-transparent bg-mcu-pink-soft/20 text-text-mcu font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-mcu-pink hover:bg-mcu-pink-dark text-white px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center"
                >
                  <LucideIcon name="Search" size={14} className="mr-1" />
                  <span>{t.searchBtn}</span>
                </button>
              </form>

              {/* Guidance for demo */}
              <p className="text-[10px] text-mcu-pink-deep/80 mb-6 bg-mcu-pink-soft/50 px-2.5 py-1 rounded border border-mcu-pink-light/40">
                * {lang === 'th' ? 'สืบค้นตัวอย่างระบบติดตามผล: ท่านสามารถกรอกรหัส 69001, 69002 หรือ 69003 เพื่อทดลองระบบ' : 'Tracking Guide: You can enter 69001, 69002, or 69003 to test the query interface'}
              </p>

              {/* Error messages */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start">
                  <LucideIcon name="AlertCircle" className="mr-2 flex-shrink-0 mt-0.5" size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Search Result */}
              {searchResult && (
                <div className="bg-mcu-pink-soft/30 border border-mcu-pink-light rounded-xl p-5 space-y-4 animate-fade-in text-xs sm:text-sm">
                  <div className="flex justify-between items-center pb-2.5 border-b border-mcu-pink-light/60">
                    <h4 className="font-bold text-mcu-pink-deep">{t.appInfo}</h4>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      searchResult.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      searchResult.status === 'interview' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {searchResult.statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-y-2.5 text-xs sm:text-sm">
                    <span className="text-muted-text-mcu">{t.appName}:</span>
                    <strong className="col-span-2 text-text-mcu">{searchResult.name}</strong>

                    <span className="text-muted-text-mcu">{t.appProg}:</span>
                    <span className="col-span-2 text-text-mcu font-medium">{searchResult.program}</span>

                    <span className="text-muted-text-mcu">{t.appLevel}:</span>
                    <span className="col-span-2 text-text-mcu font-light">{searchResult.level}</span>
                  </div>

                  <div className="pt-3 border-t border-mcu-pink-light/60 bg-white/60 p-3 rounded-lg border border-mcu-pink-light/30">
                    <span className="text-[11px] text-muted-text-mcu block font-bold uppercase tracking-wider mb-1">{t.appResult}:</span>
                    <p className="text-xs text-text-mcu font-light leading-relaxed">
                      {searchResult.details}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-mcu-pink-light/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setSearchResult(null);
                    setApplicantId('');
                    setErrorMsg('');
                  }}
                  className="bg-mcu-pink-soft text-mcu-pink-deep hover:bg-mcu-pink-light border border-mcu-pink-light px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  {t.close}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
