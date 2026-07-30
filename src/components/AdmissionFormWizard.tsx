import React, { useState, useEffect } from 'react';
import logoImg from '../assets/images/regenerated_image_1784349405698.png';
import { api } from '../lib/api';
import { admissionStore } from '../data/admissionStore';
import { Course } from '../types';
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
  AlertCircle,
  Check,
  FileDown
} from 'lucide-react';

// Import Modular Components
import AdmissionGateway from './Admission/AdmissionGateway';
import Step1ProgramSelection from './Admission/Step1ProgramSelection';
import Step2PersonalInfo from './Admission/Step2PersonalInfo';
import Step3DocumentUpload from './Admission/Step3DocumentUpload';
import Step4ReviewSummary from './Admission/Step4ReviewSummary';
import Step5SuccessPrint from './Admission/Step5SuccessPrint';

interface AdmissionFormWizardProps {
  courses: Course[];
  onCompleteSuccess: (code: string) => void;
  onNavigateToStatus: (code: string) => void;
}

const DRAFT_KEY = 'MCU_ADMISSION_DRAFT_2569';

export default function AdmissionFormWizard({ courses, onCompleteSuccess, onNavigateToStatus }: AdmissionFormWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftPrompt, setDraftPrompt] = useState<boolean>(false);

  // Gateway Screen State
  const [hasSelectedStatus, setHasSelectedStatus] = useState<boolean>(false);

  // Step 1: Personal Profile & Type
  const [personType, setPersonType] = useState<'monk' | 'layperson'>('monk');
  const [prefix, setPrefix] = useState<string>('พระมหา');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  
  // Monk fields
  const [ordinationName, setOrdinationName] = useState<string>('');
  const [templeName, setTempleName] = useState<string>('');
  const [templeDistrict, setTempleDistrict] = useState<string>('');
  const [templeProvince, setTempleProvince] = useState<string>('เพชรบูรณ์');

  const [nationalId, setNationalId] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Step 2: Education & Program (Smart Educational Logic)
  const [educationalBackground, setEducationalBackground] = useState<string>('');
  const [customEduBgDetails, setCustomEduBgDetails] = useState<string>('');
  const [previousInstitute, setPreviousInstitute] = useState<string>('');
  const [previousGpax, setPreviousGpax] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');
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

  // Step 4: PDPA Consent
  const [pdpaConsent, setPdpaConsent] = useState<boolean>(false);

  // Step 5: Success Results & Status
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<string>('pending');
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

  const selectStatus = (type: 'monk' | 'layperson') => {
    handlePersonTypeChange(type);
    setHasSelectedStatus(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Check for LocalStorage Draft Auto-Save on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        setDraftPrompt(true);
      }
    } catch (e) {}
  }, []);

  // Save Draft automatically on input changes
  useEffect(() => {
    if (!hasSelectedStatus) return;
    try {
      const draftData = {
        personType,
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
        educationalBackground,
        programId,
        documents
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    } catch (e) {}
  }, [
    hasSelectedStatus, personType, prefix, firstName, lastName, 
    ordinationName, templeName, templeDistrict, templeProvince, 
    nationalId, birthDate, phone, email, educationalBackground, programId, documents
  ]);

  const restoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.personType) setPersonType(parsed.personType);
        if (parsed.prefix) setPrefix(parsed.prefix);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName) setLastName(parsed.lastName);
        if (parsed.ordinationName) setOrdinationName(parsed.ordinationName);
        if (parsed.templeName) setTempleName(parsed.templeName);
        if (parsed.templeDistrict) setTempleDistrict(parsed.templeDistrict);
        if (parsed.templeProvince) setTempleProvince(parsed.templeProvince);
        if (parsed.nationalId) setNationalId(parsed.nationalId);
        if (parsed.birthDate) setBirthDate(parsed.birthDate);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.educationalBackground) setEducationalBackground(parsed.educationalBackground);
        if (parsed.programId) setProgramId(parsed.programId);
        if (parsed.documents) setDocuments(parsed.documents);
        setHasSelectedStatus(true);
      }
    } catch (e) {}
    setDraftPrompt(false);
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    setDraftPrompt(false);
  };

  // File Upload Handler
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
            [docKey]: { name: file.name, size: sizeKb, url: URL.createObjectURL(file) }
          }));
        } finally {
          setUploadingDoc(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('ไม่สามารถอ่านไฟล์ได้');
      setUploadingDoc(null);
    }
  };

  // Step Validation logic
  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!programId) {
        setErrorMessage('กรุณาเลือกสาขาวิชาที่ประสงค์จะสมัครเข้าศึกษา');
        return;
      }
      const targetCourse = courses.find(c => c.id === programId);
      if (targetCourse && (targetCourse.status === 'inactive' || (targetCourse as any).isActive === false)) {
        setErrorMessage(`หลักสูตร "${targetCourse.name || targetCourse.nameTh}" ขณะนี้อยู่ในช่วงปิดรับสมัคร/ปิดปรับปรุงชั่วคราว ไม่สามารถยื่นสมัครได้`);
        return;
      }
    } else if (currentStep === 2) {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMessage('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน');
        return;
      }
      if (personType === 'monk' && (!ordinationName.trim() || !templeName.trim())) {
        setErrorMessage('กรุณากรอกฉายาบาลี และวัดสังกัดของพระภิกษุสามเณร');
        return;
      }
      if (!nationalId.trim() || !phone.trim()) {
        setErrorMessage('กรุณากรอกเลขประจำตัวประชาชน/สุทธิ และเบอร์โทรศัพท์ติดต่อ');
        return;
      }
    } else if (currentStep === 3) {
      if (!documents.nationalIdCopy) {
        setErrorMessage('กรุณาอัปโหลดสำเนาบัตรประชาชนหรือสำเนาหนังสือสุทธิ');
        return;
      }
      if (!documents.transcriptCopy) {
        setErrorMessage('กรุณาอัปโหลดสำเนาวุฒิการศึกษาล่าสุด');
        return;
      }
      if (!documents.photoCopy) {
        setErrorMessage('กรุณาอัปโหลดรูปถ่าย 1.5 นิ้ว');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Form Submission
  const handleSubmitForm = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const applicantPayload = {
        personType: (personType === 'monk' ? 'clergy' : 'layperson') as any,
        prefix,
        firstName,
        lastName,
        fullName: personType === 'monk' 
          ? `${prefix} ${firstName} ${lastName} (${ordinationName})`
          : `${prefix} ${firstName} ${lastName}`,
        ordinationName,
        templeName,
        templeDistrict,
        templeProvince,
        nationalId,
        birthDate,
        phone,
        email,
        educationalBackground,
        programId: selectedCourse?.id || programId || 'b1',
        programName: selectedCourse?.name || 'หลักสูตรพุทธศาสตรบัณฑิต',
        documents,
        status: 'pending',
        appliedAt: new Date().toISOString()
      };

      const res: any = await api.submitApplication(applicantPayload).catch(() => null);
      const code = res?.data?.applicationCode || res?.applicant?.applicationCode || res?.applicationCode || res?.id;

      // 1. Sync with admissionStore for local persistence fallback
      const storeApplicant = admissionStore.addApplicant({
        personType: (personType === 'monk' ? 'clergy' : 'layperson'),
        prefix,
        firstName,
        lastName,
        ordinationName,
        templeName,
        nationalId,
        birthDate: birthDate || '',
        phone,
        email,
        educationalBackground,
        programId: selectedCourse?.id || programId || 'b1',
        uploadedFiles: {
          nationalIdCopy: documents.nationalIdCopy?.name || '',
          transcriptCopy: documents.transcriptCopy?.name || '',
          photoCopy: documents.photoCopy?.name || ''
        }
      });

      // Clear draft after success
      clearDraft();

      const finalCode = code && code !== '69001' ? code : (storeApplicant.id || 'MCU-69-69001');
      setSubmittedCode(finalCode);
      onCompleteSuccess(finalCode);
      setCurrentStep(5);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasSelectedStatus) {
    return (
      <div className="space-y-6">
        {/* Draft Restore Prompt Modal */}
        {draftPrompt && (
          <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-xs text-slate-800 dark:text-slate-200">
              <span className="text-2xl">💾</span>
              <div>
                <strong className="block font-extrabold text-amber-900 dark:text-amber-300 text-sm">
                  พบข้อมูลแบบร่างที่เคยกรอกค้างไว้ (Draft Persistence Found)
                </strong>
                <span>ระบบพบบันทึกการกรอกใบสมัครล่าสุด ท่านต้องการกรอกข้อมูลต่อจากเดิมหรือไม่?</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={restoreDraft}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                กรอกข้อมูลต่อ 🚀
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-300 cursor-pointer"
              >
                เริ่มสมัครใหม่
              </button>
            </div>
          </div>
        )}

        <AdmissionGateway onSelectStatus={selectStatus} />
      </div>
    );
  }

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
            { num: 1, label: 'เลือกหลักสูตร', icon: GraduationCap },
            { num: 2, label: 'ข้อมูลส่วนตัว', icon: UserCheck },
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

      {/* STEP 1: PROGRAM SELECTION */}
      {currentStep === 1 && (
        <Step1ProgramSelection
          courses={courses}
          selectedProgramId={programId}
          onSelectProgram={setProgramId}
          levelFilter={wizardLevelFilter}
          onLevelFilterChange={setWizardLevelFilter}
          educationalBackground={educationalBackground}
          onEduBgChange={setEducationalBackground}
          customEduBgDetails={customEduBgDetails}
          onCustomEduBgDetailsChange={setCustomEduBgDetails}
          previousInstitute={previousInstitute}
          onPreviousInstituteChange={setPreviousInstitute}
          previousGpax={previousGpax}
          onPreviousGpaxChange={setPreviousGpax}
        />
      )}

      {/* STEP 2: PERSONAL INFO */}
      {currentStep === 2 && (
        <Step2PersonalInfo
          personType={personType}
          onReturnToGateway={() => setHasSelectedStatus(false)}
          prefix={prefix}
          onPrefixChange={setPrefix}
          firstName={firstName}
          onFirstNameChange={setFirstName}
          lastName={lastName}
          onLastNameChange={setLastName}
          ordinationName={ordinationName}
          onOrdinationNameChange={setOrdinationName}
          templeName={templeName}
          onTempleNameChange={setTempleName}
          templeDistrict={templeDistrict}
          onTempleDistrictChange={setTempleDistrict}
          templeProvince={templeProvince}
          onTempleProvinceChange={setTempleProvince}
          nationalId={nationalId}
          onNationalIdChange={setNationalId}
          birthDate={birthDate}
          onBirthDateChange={setBirthDate}
          phone={phone}
          onPhoneChange={setPhone}
          email={email}
          onEmailChange={setEmail}
        />
      )}

      {/* STEP 3: DOCUMENT UPLOAD */}
      {currentStep === 3 && (
        <Step3DocumentUpload
          personType={personType}
          documents={documents}
          uploadingDoc={uploadingDoc}
          onFileUpload={handleFileUpload}
        />
      )}

      {/* STEP 4: REVIEW & PDPA */}
      {currentStep === 4 && (
        <Step4ReviewSummary
          personType={personType}
          prefix={prefix}
          firstName={firstName}
          lastName={lastName}
          ordinationName={ordinationName}
          templeName={templeName}
          templeDistrict={templeDistrict}
          templeProvince={templeProvince}
          nationalId={nationalId}
          birthDate={birthDate}
          phone={phone}
          email={email}
          educationalBackground={educationalBackground}
          selectedCourse={selectedCourse}
          documents={documents}
          pdpaConsent={pdpaConsent}
          onPdpaConsentChange={setPdpaConsent}
          onGoToStep={setCurrentStep}
        />
      )}

      {/* STEP 5: SUCCESS & PRINT */}
      {currentStep === 5 && (
        <Step5SuccessPrint
          submittedCode={submittedCode || 'MCU-69-69001'}
          applicantStatus={submittedStatus}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onNavigateToStatus={onNavigateToStatus}
        />
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
              disabled={!pdpaConsent || submitting}
              className={`px-8 py-3 rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer flex items-center gap-2 ${
                pdpaConsent && !submitting
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 size={18} />
              <span>{submitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันและยื่นใบสมัครออนไลน์ 🚀'}</span>
            </button>
          )}
        </div>
      )}

      {/* PRINT APPLICATION MODAL */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="ใบสมัครเข้าศึกษาต่อ - วิทยาลัยสงฆ์พ่อขุนผาเมือง"
        maxWidth="4xl"
      >
        <div className="space-y-5 text-slate-800 text-xs p-6 bg-white rounded-2xl relative" id="printable-application">
          {/* Print CSS Fix: Ensure ONLY #printable-application prints */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-application, #printable-application * {
                visibility: visible;
              }
              #printable-application {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Header & Logo with Candidate Photo */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <img src={logoImg} alt="MCU Logo" className="w-16 h-16 shrink-0 mx-auto sm:mx-0" />
              <div className="space-y-0.5">
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                </h2>
                <h3 className="text-xs sm:text-sm font-bold text-amber-800">
                  ใบสมัครเข้าศึกษาและบัตรประจำตัวผู้สมัคร ประจำปีการศึกษา 2569
                </h3>
              </div>
            </div>

            {/* Candidate Uploaded Photo Box */}
            {(() => {
              const photoDoc = documents.photoCopy;
              const photoUrl = typeof photoDoc === 'object' ? (photoDoc?.url || photoDoc?.name || '') : (photoDoc || '');

              return photoUrl ? (
                <img
                  src={photoUrl}
                  alt="รูปถ่ายผู้สมัคร"
                  className="w-24 h-32 object-cover border-2 border-slate-800 rounded-lg shadow-sm shrink-0 bg-slate-100 mx-auto sm:mx-0"
                />
              ) : (
                <div className="w-24 h-32 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-center p-1 bg-slate-50 text-[10px] text-slate-500 shrink-0 mx-auto sm:mx-0">
                  <span className="font-bold">รูปถ่ายผู้สมัคร</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">ขนาด 1.5 นิ้ว</span>
                </div>
              );
            })()}
          </div>

          {/* Selection Status Badge */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-xs font-bold text-amber-900">
              สถานะการคัดเลือก: 🎙️ รอสัมภาษณ์ (โปรดนำเอกสารนี้มายื่นในวันสอบ)
            </p>
          </div>

          {/* Form Fields Table */}
          <div className="space-y-2 border border-slate-300 p-4 rounded-xl text-slate-800 text-xs leading-relaxed">
            <p className="flex justify-between items-center border-b border-slate-200 pb-1.5 font-bold">
              <span>รหัสผู้สมัคร:</span>
              <span className="font-mono text-sm text-mcu-pink">{submittedCode || 'MCU-69-69001'}</span>
            </p>
            <p>
              <strong className="text-slate-600">ประเภทผู้สมัคร:</strong>{' '}
              {personType === 'monk' ? 'บรรพชิต (พระภิกษุ - สามเณร)' : 'คฤหัสถ์ (บุคคลทั่วไป)'}
            </p>
            <p>
              <strong className="text-slate-600">ชื่อ-นามสกุล:</strong>{' '}
              <strong className="text-slate-900">
                {prefix} {firstName} {lastName} {ordinationName ? `(${ordinationName})` : ''}
              </strong>
            </p>
            {personType === 'monk' && (
              <p>
                <strong className="text-slate-600">วัดสังกัด:</strong>{' '}
                {templeName} ({templeDistrict}, {templeProvince})
              </p>
            )}
            <p>
              <strong className="text-slate-600">เลขบัตรประชาชน/สุทธิ:</strong> {nationalId || '-'}
            </p>
            <p>
              <strong className="text-slate-600">เบอร์โทรศัพท์:</strong> {phone || '-'}
            </p>
            <p>
              <strong className="text-slate-600">อีเมล:</strong> {email || '-'}
            </p>
            <p>
              <strong className="text-slate-600">หลักสูตรที่เลือกสมัคร:</strong>{' '}
              <strong className="text-amber-800">{selectedCourse?.name}</strong>
            </p>
            <p>
              <strong className="text-slate-600">วุฒิการศึกษาสูงสุดเดิม:</strong>{' '}
              {educationalBackground} {customEduBgDetails ? `(${customEduBgDetails})` : ''}
            </p>
            {previousInstitute && (
              <p>
                <strong className="text-slate-600">สถาบันเดิม / GPAX:</strong>{' '}
                {previousInstitute} (GPAX: {previousGpax || '-'})
              </p>
            )}
            <p>
              <strong className="text-slate-600">วันที่ยื่นสมัครออนไลน์:</strong>{' '}
              {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>

          {/* QR Code Verification Box */}
          <div className="flex items-center justify-between border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800 block">
                Interview Verification QR Code
              </span>
              <p className="text-[11px] text-slate-500">
                กรรมการสอบสัมภาษณ์สามารถสแกน QR Code นี้เพื่อตรวจเช็กเอกสารตัวจริง
              </p>
            </div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                `https://pkpm.mcu.ac.th/admission/track?code=${submittedCode || 'MCU-69-69001'}`
              )}`}
              alt="Scan Verification QR Code"
              className="w-20 h-20 border p-1 bg-white rounded-lg shadow-2xs shrink-0"
            />
          </div>

          {/* Required Documents Checklist */}
          <div className="p-4 border border-amber-200 bg-amber-50/50 rounded-xl space-y-2 text-xs">
            <p className="font-extrabold text-amber-900 flex items-center gap-1">
              📌 เอกสารที่ต้องนำมายื่นในวันสอบสัมภาษณ์:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1 text-[11px]">
              <li>ใบสมัครฉบับนี้ (พิมพ์จากระบบออนไลน์) จำนวน 1 ฉบับ</li>
              <li>บัตรประจำตัวประชาชน / ใบสุทธิ (ตัวจริงและสำเนา) จำนวน 1 ชุด</li>
              <li>ใบระเบียนแสดงผลการเรียน / วุฒิการศึกษาเดิม (ตัวจริงและสำเนา) จำนวน 1 ชุด</li>
              <li>สำเนาทะเบียนบ้าน จำนวน 1 ชุด</li>
              <li>เอกสารอื่นๆ เช่น ใบเปลี่ยนชื่อ-นามสกุล / เอกสารสุทธิเพิ่มเติม (ถ้ามี) จำนวน 1 ชุด</li>
              <li>รูปถ่ายหน้าตรง ขนาด 1 หรือ 1.5 นิ้ว จำนวน 2 รูป</li>
            </ul>
          </div>

          {/* Signatures Area */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs">
            <div className="space-y-4">
              <div className="border-b border-dotted border-slate-400 w-3/4 mx-auto pt-4"></div>
              <p className="font-bold text-slate-900">
                ลงชื่อ..........................................................ผู้สมัคร
              </p>
              <p className="text-[11px] text-slate-600">
                ({prefix} {firstName} {lastName})
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-dotted border-slate-400 w-3/4 mx-auto pt-4"></div>
              <p className="font-bold text-slate-900">
                ลงชื่อ..........................................................กรรมการรับสมัคร
              </p>
              <p className="text-[11px] text-slate-600">
                (นายทะเบียน / กองงานรับสมัคร)
              </p>
            </div>
          </div>

          {/* Action Buttons inside modal */}
          <div className="flex flex-wrap justify-end gap-3 pt-3 border-t no-print">
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Printer size={16} />
              <span>พิมพ์ใบสมัคร (Print A4)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-mcu-pink text-white rounded-xl font-bold text-xs shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer"
            >
              <FileDown size={16} />
              <span>บันทึกเป็น PDF (Save PDF)</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
