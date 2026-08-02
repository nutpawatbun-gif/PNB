import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/images/regenerated_image_1784349405698.png';
import { api } from '../../lib/api';
import { coursesStore } from '../../data/coursesStore';
import { Course } from '../../types';
import AdmissionFormWizard from '../AdmissionFormWizard';
import { Modal } from '../ui/Modal';
import { QRCodeSVG } from '../ui/QRCodeSVG';
import { formatMCUCode } from '../../utils/formatters';
import { InputField, SelectField, TextareaField } from '../ui/FormControls';
import {
  GraduationCap,
  FileText,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Send,
  AlertCircle,
  BookOpen,
  ArrowRight,
  UserCheck,
  Award,
  HelpCircle,
  MapPin,
  Clock,
  Download,
  CheckSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Share2,
  Users,
  Building,
  Info,
  Printer
} from 'lucide-react';

interface AdmissionPageProps {
  lang: 'th' | 'en';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigateTo: (page: string, subPage?: string, search?: string) => void;
}

export default function AdmissionPage({
  lang,
  activeTab,
  setActiveTab,
  navigateTo
}: AdmissionPageProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>(() => coursesStore.getCourses());
  const [allApplicants, setAllApplicants] = useState<any[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [selectedPrintApplicant, setSelectedPrintApplicant] = useState<any | null>(null);

  // Security Verification Modal States
  const [verifyingApplicant, setVerifyingApplicant] = useState<any | null>(null);
  const [verifyInput, setVerifyInput] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string>('');

  const [isSearchingStatus, setIsSearchingStatus] = useState(false);
  const [programLevelFilter, setProgramLevelFilter] = useState<string>('all');
  const [submitSuccessCode, setSubmitSuccessCode] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active Menu Tab (Default to 'apply' so Online Admission Wizard renders immediately)
  const currentTab = ['announcements', 'programs', 'qualifications', 'workflow', 'documents', 'overview', 'status', 'faqs', 'contact'].includes(activeTab)
    ? activeTab
    : 'apply';

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Synchronize courses and applicants database
  useEffect(() => {
    api.getAdmissions()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});

    api.getApplicants()
      .then((data) => {
        if (Array.isArray(data)) setAllApplicants(data);
      })
      .catch(() => {});

    api.getCourses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch(() => {});

    const unsubscribe = coursesStore.subscribe(() => {
      const updated = coursesStore.getCourses();
      if (Array.isArray(updated) && updated.length > 0) {
        setCourses(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartVerifyPrint = (applicant: any) => {
    setVerifyingApplicant(applicant);
    setVerifyInput('');
    setVerifyError('');
  };

  const handleConfirmVerify = () => {
    if (!verifyingApplicant) return;

    const cleanInput = verifyInput.replace(/\D/g, '');
    const cleanPhone = (verifyingApplicant.phone || '').replace(/\D/g, '');
    const cleanId = (verifyingApplicant.nationalId || '').replace(/\D/g, '');

    if (!cleanInput) {
      setVerifyError('กรุณากรอกเบอร์โทรศัพท์ หรือเลขบัตรประชาชน 13 หลัก');
      return;
    }

    const isMatch = (cleanInput.length >= 7 && (cleanPhone.includes(cleanInput) || cleanInput.includes(cleanPhone))) ||
                    (cleanInput.length >= 10 && (cleanId.includes(cleanInput) || cleanInput.includes(cleanId))) ||
                    verifyInput.trim() === verifyingApplicant.email;

    if (isMatch) {
      const target = verifyingApplicant;
      setVerifyingApplicant(null);
      setVerifyInput('');
      setVerifyError('');

      if (target.status === 'pending') {
        showToast('⏳ ใบสมัครของท่านอยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบเอกสาร จะพิมพ์เอกสารได้เมื่อได้รับอนุมัติแล้ว', 'error');
        setSelectedPrintApplicant(target);
      } else {
        showToast('✅ ยืนยันตัวตนสำเร็จ ระบบเปิดหน้าพิมพ์ใบสมัครให้อัตโนมัติ', 'success');
        setSelectedPrintApplicant(target);
      }
    } else {
      setVerifyError('❌ ข้อมูลยืนยันตัวตนไม่ถูกต้อง กรุณากรอกเบอร์โทรศัพท์ หรือเลขบัตรประชาชน 13 หลักของผู้สมัครรายนี้ให้ถูกต้อง');
    }
  };

  const handleCheckStatusWithCode = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;

    setIsSearchingStatus(true);
    try {
      const applicants = await api.getApplicants();
      const found = (Array.isArray(applicants) ? applicants : []).find(
        (a: any) =>
          String(a.applicationCode)?.toLowerCase() === codeToSearch.trim().toLowerCase() ||
          String(a.nationalId) === codeToSearch.trim() ||
          String(a.phone) === codeToSearch.trim() ||
          a.id === codeToSearch.trim()
      );
      if (found) {
        setSearchResult(found);
      } else {
        setSearchResult(null);
        showToast('ไม่พบข้อมูลการสมัครเรียนตามรหัสหรือเบอร์โทรที่ระบุ', 'error');
      }
    } catch (e: any) {
      showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
    } finally {
      setIsSearchingStatus(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCheckStatusWithCode(searchCode);
  };

  // Menu List Configuration
  const menuItems = [
    { id: 'overview', title: 'ภาพรวมการรับสมัคร', icon: Sparkles, badge: 'เปิดรับสมัคร' },
    { id: 'announcements', title: 'ประกาศและระเบียบการ', icon: FileText },
    { id: 'programs', title: 'หลักสูตรที่เปิดรับสมัคร', icon: BookOpen, badge: `${courses.length} หลักสูตร` },
    { id: 'qualifications', title: 'คุณสมบัติผู้สมัครเรียน', icon: UserCheck },
    { id: 'workflow', title: 'ขั้นตอนการสมัครเรียน', icon: Calendar },
    { id: 'documents', title: 'เอกสารประกอบการสมัคร', icon: FileCheck },
    { id: 'apply', title: 'สมัครเรียนออนไลน์', icon: GraduationCap, highlight: true },
    { id: 'status', title: 'ตรวจสอบสถานะผู้สมัคร', icon: Search },
    { id: 'faqs', title: 'คำถามที่พบบ่อย (FAQs)', icon: HelpCircle },
    { id: 'contact', title: 'ติดต่อกองงานรับสมัคร', icon: Phone },
  ];

  const faqsList = [
    {
      q: 'พระภิกษุและสามเณรมีสวัสดิการการเรียนอย่างไร?',
      a: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง มอบทุนอุดหนุนการศึกษาสมบูรณ์แบบสำหรับพระภิกษุสามเณรในหลักสูตรพุทธศาสตรบัณฑิต (เรียนฟรีตลอดหลักสูตร) พร้อมหอพักและภัตตาหาร'
    },
    {
      q: 'ผู้จบการศึกษา กศน. หรือ ป.ธ. 3 สามารถสมัครระดับปริญญาตรีได้หรือไม่?',
      a: 'สามารถสมัครเข้าศึกษาในระดับปริญญาตรีได้ตามระเบียบของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'
    },
    {
      q: 'หากยังไม่ได้รับใบระเบียนแสดงผลการเรียนตัวจริง สามารถสมัครก่อนได้ไหม?',
      a: 'สมัครได้ โดยใช้หนังสือรับรองสถานะการเป็นนักเรียน/นักศึกษาที่กำลังศึกษาอยู่ในภาคเรียนสุดท้ายแนบสมัครก่อนได้'
    },
    {
      q: 'รูปแบบการเรียนการสอนมีกี่เซคชัน?',
      a: 'เปิดสอนทั้งภาคปกติ (วันจันทร์ - วันศุกร์) สำหรับพระภิกษุสามเณรและบุคคลทั่วไป และภาคนอกเวลาทำการ (วันเสาร์ - วันอาทิตย์) สำหรับผู้ทำงาน'
    },
    {
      q: 'สามารถยื่นใบสมัครด้วยตนเองที่วิทยาลัยได้หรือไม่?',
      a: 'สามารถยื่นใบสมัครออนไลน์ผ่านระบบนี้ หรือเดินทางมายื่นด้วยตนเอง ณ ห้องกองงานรับสมัคร อาคารเรียนวิทยาลัยสงฆ์พ่อขุนผาเมือง ในวันและเวลาทำการ'
    }
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'bachelor':
        return { label: 'ปริญญาตรี', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'master':
        return { label: 'ปริญญาโท', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'doctor':
        return { label: 'ปริญญาเอก', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'certificate':
        return { label: 'ประกาศนียบัตร', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      default:
        return { label: 'หลักสูตรวิชาการ', color: 'bg-sky-100 text-sky-800 border-sky-300' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-rose-500 text-white border-rose-400'
          }`}
        >
          <span>{toast.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 border border-amber-300/30 text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admission Dashboard 2569</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ศูนย์รับสมัครนักศึกษาออนไลน์
            </h1>
            <p className="text-sm sm:text-base text-amber-100 font-light leading-relaxed">
              วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              บริการข้อมูลหลักสูตรที่เปิดสอน ข้อมูลรับสมัคร และตรวจสอบสถานะผู้สมัครอย่างครบวงจร
            </p>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Menu Navigation */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-1.5 sticky top-6">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  เมนูส่วนการรับสมัคร (Menu)
                </h3>
              </div>

              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-600/20 translate-x-1'
                        : item.highlight
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-3 min-h-[600px]">
            {/* 1. ภาพรวมการรับสมัคร (Overview) */}
            {currentTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400">หลักสูตรเปิดสอน</span>
                    <div className="text-2xl font-black text-amber-600">{courses.length} หลักสูตร</div>
                    <p className="text-[11px] text-emerald-600 font-medium">เชื่อมตรงจากคลังหลักสูตร</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400">ทุนการศึกษา</span>
                    <div className="text-2xl font-black text-amber-600">100%</div>
                    <p className="text-[11px] text-emerald-600 font-medium">ฟรีสวัสดิการพระภิกษุ</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400">เปิดรับสมัครถึง</span>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100">31 พ.ค. 2569</div>
                    <p className="text-[11px] text-amber-600 font-medium">ภาคการศึกษาที่ 1/2569</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400">ช่องทางสมัคร</span>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100">ออนไลน์ & อาคารเรียน</div>
                    <p className="text-[11px] text-slate-500">บริการ 24 ชั่วโมง</p>
                  </div>
                </div>

                {/* Quick Action Box */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">พร้อมเริ่มต้นการศึกษาแล้วหรือยัง?</h3>
                    <p className="text-xs text-amber-100">กรอกข้อมูลสมัครเรียนออนไลน์ในหลักสูตรที่เปิดสอนได้ทันที</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveTab('apply')}
                      className="px-6 py-3 bg-white text-amber-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>สมัครเรียนออนไลน์</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('status')}
                      className="px-5 py-3 bg-amber-700/60 hover:bg-amber-700 text-white font-bold text-xs rounded-xl border border-amber-400/30 transition-all"
                    >
                      ตรวจสอบสถานะ
                    </button>
                  </div>
                </div>

                {/* Active Admission Projects (Dynamic Backend Synchronization) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span>โครงการรับสมัครนิสิตใหม่ที่เปิดรับสมัครในขณะนี้ ({projects.length} โครงการ)</span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ● ซิงก์เรียลไทม์จากระบบหลังบ้าน
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              proj.degreeLevel?.includes('โท') ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {proj.degreeLevel || 'ปริญญาโท'}
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                              ปีการศึกษา {proj.academicYear || '2569'}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                            {proj.title}
                          </h4>

                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light line-clamp-2">
                            {proj.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-amber-200/40 dark:border-amber-900/40 flex items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-500">
                            {proj.quota && <span><strong>จำนวนเปิดรับ:</strong> {proj.quota} อัตรา</span>}
                            {proj.fee && <span className="ml-2 font-medium text-amber-700">({proj.fee})</span>}
                          </div>
                          <button
                            onClick={() => setActiveTab('apply')}
                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>สมัครเรียน</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Schedule */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span>กำหนดการสำคัญ การรับสมัครนิสิตใหม่ ปีการศึกษา 2569</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">ขั้นตอนที่ 1</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">รับสมัครออนไลน์ & อาคารเรียน</h4>
                      <p className="text-xs text-slate-500">วันนี้ - 31 พฤษภาคม 2569</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">ขั้นตอนที่ 2</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">สอบสัมภาษณ์ & ประกาศผล</h4>
                      <p className="text-xs text-slate-500">1 - 5 มิถุนายน 2569</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">ขั้นตอนที่ 3</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">รายงานตัวขึ้นทะเบียนนิสิต</h4>
                      <p className="text-xs text-slate-500">10 มิถุนายน 2569</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ประกาศและระเบียบการ (Announcements) */}
            {currentTab === 'announcements' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <span>ประกาศและระเบียบการรับสมัคร</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">ดาวน์โหลดเอกสารระเบียบการรับสมัครอย่างเป็นทางการของวิทยาลัย</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        ประกาศวิทยาลัยสงฆ์พ่อขุนผาเมือง เรื่อง การรับสมัครบุคคลเข้าศึกษาประจำปีการศึกษา 2569
                      </h3>
                      <p className="text-xs text-slate-500">ไฟล์เอกสาร PDF (ขนาด 2.4 MB) • อัปเดตล่าสุด 15 มีนาคม 2569</p>
                    </div>
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0">
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        ระเบียบมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ว่าด้วยการศึกษาระดับปริญญาตรี พ.ศ. 2568
                      </h3>
                      <p className="text-xs text-slate-500">ไฟล์เอกสาร PDF (ขนาด 1.8 MB) • กฎระเบียบและข้อบังคับ</p>
                    </div>
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0">
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. หลักสูตรที่เปิดรับสมัคร (Programs - ดึงจากหลักสูตรที่เปิดสอนเท่านั้น) */}
            {currentTab === 'programs' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      <span>หลักสูตรที่เปิดรับสมัคร (อ้างอิงจากฐานข้อมูลหลักสูตรที่เปิดสอน)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      รายการหลักสูตรทั้งหมด ({courses.length} หลักสูตร) อัปเดตแบบเรียลไทม์จากระบบจัดการหลักสูตรวิทยาลัย
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('courses')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <span>ดูรายละเอียดหลักสูตรเต็ม</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Degree Level Filter Buttons Bar */}
                <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'bachelor', label: '🎓 ปริญญาตรี' },
                    { id: 'master', label: '📜 ปริญญาโท' },
                    { id: 'doctor', label: '🏆 ปริญญาเอก' },
                    { id: 'certificate', label: '📄 ประกาศนียบัตร' }
                  ].map(f => {
                    const count = f.id === 'all'
                      ? courses.length
                      : courses.filter(c => (c.degreeLevel || c.level || '').toLowerCase() === f.id).length;
                    const isActive = programLevelFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setProgramLevelFilter(f.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/20'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses
                    .filter(c => programLevelFilter === 'all' || (c.degreeLevel || c.level || '').toLowerCase() === programLevelFilter)
                    .map((c) => {
                    const badge = getLevelBadge(c.degreeLevel || c.level);
                    const isClosed = c.status === 'inactive' || (c as any).isActive === false;
                    return (
                      <div
                        key={c.id}
                        className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all ${
                          isClosed ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>

                            {isClosed ? (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-xs animate-pulse">
                                🔴 ปิดรับสมัคร / ปิดปรับปรุง
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                                ✅ เปิดรับสมัคร
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {c.name || c.nameTh}
                          </h3>

                          {(c.nameEn || c.degreeEn) && (
                            <p className="text-xs text-slate-400 font-light italic">
                              {c.nameEn || c.degreeEn}
                            </p>
                          )}

                          {isClosed && (
                            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 border border-rose-200 text-rose-900 dark:text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                              <AlertCircle size={14} className="shrink-0 text-rose-600" />
                              <span>ขณะนี้หลักสูตรนี้อยู่ในช่วงปิดรับสมัคร/ปิดปรับปรุงชั่วคราว</span>
                            </div>
                          )}

                          <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80">
                            <p className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span><strong>วุฒิการศึกษา:</strong> {c.degree || 'พุทธศาสตรบัณฑิต'}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span><strong>ระยะเวลาเรียน:</strong> {c.duration || c.studyMode || '4 ปี (8 ภาคการศึกษา)'}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span><strong>ค่าธรรมเนียมการศึกษา:</strong> {c.estimatedFee || c.tuitionFee || 'ฟรีทุนอุดหนุนสำหรับพระภิกษุสามเณร'}</span>
                            </p>
                            {c.qualifications && c.qualifications.length > 0 && (
                              <p className="text-[11px] text-slate-500 pt-1">
                                <strong>คุณสมบัติที่กำหนด:</strong> {c.qualifications.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>

                        {isClosed ? (
                          <div className="space-y-1 pt-2">
                            <button
                              disabled
                              className="w-full py-2.5 bg-slate-300 dark:bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed text-center flex items-center justify-center gap-2"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>🔒 หลักสูตรนี้ปิดรับสมัครอยู่</span>
                            </button>
                            <p className="text-[11px] text-rose-600 dark:text-rose-400 text-center font-medium">
                              * ผู้เข้าชมยังสามารถศึกษาอ่านรายละเอียดหลักสูตรได้ตามปกติ
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveTab('apply')}
                            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>สมัครหลักสูตรนี้ 🚀</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. คุณสมบัติผู้สมัครเรียน (Qualifications - Dynamic Single Source of Truth) */}
            {currentTab === 'qualifications' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-amber-600" />
                      <span>คุณสมบัติผู้สมัครเข้าศึกษา (Entry Qualifications)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      ข้อมูลคุณสมบัติเฉพาะของแต่ละหลักสูตร ดึงตรงจากฐานข้อมูลหลักสูตรกลางเดี่ยววิทยาลัย ({courses.length} หลักสูตร)
                    </p>
                  </div>

                  {/* Degree Level Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0">
                    {[
                      { id: 'all', label: 'ทั้งหมด' },
                      { id: 'bachelor', label: '🎓 ปริญญาตรี' },
                      { id: 'master', label: '📜 ปริญญาโท' },
                      { id: 'doctor', label: '🏆 ปริญญาเอก' }
                    ].map(f => {
                      const isActive = programLevelFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setProgramLevelFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-amber-50'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Course Qualification Cards List */}
                <div className="space-y-6">
                  {courses
                    .filter(c => programLevelFilter === 'all' || (c.degreeLevel || c.level || '').toLowerCase() === programLevelFilter)
                    .map((c) => {
                      const badge = getLevelBadge(c.degreeLevel || c.level);
                      const isClosed = c.status === 'inactive' || (c as any).isActive === false;
                      const qualificationsList = (c.qualifications && c.qualifications.length > 0)
                        ? c.qualifications
                        : ((c.qualification && c.qualification.length > 0)
                          ? c.qualification
                          : [
                            'สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.6) หรือเทียบเท่า (กศน.)',
                            'หรือ สอบได้นักธรรมชั้นเอก / บาลีประโยค 1-2 ขึ้นไป',
                            'เป็นผู้มีความประพฤติตี ไม่เคยถูกไล่ออกจากสถาบันการศึกษาใดๆ'
                          ]);

                      return (
                        <div
                          key={c.id}
                          className={`p-6 rounded-2xl border transition-all space-y-4 ${
                            isClosed
                              ? 'bg-rose-50/30 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                                  {badge.label}
                                </span>
                                <span className="font-mono text-xs font-semibold text-slate-400">
                                  รหัส: {c.code}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {c.name || c.nameTh}
                              </h3>
                              <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                                {c.degree || 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {isClosed ? (
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-xs">
                                  🔴 ปิดรับสมัคร / ปิดปรับปรุง
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                                  ✅ เปิดรับสมัคร
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Qualifications Render */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>คุณสมบัติเฉพาะของผู้สมัครเข้าศึกษา (Entry Qualifications):</span>
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pl-1">
                              {qualificationsList.map((q, idx) => (
                                <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                  <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Extra info: Duration & Tuition */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                              <Clock size={15} className="text-amber-600 shrink-0" />
                              <span><strong>ระยะเวลาเรียน:</strong> {c.duration || c.studyMode || '4 ปี (8 ภาคการศึกษา)'}</span>
                            </div>

                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                              <Sparkles size={15} className="shrink-0" />
                              <span><strong>ค่าธรรมเนียม:</strong> {c.estimatedFee || c.tuitionFee || 'ฟรีทุนอุดหนุนสำหรับพระภิกษุสามเณร'}</span>
                            </div>
                          </div>

                          {/* Apply Button */}
                          <div className="pt-2">
                            {isClosed ? (
                              <button
                                disabled
                                className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                              >
                                🔒 หลักสูตรนี้ปิดรับสมัครอยู่
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveTab('apply')}
                                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>ยื่นสมัครหลักสูตรนี้ 🚀</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 5. ขั้นตอนการสมัครเรียน (Workflow) */}
            {currentTab === 'workflow' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span>ขั้นตอนการสมัครเรียนออนไลน์ 5 ขั้นตอน</span>
                </h2>

                <div className="space-y-4">
                  {[
                    { step: '1', title: 'เลือกหลักสูตรที่ต้องการสมัคร', desc: 'ศึกษาระเบียบการและหลักสูตรที่เปิดรับสมัครจากคลังหลักสูตร' },
                    { step: '2', title: 'กรอกแบบฟอร์มสมัครออนไลน์', desc: 'กรอกข้อมูลส่วนตัว ประวัติการศึกษา ในแท็บสมัครเรียนออนไลน์' },
                    { step: '3', title: 'แนบเอกสารหลักฐาน', desc: 'แนบไฟล์รูปถ่าย วุฒิการศึกษา บัตรประชาชน/ใบสุทธิ' },
                    { step: '4', title: 'รับรหัสติดตามใบสมัคร (APP-XXXX)', desc: 'บันทึกรหัสติดตามใบสมัครเพื่อใช้ตรวจสอบสถานะ' },
                    { step: '5', title: 'สอบสัมภาษณ์ & รายงานตัว', desc: 'เข้าสอบสัมภาษณ์ตามวันเวลาที่กำหนด และรายงานตัวขึ้นทะเบียน' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {s.step}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{s.title}</h4>
                        <p className="text-xs text-slate-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. เอกสารประกอบการสมัคร (Documents) */}
            {currentTab === 'documents' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-600" />
                  <span>เอกสารประกอบการสมัคร</span>
                </h2>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>รูปถ่ายหน้าตรง ชุดสุภาพ หรือรูปถ่ายในพรรษา (สำหรับพระภิกษุ) ขนาด 1.5 นิ้ว จำนวน 2 รูป</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>สำเนาวุฒิการศึกษา (ใบระเบียนแสดงผลการเรียน / ใบสุทธิ / ใบป.ธ.3) จำนวน 2 ชุด</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>สำเนาบัตรประจำตัวประชาชน / บัตรประจำตัวพระภิกษุสามเณร จำนวน 2 ชุด</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>สำเนาทะเบียนบ้าน จำนวน 2 ชุด</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. สมัครเรียนออนไลน์ (Apply - 5-Step Form Process) */}
            {(currentTab === 'apply' || currentTab === 'landing') && (
              <AdmissionFormWizard
                courses={courses}
                onCompleteSuccess={(code) => {
                  setSubmitSuccessCode(code);
                  setSearchCode(code);
                }}
                onNavigateToStatus={(code) => {
                  setSearchCode(code);
                  setActiveTab('status');
                  setTimeout(() => {
                    handleCheckStatusWithCode(code);
                  }, 300);
                }}
              />
            )}

            {/* 8. ตรวจสอบสถานะผู้สมัคร (Status) */}
            {currentTab === 'status' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Search className="w-5 h-5 text-amber-600" />
                    <span>ตรวจสอบสถานะผู้สมัครเรียน</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">กรอกรหัสติดตามใบสมัคร (APP-XXXX), เลขบัตรประชาชน หรือเบอร์โทรศัพท์</p>
                </div>

                <form onSubmit={handleCheckStatus} className="flex gap-3">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="พิมพ์รหัสติดตาม เช่น APP2569-1234 หรือ เบอร์โทร"
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingStatus}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isSearchingStatus ? 'กำลังค้นหา...' : 'ค้นหา'}</span>
                  </button>
                </form>

                {searchResult ? (
                  <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-700">รหัสใบสมัคร</span>
                        <h3 className="text-lg font-black text-amber-900 dark:text-amber-200">{searchResult.applicationCode || searchResult.id}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        searchResult.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : searchResult.status === 'interview'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : searchResult.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {searchResult.status === 'approved'
                          ? '✅ อนุมัติผ่าน (ผ่านการคัดเลือก)'
                          : searchResult.status === 'interview'
                          ? '🎙️ รอสัมภาษณ์ (โปรดนำเอกสารนี้มายื่นในวันสอบ)'
                          : searchResult.status === 'rejected'
                          ? '❌ ไม่อนุมัติ'
                          : '⏳ รอตรวจสอบ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">ชื่อผู้สมัคร (กดที่ชื่อเพื่อดู/พิมพ์ใบสมัคร):</span>
                        <button
                          type="button"
                          onClick={() => setSelectedPrintApplicant(searchResult)}
                          className="font-bold text-amber-900 dark:text-amber-200 text-sm hover:underline text-left cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{searchResult.fullName}</span>
                          <Printer size={14} className="text-amber-600" />
                        </button>
                      </div>
                      <div>
                        <span className="text-slate-400 block">หลักสูตรที่เลือกสมัคร:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{searchResult.programTitle || 'พุทธศาสตรบัณฑิต'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block">เลขบัตรประชาชน/สุทธิ:</span>
                        <p className="font-mono text-slate-700 dark:text-slate-300">{searchResult.nationalId || '-'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block">ช่องทางติดต่อ:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold">📞 {searchResult.phone} | ✉️ {searchResult.email}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        💡 สามารถพิมพ์เอกสารใบสมัครฉบับอัปเดตสถานะนี้เพื่อนำมายื่นในวันสอบสัมภาษณ์
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPrintApplicant(searchResult)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Printer size={16} />
                        <span>🖨️ พิมพ์/ดาวน์โหลดใบสมัคร (สำหรับวันสอบสัมภาษณ์)</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* PUBLIC APPLICANTS DIRECTORY TABLE */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users size={18} className="text-amber-600" />
                        <span>ตารางตรวจสอบรายชื่อผู้สมัครเรียนออนไลน์ ทั้งหมด</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        แสดงรายชื่อผู้สมัครและสถานะการคัดเลือก (การพิมพ์/ดาวน์โหลดเอกสารต้องยืนยันเบอร์โทรศัพท์หรือเลขบัตร 13 หลัก)
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold shrink-0">
                      รวมทั้งสิ้น {allApplicants.length} รายการ
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3.5 text-center w-14">ลำดับ</th>
                          <th className="p-3.5">รหัสที่สมัคร</th>
                          <th className="p-3.5">ชื่อ/นามสกุล หรือฉายา (บรรพชิต)</th>
                          <th className="p-3.5">สถานะ</th>
                          <th className="p-3.5 text-center">ดาวน์โหลด / พิมพ์ใบสมัคร</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                        {allApplicants.length > 0 ? (
                          allApplicants.map((app, idx) => {
                            const isClergy = app.personType === 'clergy' || app.personType === 'monk';
                            const prefix = app.prefix || (isClergy ? 'พระมหา' : 'นาย');
                            const displayName = app.fullName || (isClergy
                              ? `${prefix} ${app.firstName || ''} ${app.lastName || ''} (${app.ordinationName || app.templeName || ''})`
                              : `${prefix} ${app.firstName || ''} ${app.lastName || ''}`);

                            return (
                              <tr key={app.id || idx} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
                                <td className="p-3.5 text-center font-semibold text-slate-500">{idx + 1}</td>
                                <td className="p-3.5 font-mono font-bold text-mcu-pink">
                                  {formatMCUCode(app.applicationCode || app.id)}
                                </td>
                                <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                                  {displayName}
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                    app.status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : app.status === 'interview'
                                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                                      : app.status === 'rejected'
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }`}>
                                    {app.status === 'approved'
                                      ? '✅ อนุมัติผ่าน'
                                      : app.status === 'interview'
                                      ? '🎙️ รอสัมภาษณ์'
                                      : app.status === 'rejected'
                                      ? '❌ ไม่อนุมัติ'
                                      : '⏳ รอตรวจสอบ'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleStartVerifyPrint(app)}
                                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                                  >
                                    <Printer size={13} className="text-amber-400" />
                                    <span>ดาวน์โหลด / พิมพ์ 🔒</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                              ยังไม่มีข้อมูลรายชื่อผู้สมัครยื่นเข้ามาในระบบ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9. คำถามที่พบบ่อย (FAQs) */}
            {currentTab === 'faqs' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <span>คำถามที่พบบ่อย (FAQs)</span>
                </h2>

                <div className="space-y-3">
                  {faqsList.map((faq, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 transition-all"
                      >
                        <span>{faq.q}</span>
                        {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>
                      {openFaqIndex === idx && (
                        <div className="p-4 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. ติดต่อกองงานรับสมัคร (Contact) */}
            {currentTab === 'contact' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-amber-600" />
                  <span>ติดต่อกองงานรับสมัครนิสิตใหม่</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <MapPin className="w-6 h-6 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">สถานที่ติดต่อ</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      อาคารเรียนวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <Phone className="w-6 h-6 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">เบอร์โทรศัพท์</h4>
                    <p className="text-xs text-slate-500">056-711-234, 081-234-5678 (ฝ่ายรับสมัคร)</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <Mail className="w-6 h-6 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">อีเมลหลัก</h4>
                    <p className="text-xs text-slate-500">admission.pkpm@mcu.ac.th</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <Clock className="w-6 h-6 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">เวลาทำการ</h4>
                    <p className="text-xs text-slate-500">เปิดทำการวันจันทร์ - วันอาทิตย์ (08:30 - 16:30 น.)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IDENTITY VERIFICATION SECURITY MODAL */}
      {verifyingApplicant && (
        <Modal
          isOpen={Boolean(verifyingApplicant)}
          onClose={() => setVerifyingApplicant(null)}
          title={`🔒 ยืนยันตัวตนเพื่อพิมพ์/ดาวน์โหลดใบสมัคร (รหัส: ${verifyingApplicant.applicationCode || verifyingApplicant.id})`}
          maxWidth="md"
        >
          <div className="space-y-4 p-2 text-xs text-slate-800 dark:text-slate-100">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Info size={15} className="text-amber-600" />
                <span>การคุ้มครองข้อมูลส่วนบุคคล (PDPA Identity Protection)</span>
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                เพื่อความปลอดภัยของข้อมูลผู้สมัคร กรุณากรอก <strong>เบอร์โทรศัพท์</strong> หรือ <strong>เลขประจำตัวประชาชน / หนังสือสุทธิ 13 หลัก</strong> ของผู้สมัครรายนี้เพื่อยืนยันสิทธิ์พิมพ์ใบสมัคร
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน 13 หลัก *
              </label>
              <input
                type="text"
                value={verifyInput}
                onChange={(e) => {
                  setVerifyInput(e.target.value);
                  setVerifyError('');
                }}
                placeholder="เช่น 0812345678 หรือ 1234567890123"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              {verifyError && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1 pt-1">
                  <AlertCircle size={14} />
                  <span>{verifyError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyingApplicant(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>ยืนยันสิทธิ์พิมพ์/ดาวน์โหลด</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* OFFICIAL APPLICATION PRINT DOSSIER MODAL */}
      {selectedPrintApplicant && (
        <Modal
          isOpen={Boolean(selectedPrintApplicant)}
          onClose={() => setSelectedPrintApplicant(null)}
          title={`ใบสมัครเข้าศึกษาและเอกสารยื่นสอบสัมภาษณ์ (รหัสผู้สมัคร: ${selectedPrintApplicant.applicationCode || selectedPrintApplicant.id})`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                สถานะปัจจุบัน: <strong>{selectedPrintApplicant.status === 'approved' ? 'อนุมัติผ่าน' : selectedPrintApplicant.status === 'interview' ? 'รอสัมภาษณ์' : 'รอตรวจสอบ'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPrintApplicant(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                {selectedPrintApplicant.status === 'approved' || selectedPrintApplicant.status === 'interview' ? (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Printer size={16} />
                    <span>พิมพ์ใบสมัครยื่นสอบสัมภาษณ์ 🖨️</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-70"
                    title="พิมพ์ได้เมื่อได้รับการอนุมัติจากเจ้าหน้าที่เรียบร้อยแล้วเท่านั้น"
                  >
                    <Printer size={16} />
                    <span>พิมพ์ใบสมัคร (รออนุมัติจากเจ้าหน้าที่) 🔒</span>
                  </button>
                )}
              </div>
            </div>
          }
        >
          <div className="printable-document space-y-4 p-5 border border-slate-200 rounded-2xl text-xs leading-relaxed bg-white text-slate-800" id="printable-application">
            {/* Header Crest, MCU Logo & Candidate Photo */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <img src={logoImg} alt="MCU Logo" className="w-16 h-16 shrink-0 mx-auto sm:mx-0 object-contain" />
                <div className="space-y-0.5">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                  </h2>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-800">
                    ใบสมัครเข้าศึกษาและบัตรประจำตัวผู้สมัคร ประจำปีการศึกษา 2569
                  </h3>
                  <div className="pt-0.5">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      selectedPrintApplicant.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : selectedPrintApplicant.status === 'interview'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : selectedPrintApplicant.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      สถานะคัดเลือก: {selectedPrintApplicant.status === 'approved' ? '✅ อนุมัติผ่าน' : selectedPrintApplicant.status === 'interview' ? '🎙️ รอสัมภาษณ์' : selectedPrintApplicant.status === 'rejected' ? '❌ ไม่อนุมัติ' : '⏳ รอตรวจสอบ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Uploaded Photo Box (1.5 Inch) */}
              {(() => {
                const photoDoc = selectedPrintApplicant.documents?.photoCopy || selectedPrintApplicant.uploadedFiles?.photoCopy;
                const photoUrl = typeof photoDoc === 'object' ? (photoDoc?.url || photoDoc?.name || '') : (photoDoc || '');
                const hasPhoto = Boolean(photoUrl && photoUrl !== '/uploads/admissions/photo.jpg');

                return hasPhoto ? (
                  <img
                    src={photoUrl}
                    alt="รูปถ่ายผู้สมัคร"
                    className="w-24 h-32 object-cover border-2 border-slate-800 rounded-lg shadow-xs bg-slate-100 shrink-0 mx-auto sm:mx-0"
                  />
                ) : (
                  <div className="w-24 h-32 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-center p-1 bg-slate-50 text-[10px] text-slate-500 shrink-0 mx-auto sm:mx-0">
                    <span className="font-bold">รูปถ่ายผู้สมัคร</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">ขนาด 1.5 นิ้ว</span>
                  </div>
                );
              })()}
            </div>

            {/* Application Information Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <p><strong>รหัสผู้สมัคร:</strong> <span className="font-mono text-amber-800 font-bold">{formatMCUCode(selectedPrintApplicant.applicationCode || selectedPrintApplicant.id)}</span></p>
              <p><strong>ประเภทผู้สมัคร:</strong> {selectedPrintApplicant.personType === 'monk' || selectedPrintApplicant.personType === 'clergy' ? 'บรรพชิต (พระภิกษุ-สามเณร)' : 'คฤหัสถ์ (บุคคลทั่วไป)'}</p>
              <p><strong>ชื่อ-นามสกุล:</strong> {selectedPrintApplicant.fullName}</p>
              <p><strong>เลขบัตรประชาชน/สุทธิ:</strong> {selectedPrintApplicant.nationalId || '-'}</p>
              
              {(selectedPrintApplicant.personType === 'monk' || selectedPrintApplicant.personType === 'clergy') && (
                <>
                  <p><strong>ฉายาบาลี:</strong> {selectedPrintApplicant.ordinationName || '-'}</p>
                  <p><strong>สังกัดวัด:</strong> {selectedPrintApplicant.templeName || '-'} ({selectedPrintApplicant.templeDistrict || ''}, {selectedPrintApplicant.templeProvince || ''})</p>
                </>
              )}

              <p><strong>เบอร์โทรศัพท์:</strong> {selectedPrintApplicant.phone}</p>
              <p><strong>อีเมล:</strong> {selectedPrintApplicant.email}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p><strong>หลักสูตรที่เลือกสมัคร:</strong> <span className="text-amber-900 font-bold">{selectedPrintApplicant.programTitle}</span></p>
              <p><strong>วุฒิการศึกษาสูงสุดเดิม:</strong> {selectedPrintApplicant.educationalBackground}</p>
              <p><strong>วันที่ยื่นสมัครออนไลน์:</strong> {selectedPrintApplicant.submittedAt ? new Date(selectedPrintApplicant.submittedAt).toLocaleDateString('th-TH') : '-'}</p>
            </div>

            {/* Interview Verification QR Code Box */}
            <div className="flex items-center justify-between border border-slate-200 p-3 rounded-xl bg-slate-50">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  Interview Verification QR Code
                </span>
                <p className="text-[11px] text-slate-500">
                  กรรมการสอบสัมภาษณ์สามารถสแกน QR Code นี้เพื่อตรวจเช็กเอกสารตัวจริง
                </p>
              </div>
              <QRCodeSVG
                value={`https://pkpm.mcu.ac.th/admission/track?code=${formatMCUCode(selectedPrintApplicant.applicationCode || selectedPrintApplicant.id)}`}
                size={80}
              />
            </div>

            {/* Checklist for Interview Day */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-900 block">📌 เอกสารที่ต้องนำมายื่นในวันสอบสัมภาษณ์:</span>
              <ul className="list-disc pl-5 space-y-0.5 text-amber-800 text-[11px]">
                <li>ใบสมัครฉบับนี้ (พิมพ์จากระบบออนไลน์) จำนวน 1 ฉบับ</li>
                <li>บัตรประจำตัวประชาชน / ใบสุทธิ (ตัวจริงและสำเนา) จำนวน 1 ชุด</li>
                <li>ใบระเบียนแสดงผลการเรียน / วุฒิการศึกษาเดิม (ตัวจริงและสำเนา) จำนวน 1 ชุด</li>
                <li>สำเนาทะเบียนบ้าน จำนวน 1 ชุด</li>
                <li>เอกสารอื่นๆ เช่น ใบเปลี่ยนชื่อ-นามสกุล / เอกสารสุทธิเพิ่มเติม (ถ้ามี) จำนวน 1 ชุด</li>
                <li>รูปถ่ายหน้าตรง ขนาด 1 หรือ 1.5 นิ้ว จำนวน 2 รูป</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center text-[11px]">
              <div>
                <p className="pb-6">ลงชื่อ..........................................................ผู้สมัคร</p>
                <p>({selectedPrintApplicant.fullName})</p>
              </div>
              <div>
                <p className="pb-6">ลงชื่อ..........................................................กรรมการรับสมัคร</p>
                <p>(นายทะเบียน / กองงานรับสมัคร)</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
