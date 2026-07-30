import React from 'react';
import { FileCheck, Edit3, CheckCircle2 } from 'lucide-react';
import { Course } from '../../types';

interface Step4ReviewSummaryProps {
  personType: 'monk' | 'layperson';
  prefix: string;
  firstName: string;
  lastName: string;
  ordinationName: string;
  templeName: string;
  templeDistrict: string;
  templeProvince: string;
  nationalId: string;
  birthDate: string;
  phone: string;
  email: string;
  educationalBackground: string;
  selectedCourse: Course;
  documents: {
    nationalIdCopy?: { name: string; size: string; url?: string };
    transcriptCopy?: { name: string; size: string; url?: string };
    photoCopy?: { name: string; size: string; url?: string };
    houseRegistrationCopy?: { name: string; size: string; url?: string };
  };
  pdpaConsent: boolean;
  onPdpaConsentChange: (val: boolean) => void;
  onGoToStep: (step: number) => void;
}

export default function Step4ReviewSummary({
  personType,
  prefix,
  firstName,
  lastName,
  ordinationName,
  templeName,
  templeDistrict,
  templeProvince,
  nationalId,
  birthDate,
  phone,
  email,
  educationalBackground,
  selectedCourse,
  documents,
  pdpaConsent,
  onPdpaConsentChange,
  onGoToStep
}: Step4ReviewSummaryProps) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileCheck className="text-amber-600" size={20} />
          <span>ขั้นตอนที่ 4: ตรวจสอบความถูกต้องสมบูรณ์และยินยอม PDPA</span>
        </h3>
        <p className="text-xs text-slate-500 font-light">
          กรุณาตรวจสอบสรุปข้อมูลทั้ง 3 ส่วนก่อนกดยืนยัน หากต้องการแก้ไขสามารถกดปุ่ม "แก้ไข" ได้ทันที
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1 Review */}
        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">1. ข้อมูลประวัติส่วนตัวผู้สมัคร</h4>
            <button onClick={() => onGoToStep(2)} className="text-mcu-pink font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer">
              <Edit3 size={12} /> แก้ไข
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
            <p>สถานภาพ: <strong>{personType === 'monk' ? 'บรรพชิต (พระภิกษุ-สามเณร)' : 'คฤหัสถ์ (บุคคลทั่วไป)'}</strong></p>
            <p>ชื่อ-นามสกุล: <strong>{prefix} {firstName} {lastName}</strong></p>
            {personType === 'monk' && (
              <>
                <p>ฉายาบาลี: <strong>{ordinationName}</strong></p>
                <p>สังกัดวัด: <strong>{templeName} ({templeDistrict}, {templeProvince})</strong></p>
              </>
            )}
            <p>เลขบัตรประชาชน/สุทธิ: <strong>{nationalId}</strong></p>
            <p>วันเกิด: <strong>{birthDate}</strong></p>
            <p>ติดต่อ: <strong>{phone} | {email}</strong></p>
          </div>
        </div>

        {/* Step 2 Review */}
        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">2. วุฒิเดิมและสาขาวิชาที่เลือก</h4>
            <button onClick={() => onGoToStep(1)} className="text-mcu-pink font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer">
              <Edit3 size={12} /> แก้ไข
            </button>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p>วุฒิการศึกษาสูงสุดเดิม: <strong>{educationalBackground}</strong></p>
            <p>หลักสูตรที่สมัคร: <strong className="text-mcu-pink text-sm">{selectedCourse?.name}</strong></p>
          </div>
        </div>

        {/* Step 3 Review */}
        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">3. หลักฐานเอกสารประกอบ</h4>
            <button onClick={() => onGoToStep(3)} className="text-mcu-pink font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer">
              <Edit3 size={12} /> แก้ไข
            </button>
          </div>
          <div className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1 font-semibold">
            <p>✓ สำเนาบัตรประชาชน/หนังสือสุทธิ: {documents.nationalIdCopy?.name}</p>
            <p>✓ สำเนาวุฒิการศึกษาล่าสุด: {documents.transcriptCopy?.name}</p>
            <p>✓ รูปถ่ายหน้าตรง 1.5 นิ้ว: {documents.photoCopy?.name}</p>
          </div>
        </div>

        {/* PDPA Consent Box */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/40 rounded-2xl space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pdpaConsent}
              onChange={(e) => onPdpaConsentChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              ข้าพเจ้าขอรับรองว่าข้อมูลและหลักฐานเอกสารทั้งหมดที่ระบุในใบสมัครนี้เป็นความจริงทุกประการ และยินยอมให้วิทยาลัยสงฆ์พ่อขุนผาเมือง มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประมวลผลข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) เพื่อประโยชน์ในการรับสมัครเข้าศึกษาและการประสานงานจัดสอบสัมภาษณ์ *
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
