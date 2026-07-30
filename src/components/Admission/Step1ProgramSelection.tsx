import React from 'react';
import { Course } from '../../types';
import { GraduationCap, Sparkles, CheckCircle2, Clock, BookOpen, Building } from 'lucide-react';
import { InputField } from '../ui/FormControls';

interface Step1ProgramSelectionProps {
  courses: Course[];
  selectedProgramId: string;
  onSelectProgram: (id: string) => void;
  levelFilter: string;
  onLevelFilterChange: (level: string) => void;
  educationalBackground: string;
  onEduBgChange: (bg: string) => void;
  customEduBgDetails: string;
  onCustomEduBgDetailsChange: (val: string) => void;
  previousInstitute: string;
  onPreviousInstituteChange: (val: string) => void;
  previousGpax: string;
  onPreviousGpaxChange: (val: string) => void;
}

export default function Step1ProgramSelection({
  courses,
  selectedProgramId,
  onSelectProgram,
  levelFilter,
  onLevelFilterChange,
  educationalBackground,
  onEduBgChange,
  customEduBgDetails,
  onCustomEduBgDetailsChange,
  previousInstitute,
  onPreviousInstituteChange,
  previousGpax,
  onPreviousGpaxChange
}: Step1ProgramSelectionProps) {
  const filteredCourses = courses.filter(
    c => levelFilter === 'all' || (c.degreeLevel || c.level || '').toLowerCase() === levelFilter
  );

  const selectedCourse = courses.find(c => c.id === selectedProgramId) || courses[0];
  const targetLevel = (selectedCourse?.degreeLevel || selectedCourse?.level || 'bachelor').toLowerCase();

  // Smart Educational Logic options mapping
  let eduOptions: { value: string; label: string; hasExtraField?: boolean; extraFieldLabel?: string }[] = [];

  if (targetLevel.includes('master') || targetLevel.includes('โท')) {
    eduOptions = [
      { value: 'ปริญญาตรี (หรือเทียบเท่า)', label: '🎓 ปริญญาตรี (หรือเทียบเท่า)' },
      { value: 'เปรียญธรรม 9 ประโยค (ป.ธ. 9)', label: '🪷 เปรียญธรรม 9 ประโยค (ป.ธ. 9)' },
      { value: 'อื่นๆ (โปรดระบุ)', label: '🌐 อื่นๆ / วุฒิต่างประเทศ (โปรดระบุ)', hasExtraField: true, extraFieldLabel: 'โปรดระบุวุฒิการศึกษา' }
    ];
  } else if (targetLevel.includes('doctor') || targetLevel.includes('เอก')) {
    eduOptions = [
      { value: 'ปริญญาโท (หรือเทียบเท่า)', label: '📜 ปริญญาโท (หรือเทียบเท่า)' },
      { value: 'อื่นๆ (โปรดระบุ)', label: '🌐 อื่นๆ / วุฒิต่างประเทศ (โปรดระบุ)', hasExtraField: true, extraFieldLabel: 'โปรดระบุวุฒิการศึกษา' }
    ];
  } else if (targetLevel.includes('cert') || targetLevel.includes('ประกาศนียบัตร')) {
    eduOptions = [
      { value: 'นักธรรมตรี, โท, เอก', label: '🪷 นักธรรมตรี, โท, เอก' },
      { value: 'เปรียญธรรม', label: '🪷 เปรียญธรรม (ป.ธ. 1-9)' },
      { value: 'อื่นๆ (โปรดระบุ)', label: '✏️ อื่นๆ (โปรดระบุ)', hasExtraField: true, extraFieldLabel: 'โปรดระบุวุฒิการศึกษา' }
    ];
  } else {
    // ปริญญาตรี (Bachelor) Default
    eduOptions = [
      { value: 'พระปริยัติธรรมแผนกสามัญศึกษา', label: '🪷 พระปริยัติธรรมแผนกสามัญศึกษา' },
      { value: 'มัธยมศึกษาปีที่ 6 (ม.6)', label: '🎓 มัธยมศึกษาปีที่ 6 (ม.6)' },
      { value: 'มัธยมศึกษาตอนปลาย (กศน.หรือ สกร.)', label: '🏫 มัธยมศึกษาตอนปลาย (กศน. หรือ สกร.)' },
      { value: 'เทียบวุฒิการศึกษา', label: '⚖️ เทียบวุฒิการศึกษา (โปรดระบุ)', hasExtraField: true, extraFieldLabel: 'โปรดระบุวุฒิที่นำมาเทียบ' },
      { value: 'อื่นๆ (เช่น ปวช. ปวส. อนุปริญญา)', label: '✏️ อื่นๆ (เช่น ปวช. ปวส. อนุปริญญา)', hasExtraField: true, extraFieldLabel: 'โปรดระบุวุฒิการศึกษา' }
    ];
  }

  const selectedOptionObj = eduOptions.find(o => o.value === educationalBackground) || eduOptions[0];
  const requiresExtraInstitueAndGpax = targetLevel.includes('master') || targetLevel.includes('โท') || targetLevel.includes('doctor') || targetLevel.includes('เอก') || educationalBackground.includes('ปริญญา');

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap className="text-amber-600" size={20} />
          <span>ขั้นตอนที่ 1: เลือกหลักสูตรและระบุวุฒิการศึกษาเดิม (Smart Education Logic)</span>
        </h3>
        <p className="text-xs text-slate-500 font-light">
          ระบบจะปรับเปลี่ยนตัวเลือกวุฒิการศึกษาเดิมอัตโนมัติตามระดับหลักสูตรที่เลือกเพื่อความถูกต้องตามเกณฑ์สถาบัน
        </p>
      </div>

      {/* Program Level Filter & Selection */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <BookOpen size={16} className="text-amber-600" />
            <span>1. เลือกสาขาวิชาที่เปิดรับสมัคร (Available Programs) *</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'bachelor', label: '🎓 ปริญญาตรี' },
              { id: 'master', label: '📜 ปริญญาโท' },
              { id: 'doctor', label: '🏆 ปริญญาเอก' },
              { id: 'certificate', label: '🎖️ ประกาศนียบัตร' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onLevelFilterChange(f.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  levelFilter === f.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-amber-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Selection List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((c) => {
            const isSelected = selectedProgramId === c.id;
            const isClosed = c.status === 'inactive' || (c as any).isActive === false;

            return (
              <div
                key={c.id}
                onClick={() => !isClosed && onSelectProgram(c.id)}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer relative ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-500/30'
                    : isClosed
                    ? 'border-slate-200 bg-slate-50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                      {c.degreeLevel || c.level || 'ปริญญาตรี'}
                    </span>
                    {isSelected && (
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> เลือกล่าสุด
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {c.name || c.nameTh}
                  </h4>
                  <p className="text-xs text-slate-500 font-light">
                    {c.degree || 'พุทธศาสตรบัณฑิต'}
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="flex items-center gap-1">
                      <Clock size={13} className="text-amber-600" />
                      <span>{c.duration || '4 ปี (8 ภาคการศึกษา)'}</span>
                    </p>
                    <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      <Sparkles size={13} />
                      <span>{c.estimatedFee || c.tuitionFee || 'ฟรีทุนอุดหนุนสำหรับพระภิกษุสามเณร'}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Educational Background Logic Section */}
      {!selectedProgramId ? (
        <div className="p-8 bg-amber-50/70 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-900/50 rounded-3xl text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto text-xl shadow-xs">
            🔒
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-300">
              2. กรุณาคลิกเลือกหลักสูตรที่เปิดรับสมัครด้านบนก่อน
            </h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              เมื่อท่านเลือกหลักสูตรที่ต้องการแล้ว ระบบจะเปิดแสดงรายการวุฒิการศึกษาเดิมที่ตรงตามเกณฑ์ของหลักสูตรนั้นให้เลือกโดยอัตโนมัติ
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-2">
              <Building size={16} className="text-amber-600" />
              <span>2. วุฒิการศึกษาสูงสุดเดิมที่นำมาใช้สมัคร (สำหรับหลักสูตร {selectedCourse?.name}) *</span>
            </label>
            <p className="text-[11px] text-slate-500">
              แสดงตัวเลือกเฉพาะเกณฑ์ของระดับ {selectedCourse?.degreeLevel || selectedCourse?.level || 'ปริญญาตรี'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {eduOptions.map((opt) => {
              const isSelected = educationalBackground === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onEduBgChange(opt.value)}
                  className={`p-3.5 rounded-2xl border text-left font-semibold text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-amber-50/50'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Extra Field for Custom/Equivalent Edu Details */}
          {selectedOptionObj?.hasExtraField && (
            <div className="pt-2 animate-in fade-in">
              <InputField
                label={`${selectedOptionObj.extraFieldLabel} *`}
                placeholder="ระบุวุฒิการศึกษา/วุฒิที่นำมาเทียบ"
                value={customEduBgDetails}
                onChange={(e) => onCustomEduBgDetailsChange(e.target.value)}
                required
              />
            </div>
          )}

          {/* Dynamic Extra Fields for Institute & GPAX */}
          {requiresExtraInstitueAndGpax && (
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl space-y-3 animate-in fade-in">
              <span className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 block">
                ⚡ ข้อมูลประกอบคุณสมบัติการเข้าศึกษา (สถาบันเดิม & เกรดเฉลี่ยสะสม)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  label="ชื่อสถาบันการศึกษาเดิมที่สำเร็จการศึกษา *"
                  placeholder="เช่น มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                  value={previousInstitute}
                  onChange={(e) => onPreviousInstituteChange(e.target.value)}
                  required
                />
                <InputField
                  label="เกรดเฉลี่ยสะสม (GPAX) *"
                  placeholder="เช่น 3.50"
                  value={previousGpax}
                  onChange={(e) => onPreviousGpaxChange(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
