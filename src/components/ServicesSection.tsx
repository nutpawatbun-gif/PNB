/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { servicesData } from '../data';
import { SystemService } from '../types';
import LucideIcon from './LucideIcon';

interface ServicesSectionProps {
  lang: 'th' | 'en';
}

export default function ServicesSection({ lang }: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<SystemService | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const t = {
    title: lang === 'th' ? 'ระบบบริการเทคโนโลยีสารสนเทศ' : 'Digital Services & Portals',
    sub: lang === 'th' ? 'บริการระบบสารสนเทศออนไลน์แบบจุดเดียวเบ็ดเสร็จ สำหรับนิสิตและคณาจารย์ผู้ปฏิบัติงาน' : 'Integrated single-sign-on systems for monastic staff, faculty, and students.',
    loginBtn: lang === 'th' ? 'เข้าสู่ระบบบริการ' : 'Secure Login',
    disclaimer: lang === 'th' ? '* ระบบจำลองสำหรับพัฒนาเว็บไซต์จริง • สามารถแก้ไขและเปลี่ยนลิงก์การเข้าถึงเป็นภายนอกในภายหลัง' : '* Secure portal sandbox. Links can be mapped to real MCU URLs inside configuration files.',
    modalTitle: lang === 'th' ? 'เข้าสู่ระบบแบบจุดเดียวเบ็ดเสร็จ (Single Sign-On)' : 'MCU Secure Single Sign-On',
    modalDesc: lang === 'th' ? 'กรุณากรอกบัญชีผู้ใช้งานส่วนกลาง @mcu.ac.th เพื่อตรวจสอบสิทธิ์เข้าใช้ระบบ' : 'Input your centralized academic account credentials.',
    emailLabel: lang === 'th' ? 'บัญชีผู้ใช้อีเมล มจร' : 'MCU Email Account',
    passwordLabel: lang === 'th' ? 'รหัสผ่าน' : 'Password',
    submitLogin: lang === 'th' ? 'ยืนยันเพื่อเข้าสู่ระบบ' : 'Authenticate & Enter',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    successText: lang === 'th' ? 'ยินดีด้วย! บัญชีของท่านได้รับการยืนยันเรียบร้อย กำลังเข้าสู่ระบบสารสนเทศ...' : 'Verification successful! Redirecting you safely to MCU portal...'
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg('');

    if (!email || !password) {
      setLoginMsg(lang === 'th' ? 'กรุณากรอกอีเมลและรหัสผ่าน' : 'Please fill in both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setLoginMsg(lang === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง กรุณาใช้อีเมล เช่น user@mcu.ac.th' : 'Invalid email format. Try user@mcu.ac.th');
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
    }, 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-mcu-pink-soft/20 border-b border-mcu-pink-light" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">{lang === 'th' ? 'ระบบบริการออนไลน์' : 'Academic Systems'}</span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep mb-3 font-sans thai-gold-border pb-2 inline-block">
            {t.title}
          </h2>
          <p className="text-sm text-muted-text-mcu max-w-2xl mx-auto font-light mt-3">
            {t.sub}
          </p>
        </div>

        {/* 4.10 Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-xl border border-border-mcu p-6 shadow-mcu-card hover:shadow-xl hover:border-mcu-pink transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Icon wrapper with soft colored background */}
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

              {/* Login Action */}
              <div className="mt-6 pt-4 border-t border-mcu-pink-soft/50">
                {service.id === 's1' || service.id === 's4' ? (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 bg-mcu-pink hover:bg-mcu-pink-dark border-2 border-transparent hover:border-mcu-gold text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center"
                  >
                    <LucideIcon name="ExternalLink" size={14} className="mr-1.5" />
                    <span>{t.loginBtn}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setSelectedService(service)}
                    className="w-full text-center py-2 bg-mcu-pink hover:bg-mcu-pink-dark border-2 border-transparent hover:border-mcu-gold text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center"
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

      {/* Mock SSO Portal Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-mcu-pink-deep/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-mcu-gold max-w-md w-full animate-slide-up overflow-hidden">
            
            {/* Header */}
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

            {/* Form Content */}
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

                {/* Login feedback */}
                {loginMsg && (
                  <div className={`p-3 rounded-lg text-xs flex items-start ${
                    loginSuccess 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}>
                    <LucideIcon 
                      name={loginSuccess ? "CheckCircle" : "AlertCircle"} 
                      className="mr-2 flex-shrink-0 mt-0.5" 
                      size={14} 
                    />
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
    </section>
  );
}
