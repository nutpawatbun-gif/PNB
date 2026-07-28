/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Save, 
  X, 
  Award, 
  Clock, 
  Coins, 
  FileText, 
  ExternalLink, 
  User, 
  Image as ImageIcon, 
  Layers, 
  Download, 
  Globe, 
  Briefcase, 
  Sparkles, 
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { Course, DegreeLevel, CurriculumStructureCategory, CurriculumInstructor, CurriculumDocument } from '../../types';
import { api } from '../../lib/api';
import { coursesStore } from '../../data/coursesStore';
import { Modal } from '../ui/Modal';

export default function CurriculumManager() {
  const [curricula, setCurricula] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State for Add / Edit Form
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Course | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'general' | 'details' | 'structure' | 'qualifications' | 'instructors' | 'documents' | 'media' | 'seo'>('general');

  // Modal State for Detailed Preview
  const [previewItem, setPreviewItem] = useState<Course | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<{
    code: string;
    nameTh: string;
    nameEn: string;
    degreeLevel: DegreeLevel;
    major: string;
    faculty: string;
    description: string;
    highlights: string[];
    qualifications: string[];
    structure: CurriculumStructureCategory[];
    totalCredits: number | string;
    tuitionFee: string;
    duration: string;
    careerOpportunities: string[];
    instructors: CurriculumInstructor[];
    documents: CurriculumDocument[];
    applyUrl: string;
    applyMethod: 'internal' | 'external_form';
    status: 'active' | 'inactive';
    coverImageUrl: string;
    galleryUrls: string[];
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
  }>({
    code: '',
    nameTh: '',
    nameEn: '',
    degreeLevel: 'bachelor',
    major: 'สาขาวิชาพระพุทธศาสนา',
    faculty: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    description: '',
    highlights: [],
    qualifications: [],
    structure: [],
    totalCredits: 120,
    tuitionFee: 'ฟรีสำหรับพระภิกษุสามเณร',
    duration: '4 ปี (8 ภาคการศึกษา)',
    careerOpportunities: [],
    instructors: [],
    documents: [],
    applyUrl: '/admission/apply',
    applyMethod: 'internal',
    status: 'active',
    coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
    galleryUrls: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  // Dynamic Array Temp Input States
  const [tempHighlight, setTempHighlight] = useState('');
  const [tempQualification, setTempQualification] = useState('');
  const [tempCareer, setTempCareer] = useState('');
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');

  // Temp Structure Category
  const [tempStructCat, setTempStructCat] = useState('');
  const [tempStructCredits, setTempStructCredits] = useState<number>(12);
  const [tempStructDesc, setTempStructDesc] = useState('');

  // Temp Instructor
  const [tempInstName, setTempInstName] = useState('');
  const [tempInstTitle, setTempInstTitle] = useState('ดร.');
  const [tempInstPos, setTempInstPos] = useState('อาจารย์ประจำหลักสูตร');
  const [tempInstEmail, setTempInstEmail] = useState('');
  const [tempInstAvatar, setTempInstAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200');

  // Temp Document
  const [tempDocName, setTempDocName] = useState('');
  const [tempDocUrl, setTempDocUrl] = useState('');
  const [tempDocFormat, setTempDocFormat] = useState('PDF');
  const [tempDocSize, setTempDocSize] = useState('2.5 MB');

  // Fetch Curricula
  const fetchCurricula = async () => {
    setLoading(true);
    try {
      const data = await api.getCurricula();
      if (Array.isArray(data) && data.length > 0) {
        setCurricula(data);
        coursesStore.saveCourses(data);
      } else {
        const localCourses = coursesStore.getCourses();
        setCurricula(localCourses);
      }
    } catch (e) {
      console.error('Failed to load curricula:', e);
      setCurricula(coursesStore.getCourses());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurricula();
  }, []);

  // Open Form Modal for Create or Edit
  const handleOpenFormModal = (item?: Course) => {
    setActiveFormTab('general');
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code || '',
        nameTh: item.nameTh || item.name || '',
        nameEn: item.nameEn || '',
        degreeLevel: item.degreeLevel || item.level || 'bachelor',
        major: item.major || 'สาขาวิชาพระพุทธศาสนา',
        faculty: item.faculty || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        description: item.description || '',
        highlights: item.highlights ? [...item.highlights] : [],
        qualifications: item.qualifications ? [...item.qualifications] : (item.qualification ? [...item.qualification] : []),
        structure: item.structure ? [...item.structure] : [],
        totalCredits: item.totalCredits || 120,
        tuitionFee: item.tuitionFee || item.estimatedFee || '',
        duration: item.duration || item.studyMode || '4 ปี',
        careerOpportunities: item.careerOpportunities ? [...item.careerOpportunities] : (item.careerPath ? [...item.careerPath] : []),
        instructors: item.instructors ? [...item.instructors] : [],
        documents: item.documents ? [...item.documents] : [],
        applyUrl: item.applyUrl || '/admission/apply',
        applyMethod: item.applyMethod || 'internal',
        status: item.status || 'active',
        coverImageUrl: item.coverImageUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
        galleryUrls: item.galleryUrls ? [...item.galleryUrls] : [],
        seoTitle: item.seo?.title || '',
        seoDescription: item.seo?.description || '',
        seoKeywords: item.seo?.keywords || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: `CURR-${Math.floor(Math.random() * 900 + 100)}`,
        nameTh: '',
        nameEn: '',
        degreeLevel: 'bachelor',
        major: 'สาขาวิชาพระพุทธศาสนา',
        faculty: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        description: '',
        highlights: [
          'เรียนฟรีตลอดหลักสูตร สำหรับพระภิกษุและสามเณร',
          'มีคณาจารย์ผู้ทรงคุณวุฒิด้านพระไตรปิฎกดูแลอย่างใกล้ชิด'
        ],
        qualifications: [
          'สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือเทียบเท่า หรือสอบได้นักธรรมชั้นเอก / บาลีสนามหลวง'
        ],
        structure: [
          { categoryName: 'หมวดวิชาศึกษาทั่วไป', creditAmount: 30, description: 'วิชาบังคับพื้นฐานมหาวิทยาลัย' },
          { categoryName: 'หมวดวิชาเฉพาะสาขา', creditAmount: 84, description: 'วิชาแกนพระพุทธศาสนาและพระไตรปิฎก' },
          { categoryName: 'หมวดวิชาเลือกเสรี', creditAmount: 6, description: 'เลือกเรียนตามความสนใจ' }
        ],
        totalCredits: 120,
        tuitionFee: 'ฟรีสำหรับพระภิกษุสามเณร / คฤหัสถ์ 6,500 บาทต่อภาคการศึกษา',
        duration: '4 ปี (8 ภาคการศึกษา)',
        careerOpportunities: [
          'นักวิชาการด้านศาสนาและวัฒนธรรม',
          "ครูผู้สอนวิชาพระพุทธศาสนา",
          "พระธรรมทูตและนักเผยแผ่"
        ],
        instructors: [],
        documents: [
          { name: 'หลักสูตรพุทธศาสตรบัณฑิต_ฉบับปรับปรุง.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', format: 'PDF', size: '2.5 MB' }
        ],
        applyUrl: '/admission/apply',
        applyMethod: 'internal',
        status: 'active',
        coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
        galleryUrls: [],
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
      });
    }
    setIsFormModalOpen(true);
  };

  // Helper for degree title string
  const getDegreeTitle = (level: DegreeLevel) => {
    switch (level) {
      case 'bachelor': return 'พุทธศาสตรบัณฑิต (พธ.บ.)';
      case 'master': return 'พุทธศาสตรมหาบัณฑิต (พธ.ม.)';
      case 'doctor': return 'พุทธศาสตรดุษฎีบัณฑิต (พธ.ด.)';
      case 'certificate': return 'ประกาศนียบัตรวิชาการ';
      default: return 'คุณวุฒิการศึกษา';
    }
  };

  // Submit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameTh.trim()) {
      alert('กรุณากรอกชื่อหลักสูตรภาษาไทย');
      return;
    }

    const payload: Partial<Course> = {
      code: formData.code,
      nameTh: formData.nameTh,
      name: formData.nameTh,
      nameEn: formData.nameEn,
      degreeLevel: formData.degreeLevel,
      level: formData.degreeLevel,
      degree: getDegreeTitle(formData.degreeLevel),
      degreeEn: formData.nameEn || 'Bachelor of Arts',
      major: formData.major,
      faculty: formData.faculty,
      description: formData.description,
      highlights: formData.highlights,
      qualifications: formData.qualifications,
      qualification: formData.qualifications,
      structure: formData.structure,
      totalCredits: Number(formData.totalCredits) || 120,
      tuitionFee: formData.tuitionFee,
      estimatedFee: formData.tuitionFee,
      duration: formData.duration,
      studyMode: formData.duration,
      careerOpportunities: formData.careerOpportunities,
      careerPath: formData.careerOpportunities,
      instructors: formData.instructors,
      documents: formData.documents,
      applyUrl: formData.applyUrl,
      applyMethod: formData.applyMethod,
      status: formData.status,
      coverImageUrl: formData.coverImageUrl,
      galleryUrls: formData.galleryUrls,
      seo: {
        title: formData.seoTitle,
        description: formData.seoDescription,
        keywords: formData.seoKeywords
      }
    };

    try {
      if (editingItem) {
        await api.updateCurriculum(editingItem.id, payload);
      } else {
        await api.createCurriculum(payload);
      }
      setIsFormModalOpen(false);
      await fetchCurricula();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกหลักสูตร: ' + err.message);
    }
  };

  // Quick Toggle Active/Inactive Status
  const handleToggleStatus = async (item: Course) => {
    try {
      const nextStatus = item.status === 'active' ? 'inactive' : 'active';
      await api.toggleCurriculumStatus(item.id, nextStatus);
      fetchCurricula();
    } catch (err: any) {
      alert('ไม่สามารถเปลี่ยนสถานะหลักสูตรได้: ' + err.message);
    }
  };

  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Delete Curriculum
  const handleDelete = (item: Course) => {
    setDeleteConfirmCourse(item);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmCourse) return;
    const targetCourse = deleteConfirmCourse;
    setIsDeleting(true);

    try {
      await api.deleteCurriculum(targetCourse.id);
      fetchCurricula();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการลบหลักสูตร: ' + err.message);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmCourse(null);
    }
  };

  // Helper getters for level label
  const getDegreeLevelLabel = (level: DegreeLevel) => {
    switch (level) {
      case 'bachelor':
        return { text: 'ปริญญาตรี', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'master':
        return { text: 'ปริญญาโท', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'doctor':
        return { text: 'ปริญญาเอก', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'certificate':
        return { text: 'ประกาศนียบัตร', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { text: level, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Filter curricula list
  const filteredCurricula = curricula.filter((item) => {
    // 1. Filter level
    if (selectedLevel !== 'all' && (item.degreeLevel || item.level) !== selectedLevel) {
      return false;
    }
    // 2. Filter status
    if (selectedStatus !== 'all' && item.status !== selectedStatus) {
      return false;
    }
    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNameTh = (item.nameTh || item.name || '').toLowerCase().includes(q);
      const matchNameEn = (item.nameEn || '').toLowerCase().includes(q);
      const matchCode = (item.code || '').toLowerCase().includes(q);
      const matchMajor = (item.major || '').toLowerCase().includes(q);
      const matchFaculty = (item.faculty || '').toLowerCase().includes(q);
      return matchNameTh || matchNameEn || matchCode || matchMajor || matchFaculty;
    }
    return true;
  });

  // Calculate summary counts
  const totalCount = curricula.length;
  const activeCount = curricula.filter(c => c.status === 'active').length;
  const inactiveCount = curricula.filter(c => c.status === 'inactive').length;
  const bachelorCount = curricula.filter(c => (c.degreeLevel || c.level) === 'bachelor').length;
  const masterCount = curricula.filter(c => (c.degreeLevel || c.level) === 'master').length;
  const doctorCount = curricula.filter(c => (c.degreeLevel || c.level) === 'doctor').length;
  const certCount = curricula.filter(c => (c.degreeLevel || c.level) === 'certificate').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-mcu-primary via-mcu-primary-dark to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-300 mb-2 border border-white/10">
            <GraduationCap size={14} />
            <span>ระบบจัดการหลักสูตรการศึกษา (Curriculum Management System)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">การจัดการหลักสูตรวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            บริหารจัดการหลักสูตรระดับปริญญาตรี ปริญญาโท ปริญญาเอก และประกาศนียบัตร พร้อมข้อมูลคุณสมบัติ โครงสร้างหลักสูตร ค่าเล่าเรียน เอกสาร และช่องทางสมัคร
          </p>
        </div>

        <button
          onClick={() => handleOpenFormModal()}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center space-x-2 text-sm shrink-0"
        >
          <Plus size={18} />
          <span>เพิ่มหลักสูตรใหม่</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">หลักสูตรทั้งหมด</div>
            <div className="text-lg font-bold text-slate-800">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">เปิดรับสมัคร</div>
            <div className="text-lg font-bold text-emerald-600">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <XCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">ปิดรับสมัคร</div>
            <div className="text-lg font-bold text-rose-600">{inactiveCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">ปริญญาตรี</div>
            <div className="text-lg font-bold text-blue-700">{bachelorCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
            <Award size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">ปริญญาโท</div>
            <div className="text-lg font-bold text-purple-700">{masterCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">ปริญญาเอก</div>
            <div className="text-lg font-bold text-amber-700">{doctorCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3 col-span-2 md:col-span-1">
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">ประกาศนียบัตร</div>
            <div className="text-lg font-bold text-teal-700">{certCount}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหลักสูตร, รหัส, สาขาวิชา..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mcu-primary focus:bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLevel === 'all' ? 'bg-mcu-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ระดับทั้งหมด
            </button>
            <button
              onClick={() => setSelectedLevel('bachelor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLevel === 'bachelor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ปริญญาตรี
            </button>
            <button
              onClick={() => setSelectedLevel('master')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLevel === 'master' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ปริญญาโท
            </button>
            <button
              onClick={() => setSelectedLevel('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLevel === 'doctor' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ปริญญาเอก
            </button>
            <button
              onClick={() => setSelectedLevel('certificate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLevel === 'certificate' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ประกาศนียบัตร
            </button>
          </div>

          {/* Status Select & Refresh */}
          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-mcu-primary"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">เปิดรับสมัคร (Active)</option>
              <option value="inactive">ปิดรับสมัคร (Inactive)</option>
            </select>

            <button
              onClick={fetchCurricula}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main List Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 space-y-3">
          <RefreshCw size={28} className="animate-spin mx-auto text-mcu-primary" />
          <p className="text-sm font-medium">กำลังโหลดข้อมูลหลักสูตร...</p>
        </div>
      ) : filteredCurricula.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <BookOpen size={40} className="mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">ไม่พบหลักสูตรการศึกษา</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            ไม่พบหลักสูตรที่ตรงกับเงื่อนไขการค้นหา คุณสามารถลองค้นหาคำใหม่ หรือคลิกปุ่มเพิ่มหลักสูตรใหม่
          </p>
          <button
            onClick={() => handleOpenFormModal()}
            className="inline-flex items-center space-x-2 bg-mcu-primary text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-mcu-primary-dark transition-colors"
          >
            <Plus size={16} />
            <span>สร้างหลักสูตรใหม่</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCurricula.map((item) => {
            const levelInfo = getDegreeLevelLabel(item.degreeLevel || item.level || 'bachelor');
            const isActive = item.status === 'active';

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Cover Image */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={item.coverImageUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800'}
                      alt={item.nameTh || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${levelInfo.color}`}>
                        {levelInfo.text}
                      </span>

                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-sm ${
                          isActive 
                            ? 'bg-emerald-500/90 text-white border border-emerald-400' 
                            : 'bg-rose-500/90 text-white border border-rose-400'
                        }`}
                        title="คลิกเพื่อสลับสถานะเปิด/ปิดรับสมัคร"
                      >
                        {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        <span>{isActive ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}</span>
                      </button>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[11px] font-mono text-amber-300 font-semibold tracking-wide">
                        {item.code || 'CODE'} • {item.major || 'สาขาวิชาพระพุทธศาสนา'}
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {item.nameTh || item.name}
                      </h3>
                      {item.nameEn && (
                        <p className="text-xs text-slate-300 line-clamp-1 italic">
                          {item.nameEn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description || 'ไม่มีคำอธิบายหลักสูตร'}
                    </p>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Clock size={14} className="text-mcu-primary shrink-0" />
                        <span className="truncate">{item.duration || item.studyMode || '4 ปี'}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-700">
                        <Layers size={14} className="text-mcu-primary shrink-0" />
                        <span>{item.totalCredits || 120} หน่วยกิต</span>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-700 col-span-2">
                        <Coins size={14} className="text-amber-600 shrink-0" />
                        <span className="truncate">{item.tuitionFee || item.estimatedFee || 'ไม่มีข้อมูลค่าเล่าเรียน'}</span>
                      </div>
                    </div>

                    {/* Highlights pill list */}
                    {item.highlights && item.highlights.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                          <Sparkles size={12} className="text-amber-500" />
                          <span>จุดเด่นหลักสูตร</span>
                        </div>
                        <ul className="space-y-1">
                          {item.highlights.slice(0, 2).map((hl, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start space-x-1.5">
                              <span className="text-mcu-primary font-bold">•</span>
                              <span className="line-clamp-1">{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-mcu-primary hover:text-mcu-primary-dark transition-colors px-2.5 py-1.5 rounded-lg hover:bg-mcu-primary/10"
                  >
                    <Eye size={15} />
                    <span>ดูรายละเอียด</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenFormModal(item)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="แก้ไขข้อมูลหลักสูตร"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบหลักสูตร"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM MODAL: Add & Edit Curriculum (Multi-tab Comprehensive Form)           */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {editingItem ? 'แก้ไขข้อมูลหลักสูตรการศึกษา' : 'เพิ่มหลักสูตรการศึกษาใหม่'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    จัดการข้อมูลหลักสูตร 20 หัวข้อ ครบถ้วนตามมาตรฐานวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 pt-2 flex items-center space-x-1 overflow-x-auto shrink-0 scrollbar-thin">
              <button
                type="button"
                onClick={() => setActiveFormTab('general')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'general'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <Info size={14} />
                <span>1. ข้อมูลทั่วไป</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('details')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'details'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <Sparkles size={14} />
                <span>2. คำอธิบาย & จุดเด่น</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('structure')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'structure'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <Layers size={14} />
                <span>3. โครงสร้าง & ค่าเรียน</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('qualifications')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'qualifications'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <GraduationCap size={14} />
                <span>4. คุณสมบัติ & อาชีพ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('instructors')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'instructors'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <User size={14} />
                <span>5. อาจารย์ประจำ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('documents')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'documents'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <FileText size={14} />
                <span>6. เอกสาร & การสมัคร</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('media')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'media'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <ImageIcon size={14} />
                <span>7. รูปปก & แกลเลอรี</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('seo')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 border-t-2 ${
                  activeFormTab === 'seo'
                    ? 'bg-white text-mcu-primary border-mcu-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <Globe size={14} />
                <span>8. สถานะ & SEO</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: General Info */}
              {activeFormTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        รหัสหลักสูตร <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="เช่น 01-BACHELOR"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ระดับการศึกษา <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.degreeLevel}
                        onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value as DegreeLevel })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                      >
                        <option value="bachelor">ปริญญาตรี (Bachelor)</option>
                        <option value="master">ปริญญาโท (Master)</option>
                        <option value="doctor">ปริญญาเอก (Doctor)</option>
                        <option value="certificate">ประกาศนียบัตร (Certificate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        สาขาวิชา <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        placeholder="เช่น สาขาวิชาพระพุทธศาสนา"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อหลักสูตรภาษาไทย <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameTh}
                      onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                      placeholder="เช่น หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อหลักสูตรภาษาอังกฤษ
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="เช่น Bachelor of Arts Program in Buddhism"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      คณะหรือหน่วยงานรับผิดชอบ
                    </label>
                    <input
                      type="text"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      placeholder="เช่น วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Details & Highlights */}
              {activeFormTab === 'details' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รายละเอียดหลักสูตร
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="อธิบายปรัชญา วัตถุประสงค์ และเป้าหมายหลักของหลักสูตร..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                    />
                  </div>

                  {/* Highlights Dynamic Array */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>จุดเด่นของหลักสูตร (Course Highlights)</span>
                      <span className="text-slate-400 text-[11px]">เพิ่มข้อความแล้วกด +</span>
                    </label>

                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={tempHighlight}
                        onChange={(e) => setTempHighlight(e.target.value)}
                        placeholder="เพิ่มจุดเด่นหลักสูตร เช่น 'เรียนฟรีตลอดหลักสูตรสำหรับพระภิกษุสามเณร'"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempHighlight.trim()) {
                            setFormData({ ...formData, highlights: [...formData.highlights, tempHighlight.trim()] });
                            setTempHighlight('');
                          }
                        }}
                        className="bg-mcu-primary text-white p-2 rounded-lg hover:bg-mcu-primary-dark transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <ul className="space-y-2">
                      {formData.highlights.map((hl, idx) => (
                        <li key={idx} className="flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-slate-800">
                          <span className="flex items-center space-x-2">
                            <Sparkles size={14} className="text-amber-600 shrink-0" />
                            <span>{hl}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.highlights.filter((_, i) => i !== idx);
                              setFormData({ ...formData, highlights: updated });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                      {formData.highlights.length === 0 && (
                        <p className="text-xs text-slate-400 italic">ยังไม่มีข้อมูลจุดเด่นของหลักสูตร</p>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: Structure & Tuition */}
              {activeFormTab === 'structure' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        จำนวนหน่วยกิตรวม
                      </label>
                      <input
                        type="text"
                        value={formData.totalCredits}
                        onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
                        placeholder="เช่น 120"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ระยะเวลาศึกษา
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="เช่น 4 ปี (8 ภาคการศึกษา)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ค่าเล่าเรียน / ค่าธรรมเนียม
                      </label>
                      <input
                        type="text"
                        value={formData.tuitionFee}
                        onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                        placeholder="เช่น ฟรีสำหรับพระภิกษุสามเณร / 6,500 บาท"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-mcu-primary"
                      />
                    </div>
                  </div>

                  {/* Structure breakdown builder */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      โครงสร้างหลักสูตร (Curriculum Structure)
                    </label>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={tempStructCat}
                          onChange={(e) => setTempStructCat(e.target.value)}
                          placeholder="หมวดวิชา เช่น หมวดวิชาเฉพาะ"
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                        <input
                          type="number"
                          value={tempStructCredits}
                          onChange={(e) => setTempStructCredits(Number(e.target.value))}
                          placeholder="จำนวนหน่วยกิต"
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={tempStructDesc}
                          onChange={(e) => setTempStructDesc(e.target.value)}
                          placeholder="คำอธิบายเพิ่มเติม (ตัวเลือก)"
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (tempStructCat.trim()) {
                            setFormData({
                              ...formData,
                              structure: [
                                ...formData.structure,
                                { categoryName: tempStructCat.trim(), creditAmount: tempStructCredits || 0, description: tempStructDesc }
                              ]
                            });
                            setTempStructCat('');
                            setTempStructCredits(12);
                            setTempStructDesc('');
                          }
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>เพิ่มหมวดวิชาในโครงสร้าง</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.structure.map((st, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{st.categoryName}</span>
                            <span className="ml-2 font-mono text-mcu-primary font-bold">({st.creditAmount} หน่วยกิต)</span>
                            {st.description && <p className="text-slate-500 text-[11px] mt-0.5">{st.description}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.structure.filter((_, i) => i !== idx);
                              setFormData({ ...formData, structure: updated });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Qualifications & Careers */}
              {activeFormTab === 'qualifications' && (
                <div className="space-y-6">
                  {/* Qualifications List */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      คุณสมบัติผู้สมัคร (Entry Qualifications)
                    </label>

                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={tempQualification}
                        onChange={(e) => setTempQualification(e.target.value)}
                        placeholder="เพิ่มคุณสมบัติผู้สมัคร เช่น 'สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือเทียบเท่า'"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempQualification.trim()) {
                            setFormData({ ...formData, qualifications: [...formData.qualifications, tempQualification.trim()] });
                            setTempQualification('');
                          }
                        }}
                        className="bg-mcu-primary text-white p-2 rounded-lg hover:bg-mcu-primary-dark"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <ul className="space-y-2">
                      {formData.qualifications.map((q, idx) => (
                        <li key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <span className="flex items-center space-x-2">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>{q}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.qualifications.filter((_, i) => i !== idx);
                              setFormData({ ...formData, qualifications: updated });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Career Opportunities List */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      อาชีพหลังสำเร็จการศึกษา (Career Opportunities)
                    </label>

                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={tempCareer}
                        onChange={(e) => setTempCareer(e.target.value)}
                        placeholder="เพิ่มอาชีพที่รองรับ เช่น 'นักวิชาการด้านศาสนาและวัฒนธรรม'"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempCareer.trim()) {
                            setFormData({ ...formData, careerOpportunities: [...formData.careerOpportunities, tempCareer.trim()] });
                            setTempCareer('');
                          }
                        }}
                        className="bg-mcu-primary text-white p-2 rounded-lg hover:bg-mcu-primary-dark"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <ul className="space-y-2">
                      {formData.careerOpportunities.map((c, idx) => (
                        <li key={idx} className="flex items-center justify-between p-2.5 bg-blue-50/50 border border-blue-200/50 rounded-lg text-xs">
                          <span className="flex items-center space-x-2">
                            <Briefcase size={14} className="text-blue-600 shrink-0" />
                            <span>{c}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.careerOpportunities.filter((_, i) => i !== idx);
                              setFormData({ ...formData, careerOpportunities: updated });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 5: Instructors */}
              {activeFormTab === 'instructors' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700">
                    อาจารย์ประจำหลักสูตร (Faculty Lecturers / Instructors)
                  </label>

                  {/* Instructor Inputs Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={tempInstName}
                        onChange={(e) => setTempInstName(e.target.value)}
                        placeholder="ชื่อ-นามสกุลอาจารย์ *"
                        className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={tempInstTitle}
                        onChange={(e) => setTempInstTitle(e.target.value)}
                        placeholder="คำนำหน้า/ตำแหน่งวิชาการ เช่น ดร., ผศ.ดร."
                        className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={tempInstPos}
                        onChange={(e) => setTempInstPos(e.target.value)}
                        placeholder="บทบาทในหลักสูตร เช่น ประธานหลักสูตร"
                        className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="email"
                        value={tempInstEmail}
                        onChange={(e) => setTempInstEmail(e.target.value)}
                        placeholder="อีเมลติดต่อ (ตัวเลือก)"
                        className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      value={tempInstAvatar}
                      onChange={(e) => setTempInstAvatar(e.target.value)}
                      placeholder="URL รูปถ่ายโปรไฟล์อาจารย์"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (tempInstName.trim()) {
                          setFormData({
                            ...formData,
                            instructors: [
                              ...formData.instructors,
                              {
                                name: tempInstName.trim(),
                                title: tempInstTitle,
                                academicPosition: tempInstPos,
                                email: tempInstEmail,
                                avatarUrl: tempInstAvatar
                              }
                            ]
                          });
                          setTempInstName('');
                          setTempInstEmail('');
                        }
                      }}
                      className="w-full py-2 bg-mcu-primary hover:bg-mcu-primary-dark text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                    >
                      <Plus size={16} />
                      <span>เพิ่มอาจารย์ประจำหลักสูตร</span>
                    </button>
                  </div>

                  {/* Instructors list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.instructors.map((inst, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl relative">
                        <img
                          src={inst.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                          alt={inst.name}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-800 truncate">
                            {inst.title} {inst.name}
                          </div>
                          <div className="text-[11px] text-mcu-primary font-medium truncate">
                            {inst.academicPosition}
                          </div>
                          {inst.email && <div className="text-[10px] text-slate-400 truncate">{inst.email}</div>}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.instructors.filter((_, i) => i !== idx);
                            setFormData({ ...formData, instructors: updated });
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: Documents & Apply */}
              {activeFormTab === 'documents' && (
                <div className="space-y-6">
                  {/* Apply Channel Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        วิธีรับสมัคร (Apply Method)
                      </label>
                      <select
                        value={formData.applyMethod}
                        onChange={(e) => setFormData({ ...formData, applyMethod: e.target.value as 'internal' | 'external_form' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="internal">ระบบสมัครภายในเว็บไซต์ มจร เพชรบูรณ์</option>
                        <option value="external_form">ลิงก์แบบฟอร์มภายนอก (เช่น Google Forms)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        URL ช่องทางสมัคร / ลิงก์
                      </label>
                      <input
                        type="text"
                        value={formData.applyUrl}
                        onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                        placeholder="/admission/apply หรือ https://docs.google.com/..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Course Documents PDF list builder */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      เอกสารดาวน์โหลดประจำหลักสูตร (PDF/Docs)
                    </label>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={tempDocName}
                          onChange={(e) => setTempDocName(e.target.value)}
                          placeholder="ชื่อเอกสาร เช่น แผ่นพับหลักสูตร.pdf *"
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={tempDocUrl}
                          onChange={(e) => setTempDocUrl(e.target.value)}
                          placeholder="URL เอกสาร *"
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (tempDocName.trim()) {
                            setFormData({
                              ...formData,
                              documents: [
                                ...formData.documents,
                                {
                                  name: tempDocName.trim(),
                                  url: tempDocUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                                  format: tempDocFormat,
                                  size: tempDocSize
                                }
                              ]
                            });
                            setTempDocName('');
                            setTempDocUrl('');
                          }
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>เพิ่มเอกสารดาวน์โหลด</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                          <div className="flex items-center space-x-2">
                            <FileText size={16} className="text-rose-600 shrink-0" />
                            <span className="font-bold text-slate-800">{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.documents.filter((_, i) => i !== idx);
                              setFormData({ ...formData, documents: updated });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Cover & Gallery */}
              {activeFormTab === 'media' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL รูปภาพปกหลักสูตร (Cover Image)
                    </label>
                    <input
                      type="text"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2"
                    />

                    {formData.coverImageUrl && (
                      <div className="relative h-48 rounded-xl overflow-hidden border">
                        <img src={formData.coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Gallery URLs Builder */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      แกลเลอรีรูปภาพภาพบรรยากาศการเรียน
                    </label>

                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={tempGalleryUrl}
                        onChange={(e) => setTempGalleryUrl(e.target.value)}
                        placeholder="ใส่ URL รูปภาพแกลเลอรี"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempGalleryUrl.trim()) {
                            setFormData({ ...formData, galleryUrls: [...formData.galleryUrls, tempGalleryUrl.trim()] });
                            setTempGalleryUrl('');
                          }
                        }}
                        className="bg-mcu-primary text-white p-2 rounded-lg hover:bg-mcu-primary-dark"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.galleryUrls.map((gUrl, idx) => (
                        <div key={idx} className="relative h-24 rounded-lg overflow-hidden border group">
                          <img src={gUrl} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.galleryUrls.filter((_, i) => i !== idx);
                              setFormData({ ...formData, galleryUrls: updated });
                            }}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: Status & SEO */}
              {activeFormTab === 'seo' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">สถานะหลักสูตร</div>
                      <div className="text-xs text-slate-500">เปิด หรือ ปิดรับสมัครสำหรับบุคคลทั่วไป</div>
                    </div>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      <option value="active">เปิดรับสมัคร (Active)</option>
                      <option value="inactive">ปิดรับสมัคร (Inactive)</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                      <Globe size={14} className="text-mcu-primary" />
                      <span>การตั้งค่า Search Engine Optimization (SEO)</span>
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="เช่น หลักสูตรพุทธศาสตรบัณฑิต | วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มจร"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Meta Description</label>
                      <textarea
                        rows={2}
                        value={formData.seoDescription}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                        placeholder="คำอธิบายสำหรับ Google Search Results..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Keywords (คั่นด้วยจุลภาค)</label>
                      <input
                        type="text"
                        value={formData.seoKeywords}
                        onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                        placeholder="เช่น ปริญญาตรี, พระพุทธศาสนา, เรียนฟรี, วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-7 py-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-mcu-pink hover:from-amber-700 hover:via-rose-700 hover:to-mcu-pink-deep text-white rounded-xl text-xs font-bold shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center space-x-2 border border-white/20"
                >
                  <Save size={16} />
                  <span>บันทึกข้อมูลหลักสูตร</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW MODAL: Full Curriculum View                                        */}
      {/* ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Header Image Cover */}
            <div className="relative h-60 w-full bg-slate-900 shrink-0">
              <img
                src={previewItem.coverImageUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800'}
                alt={previewItem.nameTh || previewItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                    {getDegreeLevelLabel(previewItem.degreeLevel || previewItem.level || 'bachelor').text}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">รหัสหลักสูตร: {previewItem.code}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    previewItem.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-white'
                  }`}>
                    {previewItem.status === 'active' ? '● เปิดรับสมัคร' : '● ปิดรับสมัคร'}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">{previewItem.nameTh || previewItem.name}</h2>
                {previewItem.nameEn && <p className="text-xs text-slate-300 italic mt-0.5">{previewItem.nameEn}</p>}
              </div>
            </div>

            {/* Content Details Body (100% COMPLETE DATA) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 text-sm">
              
              {/* Comprehensive Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">วุฒิการศึกษา</div>
                  <div className="font-extrabold text-mcu-pink mt-0.5">{previewItem.degree || 'คุณวุฒิปริญญา'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">ระยะเวลาศึกษา</div>
                  <div className="font-bold text-slate-800 mt-0.5">{previewItem.duration || previewItem.studyMode || '4 ปี'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">หน่วยกิตรวม</div>
                  <div className="font-extrabold text-amber-700 mt-0.5">{previewItem.totalCredits || 120} หน่วยกิต</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">ค่าธรรมเนียมการศึกษา</div>
                  <div className="font-bold text-emerald-700 mt-0.5 truncate">{previewItem.tuitionFee || previewItem.estimatedFee || 'ฟรีค่าธรรมเนียม'}</div>
                </div>
              </div>

              {/* Major & Faculty */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">สาขาวิชา</span>
                    <strong className="text-slate-800 font-bold">{previewItem.major || 'สาขาวิชาพระพุทธศาสนา'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">สังกัดคณะ/วิทยาลัย</span>
                    <strong className="text-slate-800 font-bold">{previewItem.faculty || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์'}</strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              {previewItem.description && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info size={14} className="text-mcu-pink" />
                    <span>รายละเอียดและวัตถุประสงค์หลักสูตร</span>
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-light">{previewItem.description}</p>
                </div>
              )}

              {/* Highlights */}
              {previewItem.highlights && previewItem.highlights.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>จุดเด่นของหลักสูตร</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {previewItem.highlights.map((hl, i) => (
                      <div key={i} className="text-xs flex items-start space-x-2 text-slate-700 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 font-medium">
                        <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structure */}
              {previewItem.structure && previewItem.structure.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-blue-600" />
                    <span>โครงสร้างหมวดวิชาหลักสูตร</span>
                  </h4>
                  <div className="space-y-2">
                    {previewItem.structure.map((st, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{st.categoryName}</div>
                          {st.description && <div className="text-[11px] text-slate-500">{st.description}</div>}
                        </div>
                        <div className="font-extrabold text-amber-700">{st.creditAmount || (st as any).requiredCredits || 0} หน่วยกิต</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {((previewItem.qualifications && previewItem.qualifications.length > 0) ||
                (previewItem.qualification && previewItem.qualification.length > 0)) && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>เกณฑ์และคุณสมบัติผู้สมัครเรียน</span>
                  </h4>
                  <div className="space-y-2">
                    {(previewItem.qualifications || previewItem.qualification || []).map((q, i) => (
                      <div key={i} className="text-xs flex items-start space-x-2 text-emerald-950 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Opportunities */}
              {((previewItem.careerOpportunities && previewItem.careerOpportunities.length > 0) ||
                (previewItem.careerPath && previewItem.careerPath.length > 0)) && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-indigo-600" />
                    <span>แนวทางประกอบอาชีพหลังสำเร็จการศึกษา</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(previewItem.careerOpportunities || previewItem.careerPath || []).map((c, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-900 border border-indigo-200/60 font-semibold px-3 py-1 rounded-full text-xs">
                        💼 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructors */}
              {previewItem.instructors && previewItem.instructors.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-purple-600" />
                    <span>คณาจารย์ผู้รับผิดชอบหลักสูตร</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {previewItem.instructors.map((inst, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 border rounded-xl bg-slate-50">
                        <img src={inst.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} alt={inst.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div>
                          <div className="font-bold text-xs">{inst.title} {inst.name}</div>
                          <div className="text-[11px] text-slate-500">{inst.academicPosition}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {previewItem.documents && previewItem.documents.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-rose-600" />
                    <span>เอกสารประกอบหลักสูตร</span>
                  </h4>
                  <div className="space-y-2">
                    {previewItem.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 text-xs font-semibold text-mcu-primary"
                      >
                        <span className="flex items-center space-x-2">
                          <FileText size={16} />
                          <span>{doc.name}</span>
                        </span>
                        <Download size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700"
              >
                ปิดหน้าต่าง
              </button>

              <button
                onClick={() => {
                  const itemToEdit = previewItem;
                  setPreviewItem(null);
                  handleOpenFormModal(itemToEdit);
                }}
                className="px-5 py-2 bg-mcu-primary text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                <Edit3 size={15} />
                <span>แก้ไขหลักสูตรนี้</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCourse && (
        <Modal
          isOpen={!!deleteConfirmCourse}
          onClose={() => setDeleteConfirmCourse(null)}
          title="ยืนยันการลบหลักสูตรการศึกษา"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmCourse(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบหลักสูตร'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตรการศึกษานี้? ข้อมูลโครงสร้างหลักสูตรและรายวิชาจะถูกถอดออกจากระบบทันที
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmCourse.nameTh || deleteConfirmCourse.name}"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
