import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  BarChart3, 
  Save, 
  RefreshCw, 
  GraduationCap, 
  Users, 
  BookOpen, 
  UserCheck, 
  Award, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  Layers,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface StatsManagerProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function StatsManager({ onNotify }: StatsManagerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<any>({
    academicYear: '2569',
    mode: 'manual',
    lastUpdated: '',
    items: [
      { id: 'stat_students', key: 'students', value: 1250, suffix: '+ รูป/คน', labelTh: 'นิสิตปัจจุบันปีการศึกษา 2569', labelEn: 'Active Students (A.Y. 2569)', iconName: 'Users' },
      { id: 'stat_graduates', key: 'graduates', value: 4500, suffix: '+ รูป/คน', labelTh: 'บัณฑิตผู้สำเร็จการศึกษาสะสม', labelEn: 'Total Graduates', iconName: 'GraduationCap' },
      { id: 'stat_courses', key: 'courses', value: 12, suffix: ' หลักสูตร', labelTh: 'หลักสูตรที่เปิดสอน', labelEn: 'Academic Programs Offered', iconName: 'BookOpen' },
      { id: 'stat_personnel', key: 'personnel', value: 85, suffix: ' ท่าน', labelTh: 'คณาจารย์ประจำและบุคลากร', labelEn: 'Faculty & Staff Members', iconName: 'UserCheck' },
      { id: 'stat_research', key: 'research', value: 120, suffix: '+ เรื่อง', labelTh: 'ผลงานวิจัยและบทความตีพิมพ์', labelEn: 'Research Publications', iconName: 'Award' },
      { id: 'stat_mou', key: 'mou', value: 25, suffix: ' สถาบัน', labelTh: 'เครือข่ายความร่วมมือวิชาการ', labelEn: 'MOU Academic Partners', iconName: 'Building2' }
    ]
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAcademicStats();
      if (data && data.items) {
        setStatsData(data);
      }
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ: ' + (err.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setStatsData((prev: any) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'value' ? Number(value) || 0 : value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateAcademicStats(statsData);
      setStatsData(updated || statsData);
      if (onNotify) onNotify(`บันทึกข้อมูลสถิติประจำปีการศึกษา ${statsData.academicYear} เรียบร้อยแล้ว`, 'success');
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการบันทึกสถิติ: ' + (err.message || ''), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <RefreshCw size={28} className="animate-spin text-amber-600 mx-auto" />
        <p className="text-xs text-slate-500 font-bold">กำลังโหลดข้อมูลสถิติปีการศึกษา...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-amber-700/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold font-mono">
            <Sparkles size={13} />
            <span>ระบบจัดการสถิติองค์กร (Educational Statistics)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BarChart3 size={24} className="text-amber-400" />
            <span>สถิติประจำปีการศึกษา {statsData.academicYear || '2569'}</span>
          </h2>
          <p className="text-xs text-amber-100/80 font-light max-w-xl">
            กำหนดตัวเลขสถิติมงคลและตัวเลขสถิติอย่างเป็นทางการ เพื่อแสดงบนหน้าแรกและรายงานสถาบัน
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={loadStats}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>รีเฟรชข้อมูล</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสถิติปี 2569'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Settings Bar: Academic Year & Calculation Mode */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-600" />
              <span>ระบุปีการศึกษา (Academic Year) *</span>
            </label>
            <input
              type="text"
              value={statsData.academicYear}
              onChange={(e) => setStatsData({ ...statsData, academicYear: e.target.value })}
              required
              placeholder="เช่น 2569"
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Layers size={14} className="text-amber-600" />
              <span>โหมดการประมวลผลตัวเลข (Calculation Mode)</span>
            </label>
            <select
              value={statsData.mode || 'manual'}
              onChange={(e) => setStatsData({ ...statsData, mode: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-sans font-bold"
            >
              <option value="manual">✍️ กำหนดตัวเลขสถิติเอง (Manual Custom Override)</option>
              <option value="auto">🤖 คำนวณยอดรวมจากฐานข้อมูลอัตโนมัติ (Auto-Sync from DB)</option>
            </select>
          </div>
        </div>

        {/* 6 Key Stats Cards Field Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-600" />
              <span>รายการตัวเลขสถิติสำคัญประจำปีการศึกษา {statsData.academicYear}</span>
            </h3>
            {statsData.lastUpdated && (
              <span className="text-[11px] text-slate-400 font-mono">
                อัปเดตล่าสุด: {new Date(statsData.lastUpdated).toLocaleString('th-TH')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(statsData.items || []).map((item: any, idx: number) => (
              <div 
                key={item.id || idx}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all space-y-4 ${
                  item.isVisible !== false 
                    ? 'border-slate-200 dark:border-slate-800 hover:border-amber-400/60 shadow-xs' 
                    : 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider font-mono">
                    รายการที่ #{idx + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleItemChange(idx, 'isVisible', item.isVisible === false ? true : false)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                        item.isVisible !== false
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      }`}
                      title={item.isVisible !== false ? 'คลิกเพื่อซ่อนไม่ให้แสดงบนหน้าแรก' : 'คลิกเพื่อเปิดแสดงผลบนหน้าแรก'}
                    >
                      {item.isVisible !== false ? (
                        <>
                          <Eye size={12} />
                          <span>🟢 แสดงผล</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          <span>🔴 ซ่อนไว้</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">ชื่อหัวข้อสถิติ (ภาษาไทย)</label>
                  <input
                    type="text"
                    value={item.labelTh || ''}
                    onChange={(e) => handleItemChange(idx, 'labelTh', e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">ชื่อหัวข้อสถิติ (ภาษาอังกฤษ)</label>
                  <input
                    type="text"
                    value={item.labelEn || ''}
                    onChange={(e) => handleItemChange(idx, 'labelEn', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">จำนวนตัวเลข *</label>
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                      required
                      min={0}
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-mono font-bold text-amber-700 dark:text-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">ข้อความต่อท้าย (Suffix)</label>
                    <input
                      type="text"
                      value={item.suffix || ''}
                      onChange={(e) => handleItemChange(idx, 'suffix', e.target.value)}
                      placeholder="เช่น + รูป/คน"
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-light flex items-center gap-1.5">
            <HelpCircle size={14} />
            <span>ข้อมูลสถิตินี้จะแสดงผลบนการ์ดในหน้าแรกและรายงานประจำปีการศึกษา {statsData.academicYear}</span>
          </p>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสถิติปี 2569 ทันที'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
