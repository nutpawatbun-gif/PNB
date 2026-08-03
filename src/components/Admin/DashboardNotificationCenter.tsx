import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  RefreshCw, 
  Mail, 
  Trash2, 
  CheckCheck, 
  ExternalLink, 
  Search, 
  Filter, 
  ShieldAlert, 
  FileText, 
  Clock, 
  Calendar, 
  UserX, 
  Lock, 
  UploadCloud, 
  Settings, 
  Send, 
  Database,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardNotification, NotificationType, NotificationSeverity, EmailDispatchStatus } from '../../types';

interface DashboardNotificationCenterProps {
  onNavigateTab?: (tabName: string) => void;
  triggerToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DashboardNotificationCenter: React.FC<DashboardNotificationCenterProps> = ({
  onNavigateTab,
  triggerToast
}) => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Filters
  const [activeTabFilter, setActiveTabFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Email Template Preview Modal / State
  const [selectedTemplate, setSelectedTemplate] = useState<string>('tpl_pending_review');
  const [testingEmailId, setTestingEmailId] = useState<string | null>(null);

  // Fetch Notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
        setSmtpConfigured(res.smtpConfigured || false);
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      if (triggerToast) triggerToast('ไม่สามารถโหลดข้อมูลการแจ้งเตือนได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Force Scan
  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      const res = await api.triggerNotificationScan();
      if (res.success) {
        if (triggerToast) {
          triggerToast(
            res.newNotificationsGenerated > 0 
              ? `สแกนสำเร็จ พบการแจ้งเตือนใหม่ ${res.newNotificationsGenerated} รายการ` 
              : 'สแกนระบบเรียบร้อย ไม่พบรายการแจ้งเตือนเพิ่มเติม', 
            'success'
          );
        }
        await loadNotifications();
      }
    } catch (err) {
      if (triggerToast) triggerToast('เกิดข้อผิดพลาดในการสแกนระบบ', 'error');
    } finally {
      setScanning(false);
    }
  };

  // Mark single read
  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      if (triggerToast) triggerToast('ทำเครื่องหมายอ่านแล้วทุกรายการเรียบร้อย', 'success');
    } catch (err) {
      if (triggerToast) triggerToast('ไม่สามารถอัปเดตสถานะการอ่านได้', 'error');
    }
  };

  // Clear read
  const handleClearRead = async () => {
    try {
      const res = await api.clearAllReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
      if (triggerToast) triggerToast(`ลบรายการที่อ่านแล้วออกจำนวน ${res.clearedCount || 0} รายการ`, 'info');
    } catch (err) {
      if (triggerToast) triggerToast('เกิดข้อผิดพลาดในการลบรายการ', 'error');
    }
  };

  // Delete single
  const handleDeleteSingle = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (triggerToast) triggerToast('ลบรายการแจ้งเตือนเรียบร้อยแล้ว', 'info');
    } catch (err) {
      if (triggerToast) triggerToast('ไม่สามารถลบรายการได้', 'error');
    }
  };

  // Test email dispatch simulation
  const handleTestEmailDispatch = async (id: string) => {
    setTestingEmailId(id);
    try {
      const res = await api.testEmailDispatch(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? res.notification : n));
        if (triggerToast) triggerToast(res.message, 'success');
      }
    } catch (err: any) {
      if (triggerToast) triggerToast(err.message || 'ทดสอบการส่งอีเมลล้มเหลว', 'error');
    } finally {
      setTestingEmailId(null);
    }
  };

  // Category Icon & Color Mapping
  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
          label: 'ข้อผิดพลาด/วิกฤต'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'คำเตือน/เฝ้าระวัง'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'อนุมัติ/สำเร็จ'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: 'ข้อมูลทั่วไป'
        };
    }
  };

  const getTypeMetadata = (type: NotificationType) => {
    switch (type) {
      case 'pending_review':
        return { label: 'รอการตรวจสอบ', icon: <Clock size={14} />, badgeBg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'approved':
        return { label: 'เนื้อหาถูกอนุมัติ', icon: <CheckCircle2 size={14} />, badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'returned_for_revision':
        return { label: 'ส่งกลับแก้ไข', icon: <FileText size={14} />, badgeBg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'expiring_soon':
        return { label: 'ใกล้หมดอายุ', icon: <Calendar size={14} />, badgeBg: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'admission_closing':
        return { label: 'รับสมัครใกล้ปิด', icon: <Clock size={14} />, badgeBg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'event_upcoming':
        return { label: 'กิจกรรมใกล้ถึงวัน', icon: <Calendar size={14} />, badgeBg: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'failed_logins':
        return { label: 'เข้าสู่ระบบผิดหลายครั้ง', icon: <UserX size={14} />, badgeBg: 'bg-red-100 text-red-800 border-red-300' };
      case 'critical_setting_changed':
        return { label: 'แก้ไขข้อมูลสำคัญ', icon: <Lock size={14} />, badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'upload_failed':
        return { label: 'ไฟล์อัปโหลดล้มเหลว', icon: <UploadCloud size={14} />, badgeBg: 'bg-pink-100 text-pink-800 border-pink-300' };
      default:
        return { label: 'แจ้งเตือนทั่วไป', icon: <Bell size={14} />, badgeBg: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const getEmailStatusBadge = (status: EmailDispatchStatus) => {
    switch (status) {
      case 'sent':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><Mail size={10} className="mr-1" /> ส่งอีเมลแล้ว</span>;
      case 'queued':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock size={10} className="mr-1" /> อยู่ในคิวรอส่ง</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200"><AlertTriangle size={10} className="mr-1" /> ส่งอีเมลไม่ผ่าน</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200"><Mail size={10} className="mr-1" /> ปิดการส่ง</span>;
    }
  };

  // Filter Logic
  const filteredNotifications = notifications.filter(n => {
    // Tab Filter
    if (activeTabFilter === 'pending_review' && n.type !== 'pending_review') return false;
    if (activeTabFilter === 'approval_revision' && n.type !== 'approved' && n.type !== 'returned_for_revision') return false;
    if (activeTabFilter === 'expiring_deadlines' && n.type !== 'expiring_soon' && n.type !== 'admission_closing' && n.type !== 'event_upcoming') return false;
    if (activeTabFilter === 'security_system' && n.type !== 'failed_logins' && n.type !== 'critical_setting_changed' && n.type !== 'upload_failed') return false;

    // Severity Filter
    if (severityFilter !== 'all' && n.severity !== severityFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.emailRecipient && n.emailRecipient.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Calculate stats
  const pendingCount = notifications.filter(n => n.type === 'pending_review').length;
  const expiringCount = notifications.filter(n => n.type === 'expiring_soon' || n.type === 'admission_closing' || n.type === 'event_upcoming').length;
  const securityCount = notifications.filter(n => n.type === 'failed_logins' || n.type === 'critical_setting_changed' || n.type === 'upload_failed').length;
  const emailQueuedCount = notifications.filter(n => n.emailStatus === 'queued').length;

  return (
    <div className="space-y-6 animate-fadeIn" id="notification_center_view">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mcu-pink/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="bg-mcu-pink text-white p-2.5 rounded-xl shadow-md">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black tracking-wide text-white">ระบบแจ้งเตือนภายใน Dashboard</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live System
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  ติดตามการอัปเดต สถานะเนื้อหา การเข้าสู่ระบบผิดพลาด และกำหนดการสำคัญ พร้อมโครงสร้างรองรับการส่งอีเมลอัตโนมัติ
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerScan}
              disabled={scanning}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 border border-indigo-400/30 disabled:opacity-50"
            >
              <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
              <span>{scanning ? 'กำลังสแกน...' : 'สแกนระบบสร้างแจ้งเตือน'}</span>
            </button>

            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border border-slate-700"
            >
              <CheckCheck size={14} className="text-emerald-400" />
              <span>อ่านแล้วทั้งหมด</span>
            </button>

            <button
              onClick={handleClearRead}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border border-slate-700/80"
            >
              <Trash2 size={14} />
              <span>ล้างที่อ่านแล้ว</span>
            </button>
          </div>
        </div>

        {/* 2. Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] font-medium block">แจ้งเตือนทั้งหมด</span>
              <span className="text-lg font-black text-white">{notifications.length}</span>
            </div>
            <div className="p-2 bg-slate-800 text-slate-300 rounded-lg"><Layers size={16} /></div>
          </div>

          <div className="bg-slate-900/80 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-amber-300/80 text-[11px] font-medium block">รอตรวจสอบ</span>
              <span className="text-lg font-black text-amber-400">{pendingCount}</span>
            </div>
            <div className="p-2 bg-amber-950/60 text-amber-400 rounded-lg"><Clock size={16} /></div>
          </div>

          <div className="bg-slate-900/80 border border-orange-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-orange-300/80 text-[11px] font-medium block">ใกล้หมดอายุ/จัดงาน</span>
              <span className="text-lg font-black text-orange-400">{expiringCount}</span>
            </div>
            <div className="p-2 bg-orange-950/60 text-orange-400 rounded-lg"><Calendar size={16} /></div>
          </div>

          <div className="bg-slate-900/80 border border-red-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-red-300/80 text-[11px] font-medium block">ความปลอดภัย/ผิดพลาด</span>
              <span className="text-lg font-black text-red-400">{securityCount}</span>
            </div>
            <div className="p-2 bg-red-950/60 text-red-400 rounded-lg"><ShieldAlert size={16} /></div>
          </div>

          <div className="bg-slate-900/80 border border-indigo-900/40 p-3 rounded-xl flex items-center justify-between col-span-2 md:col-span-1">
            <div>
              <span className="text-indigo-300/80 text-[11px] font-medium block">คิวส่งอีเมล (Queue)</span>
              <span className="text-lg font-black text-indigo-400">{emailQueuedCount}</span>
            </div>
            <div className="p-2 bg-indigo-950/60 text-indigo-400 rounded-lg"><Mail size={16} /></div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTabFilter('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTabFilter === 'all'
              ? 'bg-mcu-pink text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell size={14} />
          <span>ทั้งหมด ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('pending_review')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTabFilter === 'pending_review'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-amber-50 text-amber-900'
          }`}
        >
          <Clock size={14} />
          <span>รอตรวจสอบ ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('approval_revision')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTabFilter === 'approval_revision'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-emerald-50 text-emerald-900'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>อนุมัติ / ส่งกลับแก้ไข</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('expiring_deadlines')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTabFilter === 'expiring_deadlines'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-orange-50 text-orange-900'
          }`}
        >
          <Calendar size={14} />
          <span>ใกล้หมดอายุ / รับสมัคร / กิจกรรม</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('security_system')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTabFilter === 'security_system'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-red-50 text-red-900'
          }`}
        >
          <ShieldAlert size={14} />
          <span>ความปลอดภัย / ระบบ ({securityCount})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('email_queue')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTabFilter === 'email_queue'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-indigo-50 text-indigo-900'
          }`}
        >
          <Mail size={14} />
          <span>โครงสร้างส่งอีเมล (Templates)</span>
        </button>
      </div>

      {/* 4. Filter Toolbar & Search */}
      {activeTabFilter !== 'email_queue' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเรื่อง, ข้อความแจ้งเตือน หรืออีเมล..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-mcu-pink outline-hidden transition-all"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-600">ระดับความสำคัญ:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white outline-hidden"
            >
              <option value="all">ทุกระดับความสำคัญ</option>
              <option value="error">วิกฤต/ข้อผิดพลาด (Error)</option>
              <option value="warning">คำเตือน/เฝ้าระวัง (Warning)</option>
              <option value="success">ความสำเร็จ/อนุมัติ (Success)</option>
              <option value="info">ข้อมูลทั่วไป (Info)</option>
            </select>
          </div>
        </div>
      )}

      {/* 5. Main Content Area */}
      {activeTabFilter === 'email_queue' ? (
        /* EMAIL DISPATCH ARCHITECTURE & TEMPLATES PANEL */
        <div className="space-y-6">
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Mail className="text-indigo-600" size={20} />
                  สถาปัตยกรรมคิวส่งอีเมลแจ้งเตือน (Email Dispatch System Architecture)
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  ระบบออกแบบคิวการส่งอีเมล (Email Notification Dispatcher) เชื่อมโยงกับเซิร์ฟเวอร์ SMTP
                </p>
              </div>

              {/* SMTP Status Indicator */}
              <div className="flex items-center space-x-3 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${smtpConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <div className="text-xs">
                  <span className="font-bold text-indigo-900 block">
                    สถานะ SMTP: {smtpConfigured ? 'พร้อมใช้งาน (Connected)' : 'ยังไม่ได้เชื่อมต่อ (Default Mode)'}
                  </span>
                  <span className="text-[10px] text-indigo-700">
                    {smtpConfigured ? 'ส่งผ่าน Mail Server ของสถาบัน' : 'ตั้งค่าในเมนู "ตั้งค่าระบบ > การตั้งค่า SMTP"'}
                  </span>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('settings')}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center"
                  >
                    ตั้งค่า SMTP <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Email Templates Selector & Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List of Templates */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  แม่แบบอีเมลระบบ (Email Templates):
                </h3>

                {[
                  { id: 'tpl_pending_review', name: '1. มีเนื้อหาใหม่รอการตรวจสอบ', desc: 'ส่งหา Editor / Admin เมื่อมีดราฟต์ใหม่' },
                  { id: 'tpl_content_approved', name: '2. เนื้อหาได้รับการอนุมัติ', desc: 'ส่งหา Author เมื่อรายการได้รับการเผยแพร่' },
                  { id: 'tpl_returned_revision', name: '3. เนื้อหาถูกส่งกลับแก้ไข', desc: 'ส่งหาผู้เขียนพร้อมเหตุผลในการส่งกลับ' },
                  { id: 'tpl_expiring_soon', name: '4. ประกาศใกล้หมดอายุ', desc: 'ส่งเตือนผู้ดูแลก่อนประกาศหมดอายุ 3-5 วัน' },
                  { id: 'tpl_admission_closing', name: '5. โครงการรับสมัครใกล้ปิด', desc: 'ส่งเตือนฝ่ายวิชาการและการรับสมัคร' },
                  { id: 'tpl_event_upcoming', name: '6. กิจกรรมสถาบันใกล้ถึงวันจัดงาน', desc: 'ส่งเตือนทีมจัดกิจกรรมและบุคลากร' },
                  { id: 'tpl_failed_logins', name: '7. เข้าระบบผิดติดต่อกันหลายครั้ง', desc: 'ส่งเตือนทีมความปลอดภัยทันทีที่สงสัยภัยคุกคาม' },
                  { id: 'tpl_critical_settings', name: '8. แก้ไขการตั้งค่าสำคัญ', desc: 'ส่งหา Super Admin เมื่อมีการปรับค่าระบบ' },
                  { id: 'tpl_upload_failed', name: '9. อัปโหลดไฟล์ล้มเหลว', desc: 'ส่งเตือนผู้ดูแลระบบคลังสื่อกลาง' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedTemplate === tpl.id
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-sm font-bold'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tpl.name}</span>
                      {selectedTemplate === tpl.id && <ChevronRight size={14} className="text-indigo-600" />}
                    </div>
                    <span className="text-[10px] text-gray-500 font-normal block mt-1">{tpl.desc}</span>
                  </button>
                ))}
              </div>

              {/* Template Preview Panel */}
              <div className="lg:col-span-2 bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                    <Eye size={16} /> ตัวอย่างโค้ดและโครงสร้าง HTML อีเมล ({selectedTemplate})
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-mono">
                    UTF-8 HTML / PlainText
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-[11px] leading-relaxed text-emerald-400 overflow-x-auto">
                  <p className="text-slate-400 mb-2">// แม่แบบอีเมลแจ้งเตือนอัตโนมัติสำหรับสถาบัน (MCU System Auto-Mailer)</p>
                  <p className="text-indigo-300">Subject: [แจ้งเตือนระบบ MCU PKPM] &#123;&#123;notification_title&#125;&#125;</p>
                  <p className="text-indigo-300">From: "MCU Phetchabun System" &lt;noreply@mcu.ac.th&gt;</p>
                  <p className="text-indigo-300">To: &#123;&#123;recipient_email&#125;&#125;</p>
                  <hr className="my-2 border-slate-800" />
                  <p>&lt;html&gt;</p>
                  <p className="pl-2">&lt;body style="font-family: 'Sarabun', sans-serif;"&gt;</p>
                  <p className="pl-4">&lt;h2 style="color: #990033;"&gt;วิทยาลัยสงฆ์พ่อขุนผาเมือง มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย&lt;/h2&gt;</p>
                  <p className="pl-4">&lt;p&gt;เรียน คุณ &#123;&#123;recipient_name&#125;&#125;,&lt;/p&gt;</p>
                  <p className="pl-4">&lt;div style="background: #f8fafc; padding: 15px; border-left: 4px solid #990033;"&gt;</p>
                  <p className="pl-6">&lt;strong&gt;&#123;&#123;message_body&#125;&#125;&lt;/strong&gt;</p>
                  <p className="pl-6">&lt;p style="font-size: 12px;"&gt;เวลาที่เกิดรายการ: &#123;&#123;timestamp&#125;&#125;&lt;/p&gt;</p>
                  <p className="pl-4">&lt;/div&gt;</p>
                  <p className="pl-4">&lt;p&gt;&lt;a href="&#123;&#123;action_link&#125;&#125;" style="background: #990033; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px;"&gt;ตรวจสอบรายละเอียดใน Dashboard&lt;/a&gt;&lt;/p&gt;</p>
                  <p className="pl-2">&lt;/body&gt;</p>
                  <p>&lt;/html&gt;</p>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-white block">ตัวแปรไดนามิก (Dynamic Variables Supported):</span>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-indigo-300 pt-1">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">&#123;&#123;recipient_email&#125;&#125;</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">&#123;&#123;content_title&#125;&#125;</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">&#123;&#123;author_name&#125;&#125;</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">&#123;&#123;action_link&#125;&#125;</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">&#123;&#123;timestamp&#125;&#125;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NOTIFICATIONS LIST */
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <RefreshCw className="w-8 h-8 text-mcu-pink animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">กำลังโหลดรายการแจ้งเตือน...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">ไม่พบรายการแจ้งเตือนที่ตรงตามเงื่อนไข</h3>
              <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "สแกนระบบสร้างแจ้งเตือน"</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isRead = Boolean(notification.isRead || (notification as any).read);
              const sev = getSeverityBadge(notification.severity);
              const typeMeta = getTypeMetadata(notification.type);

              const parseTabFromLink = (link?: string) => {
                if (!link) return 'dashboard';
                if (link.includes('tab=')) return link.split('tab=')[1].split('&')[0];
                if (link.includes('/messages') || link.includes('messages')) return 'messages';
                if (link.includes('/news') || link.includes('news')) return 'news';
                if (link.includes('/announcements') || link.includes('announcements')) return 'announcements';
                if (link.includes('/admission') || link.includes('admission')) return 'admission';
                if (link.includes('/courses') || link.includes('courses')) return 'courses';
                if (link.includes('/events') || link.includes('events')) return 'events';
                if (link.includes('/academic') || link.includes('academic')) return 'academic';
                if (link.includes('/audit') || link.includes('audit')) return 'audit_log';
                if (link.includes('/security') || link.includes('security')) return 'security';
                return link.replace(/^\/admin\/?/, '').replace(/^\//, '') || 'dashboard';
              };

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                    isRead 
                      ? 'border-gray-200 bg-white/60' 
                      : 'border-mcu-pink/30 bg-gradient-to-r from-rose-50/20 via-white to-white ring-1 ring-mcu-pink/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Left Icon & Title */}
                    <div className="flex items-start space-x-3.5 flex-grow">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 border ${sev.bg}`}>
                        {sev.icon}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeMeta.badgeBg}`}>
                            {typeMeta.icon}
                            <span className="ml-1">{typeMeta.label}</span>
                          </span>

                          {/* Unread indicator */}
                          {!isRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-mcu-pink text-white animate-pulse">
                              ใหม่ (Unread)
                            </span>
                          )}

                          {/* Email Status Badge */}
                          {getEmailStatusBadge(notification.emailStatus)}
                        </div>

                        <h3 className={`text-sm ${isRead ? 'font-semibold text-gray-800' : 'font-black text-gray-900'}`}>
                          {notification.title}
                        </h3>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Extra Metadata Footer */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={12} />
                            {new Date(notification.createdAt).toLocaleString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          {notification.emailRecipient && (
                            <span className="flex items-center gap-1 font-mono text-indigo-600">
                              <Mail size={12} /> {notification.emailRecipient}
                            </span>
                          )}

                          {notification.targetRoles && (
                            <span className="text-gray-500">
                              กลุ่มเป้าหมาย: <span className="font-semibold">{notification.targetRoles.join(', ')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                      {/* Deep Link to Section */}
                      {notification.link && onNavigateTab && (
                        <button
                          onClick={() => {
                            if (!isRead) handleMarkRead(notification.id);
                            const targetTab = parseTabFromLink(notification.link);
                            onNavigateTab(targetTab);
                          }}
                          className="px-3 py-1.5 bg-mcu-pink-deep hover:bg-mcu-pink text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                          title="ไปยังหน้ารายการในระบบ"
                        >
                          <span>ไปยังหน้ารายการ</span>
                          <ExternalLink size={12} />
                        </button>
                      )}

                      {/* Test Email Button */}
                      <button
                        onClick={() => handleTestEmailDispatch(notification.id)}
                        disabled={testingEmailId === notification.id}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs transition-colors border border-indigo-200"
                        title="ทดสอบส่งอีเมลแจ้งเตือน (Simulate Mail Dispatch)"
                      >
                        <Send size={14} className={testingEmailId === notification.id ? 'animate-ping' : ''} />
                      </button>

                      {/* Toggle Read */}
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs transition-colors border border-emerald-200"
                          title="ทำเครื่องหมายว่าอ่านแล้ว"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteSingle(notification.id)}
                        className="p-2 bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg text-xs transition-colors"
                        title="ลบการแจ้งเตือน"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
