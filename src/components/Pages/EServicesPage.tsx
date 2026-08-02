import React, { useState } from 'react';
import {
  Monitor,
  GraduationCap,
  Users,
  FileText,
  BookOpen,
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Shield,
  Search,
  Lock,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Building,
  UserCheck
} from 'lucide-react';

interface EServicesPageProps {
  lang: 'th' | 'en';
  activeCategory?: string;
  navigateTo?: (page: string, subPage?: string, search?: string) => void;
}

export default function EServicesPage({
  lang,
  activeCategory = 'all',
  navigateTo
}: EServicesPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>(activeCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const services = [
    // 1. Student Systems (สำหรับนิสิต)
    {
      id: 'reg',
      category: 'student',
      titleTh: 'ระบบทะเบียนและประมวลผลการศึกษา (REG System)',
      titleEn: 'Student Registration & Academic Records System',
      descriptionTh: 'ลงทะเบียนเรียนออนไลน์ ตารางเรียน ตารางสอบ ตรวจสอบผลการเรียน (GPA) และตรวจสอบสถานะทางการศึกษา',
      icon: GraduationCap,
      badge: 'ระบบหลักนิสิต',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      url: 'https://reg.mcu.ac.th',
      isExternal: true
    },
    {
      id: 'lms',
      category: 'student',
      titleTh: 'ระบบห้องเรียนออนไลน์ (MCU LMS / Moodle Classroom)',
      titleEn: 'MCU Online Learning Management System (LMS)',
      descriptionTh: 'เข้าสู่ห้องเรียนออนไลน์ สื่อการสอน มอบหมายงาน อัปโหลดการบ้าน และห้องสอบเก็บคะแนนรายวิชา',
      icon: Monitor,
      badge: 'การเรียนการสอน',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      url: 'https://lms.mcu.ac.th',
      isExternal: true
    },
    {
      id: 'library',
      category: 'student',
      titleTh: 'ระบบสำนักหอพักและคลังปัญญาออนไลน์ (E-Library & OPAC)',
      titleEn: 'Digital Library & Institutional Repository',
      descriptionTh: 'สืบค้นหนังสือ วารสาร งานวิจัย คลังบทความวิชาการพระพุทธศาสนา และจองหนังสือออนไลน์',
      icon: BookOpen,
      badge: 'คลังปัญญา',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      url: 'https://lib.mcu.ac.th',
      isExternal: true
    },
    {
      id: 'scholarship',
      category: 'student',
      titleTh: 'ระบบหอพักนิสิต & ทุนการศึกษาสมบูรณ์แบบ',
      titleEn: 'Student Dormitory & Scholarship Management',
      descriptionTh: 'ยื่นคำร้องขอทุนอุดหนุนการศึกษาพระภิกษุสามเณร ทุนคฤหัสถ์ผู้มีผลการเรียนดี และระบบจองหอพัก',
      icon: Award,
      badge: 'สวัสดิการนิสิต',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      url: '/admission?tab=qualifications',
      isExternal: false
    },

    // 2. Staff & Faculty Systems (สำหรับอาจารย์และบุคลากร)
    {
      id: 'saraban',
      category: 'staff',
      titleTh: 'ระบบสารบรรณอิเล็กทรอนิกส์ (E-Saraban & E-Document)',
      titleEn: 'Electronic Document & Correspondence System',
      descriptionTh: 'รับ-ส่งหนังสือราชการ ติดตามสถานะเสนอเซ็นอนุมัติ และจัดเก็บแฟ้มเอกสารอิเล็กทรอนิกส์สถาบัน',
      icon: FileText,
      badge: 'งานบริหารเอกสาร',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      url: '/admin',
      isExternal: false
    },
    {
      id: 'hr',
      category: 'staff',
      titleTh: 'ระบบบริหารงานบุคคล & เงินเดือน (HR & Payroll Portal)',
      titleEn: 'Human Resource & Payroll Portal',
      descriptionTh: 'ตรวจสอบข้อมูลบุคลากร สลิปเงินเดือน สิทธิการเบิกจ่ายสวัสดิการ และประวัติการเลื่อนขั้นตำแหน่ง',
      icon: Users,
      badge: 'งานบุคลากร',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      url: '/admin?module=personnel',
      isExternal: false
    },
    {
      id: 'grade',
      category: 'staff',
      titleTh: 'ระบบบันทึกผลการเรียนอาจารย์ (Grade Entry System)',
      titleEn: 'Faculty Grade Submission & Evaluation Portal',
      descriptionTh: 'ระบบสำหรับอาจารย์ผู้สอนบันทึกคะแนนเก็บ ประเมินผล และส่งเกรดรายวิชาเข้าสู่ระบบทะเบียนกลาง',
      icon: UserCheck,
      badge: 'อาจารย์ผู้สอน',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      url: 'https://reg.mcu.ac.th/faculty',
      isExternal: true
    },
    {
      id: 'eleave',
      category: 'staff',
      titleTh: 'ระบบยื่นใบลาออนไลน์ (E-Leave Management System)',
      titleEn: 'Staff E-Leave Request & Approval System',
      descriptionTh: 'ยื่นใบลาป่วย ลากิจ ลาปฏิบัติธรรม/ลาบวช พร้อมระบบอนุมัติออนไลน์ตามลำดับชั้นผู้บังคับบัญชา',
      icon: Calendar,
      badge: 'สวัสดิการบุคลากร',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      url: '/admin',
      isExternal: false
    },

    // 3. Public Services (สำหรับบุคคลทั่วไปและผู้มาติดต่อ)
    {
      id: 'booking',
      category: 'public',
      titleTh: 'ระบบขอใช้และจองห้องประชุม/สถานที่ออนไลน์',
      titleEn: 'Conference Room & Venue Booking System',
      descriptionTh: 'ตรวจสอบปฏิทินการใช้ห้องประชุม หอประชุมใหญ่ และยื่นคำร้องขอใช้สถานที่จัดกิจกรรมสถาบัน',
      icon: Building,
      badge: 'บริการสถานที่',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      url: '/calendar',
      isExternal: false
    },
    {
      id: 'petition',
      category: 'public',
      titleTh: 'ระบบรับเรื่องร้องเรียน & ข้อเสนอแนะ (E-Petition / Helpdesk)',
      titleEn: 'Public E-Petition & Helpdesk Center',
      descriptionTh: 'ช่องทางส่งข้อเสนอแนะ แจ้งปัญหาการใช้งาน หรือยื่นเรื่องร้องเรียนตรงถึงผู้บริหารวิทยาลัยสงฆ์',
      icon: HelpCircle,
      badge: 'บริการประชาชน',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      url: '/contact',
      isExternal: false
    }
  ];

  const filteredServices = services.filter((s) => {
    const matchCat = selectedFilter === 'all' || s.category === selectedFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || s.titleTh.toLowerCase().includes(q) || s.descriptionTh.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleLaunchService = (service: any) => {
    if (service.isExternal) {
      window.open(service.url, '_blank');
    } else if (navigateTo) {
      if (service.url.startsWith('/admin')) {
        navigateTo('admin');
      } else if (service.url.startsWith('/contact')) {
        navigateTo('contact');
      } else if (service.url.startsWith('/calendar')) {
        navigateTo('calendar');
      } else if (service.url.startsWith('/admission')) {
        navigateTo('admission', 'qualifications');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-amber-800 to-mcu-pink-deep p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 border border-amber-300/30 text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MCU PKPM E-Services Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ศูนย์รวมระบบบริการออนไลน์และสารสนเทศ
            </h1>
            <p className="text-sm sm:text-base text-amber-100 font-light leading-relaxed">
              บริการสารสนเทศอิเล็กทรอนิกส์ครบวงจรสำหรับนิสิต พระภิกษุสามเณร อาจารย์ บุคลากร และประชาชนทั่วไป
            </p>
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {[
                { id: 'all', label: 'ทั้งหมด (All Services)' },
                { id: 'student', label: '👨‍🎓 สำหรับนิสิต (Student)' },
                { id: 'staff', label: '👨‍🏫 สำหรับอาจารย์ & บุคลากร (Staff)' },
                { id: 'public', label: '🏛️ บริการประชาชน (Public)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedFilter === tab.id
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาระบบบริการออนไลน์..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const IconComp = service.icon;

            return (
              <div
                key={service.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <IconComp size={24} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors leading-snug">
                      {service.titleTh}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5 font-mono">
                      {service.titleEn}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {service.descriptionTh}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => handleLaunchService(service)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-md"
                  >
                    <span>เข้าสู่ระบบ / ใช้งานบริการ</span>
                    {service.isExternal ? (
                      <ExternalLink size={14} className="shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
