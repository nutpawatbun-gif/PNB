import React, { useState, useEffect } from 'react';
import LucideIcon from './LucideIcon';
import { api } from '../lib/api';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    api.getContactDepartments().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDepartments(data);
      }
    }).catch(() => {});
  }, []);

  const getThailandOnlineStatus = () => {
    try {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const thTime = new Date(utc + (3600000 * 7));
      const day = thTime.getDay();
      const hour = thTime.getHours();
      const minute = thTime.getMinutes();
      const timeInMinutes = hour * 60 + minute;
      const isWorkingDay = day >= 1 && day <= 5;
      const isWorkingHours = timeInMinutes >= (8 * 60 + 30) && timeInMinutes <= (16 * 60 + 30);
      return isWorkingDay && isWorkingHours;
    } catch (e) {
      return true;
    }
  };

  const isOnline = getThailandOnlineStatus();

  const t = {
    title: lang === 'th' ? 'ติดต่อวิทยาลัยสงฆ์' : 'Contact Our College',
    sub: lang === 'th' ? 'หากมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม สามารถติดต่อสอบถามเจ้าหน้าที่ได้โดยตรง' : 'Have any questions or inquiry? Drop us a line below directly.',
    formTitle: lang === 'th' ? 'ส่งข้อความติดต่อฝ่ายบริการประสานงาน' : 'Direct Inquiry Form',
    name: lang === 'th' ? 'ชื่อ-นามสกุล / พระนาม' : 'Your Name / Monastic Name',
    email: lang === 'th' ? 'อีเมลสำหรับตอบกลับ' : 'Contact Email',
    subject: lang === 'th' ? 'หัวเรื่องสอบถาม' : 'Subject of Inquiry',
    message: lang === 'th' ? 'รายละเอียดข้อความ' : 'Message Details',
    submit: lang === 'th' ? 'ส่งข้อความติดต่อ' : 'Send Message',
    submitting: lang === 'th' ? 'กำลังส่งข้อมูล...' : 'Sending...',
    successMsg: lang === 'th' ? 'ส่งข้อความสำเร็จ! ระบบได้บันทึกข้อมูลและแจ้งเตือนไปยังเจ้าหน้าที่เรียบร้อยแล้ว' : 'Message sent successfully! Our administrative staff will contact you shortly.',
    errorMsg: lang === 'th' ? 'กรุณากรอกข้อมูลในช่องว่างให้ครบถ้วน' : 'Please fill in all the required fields.',
    addressTitle: lang === 'th' ? 'ที่อยู่วิทยาลัยสงฆ์' : 'Official Location Address',
    address: lang === 'th' ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ เลขที่ 109/2 หมู่ 5 ต.ปากช่อง อ.หล่มสัก จ.เพชรบูรณ์ 67110' : 'Phokhun Phamuang Buddhist College, 109/2 Moo 5, Pak Chong Sub-district, Lom Sak District, Phetchabun 67110',
    phone: lang === 'th' ? 'หมายเลขโทรศัพท์กลาง' : 'Phone Numbers',
    phoneVal: '081-462-5663',
    emailLabel: lang === 'th' ? 'อีเมลสถาบัน' : 'Official Email',
    officeHours: lang === 'th' ? 'วันและเวลาทำการ' : 'Administrative Hours',
    officeHoursVal: lang === 'th' ? 'วันจันทร์ - วันอาทิตย์ เวลา 08:30 น. - 16:30 น. (เว้นวันพระและนักขัตฤกษ์)' : 'Monday - Sunday: 08:30 AM - 04:30 PM (Closed on Buddhist sabbath days and national holidays)',
    divisionsTitle: lang === 'th' ? 'หมายเลขโทรศัพท์สายตรงรายแผนก' : 'Direct Extensions'
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
      setFormMsg(lang === 'th' ? 'กรุณากรอกรูปแบบอีเมลที่ถูกต้อง' : 'Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        department: 'ฝ่ายบริการประสานงาน (หน้าแรก)'
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
    <section className="py-16 bg-white dark:bg-slate-950" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">{lang === 'th' ? 'ช่องทางการติดต่อ' : 'Location & Inquiry'}</span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep dark:text-mcu-gold-light mb-3 font-sans thai-gold-border pb-2 inline-block">
            {t.title}
          </h2>
          <p className="text-sm text-muted-text-mcu dark:text-slate-400 max-w-2xl mx-auto font-light mt-3">
            {t.sub}
          </p>
        </div>

        {/* Info & Form Flex Group */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Information & Office Details (Left Column - 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-mcu-pink-soft/30 dark:bg-slate-900 p-6 rounded-2xl border border-mcu-pink-light dark:border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-mcu-pink-deep dark:text-mcu-gold-light pb-3 border-b border-mcu-pink-light/60 dark:border-slate-800 font-sans">
                {lang === 'th' ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์' : 'Phokhun Phamuang Buddhist College'}
              </h3>

              {/* Address */}
              <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                  <LucideIcon name="MapPin" size={14} />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-text-mcu dark:text-slate-400 block font-bold text-[10px] uppercase tracking-wider">{t.addressTitle}</span>
                  <p className="text-text-mcu dark:text-slate-200 font-light leading-relaxed">{t.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                  <LucideIcon name="Phone" size={14} />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-text-mcu dark:text-slate-400 block font-bold text-[10px] uppercase tracking-wider">{t.phone}</span>
                  <p className="text-text-mcu dark:text-slate-200 font-semibold">{t.phoneVal}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                  <LucideIcon name="Mail" size={14} />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-text-mcu dark:text-slate-400 block font-bold text-[10px] uppercase tracking-wider">{t.emailLabel}</span>
                  <p className="text-text-mcu dark:text-slate-200 font-medium">registry@mcu-pkpm.ac.th</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3.5 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-full bg-mcu-pink text-white flex-shrink-0 flex items-center justify-center border border-mcu-gold">
                  <LucideIcon name="Clock" size={14} />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-text-mcu dark:text-slate-400 block font-bold text-[10px] uppercase tracking-wider">{t.officeHours}</span>
                  <p className="text-text-mcu dark:text-slate-200 font-light leading-relaxed">{t.officeHoursVal}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Segment (Right Column - 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-border-mcu dark:border-slate-800 shadow-mcu-card">
            <h3 className="text-base sm:text-lg font-bold text-mcu-pink-deep dark:text-slate-100 mb-5 font-sans flex items-center">
              <LucideIcon name="Mail" className="text-mcu-gold mr-2" size={18} />
              <span>{t.formTitle}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-mcu-pink-deep dark:text-slate-300 block">{t.name} *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border-mcu dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 dark:bg-slate-950 text-text-mcu dark:text-slate-100 font-light"
                    placeholder={lang === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'E.g., John Doe'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-mcu-pink-deep dark:text-slate-300 block">{t.email} *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border-mcu dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 dark:bg-slate-950 text-text-mcu dark:text-slate-100 font-light"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-mcu-pink-deep dark:text-slate-300 block">{t.subject} *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border-mcu dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 dark:bg-slate-950 text-text-mcu dark:text-slate-100 font-light"
                  placeholder={lang === 'th' ? 'ระบุหัวเรื่องที่ประสงค์ติดต่อ' : 'Inquiry subject'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-mcu-pink-deep dark:text-slate-300 block">{t.message} *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-border-mcu dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 dark:bg-slate-950 text-text-mcu dark:text-slate-100 font-light resize-none"
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
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark text-white font-bold text-xs sm:text-sm rounded-lg shadow-md hover:border-mcu-gold border-2 border-transparent transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                <LucideIcon name="Mail" size={14} className="mr-1.5" />
                <span>{isSubmitting ? t.submitting : t.submit}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Department extensions direct lines (Synchronized with ContactPage.tsx & Backend DB) */}
        <div className="bg-white dark:bg-slate-900 border border-border-mcu dark:border-slate-800 shadow-mcu-card p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-mcu-pink-light dark:border-slate-800 pb-4 gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-mcu-pink-deep dark:text-mcu-gold-light font-sans flex items-center gap-2">
                <LucideIcon name="PhoneCall" size={20} className="text-mcu-gold" />
                <span>{t.divisionsTitle}</span>
              </h3>
              <p className="text-xs text-muted-text-mcu dark:text-slate-400 font-light mt-1">
                {lang === 'th' ? 'ติดต่อเจ้าหน้าที่สายตรงรายแผนกเพื่อรับข้อมูลที่รวดเร็วและถูกต้องที่สุด' : 'Direct contact extensions for rapid administrative assistance'}
              </p>
            </div>

            {isOnline ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                {lang === 'th' ? 'เจ้าหน้าที่ออนไลน์พร้อมบริการ' : 'Online & Ready'}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
                <span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span>
                {lang === 'th' ? 'นอกเวลาทำการ (ฝากข้อความได้)' : 'Outside Office Hours'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(departments.length > 0 ? departments : [
              {
                id: 'dept_reg',
                nameTh: 'ฝ่ายทะเบียนและวัดผล',
                nameEn: 'Academic Registry & Evaluation',
                officerName: 'นางสาววิมลพรรณ ปัทมวิชัย',
                officerRole: 'เจ้าหน้าที่หลัก',
                phone: '081-462-5663',
                imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
              },
              {
                id: 'dept_pr',
                nameTh: 'ฝ่ายประชาสัมพันธ์สมัครนิสิต',
                nameEn: 'Student PR & Admissions',
                officerName: 'นายรัฐศาสตร์ มโนธรรม',
                officerRole: 'เจ้าหน้าที่แนะแนว',
                phone: '081-462-5663',
                imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
              },
              {
                id: 'dept_finance',
                nameTh: 'ฝ่ายการเงินและงบประมาณ',
                nameEn: 'Financial & Tuition Office',
                officerName: 'นางสมศรี รัตนเรือง',
                officerRole: 'เจ้าหน้าที่การเงิน',
                phone: '081-462-5663',
                imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
              }
            ]).map((dept: any, index: number) => {
              const deptName = lang === 'th' ? (dept.nameTh || dept.name) : (dept.nameEn || dept.nameTh || dept.name);
              const officerName = dept.officerName ? `${dept.officerName} ${dept.officerRole ? `(${dept.officerRole})` : ''}` : (dept.officer || '');
              const deptPhone = dept.phone || '081-462-5663';
              const deptImage = dept.imageUrl || dept.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200';

              return (
                <div 
                  key={index}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    isOnline 
                      ? 'border-mcu-pink-light/40 bg-mcu-pink-soft/10 dark:bg-slate-850 hover:bg-mcu-pink-soft/20' 
                      : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-xs bg-white transition-all duration-300 ${
                      isOnline ? 'border-mcu-pink-light scale-100' : 'border-slate-300 filter grayscale scale-95'
                    }`}>
                      <img 
                        src={deptImage} 
                        alt={officerName || deptName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {isOnline ? (
                      <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-emerald-500 animate-pulse"></span>
                    ) : (
                      <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-slate-400"></span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep dark:text-slate-100 font-sans truncate">{deptName}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isOnline ? '● พร้อมติดต่อ' : '○ นอกเวลา'}
                      </span>
                    </div>
                    {officerName && <p className="text-[11px] text-muted-text-mcu dark:text-slate-400 font-light truncate">{officerName}</p>}

                    <div className="pt-2">
                      <a 
                        href={`tel:${deptPhone}`}
                        className="inline-flex items-center px-3 py-1 rounded-xl border border-mcu-pink/40 text-mcu-pink hover:bg-mcu-pink hover:text-white text-xs font-bold transition-all shadow-2xs"
                      >
                        <LucideIcon name="Phone" size={12} className="mr-1.5" />
                        <span>{deptPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
