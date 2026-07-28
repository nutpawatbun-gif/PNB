/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { servicesData } from '../../data';
import { SystemService } from '../../types';
import LucideIcon from '../LucideIcon';

interface ServicesPageProps {
  lang: 'th' | 'en';
}

export default function ServicesPage({ lang }: ServicesPageProps) {
  const [selectedService, setSelectedService] = useState<SystemService | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const t = {
    title: lang === 'th' ? 'ระบบสารสนเทศออนไลน์สำหรับนิสิตและบุคลากร' : 'MCU Digital Portals Hub',
    sub: lang === 'th' ? 'รวมลิงก์เข้าใช้บริการระบบทะเบียน ฐานข้อมูลห้องสมุดพุทธคลังวิชาการ และห้องเรียนทางไกลออนไลน์' : 'Access unified registry systems, E-Learning classrooms, and academic portals via secure Single Sign-On.',
    loginBtn: lang === 'th' ? 'ยืนยันสิทธิ์เข้าใช้ระบบ' : 'Login Securely',
    disclaimer: lang === 'th' ? '* ประตูเข้าใช้ระบบเหล่านี้จำลองเพื่อประกอบการสาธิตหน้าเว็บสถาบัน สำหรับบุคลากร/นิสิตภายนอก' : '* SSO gateway sandbox configured for high-fidelity evaluation.',
    modalTitle: lang === 'th' ? 'ระบบยืนยันสิทธิ์บัญชีกลาง มจร (SSO Portal)' : 'MCU Secure SSO Authenticator',
    modalDesc: lang === 'th' ? 'กรุณากรอกบัญชีอีเมลสถาบัน (@mcu.ac.th) เพื่อตรวจสอบความปลอดภัยก่อนเข้าใช้งาน' : 'Input your official @mcu.ac.th centralized account details.',
    emailLabel: lang === 'th' ? 'อีเมลมหาวิทยาลัย' : 'Academic Email ID',
    passwordLabel: lang === 'th' ? 'รหัสผ่านเข้าใช้งาน' : 'Password',
    submitLogin: lang === 'th' ? 'ลงชื่อเข้าใช้ระบบสารสนเทศ' : 'Sign In',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    successText: lang === 'th' ? 'ตรวจสอบสิทธิ์ผ่านเรียบร้อย! กำลังเชื่อมต่อฐานระบบข้อมูล มจร...' : 'Access approved! Redirecting to secure cloud systems...'
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg('');

    if (!email || !password) {
      setLoginMsg(lang === 'th' ? 'กรุณากรอกอีเมลและรหัสผ่าน' : 'Please input both credentials.');
      return;
    }

    if (!email.includes('@')) {
      setLoginMsg(lang === 'th' ? 'กรุณาใช้อีเมลสถาบัน เช่น name@mcu.ac.th' : 'Invalid format. Use name@mcu.ac.th');
      return;
    }

    setLoginSuccess(true);
    setLoginMsg(t.successText);

    setTimeout(() => {
      setLoginSuccess(false);
      setLoginMsg('');
      setSelectedService(null);
      setEmail('');
      setPassword('');
    }, 2500);
  };

  return (
    <div className="bg-white min-h-screen py-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white rounded-2xl p-8 sm:p-12 text-center border-b-4 border-mcu-gold relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-black/15 z-0"></div>
          <div className="relative z-10 space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-mcu-gold-light">{t.title}</h1>
            <p className="text-xs sm:text-base text-mcu-pink-soft/90 font-light max-w-2xl mx-auto">{t.sub}</p>
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-xl border border-border-mcu p-6 shadow-mcu-card hover:shadow-xl hover:border-mcu-pink transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-mcu-pink-soft rounded-lg flex items-center justify-center text-mcu-pink border border-mcu-pink-light/30">
                  <LucideIcon name={service.iconName} size={22} />
                </div>
                
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-mcu-pink-deep mb-1 font-sans">
                    {service.name}
                  </h3>
                  <p className="text-[10px] text-mcu-gold font-bold tracking-wider uppercase mb-2">
                    {service.nameEn}
                  </p>
                  <p className="text-xs sm:text-sm text-text-mcu font-light leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-mcu-pink-soft/50">
                {service.id === 's1' || service.id === 's4' ? (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark border-2 border-transparent hover:border-mcu-gold text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center"
                  >
                    <LucideIcon name="ExternalLink" size={14} className="mr-1.5" />
                    <span>
                      {service.id === 's1' 
                        ? (lang === 'th' ? 'ระบบบริการศึกษา' : 'Education Service') 
                        : (lang === 'th' ? 'ค้นหาวิทยานิพนธ์' : 'Search Theses')}
                    </span>
                  </a>
                ) : (
                  <button
                    onClick={() => setSelectedService(service)}
                    className="w-full text-center py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark border-2 border-transparent hover:border-mcu-gold text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center"
                  >
                    <LucideIcon name="LogIn" size={14} className="mr-1.5" />
                    <span>{t.loginBtn}</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>



      </div>

      {/* Login Portal dialog */}
      {selectedService && (
        <div className="fixed inset-0 bg-mcu-pink-deep/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-mcu-gold max-w-md w-full animate-slide-up overflow-hidden">
            
            <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white px-5 py-4 flex justify-between items-center border-b border-mcu-gold">
              <div className="flex items-center space-x-2">
                <LucideIcon name="ShieldCheck" className="text-mcu-gold" size={18} />
                <h3 className="text-xs sm:text-sm font-bold text-mcu-gold-light">{t.modalTitle}</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedService(null);
                  setEmail('');
                  setPassword('');
                  setLoginMsg('');
                  setLoginSuccess(false);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full cursor-pointer focus:outline-none"
                aria-label="Close dialog"
              >
                <LucideIcon name="X" size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-2 border-b border-mcu-pink-light/40">
                <h4 className="font-bold text-mcu-pink-deep text-sm sm:text-base">
                  {selectedService.name}
                </h4>
                <p className="text-[10px] text-mcu-gold font-bold uppercase mt-0.5">
                  {selectedService.nameEn}
                </p>
              </div>

              <p className="text-xs text-muted-text-mcu text-center font-light leading-relaxed">
                {t.modalDesc}
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-mcu-pink-deep block">{t.emailLabel}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mcu-pink-deep">
                      <LucideIcon name="Mail" size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="username@mcu.ac.th"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loginSuccess}
                      className="w-full pl-9 pr-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-mcu-pink-deep block">{t.passwordLabel}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mcu-pink-deep">
                      <LucideIcon name="ShieldCheck" size={14} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loginSuccess}
                      className="w-full pl-9 pr-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light"
                    />
                  </div>
                </div>

                {loginMsg && (
                  <div className={`p-3 rounded-lg text-xs flex items-start ${
                    loginSuccess 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}>
                    <LucideIcon name={loginSuccess ? "CheckCircle" : "AlertCircle"} className="mr-2 flex-shrink-0 mt-0.5" size={14} />
                    <span>{loginMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginSuccess}
                  className="w-full py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark border-2 border-transparent hover:border-mcu-gold text-white font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  <LucideIcon name="LogIn" size={14} className="mr-1.5" />
                  <span>{t.submitLogin}</span>
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-mcu-pink-light/40 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedService(null);
                    setEmail('');
                    setPassword('');
                    setLoginMsg('');
                    setLoginSuccess(false);
                  }}
                  className="bg-mcu-pink-soft text-mcu-pink-deep hover:bg-mcu-pink-light border border-mcu-pink-light px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {t.close}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
