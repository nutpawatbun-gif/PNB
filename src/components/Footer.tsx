/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import LucideIcon from './LucideIcon';
// @ts-ignore
import logoImg from '../assets/images/regenerated_image_1784349405698.png';

interface FooterProps {
  lang: 'th' | 'en';
  setCurrentPage: (page: string) => void;
}

export default function Footer({ lang, setCurrentPage }: FooterProps) {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageNav = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = {
    titleMain: lang === 'th' ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์' : 'Phokhun Phamuang Buddhist College, Phetchabun',
    titleSub: lang === 'th' ? 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' : 'Mahachulalongkornrajavidyalaya University',
    quickLinks: lang === 'th' ? 'เมนูลัดหลัก' : 'Quick Menu',
    systems: lang === 'th' ? 'ระบบบริการเด่น' : 'IT Systems',
    policies: lang === 'th' ? 'นโยบายและสิทธิ์' : 'Policies & Rights',
    privacy: lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy',
    cookies: lang === 'th' ? 'นโยบายคุกกี้' : 'Cookie Policy',
    sitemap: lang === 'th' ? 'แผนผังเว็บไซต์' : 'Sitemap',
    rights: lang === 'th' 
      ? '© 2026 วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย สงวนลิขสิทธิ์' 
      : '© 2026 Phokhun Phamuang Buddhist College, MCU. All Rights Reserved.',
    address: lang === 'th' 
      ? '109/2 หมู่ 5 ตำบลปากช่อง อำเภอหล่มสัก จังหวัดเพชรบูรณ์ 67110'
      : '109/2 Moo 5, Pak Chong, Lom Sak, Phetchabun 67110',
    phone: '081-462-5663',
    email: 'akkharadet.bun@mcu.ac.th'
  };

  return (
    <footer className="bg-mcu-pink-deep text-white border-t-4 border-mcu-gold relative pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        
        {/* Column 1: School Identity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 select-none">
            <div className="w-14 h-14 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
              <img 
                src={logoImg} 
                alt="MCU Phokhun Phamuang Logo" 
                className="w-full h-full object-contain filter drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-mcu-gold-light tracking-tight">
                {t.titleMain}
              </h4>
              <p className="text-[10px] text-mcu-pink-light font-light leading-none mt-0.5">
                {t.titleSub}
              </p>
            </div>
          </div>
          <p className="text-xs text-mcu-pink-light/85 font-light leading-relaxed">
            {t.address}
          </p>
          <div className="space-y-1.5 text-xs text-mcu-pink-light">
            <div className="flex items-center">
              <LucideIcon name="Phone" size={12} className="mr-2 text-mcu-gold" />
              <span>{t.phone}</span>
            </div>
            <div className="flex items-center">
              <LucideIcon name="Mail" size={12} className="mr-2 text-mcu-gold" />
              <span>{t.email}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-mcu-gold-light font-sans pb-1.5 border-b border-mcu-pink-dark">
            {t.quickLinks}
          </h4>
          <ul className="space-y-2 text-xs text-mcu-pink-light font-light">
            <li>
              <button onClick={() => handlePageNav('home')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'หน้าแรกของวิทยาลัย' : 'College Homepage'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('about')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'ประวัติและข้อมูลสถาบัน' : 'History & College Info'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('courses')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'หลักสูตรที่เปิดสอน' : 'Academic Programs'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('admission')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'รับสมัครนิสิตออนไลน์' : 'Admissions Open'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('news')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'ข่าวสารประชาสัมพันธ์ล่าสุด' : 'Latest News Announcements'}
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: IT Systems Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-mcu-gold-light font-sans pb-1.5 border-b border-mcu-pink-dark">
            {t.systems}
          </h4>
          <ul className="space-y-2 text-xs text-mcu-pink-light font-light">
            <li>
              <button onClick={() => handlePageNav('services')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'ระบบลงทะเบียนนิสิต (REG)' : 'Student Registry (REG)'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('services')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'ระบบบริการคำร้องนิสิต (E-Service)' : 'Student E-Service Requests'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('services')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'ระบบห้องสมุดพุทธคลังวิชาการ' : 'MCU Digital E-Library'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('services')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'ระบบการเรียนรู้ทางไกล (E-Learning)' : 'MCU Online E-Learning Classroom'}
              </button>
            </li>
            <li>
              <button onClick={() => handlePageNav('services')} className="hover:text-mcu-gold transition-colors cursor-pointer text-left">
                › {lang === 'th' ? 'ระบบสำหรับคณาจารย์และเจ้าหน้าที่' : 'Monastic HR Portal'}
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Policies and Socials */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-mcu-gold-light font-sans pb-1.5 border-b border-mcu-pink-dark">
            {t.policies}
          </h4>
          <ul className="space-y-2 text-xs text-mcu-pink-light font-light">
            <li>
              <a href="#" className="hover:text-mcu-gold transition-colors">
                › {t.privacy}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-mcu-gold transition-colors">
                › {t.cookies}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-mcu-gold transition-colors">
                › {t.sitemap}
              </a>
            </li>
          </ul>
          <div className="pt-2">
            <span className="text-[10px] text-mcu-pink-light/60 uppercase block mb-2 font-bold">Social Accounts</span>
            <div className="flex space-x-2 text-mcu-pink-deep">
              <a href="#" className="w-7 h-7 rounded-full bg-white hover:bg-mcu-gold-soft flex items-center justify-center transition-colors shadow-sm" aria-label="Facebook"><LucideIcon name="Facebook" size={13} /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white hover:bg-mcu-gold-soft flex items-center justify-center transition-colors shadow-sm" aria-label="YouTube"><LucideIcon name="Youtube" size={13} /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white hover:bg-mcu-gold-soft flex items-center justify-center transition-colors shadow-sm" aria-label="Line"><LucideIcon name="MessageCircle" size={13} /></a>
            </div>
          </div>
        </div>

      </div>

      {/* Trademark copyright block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-mcu-pink-dark/60 text-center text-xs text-mcu-pink-light/80 font-light space-y-2">
        <p className="font-sans leading-relaxed">
          {t.rights}
        </p>
        <p className="text-[10px] text-mcu-pink-light/50">
          {lang === 'th' 
            ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ ในกำกับมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย สถาบันการศึกษารัฐของไทย' 
            : 'Phokhun Phamuang Buddhist College of Mahachulalongkornrajavidyalaya University, a state institution of higher learning.'}
        </p>
      </div>

      {/* Back to top anchor */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-mcu-gold hover:bg-mcu-gold-light text-mcu-pink-deep p-2.5 rounded-full shadow-lg border-2 border-mcu-pink z-50 cursor-pointer focus:outline-none transition-all hover:-translate-y-1"
          aria-label="Back to top"
        >
          <LucideIcon name="ArrowUp" size={18} />
        </button>
      )}

    </footer>
  );
}
