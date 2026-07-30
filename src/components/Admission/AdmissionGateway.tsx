import React from 'react';

interface AdmissionGatewayProps {
  onSelectStatus: (type: 'monk' | 'layperson') => void;
}

export default function AdmissionGateway({ onSelectStatus }: AdmissionGatewayProps) {
  return (
    <div className="bg-gradient-to-b from-amber-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-amber-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-12 shadow-xl text-center space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="max-w-2xl mx-auto space-y-3">
        <span className="inline-block px-4 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-widest border border-amber-300/40">
          สถานภาพผู้สมัคร
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          ระบบรับสมัครนักศึกษาออนไลน์
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold">
          มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
        </p>
        <div className="pt-4">
          <h3 className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-400">
            กรุณาเลือกสถานะเพื่อเริ่มต้น
          </h3>
        </div>
      </div>

      {/* 2 Status Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
        {/* Card 1: บรรพชิต */}
        <button
          type="button"
          onClick={() => onSelectStatus('monk')}
          className="group relative bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 shadow-md hover:shadow-2xl hover:border-amber-500 transition-all duration-300 text-center cursor-pointer flex flex-col items-center justify-between border-b-8 border-b-amber-600 hover:-translate-y-1.5"
        >
          <div className="w-24 h-24 bg-amber-50 dark:bg-amber-950/60 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-amber-200/60">
            <span className="text-5xl select-none">🪷</span>
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-amber-900 dark:text-amber-200 group-hover:text-amber-600 transition-colors">
              บรรพชิต
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              พระภิกษุ - สามเณร
            </p>
          </div>
          <div className="mt-8 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md group-hover:bg-amber-700 transition-all flex items-center gap-1.5">
            <span>เลือกสถานะบรรพชิต 🚀</span>
          </div>
        </button>

        {/* Card 2: คฤหัสถ์ */}
        <button
          type="button"
          onClick={() => onSelectStatus('layperson')}
          className="group relative bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-mcu-pink transition-all duration-300 text-center cursor-pointer flex flex-col items-center justify-between border-b-8 border-b-slate-600 dark:border-b-slate-700 hover:-translate-y-1.5"
        >
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/60 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-slate-200/60">
            <span className="text-5xl select-none">👤</span>
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-mcu-pink transition-colors">
              คฤหัสถ์
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              บุคคลทั่วไป / ฆราวาส
            </p>
          </div>
          <div className="mt-8 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md group-hover:bg-slate-900 transition-all flex items-center gap-1.5">
            <span>เลือกสถานะคฤหัสถ์ 🚀</span>
          </div>
        </button>
      </div>

      <p className="text-xs text-slate-400 font-light">
        * ท่านสามารถคลิกเปลี่ยนสถานภาพผู้สมัครย้อนหลังได้ตลอดเวลา
      </p>
    </div>
  );
}
