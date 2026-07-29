/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { api } from '../lib/api';
import { 
  ShieldCheck, 
  User, 
  KeyRound, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Building2,
  Lock
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccessLogin }: AdminLoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('วิทยาลัยสงฆ์พ่อขุนผาเมือง');
  const [regRole, setRegRole] = useState('Editor');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status & Notifications
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;

    const googleClientId = "413695280817-6l30v8hn7iitikrf4lo3djvt3c7agt38.apps.googleusercontent.com";

    const handleGoogleCallback = async (response: any) => {
      if (!response || !response.credential) return;
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      try {
        const res = await api.googleLogin(response.credential, regRole);
        if (res && res.token && res.user) {
          setSuccessMsg('เข้าสู่ระบบด้วย Google SSO (@mcu.ac.th) สำเร็จ! กำลังเปิดหน้าควบคุมหลังบ้าน...');
          try {
            window.open(window.location.origin + '/admin', '_blank');
          } catch (e) {}
          if (onSuccessLogin) onSuccessLogin();
          onClose();
        } else if (res && res.status === 'pending') {
          setSuccessMsg(res.message || 'ลงทะเบียนด้วยบัญชี Google (@mcu.ac.th) สำเร็จแล้ว! บัญชีของคุณอยู่ในระหว่างรอการอนุมัติสิทธิ์จาก Super Admin');
        } else {
          setErrorMsg(res.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตนด้วย Google');
        }
      } catch (err: any) {
        console.error('Google SSO login error:', err);
        setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตนด้วย Google');
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
        const btnElem = document.getElementById('g_id_onload_button');
        if (btnElem) {
          (window as any).google.accounts.id.renderButton(btnElem, {
            theme: 'filled_blue',
            size: 'large',
            width: '100%',
            text: activeTab === 'login' ? 'signin_with' : 'signup_with',
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
  }, [isOpen, activeTab, regRole]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(username, password);

      if (response && (response.user || response.token)) {
        setSuccessMsg('เข้าสู่ระบบสำเร็จ! กำลังเข้าสู่ระบบควบคุมหลังบ้าน...');
        
        try {
          const adminUrl = window.location.origin + '/admin';
          window.open(adminUrl, '_blank');
        } catch (e) {}

        if (onSuccessLogin) {
          onSuccessLogin();
        }
        onClose();
        setLoading(false);
        setSuccessMsg('');
        return;
      } else {
        setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }

    // Strict Domain Check for @mcu.ac.th
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail.endsWith('@mcu.ac.th')) {
      setErrorMsg('การลงทะเบียนอนุญาตเฉพาะผู้ใช้อีเมลสถาบัน (@mcu.ac.th) เท่านั้น');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register({
        name: regName,
        email: cleanEmail,
        department: regDepartment,
        requestedRole: regRole,
        password: regPassword
      });

      setSuccessMsg(response.message || 'ลงทะเบียนสำเร็จแล้ว! บัญชีของคุณอยู่ในระหว่างรอการตรวจสอบและอนุมัติสิทธิ์จาก Super Admin');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setLoading(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาตรวจสอบข้อมูลอีกครั้ง');
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ระบบการเข้าสู่ระบบและสมัครสมาชิกบุคลากร (MCU Portal)"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">
            {activeTab === 'login' ? '* อนุญาตเฉพาะบุคลากรมหาวิทยาลัย' : '* เฉพาะอีเมลลงท้ายด้วย @mcu.ac.th เท่านั้น'}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form={activeTab === 'login' ? 'admin-popup-login-form' : 'admin-popup-register-form'}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-amber-600 via-rose-600 to-mcu-pink hover:from-amber-700 hover:via-rose-700 hover:to-mcu-pink-deep text-white rounded-xl font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5 transition-all"
            >
              {activeTab === 'login' ? <ExternalLink size={15} /> : <UserPlus size={15} />}
              <span>
                {loading 
                  ? 'กำลังประมวลผล...' 
                  : (activeTab === 'login' ? 'เข้าสู่ระบบ & เปิดหน้าควบคุม 🚀' : 'ส่งข้อมูลขออนุมัติสิทธิ์ 📩')
                }
              </span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 py-1 text-xs">
        {/* Top Header Card */}
        <div className="p-4 bg-gradient-to-r from-mcu-pink-deep via-mcu-pink to-slate-900 text-white rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300">
              <ShieldCheck size={12} />
              <span>MCU PKPM Official Portal</span>
            </span>
            <span className="text-[10px] text-amber-200 font-bold bg-black/30 px-2 py-0.5 rounded-md">
              @mcu.ac.th Verified
            </span>
          </div>

          <h3 className="text-base font-bold text-white tracking-wide">
            วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์
          </h3>
          <p className="text-[11px] text-slate-200 font-light leading-relaxed">
            ระบบจัดการเนื้อหา ข้อมูลการรับสมัคร ข่าวสาร และระบบควบคุมสิทธิ์บุคลากร
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-white dark:bg-slate-900 text-mcu-pink-deep shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🔑 เข้าสู่ระบบ (Login)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'register' 
                ? 'bg-white dark:bg-slate-900 text-mcu-pink-deep shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📝 สมัครสมาชิก (@mcu.ac.th)
          </button>
        </div>

        {/* Google Workspace SSO Primary Button Container */}
        <div className="p-3.5 bg-gradient-to-br from-slate-900 via-slate-800 to-mcu-pink-deep rounded-2xl border border-slate-700 text-white space-y-2.5 shadow-md">
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
            {activeTab === 'login' 
              ? 'เข้าสู่ระบบสะดวก รวดเร็ว ปลอดภัย ด้วยบัญชี Google มหาวิทยาลัย (ไม่ต้องใช้รหัสผ่าน)' 
              : 'ลงทะเบียนขออนุมัติสิทธิ์อัตโนมัติด้วยอีเมลสถาบัน @mcu.ac.th ผ่าน Google SSO'
            }
          </p>
          <div className="pt-1 flex justify-center w-full min-h-[44px]">
            <div id="g_id_onload_button" className="w-full"></div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400">หรือ ดำเนินการด้วยตนเอง</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Status Toast/Alert Messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn font-bold">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <form id="admin-popup-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <User size={14} className="text-mcu-pink" />
                <span>ชื่อผู้ใช้ หรือ อีเมลสถาบัน (Username / Email)</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น user@mcu.ac.th หรือ username"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-mcu-pink outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-mcu-pink" />
                  <span>รหัสผ่าน (Password)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-mcu-pink flex items-center gap-1"
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{showPassword ? 'ซ่อนรหัส' : 'แสดงรหัส'}</span>
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-mcu-pink outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-mcu-pink rounded border-gray-300 focus:ring-mcu-pink cursor-pointer"
                />
                <span>จดจำการเข้าสู่ระบบ</span>
              </label>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-mcu-pink font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>ยังไม่มีบัญชี? สมัครสมาชิก ➡️</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER FORM (@mcu.ac.th) */}
        {activeTab === 'register' && (
          <form id="admin-popup-register-form" onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              📌 <strong>เงื่อนไขการสมัคร:</strong> ระบบอนุญาตให้สมัครเฉพาะผู้ใช้งานที่มีอีเมลสถาบันลงท้ายด้วย <strong>@mcu.ac.th</strong> เท่านั้น เมื่อสมัครเรียบร้อยแล้ว บัญชีจะถูกส่งให้ <strong>Super Admin</strong> พิจารณาอนุมัติและกำหนดสิทธิ์การใช้งานก่อนเข้าสู่ระบบ
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <User size={13} className="text-mcu-pink" />
                  <span>ชื่อ-นามสกุลจริง <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="เช่น ดร.สมชาย ใจดี"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Mail size={13} className="text-mcu-pink" />
                  <span>อีเมลสถาบัน (@mcu.ac.th) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="เช่น user@mcu.ac.th"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Building2 size={13} className="text-mcu-pink" />
                  <span>หน่วยงาน / สังกัด</span>
                </label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  placeholder="เช่น สำนักงานวิทยาลัย, ฝ่ายวิชาการ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Lock size={13} className="text-mcu-pink" />
                  <span>สิทธิ์การใช้งานที่ขอสมัคร</span>
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink"
                >
                  <option value="Editor">Editor (เจ้าหน้าที่จัดการเนื้อหา/ข่าวสาร)</option>
                  <option value="Author">Author (ผู้เขียนบทความ/ประชาสัมพันธ์)</option>
                  <option value="Admin">Admin (เจ้าหน้าที่ดูแลงานเฉพาะส่วน)</option>
                  <option value="Viewer">Viewer (ผู้เข้าชมระบบหลังบ้าน)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <KeyRound size={13} className="text-mcu-pink" />
                  <span>ตั้งรหัสผ่าน (อย่างน้อย 8 ตัวอักษร) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <KeyRound size={13} className="text-mcu-pink" />
                  <span>ยืนยันรหัสผ่าน <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink"
                />
              </div>
            </div>
          </form>
        )}

        {/* Security Info Footnote */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            🔒 Granular Security & Approval Workflow
          </span>
          <span className="text-[10px] text-mcu-pink font-semibold">
            MCU PKPM Security Shield
          </span>
        </div>

      </div>
    </Modal>
  );
}
