/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import logoImg from '../assets/images/regenerated_image_1784349405698.png';
import { api } from '../lib/api';
import { admissionStore } from '../data/admissionStore';
import { Course } from '../types';
import { InputField, SelectField } from './ui/FormControls';
import { Modal } from './ui/Modal';
import { 
  UserCheck, 
  GraduationCap, 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Printer, 
  Search, 
  Sparkles, 
  FileText, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Users,
  Building,
  MapPin,
  Check,
  Edit3
} from 'lucide-react';

interface AdmissionFormWizardProps {
  courses: Course[];
  onCompleteSuccess: (code: string) => void;
  onNavigateToStatus: (code: string) => void;
}

export default function AdmissionFormWizard({ courses, onCompleteSuccess, onNavigateToStatus }: AdmissionFormWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Personal Profile & Type
  const [personType, setPersonType] = useState<'monk' | 'layperson'>('monk');
  const [prefix, setPrefix] = useState<string>('พระมหา');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  
  // Monk fields
  const [ordinationName, setOrdinationName] = useState<string>('');
  const [templeName, setTempleName] = useState<string>('');
  const [templeDistrict, setTempleDistrict] = useState<string>('');
  const [templeProvince, setTempleProvince] = useState<string>('');

  const [nationalId, setNationalId] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Step 2: Education & Program
  const [educationalBackground, setEducationalBackground] = useState<string>('ม.6 (หรือธรรมเอก)');
  const [programId, setProgramId] = useState<string>(courses[0]?.id || 'b1');
  const [wizardLevelFilter, setWizardLevelFilter] = useState<string>('all');

  // Step 3: Document Uploads
  const [documents, setDocuments] = useState<{
    nationalIdCopy?: { name: string; size: string; url?: string };
    transcriptCopy?: { name: string; size: string; url?: string };
    photoCopy?: { name: string; size: string; url?: string };
    houseRegistrationCopy?: { name: string; size: string; url?: string };
    otherDocumentsCopy?: { name: string; size: string; url?: string };
  }>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Step 5: Success Results
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Selected Course details
  const selectedCourse = courses.find(c => c.id === programId) || courses[0];

  // Helper for monk vs layperson prefix switch
  const handlePersonTypeChange = (type: 'monk' | 'layperson') => {
    setPersonType(type);
    if (type === 'monk') {
      setPrefix('พระมหา');
    } else {
      setPrefix('นาย');
    }
  };

  // Drag & drop real file handler
  const handleFileUpload = async (
    docKey: 'nationalIdCopy' | 'transcriptCopy' | 'photoCopy' | 'houseRegistrationCopy' | 'otherDocumentsCopy',
    file: File
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('ขนาดไฟล์ต้องไม่เกิน 5 MB ต่อไฟล์');
      return;
    }
    setUploadingDoc(docKey);
    setErrorMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await api.uploadAdmissionDocument(file.name, base64, docKey);
          const fileUrl = res?.fileUrl || `/uploads/admissions/${file.name}`;
          const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
          setDocuments(prev => ({
            ...prev,
            [docKey]: { name: file.name, size: sizeKb, url: fileUrl }
          }));
        } catch (e: any) {
          const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
          setDocuments(prev => ({
            ...prev,
            [docKey]: { name: file.name, size: sizeKb, url: `/uploads/admissions/${file.name}` }
          }));
        } finally {
          setUploadingDoc(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('เกิดข้อผิดพลาดในการอ่านไฟล์');
      setUploadingDoc(null);
    }
  };

  // Step Validation Helpers
  const validateStep1 = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('กรุณากรอกชื่อจริงและนามสกุลให้ครบถ้วน');
      return false;
    }
    if (personType === 'monk') {
      if (!ordinationName.trim() || !templeName.trim() || !templeDistrict.trim() || !templeProvince.trim()) {
        setErrorMessage('กรุณากรอกข้อมูลฉายาบาลี และสังกัดวัดสำหรับบรรพชิตให้ครบถ้วน');
        return false;
      }
    }
    if (!nationalId.trim() || nationalId.length < 13) {
      setErrorMessage('กรุณากรอกเลขบัตรประชาชน / หนังสือสุทธิ 13 หลักให้ถูกต้อง');
      return false;
    }
    if (!birthDate.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('กรุณากรอกวันเกิด เบอร์โทรศัพท์ และอีเมลให้ครบถ้วน');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!programId) {
      setErrorMessage('กรุณาเลือกสาขาวิชา/หลักสูตรที่ต้องการเข้าศึกษา');
      return false;
    }
    const isClosed = selectedCourse?.status === 'inactive' || (selectedCourse as any)?.isActive === false;
    if (isClosed) {
      setErrorMessage(`หลักสูตร "${selectedCourse?.name || selectedCourse?.nameTh}" ถูกกำหนดสถานะเป็น "ปิดรับสมัคร / ปิดปรับปรุง" ไม่สามารถยื่นสมัครได้ในขณะนี้`);
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!documents.nationalIdCopy || !documents.transcriptCopy || !documents.photoCopy) {
      setErrorMessage('กรุณาแนบหลักฐานเอกสารทั้ง 3 รายการให้ครบถ้วน');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep(prev => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submit Handler (Step 4 -> Step 5)
  const handleSubmitForm = async () => {
    setSubmitting(true);
    setErrorMessage('');

    const payload = {
      personType,
      prefix,
      firstName,
      lastName,
      ordinationName: personType === 'monk' ? ordinationName : undefined,
      templeName: personType === 'monk' ? templeName : undefined,
      templeDistrict: personType === 'monk' ? templeDistrict : undefined,
      templeProvince: personType === 'monk' ? templeProvince : undefined,
      nationalId,
      birthDate,
      phone,
      email,
      educationalBackground,
      programId: selectedCourse?.id || programId,
      programTitle: selectedCourse?.name || 'หลักสูตรพุทธศาสตรบัณฑิต',
      degreeLevel: selectedCourse?.degree || 'ปริญญาตรี',
      documents: {
        nationalIdCopy: documents.nationalIdCopy?.url || `/uploads/admissions/${documents.nationalIdCopy?.name || 'national_id.pdf'}`,
        transcriptCopy: documents.transcriptCopy?.url || `/uploads/admissions/${documents.transcriptCopy?.name || 'transcript.pdf'}`,
        photoCopy: documents.photoCopy?.url || `/uploads/admissions/${documents.photoCopy?.name || 'photo.jpg'}`,
        houseRegistrationCopy: documents.houseRegistrationCopy?.url || (documents.houseRegistrationCopy?.name ? `/uploads/admissions/${documents.houseRegistrationCopy.name}` : ''),
        otherDocumentsCopy: documents.otherDocumentsCopy?.url || (documents.otherDocumentsCopy?.name ? `/uploads/admissions/${documents.otherDocumentsCopy.name}` : '')
      }
    };

    try {
      let code = '69001';
      try {
        const res: any = await api.submitApplication(payload);
        code = res?.data?.applicationCode || res?.applicationCode || res?.data?.applicant?.applicationCode || '69001';
      } catch (e) {
        console.warn('API submission notice:', e);
      }

      // Sync to admissionStore locally so Admin CMS displays it in real-time
      const storeApplicant = admissionStore.addApplicant({
        personType: personType === 'monk' ? 'clergy' : 'layperson',
        prefix,
        firstName,
        lastName,
        ordinationName,
        templeName,
        templeDistrict,
        templeProvince,
        nationalId,
        birthDate,
        phone,
        email,
        programId: selectedCourse?.id || programId,
        educationalBackground,
        uploadedFiles: {
          nationalIdCopy: documents.nationalIdCopy?.name || 'national_id.pdf',
          transcriptCopy: documents.transcriptCopy?.name || 'transcript.pdf',
          photoCopy: documents.photoCopy?.name || 'photo.jpg'
        }
      });

      const finalCode = code && code !== '69001' ? code : (storeApplicant.id || '69001');
      setSubmittedCode(finalCode);
      onCompleteSuccess(finalCode);
      setCurrentStep(5);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      {/* 5-Step Process Bar Indicator */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-amber-600 to-mcu-pink -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />

          {[
            { num: 1, label: 'ข้อมูลส่วนตัว', icon: UserCheck },
            { num: 2, label: 'หลักสูตรที่เลือก', icon: GraduationCap },
            { num: 3, label: 'แนบหลักฐาน', icon: UploadCloud },
            { num: 4, label: 'ตรวจสอบข้อมูล', icon: FileCheck },
            { num: 5, label: 'สำเร็จการสมัคร', icon: CheckCircle2 }
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            const Icon = s.icon;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                      ? 'bg-gradient-to-r from-amber-600 to-mcu-pink text-white ring-4 ring-amber-100 dark:ring-amber-950/50 scale-110' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-[11px] font-bold hidden sm:block ${
                  isCurrent ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Toast / Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-bounce">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: PERSONAL PROFILE & TYPE */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="text-amber-600" size={20} />
              <span>ขั้นตอนที่ 1: ข้อมูลประวัติส่วนตัวและประเภทบุคคล</span>
            </h3>
            <p className="text-xs text-slate-500 font-light">
              กรุณาระบุประเภทผู้สมัคร คำนำหน้าชื่อ ชื่อ-นามสกุล และข้อมูลติดต่อให้ครบถ้วน
            </p>
          </div>

          {/* Type Choice Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              ประเภทผู้สมัคร (personType) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePersonTypeChange('monk')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  personType === 'monk' 
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30 font-bold' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                  ☸️
                </div>
                <div>
                  <span className="text-sm block font-bold">บรรพชิต (พระภิกษุ - สามเณร)</span>
                  <span className="text-[11px] opacity-75 font-light">สำหรับพระภิกษุและสามเณรผู้ประสงค์เข้าศึกษา</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonTypeChange('layperson')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  personType === 'layperson' 
                    ? 'border-mcu-pink bg-mcu-pink-soft dark:bg-mcu-pink-deep/40 text-mcu-pink-deep dark:text-mcu-pink-light ring-2 ring-mcu-pink/30 font-bold' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-mcu-pink text-white flex items-center justify-center font-bold shrink-0">
                  👤
                </div>
                <div>
                  <span className="text-sm block font-bold">คฤหัสถ์ (บุคคลทั่วไป)</span>
                  <span className="text-[11px] opacity-75 font-light">สำหรับประชาชนและนักเรียนนักศึกษาทั่วไป</span>
                </div>
              </button>
            </div>
          </div>

          {/* Name & Prefix Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label="คำนำหน้าชื่อ (prefix) *"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              options={
                personType === 'monk'
                  ? [
                      { value: 'พระ', label: 'พระ' },
                      { value: 'พระมหา', label: 'พระมหา' },
                      { value: 'สามเณร', label: 'สามเณร' },
                      { value: 'พระครู', label: 'พระครู' },
                      { value: 'พระสมุห์', label: 'พระสมุห์' },
                      { value: 'พระใบฎีกา', label: 'พระใบฎีกา' },
                      { value: 'พระอธิการ', label: 'พระอธิการ' }
                    ]
                  : [
                      { value: 'นาย', label: 'นาย' },
                      { value: 'นาง', label: 'นาง' },
                      { value: 'นางสาว', label: 'นางสาว' }
                    ]
              }
            />

            <InputField
              label="ชื่อจริง (firstName) *"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="เช่น สมชาย / เมธี"
            />

            <InputField
              label="นามสกุล (lastName) *"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="เช่น ใจดี / สุขเจริญ"
            />
          </div>

          {/* Additional Fields Specific for Monk */}
          {personType === 'monk' && (
            <div className="p-5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-4 animate-in fade-in">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Building size={16} />
                <span>ข้อมูลเพิ่มเติมเฉพาะบรรพชิต (พระภิกษุ - สามเณร)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="ฉายาบาลี (ordinationName) *"
                  required
                  value={ordinationName}
                  onChange={(e) => setOrdinationName(e.target.value)}
                  placeholder="เช่น อภิปุญฺโญ / ธมฺมจารี"
                />

                <InputField
                  label="สังกัดวัดหลัก (templeName) *"
                  required
                  value={templeName}
                  onChange={(e) => setTempleName(e.target.value)}
                  placeholder="เช่น วัดมหาธาตุ / วัดเพชรวราราม"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="อำเภอที่ตั้งวัด (templeDistrict) *"
                  required
                  value={templeDistrict}
                  onChange={(e) => setTempleDistrict(e.target.value)}
                  placeholder="เช่น เมืองเพชรบูรณ์ / หล่มศักดิ์"
                />

                <InputField
                  label="จังหวัดที่ตั้งวัด (templeProvince) *"
                  required
                  value={templeProvince}
                  onChange={(e) => setTempleProvince(e.target.value)}
                  placeholder="เช่น เพชรบูรณ์"
                />
              </div>
            </div>
          )}

          {/* National ID, BirthDate, Phone, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="เลขบัตรประชาชน / หนังสือสุทธิ 13 หลัก (nationalId) *"
              required
              maxLength={13}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="1xxxxxxxxxxxx"
            />

            <InputField
              label="วัน/เดือน/ปีเกิด (พ.ศ.) (birthDate) *"
              required
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="เช่น 12 พฤษภาคม 2545"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="เบอร์มือถือติดต่อกลับ (phone) *"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx"
            />

            <InputField
              label="อีเมลส่วนตัว (email) *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mcu.ac.th"
            />
          </div>
        </div>
      )}

      {/* STEP 2: EDUCATION & PROGRAM */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="text-amber-600" size={20} />
              <span>ขั้นตอนที่ 2: วุฒิการศึกษาเดิมและสาขาวิชาที่สมัครเข้าศึกษา</span>
            </h3>
            <p className="text-xs text-slate-500 font-light">
              เลือกระดับการศึกษาสูงสุดเดิม และเลือกหลักสูตรที่ต้องการเข้าศึกษา (เชื่อมตรงจากคลังหลักสูตรวิทยาลัย)
            </p>
          </div>

          <SelectField
            label="ระดับการศึกษาสูงสุดเดิม (educationalBackground) *"
            value={educationalBackground}
            onChange={(e) => setEducationalBackground(e.target.value)}
            options={[
              { value: 'ม.6 (หรือธรรมเอก)', label: 'ม.6 (หรือธรรมเอก / ป.ธ. 3)' },
              { value: 'ปริญญาตรี (หรือพุทธศาสตรบัณฑิต)', label: 'ปริญญาตรี (หรือพุทธศาสตรบัณฑิต)' },
              { value: 'ปริญญาโท (หรือพุทธศาสตรมหาบัณฑิต)', label: 'ปริญญาโท (หรือพุทธศาสตรมหาบัณฑิต)' }
            ]}
          />

          {/* Degree Level Quick Filter Bar */}
          <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              🎯 ตัวเลือกกรองตามระดับการศึกษา (Filter by Degree Level):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'bachelor', label: '🎓 ปริญญาตรี' },
                { id: 'master', label: '📜 ปริญญาโท' },
                { id: 'doctor', label: '🏆 ปริญญาเอก' },
                { id: 'certificate', label: '📄 ประกาศนียบัตร' }
              ].map(f => {
                const isActive = wizardLevelFilter === f.id;
                const count = f.id === 'all'
                  ? courses.length
                  : courses.filter(c => (c.degreeLevel || c.level || '').toLowerCase() === f.id).length;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setWizardLevelFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <SelectField
            label="สาขาวิชา/หลักสูตรที่เลือกเข้าศึกษา (programId) *"
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            options={courses
              .filter(c => wizardLevelFilter === 'all' || (c.degreeLevel || c.level || '').toLowerCase() === wizardLevelFilter)
              .map(c => {
                const isClosed = c.status === 'inactive' || (c as any).isActive === false;
                return {
                  value: c.id,
                  label: `${c.name || c.nameTh} (${c.degree || c.degreeLevel || 'มจร'}) ${isClosed ? '🔴 [ปิดรับสมัคร/ปิดปรับปรุง]' : '✅ [เปิดรับสมัคร]'}`
                };
              })}
          />

          {/* Dynamically Loaded Program Info Card */}
          {selectedCourse && (() => {
            const isClosed = selectedCourse.status === 'inactive' || (selectedCourse as any).isActive === false;
            return (
              <div className={`p-5 rounded-2xl space-y-3 border ${
                isClosed
                  ? 'bg-rose-50/80 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-600" />
                    <span>รายละเอียดหลักสูตรที่เลือก: {selectedCourse.name || selectedCourse.nameTh}</span>
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                      {selectedCourse.degree}
                    </span>
                    {isClosed ? (
                      <span className="text-xs font-bold bg-rose-600 text-white px-3 py-0.5 rounded-full shadow-xs">
                        🔴 ปิดรับสมัคร / ปิดปรับปรุง
                      </span>
                    ) : (
                      <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-0.5 rounded-full shadow-xs">
                        ✅ เปิดรับสมัคร
                      </span>
                    )}
                  </div>
                </div>

                {isClosed && (
                  <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>หลักสูตรนี้ได้รับการกำหนดสถานะเป็น "ปิดรับสมัคร/ปิดปรับปรุง" โดยผู้ดูแลระบบ ไม่สามารถส่งใบสมัครได้ในขณะนี้</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-slate-400 block font-semibold">⏱️ ระยะเวลาศึกษา (Duration):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs mt-0.5 block">
                      {selectedCourse.duration || '4 ปี (8 ภาคการศึกษา)'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-slate-400 block font-semibold">💰 ค่าธรรมเนียมการศึกษา (Tuition Fee):</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs mt-0.5 block">
                      {selectedCourse.estimatedFee || selectedCourse.tuitionFee || 'ฟรีทุนอุดหนุนสำหรับพระภิกษุสามเณร'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <p><strong>📜 คุณสมบัติผู้สมัครที่กำหนด:</strong> {selectedCourse.qualifications?.join(', ') || selectedCourse.qualification?.join(', ') || 'สำเร็จการศึกษามัธยมศึกษาปีที่ 6 หรือธรรมเอก / ปเรียญธรรม 3 ประโยค'}</p>
                  {selectedCourse.careerOpportunities && selectedCourse.careerOpportunities.length > 0 && (
                    <p><strong>💼 โอกาสในสายอาชีพ:</strong> {selectedCourse.careerOpportunities.join(', ')}</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STEP 3: DOCUMENT UPLOADS */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UploadCloud className="text-amber-600" size={20} />
              <span>ขั้นตอนที่ 3: แนบหลักฐานเอกสารประกอบการสมัคร (Drag & Drop File Upload)</span>
            </h3>
            <p className="text-xs text-slate-500 font-light">
              รองรับไฟล์ประเภท PDF, JPG, JPEG, PNG ขนาดไม่เกิน 5 MB ต่อไฟล์
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. National ID / Monk Book */}
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2 hover:border-amber-500 transition-colors">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                1. สำเนาบัตรประชาชน / หนังสือสุทธิ (nationalIdCopy) *
              </span>
              {documents.nationalIdCopy ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>{documents.nationalIdCopy.name} ({documents.nationalIdCopy.size})</span>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="file-id"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('nationalIdCopy', e.target.files[0])}
                  />
                  <label htmlFor="file-id" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                    <UploadCloud size={14} />
                    <span>เลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่</span>
                  </label>
                </div>
              )}
            </div>

            {/* 2. Transcript */}
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2 hover:border-amber-500 transition-colors">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                2. สำเนาวุฒิการศึกษาล่าสุด (transcriptCopy) *
              </span>
              {documents.transcriptCopy ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>{documents.transcriptCopy.name} ({documents.transcriptCopy.size})</span>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="file-transcript"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('transcriptCopy', e.target.files[0])}
                  />
                  <label htmlFor="file-transcript" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                    <UploadCloud size={14} />
                    <span>เลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Photo */}
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2 hover:border-amber-500 transition-colors">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                3. รูปถ่ายหน้าตรงสีสุภาพ 1 นิ้ว (photoCopy) *
              </span>
              {documents.photoCopy ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>{documents.photoCopy.name} ({documents.photoCopy.size})</span>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="file-photo"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('photoCopy', e.target.files[0])}
                  />
                  <label htmlFor="file-photo" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                    <UploadCloud size={14} />
                    <span>เลือกไฟล์รูปถ่าย</span>
                  </label>
                </div>
              )}
            </div>

            {/* 4. House Registration */}
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2 hover:border-amber-500 transition-colors">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                4. สำเนาทะเบียนบ้าน (houseRegistrationCopy) *
              </span>
              {documents.houseRegistrationCopy ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>{documents.houseRegistrationCopy.name} ({documents.houseRegistrationCopy.size})</span>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="file-house"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('houseRegistrationCopy', e.target.files[0])}
                  />
                  <label htmlFor="file-house" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                    <UploadCloud size={14} />
                    <span>เลือกไฟล์ทะเบียนบ้าน</span>
                  </label>
                </div>
              )}
            </div>

            {/* 5. Other Documents (e.g. Name Change) */}
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2 hover:border-amber-500 transition-colors sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                5. เอกสารอื่นๆ เช่น ใบเปลี่ยนชื่อ-นามสกุล / ใบสุทธิเพิ่มเติม (otherDocumentsCopy)
              </span>
              {documents.otherDocumentsCopy ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>{documents.otherDocumentsCopy.name} ({documents.otherDocumentsCopy.size})</span>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="file-other"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('otherDocumentsCopy', e.target.files[0])}
                  />
                  <label htmlFor="file-other" className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                    <UploadCloud size={14} />
                    <span>เลือกไฟล์เอกสารเพิ่มเติม (ถ้ามี)</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: FULL REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="text-amber-600" size={20} />
              <span>ขั้นตอนที่ 4: ตรวจสอบความถูกต้องสมบูรณ์ก่อนยื่นใบสมัคร</span>
            </h3>
            <p className="text-xs text-slate-500 font-light">
              กรุณาตรวจสอบสรุปข้อมูลทั้ง 3 ส่วนก่อนกดยืนยัน หากต้องการแก้ไขสามารถกดปุ่ม "แก้ไข" ได้ทันที
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 Review */}
            <div className="p-5 border border-slate-200 rounded-2xl space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 text-xs">1. ข้อมูลประวัติส่วนตัว</h4>
                <button onClick={() => setCurrentStep(1)} className="text-mcu-pink font-bold text-xs hover:underline flex items-center gap-1">
                  <Edit3 size={12} /> แก้ไข
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                <p>ประเภท: <strong>{personType === 'monk' ? 'บรรพชิต' : 'คฤหัสถ์'}</strong></p>
                <p>ชื่อ-นามสกุล: <strong>{prefix} {firstName} {lastName}</strong></p>
                {personType === 'monk' && (
                  <>
                    <p>ฉายาบาลี: <strong>{ordinationName}</strong></p>
                    <p>สังกัดวัด: <strong>{templeName} ({templeDistrict}, {templeProvince})</strong></p>
                  </>
                )}
                <p>เลขบัตรประชาชน/สุทธิ: <strong>{nationalId}</strong></p>
                <p>วันเกิด: <strong>{birthDate}</strong></p>
                <p>ติดต่อ: <strong>{phone} | {email}</strong></p>
              </div>
            </div>

            {/* Step 2 Review */}
            <div className="p-5 border border-slate-200 rounded-2xl space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 text-xs">2. วุฒิเดิมและสาขาวิชาที่เลือก</h4>
                <button onClick={() => setCurrentStep(2)} className="text-mcu-pink font-bold text-xs hover:underline flex items-center gap-1">
                  <Edit3 size={12} /> แก้ไข
                </button>
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p>วุฒิการศึกษาสูงสุดเดิม: <strong>{educationalBackground}</strong></p>
                <p>หลักสูตรที่สมัคร: <strong className="text-mcu-pink text-sm">{selectedCourse?.name}</strong></p>
              </div>
            </div>

            {/* Step 3 Review */}
            <div className="p-5 border border-slate-200 rounded-2xl space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 text-xs">3. หลักฐานเอกสารประกอบ</h4>
                <button onClick={() => setCurrentStep(3)} className="text-mcu-pink font-bold text-xs hover:underline flex items-center gap-1">
                  <Edit3 size={12} /> แก้ไข
                </button>
              </div>
              <div className="text-xs text-emerald-800 space-y-1 font-semibold">
                <p>✓ สำเนาบัตรประชาชน/หนังสือสุทธิ: {documents.nationalIdCopy?.name}</p>
                <p>✓ สำเนาวุฒิการศึกษาล่าสุด: {documents.transcriptCopy?.name}</p>
                <p>✓ รูปถ่ายหน้าตรง 1 นิ้ว: {documents.photoCopy?.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS & PRINT/TRACK */}
      {currentStep === 5 && (
        <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={40} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              ยื่นใบสมัครออนไลน์เรียบร้อยแล้ว
            </span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              รหัสผู้สมัครของคุณคือ <span className="text-mcu-pink font-mono">{submittedCode || '69001'}</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              กรุณาบันทึกรหัสผู้สมัครนี้เพื่อใช้พิมพ์ใบสมัคร และติดตามผลการคัดเลือกผ่านระบบออนไลน์
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              <span>พิมพ์ใบสมัคร (Print Application Preview)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToStatus(submittedCode || '69001')}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-mcu-pink hover:from-amber-700 hover:to-mcu-pink-deep text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Search size={16} />
              <span>ติดตามสถานะการยื่นสมัคร</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP NAVIGATION BUTTONS (Step 1-4) */}
      {currentStep < 5 && (
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || submitting}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft size={16} />
            <span>ย้อนกลับ</span>
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-mcu-pink hover:from-amber-700 hover:to-mcu-pink-deep text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>ถัดไป</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>{submitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันและยื่นใบสมัครออนไลน์ 🚀'}</span>
            </button>
          )}
        </div>
      )}

      {/* OFFICIAL APPLICATION PRINT PREVIEW MODAL */}
      {isPrintModalOpen && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="พิมพ์ใบสมัครและใบนัดสอบสัมภาษณ์"
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">รหัสผู้สมัคร: {submittedCode || '69001'}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
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
                <span>รหัสผู้สมัคร: <strong className="text-slate-900">{submittedCode || '69001'}</strong></span>
                <span>วันที่ยื่นสมัคร: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Photo Box & Applicant Profile Summary */}
            <div className="flex flex-col sm:flex-row gap-6 items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex-1 space-y-2 text-xs">
                <h4 className="font-bold text-sm text-slate-900 border-l-4 border-amber-600 pl-2">
                  1. ข้อมูลประวัติผู้สมัคร (Applicant Profile)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  <p><strong>คำนำหน้า-ชื่อ-นามสกุล:</strong> {prefix} {firstName} {lastName}</p>
                  <p><strong>ประเภทผู้สมัคร:</strong> {personType === 'monk' ? 'บรรพชิต (พระภิกษุ-สามเณร)' : 'คฤหัสถ์ (บุคคลทั่วไป)'}</p>
                  {personType === 'monk' && (
                    <>
                      <p><strong>ฉายา/สมานนาม:</strong> {ordinationName || '-'}</p>
                      <p><strong>สังกัดวัด:</strong> {templeName || '-'} ({templeDistrict || '-'}, {templeProvince || '-'})</p>
                    </>
                  )}
                  <p><strong>เลขบัตรประชาชน/สุทธิ:</strong> {nationalId || '-'}</p>
                  <p><strong>วัน/เดือน/ปีเกิด:</strong> {birthDate || '-'}</p>
                  <p><strong>เบอร์โทรศัพท์:</strong> {phone || '-'}</p>
                  <p><strong>อีเมล:</strong> {email || '-'}</p>
                </div>
              </div>

              {/* Candidate 1.5 inch Photo Box */}
              <div className="w-28 h-36 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-center p-2 bg-slate-50 text-[10px] text-slate-500 shrink-0 mx-auto sm:mx-0">
                <span className="font-bold">ติดรูปถ่ายผู้สมัคร</span>
                <span className="text-[9px] text-slate-400 mt-1">ขนาด 1.5 นิ้ว</span>
                <span className="text-[9px] text-slate-400">(ถ่ายไว้ไม่เกิน 6 เดือน)</span>
              </div>
            </div>

            {/* Program Info */}
            <div className="space-y-2 text-xs border-b border-slate-200 pb-4">
              <h4 className="font-bold text-sm text-slate-900 border-l-4 border-amber-600 pl-2">
                2. ข้อมูลหลักสูตรที่สมัครเข้าศึกษา (Academic Program)
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <p><strong>หลักสูตรที่สมัคร:</strong> {selectedCourse?.name || 'หลักสูตรพุทธศาสตรบัณฑิต'}</p>
                <p><strong>ระดับการศึกษา:</strong> {selectedCourse?.degreeLevel === 'bachelor' ? 'ปริญญาตรี' : selectedCourse?.degreeLevel === 'master' ? 'ปริญญาโท' : selectedCourse?.degreeLevel === 'doctor' ? 'ปริญญาเอก' : 'ประกาศนียบัตร'}</p>
                <p><strong>วุฒิการศึกษาสูงสุดเดิม:</strong> {educationalBackground}</p>
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
                  <p>ลงชื่อ..........................................................ผู้สมัคร<br />({prefix} {firstName} {lastName})</p>
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
