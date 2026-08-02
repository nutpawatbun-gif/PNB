import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/images/regenerated_image_1784349405698.png';
import { api } from '../../lib/api';
import { admissionStore, Applicant as StoreApplicant } from '../../data/admissionStore';
import { coursesStore } from '../../data/coursesStore';
import { AdmissionProject, DegreeLevel } from '../../types';
import { DataTable, Column } from '../ui/DataTable';
import { Modal } from '../ui/Modal';
import { QRCodeSVG } from '../ui/QRCodeSVG';
import { formatMCUCode } from '../../utils/formatters';
import { InputField, SelectField, TextareaField } from '../ui/FormControls';
import {
  GraduationCap,
  Users,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  FileText,
  Search,
  Building,
  Award,
  Download,
  FileDown,
  ExternalLink,
  Printer
} from 'lucide-react';

interface AdmissionManagerProps {
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ รอตรวจสอบ', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'interview', label: '🎙️ รอสัมภาษณ์', bg: 'bg-sky-100 text-sky-800 border-sky-200' },
  { value: 'approved', label: '✅ อนุมัติผ่าน', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'rejected', label: '❌ ไม่อนุมัติ', bg: 'bg-rose-100 text-rose-800 border-rose-200' }
];

export default function AdmissionManager({ onNotify }: AdmissionManagerProps) {
  const [subTab, setSubTab] = useState<'projects' | 'applicants'>('applicants');

  // Projects State
  const [projects, setProjects] = useState<AdmissionProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Applicants State
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [searchApplicant, setSearchApplicant] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [printApplicant, setPrintApplicant] = useState<any | null>(null);

  // Document Inline Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  // Delete Confirmation States
  const [deleteConfirmApplicant, setDeleteConfirmApplicant] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await api.getAdmissions();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e: any) {
      onNotify?.('ไม่สามารถโหลดข้อมูลโครงการรับสมัครได้', 'error');
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchApplicants = async () => {
    setLoadingApplicants(true);
    try {
      // 1. Fetch from Backend API (Centralized db.json)
      const apiData = await api.getApplicants().catch(() => []);
      const allCourses = coursesStore.getCourses();

      const mergedList = (Array.isArray(apiData) ? apiData : []).map((item: any) => {
        const matchedCourse = allCourses.find(c => c.id === item.programId);
        const isClergy = item.personType === 'clergy' || item.personType === 'monk';
        const prefix = item.prefix || (isClergy ? 'พระมหา' : 'นาย');
        const fullName = item.fullName || (isClergy 
          ? `${prefix} ${item.firstName} ${item.lastName} (${item.templeName || ''})`
          : `${prefix} ${item.firstName} ${item.lastName}`);

        return {
          id: item.id || item.applicationCode,
          applicationCode: item.applicationCode || item.id,
          personType: isClergy ? 'monk' : 'layperson',
          prefix,
          firstName: item.firstName,
          lastName: item.lastName,
          ordinationName: item.ordinationName || '',
          templeName: item.templeName || '',
          templeDistrict: item.templeDistrict || '',
          templeProvince: item.templeProvince || '',
          fullName,
          nationalId: item.nationalId || '',
          birthDate: item.birthDate || '',
          phone: item.phone || '',
          email: item.email || '',
          educationalBackground: item.educationalBackground || 'ม.6 (หรือธรรมเอก)',
          programId: item.programId,
          programTitle: item.programTitle || (matchedCourse ? matchedCourse.name : 'หลักสูตรพุทธศาสตรบัณฑิต'),
          documents: {
            nationalIdCopy: item.documents?.nationalIdCopy || item.uploadedFiles?.nationalIdCopy || '/uploads/admissions/id_card.pdf',
            transcriptCopy: item.documents?.transcriptCopy || item.uploadedFiles?.transcriptCopy || '/uploads/admissions/transcript.pdf',
            photoCopy: item.documents?.photoCopy || item.uploadedFiles?.photoCopy || '/uploads/admissions/photo.jpg'
          },
          status: item.status || 'pending',
          submittedAt: item.submittedAt || item.createdAt || new Date().toISOString()
        };
      });

      setApplicants(mergedList);
    } catch (e: any) {
      onNotify?.('ไม่สามารถโหลดข้อมูลผู้สมัครได้', 'error');
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchApplicants();
  }, []);

  // Export Applicants to CSV File
  const handleExportCSV = () => {
    try {
      const exportUrl = api.exportApplicantsCSVUrl();
      window.open(exportUrl, '_blank');
      onNotify?.('ดาวน์โหลดรายงานผู้สมัครเป็นไฟล์ CSV เรียบร้อยแล้ว', 'success');
    } catch (e: any) {
      onNotify?.('ไม่สามารถดาวน์โหลดไฟล์ CSV ได้', 'error');
    }
  };

  // Update Applicant Status (4 Stages: pending, interview, approved, rejected)
  const handleUpdateApplicantStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateApplicantStatus(id, newStatus);
      const statusObj = STATUS_OPTIONS.find(s => s.value === newStatus);
      onNotify?.(`ปรับปรุงสถานะผู้สมัครเป็น "${statusObj?.label || newStatus}" เรียบร้อยแล้ว`, 'success');
      await fetchApplicants();

      if (selectedApplicant && (selectedApplicant.id === id || selectedApplicant.applicationCode === id)) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
      }
    } catch (e: any) {
      onNotify?.('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + (e.message || ''), 'error');
    }
  };

  // Delete Applicant Record
  const handleDeleteApplicant = (id: string, name: string) => {
    setDeleteConfirmApplicant({ id, name });
  };

  const confirmDeleteApplicant = async () => {
    if (!deleteConfirmApplicant) return;
    const { id, name } = deleteConfirmApplicant;
    setIsDeleting(true);

    try {
      await api.deleteApplicant(id);
      onNotify?.(`ลบข้อมูลผู้สมัคร "${name}" เรียบร้อยแล้ว`, 'success');
      await fetchApplicants();
    } catch (err: any) {
      console.error('Error deleting applicant:', err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmApplicant(null);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = !searchApplicant || 
      (app.fullName && app.fullName.toLowerCase().includes(searchApplicant.toLowerCase())) ||
      (app.applicationCode && String(app.applicationCode).toLowerCase().includes(searchApplicant.toLowerCase())) ||
      (app.nationalId && String(app.nationalId).toLowerCase().includes(searchApplicant.toLowerCase())) ||
      (app.programTitle && app.programTitle.toLowerCase().includes(searchApplicant.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Applicants Table Columns
  const applicantColumns: Column<any>[] = [
    {
      key: 'applicationCode',
      header: 'รหัสผู้สมัคร',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-mcu-pink">
          {item.applicationCode || item.id}
        </span>
      )
    },
    {
      key: 'fullName',
      header: 'ชื่อ-นามสกุล / สังกัด',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-100 block">
            {item.fullName}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {item.personType === 'monk' || item.personType === 'clergy' ? 'บรรพชิต (พระภิกษุ-สามเณร)' : 'คฤหัสถ์ (บุคคลทั่วไป)'} • Tel: {item.phone || '-'}
          </span>
        </div>
      )
    },
    {
      key: 'programTitle',
      header: 'หลักสูตรที่เลือกเข้าศึกษา',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
          {item.programTitle || 'หลักสูตรพุทธศาสตรบัณฑิต'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'สถานะการคัดเลือก',
      sortable: true,
      render: (item) => {
        const s = STATUS_OPTIONS.find(opt => opt.value === item.status) || STATUS_OPTIONS[0];
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg}`}>
            {s.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'การจัดการ',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedApplicant(item)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-mcu-pink-soft text-slate-700 hover:text-mcu-pink-deep rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Eye size={14} />
            <span>ตรวจข้อมูล</span>
          </button>
          <button
            onClick={() => handleDeleteApplicant(item.id || item.applicationCode, item.fullName)}
            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
            title="ลบผู้สมัคร"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-mcu-pink-deep via-mcu-pink to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Users size={14} />
            <span>Admission & Applicant Manager</span>
          </div>
          <h2 className="text-2xl font-bold">ระบบจัดการการรับสมัคร & ผู้สมัคร (Admission CMS)</h2>
          <p className="text-sm opacity-90 font-light mt-1">
            ตรวจสอบข้อมูลผู้สมัคร คัดกรองเอกสาร และปรับสถานะการคัดเลือก 4 ขั้นตอน (รอตรวจสอบ / รอสัมภาษณ์ / อนุมัติผ่าน / ไม่อนุมัติ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            title="ส่งออกรายงานผู้สมัครเป็นไฟล์ CSV/Excel"
          >
            <FileDown size={16} />
            <span>ส่งออกข้อมูล CSV/Excel 📊</span>
          </button>

          <button
            onClick={() => setSubTab('applicants')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'applicants' ? 'bg-mcu-gold text-mcu-pink-deep shadow-md font-extrabold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Users size={16} />
            <span>รายการผู้สมัคร ({applicants.length})</span>
          </button>
          <button
            onClick={() => setSubTab('projects')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'projects' ? 'bg-mcu-gold text-mcu-pink-deep shadow-md font-extrabold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <GraduationCap size={16} />
            <span>โครงการเปิดรับสมัคร ({projects.length})</span>
          </button>
        </div>
      </div>

      {/* APPLICANTS TAB */}
      {subTab === 'applicants' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส 69001, บัตรประชาชน..."
                value={searchApplicant}
                onChange={(e) => setSearchApplicant(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-mcu-pink outline-hidden"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด ({applicants.length})
              </button>
              {STATUS_OPTIONS.map(s => {
                const count = applicants.filter(a => a.status === s.value).length;
                return (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      statusFilter === s.value ? s.bg + ' shadow-xs font-extrabold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <DataTable
            data={filteredApplicants}
            columns={applicantColumns}
            keyExtractor={(item) => item.id || item.applicationCode}
            isLoading={loadingApplicants}
          />
        </div>
      )}

      {/* APPLICANT DETAIL & STATUS ADJUSTMENT MODAL */}
      {selectedApplicant && (
        <Modal
          isOpen={Boolean(selectedApplicant)}
          onClose={() => setSelectedApplicant(null)}
          title={`รายละเอียดข้อมูลผู้สมัคร: รหัส ${selectedApplicant.applicationCode || selectedApplicant.id}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                ยื่นใบสมัครเมื่อ: {selectedApplicant.submittedAt ? new Date(selectedApplicant.submittedAt).toLocaleDateString('th-TH') : '-'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintApplicant(selectedApplicant)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Printer size={15} />
                  <span>พิมพ์เอกสารใบสมัคร / ใบนัดสอบ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Status Changer Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-200 block">
                ปรับเปลี่ยนสถานะการคัดเลือกผู้สมัคร:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_OPTIONS.map(s => {
                  const isCurrent = selectedApplicant.status === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleUpdateApplicantStatus(selectedApplicant.id || selectedApplicant.applicationCode, s.value)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        isCurrent ? s.bg + ' ring-2 ring-mcu-pink shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Applicant Personal Profile */}
            <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-white">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Users size={16} className="text-mcu-pink" />
                <span>ขั้นตอนที่ 1: ข้อมูลประวัติส่วนตัว ({selectedApplicant.personType === 'monk' || selectedApplicant.personType === 'clergy' ? 'บรรพชิต' : 'คฤหัสถ์'})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">ชื่อ-นามสกุล ผู้สมัคร:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedApplicant.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">เลขบัตรประชาชน / หนังสือสุทธิ (13 หลัก):</span>
                  <span className="font-mono font-bold text-slate-700">{selectedApplicant.nationalId || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">วัน/เดือน/ปีเกิด (พ.ศ.):</span>
                  <span className="text-slate-700">{selectedApplicant.birthDate || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ช่องทางติดต่อ:</span>
                  <span className="text-slate-700 font-semibold">📞 {selectedApplicant.phone} | ✉️ {selectedApplicant.email}</span>
                </div>
              </div>

              {(selectedApplicant.personType === 'monk' || selectedApplicant.personType === 'clergy') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 mt-2">
                  <span className="font-bold text-amber-900 block text-xs">ข้อมูลเพิ่มเติมเฉพาะบรรพชิต (พระภิกษุ - สามเณร):</span>
                  <div className="grid grid-cols-2 gap-2 text-amber-800">
                    <p>ฉายาบาลี: <strong>{selectedApplicant.ordinationName || '-'}</strong></p>
                    <p>สังกัดวัดหลัก: <strong>{selectedApplicant.templeName || '-'}</strong></p>
                    <p>อำเภอที่ตั้งวัด: <strong>{selectedApplicant.templeDistrict || '-'}</strong></p>
                    <p>จังหวัดที่ตั้งวัด: <strong>{selectedApplicant.templeProvince || '-'}</strong></p>
                  </div>
                </div>
              )}
            </div>

            {/* Education & Chosen Program */}
            <div className="p-4 border border-slate-200 rounded-2xl space-y-2 bg-white">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <GraduationCap size={16} className="text-mcu-pink" />
                <span>ขั้นตอนที่ 2: วุฒิการศึกษาเดิมและสาขาวิชาที่เลือกสมัคร</span>
              </h4>
              <p>วุฒิการศึกษาสูงสุดเดิม: <strong className="text-slate-800">{selectedApplicant.educationalBackground || 'ม.6 (หรือธรรมเอก)'}</strong></p>
              <p>หลักสูตรที่เลือกเข้าศึกษา: <strong className="text-mcu-pink text-sm">{selectedApplicant.programTitle}</strong></p>
            </div>

            {/* Uploaded Documents & Inspection Controls */}
            <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-white">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <FileText size={16} className="text-mcu-pink" />
                <span>ขั้นตอนที่ 3: หลักฐานเอกสารประกอบการสมัคร (Document Inspection)</span>
              </h4>

              <div className="space-y-2 pt-1">
                {[
                  { key: 'nationalIdCopy', label: '1. สำเนาบัตรประชาชน / หนังสือสุทธิ', icon: '📄', raw: selectedApplicant.documents?.nationalIdCopy },
                  { key: 'transcriptCopy', label: '2. สำเนาวุฒิการศึกษาล่าสุด', icon: '🎓', raw: selectedApplicant.documents?.transcriptCopy },
                  { key: 'photoCopy', label: '3. รูปถ่ายหน้าตรง 1 นิ้ว', icon: '🖼️', raw: selectedApplicant.documents?.photoCopy },
                  { key: 'houseRegistrationCopy', label: '4. สำเนาทะเบียนบ้าน', icon: '🏠', raw: selectedApplicant.documents?.houseRegistrationCopy },
                  { key: 'otherDocumentsCopy', label: '5. เอกสารอื่นๆ (เช่น ใบเปลี่ยนชื่อ-นามสกุล / สุทธิเพิ่มเติม)', icon: '📎', raw: selectedApplicant.documents?.otherDocumentsCopy }
                ].map((doc, idx) => {
                  const rawDoc = doc.raw;
                  const docUrl = typeof rawDoc === 'object' ? (rawDoc?.url || '') : (typeof rawDoc === 'string' ? rawDoc : '');
                  const docName = typeof rawDoc === 'object' ? (rawDoc?.name || rawDoc?.url || '') : (typeof rawDoc === 'string' ? rawDoc : '');
                  const hasFile = Boolean(docUrl || docName);

                  return (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="space-y-0.5 truncate">
                        <span className="text-xs font-bold text-slate-800 block">{doc.label}</span>
                        <span className="font-mono text-[11px] text-slate-500 truncate block">
                          {doc.icon} {docName || 'ยังไม่ได้แนบเอกสาร'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasFile ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({ url: docUrl || docName, title: doc.label })}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Eye size={13} />
                              <span>ดูไฟล์</span>
                            </button>

                            <a
                              href={docUrl || docName}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Download size={13} />
                              <span>ดาวน์โหลด</span>
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">ไม่มีไฟล์</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* INLINE DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`พรีวิวเอกสาร: ${previewDoc.title}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download size={14} />
                <span>ดาวน์โหลดไฟล์นี้</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          }
        >
          <div className="p-2 min-h-[400px] flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden relative">
            {/* PDPA Watermark Overlay for Privacy Security */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center rotate-[-25deg] opacity-30 select-none">
              <span className="text-base sm:text-lg font-black text-rose-400 uppercase tracking-widest text-center px-6 py-3 border-4 border-rose-400 rounded-2xl bg-black/60 shadow-2xl backdrop-blur-xs">
                🔒 ใช้เพื่อการสมัครเรียน มจร วิทยาลัยสงฆ์พ่อขุนผาเมือง เท่านั้น (PDPA PROTECTED)
              </span>
            </div>

            {previewDoc.url.endsWith('.pdf') || previewDoc.url.includes('pdf') ? (
              <iframe
                src={previewDoc.url}
                className="w-full h-[500px] rounded-lg border-0"
                title={previewDoc.title}
              />
            ) : (
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            )}
          </div>
        </Modal>
      )}

      {/* DELETE APPLICANT MODAL */}
      {deleteConfirmApplicant && (
        <Modal
          isOpen={!!deleteConfirmApplicant}
          onClose={() => setDeleteConfirmApplicant(null)}
          title="ยืนยันการลบใบสมัครเรียน"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmApplicant(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteApplicant}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบใบสมัคร'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลใบสมัครนี้? ข้อมูลผู้สมัครจะถูกถอดออกจากระบบ
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmApplicant.name}"
            </div>
          </div>
        </Modal>
      )}

      {/* OFFICIAL APPLICANT PRINT PREVIEW MODAL FOR ADMIN */}
      {printApplicant && (
        <Modal
          isOpen={Boolean(printApplicant)}
          onClose={() => setPrintApplicant(null)}
          title="พิมพ์ใบสมัครและใบนัดสอบสัมภาษณ์ทางการ"
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">
                รหัสผู้สมัคร: {printApplicant.applicationCode || printApplicant.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintApplicant(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Printer size={16} />
                  <span>พิมพ์เอกสาร A4 (Print Document)</span>
                </button>
              </div>
            </div>
          }
        >
          {/* Printable Paper Document Container */}
          <div className="printable-document font-sans text-slate-900 bg-white p-6 md:p-8 space-y-6 max-w-3xl mx-auto border border-slate-200 rounded-xl shadow-xs">
            {/* Header with Website Logo */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-2">
              <img src={logoImg} alt="MCU PKPM Logo" className="h-16 mx-auto object-contain mb-2" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              </h2>
              <h3 className="text-sm font-bold text-slate-800">
                ใบสมัครเข้าศึกษาและเอกสารยื่นสอบสัมภาษณ์ ประจำปีการศึกษา 2569
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 font-mono">
                <span>รหัสผู้สมัคร: <strong className="text-slate-900">{formatMCUCode(printApplicant.applicationCode || printApplicant.id)}</strong></span>
                <span>วันที่ออกเอกสาร: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Photo Box & Applicant Profile Summary */}
            <div className="flex flex-col sm:flex-row gap-6 items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex-1 space-y-2 text-xs">
                <h4 className="font-bold text-sm text-slate-900 border-l-4 border-amber-600 pl-2">
                  1. ข้อมูลประวัติผู้สมัคร (Applicant Profile)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  <p><strong>ชื่อ-นามสกุล:</strong> {printApplicant.fullName || `${printApplicant.prefix || ''} ${printApplicant.firstName || ''} ${printApplicant.lastName || ''}`}</p>
                  <p><strong>ประเภทผู้สมัคร:</strong> {printApplicant.personType === 'monk' || printApplicant.personType === 'clergy' ? 'บรรพชิต (พระภิกษุ-สามเณร)' : 'คฤหัสถ์ (บุคคลทั่วไป)'}</p>
                  {(printApplicant.personType === 'monk' || printApplicant.personType === 'clergy') && (
                    <>
                      <p><strong>ฉายา/สมานนาม:</strong> {printApplicant.ordinationName || '-'}</p>
                      <p><strong>สังกัดวัด:</strong> {printApplicant.templeName || '-'} ({printApplicant.templeDistrict || '-'}, {printApplicant.templeProvince || '-'})</p>
                    </>
                  )}
                  <p><strong>เลขประจำตัวประชาชน/สุทธิ:</strong> {printApplicant.nationalId || '-'}</p>
                  <p><strong>วัน/เดือน/ปีเกิด:</strong> {printApplicant.birthDate || '-'}</p>
                  <p><strong>เบอร์โทรศัพท์:</strong> {printApplicant.phone || '-'}</p>
                  <p><strong>อีเมล:</strong> {printApplicant.email || '-'}</p>
                </div>
              </div>

              {/* Candidate 1.5 inch Photo Box */}
              {(() => {
                const photoDoc = printApplicant.documents?.photoCopy || printApplicant.uploadedFiles?.photoCopy;
                const photoUrl = typeof photoDoc === 'object' ? (photoDoc?.url || photoDoc?.name || '') : (photoDoc || '');
                const hasPhoto = Boolean(photoUrl && photoUrl !== '/uploads/admissions/photo.jpg');

                return hasPhoto ? (
                  <img
                    src={photoUrl}
                    alt="รูปถ่ายผู้สมัคร"
                    className="w-28 h-36 object-cover border-2 border-slate-800 rounded-lg shadow-xs shrink-0 mx-auto sm:mx-0 bg-slate-100"
                  />
                ) : (
                  <div className="w-28 h-36 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-center p-2 bg-slate-50 text-[10px] text-slate-500 shrink-0 mx-auto sm:mx-0">
                    <span className="font-bold">ติดรูปถ่ายผู้สมัคร</span>
                    <span className="text-[9px] text-slate-400 mt-1">ขนาด 1.5 นิ้ว</span>
                    <span className="text-[9px] text-slate-400">(ถ่ายไว้ไม่เกิน 6 เดือน)</span>
                  </div>
                );
              })()}
            </div>

            {/* Program Info */}
            <div className="space-y-2 text-xs border-b border-slate-200 pb-4">
              <h4 className="font-bold text-sm text-slate-900 border-l-4 border-amber-600 pl-2">
                2. ข้อมูลหลักสูตรที่สมัครเข้าศึกษา (Academic Program)
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <p><strong>หลักสูตรที่สมัคร:</strong> {printApplicant.programTitle || printApplicant.programName || 'หลักสูตรพุทธศาสตรบัณฑิต'}</p>
                <p><strong>วุฒิการศึกษาสูงสุดเดิม:</strong> {printApplicant.educationalBackground || 'ม.6 (หรือธรรมเอก)'}</p>
              </div>
            </div>

            {/* Officer & Interview Assessment Table */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-900 border-l-4 border-amber-600 pl-2">
                3. ส่วนสำหรับเจ้าหน้าที่และกรรมการสอบสัมภาษณ์ (Official Assessment)
              </h4>
              
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-left w-1/3">รายการตรวจสอบหลักฐาน</th>
                    <th className="border border-slate-300 p-2 text-center w-1/3">ผลการตรวจสอบ</th>
                    <th className="border border-slate-300 p-2 text-left w-1/3">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2">1. สำเนาบัตรประชาชน / หนังสือสุทธิ</td>
                    <td className="border border-slate-300 p-2 text-center">[  ] ครบถ้วน   [  ] ไม่ครบ</td>
                    <td className="border border-slate-300 p-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">2. สำเนาวุฒิการศึกษา / ทรานสคริปต์</td>
                    <td className="border border-slate-300 p-2 text-center">[  ] ครบถ้วน   [  ] ไม่ครบ</td>
                    <td className="border border-slate-300 p-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">3. สำเนาทะเบียนบ้าน / หลักฐานอื่นๆ</td>
                    <td className="border border-slate-300 p-2 text-center">[  ] ครบถ้วน   [  ] ไม่ครบ</td>
                    <td className="border border-slate-300 p-2"></td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-8 pt-4">
                  <p>ลงชื่อ..........................................................ผู้สมัคร<br />({printApplicant.fullName})</p>
                </div>
                <div className="space-y-8 pt-4">
                  <p>ลงชื่อ..........................................................กรรมการสอบสัมภาษณ์<br />(..........................................................)</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center italic pt-2 border-t border-slate-100">
              * เอกสารฉบับนี้ออกโดยระบบยื่นใบสมัครออนไลน์ วิทยาลัยสงฆ์พ่อขุนผาเมือง มหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
