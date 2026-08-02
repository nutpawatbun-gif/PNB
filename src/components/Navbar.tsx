import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../assets/images/regenerated_image_1784349405698.png';
import { api } from '../lib/api';
import AdminLoginModal from './AdminLoginModal';
import LucideIcon from './LucideIcon';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';
import {
  Search,
  Globe,
  UserCheck,
  Menu as MenuIcon,
  X
} from 'lucide-react';

interface NavbarProps {
  lang: 'th' | 'en';
  setLang: (lang: 'th' | 'en') => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onOpenLoginModal: () => void;
  navigateTo?: (page: string, subPage?: string, search?: string) => void;
}

export default function Navbar({
  lang,
  setLang,
  currentPage,
  setCurrentPage,
  onOpenLoginModal,
  navigateTo
}: NavbarProps) {
  const { theme, setTheme, currentThemeOption } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbMenus, setDbMenus] = useState<any[]>([]);

  // Active Dropdown States
  const [activeDropdownPage, setActiveDropdownPage] = useState<string | null>(null);
  const [activeMobilePage, setActiveMobilePage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getMenus()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbMenus(data.filter((m: any) => m.isVisible !== false));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownPage(null);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (page: string, subPage: string = 'landing', search: string = '') => {
    if (navigateTo) {
      navigateTo(page, subPage, search);
    } else {
      setCurrentPage(page);
    }
    setActiveDropdownPage(null);
    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(false);
  };

  // 1. Sub-items for "เกี่ยวกับเรา"
  const aboutSubItems = [
    { subPage: 'history', labelTh: 'ประวัติความเป็นมา', labelEn: 'History & Background', iconName: 'History', targetPage: 'about' },
    { subPage: 'philosophy', labelTh: 'ปรัชญา ปณิธาน และอัตลักษณ์', labelEn: 'Philosophy & Vision', iconName: 'Sparkles', targetPage: 'about' },
    { subPage: 'executives', labelTh: 'คณะผู้บริหารวิทยาลัยสงฆ์', labelEn: 'College Executives', iconName: 'Award', targetPage: 'about' },
    { subPage: 'structure', labelTh: 'โครงสร้างองค์กรวิทยาลัยสงฆ์', labelEn: 'Organization Structure', iconName: 'Building', targetPage: 'about' },
    { subPage: 'landing', labelTh: 'ทำเนียบบุคลากร', labelEn: 'Personnel Directory', iconName: 'Users', targetPage: 'personnel' }
  ];

  // 2. Sub-items for "หลักสูตร"
  const coursesSubItems = [
    { subPage: 'bachelor', labelTh: '🎓 ระดับปริญญาตรี', labelEn: "Bachelor's Degree", iconName: 'GraduationCap', targetPage: 'courses' },
    { subPage: 'master', labelTh: '🎓 ระดับปริญญาโท', labelEn: "Master's Degree", iconName: 'Award', targetPage: 'courses' },
    { subPage: 'doctor', labelTh: '🎓 ระดับปริญญาเอก', labelEn: 'Doctoral Degree', iconName: 'Sparkles', targetPage: 'courses' },
    { subPage: 'certificate', labelTh: '📜 หลักสูตรประกาศนียบัตร', labelEn: 'Certificate Programs', iconName: 'FileText', targetPage: 'courses' }
  ];

  // 3. Sub-items for "สมัครเรียน"
  const admissionSubItems = [
    { subPage: 'apply', labelTh: '📝 ยื่นใบสมัครออนไลน์', labelEn: 'Apply Online Wizard', iconName: 'UserPlus', targetPage: 'admission' },
    { subPage: 'status', labelTh: '🔍 ตรวจสอบสถานะ & พิมพ์ใบสมัคร', labelEn: 'Track & Print Status', iconName: 'Search', targetPage: 'admission' },
    { subPage: 'qualifications', labelTh: '📋 คุณสมบัติผู้สมัครเรียน', labelEn: 'Qualifications & Rules', iconName: 'UserCheck', targetPage: 'admission' },
    { subPage: 'documents', labelTh: '📌 เอกสารประกอบการสมัคร', labelEn: 'Required Documents', iconName: 'FileText', targetPage: 'admission' }
  ];

  // 4. Sub-items for "บริการออนไลน์ (E-Services)"
  const eservicesSubItems = [
    { subPage: 'student', labelTh: '👨‍🎓 สำหรับนิสิต (REG / LMS / Library)', labelEn: 'Student E-Services', iconName: 'GraduationCap', targetPage: 'eservices' },
    { subPage: 'staff', labelTh: '👨‍🏫 สำหรับอาจารย์ & บุคลากร (E-Saraban / HR)', labelEn: 'Staff & Faculty E-Services', iconName: 'Users', targetPage: 'eservices' },
    { subPage: 'public', labelTh: '🏛️ บริการประชาชน & จองสถานที่', labelEn: 'Public Services & Booking', iconName: 'Building', targetPage: 'eservices' }
  ];

  // 5. Sub-items for "ข่าวสาร & ประกาศ" (6 CMS Categories)
  const newsSubItems = [
    { subPage: 'general', labelTh: '📢 ข่าวประชาสัมพันธ์ (General PR)', labelEn: 'General News', iconName: 'Newspaper', targetPage: 'news' },
    { subPage: 'academic', labelTh: '🎓 ข่าววิชาการ (Academic News)', labelEn: 'Academic News', iconName: 'BookOpen', targetPage: 'news' },
    { subPage: 'activity', labelTh: '🎨 ข่าวกิจกรรม (Activities & Events)', labelEn: 'Activities & Events', iconName: 'Calendar', targetPage: 'news' },
    { subPage: 'mcu_announcement', labelTh: '🏛️ ข่าวประกาศมหาวิทยาลัย (MCU News)', labelEn: 'MCU Announcements', iconName: 'Building', targetPage: 'news' },
    { subPage: 'student_affairs', labelTh: '👤 ข่าวกิจการนิสิต (Student Affairs)', labelEn: 'Student Affairs', iconName: 'UserCheck', targetPage: 'news' },
    { subPage: 'procurement', labelTh: '📑 ข่าวจัดซื้อจัดจ้าง (Procurement & Bids)', labelEn: 'Procurement & Bids', iconName: 'FileText', targetPage: 'news' }
  ];

  // 6. Sub-items for "ผลงานวิชาการ"
  const academicSubItems = [
    { subPage: 'journals', labelTh: '📚 วารสารวิชาการ (Academic Journals)', labelEn: 'Academic Journals', iconName: 'BookOpen', targetPage: 'academic' },
    { subPage: 'research', labelTh: '🔬 งานวิจัย & วิทยานิพนธ์ (Research)', labelEn: 'Research Papers', iconName: 'FileText', targetPage: 'academic' },
    { subPage: 'textbooks', labelTh: '📖 ตำรา & เอกสารประกอบการสอน', labelEn: 'Courseware', iconName: 'BookOpen', targetPage: 'academic' }
  ];

  // 7. Sub-items for "ดาวน์โหลด"
  const downloadsSubItems = [
    { subPage: 'students', labelTh: '👨‍🎓 แบบฟอร์มสำหรับนิสิต (Student Forms)', labelEn: 'Student Forms', iconName: 'FileText', targetPage: 'downloads' },
    { subPage: 'staff', labelTh: '👨‍🏫 แบบฟอร์มสำหรับบุคลากร (Staff Forms)', labelEn: 'Staff Forms', iconName: 'Users', targetPage: 'downloads' },
    { subPage: 'regulations', labelTh: '📜 ระเบียบ & ข้อบังคับวิทยาลัย', labelEn: 'College Regulations', iconName: 'FileCheck', targetPage: 'downloads' }
  ];

  const navLinks = [
    { page: 'home', labelTh: 'หน้าแรก', labelEn: 'Home', iconName: 'Home' },
    { page: 'about', labelTh: 'เกี่ยวกับ', labelEn: 'About', iconName: 'Info', hasDropdown: true, subItems: aboutSubItems },
    { page: 'courses', labelTh: 'หลักสูตร', labelEn: 'Courses', iconName: 'GraduationCap', hasDropdown: true, subItems: coursesSubItems },
    { page: 'admission', labelTh: 'สมัครเรียน', labelEn: 'Admissions', iconName: 'UserPlus', hasDropdown: true, subItems: admissionSubItems },
    { page: 'eservices', labelTh: 'บริการออนไลน์', labelEn: 'E-Services', iconName: 'Monitor', hasDropdown: true, subItems: eservicesSubItems },
    { page: 'news', labelTh: 'ข่าวสาร & ประกาศ', labelEn: 'News', iconName: 'Newspaper', hasDropdown: true, subItems: newsSubItems },
    { page: 'academic', labelTh: 'ผลงานวิชาการ', labelEn: 'Academic Research', iconName: 'BookOpen', hasDropdown: true, subItems: academicSubItems },
    { page: 'calendar', labelTh: 'ปฏิทินกิจกรรม', labelEn: 'Calendar', iconName: 'Calendar' },
    { page: 'downloads', labelTh: 'ดาวน์โหลด', labelEn: 'Downloads', iconName: 'Download', hasDropdown: true, subItems: downloadsSubItems },
    { page: 'contact', labelTh: 'ติดต่อเรา', labelEn: 'Contact Us', iconName: 'Phone' }
  ];

  // Real Live Search State
  const [searchResults, setSearchResults] = useState<{
    news: any[];
    courses: any[];
    announcements: any[];
    downloads: any[];
    academic: any[];
    personnel: any[];
  }>({
    news: [],
    courses: [],
    announcements: [],
    downloads: [],
    academic: [],
    personnel: []
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ news: [], courses: [], announcements: [], downloads: [], academic: [], personnel: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const q = searchQuery.toLowerCase().trim();
      try {
        const [newsList, coursesList, annList, downList, acadList, persList] = await Promise.all([
          api.getNews().catch(() => []),
          api.getCourses().catch(() => []),
          api.getAnnouncements().catch(() => []),
          api.getDownloads().catch(() => []),
          api.getAcademicWorks().catch(() => []),
          api.getPersonnel().catch(() => [])
        ]);

        setSearchResults({
          news: (Array.isArray(newsList) ? newsList : []).filter((item: any) =>
            (item.title || item.name || '').toLowerCase().includes(q) ||
            (item.excerpt || item.content || '').toLowerCase().includes(q)
          ).slice(0, 4),
          courses: (Array.isArray(coursesList) ? coursesList : []).filter((item: any) =>
            (item.titleTh || item.titleEn || item.code || '').toLowerCase().includes(q) ||
            (item.descriptionTh || '').toLowerCase().includes(q)
          ).slice(0, 4),
          announcements: (Array.isArray(annList) ? annList : []).filter((item: any) =>
            (item.title || '').toLowerCase().includes(q) ||
            (item.content || '').toLowerCase().includes(q)
          ).slice(0, 4),
          downloads: (Array.isArray(downList) ? downList : []).filter((item: any) =>
            (item.title || item.filename || '').toLowerCase().includes(q)
          ).slice(0, 4),
          academic: (Array.isArray(acadList) ? acadList : []).filter((item: any) =>
            (item.title || item.authors || '').toLowerCase().includes(q)
          ).slice(0, 4),
          personnel: (Array.isArray(persList) ? persList : []).filter((item: any) =>
            (item.fullName || item.title || '').toLowerCase().includes(q) ||
            (item.position || item.academicRank || '').toLowerCase().includes(q)
          ).slice(0, 4)
        });
      } catch (err) {
        console.error('Error in live search:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalResultsCount = 
    searchResults.news.length +
    searchResults.courses.length +
    searchResults.announcements.length +
    searchResults.downloads.length +
    searchResults.academic.length +
    searchResults.personnel.length;

  return (
    <header className="sticky top-0 z-[999] w-full transition-all">
      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-mcu-pink-deep text-amber-100 text-xs py-1.5 px-3 sm:px-8 flex items-center justify-between border-b border-amber-500/20 shadow-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          <span className="font-medium tracking-wide hidden md:inline-flex items-center gap-2 text-xs">
            วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
          </span>
          <span className="font-bold tracking-wide md:hidden text-[11px] text-amber-200">
            MCU PKPM Portal
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Theme Switcher Dropdown in Top Bar */}
          <div className="relative z-[9999]" ref={themeDropdownRef}>
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="flex items-center gap-1 hover:text-white font-semibold transition-all bg-white/10 hover:bg-white/20 hover:shadow-xs px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs cursor-pointer border border-white/15 whitespace-nowrap"
              title="เปลี่ยนธีมเว็บไซต์ (Change Site Theme)"
            >
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${currentThemeOption.badgeBg} ring-1 ring-white/30 shrink-0`}></span>
              <span>{lang === 'th' ? '🎨 ธีม' : '🎨 Theme'}</span>
              <LucideIcon name="ChevronDown" size={12} className={`transition-transform duration-300 shrink-0 ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 glass-dropdown rounded-2xl p-1.5 z-[9999] animate-in fade-in slide-in-from-top-2 text-slate-800 dark:text-slate-100 shadow-2xl">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {lang === 'th' ? 'เลือกธีมแสดงผลเว็บไซต์' : 'Select Site Theme'}
                </div>
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setIsThemeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      theme === opt.id 
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold shadow-xs' 
                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${opt.badgeBg} shadow-xs ring-2 ring-white dark:ring-slate-900`}></span>
                      <span>{lang === 'th' ? opt.nameTh : opt.nameEn}</span>
                    </div>
                    {theme === opt.id && <LucideIcon name="Check" size={14} className="text-amber-600 dark:text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="flex items-center gap-1 hover:text-white font-semibold transition-all bg-white/10 hover:bg-white/20 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs cursor-pointer border border-white/15 whitespace-nowrap"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
            <span>{lang === 'th' ? 'TH | EN' : 'EN | TH'}</span>
          </button>
          <button
            onClick={() => setIsAdminLoginModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-700 to-mcu-pink-deep hover:from-amber-600 hover:to-mcu-pink px-2.5 sm:px-3 py-1 rounded-full text-amber-50 shadow-xs hover:shadow-md transition-all font-semibold cursor-pointer border border-amber-400/30 whitespace-nowrap"
          >
            <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
            <span>{lang === 'th' ? 'เข้าสู่ระบบ (Admin)' : 'Admin Login'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar: 2-Row Layout */}
      <nav className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ${isScrolled ? 'shadow-md shadow-amber-900/5' : ''}`}>
        
        {/* ROW 1: Header Brand Row (Logo + College Name + Subtitle + Quick Actions) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
          {/* Logo & College Title */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-mcu-pink opacity-0 group-hover:opacity-30 blur-md transition-all duration-300"></div>
              <img
                src={logoImg}
                alt="MCU PKPM Logo"
                className="relative h-12 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <h1 className="text-sm sm:text-xl font-extrabold text-amber-950 dark:text-amber-300 leading-tight tracking-tight group-hover:text-mcu-pink transition-colors">
                วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์
              </h1>
              <p className="text-[10px] sm:text-sm text-amber-800/90 dark:text-slate-300 font-semibold mt-0.5">
                มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              </p>
            </div>
          </div>

          {/* Header Right Actions (Search & Quick Admission CTA) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-amber-300/40 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800 hover:bg-amber-100/50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              title="ค้นหาข่าวสาร/หลักสูตร"
            >
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>ค้นหาในเว็บไซต์...</span>
            </button>

            <button
              onClick={() => handleNav('admission', 'apply')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-mcu-pink to-amber-600 hover:from-mcu-pink-dark hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <LucideIcon name="UserPlus" size={14} className="text-amber-200" />
              <span>สมัครเรียนออนไลน์</span>
            </button>

            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="sm:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ROW 2: Main Menu Navigation Bar */}
        <div className="hidden lg:block bg-slate-50/70 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-1.5">
            <div className="flex items-center gap-1 xl:gap-2 flex-nowrap w-full">
              {navLinks.map((link) => {
                const isActive = currentPage === link.page;
                const isDropdownOpen = activeDropdownPage === link.page;
                const subList = link.subItems || [];
                
                if (link.hasDropdown && subList.length > 0) {
                  return (
                    <div
                      key={link.page}
                      ref={dropdownRef}
                      className="relative group shrink-0 z-[9999]"
                      onMouseEnter={() => setActiveDropdownPage(link.page)}
                      onMouseLeave={() => setActiveDropdownPage(null)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownPage(isDropdownOpen ? null : link.page);
                        }}
                        className={`px-3 xl:px-4 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center whitespace-nowrap nav-link-glow group shrink-0 cursor-pointer ${
                          isActive
                            ? 'active bg-mcu-pink/10 text-mcu-pink-deep dark:text-amber-400 font-bold shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-mcu-pink-deep hover:shadow-xs'
                        }`}
                      >
                        <LucideIcon name={link.iconName} size={15} className="mr-1.5 text-mcu-pink nav-icon-bounce shrink-0" />
                        <span className="whitespace-nowrap">{lang === 'th' ? link.labelTh : link.labelEn}</span>
                        <LucideIcon name="ChevronDown" size={14} className={`ml-1 transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180 text-mcu-pink' : 'text-slate-400'}`} />
                      </button>

                      {/* Dynamic Submenus Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-72 glass-dropdown rounded-2xl p-2 space-y-1 z-[9999] animate-in fade-in slide-in-from-top-2 shadow-2xl">
                          {subList.map((subItem) => (
                            <button
                              key={subItem.subPage}
                              onClick={() => handleNav(subItem.targetPage || link.page, subItem.subPage)}
                              className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-mcu-pink/10 hover:text-mcu-pink-deep flex items-center whitespace-nowrap transition-all group cursor-pointer"
                            >
                              <div className="p-1.5 rounded-lg bg-mcu-pink/10 group-hover:bg-mcu-pink group-hover:text-white transition-colors mr-2.5 shrink-0">
                                <LucideIcon name={subItem.iconName} size={14} className="text-mcu-pink group-hover:text-white shrink-0 transition-transform group-hover:scale-110" />
                              </div>
                              <span className="whitespace-nowrap">{lang === 'th' ? subItem.labelTh : subItem.labelEn}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    className={`px-3 xl:px-4 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center whitespace-nowrap nav-link-glow group shrink-0 ${
                      isActive
                        ? 'active bg-mcu-pink/10 text-mcu-pink-deep dark:text-amber-400 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-mcu-pink-deep hover:shadow-xs'
                    }`}
                  >
                    <LucideIcon name={link.iconName} size={15} className="mr-1.5 text-mcu-pink nav-icon-bounce shrink-0" />
                    <span className="whitespace-nowrap">{lang === 'th' ? link.labelTh : link.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const isMobileOpen = activeMobilePage === link.page;
              const subList = link.subItems || [];

              if (link.hasDropdown && subList.length > 0) {
                return (
                  <div key={link.page} className="space-y-1">
                    <button
                      onClick={() => setActiveMobilePage(isMobileOpen ? null : link.page)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                        currentPage === link.page
                          ? 'bg-mcu-pink text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center">
                        <LucideIcon name={link.iconName} size={15} className={`mr-1.5 ${currentPage === link.page ? 'text-white' : 'text-mcu-pink'}`} />
                        <span>{lang === 'th' ? link.labelTh : link.labelEn}</span>
                      </div>
                      <LucideIcon name="ChevronDown" size={14} className={`ml-1 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMobileOpen && (
                      <div className="pl-6 space-y-1 border-l-2 border-mcu-pink/30 ml-3">
                        {subList.map((subItem) => (
                          <button
                            key={subItem.subPage}
                            onClick={() => handleNav(subItem.targetPage || link.page, subItem.subPage)}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-mcu-pink/10 hover:text-mcu-pink-deep flex items-center"
                          >
                            <LucideIcon name={subItem.iconName} size={15} className="mr-1.5 text-mcu-pink shrink-0" />
                            <span>{lang === 'th' ? subItem.labelTh : subItem.labelEn}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center ${
                    currentPage === link.page
                      ? 'bg-mcu-pink text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LucideIcon name={link.iconName} size={15} className={`mr-1.5 ${currentPage === link.page ? 'text-white' : 'text-mcu-pink'}`} />
                  <span>{lang === 'th' ? link.labelTh : link.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Real Live Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                    ค้นหาข้อมูลในเว็บไซต์วิทยาลัยสงฆ์
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ค้นหาข่าวสาร, หลักสูตร, ประกาศ, ผลงานวิชาการ, เอกสารดาวน์โหลด และบุคลากร
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSearchModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Field */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์คำค้นหา เช่น พระพุทธศาสนา, สมัครเรียน, ปริญญาโท, ประกาศ..."
                className="w-full pl-11 pr-10 py-3.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status indicator */}
            {searchQuery && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 shrink-0">
                <span>
                  {isSearching ? (
                    <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                      <LucideIcon name="Loader2" size={14} className="animate-spin" /> กำลังค้นหาข้อมูลเรียลไทม์...
                    </span>
                  ) : (
                    <span>ผลการค้นหาสำหรับ <strong className="text-amber-600 dark:text-amber-400">"{searchQuery}"</strong> ({totalResultsCount} รายการ)</span>
                  )}
                </span>
              </div>
            )}

            {/* Results Container */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {!searchQuery.trim() && (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-amber-600">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    เริ่มพิมพ์เพื่อค้นหาข่าวสาร, หลักสูตร, เอกสารดาวน์โหลด หรือรายชื่อบุคลากร
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-400">ตัวอย่างคำค้นหา:</span>
                    {['ปริญญาโท', 'รับสมัคร', 'ทุนการศึกษา', 'ปฏิทิน', 'วิจัย'].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setSearchQuery(kw)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isSearching && searchQuery.trim() && totalResultsCount === 0 && (
                <div className="text-center py-12 space-y-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">ไม่พบข้อมูลที่ตรงกับคำค้นหา "{searchQuery}"</p>
                  <p className="text-xs text-slate-500">กรุณาลองใช้คำค้นหาอื่น เช่น "หลักสูตร", "ประกาศ", หรือ "สมัครเรียน"</p>
                </div>
              )}

              {/* News & Announcements Section */}
              {searchResults.news.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-mcu-pink flex items-center gap-1.5 uppercase tracking-wider">
                    <LucideIcon name="Newspaper" size={14} /> ข่าวสารและประชาสัมพันธ์ ({searchResults.news.length})
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.news.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNav('news')}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-mcu-pink/10 dark:hover:bg-amber-950/40 border border-slate-100 dark:border-slate-800 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-mcu-pink transition-colors">
                            {item.title || item.name}
                          </h4>
                          {item.excerpt && <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.excerpt}</p>}
                        </div>
                        <LucideIcon name="ChevronRight" size={16} className="text-slate-400 group-hover:text-mcu-pink shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses Section */}
              {searchResults.courses.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <LucideIcon name="GraduationCap" size={14} /> หลักสูตรวิชาการที่เปิดสอน ({searchResults.courses.length})
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.courses.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNav('courses')}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-100 dark:border-slate-800 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                            {item.titleTh || item.titleEn}
                          </h4>
                          {item.degreeLevel && <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-md">{item.degreeLevel}</span>}
                        </div>
                        <LucideIcon name="ChevronRight" size={16} className="text-slate-400 group-hover:text-amber-600 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Downloads Section */}
              {searchResults.downloads.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <LucideIcon name="Download" size={14} /> เอกสารและแบบฟอร์มดาวน์โหลด ({searchResults.downloads.length})
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.downloads.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNav('downloads')}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-800 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <LucideIcon name="FileText" size={16} className="text-emerald-600 shrink-0" />
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 transition-colors">
                            {item.title || item.filename}
                          </h4>
                        </div>
                        <LucideIcon name="ChevronRight" size={16} className="text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personnel Section */}
              {searchResults.personnel.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <LucideIcon name="Users" size={14} /> บุคลากรและทำเนียบคณาจารย์ ({searchResults.personnel.length})
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.personnel.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNav('personnel')}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                            {item.fullName || item.title}
                          </h4>
                          {item.position && <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.position}</p>}
                        </div>
                        <LucideIcon name="ChevronRight" size={16} className="text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Popup Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccessLogin={() => {
          if (navigateTo) navigateTo('admin');
          else setCurrentPage('admin');
        }}
      />
    </header>
  );
}
