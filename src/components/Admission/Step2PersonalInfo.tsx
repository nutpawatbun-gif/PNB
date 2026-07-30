import React from 'react';
import { UserCheck, MapPin } from 'lucide-react';
import { InputField, SelectField } from '../ui/FormControls';

interface Step2PersonalInfoProps {
  personType: 'monk' | 'layperson';
  onReturnToGateway: () => void;
  prefix: string;
  onPrefixChange: (val: string) => void;
  firstName: string;
  onFirstNameChange: (val: string) => void;
  lastName: string;
  onLastNameChange: (val: string) => void;
  ordinationName: string;
  onOrdinationNameChange: (val: string) => void;
  templeName: string;
  onTempleNameChange: (val: string) => void;
  templeDistrict: string;
  onTempleDistrictChange: (val: string) => void;
  templeProvince: string;
  onTempleProvinceChange: (val: string) => void;
  nationalId: string;
  onNationalIdChange: (val: string) => void;
  birthDate: string;
  onBirthDateChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
}

const THAI_PROVINCES = [
  'เพชรบูรณ์', 'พิษณุโลก', 'พิจิตร', 'ลพบุรี', 'เลย', 'ขอนแก่น', 'สุโขทัย', 'อุทัยธานี', 
  'นครสวรรค์', 'ชัยภูมิ', 'อุตรดิตถ์', 'เชียงใหม่', 'กรุงเทพมหานคร', 'ปทุมธานี', 'นนทบุรี', 'สมุทรปราการ'
];

export default function Step2PersonalInfo({
  personType,
  onReturnToGateway,
  prefix,
  onPrefixChange,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  ordinationName,
  onOrdinationNameChange,
  templeName,
  onTempleNameChange,
  templeDistrict,
  onTempleDistrictChange,
  templeProvince,
  onTempleProvinceChange,
  nationalId,
  onNationalIdChange,
  birthDate,
  onBirthDateChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange
}: Step2PersonalInfoProps) {
  // Input Auto Formatting Helper for Phone (08x-xxx-xxxx)
  const handlePhoneFormattedChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) {
      onPhoneChange(digits);
    } else if (digits.length <= 6) {
      onPhoneChange(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    } else {
      onPhoneChange(`${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`);
    }
  };

  // Input Auto Formatting Helper for National ID (x-xxxx-xxxxx-xx-x)
  const handleNationalIdFormattedChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 1) {
      onNationalIdChange(digits);
    } else if (digits.length <= 5) {
      onNationalIdChange(`${digits.slice(0, 1)}-${digits.slice(1)}`);
    } else if (digits.length <= 10) {
      onNationalIdChange(`${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`);
    } else if (digits.length <= 12) {
      onNationalIdChange(`${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`);
    } else {
      onNationalIdChange(`${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Active Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xl shrink-0">
            {personType === 'monk' ? '🪷' : '👤'}
          </div>
          <div>
            <span className="text-[11px] text-amber-800 dark:text-amber-300 uppercase font-bold tracking-wider block">
              สถานภาพผู้สมัครที่เลือก (Selected Status)
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {personType === 'monk' ? 'บรรพชิต (พระภิกษุ - สามเณร)' : 'คฤหัสถ์ (บุคคลทั่วไป / ฆราวาส)'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onReturnToGateway}
          className="text-xs text-amber-700 dark:text-amber-300 font-bold hover:underline bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-amber-300/60 dark:border-amber-800 cursor-pointer shadow-2xs hover:bg-amber-50"
        >
          ↺ เปลี่ยนสถานภาพผู้สมัคร
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="text-amber-600" size={20} />
          <span>ขั้นตอนที่ 2: กรอกข้อมูลส่วนตัวผู้สมัคร ({personType === 'monk' ? 'บรรพชิต' : 'คฤหัสถ์'})</span>
        </h3>
        <p className="text-xs text-slate-500 font-light">
          กรุณาระบุคำนำหน้าชื่อ ชื่อ-นามสกุล และข้อมูลติดต่อให้ครบถ้วนตามความเป็นจริง
        </p>
      </div>

      {/* Name & Prefix Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField
          label="คำนำหน้าชื่อ (prefix) *"
          value={prefix}
          onChange={(e) => onPrefixChange(e.target.value)}
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
          label={personType === 'monk' ? 'ชื่อ (ภาษาไทย) *' : 'ชื่อจริง *'}
          placeholder="เช่น สมบูรณ์"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          required
        />

        <InputField
          label={personType === 'monk' ? 'นามสกุลเดิม (ภาษาไทย) *' : 'นามสกุล *'}
          placeholder="เช่น บุญช่วยเหลือ"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          required
        />
      </div>

      {/* Monk Fields */}
      {personType === 'monk' && (
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-2xl space-y-4 animate-in fade-in">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <span>🪷 ข้อมูลเฉพาะพระภิกษุ-สามเณร (Monastic Details)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="ฉายาบาลี *"
              placeholder="เช่น กิตฺติญาโณ"
              value={ordinationName}
              onChange={(e) => onOrdinationNameChange(e.target.value)}
              required
            />
            <InputField
              label="สังกัดวัด/ที่พักสงฆ์ *"
              placeholder="เช่น วัดมหาธาตุ"
              value={templeName}
              onChange={(e) => onTempleNameChange(e.target.value)}
              required
            />
            <InputField
              label="อำเภอที่ตั้งวัด *"
              placeholder="เช่น เมืองเพชรบูรณ์"
              value={templeDistrict}
              onChange={(e) => onTempleDistrictChange(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="จังหวัดที่ตั้งวัด (Province Lookup) *"
              value={templeProvince || 'เพชรบูรณ์'}
              onChange={(e) => onTempleProvinceChange(e.target.value)}
              options={THAI_PROVINCES.map(p => ({ value: p, label: p }))}
            />
          </div>
        </div>
      )}

      {/* Identification & Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label={personType === 'monk' ? 'เลขประจำตัวประชาชน / เลขหนังสือสุทธิ *' : 'เลขประจำตัวประชาชน (13 หลัก) *'}
          placeholder={personType === 'monk' ? 'x-xxxx-xxxxx-xx-x' : '1-3401-xxxxx-xx-x'}
          value={nationalId}
          onChange={(e) => handleNationalIdFormattedChange(e.target.value)}
          required
        />

        <InputField
          label="วัน/เดือน/ปีเกิด *"
          type="date"
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="เบอร์โทรศัพท์ติดต่อ (Phone Formatting) *"
          placeholder="08x-xxx-xxxx"
          value={phone}
          onChange={(e) => handlePhoneFormattedChange(e.target.value)}
          required
        />

        <InputField
          label="อีเมลติดต่อ (Email Address) *"
          type="email"
          placeholder="example@mcu.ac.th"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}
