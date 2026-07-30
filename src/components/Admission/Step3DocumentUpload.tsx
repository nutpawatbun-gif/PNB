import React from 'react';
import { UploadCloud, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface Step3DocumentUploadProps {
  personType: 'monk' | 'layperson';
  documents: {
    nationalIdCopy?: { name: string; size: string; url?: string };
    transcriptCopy?: { name: string; size: string; url?: string };
    photoCopy?: { name: string; size: string; url?: string };
    houseRegistrationCopy?: { name: string; size: string; url?: string };
    otherDocumentsCopy?: { name: string; size: string; url?: string };
  };
  uploadingDoc: string | null;
  onFileUpload: (
    key: 'nationalIdCopy' | 'transcriptCopy' | 'photoCopy' | 'houseRegistrationCopy' | 'otherDocumentsCopy',
    file: File
  ) => void;
}

export default function Step3DocumentUpload({
  personType,
  documents,
  uploadingDoc,
  onFileUpload
}: Step3DocumentUploadProps) {
  const docConfig = [
    {
      key: 'nationalIdCopy' as const,
      label: personType === 'monk' ? 'สำเนาหนังสือสุทธิ / บัตรประจำตัวประชาชน *' : 'สำเนาบัตรประจำตัวประชาชน *',
      desc: personType === 'monk' ? 'หน้าที่มีชื่อ-ฉายา สังกัดวัด และตราประทับ' : 'สำเนาบัตรประชาชน 1 ชุด พร้อมเซ็นรับรองสำเนาถูกต้อง',
      required: true
    },
    {
      key: 'transcriptCopy' as const,
      label: 'สำเนาวุฒิการศึกษาล่าสุด (Transcript / ใบสุทธิ / ใบ ป.ธ.) *',
      desc: 'ใบแสดงผลการเรียน ม.6 / ใบสุทธิ / ใบเปรียญธรรม 3 ประโยคขึ้นไป',
      required: true
    },
    {
      key: 'photoCopy' as const,
      label: 'รูปถ่ายหน้าตรง 1.5 นิ้ว *',
      desc: personType === 'monk' ? 'รูปถ่ายในพรรษา ชุดจีวรสุภาพ หน้าตรง' : 'รูปถ่ายหน้าตรง ชุดสุภาพ ไม่สวมหมวกหรือแว่นตาดำ',
      required: true
    },
    {
      key: 'houseRegistrationCopy' as const,
      label: 'สำเนาทะเบียนบ้าน (Optional)',
      desc: 'สำเนาทะเบียนบ้านหน้าที่มีชื่อผู้สมัคร 1 ชุด',
      required: false
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UploadCloud className="text-amber-600" size={20} />
          <span>ขั้นตอนที่ 3: อัปโหลดหลักฐานและเอกสารประกอบการสมัคร</span>
        </h3>
        <p className="text-xs text-slate-500 font-light">
          รองรับไฟล์ภาพ .JPG, .PNG และไฟล์ .PDF ขนาดไม่เกิน 5 MB ต่อไฟล์
        </p>
      </div>

      {/* Document Checkboxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docConfig.map((item) => {
          const uploadedFile = documents[item.key];
          const isUploading = uploadingDoc === item.key;

          return (
            <div
              key={item.key}
              className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                uploadedFile
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : item.required
                  ? 'border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                {uploadedFile ? (
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1">
                    <CheckCircle2 size={12} /> อัปโหลดแล้ว
                  </span>
                ) : (
                  item.required && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold shrink-0">
                      จำเป็น
                    </span>
                  )
                )}
              </div>

              {/* File Dropzone or Status */}
              {uploadedFile ? (
                <div className="p-3 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{uploadedFile.name}</span>
                    <span className="text-[10px] text-slate-400">({uploadedFile.size})</span>
                  </div>
                  <label className="text-[11px] text-amber-600 font-bold hover:underline cursor-pointer shrink-0">
                    เปลี่ยนไฟล์
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onFileUpload(item.key, f);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all text-center">
                  <UploadCloud size={24} className="text-amber-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isUploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่อเลือกไฟล์เอกสาร'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, PDF (สูงสุด 5MB)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFileUpload(item.key, f);
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
