/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MediaLibrary } from '../MediaLibrary';
import {
  Settings,
  Globe,
  Building,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin,
  Share2,
  Lock,
  MailCheck,
  Upload,
  Search,
  ShieldAlert,
  BarChart2,
  Cookie,
  Database,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Download,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  Calendar,
  Clock,
  X,
  FileText
} from 'lucide-react';

interface SystemSettingsManagerProps {
  onNotify?: (msg: string, type: 'success' | 'error') => void;
}

export default function SystemSettingsManager({ onNotify }: SystemSettingsManagerProps) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('identity');

  // Media Picker modal states
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  // Password visibility for SMTP
  const [showSmtpPassword, setShowSmtpPassword] = useState<boolean>(false);

  // SMTP Test state
  const [testingSmtp, setTestingSmtp] = useState<boolean>(false);

  // Manual Backup state
  const [backingUp, setBackingUp] = useState<boolean>(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Error fetching system settings:', err);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการโหลดข้อมูลการตั้งค่าระบบ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      if (onNotify) onNotify('บันทึกการตั้งค่าระบบลงฐานข้อมูลเรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      console.error('Error updating settings:', err);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!settings?.smtp) return;
    setTestingSmtp(true);
    try {
      const res = await api.testSMTP(settings.smtp);
      if (onNotify) onNotify(res.message, 'success');
    } catch (err: any) {
      console.error('SMTP Test Error:', err);
      if (onNotify) onNotify('การทดสอบ SMTP ล้มเหลว: ' + err.message, 'error');
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleManualBackup = async () => {
    setBackingUp(true);
    try {
      const res = await api.triggerBackup();
      setSettings((prev: any) => ({
        ...prev,
        backup: {
          ...(prev.backup || {}),
          lastBackupAt: res.lastBackupAt
        }
      }));
      if (onNotify) onNotify(`สร้างไฟล์สำรองข้อมูลสำเร็จ (${res.dbSize})`, 'success');
    } catch (err: any) {
      console.error('Manual Backup Error:', err);
      if (onNotify) onNotify('การสำรองข้อมูลล้มเหลว: ' + err.message, 'error');
    } finally {
      setBackingUp(false);
    }
  };

  const handleDownloadBackup = () => {
    const downloadUrl = api.getBackupDownloadUrl();
    window.open(downloadUrl, '_blank');
  };

  const handleOpenMediaPicker = (fieldKey: string) => {
    setMediaPickerTarget(fieldKey);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (file: any) => {
    if (!mediaPickerTarget || !settings) return;

    const fileUrl = file.url || file.path;
    if (mediaPickerTarget.includes('.')) {
      const parts = mediaPickerTarget.split('.');
      setSettings((prev: any) => ({
        ...prev,
        [parts[0]]: {
          ...(prev[parts[0]] || {}),
          [parts[1]]: fileUrl
        }
      }));
    } else {
      setSettings((prev: any) => ({
        ...prev,
        [mediaPickerTarget]: fileUrl
      }));
    }

    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
    if (onNotify) onNotify(`เลือกรูปภาพสำหรับ ${mediaPickerTarget} เรียบร้อยแล้ว`, 'success');
  };

  // Helper nested updates
  const updateNestedSetting = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value
      }
    }));
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">กำลังโหลดการตั้งค่าระบบจากฐานข้อมูล...</p>
      </div>
    );
  }

  const navTabs = [
    { id: 'identity', label: 'อัตลักษณ์ & โลโก้', icon: Building, color: 'text-amber-500' },
    { id: 'contact_social', label: 'การติดต่อ & โซเชียล', icon: Phone, color: 'text-blue-500' },
    { id: 'footer_copyright', label: 'ส่วนท้าย & ลิขสิทธิ์', icon: Globe, color: 'text-emerald-500' },
    { id: 'localization', label: 'รูปแบบวันที่ & ภาษา', icon: Sliders, color: 'text-purple-500' },
    { id: 'smtp', label: 'ระบบอีเมล SMTP', icon: Mail, color: 'text-rose-500' },
    { id: 'upload', label: 'การอัปโหลดไฟล์', icon: Upload, color: 'text-cyan-500' },
    { id: 'seo', label: 'ตั้งค่า SEO & Meta', icon: Search, color: 'text-indigo-500' },
    { id: 'maintenance', label: 'ปิดปรับปรุงระบบ', icon: ShieldAlert, color: 'text-red-500' },
    { id: 'analytics', label: 'สถิติ & สคริปต์', icon: BarChart2, color: 'text-teal-500' },
    { id: 'cookie', label: 'แจ้งเตือนคุกกี้ (PDPA)', icon: Cookie, color: 'text-orange-500' },
    { id: 'backup', label: 'สำรองข้อมูล & Restore', icon: Database, color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-inner">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  ตั้งค่าระบบเซิร์ฟเวอร์หลัก (Super Admin Configurations)
                </h2>
                <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-500 text-slate-950 shadow-sm">
                  Database Direct Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                ศูนย์กลางกำหนดค่าระบบที่ถูกจัดเก็บลงฐานข้อมูลโดยตรง ปราศจากการเขียนโค้ดแบบ Hardcoded เพื่อความยืดหยุ่นในการปรับเปลี่ยนอัตลักษณ์ ข้อมูลการติดต่อ SEO และการรักษาความปลอดภัย
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={fetchSettings}
              type="button"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชค่า</span>
            </button>

            <button
              onClick={() => handleSaveSettings()}
              disabled={saving}
              type="button"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Warning Banner if active */}
      {settings.maintenanceMode?.enabled && (
        <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl text-red-700 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-red-900">โหมดปิดปรับปรุงระบบกำลังเปิดใช้งาน (Maintenance Mode Active)</h4>
              <p className="text-xs text-red-700 mt-0.5">
                ผู้ใช้งานทั่วไปจะไม่สามารถเข้าถึงหน้าเว็บไซต์ได้ (แสดงข้อความ: "{settings.maintenanceMode.message || 'ปิดปรับปรุง'}")
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              updateNestedSetting('maintenanceMode', 'enabled', false);
              handleSaveSettings();
            }}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            ปิดโหมดปรับปรุงทันที
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1 min-w-max">
          {navTabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-400' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Form Container */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        {/* TAB 1: IDENTITY & LOGOS */}
        {activeTab === 'identity' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-amber-500" />
                  <span>ข้อมูลอัตลักษณ์สถาบัน & โลโก้ (Site Identity & Branding)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">กำหนดชื่อเว็บไซต์ ชื่อหน่วยงาน โลโก้ Favicon และรูปภาพเริ่มต้นของระบบ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อเว็บไซต์ภาษาไทย (Site Name TH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.siteName || ''}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="เช่น วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อเว็บไซต์ภาษาอังกฤษ (Site Name EN)
                </label>
                <input
                  type="text"
                  value={settings.siteNameEn || ''}
                  onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })}
                  placeholder="เช่น Pho Khun Pha Mueang Buddhist College"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อหน่วยงานสังกัดภาษาไทย (Organization Name TH)
                </label>
                <input
                  type="text"
                  value={settings.organizationName || ''}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  placeholder="เช่น มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อหน่วยงานสังกัดภาษาอังกฤษ (Organization Name EN)
                </label>
                <input
                  type="text"
                  value={settings.organizationNameEn || ''}
                  onChange={(e) => setSettings({ ...settings, organizationNameEn: e.target.value })}
                  placeholder="เช่น Mahachulalongkornrajavidyalaya University"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Logo & Favicon Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              
              {/* Logo URL */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  โลโก้หลักของสถาบัน (Main Logo URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('logoUrl')}
                    className="px-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center space-x-1 shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>คลังภาพ</span>
                  </button>
                </div>

                {settings.logoUrl && (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center space-x-4">
                    <img src={settings.logoUrl} alt="Logo Preview" className="h-12 object-contain bg-white p-1 rounded border" />
                    <span className="text-[11px] text-slate-500 font-mono break-all">{settings.logoUrl}</span>
                  </div>
                )}
              </div>

              {/* Favicon URL */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  ไอคอน Favicon เว็บไซต์ (Favicon URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.faviconUrl || ''}
                    onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('faviconUrl')}
                    className="px-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center space-x-1 shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>คลังภาพ</span>
                  </button>
                </div>

                {settings.faviconUrl && (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center space-x-4">
                    <img src={settings.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain bg-white p-1 rounded border" />
                    <span className="text-[11px] text-slate-500 font-mono break-all">{settings.faviconUrl}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Default Images */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                รูปภาพเริ่มต้นของระบบ (Default Fallback Images)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ภาพเริ่มต้นเนื้อหา/ข่าวสาร</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.defaultImage || ''}
                      onChange={(e) => setSettings({ ...settings, defaultImage: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('defaultImage')}
                      className="px-2.5 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300"
                    >
                      เลือก
                    </button>
                  </div>
                  {settings.defaultImage && (
                    <img src={settings.defaultImage} alt="Default" className="mt-2 h-20 w-full object-cover rounded-xl border" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ภาพสไลด์แบนเนอร์สำรอง</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.defaultBannerImage || ''}
                      onChange={(e) => setSettings({ ...settings, defaultBannerImage: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('defaultBannerImage')}
                      className="px-2.5 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300"
                    >
                      เลือก
                    </button>
                  </div>
                  {settings.defaultBannerImage && (
                    <img src={settings.defaultBannerImage} alt="Banner Default" className="mt-2 h-20 w-full object-cover rounded-xl border" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">รูปโปรไฟล์ผู้ใช้เริ่มต้น</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.defaultAvatar || ''}
                      onChange={(e) => setSettings({ ...settings, defaultAvatar: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('defaultAvatar')}
                      className="px-2.5 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300"
                    >
                      เลือก
                    </button>
                  </div>
                  {settings.defaultAvatar && (
                    <img src={settings.defaultAvatar} alt="Avatar Default" className="mt-2 h-20 w-20 object-cover rounded-full border mx-auto" />
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & SOCIAL MEDIA */}
        {activeTab === 'contact_social' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>ข้อมูลการติดต่อ & ลิงก์โซเชียลมีเดีย (Contact & Social Media)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">กำหนดเบอร์โทรศัพท์ แฟกซ์ อีเมล ที่อยู่ แผนที่ และลิงก์ช่องทางโซเชียลมีเดีย</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ที่อยู่สถาบันภาษาไทย (Address TH)
                </label>
                <textarea
                  rows={2}
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ที่อยู่สถาบันภาษาอังกฤษ (Address EN)
                </label>
                <textarea
                  rows={2}
                  value={settings.addressEn || ''}
                  onChange={(e) => setSettings({ ...settings, addressEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ (Telephone)
                </label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="056-711-222, 056-711-223"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  โทรสาร (Fax)
                </label>
                <input
                  type="text"
                  value={settings.fax || ''}
                  onChange={(e) => setSettings({ ...settings, fax: e.target.value })}
                  placeholder="056-711-224"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลหลักสถาบัน (Official Email)
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="mbc@mcu.ac.th"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลสำหรับรับข้อความติดต่อ (Contact Form Recipient Email)
                </label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="admin.mbc@mcu.ac.th"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-amber-500" />
                <span>ช่องทางโซเชียลมีเดีย (Social Media Channels)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Facebook Page URL</label>
                  <input
                    type="text"
                    value={settings.socialMedia?.facebook || ''}
                    onChange={(e) => updateNestedSetting('socialMedia', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/mcuphetchabun"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Line Official ID / Link</label>
                  <input
                    type="text"
                    value={settings.socialMedia?.line || ''}
                    onChange={(e) => updateNestedSetting('socialMedia', 'line', e.target.value)}
                    placeholder="@mcuphetchabun"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={settings.socialMedia?.youtube || ''}
                    onChange={(e) => updateNestedSetting('socialMedia', 'youtube', e.target.value)}
                    placeholder="https://youtube.com/@mcuphetchabun"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">TikTok Account URL</label>
                  <input
                    type="text"
                    value={settings.socialMedia?.tiktok || ''}
                    onChange={(e) => updateNestedSetting('socialMedia', 'tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@mcuphetchabun"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">X (Twitter) URL</label>
                  <input
                    type="text"
                    value={settings.socialMedia?.twitterX || ''}
                    onChange={(e) => updateNestedSetting('socialMedia', 'twitterX', e.target.value)}
                    placeholder="https://x.com/mcuphetchabun"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Google Maps Configuration */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>แผนที่และพิกัดสถานที่ (Google Maps Configuration)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Google Maps Embed iframe URL</label>
                  <input
                    type="text"
                    value={settings.mapEmbedUrl || ''}
                    onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude (ละติจูด)</label>
                  <input
                    type="number"
                    step="any"
                    value={settings.latitude || ''}
                    onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="16.680028"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude (ลองจิจูด)</label>
                  <input
                    type="number"
                    step="any"
                    value={settings.longitude || ''}
                    onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="101.297694"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: FOOTER & COPYRIGHT */}
        {activeTab === 'footer_copyright' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span>ข้อความส่วนท้ายเว็บไซต์ & ลิขสิทธิ์ (Footer & Copyright Settings)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">กำหนดข้อความรายละเอียดสถาบัน คำอธิบายส่วนท้าย และสิทธิ์ความเป็นเจ้าของ</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความสถาบันส่วนท้ายภาษาไทย (Footer Text TH)
                </label>
                <input
                  type="text"
                  value={settings.footerText || ''}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  placeholder="วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความสถาบันส่วนท้ายภาษาอังกฤษ (Footer Text EN)
                </label>
                <input
                  type="text"
                  value={settings.footerTextEn || ''}
                  onChange={(e) => setSettings({ ...settings, footerTextEn: e.target.value })}
                  placeholder="Pho Khun Pha Mueang Buddhist College, MCU Phetchabun"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำอธิบายพันธกิจส่วนท้าย (Footer Mission Description)
                </label>
                <textarea
                  rows={3}
                  value={settings.footerDescription || ''}
                  onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                  placeholder="ศูนย์กลางการศึกษาวิชาการพระพุทธศาสนา วิจัย และบริการวิชาการแก่สังคมในเขตพื้นที่จังหวัดเพชรบูรณ์"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความประกาศลิขสิทธิ์ (Copyright Notice)
                </label>
                <input
                  type="text"
                  value={settings.copyrightNotice || ''}
                  onChange={(e) => setSettings({ ...settings, copyrightNotice: e.target.value })}
                  placeholder="© 2026 วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์. สงวนลิขสิทธิ์ตามกฎหมาย."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOCALIZATION & DISPLAY */}
        {activeTab === 'localization' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-purple-500" />
                <span>รูปแบบการแสดงผล ภาษา และเขตเวลา (Localization & Display Settings)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">กำหนดภาษาเริ่มต้น รูปแบบวันที่ เขตเวลา และจำนวนรายการแสดงผลต่อหน้า</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ภาษาเริ่มต้นของระบบ (Default System Language)
                </label>
                <select
                  value={settings.defaultLanguage || 'th'}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="th">ภาษาไทย (Thai - TH)</option>
                  <option value="en">English (US - EN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เขตเวลาเซิร์ฟเวอร์ (Timezone)
                </label>
                <select
                  value={settings.timezone || 'Asia/Bangkok'}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Asia/Bangkok">Asia/Bangkok (UTC+07:00 - Thailand Standard Time)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+08:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รูปแบบการแสดงผลวันที่ (Date Format)
                </label>
                <select
                  value={settings.dateFormat || 'DD/MM/YYYY (พ.ศ.)'}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="DD/MM/YYYY (พ.ศ.)">DD/MM/YYYY (เช่น 22/07/2569 พุทธศักราช)</option>
                  <option value="D MMMM YYYY (พ.ศ.)">D MMMM YYYY (เช่น 22 กรกฎาคม 2569)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format e.g. 2026-07-22)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จำนวนรายการเริ่มต้นต่อหน้า (Items Per Page Default)
                </label>
                <select
                  value={settings.itemsPerPage || 10}
                  onChange={(e) => setSettings({ ...settings, itemsPerPage: parseInt(e.target.value) || 10 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value={10}>10 รายการต่อหน้า</option>
                  <option value={15}>15 รายการต่อหน้า</option>
                  <option value={20}>20 รายการต่อหน้า</option>
                  <option value={50}>50 รายการต่อหน้า</option>
                  <option value={100}>100 รายการต่อหน้า</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SMTP EMAIL SETTINGS */}
        {activeTab === 'smtp' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-rose-500" />
                  <span>การตั้งค่าเครื่องแม่ข่ายส่งอีเมล SMTP (SMTP Server Configurations)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">ใช้สำหรับการส่งอีเมลแจ้งเตือน รหัสผ่าน OTP และข้อความตอบกลับผู้ใช้งาน</p>
              </div>

              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
              >
                {testingSmtp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{testingSmtp ? 'กำลังทดสอบ...' : 'ทดสอบส่งอีเมล (Test SMTP)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SMTP Host Address
                </label>
                <input
                  type="text"
                  value={settings.smtp?.host || ''}
                  onChange={(e) => updateNestedSetting('smtp', 'host', e.target.value)}
                  placeholder="smtp.mcu.ac.th หรือ smtp.gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.smtp?.port || 587}
                  onChange={(e) => updateNestedSetting('smtp', 'port', parseInt(e.target.value) || 587)}
                  placeholder="587 หรือ 465"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  การเข้ารหัสความปลอดภัย (Security Protocol)
                </label>
                <select
                  value={settings.smtp?.secure ? 'true' : 'false'}
                  onChange={(e) => updateNestedSetting('smtp', 'secure', e.target.value === 'true')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="false">STARTTLS / TLS (Port 587)</option>
                  <option value="true">SSL / TLS Direct (Port 465)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.smtp?.username || ''}
                  onChange={(e) => updateNestedSetting('smtp', 'username', e.target.value)}
                  placeholder="user@mcu.ac.th"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SMTP Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={settings.smtp?.password || ''}
                    onChange={(e) => updateNestedSetting('smtp', 'password', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลผู้ส่ง (Sender Email Address - From)
                </label>
                <input
                  type="email"
                  value={settings.smtp?.fromEmail || ''}
                  onChange={(e) => updateNestedSetting('smtp', 'fromEmail', e.target.value)}
                  placeholder="noreply@mcu.ac.th"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อระบุผู้ส่ง (Sender Display Name)
                </label>
                <input
                  type="text"
                  value={settings.smtp?.fromName || ''}
                  onChange={(e) => updateNestedSetting('smtp', 'fromName', e.target.value)}
                  placeholder="วิทยาลัยสงฆ์พ่อขุนผาเมือง (MCU Phetchabun System)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: FILE UPLOAD SETTINGS */}
        {activeTab === 'upload' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-cyan-500" />
                <span>การตั้งค่าการอัปโหลดไฟล์ & Storage (File Upload & Storage Settings)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">กำหนดข้อจำกัดขนาดไฟล์ นามสกุลไฟล์ที่อนุญาต และรูปแบบที่จัดเก็บไฟล์</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ขนาดไฟล์อัปโหลดสูงสุดต่อไฟล์ (Max File Size MB)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.upload?.maxFileSizeMB || 10}
                    onChange={(e) => updateNestedSetting('upload', 'maxFileSizeMB', parseInt(e.target.value) || 10)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">Megabytes (MB)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รูปแบบคลังจัดเก็บไฟล์ (Storage Provider)
                </label>
                <select
                  value={settings.upload?.storageProvider || 'local'}
                  onChange={(e) => updateNestedSetting('upload', 'storageProvider', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="local">Local Disk Storage (/uploads Directory)</option>
                  <option value="s3">Amazon S3 Cloud Storage</option>
                  <option value="gcs">Google Cloud Storage (GCS)</option>
                  <option value="cloudinary">Cloudinary Media CDN</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  นามสกุลไฟล์ที่อนุญาตให้อัปโหลด (Allowed Extensions)
                </label>
                <textarea
                  rows={2}
                  value={settings.upload?.allowedExtensions || ''}
                  onChange={(e) => updateNestedSetting('upload', 'allowedExtensions', e.target.value)}
                  placeholder=".jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx, .xls, .xlsx, .zip"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="md:col-span-2 p-4 bg-cyan-50/50 border border-cyan-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-cyan-900">การบีบอัดภาพอัตโนมัติ (Auto WebP Image Compression)</h4>
                  <p className="text-[11px] text-cyan-700 mt-0.5">บีบอัดไฟล์รูปภาพ JPG/PNG ที่อัปโหลดเป็น WebP อัตโนมัติ เพื่อประหยัดพื้นที่ดิสก์และเพิ่มความเร็วเว็บไซต์</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.upload?.autoCompressImages ?? true}
                  onChange={(e) => updateNestedSetting('upload', 'autoCompressImages', e.target.checked)}
                  className="w-5 h-5 text-cyan-600 rounded border-cyan-300 focus:ring-cyan-500"
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: SEO SETTINGS */}
        {activeTab === 'seo' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Search className="w-5 h-5 text-indigo-500" />
                <span>การตั้งค่า Search Engine Optimization (SEO & Social Sharing)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">ปรับแต่งข้อมูล Meta Title, Description, Keywords และรูปภาพแชร์โซเชียลมีเดีย</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta Title หลักของเว็บไซต์
                </label>
                <input
                  type="text"
                  value={settings.seo?.metaTitle || ''}
                  onChange={(e) => updateNestedSetting('seo', 'metaTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta Description (คำอธิบายสำหรับ Google Search)
                </label>
                <textarea
                  rows={3}
                  value={settings.seo?.metaDescription || ''}
                  onChange={(e) => updateNestedSetting('seo', 'metaDescription', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta Keywords (คำค้นหาหลัก คั่นด้วยเครื่องหมายจุลภาค)
                </label>
                <input
                  type="text"
                  value={settings.seo?.metaKeywords || ''}
                  onChange={(e) => updateNestedSetting('seo', 'metaKeywords', e.target.value)}
                  placeholder="มจร, เพชรบูรณ์, วิทยาลัยสงฆ์พ่อขุนผาเมือง"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รูปภาพแชร์โซเชียลมีเดียหลัก (Open Graph Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.seo?.ogImageUrl || ''}
                    onChange={(e) => updateNestedSetting('seo', 'ogImageUrl', e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('seo.ogImageUrl')}
                    className="px-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shrink-0"
                  >
                    เลือกภาพ
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Search Console Verification Tag
                </label>
                <input
                  type="text"
                  value={settings.seo?.googleSiteVerification || ''}
                  onChange={(e) => updateNestedSetting('seo', 'googleSiteVerification', e.target.value)}
                  placeholder="google-site-verification-code..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MAINTENANCE MODE */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>โหมดปิดปรับปรุงระบบชั่วคราว (Maintenance Mode Configurations)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">ปิดกั้นการเข้าถึงของผู้ใช้งานทั่วไปขณะอัปเดตระบบใหญ่</p>
            </div>

            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${settings.maintenanceMode?.enabled ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">สถานะปิดปรับปรุงระบบ (Maintenance Mode)</h4>
                    <p className="text-xs text-slate-400">
                      {settings.maintenanceMode?.enabled ? 'ระบบกำลังถูกปิดกั้น ผู้ใช้ทั่วไปจะไม่เห็นหน้าเว็บ' : 'ระบบเปิดใช้งานตามปกติ ผู้ใช้อ่านเนื้อหาได้'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode?.enabled || false}
                    onChange={(e) => updateNestedSetting('maintenanceMode', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความแจ้งเตือนเมื่อปิดปรับปรุงระบบ (Maintenance Notice Message)
                </label>
                <textarea
                  rows={3}
                  value={settings.maintenanceMode?.message || ''}
                  onChange={(e) => updateNestedSetting('maintenanceMode', 'message', e.target.value)}
                  placeholder="ระบบกำลังปิดปรับปรุงชั่วคราวเพื่ออัปเดตประสิทธิภาพ ขออภัยในความไม่สะดวก"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเลข IP ที่ได้รับยกเว้น (Allowed IP Addresses for Admin Access)
                </label>
                <input
                  type="text"
                  value={settings.maintenanceMode?.allowedIps || ''}
                  onChange={(e) => updateNestedSetting('maintenanceMode', 'allowedIps', e.target.value)}
                  placeholder="127.0.0.1, ::1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 9: ANALYTICS & CODE SNIPPETS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-teal-500" />
                <span>รหัสติดตามสถิติ & สคริปต์ส่วนตัว (Analytics & Custom Code Snippets)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">จัดการรหัส Google Analytics, Google Tag Manager และสคริปต์สถิติแทรกในเว็บ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Analytics 4 Tracking ID (GA4 ID)
                </label>
                <input
                  type="text"
                  value={settings.analytics?.googleAnalyticsId || ''}
                  onChange={(e) => updateNestedSetting('analytics', 'googleAnalyticsId', e.target.value)}
                  placeholder="G-MCU123456789"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Tag Manager Container ID (GTM ID)
                </label>
                <input
                  type="text"
                  value={settings.analytics?.googleTagManagerId || ''}
                  onChange={(e) => updateNestedSetting('analytics', 'googleTagManagerId', e.target.value)}
                  placeholder="GTM-MCUPHB12"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Header Scripts (โค้ดแทรกในแท็ก &lt;head&gt;)
                </label>
                <textarea
                  rows={4}
                  value={settings.analytics?.customHeaderScripts || ''}
                  onChange={(e) => updateNestedSetting('analytics', 'customHeaderScripts', e.target.value)}
                  placeholder="<!-- Custom JS or CSS code -->"
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-amber-400 border border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Body Scripts (โค้ดแทรกก่อนปิดแท็ก &lt;/body&gt;)
                </label>
                <textarea
                  rows={4}
                  value={settings.analytics?.customBodyScripts || ''}
                  onChange={(e) => updateNestedSetting('analytics', 'customBodyScripts', e.target.value)}
                  placeholder="<!-- Custom Body scripts -->"
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-amber-400 border border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 10: COOKIE NOTICE */}
        {activeTab === 'cookie' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Cookie className="w-5 h-5 text-orange-500" />
                <span>การตั้งค่าแถบแจ้งเตือนคุกกี้ (Cookie Banner & PDPA Policy)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">ปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-orange-900">เปิดใช้งานแถบแจ้งเตือนคุกกี้ (Enable Cookie Banner)</h4>
                  <p className="text-[11px] text-orange-700 mt-0.5">แสดงป๊อบอัพแถบแจ้งเตือนคุกกี้แก่ผู้ใช้งานที่เข้ามาครั้งแรก</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.cookieNotice?.enabled ?? true}
                  onChange={(e) => updateNestedSetting('cookieNotice', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความในแถบแจ้งเตือนคุกกี้ (Cookie Notice Message)
                </label>
                <textarea
                  rows={3}
                  value={settings.cookieNotice?.message || ''}
                  onChange={(e) => updateNestedSetting('cookieNotice', 'message', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ลิงก์หน้านโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy URL)
                  </label>
                  <input
                    type="text"
                    value={settings.cookieNotice?.privacyPolicyUrl || '/privacy-policy'}
                    onChange={(e) => updateNestedSetting('cookieNotice', 'privacyPolicyUrl', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ข้อความบนปุ่มยอมรับ (Accept Button Text)
                  </label>
                  <input
                    type="text"
                    value={settings.cookieNotice?.acceptButtonText || 'ยอมรับทั้งหมด'}
                    onChange={(e) => updateNestedSetting('cookieNotice', 'acceptButtonText', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-slate-600" />
                  <span>การตั้งค่าสำรองข้อมูล & กู้คืน (Backup & Data Retention)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">กำหนดการสำรองข้อมูลอัตโนมัติ และดาวน์โหลดไฟล์สแนปชอตฐานข้อมูลทั้งระบบ</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleManualBackup}
                  disabled={backingUp}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {backingUp ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{backingUp ? 'กำลังสำรองข้อมูล...' : 'สร้างไฟล์สำรองทันที'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์ JSON ทั้งหมด</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl md:col-span-2 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">เปิดใช้งานสำรองข้อมูลอัตโนมัติ (Auto Scheduled Backup)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">สร้างไฟล์สแนปชอตเก็บไว้อัตโนมัติตามช่วงเวลาที่กำหนด</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.backup?.autoBackupEnabled ?? true}
                  onChange={(e) => updateNestedSetting('backup', 'autoBackupEnabled', e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ความถี่ในการสำรองข้อมูล (Schedule Interval)
                </label>
                <select
                  value={settings.backup?.scheduleInterval || 'daily'}
                  onChange={(e) => updateNestedSetting('backup', 'scheduleInterval', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="daily">ทุกวัน (Daily at midnight)</option>
                  <option value="weekly">ทุกสัปดาห์ (Weekly on Sunday)</option>
                  <option value="monthly">ทุกเดือน (Monthly on 1st)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จำนวนวันที่จัดเก็บไฟล์สำรอง (Retention Period Days)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.backup?.retentionDays || 30}
                    onChange={(e) => updateNestedSetting('backup', 'retentionDays', parseInt(e.target.value) || 30)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">วัน</span>
                </div>
              </div>

              <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">วันและเวลาที่สำรองข้อมูลล่าสุด (Last Backup Timestamp):</span>
                  <span className="text-xs font-mono text-amber-800">
                    {settings.backup?.lastBackupAt
                      ? new Date(settings.backup.lastBackupAt).toLocaleString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : 'ยังไม่มีประวัติสำรองข้อมูล'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bottom Sticky Action Bar */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            * การบันทึกจะอัปเดตไปยังตาราง <code className="font-mono text-slate-600">settings</code> ในฐานข้อมูลเซิร์ฟเวอร์ทันที
          </span>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
          </button>
        </div>

      </form>

      {/* MEDIA PICKER MODAL DIALOG */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">เลือกรูปภาพจากคลังสื่อ (Media Library Picker)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <MediaLibrary
                selectionMode={true}
                onSelectFile={(file) => handleMediaSelect(file)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
