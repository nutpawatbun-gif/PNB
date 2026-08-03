/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import DashboardHome from '../Admin/DashboardHome';
import MenuManager from '../Admin/MenuManager';
import HomepageBuilder from '../Admin/HomepageBuilder';
import NewsManager from '../Admin/NewsManager';
import AnnouncementsManager from '../Admin/AnnouncementsManager';
import AdmissionManager from '../Admin/AdmissionManager';
import CurriculumManager from '../Admin/CurriculumManager';
import EventsManager from '../Admin/EventsManager';
import DownloadsManager from '../Admin/DownloadsManager';
import PersonnelManager from '../Admin/PersonnelManager';
import AcademicManager from '../Admin/AcademicManager';
import { UserManager } from '../Admin/UserManager';
import { SecuritySettings } from '../Admin/SecuritySettings';
import { MediaLibrary } from '../MediaLibrary';
import { DatabaseInspector } from '../Admin/DatabaseInspector';
import { AuditLogViewer } from '../Admin/AuditLogViewer';
import VersionHistoryViewer from '../Admin/VersionHistoryViewer';
import SystemSettingsManager from '../Admin/SystemSettingsManager';
import { BackupManager } from '../Admin/BackupManager';
import { DashboardNotificationCenter } from '../Admin/DashboardNotificationCenter';
import { DataTableManager } from '../Admin/DataTableManager';
import MessagesManager from '../Admin/MessagesManager';
import StatsManager from '../Admin/StatsManager';
import { ErrorBoundary } from '../ErrorBoundary';
import { 
  BarChart3,
  Mail,
  Database,
  History,
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Calendar, 
  FileText,
  Users,
  GraduationCap,
  Check,
  Building,
  Info,
  Clock,
  ArrowLeft,
  Layout,
  Menu as MenuIcon,
  ShieldCheck,
  LogOut,
  Bell,
  Sliders,
  Image,
  Globe,
  Settings,
  Newspaper,
  Download,
  BookOpen,
  FolderDown,
  Table,
  HardDrive
} from 'lucide-react';
import { NewsItem, CalendarEvent, Course, DownloadableFile, AcademicWork, AcademicCategory, BannerItem } from '../../types';

interface AdminPageProps {
  lang: 'th' | 'en';
  onBackToHome?: () => void;
}

export default function AdminPage({ lang, onBackToHome }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Security Auth States
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaChallenge, setCaptchaChallenge] = useState<{ captchaId: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [requires2FA, setRequires2FA] = useState(false);
  const [temp2FAToken, setTemp2FAToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [forceNewPassword, setForceNewPassword] = useState('');
  const [forceConfirmPassword, setForceConfirmPassword] = useState('');

  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  // Persistent Active Tab state via localStorage & URL Hash
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== 'dashboard') return hash;
      const stored = localStorage.getItem('mcu_admin_active_tab');
      if (stored) return stored;
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  const setActiveTab = (tab: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mcu_admin_active_tab', tab);
      if (window.location.hash !== `#${tab}`) {
        window.history.replaceState(null, '', `#${tab}`);
      }
    }
    setActiveTabState(tab);
  };

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Notification States
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [showBellDropdown, setShowBellDropdown] = useState<boolean>(false);

  // Unified notifications or messages
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Unread Notifications count
  const refreshNotificationHeader = async () => {
    if (!api.isAuthenticated()) return;
    try {
      const res = await api.getNotifications();
      if (res) {
        setUnreadNotificationsCount(res.unreadCount || 0);
        setRecentNotifications((res.notifications || []).slice(0, 5));
      }
    } catch (err) {
      // silent
    }
  };

  // Check auth state on mount and listen for 401 unauthorized
  useEffect(() => {
    const checkAuth = () => {
      const auth = api.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        setUser(api.getCurrentUser());
        refreshNotificationHeader();
      }
    };
    checkAuth();

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUser(null);
      setLoginError('เซสชันหมดอายุหรือไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
    };

    window.addEventListener('mcu_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mcu_auth_unauthorized', handleUnauthorized);
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) return;

    const googleClientId = "413695280817-6l30v8hn7iitikrf4lo3djvt3c7agt38.apps.googleusercontent.com";

    const handleGoogleCallback = async (response: any) => {
      if (!response || !response.credential) return;
      setLoading(true);
      setLoginError('');

      try {
        const res = await api.googleLogin(response.credential);
        if (res && res.token && res.user) {
          setIsAuthenticated(true);
          setUser(res.user);
          setActiveTab('dashboard');
          triggerToast('เข้าสู่ระบบด้วย Google SSO (@mcu.ac.th) สำเร็จ', 'success');
        } else if (res && res.status === 'pending') {
          setLoginError(res.message || 'ลงทะเบียนด้วยบัญชี Google (@mcu.ac.th) สำเร็จแล้ว! บัญชีของคุณอยู่ในระหว่างรอการอนุมัติสิทธิ์จาก Super Admin');
        } else {
          setLoginError(res.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตนด้วย Google');
        }
      } catch (err: any) {
        console.error('Google SSO login error:', err);
        setLoginError(err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตนด้วย Google');
      } finally {
        setLoading(false);
      }
    };

    const initGoogleBtn = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
          hosted_domain: 'mcu.ac.th'
        });
        const btnElem = document.getElementById('g_id_onload_admin_page');
        if (btnElem) {
          (window as any).google.accounts.id.renderButton(btnElem, {
            theme: 'filled_blue',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            logo_alignment: 'left',
            locale: 'th'
          });
        }
      }
    };

    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(initGoogleBtn, 100);
      document.head.appendChild(script);
    } else {
      setTimeout(initGoogleBtn, 100);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError('กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน');
      return;
    }
    setLoading(true);
    setLoginError('');
    try {
      const res = await api.login(username, password, captchaChallenge?.captchaId, captchaAnswer);

      if (res.requires2FA && res.temp2FAToken) {
        setRequires2FA(true);
        setTemp2FAToken(res.temp2FAToken);
        triggerToast('กรุณากรอกรหัสผ่าน OTP 2FA 6 หลัก', 'success');
        return;
      }

      setIsAuthenticated(true);
      setUser(res.user);
      if (res.mustChangePassword) {
        setMustChangePassword(true);
      } else {
        setActiveTab('dashboard');
        triggerToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับสู่ระบบ CMS', 'success');
      }
    } catch (err: any) {
      const errData = err.data || {};
      if (errData.requiresCaptcha && errData.captcha) {
        setRequiresCaptcha(true);
        setCaptchaChallenge(errData.captcha);
        setCaptchaAnswer('');
      }
      setLoginError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !temp2FAToken) return;
    setLoading(true);
    setLoginError('');
    try {
      const res = await api.verify2FALogin(temp2FAToken, otpCode);
      setIsAuthenticated(true);
      setUser(res.user);
      setRequires2FA(false);
      setTemp2FAToken('');
      setOtpCode('');

      if (res.mustChangePassword) {
        setMustChangePassword(true);
      } else {
        setActiveTab('dashboard');
        triggerToast('ยืนยัน 2FA สำเร็จ เข้าสู่ระบบเรียบร้อยแล้ว', 'success');
      }
    } catch (err: any) {
      setLoginError(err.message || 'รหัส OTP ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleForceChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forceNewPassword.length < 8) {
      setLoginError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (forceNewPassword !== forceConfirmPassword) {
      setLoginError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return;
    }

    setLoading(true);
    setLoginError('');
    try {
      const res = await api.forceChangePassword(forceNewPassword, forceConfirmPassword);
      setUser(res.user);
      setMustChangePassword(false);
      setActiveTab('dashboard');
      triggerToast('เปลี่ยนรหัสผ่านเริ่มต้นเรียบร้อยแล้ว ยินดีต้อนรับ', 'success');
    } catch (err: any) {
      setLoginError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) return;
    setLoading(true);
    setLoginError('');
    setForgotSuccessMsg('');
    try {
      const res = await api.forgotPassword(forgotIdentifier);
      setForgotSuccessMsg(res.message);
      if (res.resetToken) {
        setResetTokenInput(res.resetToken);
        setAuthMode('reset');
      }
    } catch (err: any) {
      setLoginError(err.message || 'ไม่สามารถส่งคำร้องขอได้');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTokenInput || !resetNewPassword) return;
    setLoading(true);
    setLoginError('');
    try {
      const res = await api.resetPassword(resetTokenInput, resetNewPassword);
      triggerToast(res.message, 'success');
      setAuthMode('login');
      setResetTokenInput('');
      setResetNewPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setMustChangePassword(false);
    setRequires2FA(false);
    triggerToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Shortcut handler from Dashboard
  const handleShortcut = (tabName: string) => {
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render auth wrapper or the dashboard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12" id="admin_login_view">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-mcu-pink-deep text-white shadow-md">
              <Lock size={28} />
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-800">
              ระบบจัดการเนื้อหา (CMS)
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500 font-light">
              วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์
            </p>
          </div>

          {/* 1. 2FA VERIFICATION SCREEN */}
          {requires2FA ? (
            <form className="mt-8 space-y-6" onSubmit={handleVerify2FA}>
              <div className="bg-mcu-pink/10 border border-mcu-pink/30 p-4 rounded-xl text-center space-y-2">
                <span className="text-xs font-bold text-mcu-pink-deep uppercase block">เปิดใช้งาน 2FA อยู่</span>
                <p className="text-xs text-gray-600">กรุณากรอกรหัสผ่าน OTP 6 หลัก จากแอป Authenticator ของคุณ</p>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 text-center">
                  รหัส OTP 6 หลัก
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono font-bold tracking-widest text-center focus:ring-1 focus:ring-mcu-pink outline-hidden"
                  placeholder="123456"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setTemp2FAToken('');
                    setOtpCode('');
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  ย้อนกลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-mcu-pink hover:bg-mcu-pink-deep transition-all disabled:opacity-50"
              >
                {loading ? 'กำลังตรวจสอบ OTP...' : 'ยืนยันรหัส OTP'}
              </button>
            </form>
          ) : authMode === 'forgot' ? (
            /* 2. FORGOT PASSWORD SCREEN */
            <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-800">ลืมรหัสผ่าน (Forgot Password)</h3>
                <p className="text-xs text-gray-500 mt-1">กรอกอีเมลหรือชื่อผู้ใช้ที่ลงทะเบียนในระบบเพื่อรับ Token รีเซ็ตรหัสผ่าน</p>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {forgotSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs font-medium">
                  {forgotSuccessMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  อีเมล หรือ ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
                  placeholder="เช่น admin หรือ admin@mcu.ac.th"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-mcu-pink hover:underline"
                >
                  ย้อนกลับไปล็อกอิน
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('reset')}
                  className="text-gray-500 hover:underline"
                >
                  มี Token รีเซ็ตแล้ว
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-mcu-pink hover:bg-mcu-pink-deep transition-all"
              >
                {loading ? 'กำลังส่งคำขอ...' : 'ขอรับ Token รีเซ็ตรหัสผ่าน'}
              </button>
            </form>
          ) : authMode === 'reset' ? (
            /* 3. RESET PASSWORD SCREEN */
            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-800">ตั้งรหัสผ่านใหม่ (Reset Password)</h3>
                <p className="text-xs text-gray-500 mt-1">กรอก Token ที่ได้รับ พร้อมกำหนดรหัสผ่านใหม่</p>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetTokenInput}
                    onChange={(e) => setResetTokenInput(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-mcu-pink outline-hidden"
                    placeholder="วาง Token ที่นี่"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    รหัสผ่านใหม่ (New Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-mcu-pink hover:underline"
                >
                  ย้อนกลับไปล็อกอิน
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-mcu-pink hover:bg-mcu-pink-deep transition-all"
              >
                {loading ? 'กำลังอัปเดต...' : 'บันทึกรหัสผ่านใหม่'}
              </button>
            </form>
          ) : (
            /* 4. STANDARD LOGIN SCREEN WITH BRUTE-FORCE & CAPTCHA */
            <div className="mt-8 space-y-6">
              {/* Google Workspace SSO Primary Button Container */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-mcu-pink-deep rounded-2xl border border-slate-700 text-white space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <span className="text-blue-600 font-black">G</span>
                    </div>
                    <span className="font-extrabold text-xs tracking-wide">Google Workspace SSO (แนะนำ)</span>
                  </div>
                  <span className="text-[10px] text-amber-300 bg-black/40 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                    เฉพาะ @mcu.ac.th
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 font-light leading-relaxed">
                  เข้าสู่ระบบหลังบ้านสะดวก รวดเร็ว ปลอดภัย ด้วยบัญชี Google มหาวิทยาลัย (ไม่ต้องใช้รหัสผ่าน)
                </p>
                <div className="pt-1 flex justify-center w-full min-h-[44px]">
                  <div id="g_id_onload_admin_page" className="w-full"></div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-gray-400">หรือ ล็อกอินด้วยชื่อผู้ใช้</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                {loginError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2 animate-pulse">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      อีเมล หรือ ชื่อผู้ใช้งาน / Email or Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink-deep outline-hidden"
                      placeholder="เช่น user@mcu.ac.th หรือ username"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">
                        รหัสผ่าน / Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-xs text-mcu-pink hover:underline font-medium"
                      >
                        ลืมรหัสผ่าน?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink-deep outline-hidden"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* CAPTCHA CHALLENGE INPUT */}
                  {requiresCaptcha && captchaChallenge && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                          <ShieldCheck size={16} /> ระบบรักษาความปลอดภัย CAPTCHA
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                          {captchaChallenge.question}
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="พิมพ์ผลลัพธ์คำนวณ..."
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-amber-500 outline-hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>* อนุญาตเฉพาะบุคลากรมหาวิทยาลัย (@mcu.ac.th)</span>
                  <button 
                    type="button" 
                    onClick={onBackToHome}
                    className="text-mcu-pink hover:underline flex items-center"
                  >
                    <ArrowLeft size={12} className="mr-1" /> กลับหน้าหลัก
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-mcu-pink hover:bg-mcu-pink-deep transition-all cursor-pointer"
                >
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="admin_dashboard_view">
      {/* 1. แถบเมนูด้านซ้าย (Sidebar Nav) */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-mcu-pink-deep p-2 rounded-lg text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">MCU PKPM CMS</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Panel</span>
            </div>
          </div>
          <button 
            onClick={onBackToHome}
            className="md:hidden text-slate-400 hover:text-white"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Navigation Modules Links */}
        <nav className="flex-grow p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'dashboard' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout size={18} />
            <span>หน้าแรกสถิติ</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'notifications' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell size={18} />
              <span>ศูนย์แจ้งเตือนระบบ</span>
            </div>
            {unreadNotificationsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'stats' || activeTab === 'academic_stats' ? 'bg-amber-600 text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={18} />
            <span>สถิติประจำปีการศึกษา 2569</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'messages' || activeTab === 'contact_messages' ? 'bg-amber-600 text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail size={18} />
            <span>ศูนย์รับข้อความ & อีเมลตอบกลับ</span>
          </button>

          <button
            onClick={() => setActiveTab('data_tables')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'data_tables' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table size={18} />
            <span>ตารางข้อมูลส่วนกลาง</span>
          </button>

          <button
            onClick={() => setActiveTab('menus')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'menus' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MenuIcon size={18} />
            <span>ระบบจัดการเมนู</span>
          </button>

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            เนื้อหาหลักเว็บไซต์ (Frontend Content Synchronized)
          </div>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'homepage' || activeTab === 'homepage_builder' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={18} />
            <span>จัดการหน้าแรก & สไลด์แบนเนอร์ (Homepage CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'news' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper size={18} />
            <span>ข่าวสารและกิจกรรม</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'announcements' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderDown size={18} />
            <span>ประกาศมหาวิทยาลัย</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'courses' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap size={18} />
            <span>หลักสูตรที่เปิดสอน</span>
          </button>

          <button
            onClick={() => setActiveTab('admission')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'admission' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle size={18} />
            <span>จัดการรับสมัคร & ผู้สมัคร</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'academic' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={18} />
            <span>ผลงานทางวิชาการ</span>
          </button>

          <button
            onClick={() => setActiveTab('personnel')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'personnel' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={18} />
            <span>ทำเนียบบุคลากร & อาจารย์</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'downloads' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download size={18} />
            <span>เอกสารดาวน์โหลด</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'events' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar size={18} />
            <span>ปฏิทินกิจกรรม</span>
          </button>

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            คลังสื่อและระบบจัดเก็บไฟล์
          </div>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'media' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Image size={18} />
            <span>คลังสื่อกลาง (Media Library)</span>
          </button>



          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            ตั้งค่าและสิทธิ์ผู้ใช้
          </div>

          <button
            onClick={() => setActiveTab('users_rbac')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'users_rbac' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={18} />
            <span>จัดการผู้ใช้และสิทธิ์ (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'security' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={18} />
            <span>ตั้งค่าความปลอดภัยบัญชี</span>
          </button>


          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'settings' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings size={18} />
            <span>ตั้งค่าเว็บไซต์หลัก</span>
          </button>

          <button
            onClick={() => setActiveTab('database_inspector')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'database_inspector' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database size={18} />
            <span>ผังฐานข้อมูล & ถังขยะ (26 Tables)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'audit_log' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={18} />
            <span>ประวัติ Audit Log (Immutable Logs)</span>
          </button>

          <button
            onClick={() => setActiveTab('version_history')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'version_history' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={18} />
            <span>ประวัติเวอร์ชัน (Version History)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup_manager')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${
              activeTab === 'backup_manager' ? 'bg-mcu-pink text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive size={18} />
            <span>สำรอง & กู้คืนข้อมูล (Backup System)</span>
          </button>

        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-400 font-mono">Live Session Online</span>
          </div>
          <button
            onClick={onBackToHome}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded-lg text-xs transition-colors"
          >
            <ArrowLeft size={14} />
            <span>กลับสู่หน้าเว็บไซต์</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Work Area (Top Bar + Dynamic Content) */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm">
          {/* Breadcrumb / Section Label */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-800 uppercase tracking-wide">CMS Control</span>
            <span>/</span>
            <span className="text-mcu-pink-deep font-semibold capitalize">{activeTab}</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowBellDropdown(!showBellDropdown);
                  refreshNotificationHeader();
                }}
                className="p-2 text-gray-500 hover:text-mcu-pink hover:bg-rose-50 rounded-xl relative transition-colors focus:outline-none"
                title="การแจ้งเตือนระบบ"
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Bell Dropdown Popup */}
              {showBellDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <Bell size={16} className="text-mcu-pink" />
                      <span className="text-xs font-bold text-gray-800">การแจ้งเตือนล่าสุด</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ใหม่ {unreadNotificationsCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowBellDropdown(false);
                        setActiveTab('notifications');
                      }}
                      className="text-[11px] font-bold text-mcu-pink hover:underline"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>

                  {/* Dropdown Items */}
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {!recentNotifications || recentNotifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">ไม่มีรายการแจ้งเตือน</p>
                    ) : (
                      (recentNotifications || []).map((item: any) => {
                        const itemIsRead = Boolean(item.isRead || item.read);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => {
                              setShowBellDropdown(false);
                              if (item.link) {
                                if (item.link.includes('/messages') || item.link.includes('messages')) setActiveTab('messages');
                                else if (item.link.includes('/news') || item.link.includes('news')) setActiveTab('news');
                                else setActiveTab('notifications');
                              } else {
                                setActiveTab('notifications');
                              }
                            }}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors border ${
                              itemIsRead ? 'bg-gray-50/50 border-gray-100' : 'bg-rose-50/40 border-rose-100 hover:bg-rose-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-gray-800 line-clamp-1">{item.title}</span>
                              {!itemIsRead && <span className="w-2 h-2 rounded-full bg-mcu-pink flex-shrink-0"></span>}
                            </div>
                            <p className="text-[11px] text-gray-600 line-clamp-2 leading-tight">{item.message}</p>
                            <span className="text-[9px] text-gray-400 mt-1 block font-mono">
                              {new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setShowBellDropdown(false);
                        setActiveTab('notifications');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      เข้าสู่ศูนย์แจ้งเตือนระบบ (Notification Center)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3 border-l border-gray-100 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-800">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-mcu-pink font-semibold">{user?.role || 'Administrator'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-mcu-pink/25 text-mcu-pink-deep flex items-center justify-center font-bold text-sm border border-mcu-pink/20">
                {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50/50 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Content body with toast notification */}
        <div className="p-6 md:p-8 flex-grow space-y-6 relative overflow-y-auto">
          {toast && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center space-x-2 animate-bounce ${
              toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'
            }`}>
              <CheckCircle size={18} />
              <span>{toast.text}</span>
            </div>
          )}

          {/* Dynamic Module Content wrapped in ErrorBoundary */}
          <ErrorBoundary fallbackTitle="เกิดข้อผิดพลาดในการโหลดโมดูลผู้ดูแลระบบนี้">
            {activeTab === 'notifications' && (
              <DashboardNotificationCenter onNavigateTab={(tab) => setActiveTab(tab)} triggerToast={triggerToast} />
            )}
            {(activeTab === 'stats' || activeTab === 'academic_stats') && (
              <StatsManager onNotify={triggerToast} />
            )}
            {(activeTab === 'messages' || activeTab === 'contact_messages') && (
              <MessagesManager onNotify={triggerToast} />
            )}
            {activeTab === 'data_tables' && (
              <DataTableManager onNotify={(text, type) => triggerToast(text, type)} />
            )}
            {activeTab === 'dashboard' && <DashboardHome onShortcutClick={handleShortcut} />}
            {activeTab === 'menus' && <MenuManager />}
            {(activeTab === 'homepage' || activeTab === 'homepage_builder' || activeTab === 'banners') && <HomepageBuilder />}

            {/* News CMS Editor Section */}
            {activeTab === 'news' && <NewsManager onNotify={triggerToast} />}

            {/* Announcements CMS Section */}
            {activeTab === 'announcements' && <AnnouncementsManager />}

            {/* Events Section */}
            {activeTab === 'events' && <EventsManager onNotify={triggerToast} />}

            {/* Courses / Curriculum CMS Section */}
            {(activeTab === 'courses' || activeTab === 'curricula') && <CurriculumManager />}

            {/* Downloads Section */}
            {activeTab === 'downloads' && <DownloadsManager onNotify={triggerToast} />}

            {/* Personnel Management Section */}
            {activeTab === 'personnel' && <PersonnelManager />}

            {/* Academic works Section */}
            {activeTab === 'academic' && <AcademicManager />}

            {/* Media Library Section */}
            {activeTab === 'media' && <MediaLibrary />}

            {/* Admission & Applicants Management Section */}
            {(activeTab === 'admission' || activeTab === 'admission_manager' || activeTab === 'applicants') && (
              <AdmissionManager onNotify={triggerToast} />
            )}

            {/* User Management & RBAC Section */}
            {activeTab === 'users_rbac' && <UserManager currentUser={user} onNotify={triggerToast} />}

            {/* Security Settings Section */}
            {activeTab === 'security' && (
              <SecuritySettings currentUser={user} onNotify={triggerToast} onLogout={handleLogout} />
            )}

            {/* Settings Section */}
            {activeTab === 'settings' && (
              <SystemSettingsManager onNotify={triggerToast} />
            )}

            {/* Database Inspector & Trash Manager Section */}
            {activeTab === 'database_inspector' && (
              <DatabaseInspector onToast={triggerToast} />
            )}

            {/* Audit Log Manager Section */}
            {activeTab === 'audit_log' && (
              <AuditLogViewer onToast={triggerToast} />
            )}

            {/* Version History Manager Section */}
            {activeTab === 'version_history' && (
              <VersionHistoryViewer onNotify={triggerToast} />
            )}

            {/* Backup & Restore System Section */}
            {activeTab === 'backup_manager' && (
              <BackupManager currentUser={user} onNotify={triggerToast} />
            )}
          </ErrorBoundary>
        </div>

        {/* MANDATORY FORCE CHANGE PASSWORD MODAL */}
        {mustChangePassword && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-gray-100 space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">บังคับเปลี่ยนรหัสผ่านครั้งแรก</h3>
                <p className="text-xs text-gray-500 font-light">
                  ระบบตรวจพบว่าบัญชีของคุณยังใช้รหัสผ่านชั่วคราว เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านใหม่ก่อนเข้าใช้งานระบบ
                </p>
              </div>

              <form onSubmit={handleForceChangePassword} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    รหัสผ่านใหม่ (New Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={forceNewPassword}
                    onChange={(e) => setForceNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    ยืนยันรหัสผ่านใหม่ (Confirm Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={forceConfirmPassword}
                    onChange={(e) => setForceConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  {loading ? 'กำลังบันทึกรหัสผ่าน...' : 'ยืนยันและเข้าสู่ระบบ'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
