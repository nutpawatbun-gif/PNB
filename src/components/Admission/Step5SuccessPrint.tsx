import React from 'react';
import { CheckCircle2, Printer, Search, QrCode, Clock, Lock } from 'lucide-react';

interface Step5SuccessPrintProps {
  submittedCode: string;
  applicantStatus?: string;
  onOpenPrintModal: () => void;
  onNavigateToStatus: (code: string) => void;
}

export default function Step5SuccessPrint({
  submittedCode,
  applicantStatus = 'pending',
  onOpenPrintModal,
  onNavigateToStatus
}: Step5SuccessPrintProps) {
  const codeFormatted = submittedCode.startsWith('MCU-69-')
    ? submittedCode
    : `MCU-69-${submittedCode.replace(/\D/g, '') || '69001'}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `https://pkpm.mcu.ac.th/admission/track?code=${codeFormatted}`
  )}`;

  const isApprovedOrInterview = applicantStatus === 'approved' || applicantStatus === 'interview';

  return (
    <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 size={40} />
      </div>

      <div className="space-y-2">
        <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
          ยื่นใบสมัครออนไลน์เรียบร้อยแล้ว (Successfully Submitted)
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
          รหัสผู้สมัครของคุณคือ <span className="text-mcu-pink font-mono">{codeFormatted}</span>
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          กรุณาบันทึกรหัสผู้สมัครนี้เพื่อติดตามสถานะการตรวจสอบเอกสารจากเจ้าหน้าที่ผ่านระบบออนไลน์
        </p>
      </div>

      {/* Status Requirement Box */}
      {!isApprovedOrInterview ? (
        <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 rounded-2xl max-w-md mx-auto space-y-1.5 text-left shadow-xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 dark:text-amber-300">
            <Clock size={16} className="animate-spin text-amber-600 shrink-0" />
            <span>สถานะใบสมัคร: ⏳ อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบเอกสาร</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed pl-6">
            ขณะนี้ใบสมัครของคุณอยู่ระหว่างการตรวจสอบความถูกต้องโดยเจ้าหน้าที่ฝ่ายรับสมัคร ปุ่มพิมพ์ใบสมัครและใบนัดสอบสัมภาษณ์จะถูกเปิดใช้งานอัตโนมัติเมื่อได้รับการอนุมัติเรียบร้อยแล้ว
          </p>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-900 rounded-2xl max-w-md mx-auto space-y-1.5 text-left shadow-xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>สถานะใบสมัคร: 🎙️ ผ่านการอนุมัติเอกสารเรียบร้อยแล้ว</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed pl-6">
            เจ้าหน้าที่อนุมัติเอกสารเรียบร้อยแล้ว ท่านสามารถพิมพ์ใบสมัครฉบับเต็มเพื่อนำมายื่นในวันสอบสัมภาษณ์ได้ทันที
          </p>
        </div>
      )}

      {/* QR Code Verification Preview */}
      <div className="p-5 max-w-xs mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
          <QrCode size={18} className="text-amber-600" />
          <span>Interview Verification QR Code</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs inline-block">
          <img
            src={qrCodeUrl}
            alt="Applicant QR Code"
            className="w-32 h-32 mx-auto"
          />
        </div>
        <p className="text-[10px] text-slate-500 font-medium">
          กรรมการสอบสัมภาษณ์สามารถสแกนเพื่อตรวจสอบเอกสารตัวจริงได้ทันที
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {isApprovedOrInterview ? (
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            <span>พิมพ์ใบสมัคร (Print Application Form A4)</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold shadow-xs cursor-not-allowed flex items-center justify-center gap-2 opacity-70"
            title="ปุ่มพิมพ์ใบสมัครจะเปิดใช้งานเมื่อเจ้าหน้าที่อนุมัติเอกสารแล้วเท่านั้น"
          >
            <Lock size={16} />
            <span>พิมพ์ใบสมัคร (รออนุมัติจากเจ้าหน้าที่)</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigateToStatus(codeFormatted)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-mcu-pink hover:from-amber-700 hover:to-mcu-pink-deep text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <Search size={16} />
          <span>ติดตามสถานะการอนุมัติ</span>
        </button>
      </div>
    </div>
  );
}
