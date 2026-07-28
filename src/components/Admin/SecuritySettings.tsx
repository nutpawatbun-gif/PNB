import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Monitor, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  History, 
  Lock, 
  QrCode, 
  Copy, 
  Check,
  ShieldAlert,
  LogOut,
  Laptop
} from 'lucide-react';

interface SecuritySettingsProps {
  currentUser: any;
  onNotify: (text: string, type?: 'success' | 'error') => void;
  onLogout?: () => void;
}

export function SecuritySettings({ currentUser, onNotify, onLogout }: SecuritySettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'password' | 'sessions' | 'history' | '2fa'>('password');
  const [loading, setLoading] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Active Sessions state
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Login History state
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(!!currentUser?.is2FAEnabled);
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string; otpauthUrl: string; backupCodes: string[] } | null>(null);
  const [otpVerifyCode, setOtpVerifyCode] = useState('');
  const [disable2FAPassword, setDisable2FAPassword] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'sessions') {
      fetchSessions();
    } else if (activeSubTab === 'history') {
      fetchLoginHistory();
    }
  }, [activeSubTab]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await api.getActiveSessions();
      setSessionsList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      onNotify(err.message || 'ไม่สามารถดึงข้อมูล Active Sessions ได้', 'error');
      setSessionsList([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchLoginHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getLoginHistory();
      setLoginHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      onNotify(err.message || 'ไม่สามารถดึงประวัติการเข้าสู่ระบบได้', 'error');
      setLoginHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword || !newPassword) {
      setPasswordError('กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      onNotify(res.message, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await api.revokeSession(sessionId);
      onNotify(res.message, 'success');
      fetchSessions();
    } catch (err: any) {
      onNotify(err.message || 'เกิดข้อผิดพลาดในการยกเลิก Session', 'error');
    }
  };

  const [showRevokeConfirmModal, setShowRevokeConfirmModal] = useState<boolean>(false);

  const handleRevokeOtherSessions = () => {
    setShowRevokeConfirmModal(true);
  };

  const confirmRevokeOtherSessions = async () => {
    setShowRevokeConfirmModal(false);
    try {
      const res = await api.revokeOtherSessions();
      onNotify(res.message, 'success');
      fetchSessions();
    } catch (err: any) {
      onNotify(err.message || 'เกิดข้อผิดพลาดในการยกเลิก Session', 'error');
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const data = await api.setup2FA();
      setTwoFactorData(data);
    } catch (err: any) {
      onNotify(err.message || 'ไม่สามารถตั้งค่า 2FA ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorData || !otpVerifyCode) return;
    setLoading(true);
    try {
      const res = await api.enable2FA(twoFactorData.secret, otpVerifyCode, twoFactorData.backupCodes);
      onNotify(res.message, 'success');
      setIs2FAEnabled(true);
      setTwoFactorData(null);
      setOtpVerifyCode('');
    } catch (err: any) {
      onNotify(err.message || 'รหัส OTP ไม่ถูกต้อง', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disable2FAPassword) return;
    setLoading(true);
    try {
      const res = await api.disable2FA(disable2FAPassword);
      onNotify(res.message, 'success');
      setIs2FAEnabled(false);
      setDisable2FAPassword('');
    } catch (err: any) {
      onNotify(err.message || 'รหัสผ่านไม่ถูกต้อง', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-mcu-pink" size={24} />
            การตั้งค่าความปลอดภัยและสิทธิ์บัญชี (Security Settings)
          </h2>
          <p className="text-xs text-gray-500 font-light mt-1">
            จัดการรหัสผ่าน, ยืนยันตัวตน 2FA, อุปกรณ์ที่เข้าสู่ระบบ (Sessions) และประวัติความปลอดภัย
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('password')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'password' ? 'bg-white text-mcu-pink-deep shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <KeyRound size={14} />
            <span>เปลี่ยนรหัสผ่าน</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'sessions' ? 'bg-white text-mcu-pink-deep shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor size={14} />
            <span>อุปกรณ์ที่ใช้อยู่ (Sessions)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('2fa')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === '2fa' ? 'bg-white text-mcu-pink-deep shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone size={14} />
            <span>ยืนยันตัวตน 2FA</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'history' ? 'bg-white text-mcu-pink-deep shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History size={14} />
            <span>ประวัติเข้าสู่ระบบ</span>
          </button>
        </div>
      </div>

      {/* 1. CHANGE PASSWORD */}
      {activeSubTab === 'password' && (
        <div className="max-w-xl bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <KeyRound size={18} className="text-mcu-pink" />
              เปลี่ยนรหัสผ่านประจำบัญชี
            </h3>
            <p className="text-xs text-gray-500 font-light mt-1">
              รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร ผสมด้วยตัวอักษรและตัวเลขเพื่อความปลอดภัยสูงสุด
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน / Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">รหัสผ่านใหม่ / New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่ / Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-bold text-sm rounded-xl transition-all shadow-xs"
            >
              {loading ? 'กำลังบันทึกรหัสผ่านใหม่...' : 'อัปเดตรหัสผ่าน'}
            </button>
          </form>
        </div>
      )}

      {/* 2. ACTIVE SESSIONS */}
      {activeSubTab === 'sessions' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Monitor size={18} className="text-mcu-pink" />
                อุปกรณ์และ Session ที่กำลังใช้งานอยู่ (Active Sessions)
              </h3>
              <p className="text-xs text-gray-500 font-light mt-1">
                รายการอุปกรณ์ คอมพิวเตอร์ หรือเบราว์เซอร์ที่ล็อกอินเข้าใช้งานบัญชีนี้ในปัจจุบัน
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchSessions}
                className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs flex items-center gap-1 font-medium"
              >
                <RefreshCw size={14} className={loadingSessions ? 'animate-spin' : ''} />
                <span>รีเฟรช</span>
              </button>
              <button
                onClick={handleRevokeOtherSessions}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <LogOut size={14} />
                <span>ยกเลิก Session อื่นทั้งหมด</span>
              </button>
            </div>
          </div>

          {loadingSessions ? (
            <div className="py-8 text-center text-xs text-gray-400">กำลังโหลดรายการ Active Sessions...</div>
          ) : sessionsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">ไม่พบรายการ Session เพิ่มเติม</div>
          ) : (
            <div className="space-y-3">
              {sessionsList.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    sess.isCurrent ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${sess.isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      <Laptop size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            อุปกรณ์นี้ (Current Device)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                        <div><strong className="font-medium text-gray-600">IP Address:</strong> {sess.ip}</div>
                        <div><strong className="font-medium text-gray-600">เข้าใช้งานล่าสุด:</strong> {new Date(sess.lastActiveAt).toLocaleString('th-TH')}</div>
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Trash2 size={14} />
                      <span>ยกเลิกสิทธิ์</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TWO-FACTOR AUTHENTICATION (2FA) */}
      {activeSubTab === '2fa' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Smartphone size={18} className="text-mcu-pink" />
              การยืนยันตัวตนสองขั้นตอน (Two-Factor Authentication - 2FA)
            </h3>
            <p className="text-xs text-gray-500 font-light mt-1">
              เพิ่มเกราะป้องกันอีกชั้นให้แก่บัญชีผู้ใช้ของคุณ เมื่อเข้าสู่ระบบด้วยรหัสผ่านแล้ว จะต้องระบุรหัส OTP 6 หลัก
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${is2FAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-800">
                  สถานะ 2FA: {is2FAEnabled ? <span className="text-emerald-600">เปิดใช้งานอยู่ (Enabled)</span> : <span className="text-gray-500">ปิดใช้งาน (Disabled)</span>}
                </div>
                <div className="text-xs text-gray-500 font-light">
                  {is2FAEnabled ? 'บัญชีของคุณได้รับการปกป้องด้วยรหัส OTP 2FA แล้ว' : 'แนะนำให้เปิดใช้งานเพื่อป้องกันการเข้าถึงจากผู้ไม่หวังดี'}
                </div>
              </div>
            </div>

            {!is2FAEnabled && !twoFactorData && (
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="px-4 py-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                {loading ? 'กำลังสร้างการตั้งค่า...' : 'ตั้งค่าเปิดใช้งาน 2FA'}
              </button>
            )}
          </div>

          {/* 2FA Setup Flow */}
          {!is2FAEnabled && twoFactorData && (
            <div className="p-6 border border-mcu-pink/30 bg-mcu-pink/5 rounded-2xl space-y-6 animate-fadeIn">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <QrCode size={18} className="text-mcu-pink" />
                ขั้นตอนที่ 1: สแกนหรือกรอกรหัสในแอป Authenticator (เช่น Google Authenticator / Authy)
              </h4>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-white border rounded-xl shadow-xs text-center">
                  <div className="w-40 h-40 bg-gray-100 flex items-center justify-center rounded-lg text-xs text-gray-500 border border-dashed border-gray-300">
                    <QrCode size={100} className="text-gray-700" />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 block">OTP Secret QR Code</span>
                </div>

                <div className="flex-grow space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Secret Key (สำหรับกรอกในแอป):</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-white border px-3 py-2 rounded-xl text-sm font-mono font-bold text-mcu-pink-deep tracking-wider flex-grow">
                        {twoFactorData.secret}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(twoFactorData.secret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="p-2 bg-white border rounded-xl text-xs hover:bg-gray-50 flex items-center gap-1 font-medium text-gray-700"
                      >
                        {copiedSecret ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{copiedSecret ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">รหัสสำรองใช้งานยามฉุกเฉิน (Backup Codes):</label>
                    <div className="grid grid-cols-3 gap-2 bg-white p-3 border rounded-xl">
                      {twoFactorData.backupCodes.map((code, idx) => (
                        <div key={idx} className="text-center font-mono text-xs font-bold text-gray-700 bg-gray-50 py-1 rounded-md border border-gray-100">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleEnable2FA} className="pt-4 border-t border-gray-200/60 space-y-4">
                <h4 className="font-bold text-sm text-gray-800">ขั้นตอนที่ 2: กรอกรหัส OTP 6 หลักเพื่อยืนยันเปิดใช้งาน</h4>
                <div className="flex items-center gap-3 max-w-md">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpVerifyCode}
                    onChange={(e) => setOtpVerifyCode(e.target.value)}
                    placeholder="เช่น 123456"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold tracking-widest text-center focus:ring-1 focus:ring-mcu-pink outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={loading || otpVerifyCode.length < 6}
                    className="px-6 py-2.5 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-bold text-sm rounded-xl transition-all shrink-0 disabled:opacity-50"
                  >
                    {loading ? 'กำลังตรวจสอบ...' : 'ยืนยันและเปิด 2FA'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Disable 2FA Form */}
          {is2FAEnabled && (
            <form onSubmit={handleDisable2FA} className="p-4 border border-red-100 bg-red-50/50 rounded-2xl space-y-3 max-w-md">
              <h4 className="font-bold text-xs text-red-800 flex items-center gap-1.5">
                <ShieldAlert size={16} />
                หากต้องการปิดใช้งาน 2FA กรุณายืนยันด้วยรหัสผ่านประจำบัญชี
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  required
                  value={disable2FAPassword}
                  onChange={(e) => setDisable2FAPassword(e.target.value)}
                  placeholder="รหัสผ่านปัจจุบัน"
                  className="w-full px-3 py-2 border border-red-200 bg-white rounded-xl text-xs focus:ring-1 focus:ring-red-500 outline-hidden"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shrink-0"
                >
                  ปิดใช้งาน 2FA
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 4. LOGIN HISTORY LOGS */}
      {activeSubTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <History size={18} className="text-mcu-pink" />
                ประวัติการเข้าสู่ระบบ (Login Security Audit History)
              </h3>
              <p className="text-xs text-gray-500 font-light mt-1">
                บันทึกวัน เวลา หมายเลข IP อุปกรณ์ และสถานะการพยายามเข้าสู่ระบบบัญชีนี้
              </p>
            </div>
            <button
              onClick={fetchLoginHistory}
              className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs flex items-center gap-1 font-medium"
            >
              <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
              <span>รีเฟรช</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-xs text-gray-400">กำลังโหลดประวัติการเข้าสู่ระบบ...</div>
          ) : loginHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">ยังไม่มีประวัติการเข้าสู่ระบบ</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-slate-50 text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-4">วันและเวลา</th>
                    <th className="py-3 px-4">อุปกรณ์ (Device)</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">สถานะการเข้าถึง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loginHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-gray-800">
                        {new Date(item.timestamp).toLocaleString('th-TH')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700">{item.device}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{item.ip}</td>
                      <td className="py-3 px-4">
                        {item.status === 'success' && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> เข้าสู่ระบบสำเร็จ
                          </span>
                        )}
                        {item.status === 'failed_password' && (
                          <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <AlertCircle size={12} /> รหัสผ่านไม่ถูกต้อง
                          </span>
                        )}
                        {item.status === 'failed_captcha' && (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <ShieldAlert size={12} /> CAPTCHA ไม่ถูกต้อง
                          </span>
                        )}
                        {item.status === 'locked' && (
                          <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <Lock size={12} /> ถูกระงับ Brute-force
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REVOKE SESSIONS CONFIRMATION MODAL */}
      {showRevokeConfirmModal && (
        <Modal
          isOpen={showRevokeConfirmModal}
          onClose={() => setShowRevokeConfirmModal(false)}
          title="ยืนยันการยกเลิกการเข้าสู่ระบบในอุปกรณ์อื่น"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setShowRevokeConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmRevokeOtherSessions}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>ยืนยันยกเลิกทุกอุปกรณ์</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณต้องการยกเลิกการเข้าสู่ระบบในอุปกรณ์อื่นทั้งหมดหรือไม่? บัญชีในอุปกรณ์อื่นทั้งหมดจะถูกตัดออกจากระบบทันที
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "ยกเลิกการเข้าสู่ระบบอุปกรณ์อื่นทั้งหมด"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
