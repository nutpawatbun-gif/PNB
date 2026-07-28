/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { bannersStore } from '../../data/bannersStore';
import { HomepageSection, BannerItem } from '../../types';
import { Modal } from '../ui/Modal';
import { getEmbeddableDriveUrl } from '../../lib/driveUtils';
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Edit3, 
  Save, 
  RotateCcw, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Plus, 
  Trash2, 
  ExternalLink,
  Layers,
  Search,
  Sparkles,
  Image as ImageIcon,
  Layout,
  Link,
  FileText,
  Type
} from 'lucide-react';

export default function HomepageBuilder() {
  const [activeMainTab, setActiveMainTab] = useState<'layout' | 'banners'>('banners');

  // Layout Sections State
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editForm, setEditForm] = useState<{
    titleTh: string;
    titleEn: string;
    description: string;
    config: any;
  }>({
    titleTh: '',
    titleEn: '',
    description: '',
    config: {}
  });

  // Banners CMS State
  const [banners, setBanners] = useState<BannerItem[]>(() => bannersStore.getBanners());
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [deleteConfirmBanner, setDeleteConfirmBanner] = useState<BannerItem | null>(null);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);

  // Banner Form State
  const [bannerForm, setBannerForm] = useState<{
    titleTh: string;
    titleEn: string;
    subTh: string;
    subEn: string;
    descTh: string;
    descEn: string;
    image: string;
    bgClass: string;
    onlyImage: boolean;
    linkType: 'applyNow' | 'viewDetails' | 'external' | 'none';
    externalUrl: string;
  }>({
    titleTh: '',
    titleEn: '',
    subTh: '',
    subEn: '',
    descTh: '',
    descEn: '',
    image: '',
    bgClass: 'bg-mcu-pink-deep/75',
    onlyImage: false,
    linkType: 'viewDetails',
    externalUrl: ''
  });

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Layout Sections
  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const data = await api.getHomepageSections();
      setSections(data.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      console.warn('Failed to load sections:', err);
    } finally {
      setLoadingSections(false);
    }
  };

  // Fetch Banners
  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const data = await api.getBanners();
      if (Array.isArray(data) && data.length > 0) {
        setBanners(data);
        bannersStore.saveBanners(data);
      } else {
        setBanners(bannersStore.getBanners());
      }
    } catch (err: any) {
      console.warn('Failed to load banners:', err);
      setBanners(bannersStore.getBanners());
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchBanners();
  }, []);

  // Section handlers
  const handleToggleVisibility = async (sec: HomepageSection) => {
    const updated = { ...sec, isVisible: !sec.isVisible };
    setSections(prev => prev.map(s => s.id === sec.id ? updated : s));

    try {
      await api.updateHomepageSection(sec.id, { isVisible: updated.isVisible });
      showToast(`${updated.isVisible ? 'เปิดใช้งาน' : 'ซ่อน'} ส่วน "${sec.titleTh}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      setSections(prev => prev.map(s => s.id === sec.id ? sec : s));
      showToast('เกิดข้อผิดพลาดในการปรับสถานะ: ' + err.message, 'error');
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const reordered = newSections.map((sec, idx) => ({
      ...sec,
      order: idx + 1
    }));

    setSections(reordered);
    setSaving(true);

    try {
      await api.reorderHomepageSections(reordered);
      showToast('ปรับลำดับส่วนประกอบหน้าแรกเรียบร้อยแล้ว');
    } catch (err: any) {
      showToast('ไม่สามารถบันทึกลำดับได้: ' + err.message, 'error');
      fetchSections();
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditSection = (sec: HomepageSection) => {
    setEditingSection(sec);
    setEditForm({
      titleTh: sec.titleTh || '',
      titleEn: sec.titleEn || '',
      description: sec.description || '',
      config: JSON.parse(JSON.stringify(sec.config || {}))
    });
  };

  const handleSaveEditSection = async () => {
    if (!editingSection) return;

    setSaving(true);
    try {
      const updated = await api.updateHomepageSection(editingSection.id, {
        titleTh: editForm.titleTh,
        titleEn: editForm.titleEn,
        description: editForm.description,
        config: editForm.config
      });

      setSections(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditingSection(null);
      showToast(`อัปเดตข้อมูลส่วน "${updated.titleTh}" สำเร็จแล้ว`);
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการบันทึก: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Banner handlers
  const handleOpenBannerModal = (banner?: BannerItem) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        titleTh: banner.titleTh || '',
        titleEn: banner.titleEn || '',
        subTh: banner.subTh || '',
        subEn: banner.subEn || '',
        descTh: banner.descTh || '',
        descEn: banner.descEn || '',
        image: banner.image || '',
        bgClass: banner.bgClass || 'bg-mcu-pink-deep/75',
        onlyImage: !!banner.onlyImage,
        linkType: banner.linkType || 'none',
        externalUrl: banner.externalUrl || ''
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        titleTh: '',
        titleEn: '',
        subTh: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        subEn: 'Mahachulalongkornrajavidyalaya University',
        descTh: '',
        descEn: '',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1600',
        bgClass: 'bg-mcu-pink-deep/75',
        onlyImage: false,
        linkType: 'viewDetails',
        externalUrl: ''
      });
    }
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.image.trim()) {
      showToast('กรุณาระบุ URL ภาพสไลด์แบนเนอร์', 'error');
      return;
    }

    const payload: Partial<BannerItem> = {
      titleTh: bannerForm.titleTh,
      titleEn: bannerForm.titleEn,
      subTh: bannerForm.subTh,
      subEn: bannerForm.subEn,
      descTh: bannerForm.descTh,
      descEn: bannerForm.descEn,
      image: bannerForm.image,
      bgClass: bannerForm.bgClass,
      onlyImage: bannerForm.onlyImage,
      linkType: bannerForm.linkType,
      externalUrl: bannerForm.externalUrl
    };

    setSaving(true);
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, payload);
        showToast('อัปเดตสไลด์แบนเนอร์เรียบร้อยแล้ว');
      } else {
        await api.createBanner(payload as any);
        showToast('เพิ่มสไลด์แบนเนอร์ใหม่เรียบร้อยแล้ว');
      }
      setIsBannerModalOpen(false);
      await fetchBanners();
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการบันทึกแบนเนอร์: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = (banner: BannerItem) => {
    setDeleteConfirmBanner(banner);
  };

  const confirmDeleteBanner = async () => {
    if (!deleteConfirmBanner) return;
    const target = deleteConfirmBanner;
    setIsDeletingBanner(true);

    try {
      await api.deleteBanner(target.id);
      showToast(`ลบสไลด์แบนเนอร์เรียบร้อยแล้ว`);
      await fetchBanners();
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการลบแบนเนอร์: ' + err.message, 'error');
    } finally {
      setIsDeletingBanner(false);
      setDeleteConfirmBanner(null);
    }
  };

  const filteredSections = sections.filter(sec => 
    sec.titleTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sec.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl border text-sm font-semibold flex items-center space-x-2 animate-bounce ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-mcu-pink-deep via-mcu-pink to-mcu-pink-deep rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sliders size={14} />
            <span>Homepage Builder & Banner Slider CMS</span>
          </div>
          <h2 className="text-2xl font-bold">ระบบจัดการหน้าแรกและสไลด์แบนเนอร์ (Homepage CMS)</h2>
          <p className="text-sm opacity-90 font-light mt-1">
            เพิ่ม แก้ไข ลบ สไลด์แบนเนอร์ประชาสัมพันธ์ พร้อมปรับเลือกภาพที่มีข้อความในตัวภาพ หรือแบบตัวหนังสือทับซ้อน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('banners')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'banners' ? 'bg-mcu-gold text-mcu-pink-deep shadow-md font-extrabold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ImageIcon size={16} />
            <span>จัดการสไลด์แบนเนอร์ ({banners.length})</span>
          </button>
          <button
            onClick={() => setActiveMainTab('layout')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'layout' ? 'bg-mcu-gold text-mcu-pink-deep shadow-md font-extrabold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Layout size={16} />
            <span>จัดโครงสร้างหน้าแรก ({sections.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BANNERS & SLIDER CMS */}
      {activeMainTab === 'banners' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="text-mcu-pink" size={20} />
                <span>รายการภาพสไลด์แบนเนอร์ประชาสัมพันธ์หน้าแรก</span>
              </h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                รองรับทั้งภาพแบนเนอร์สำเร็จรูป (Graphic Banner) และแบนเนอร์สไลด์ตัวหนังสือ
              </p>
            </div>

            <button
              onClick={() => handleOpenBannerModal()}
              className="px-5 py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2 shrink-0"
            >
              <Plus size={16} />
              <span>เพิ่มสไลด์แบนเนอร์ใหม่</span>
            </button>
          </div>

          {loadingBanners ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-mcu-pink border-t-transparent mb-3"></div>
              <p className="text-sm text-slate-500 font-medium">กำลังโหลดรายการสไลด์แบนเนอร์...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((slide, index) => (
                <div
                  key={slide.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={getEmbeddableDriveUrl(slide.image)}
                        alt={slide.titleTh || 'Slide Banner'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20">
                          ลำดับที่ {index + 1}
                        </span>
                        {slide.onlyImage ? (
                          <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            🖼️ ภาพสำเร็จรูป (Graphic)
                          </span>
                        ) : (
                          <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            📝 ข้อความ Overlaid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Banner Slide Info */}
                    <div className="p-5 space-y-2">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                        {slide.onlyImage ? (slide.titleTh || 'ภาพแบนเนอร์ประชาสัมพันธ์ (ไม่มีตัวหนังสือทับ)') : (slide.titleTh || 'สไลด์แบนเนอร์ข้อความ')}
                      </h4>
                      {slide.subTh && <p className="text-xs text-amber-700 font-semibold">{slide.subTh}</p>}
                      {slide.descTh && <p className="text-xs text-slate-500 font-light line-clamp-2">{slide.descTh}</p>}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
                    <span className="text-[11px] text-slate-400">
                      ปุ่มกด: <strong className="text-slate-700">{slide.linkType}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenBannerModal(slide)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-mcu-pink-soft text-slate-700 hover:text-mcu-pink-deep rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 size={14} />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(slide)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOMEPAGE LAYOUT BUILDER */}
      {activeMainTab === 'layout' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="ค้นหาชื่อส่วนประกอบ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-mcu-pink outline-hidden"
              />
            </div>
          </div>

          {loadingSections ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-mcu-pink border-t-transparent mb-3"></div>
              <p className="text-sm text-gray-500 font-medium">กำลังโหลดโครงสร้างหน้าแรก...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSections.map((sec, index) => (
                <div 
                  key={sec.id}
                  className={`bg-white p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    sec.isVisible ? 'border-gray-200 hover:border-mcu-pink/50 shadow-xs' : 'border-gray-100 bg-slate-50/70 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-grow">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                      sec.isVisible ? 'bg-mcu-pink-soft text-mcu-pink-deep' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {sec.order}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-800 text-base truncate">{sec.titleTh}</h4>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          key: {sec.key}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{sec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button 
                        onClick={() => handleMoveSection(index, 'up')}
                        disabled={index === 0 || saving}
                        className="p-1.5 text-gray-600 hover:text-mcu-pink hover:bg-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        onClick={() => handleMoveSection(index, 'down')}
                        disabled={index === sections.length - 1 || saving}
                        className="p-1.5 text-gray-600 hover:text-mcu-pink hover:bg-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                        title="เลื่อนลง"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleOpenEditSection(sec)}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-mcu-pink-soft text-slate-700 hover:text-mcu-pink-deep font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-slate-200"
                    >
                      <Edit3 size={14} />
                      <span>ตั้งค่าเนื้อหา</span>
                    </button>

                    <button 
                      onClick={() => handleToggleVisibility(sec)}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sec.isVisible ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {sec.isVisible ? (
                        <>
                          <Eye size={14} />
                          <span>แสดงผล</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} />
                          <span>ซ่อนอยู่</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT BANNER MODAL */}
      {isBannerModalOpen && (
        <Modal
          isOpen={isBannerModalOpen}
          onClose={() => setIsBannerModalOpen(false)}
          title={editingBanner ? 'แก้ไขสไลด์แบนเนอร์ประชาสัมพันธ์' : 'เพิ่มสไลด์แบนเนอร์ประชาสัมพันธ์ใหม่'}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="banner-form"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-mcu-pink hover:from-amber-700 hover:via-rose-700 hover:to-mcu-pink-deep text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save size={16} />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกสไลด์แบนเนอร์'}</span>
              </button>
            </div>
          }
        >
          <form id="banner-form" onSubmit={handleSaveBanner} className="space-y-4 py-2 text-xs">
            {/* Banner Mode Toggle */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-bold text-purple-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-purple-600" />
                  <span>ภาพแบนเนอร์สำเร็จรูป (Graphic Banner ที่มีข้อความในภาพอยู่แล้ว)</span>
                </span>
                <input
                  type="checkbox"
                  checked={bannerForm.onlyImage}
                  onChange={(e) => setBannerForm({ ...bannerForm, onlyImage: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-purple-700 font-light">
                * หากเลือกตัวเลือกนี้ ระบบจะ **ซ่อนข้อความตัวหนังสือ overlay บนสไลด์** เพื่อป้องกันไม่ให้ข้อความตัวหนังสือทับซ้อนกับข้อความภาพกราฟิก!
              </p>
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">URL ภาพสไลด์แบนเนอร์ *</label>
              <input
                type="url"
                required
                value={bannerForm.image}
                onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                placeholder="https://images.unsplash.com/... หรือ Google Drive Direct Link"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-mcu-pink outline-hidden"
              />
            </div>

            {/* Text Overlay fields (Disabled/Hidden visually if onlyImage is checked) */}
            {!bannerForm.onlyImage && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">หัวข้อแบนเนอร์ (ภาษาไทย)</label>
                    <input
                      type="text"
                      value={bannerForm.titleTh}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleTh: e.target.value })}
                      placeholder="เช่น ยินดีต้อนรับสู่วิทยาลัยสงฆ์พ่อขุนผาเมือง"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">หัวข้อแบนเนอร์ (English)</label>
                    <input
                      type="text"
                      value={bannerForm.titleEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleEn: e.target.value })}
                      placeholder="Welcome to Phokhun Phamuang Buddhist College"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">ข้อความย่อย / Badge (ภาษาไทย)</label>
                    <input
                      type="text"
                      value={bannerForm.subTh}
                      onChange={(e) => setBannerForm({ ...bannerForm, subTh: e.target.value })}
                      placeholder="มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">ข้อความย่อย (English)</label>
                    <input
                      type="text"
                      value={bannerForm.subEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, subEn: e.target.value })}
                      placeholder="Mahachulalongkornrajavidyalaya University"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">คำอธิบายรายละเอียด (ภาษาไทย)</label>
                  <textarea
                    rows={2}
                    value={bannerForm.descTh}
                    onChange={(e) => setBannerForm({ ...bannerForm, descTh: e.target.value })}
                    placeholder="สถาบันอุดมศึกษาพระพุทธศาสนาชั้นนำของไทย มุ่งเน้นสร้างศาสนทายาท..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Link Type Button Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">การนำทางปุ่มกด (Link Action)</label>
                <select
                  value={bannerForm.linkType}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="none">ไม่มีปุ่มกด</option>
                  <option value="viewDetails">ดูรายละเอียดหลักสูตร (#courses)</option>
                  <option value="applyNow">สมัครเรียนออนไลน์ (#admission)</option>
                  <option value="external">เปิดลิงก์ภายนอก (External URL)</option>
                </select>
              </div>

              {bannerForm.linkType === 'external' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">URL ลิงก์ภายนอก</label>
                  <input
                    type="url"
                    value={bannerForm.externalUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, externalUrl: e.target.value })}
                    placeholder="https://www.mcu.ac.th"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE BANNER CONFIRMATION MODAL */}
      {deleteConfirmBanner && (
        <Modal
          isOpen={!!deleteConfirmBanner}
          onClose={() => setDeleteConfirmBanner(null)}
          title="ยืนยันการลบสไลด์แบนเนอร์"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmBanner(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteBanner}
                disabled={isDeletingBanner}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingBanner ? 'กำลังลบ...' : 'ยืนยันการลบแบนเนอร์'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบสไลด์แบนเนอร์ประชาสัมพันธ์นี้?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmBanner.titleTh || deleteConfirmBanner.id}"
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
