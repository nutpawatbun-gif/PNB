/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { downloadsStore } from '../../data/downloadsStore';
import { api } from '../../lib/api';
import { DownloadableFile, DocumentCategory } from '../../types';
import LucideIcon from '../LucideIcon';

interface DownloadsPageProps {
  lang: 'th' | 'en';
  activeCategory?: string;
}

export default function DownloadsPage({ lang, activeCategory = 'all' }: DownloadsPageProps) {
  const [downloads, setDownloads] = useState<DownloadableFile[]>(() => downloadsStore.getDownloads());
  const [categories, setCategories] = useState<DocumentCategory[]>(() => downloadsStore.getCategories());
  const [selectedCatId, setSelectedCatId] = useState<string>(activeCategory || 'all');

  useEffect(() => {
    if (activeCategory) {
      if (activeCategory === 'students') setSelectedCatId('cat_students');
      else if (activeCategory === 'staff') setSelectedCatId('cat_staff');
      else if (activeCategory === 'regulations') setSelectedCatId('cat_regulations');
      else setSelectedCatId(activeCategory);
    }
  }, [activeCategory]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDownloadsData = async () => {
    try {
      const data = await api.getDownloads();
      if (Array.isArray(data)) {
        setDownloads(data);
      } else {
        setDownloads(downloadsStore.getDownloads());
      }
    } catch (e) {
      setDownloads(downloadsStore.getDownloads());
    }
  };

  useEffect(() => {
    fetchDownloadsData();
    const unsub = downloadsStore.subscribe(() => {
      fetchDownloadsData();
      setCategories(downloadsStore.getCategories());
    });
    return unsub;
  }, []);

  const isDocExpired = (doc: DownloadableFile) => {
    if (!doc.expiryDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return doc.expiryDate < today;
  };

  const filteredDownloads = downloads.filter((doc) => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = doc.name.toLowerCase().includes(q);
      const matchDesc = doc.description?.toLowerCase().includes(q) || false;
      const matchDept = doc.ownerDepartment?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc && !matchDept) return false;
    }

    // Category filter
    if (selectedCatId !== 'all') {
      if (selectedCatId === 'legacy_student' && (doc.category === 'student' || doc.categoryId === 'cat_student_forms')) {
        // match
      } else if (doc.categoryId !== selectedCatId) {
        return false;
      }
    }

    // Format filter
    if (selectedFormat !== 'all') {
      if (selectedFormat === 'PDF' && doc.format.toUpperCase() !== 'PDF') return false;
      if (selectedFormat === 'DOC' && !['DOC', 'DOCX'].includes(doc.format.toUpperCase())) return false;
      if (selectedFormat === 'XLS' && !['XLS', 'XLSX'].includes(doc.format.toUpperCase())) return false;
      if (selectedFormat === 'PPT' && !['PPT', 'PPTX'].includes(doc.format.toUpperCase())) return false;
      if (selectedFormat === 'ZIP' && doc.format.toUpperCase() !== 'ZIP') return false;
      if (selectedFormat === 'IMAGE' && !['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(doc.format.toUpperCase())) return false;
    }

    return true;
  });

  const t = {
    title: lang === 'th' ? 'คลังเอกสารและแบบฟอร์มดาวน์โหลด' : 'Document Download Repository',
    sub: lang === 'th' ? 'บริการรวบรวมแบบฟอร์มคำร้อง คู่มือการศึกษา ประกาศ มคอ.3-มคอ.7 และสื่อประชาสัมพันธ์อย่างเป็นทางการ' : 'Central download portal for student petitions, academic handbooks, regulations, and official publications.',
    allCats: lang === 'th' ? 'หมวดหมู่ทั้งหมด' : 'All Categories',
    searchPlaceholder: lang === 'th' ? 'ค้นหาชื่อแบบฟอร์ม, คำอธิบาย หรือหน่วยงาน...' : 'Search document title, description, or department...',
    allFormats: lang === 'th' ? 'ไฟล์ทุกประเภท' : 'All File Formats',
    downloadBtn: lang === 'th' ? 'ดาวน์โหลดเอกสาร' : 'Download File',
    downloading: lang === 'th' ? 'กำลังเตรียมไฟล์...' : 'Preparing download...',
    versionLabel: lang === 'th' ? 'เวอร์ชัน' : 'Version',
    downloadsCount: lang === 'th' ? 'ยอดดาวน์โหลด' : 'Downloads',
    ownerDept: lang === 'th' ? 'หน่วยงาน' : 'Department',
    expiredWarning: lang === 'th' ? 'เอกสารนี้หมดอายุแล้ว' : 'Document expired',
    emptyResult: lang === 'th' ? 'ไม่พบไฟล์เอกสารตามเงื่อนไขที่ค้นหา' : 'No documents found matching criteria.'
  };

  const getFormatBadgeStyle = (format: string) => {
    const fmt = format.toUpperCase();
    if (fmt === 'PDF') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (['DOC', 'DOCX'].includes(fmt)) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (['XLS', 'XLSX'].includes(fmt)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (['PPT', 'PPTX'].includes(fmt)) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (fmt === 'ZIP') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-teal-100 text-teal-700 border-teal-200';
  };

  const handleDownloadTrigger = (doc: DownloadableFile) => {
    if (isDocExpired(doc)) {
      triggerToast(lang === 'th' ? 'เอกสารนี้พ้นกำหนดระยะเวลาการใช้งานแล้ว' : 'This document has passed its expiration date.', 'error');
      return;
    }

    const targetUrl = doc.url || (doc as any).fileUrl;
    if (!targetUrl || targetUrl === '#') {
      triggerToast(lang === 'th' ? 'ไม่พบลิงก์ที่อยู่ไฟล์ดาวน์โหลดในระบบ' : 'Download file URL not found.', 'error');
      return;
    }

    setDownloadingId(doc.id);
    
    // Increment download count in store & API
    downloadsStore.incrementDownloadCount(doc.id);
    api.incrementDownload(doc.id).catch(() => {});

    // Trigger download / open link immediately inside user gesture context (prevents pop-up blocker)
    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const fileExt = (doc.format || 'pdf').toLowerCase();
      const safeName = doc.name ? `${doc.name.replace(/[^\w\s-ก-๙]/g, '_')}.${fileExt}` : `document.${fileExt}`;
      link.setAttribute('download', safeName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(targetUrl, '_blank');
    }

    triggerToast(
      lang === 'th' 
        ? `กำลังส่งคำขอดาวน์โหลดไฟล์ "${doc.name}" (เวอร์ชัน ${doc.version || 'v1.0'})` 
        : `Downloading "${doc.name}" (${doc.version || 'v1.0'})`
    );

    setTimeout(() => {
      setDownloadingId(null);
    }, 600);
  };

  const [previewDoc, setPreviewDoc] = useState<DownloadableFile | null>(null);

  const canPreview = (doc: DownloadableFile) => {
    if (!doc.url || doc.url === '#') return false;
    const fmt = doc.format.toUpperCase();
    return ['PDF', 'PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(fmt) || doc.url.includes('.pdf') || doc.url.includes('/uploads/');
  };

  return (
    <div className="bg-slate-50/60 min-h-screen py-10 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-mcu-pink-deep via-mcu-pink-dark to-slate-900 text-white rounded-3xl p-8 sm:p-12 border-b-4 border-mcu-gold relative overflow-hidden shadow-xl">
          <div className="absolute -right-12 -bottom-12 opacity-10 text-white pointer-events-none">
            <LucideIcon name="DownloadCloud" size={280} />
          </div>
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs text-mcu-gold-light border border-white/15">
              <LucideIcon name="ShieldCheck" size={14} />
              <span>ระบบคลังเอกสารทางการ มหาจุฬาฯ เพชรบูรณ์</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{t.title}</h1>
            <p className="text-xs sm:text-base text-mcu-pink-soft/90 font-light leading-relaxed">{t.sub}</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-3 relative">
              <LucideIcon name="Search" size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-gray-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <LucideIcon name="X" size={16} />
                </button>
              )}
            </div>

            {/* Format Filter */}
            <div>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-gray-50/50 font-medium"
              >
                <option value="all">{t.allFormats}</option>
                <option value="PDF">PDF (.pdf)</option>
                <option value="DOC">Word (.doc, .docx)</option>
                <option value="XLS">Excel (.xls, .xlsx)</option>
                <option value="PPT">PowerPoint (.ppt, .pptx)</option>
                <option value="ZIP">ZIP Archives (.zip)</option>
                <option value="IMAGE">รูปภาพ / สื่อ (.png, .jpg, .svg)</option>
              </select>
            </div>
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-2 scrollbar-none border-t border-gray-100">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                selectedCatId === 'all'
                  ? 'bg-mcu-pink text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LucideIcon name="Layers" size={14} />
              <span>{t.allCats} ({downloads.length})</span>
            </button>

            {categories.map((cat) => {
              const catCount = downloads.filter(d => d.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedCatId === cat.id
                      ? 'bg-mcu-pink text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <LucideIcon name={cat.iconName || 'Folder'} size={14} />
                  <span>{lang === 'th' ? cat.nameTh : (cat.nameEn || cat.nameTh)} ({catCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Documents Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDownloads.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
              <LucideIcon name="FileX" size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-medium text-sm">{t.emptyResult}</p>
            </div>
          ) : (
            filteredDownloads.map((doc) => {
              const expired = isDocExpired(doc);
              const formatStyle = getFormatBadgeStyle(doc.format);

              return (
                <div 
                  key={doc.id}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${
                    expired ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-gray-200/90 hover:border-mcu-pink/60'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {/* Format Badge */}
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${formatStyle}`}>
                          {doc.format}
                        </span>

                        {/* Version Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-100 font-mono">
                          {doc.version || 'v1.0'}
                        </span>
                      </div>

                      {/* Expiry Warning or Permission */}
                      {expired ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          <LucideIcon name="AlertTriangle" size={12} />
                          <span>{t.expiredWarning}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono">
                          ขนาด: <strong className="text-gray-700 font-bold">{doc.size || 'N/A'}</strong>
                        </span>
                      )}
                    </div>

                    {/* Document Name & Description */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-mcu-pink-deep transition-colors">
                        {doc.name}
                      </h3>
                      {doc.description && (
                        <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Footer & Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-[11px] text-gray-500">
                    <div className="space-y-0.5">
                      <p className="text-gray-600 font-medium truncate max-w-[150px]">
                        {t.ownerDept}: <strong className="text-gray-800">{doc.ownerDepartment || 'วิทยาลัยสงฆ์'}</strong>
                      </p>
                      <div className="flex items-center space-x-3 text-gray-400 text-[10px]">
                        <span>ดาวน์โหลด: <strong className="text-mcu-pink-deep font-bold font-mono">{(doc.downloadCount || 0).toLocaleString()}</strong> ครั้ง</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canPreview(doc) && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1"
                          title="เปิดดูตัวอย่างไฟล์"
                        >
                          <LucideIcon name="Eye" size={13} />
                          <span className="hidden sm:inline">ตัวอย่าง</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadTrigger(doc)}
                        disabled={downloadingId !== null || expired}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm ${
                          expired 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-mcu-pink hover:bg-mcu-pink-dark text-white active:scale-95'
                        }`}
                      >
                        <LucideIcon 
                          name={downloadingId === doc.id ? "Loader" : "Download"} 
                          size={14} 
                          className={downloadingId === doc.id ? 'animate-spin' : ''} 
                        />
                        <span>{downloadingId === doc.id ? t.downloading : t.downloadBtn}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Document Live Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2 truncate">
                <LucideIcon name="FileText" size={18} className="text-mcu-pink" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                  ตัวอย่างเอกสาร: {previewDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <LucideIcon name="X" size={20} />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 min-h-[400px] overflow-auto flex items-center justify-center">
              {['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(previewDoc.format.toUpperCase()) ? (
                <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md" />
              ) : (
                <iframe src={previewDoc.url} title={previewDoc.name} className="w-full h-[65vh] rounded-lg border-0 bg-white" />
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-500 font-mono">
                ขนาดไฟล์: {previewDoc.size} | เวอร์ชัน: {previewDoc.version || 'v1.0'}
              </span>
              <button
                onClick={() => {
                  handleDownloadTrigger(previewDoc);
                  setPreviewDoc(null);
                }}
                className="px-5 py-2 bg-mcu-pink hover:bg-mcu-pink-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all"
              >
                <LucideIcon name="Download" size={14} />
                <span>ดาวน์โหลดเอกสารนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white font-sans text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-white/10 animate-slide-up">
          <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`}></span>
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
