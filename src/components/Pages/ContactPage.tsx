/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LucideIcon from '../LucideIcon';
// @ts-ignore
import registryOfficerImg from '../../assets/images/regenerated_image_1784624594445.jpg';

interface ContactPageProps {
  lang: 'th' | 'en';
}

export default function ContactPage({ lang }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // คำนวณสถานะออนไลน์ตามเวลาทำการจริงของสถาบัน (จันทร์ - ศุกร์ 08:30 - 16:30 น.)
  const getThailandOnlineStatus = () => {
    try {
      const now = new Date();
      // แปลงเป็นเวลาประเทศไทย (UTC+7)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const thTime = new Date(utc + (3600000 * 7));
      
      const day = thTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hour = thTime.getHours();
      const minute = thTime.getMinutes();
      const timeInMinutes = hour * 60 + minute;

      const isWorkingDay = day >= 1 && day <= 5;
      const isWorkingHours = timeInMinutes >= (8 * 60 + 30) && timeInMinutes <= (16 * 60 + 30);
      return isWorkingDay && isWorkingHours;
    } catch (e) {
      return true; // Default to online if calculation fails
    }
  };

  const isOnline = getThailandOnlineStatus();

  const t = {
    title: lang === 'th' ? 'ข้อมูลสถานที่และการติดต่อสถาบัน' : 'Location, Directions & Contacts',
    sub: lang === 'th' ? 'ติดต่อฝ่ายวิชาการ ฝ่ายทะเบียน ฝ่ายบริหารงานคลัง หรือเข้าเยี่ยมชมสำนักงานสถาบันโดยตรง' : 'Connect with academic registries, financial divisions, or explore our countryside campus directly.',
    formTitle: lang === 'th' ? 'ส่งข้อความติดต่อฝ่ายบริการประสานงาน' : 'Inquire Administrative Officer',
    name: lang === 'th' ? 'ชื่อ-นามสกุล / พระนาม' : 'Full name / Monastic title',
    email: lang === 'th' ? 'อีเมลสำหรับตอบกลับ' : 'Your Reply Email',
    subject: lang === 'th' ? 'ประเด็นที่ประสงค์ติดต่อ' : 'Subject of Inquiry',
    message: lang === 'th' ? 'ข้อความถึงสถาบัน' : 'Message to College',
    submit: lang === 'th' ? 'ส่งเอกสารสอบถาม' : 'Transmit Message',
    submitting: lang === 'th' ? 'กำลังส่งข้อมูล...' : 'Transmitting...',
    successMsg: lang === 'th' ? 'ส่งข้อความติดต่อฝ่ายบริการประสานงานสำเร็จเรียบร้อยแล้ว! ระบบได้บันทึกข้อมูลและส่งการแจ้งเตือนถึงเจ้าหน้าที่แล้ว' : 'Transmission successful! An administrative officer will address your inquiry.',
    errorMsg: lang === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วนในทุกช่องความต้องการ' : 'Please input required fields completely.',
    infoTitle: lang === 'th' ? 'ข้อมูลสำนักงานวิทยาลัยสงฆ์' : 'Office Information Desk',
    address: lang === 'th' 
      ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ เลขที่ 109/2 หมู่ 5 ต.ปากช่อง อ.หล่มสัก จ.เพชรบูรณ์ 67110'
      : 'Phokhun Phamuang Buddhist College, 109/2 Moo 5, Pak Chong, Lom Sak, Phetchabun 67110',
    phoneVal: '081-462-5663',
    officeVal: lang === 'th' ? 'วันจันทร์ - วันอาทิตย์ เวลา 08:30 น. - 16:30 น. (เว้นวันพระและนักขัตฤกษ์)' : 'Monday - Sunday: 08:30 AM - 04:30 PM (Closed on Buddhist sabbaths and holidays)',
    divisionsTitle: lang === 'th' ? 'หมายเลขโทรศัพท์สายตรงรายแผนก' : 'Direct Intercom Extensions',
    mapTitle: lang === 'th' ? 'พิกัดแผนที่กูเกิลแมปส์ (Google Maps)' : 'Geographical Location (Google Maps)'
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    setFormSuccess(false);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setFormMsg(t.errorMsg);
      return;
    }

    if (!email.includes('@')) {
      setFormMsg(lang === 'th' ? 'กรุณาระบุอีเมลที่ถูกต้อง' : 'Please use a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Import api dynamically or use window/api
      const { api } = await import('../../lib/api');
      await api.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        department: 'ฝ่ายบริการประสานงาน'
      });

      setFormSuccess(true);
      setFormMsg(t.successMsg);

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setFormSuccess(false);
      setFormMsg(lang === 'th' ? 'เกิดข้อผิดพลาดในการส่งข้อความ: ' + (err.message || 'โปรดลองใหม่อีกครั้ง') : 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setFormMsg('');
        setFormSuccess(false);
      }, 7000);
    }
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

        {/* Info & Form Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Info and Departments direct lines (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Office Block */}
            <div className="bg-mcu-pink-soft/30 p-6 rounded-2xl border border-mcu-pink-light space-y-5">
              <h3 className="text-sm sm:text-base font-bold text-mcu-pink-deep border-b border-mcu-pink-light/60 pb-2.5 font-sans">
                {t.infoTitle}
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                    <LucideIcon name="MapPin" size={14} />
                  </div>
                  <div>
                    <span className="text-muted-text-mcu block text-[10px] font-bold uppercase tracking-wider">ที่อยู่วิทยาลัยสงฆ์</span>
                    <p className="text-text-mcu font-light leading-relaxed mt-0.5">{t.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                    <LucideIcon name="Phone" size={14} />
                  </div>
                  <div>
                    <span className="text-muted-text-mcu block text-[10px] font-bold uppercase tracking-wider">โทรศัพท์กลาง</span>
                    <p className="text-text-mcu font-semibold mt-0.5">{t.phoneVal}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                    <LucideIcon name="Clock" size={14} />
                  </div>
                  <div>
                    <span className="text-muted-text-mcu block text-[10px] font-bold uppercase tracking-wider">เวลาเข้าติดต่อราชการ</span>
                    <p className="text-text-mcu font-light leading-relaxed mt-0.5">{t.officeVal}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department extensions direct lines */}
            <div className="bg-white border border-border-mcu shadow-mcu-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-mcu-pink-deep border-b border-mcu-pink-light pb-2 font-sans flex items-center justify-between">
                <span>{t.divisionsTitle}</span>
                {isOnline ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    {lang === 'th' ? 'เจ้าหน้าที่ออนไลน์พร้อมบริการ' : 'Online & Ready'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1"></span>
                    {lang === 'th' ? 'นอกเวลาทำการ (ฝากข้อความได้)' : 'Outside Office Hours'}
                  </span>
                )}
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    id: 'registry',
                    name: lang === 'th' ? 'ฝ่ายทะเบียนและวัดผล' : 'Academic Registry & Evaluation',
                    officer: lang === 'th' ? 'นางสาววิมลพรรณ ปัทมวิชัย (เจ้าหน้าที่หลัก)' : 'Ms. Wimonphan Patamawichai (Registrar)',
                    phone: '081-462-5663',
                    line: '@mcu.registry',
                    lineUrl: 'https://line.me/ti/p/~@mcu.registry',
                    image: registryOfficerImg
                  },
                  {
                    id: 'pr',
                    name: lang === 'th' ? 'ฝ่ายประชาสัมพันธ์สมัครนิสิต' : 'Student PR & Admissions',
                    officer: lang === 'th' ? 'นายรัฐศาสตร์ มโนธรรม (เจ้าหน้าที่แนะแนว)' : 'Mr. Rattasart Manotham (PR Counselor)',
                    phone: '081-462-5663',
                    line: '@mcu.admission',
                    lineUrl: 'https://line.me/ti/p/~@mcu.admission',
                    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
                  },
                  {
                    id: 'finance',
                    name: lang === 'th' ? 'ฝ่ายการเงินและงบประมาณ' : 'Financial & Tuition Office',
                    officer: lang === 'th' ? 'นางสมศรี รัตนเรือง (เจ้าหน้าที่การเงิน)' : 'Mrs. Somsri Rattanasri (Treasurer)',
                    phone: '081-462-5663',
                    line: '@mcu.finance',
                    lineUrl: 'https://line.me/ti/p/~@mcu.finance',
                    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
                  }
                ].map((dept, index) => {
                  return (
                    <div 
                      key={index}
                      className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        isOnline 
                          ? 'border-mcu-pink-light/30 bg-mcu-pink-soft/5 hover:bg-mcu-pink-soft/15' 
                          : 'border-slate-200/60 bg-slate-50/50 opacity-75 hover:opacity-90'
                      }`}
                    >
                      {/* Circle Avatar with Online Dot */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 rounded-full overflow-hidden border shadow-sm bg-white transition-all duration-300 ${
                          isOnline ? 'border-mcu-pink-light scale-100' : 'border-slate-300 filter grayscale scale-95'
                        }`}>
                          <img 
                            src={dept.image} 
                            alt={dept.officer}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {isOnline ? (
                          <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-emerald-500 animate-pulse-slow"></span>
                        ) : (
                          <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-slate-400"></span>
                        )}
                      </div>

                      {/* Contact Details */}
                      <div className="flex-1 text-center sm:text-left space-y-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep font-sans">{dept.name}</h4>
                          <span className={`inline-block self-center sm:self-start px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isOnline 
                              ? (lang === 'th' ? '● พร้อมติดต่อ' : '● Available') 
                              : (lang === 'th' ? '○ พักสาย/นอกเวลา' : '○ Offline')}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-text-mcu font-light">{dept.officer}</p>
                        
                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                          {/* Call button */}
                          <a 
                            href={isOnline ? `tel:${dept.phone}` : '#'}
                            onClick={(e) => {
                              if (!isOnline) {
                                e.preventDefault();
                                alert(lang === 'th' ? 'เจ้าหน้าที่พักสายชั่วคราว กรุณาติดต่อทางไลน์หรือโทรภายหลัง' : 'Staff is currently offline. Please try again later or leave a message via Line.');
                              }
                            }}
                            className={`inline-flex items-center px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                              isOnline 
                                ? 'bg-white hover:bg-mcu-pink/5 border-mcu-pink/40 text-mcu-pink cursor-pointer' 
                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <LucideIcon name="Phone" size={12} className="mr-1" />
                            <span>{dept.phone}</span>
                          </a>
                          
                          {/* Line Contact button */}
                          <a 
                            href={dept.lineUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-2.5 py-1 rounded text-white text-[11px] font-semibold transition-all ${
                              isOnline 
                                ? 'bg-[#06C755] hover:bg-[#05b34c] shadow-sm' 
                                : 'bg-slate-400 hover:bg-slate-500 opacity-80'
                            }`}
                          >
                            <LucideIcon name="MessageCircle" size={12} className="mr-1" />
                            <span>Line: {dept.line}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Form Block (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-border-mcu shadow-mcu-card">
            <h3 className="text-sm sm:text-base font-bold text-mcu-pink-deep mb-5 font-sans flex items-center">
              <LucideIcon name="Mail" className="text-mcu-gold mr-2" size={18} />
              <span>{t.formTitle}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-mcu-pink-deep block">{t.name}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light"
                    placeholder="E.g., John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-mcu-pink-deep block">{t.email}</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light"
                    placeholder="email@address.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-mcu-pink-deep block">{t.subject}</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light"
                  placeholder="Inquiry theme"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-mcu-pink-deep block">{t.message}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light resize-none"
                  placeholder="Inquiry message content..."
                />
              </div>

              {/* Form Feedback */}
              {formMsg && (
                <div className={`p-3.5 rounded-lg text-xs flex items-start ${
                  formSuccess 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}>
                  <LucideIcon 
                    name={formSuccess ? "CheckCircle" : "AlertCircle"} 
                    className="mr-2 flex-shrink-0 mt-0.5" 
                    size={14} 
                  />
                  <span>{formMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md hover:border-mcu-gold border-2 border-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LucideIcon name={isSubmitting ? "RefreshCw" : "Mail"} size={14} className={isSubmitting ? "animate-spin" : ""} />
                <span>{isSubmitting ? t.submitting : t.submit}</span>
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
