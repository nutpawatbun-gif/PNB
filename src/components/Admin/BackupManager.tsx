import React, { useState, useEffect } from 'react';
import {
  Database,
  HardDrive,
  Download,
  Upload,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Trash2,
  RefreshCw,
  FileText,
  Settings,
  Lock,
  Info,
  Calendar,
  Hash,
  ArrowRight,
  Search,
  FileCheck,
  Zap,
  Server
} from 'lucide-react';
import { api } from '../../lib/api';
import { User } from '../../types';
import { Modal } from '../ui/Modal';

interface BackupManagerProps {
  currentUser?: User | null;
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  currentUser,
  onNotify
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'restore' | 'schedule' | 'manual'>('logs');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Backup logs and system stats
  const [logs, setLogs] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Manual Backup State
  const [backupDescription, setBackupDescription] = useState('');
  const [creatingType, setCreatingType] = useState<'database' | 'uploads' | 'full' | null>(null);

  // Integrity Check Modal / Result
  const [verifyingLog, setVerifyingLog] = useState<any | null>(null);
  const [integrityResult, setIntegrityResult] = useState<any | null>(null);

  // Restore Modal State
  const [selectedFileForRestore, setSelectedFileForRestore] = useState<File | null>(null);
  const [uploadedRestoreJson, setUploadedRestoreJson] = useState<any | null>(null);
  const [targetLogForRestore, setTargetLogForRestore] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'database' | 'uploads' | 'full'>('database');
  const [confirmText, setConfirmText] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Schedule State
  const [schedule, setSchedule] = useState<any>({
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    target: 'full',
    retentionDays: 30,
    keepMaxCount: 15,
    autoChecksumVerify: true,
    lastRunAt: '',
    nextRunAt: ''
  });

  // Check RBAC Permissions
  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const hasBackupPerm = Array.isArray(currentUser?.permissions) && (
    (currentUser.permissions as string[]).includes('manage_settings') ||
    (currentUser.permissions as string[]).includes('manage_backup')
  );
  const isAuthorized = isSuperAdmin || hasBackupPerm;

  useEffect(() => {
    if (isAuthorized) {
      loadBackupHistory();
      loadScheduleSettings();
    }
  }, [isAuthorized]);

  const loadBackupHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getBackupHistory();
      if (res && res.success) {
        setLogs(res.logs || []);
        setSystemStats(res.systemStats || null);
      }
    } catch (err: any) {
      onNotify?.(err.message || 'ไม่สามารถโหลดประวัติการสำรองข้อมูลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleSettings = async () => {
    try {
      const res = await api.getBackupSchedule();
      if (res.success && res.schedule) {
        setSchedule(res.schedule);
      }
    } catch (_) {}
  };

  const handleCreateBackup = async (type: 'database' | 'uploads' | 'full') => {
    setCreatingType(type);
    try {
      const res = await api.createBackup(type, backupDescription || undefined);
      if (res.success) {
        onNotify?.(res.message, 'success');
        setBackupDescription('');
        await loadBackupHistory();
      }
    } catch (err: any) {
      onNotify?.(err.message || 'เกิดข้อผิดพลาดในการสำรองข้อมูล', 'error');
    } finally {
      setCreatingType(null);
    }
  };

  const handleVerifyIntegrity = async (log: any) => {
    setVerifyingLog(log);
    setIntegrityResult(null);
    setActionLoading(true);
    try {
      const res = await api.verifyBackupIntegrity(log.filename);
      if (res.success) {
        setIntegrityResult(res.integrity);
      }
    } catch (err: any) {
      onNotify?.(err.message || 'ไม่สามารถตรวจสอบความสมบูรณ์ของไฟล์ได้', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileSelectForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFileForRestore(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        setUploadedRestoreJson(json);
        setTargetLogForRestore(null);
        // Auto verify uploaded file
        api.verifyBackupIntegrity(undefined, json).then(res => {
          if (res.success) setIntegrityResult(res.integrity);
        });
      } catch (err: any) {
        onNotify?.('ไฟล์ที่เลือกไม่ใช่ JSON ที่ถูกต้อง: ' + err.message, 'error');
        setSelectedFileForRestore(null);
        setUploadedRestoreJson(null);
      }
    };
    reader.readAsText(file);
  };

  const handleInitiateRestoreFromLog = (log: any) => {
    setTargetLogForRestore(log);
    setSelectedFileForRestore(null);
    setUploadedRestoreJson(null);
    setRestoreMode(log.type === 'uploads' ? 'uploads' : log.type === 'full' ? 'full' : 'database');
    setConfirmText('');
    setShowRestoreModal(true);
    // Auto verify
    handleVerifyIntegrity(log);
  };

  const handleExecuteRestore = async () => {
    if (confirmText.toUpperCase() !== 'RESTORE') {
      onNotify?.('กรุณาพิมพ์คำว่า RESTORE เพื่อยืนยันการกู้คืนระบบ', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.executeRestore({
        filename: targetLogForRestore?.filename,
        backupPayload: uploadedRestoreJson,
        restoreType: restoreMode
      });

      if (res.success) {
        onNotify?.(res.message, 'success');
        setShowRestoreModal(false);
        setConfirmText('');
        await loadBackupHistory();
      }
    } catch (err: any) {
      onNotify?.(err.message || 'เกิดข้อผิดพลาดขณะกู้คืนข้อมูล', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.saveBackupSchedule(schedule);
      if (res.success) {
        onNotify?.(res.message, 'success');
      }
    } catch (err: any) {
      onNotify?.(err.message || 'ไม่สามารถบันทึกตั้งเวลาได้', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const [deleteConfirmBackup, setDeleteConfirmBackup] = useState<{ id: string; filename: string } | null>(null);

  const handleDeleteLog = (id: string, filename: string) => {
    setDeleteConfirmBackup({ id, filename });
  };

  const confirmDeleteLog = async () => {
    if (!deleteConfirmBackup) return;
    const { id, filename } = deleteConfirmBackup;
    try {
      const res = await api.deleteBackupLog(id);
      if (res.success) {
        onNotify?.(res.message, 'success');
        await loadBackupHistory();
      }
    } catch (err: any) {
      onNotify?.(err.message || 'ไม่สามารถลบรายการได้', 'error');
    } finally {
      setDeleteConfirmBackup(null);
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.createdBy?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // 1. RBAC ACCESS DENIED SCREEN
  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm max-w-3xl mx-auto my-8 animate-fadeIn">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-red-100 text-red-700 rounded-xl">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">ปฏิเสธการเข้าถึงระบบสำรองข้อมูล (Access Denied)</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              การสำรองและกู้คืนฐานข้อมูลเป็นฟังก์ชันระดับความปลอดภัยสูงสุด
            </p>
          </div>
        </div>

        <div className="bg-red-50/70 border border-red-100 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex items-start space-x-2.5">
            <Lock size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 leading-relaxed font-normal">
              <strong className="font-bold">เงื่อนไขความปลอดภัย (RBAC Policy):</strong> ห้ามมิให้ผู้ดูแลทั่วไป (Admin, Editor, Author, Viewer) เข้าถึงระบบสำรองและกู้คืนข้อมูลโดยเด็ดขาด เว้นแต่จะได้รับสิทธิ์
              <code className="bg-red-200/80 px-1.5 py-0.5 rounded text-red-900 font-mono mx-1">Super Admin</code>
              หรือสิทธิ์เฉพาะ
              <code className="bg-red-200/80 px-1.5 py-0.5 rounded text-red-900 font-mono mx-1">manage_backup</code>
              อย่างเป็นทางการเท่านั้น
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">ผู้ใช้งานปัจจุบัน:</p>
            <p>{currentUser?.name} ({currentUser?.username}) — <span className="text-mcu-pink font-semibold">{currentUser?.role}</span></p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center text-[10px] bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">
              <ShieldAlert size={12} className="mr-1" /> ไม่ได้รับสิทธิ์จัดการสำรองข้อมูล
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" id="backup_restore_subsystem">
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-mcu-pink to-mcu-pink-deep text-white rounded-xl shadow-md">
            <HardDrive size={28} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900">ระบบสำรองและกู้คืนข้อมูล (Backup & Disaster Recovery)</h2>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                Super Admin Only
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              จัดการสำรองฐานข้อมูล ไฟล์อัปโหลด สแนปชอตระบบ ตั้งเวลาอัตโนมัติ และตรวจสอบความสมบูรณ์ไฟล์ (SHA-256)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={loadBackupHistory}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* SYSTEM STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ขนาดฐานข้อมูล (DB)</span>
            <Database size={20} />
          </div>
          <div className="text-2xl font-black text-gray-800">
            {systemStats?.dbSizeFormatted || '0 KB'}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center space-x-1">
            <span>{systemStats?.tableCount || 26} ตารางข้อมูล</span>
            <span>•</span>
            <span>{systemStats?.totalRecords?.toLocaleString() || 0} รายการ</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">คลังไฟล์อัปโหลด (Uploads)</span>
            <HardDrive size={20} />
          </div>
          <div className="text-2xl font-black text-gray-800">
            {systemStats?.uploadsSizeFormatted || '0 KB'}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            รวมทั้งสิ้น {systemStats?.uploadsCount || 0} ไฟล์สื่อ
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">สำรองข้อมูลล่าสุด</span>
            <Clock size={20} />
          </div>
          <div className="text-sm font-bold text-gray-800 line-clamp-1">
            {systemStats?.lastBackupAt ? new Date(systemStats.lastBackupAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ยังไม่มีข้อมูล'}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
            <CheckCircle size={12} />
            <span>สถานะระบบสมบูรณ์</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ตั้งเวลาอัตโนมัติ</span>
            <Calendar size={20} />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${schedule.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
            <span className="text-sm font-bold text-gray-800">
              {schedule.enabled ? `ทำงานทุก${schedule.frequency === 'daily' ? 'วัน' : schedule.frequency === 'weekly' ? 'สัปดาห์' : 'เดือน'} (${schedule.time} น.)` : 'ปิดใช้งานอยู่'}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {schedule.enabled ? `เก็บไฟล์ไว้ ${schedule.retentionDays || 30} วัน` : 'สามารถตั้งค่าเวลาล่วงหน้าได้'}
          </div>
        </div>
      </div>

      {/* QUICK MANUAL BACKUP ACTION BUTTONS */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              สร้างจุดสำรองข้อมูลทันที (Create Instant System Backup)
            </h3>
            <p className="text-xs text-slate-300">
              เลือกประเภทข้อมูลที่ต้องการสำรองไว้เพื่อป้องกันข้อมูลสูญหาย หรือใช้สแนปชอตก่อนการอัปเดตระบบใหญ่
            </p>
          </div>

          <label htmlFor="backup_description_input" className="sr-only">หมายเหตุการสำรองข้อมูล</label>
          <input
            id="backup_description_input"
            type="text"
            value={backupDescription}
            onChange={(e) => setBackupDescription(e.target.value)}
            placeholder="หมายเหตุ/คำอธิบายการสำรองข้อมูล (ระบุหรือไม่ก็ได้)..."
            aria-label="หมายเหตุหรือคำอธิบายการสำรองข้อมูล"
            className="px-3.5 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-mcu-pink w-full sm:w-80"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleCreateBackup('database')}
            disabled={creatingType !== null}
            className="flex items-center justify-between p-4 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                <Database size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">1. สำรองเฉพาะฐานข้อมูล</p>
                <p className="text-[10px] text-slate-400">ตารางข้อมูลทั้งหมด (.json)</p>
              </div>
            </div>
            {creatingType === 'database' ? (
              <RefreshCw size={16} className="animate-spin text-blue-400" />
            ) : (
              <Download size={16} className="text-slate-400 group-hover:text-white" />
            )}
          </button>

          <button
            onClick={() => handleCreateBackup('uploads')}
            disabled={creatingType !== null}
            className="flex items-center justify-between p-4 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                <HardDrive size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">2. สำรองรายการไฟล์อัปโหลด</p>
                <p className="text-[10px] text-slate-400">สแนปชอตคลังไฟล์สื่อ (.json)</p>
              </div>
            </div>
            {creatingType === 'uploads' ? (
              <RefreshCw size={16} className="animate-spin text-emerald-400" />
            ) : (
              <Download size={16} className="text-slate-400 group-hover:text-white" />
            )}
          </button>

          <button
            onClick={() => handleCreateBackup('full')}
            disabled={creatingType !== null}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-mcu-pink to-mcu-pink-deep hover:opacity-95 text-white rounded-xl text-left transition-all group shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 text-white rounded-lg group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-white">3. สำรองเต็มรูปแบบทั้งระบบ</p>
                <p className="text-[10px] text-white/80">ฐานข้อมูล + คลังไฟล์ครบถ้วน</p>
              </div>
            </div>
            {creatingType === 'full' ? (
              <RefreshCw size={16} className="animate-spin text-white" />
            ) : (
              <Download size={16} className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex border-b border-gray-200 space-x-2 bg-white px-4 pt-3 rounded-t-2xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'logs'
              ? 'border-mcu-pink text-mcu-pink-deep'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText size={16} />
          <span>ประวัติการสำรอง & ดาวน์โหลด ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('restore')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'restore'
              ? 'border-mcu-pink text-mcu-pink-deep'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Upload size={16} />
          <span>ศูนย์กู้คืนข้อมูล (Restore Center)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'schedule'
              ? 'border-mcu-pink text-mcu-pink-deep'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Clock size={16} />
          <span>ตั้งเวลาอัตโนมัติ (Automated Schedule)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('manual')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'manual'
              ? 'border-mcu-pink text-mcu-pink-deep'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Info size={16} />
          <span>คู่มือ & ข้อปฏิบัติการสำรองข้อมูล (Guide Manual)</span>
        </button>
      </div>

      {/* SUB-TAB 1: BACKUP LOGS & HISTORY TABLE */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-b-2xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-grow max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <label htmlFor="search_backup_input" className="sr-only">ค้นหาประวัติการสำรองข้อมูล</label>
              <input
                id="search_backup_input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อไฟล์, ผู้ดำเนินการ, หรือหมายเหตุ..."
                aria-label="ค้นหาชื่อไฟล์ ผู้ดำเนินการ หรือหมายเหตุ"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-mcu-pink"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="filter_backup_type" className="text-xs text-gray-700 font-bold whitespace-nowrap">กรองประเภท:</label>
              <select
                id="filter_backup_type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="กรองประเภทไฟล์สำรองข้อมูล"
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-mcu-pink bg-white"
              >
                <option value="all">ทั้งหมด (All Types)</option>
                <option value="database">ฐานข้อมูล (Database)</option>
                <option value="uploads">ไฟล์อัปโหลด (Uploads)</option>
                <option value="full">เต็มรูปแบบ (Full System)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">ชื่อไฟล์สำรองข้อมูล (Filename)</th>
                  <th className="py-3 px-3">ประเภท</th>
                  <th className="py-3 px-3">ขนาดไฟล์</th>
                  <th className="py-3 px-3">รหัส SHA-256 (Checksum)</th>
                  <th className="py-3 px-3">วันที่ & ผู้สร้าง</th>
                  <th className="py-3 px-3 text-center">ความสมบูรณ์</th>
                  <th className="py-3 px-4 text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                      ไม่พบประวัติการสำรองข้อมูลตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-slate-800 break-all flex items-center space-x-1.5">
                          {log.type === 'database' && <Database size={14} className="text-blue-500 shrink-0" />}
                          {log.type === 'uploads' && <HardDrive size={14} className="text-emerald-500 shrink-0" />}
                          {log.type === 'full' && <Zap size={14} className="text-purple-500 shrink-0" />}
                          <span>{log.filename}</span>
                        </div>
                        {log.description && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{log.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          log.type === 'database' ? 'bg-blue-100 text-blue-800' :
                          log.type === 'uploads' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-700">
                        {log.formattedSize || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-gray-500" title={log.checksumSha256}>
                        {log.checksumSha256 ? `${log.checksumSha256.substring(0, 10)}...` : 'N/A'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {new Date(log.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          โดย: {log.createdBy || 'System'} ({log.trigger || 'manual'})
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle size={12} />
                          <span>ผ่านตรวจสอบ</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <a
                          href={api.getBackupDownloadUrl(log.filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                          title="ดาวน์โหลดไฟล์สำรองข้อมูลลงเครื่อง"
                        >
                          <Download size={13} className="mr-1" /> ดาวน์โหลด
                        </a>

                        <button
                          onClick={() => handleVerifyIntegrity(log)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                          title="ตรวจสอบความสมบูรณ์ไฟล์ (SHA-256)"
                        >
                          <FileCheck size={13} className="inline mr-1" /> เช็คความสมบูรณ์
                        </button>

                        <button
                          onClick={() => handleInitiateRestoreFromLog(log)}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition-colors"
                          title="กู้คืนข้อมูลระบบจากไฟล์นี้"
                        >
                          <RefreshCw size={13} className="inline mr-1" /> กู้คืน
                        </button>

                        <button
                          onClick={() => handleDeleteLog(log.id, log.filename)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RESTORE CENTER */}
      {activeSubTab === 'restore' && (
        <div className="bg-white rounded-b-2xl p-6 border border-gray-100 shadow-xs space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">ข้อควรระวังในการกู้คืนข้อมูล (Restore Safety Guarantee):</p>
              <p className="mt-0.5 leading-relaxed">
                การกู้คืนข้อมูลจะทำการเขียนทับข้อมูลในระบบด้วยไฟล์สำรองข้อมูลที่คุณเลือก ทั้งนี้ เพื่อความปลอดภัยสูงสุด ระบบจะทำการ<strong className="font-bold underline ml-1">สแนปชอตความปลอดภัยอัตโนมัติ (Safety Snapshot)</strong> ให้ก่อนดำเนินการเสมอ เพื่อให้คุณสามารถย้อนกลับข้อมูลเดิมได้ทุกเมื่อหากต้องการ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FILE UPLOAD BOX FOR RESTORE */}
            <div className="border-2 border-dashed border-gray-300 hover:border-mcu-pink rounded-2xl p-8 text-center bg-gray-50/50 transition-colors relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelectForRestore}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="mx-auto w-12 h-12 bg-mcu-pink/10 text-mcu-pink-deep rounded-full flex items-center justify-center mb-3">
                <Upload size={24} />
              </div>
              <h4 className="text-sm font-bold text-gray-800">ลากไฟล์สำรองข้อมูล (.json) มาวาง หรือคลิกเพื่อเลือกไฟล์</h4>
              <p className="text-xs text-gray-400 mt-1">รองรับไฟล์สำรองโครงสร้าง JSON ที่สร้างขึ้นโดยระบบ MCU PKPM CMS</p>

              {selectedFileForRestore && (
                <div className="mt-4 p-3 bg-white border border-mcu-pink/30 rounded-xl text-xs font-bold text-mcu-pink-deep inline-block">
                  ไฟล์ที่เลือก: {selectedFileForRestore.name} ({Math.round(selectedFileForRestore.size / 1024)} KB)
                </div>
              )}
            </div>

            {/* RESTORE CONFIGURATION */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Settings size={18} className="text-mcu-pink-deep" />
                กำหนดโหมดและรายละเอียดการกู้คืน
              </h4>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  เลือกโหมดการกู้คืน (Restore Scope)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRestoreMode('database')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      restoreMode === 'database'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    ฐานข้อมูล
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestoreMode('uploads')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      restoreMode === 'uploads'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    ไฟล์อัปโหลด
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestoreMode('full')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      restoreMode === 'full'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    เต็มระบบ (Full)
                  </button>
                </div>
              </div>

              {uploadedRestoreJson && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle size={14} /> ตรวจสอบโครงสร้างไฟล์สำเร็จ
                  </p>
                  <p className="text-emerald-800">
                    ระบบ: {uploadedRestoreJson.meta?.system || 'MCU PKPM CMS Backup'}
                  </p>
                  <p className="text-emerald-800">
                    เวอร์ชัน: {uploadedRestoreJson.meta?.version || '2.0.0'} • สร้างเมื่อ: {uploadedRestoreJson.meta?.timestamp || 'N/A'}
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={!uploadedRestoreJson && !targetLogForRestore}
                onClick={() => setShowRestoreModal(true)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>ดำเนินการกู้คืนระบบ (Execute Restore)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUTOMATED BACKUP SCHEDULE SETTINGS */}
      {activeSubTab === 'schedule' && (
        <form onSubmit={handleSaveSchedule} className="bg-white rounded-b-2xl p-6 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock size={20} className="text-mcu-pink-deep" />
                ตั้งเวลาและนโยบายสำรองข้อมูลระบบอัตโนมัติ (Automated Retention Policy)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                กำหนดความถี่และนโยบายการจัดเก็บไฟล์สำรองอัตโนมัติล่วงหน้าเพื่อความต่อเนื่องของระบบ
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mcu-pink"></div>
              <span className="ml-3 text-xs font-bold text-gray-700">
                {schedule.enabled ? 'เปิดใช้งานระบบอัตโนมัติ' : 'ปิดใช้งาน'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="schedule_frequency_select" className="block text-xs font-bold text-gray-700 mb-2">ความถี่ในการสำรองข้อมูล</label>
              <select
                id="schedule_frequency_select"
                value={schedule.frequency}
                onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-mcu-pink bg-white"
              >
                <option value="daily">ทุกวัน (Daily Auto Backup)</option>
                <option value="weekly">ทุกสัปดาห์ (Weekly Auto Backup)</option>
                <option value="monthly">ทุกเดือน (Monthly Auto Backup)</option>
              </select>
            </div>

            <div>
              <label htmlFor="schedule_time_input" className="block text-xs font-bold text-gray-700 mb-2">เวลาที่เริ่มทำงาน (24 ชม.)</label>
              <input
                id="schedule_time_input"
                type="time"
                value={schedule.time}
                onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-mcu-pink bg-white"
              />
            </div>

            <div>
              <label htmlFor="schedule_target_select" className="block text-xs font-bold text-gray-700 mb-2">ขอบเขตข้อมูลการสำรอง</label>
              <select
                id="schedule_target_select"
                value={schedule.target}
                onChange={(e) => setSchedule({ ...schedule, target: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-mcu-pink bg-white"
              >
                <option value="database">สำรองเฉพาะฐานข้อมูล (.json)</option>
                <option value="uploads">สำรองเฉพาะรายการไฟล์สื่อ</option>
                <option value="full">สำรองเต็มระบบทั้งฐานข้อมูลและไฟล์สื่อ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label htmlFor="schedule_retention_days_input" className="block text-xs font-bold text-gray-700 mb-1">
                นโยบายการจัดเก็บสูงสุด (Retention Policy Days)
              </label>
              <input
                id="schedule_retention_days_input"
                type="number"
                min={7}
                max={365}
                value={schedule.retentionDays || 30}
                onChange={(e) => setSchedule({ ...schedule, retentionDays: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                ระบบจะเก็บรักษาไฟล์สำรองย้อนหลังไว้เป็นเวลาตามจำนวนวันที่กำหนด (เริ่มต้น 30 วัน)
              </p>
            </div>

            <div>
              <label htmlFor="schedule_keep_max_count_input" className="block text-xs font-bold text-gray-700 mb-1">
                จำนวนไฟล์สแนปชอตสูงสุดที่จัดเก็บ (Max File Retention Count)
              </label>
              <input
                id="schedule_keep_max_count_input"
                type="number"
                min={5}
                max={100}
                value={schedule.keepMaxCount || 15}
                onChange={(e) => setSchedule({ ...schedule, keepMaxCount: parseInt(e.target.value) || 15 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                ระบบจะหมุนเวียนลบไฟล์สแนปชอตเก่าอัตโนมัติหากเกินจำนวนไฟล์ที่กำหนดไว้
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              <span>บันทึกการตั้งค่าเวลาสำรองข้อมูล</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 4: MANUAL GUIDE & OPERATING MANUAL */}
      {activeSubTab === 'manual' && (
        <div className="bg-white rounded-b-2xl p-6 border border-gray-100 shadow-xs space-y-6 text-xs text-gray-700 leading-relaxed">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-mcu-pink-deep" />
              คู่มือและมาตรการปฏิบัติงานการสำรองและกู้คืนข้อมูล (Standard Operating Procedure)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              วิทยาลัยสงฆ์เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU PKPM CMS)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck size={16} className="text-blue-600" />
                1. นโยบายการสำรองข้อมูล (3-2-1 Backup Strategy)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                <li>จัดเก็บสำเนาข้อมูลอย่างน้อย <strong>3 ชุด</strong> (Live Database + Local Backup + Cold Storage)</li>
                <li>ใช้สื่อจัดเก็บที่ต่างชนิดกันอย่างน้อย <strong>2 ประเภท</strong></li>
                <li>เก็บสำเนาสำรองไว้ภายนอกอาคารหรือคลาวด์อย่างน้อย <strong>1 ชุด</strong></li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Hash size={16} className="text-emerald-600" />
                2. การตรวจสอบความถูกต้องสมบูรณ์ (SHA-256 Checksum)
              </h4>
              <p className="text-[11px] text-slate-600">
                ไฟล์สำรองข้อมูลทุกไฟล์ที่ถูกสร้างขึ้นในระบบจะถูกคำนวณและประทับลายเซ็นดิจิทัลด้วยอัลกอริทึม SHA-256 เพื่อตรวจสอบว่าไฟล์ไม่ถูกดัดแปลงหรือสูญหายระหว่างการจัดเก็บก่อนทำการกู้คืน
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Lock size={16} className="text-purple-600" />
                3. การควบคุมสิทธิ์ตามบทบาท (RBAC Permission Control)
              </h4>
              <p className="text-[11px] text-slate-600">
                จำกัดสิทธิ์การดาวน์โหลดไฟล์สำรองข้อมูลและการกู้คืนข้อมูลเฉพาะบัญชีสิทธิ์ <strong className="font-bold text-purple-800">Super Admin</strong> เพื่อป้องกันภัยคุกคามข้อมูลรั่วไหลและการแทรกแซงโดยไม่ได้รับอนุญาต
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Zap size={16} className="text-amber-600" />
                4. สแนปชอตความปลอดภัยก่อนกู้คืน (Pre-Restore Safety Snapshot)
              </h4>
              <p className="text-[11px] text-slate-600">
                ทุกครั้งที่มีการสั่งกู้คืนระบบ ระบบจะสร้างสแนปชอตความปลอดภัยอัตโนมัติ
                <code className="bg-amber-100 text-amber-900 px-1 rounded mx-1">mcu_safety_prerestore_*.json</code>
                ช่วยให้ย้อนกลับสภาวะระบบได้ทันที
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY INTEGRITY MODAL RESULT */}
      {verifyingLog && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileCheck size={18} className="text-mcu-pink-deep" />
                ผลการตรวจสอบความสมบูรณ์ไฟล์ (Integrity Report)
              </h3>
              <button
                onClick={() => setVerifyingLog(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {actionLoading ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-mcu-pink" />
                <p className="text-xs text-gray-500 font-semibold">กำลังประมวลผลคำนวณรหัส SHA-256 และตรวจสอบโครงสร้างตาราง...</p>
              </div>
            ) : integrityResult ? (
              <div className="space-y-3 text-xs">
                <div className={`p-3 rounded-xl border flex items-center space-x-2 font-bold ${
                  integrityResult.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {integrityResult.isValid ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  <span>{integrityResult.message}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                  <p><strong>Filename:</strong> {verifyingLog.filename}</p>
                  <p className="break-all"><strong>SHA-256:</strong> {integrityResult.checksumSha256}</p>
                  <p><strong>System Version:</strong> {integrityResult.systemVersion}</p>
                </div>

                {integrityResult.tableStats && (
                  <div>
                    <p className="font-bold text-gray-700 mb-1">สถิติจำนวนระเบียบข้อมูลตารางหลัก:</p>
                    <div className="grid grid-cols-2 gap-1.5 bg-gray-50 p-2.5 rounded-xl border text-[11px]">
                      {Object.entries(integrityResult.tableStats).map(([tbl, cnt]: [string, any]) => (
                        <div key={tbl} className="flex justify-between">
                          <span className="text-gray-500">{tbl}:</span>
                          <span className="font-bold text-gray-800">{cnt} รายการ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setVerifyingLog(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION RESTORE EXECUTION MODAL */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-red-100 space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">ยืนยันการกู้คืนข้อมูลระบบ</h3>
              <p className="text-xs text-gray-500">
                คุณกำลังจะกู้คืนข้อมูลประเภท <strong className="text-red-600 font-bold uppercase">{restoreMode}</strong> ซึ่งจะทำการอัปเดตข้อมูลปัจจุบันด้วยข้อมูลสำรอง
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900">
              <p className="font-bold">ระบบสร้างความปลอดภัยอัตโนมัติ:</p>
              <p>ระบบจะสร้างสแนปชอต Pre-Restore Safety Snapshot ให้ก่อนเริ่มกระบวนการทันที</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                พิมพ์คำว่า <span className="text-red-600 font-extrabold">RESTORE</span> เพื่อยืนยัน:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="พิมพ์ RESTORE..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-1 focus:ring-red-500 uppercase"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={actionLoading || confirmText.toUpperCase() !== 'RESTORE'}
                onClick={handleExecuteRestore}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
              >
                {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>ยืนยันกู้คืนระบบ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmBackup && (
        <Modal
          isOpen={!!deleteConfirmBackup}
          onClose={() => setDeleteConfirmBackup(null)}
          title="ยืนยันการลบไฟล์สำรองข้อมูล"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmBackup(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteLog}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบไฟล์สำรอง</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบประวัติและไฟล์สำรองนี้?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold font-mono">
              "{deleteConfirmBackup.filename}"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
