/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LucideIcon from './LucideIcon';

interface ContactSectionProps {
  lang: 'th' | 'en';
}

export default function ContactSection({ lang }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const t = {
    title: lang === 'th' ? 'ติดต่อวิทยาลัยสงฆ์' : 'Contact Our College',
    sub: lang === 'th' ? 'หากมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม สามารถติดต่อสอบถามเจ้าหน้าที่ได้โดยตรง' : 'Have any questions or inquiry? Drop us a line below directly.',
    formTitle: lang === 'th' ? 'ส่งข้อความติดต่อเรา' : 'Direct Inquiry Form',
    name: lang === 'th' ? 'ชื่อ-นามสกุล / พระนาม' : 'Your Name / Monastic Name',
    email: lang === 'th' ? 'อีเมลติดต่อกลับ' : 'Contact Email',
    subject: lang === 'th' ? 'หัวเรื่อง' : 'Subject',
    message: lang === 'th' ? 'รายละเอียดข้อความ' : 'Message Details',
    submit: lang === 'th' ? 'ส่งข้อความ' : 'Send Message',
    successMsg: lang === 'th' ? 'ส่งข้อความสำเร็จ! เจ้าหน้าที่ของเราจะตอบกลับท่านผ่านอีเมลโดยเร็วที่สุด' : 'Message sent successfully! Our administrative staff will contact you shortly.',
    errorMsg: lang === 'th' ? 'กรุณากรอกข้อมูลในช่องว่างให้ครบถ้วน' : 'Please fill in all the required fields.',
    addressTitle: lang === 'th' ? 'ที่อยู่วิทยาลัยสงฆ์' : 'Official Location Address',
    address: lang === 'th' ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ เลขที่ 109/2 หมู่ 5 ต.ปากช่อง อ.หล่มสัก จ.เพชรบูรณ์ 67110' : 'Phokhun Phamuang Buddhist College, 109/2 Moo 5, Pak Chong Sub-district, Lom Sak District, Phetchabun 67110',
    phone: lang === 'th' ? 'หมายเลขโทรศัพท์' : 'Phone Numbers',
    phoneVal: '081-462-5663',
    emailLabel: lang === 'th' ? 'อีเมลสถาบัน' : 'Official Email',
    officeHours: lang === 'th' ? 'วันและเวลาทำการ' : 'Administrative Hours',
    officeHoursVal: lang === 'th' ? 'วันจันทร์ - วันอาทิตย์ เวลา 08:30 น. - 16:30 น. (เว้นวันพระและนักขัตฤกษ์)' : 'Monday - Sunday: 08:30 AM - 04:30 PM (Closed on Buddhist sabbath days and national holidays)',
    mapTitle: lang === 'th' ? 'แผนที่ตั้งสถาบัน (Google Maps)' : 'Institution Geographical Location Map'
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    setFormSuccess(false);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setFormMsg(t.errorMsg);
      return;
    }

    if (!email.includes('@')) {
      setFormMsg(lang === 'th' ? 'กรุณากรอกรูปแบบอีเมลที่ถูกต้อง' : 'Please enter a valid email address.');
      return;
    }

    setFormSuccess(true);
    setFormMsg(t.successMsg);

    // Reset fields after successful submit
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');

    setTimeout(() => {
      setFormMsg('');
      setFormSuccess(false);
    }, 5000);
  };

  return (
    <section className="py-16 bg-white" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">{lang === 'th' ? 'ช่องทางการติดต่อ' : 'Location & Inquiry'}</span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep mb-3 font-sans thai-gold-border pb-2 inline-block">
            {t.title}
          </h2>
          <p className="text-sm text-muted-text-mcu max-w-2xl mx-auto font-light mt-3">
            {t.sub}
          </p>
        </div>

        {/* Info & Form Flex Group */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12 items-start">
          
          {/* Contact Information (Left Column - 5 cols) */}
          <div className="lg:col-span-5 bg-mcu-pink-soft/30 p-8 rounded-2xl border border-mcu-pink-light space-y-6">
            
            <h3 className="text-lg font-bold text-mcu-pink-deep pb-3 border-b border-mcu-pink-light font-sans">
              {lang === 'th' ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง' : 'Phokhun Phamuang Buddhist College'}
            </h3>

            {/* Address */}
            <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                <LucideIcon name="MapPin" size={14} />
              </div>
              <div className="space-y-1">
                <span className="text-muted-text-mcu block font-bold text-[10px] uppercase tracking-wider">{t.addressTitle}</span>
                <p className="text-text-mcu font-light leading-relaxed">{t.address}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                <LucideIcon name="Phone" size={14} />
              </div>
              <div className="space-y-1">
                <span className="text-muted-text-mcu block font-bold text-[10px] uppercase tracking-wider">{t.phone}</span>
                <p className="text-text-mcu font-semibold">{t.phoneVal}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                <LucideIcon name="Mail" size={14} />
              </div>
              <div className="space-y-1">
                <span className="text-muted-text-mcu block font-bold text-[10px] uppercase tracking-wider">{t.emailLabel}</span>
                <p className="text-text-mcu font-medium">akkharadet.bun@mcu.ac.th</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                <LucideIcon name="Clock" size={14} />
              </div>
              <div className="space-y-1">
                <span className="text-muted-text-mcu block font-bold text-[10px] uppercase tracking-wider">{t.officeHours}</span>
                <p className="text-text-mcu font-light leading-relaxed">{t.officeHoursVal}</p>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-4 border-t border-mcu-pink-light/60">
              <span className="text-xs text-muted-text-mcu font-bold uppercase block mb-3">ติดตามข่าวสารผ่านช่องทางออนไลน์</span>
              <div className="flex space-x-3 text-white">
                <a href="#" className="w-9 h-9 rounded-full bg-[#1877f2] hover:opacity-90 flex items-center justify-center shadow-sm" aria-label="Facebook"><LucideIcon name="Facebook" size={16} /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-[#ff0000] hover:opacity-90 flex items-center justify-center shadow-sm" aria-label="YouTube"><LucideIcon name="Youtube" size={16} /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-[#06c755] hover:opacity-90 flex items-center justify-center shadow-sm" aria-label="Line"><LucideIcon name="MessageCircle" size={16} /></a>
              </div>
            </div>

          </div>

          {/* Form Segment (Right Column - 7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-border-mcu shadow-mcu-card">
            <h3 className="text-lg font-bold text-mcu-pink-deep mb-5 font-sans flex items-center">
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
                    placeholder={lang === 'th' ? 'กรุณากรอกชื่อ' : 'E.g., John Doe'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-mcu-pink-deep block">{t.email}</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light"
                    placeholder="example@email.com"
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
                  placeholder={lang === 'th' ? 'กรุณาระบุหัวข้อติดต่อ' : 'Inquiry about scholarships'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-mcu-pink-deep block">{t.message}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light resize-none"
                  placeholder={lang === 'th' ? 'กรอกรายละเอียดข้อความของท่าน...' : 'Your query details...'}
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
                className="w-full sm:w-auto px-6 py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark text-white font-bold text-xs sm:text-sm rounded-lg shadow-md hover:border-mcu-gold border-2 border-transparent transition-all cursor-pointer flex items-center justify-center"
              >
                <LucideIcon name="Mail" size={14} className="mr-1.5" />
                <span>{t.submit}</span>
              </button>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
