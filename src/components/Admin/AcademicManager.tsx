/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LucideIcon from '../LucideIcon';
import { AcademicWork, AcademicCategory } from '../../types';
import { api } from '../../lib/api';
import { academicStore } from '../../data/academicStore';
import { Modal } from '../ui/Modal';

export const CATEGORY_CONFIG: Record<AcademicCategory, { label: string; icon: string; color: string; bg: string }> = {
  research: { label: 'งานวิจัย', icon: 'Microscope', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
  research_article: { label: 'บทความวิจัย', icon: 'FileText', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' },
  academic_article: { label: 'บทความวิชาการ', icon: 'BookOpen', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
  book: { label: 'หนังสือ', icon: 'Book', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
  textbook: { label: 'ตำรา', icon: 'Bookmark', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800' },
  teaching_material: { label: 'เอกสารประกอบการสอน', icon: 'FileCheck', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
  lecture_notes: { label: 'เอกสารคำสอน', icon: 'NotebookPen', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800' },
  research_report: { label: 'รายงานวิจัย', icon: 'ClipboardList', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800' },
  innovation: { label: 'ผลงานนวัตกรรม', icon: 'Lightbulb', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800' },
  academic_service: { label: 'ผลงานบริการวิชาการ', icon: 'Users', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800' },
  culture_preservation: { label: 'ผลงานทำนุบำรุงศิลปวัฒนธรรม', icon: 'Flower2', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800' },
};

const STATUS_CONFIG: Record<'published' | 'draft' | 'archived', { label: string; bg: string }> = {
  published: { label: 'เผยแพร่แล้ว', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  draft: { label: 'ร่าง / รอตรวจ', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  archived: { label: 'จัดเก็บ / ซ่อน', bg: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700' },
};

export default function AcademicManager() {
  const [works, setWorks] = useState<AcademicWork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWork, setEditingWork] = useState<AcademicWork | null>(null);
  const [modalTab, setModalTab] = useState<'basic' | 'authors' | 'publication' | 'files'>('basic');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Preview Modal
  const [previewWork, setPreviewWork] = useState<AcademicWork | null>(null);

  // Delete Confirm Modal State
  const [deleteConfirmWork, setDeleteConfirmWork] = useState<AcademicWork | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Partial<AcademicWork>>({
    titleTh: '',
    titleEn: '',
    category: 'research',
    publicationYear: String(new Date().getFullYear() + 543),
    authors: '',
    projectLeader: '',
    coResearchers: '',
    publisherOrSource: '',
    doi: '',
    url: '',
    abstract: '',
    keywords: '',
    fileUrl: '',
    coverImageUrl: '',
    status: 'published'
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const res = await api.getAcademicWorks();
      if (Array.isArray(res) && res.length > 0) {
        const normalized = res.map((item: any) => ({
          id: item.id || 'ac_' + Math.random().toString(36).substring(2, 9),
          titleTh: item.titleTh || item.title || '',
          titleEn: item.titleEn || '',
          category: (item.category as AcademicCategory) || 'research',
          publicationYear: item.publicationYear || item.year || String(new Date().getFullYear() + 543),
          authors: item.authors || item.authorTh || '',
          projectLeader: item.projectLeader || '',
          coResearchers: item.coResearchers || item.coAuthors || '',
          publisherOrSource: item.publisherOrSource || item.journalName || item.publisher || item.fundingSource || '',
          doi: item.doi || (item.doiOrUrl && item.doiOrUrl.includes('doi') ? item.doiOrUrl : ''),
          url: item.url || (item.doiOrUrl && !item.doiOrUrl.includes('doi') ? item.doiOrUrl : ''),
          abstract: item.abstract || '',
          keywords: item.keywords || '',
          fileUrl: item.fileUrl || item.attachmentUrl || '',
          coverImageUrl: item.coverImageUrl || item.imageUrl || '',
          status: item.status || (item.isPublished !== false ? 'published' : 'draft'),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        }));
        setWorks(normalized);
      } else {
        setWorks(academicStore.getWorks());
      }
    } catch (err) {
      console.error('Error fetching academic works:', err);
      setWorks(academicStore.getWorks());
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingWork(null);
    setFormData({
      titleTh: '',
      titleEn: '',
      category: 'research',
      publicationYear: String(new Date().getFullYear() + 543),
      authors: '',
      projectLeader: '',
      coResearchers: '',
      publisherOrSource: '',
      doi: '',
      url: '',
      abstract: '',
      keywords: '',
      fileUrl: '',
      coverImageUrl: '',
      status: 'published'
    });
    setModalTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (work: AcademicWork) => {
    setEditingWork(work);
    setFormData({
      ...work
    });
    setModalTab('basic');
    setIsModalOpen(true);
  };

  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleTh?.trim()) {
      showToast('error', 'กรุณาระบุชื่อผลงานภาษาไทย');
      setModalTab('basic');
      return;
    }
    if (!formData.authors?.trim()) {
      showToast('error', 'กรุณาระบุผู้แต่งหรือผู้วิจัย');
      setModalTab('authors');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<AcademicWork> = {
        ...formData,
        authorTh: formData.authors,
        year: formData.publicationYear,
        isPublished: formData.status === 'published',
        attachmentUrl: formData.fileUrl,
        imageUrl: formData.coverImageUrl,
        doiOrUrl: formData.doi || formData.url
      };

      if (editingWork) {
        await api.updateAcademicWork(editingWork.id, payload);
        academicStore.updateWork(editingWork.id, payload);
        showToast('success', 'ปรับปรุงข้อมูลผลงานวิชาการเรียบร้อยแล้ว');
      } else {
        const created = await api.createAcademicWork(payload);
        academicStore.addWork(created || (payload as AcademicWork));
        showToast('success', 'เพิ่มผลงานวิชาการใหม่เรียบร้อยแล้ว');
      }
      setIsModalOpen(false);
      fetchWorks();
    } catch (err) {
      console.error('Error saving academic work:', err);
      showToast('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWork = (work: AcademicWork) => {
    setDeleteConfirmWork(work);
  };

  const confirmDeleteWork = async () => {
    if (!deleteConfirmWork) return;
    const targetWork = deleteConfirmWork;
    setIsDeleting(true);

    // Immediate local removal
    setWorks(prev => prev.filter(w => w.id !== targetWork.id));
    academicStore.deleteWork(targetWork.id);
    showToast('success', 'ลบผลงานวิชาการเรียบร้อยแล้ว');

    try {
      await api.deleteAcademicWork(targetWork.id);
    } catch (err) {
      console.error('Error deleting work via API:', err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmWork(null);
      fetchWorks();
    }
  };

  const handleToggleStatus = async (work: AcademicWork) => {
    const nextStatus = work.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateAcademicWork(work.id, { status: nextStatus, isPublished: nextStatus === 'published' });
      showToast('success', `เปลี่ยนสถานะเป็น ${STATUS_CONFIG[nextStatus].label}`);
      setWorks(works.map(w => w.id === work.id ? { ...w, status: nextStatus } : w));
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('error', 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  // Filtered list
  const filteredWorks = works.filter(w => {
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || w.status === selectedStatus;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      w.titleTh?.toLowerCase().includes(term) ||
      w.titleEn?.toLowerCase().includes(term) ||
      w.authors?.toLowerCase().includes(term) ||
      w.projectLeader?.toLowerCase().includes(term) ||
      w.publisherOrSource?.toLowerCase().includes(term) ||
      w.keywords?.toLowerCase().includes(term) ||
      w.publicationYear?.includes(term);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Statistics
  const totalCount = works.length;
  const publishedCount = works.filter(w => w.status === 'published').length;
  const draftCount = works.filter(w => w.status === 'draft').length;
  const archivedCount = works.filter(w => w.status === 'archived').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 transition-all duration-300 border ${
          notification.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-rose-600 text-white border-rose-500'
        }`}>
          <LucideIcon name={notification.type === 'success' ? 'CheckCircle' : 'AlertCircle'} className="w-6 h-6 shrink-0" />
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-mcu-pink/10 text-mcu-pink rounded-xl">
                <LucideIcon name="GraduationCap" className="w-6 h-6" />
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                ระบบจัดการผลงานวิชาการ
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              จัดการงานวิจัย บทความวิชาการ หนังสือ ตำรา เอกสารคำสอน ผลงานนวัตกรรม และผลงานบริการวิชาการ
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchWorks}
              className="p-2.5 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition border border-gray-200 dark:border-zinc-700"
              title="รีเฟรชข้อมูล"
            >
              <LucideIcon name="RefreshCw" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-5 py-2.5 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-medium text-sm rounded-xl transition shadow-md hover:shadow-lg"
            >
              <LucideIcon name="Plus" className="w-5 h-5" />
              <span>เพิ่มผลงานวิชาการใหม่</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
            <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">ผลงานทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</div>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">เผยแพร่แล้ว</div>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{publishedCount}</div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40">
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">ร่าง / รอตรวจสอบ</div>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">{draftCount}</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
            <div className="text-xs text-purple-700 dark:text-purple-400 font-medium">หมวดหมู่ทั้งหมด</div>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-1">{Object.keys(CATEGORY_CONFIG).length} หมวด</div>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Category Selector Tabs */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2 block">
            กรองตามประเภทผลงาน (11 หมวด)
          </label>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                selectedCategory === 'all'
                  ? 'bg-mcu-pink text-white border-mcu-pink shadow-sm'
                  : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              ทั้งหมด ({works.length})
            </button>
            {(Object.keys(CATEGORY_CONFIG) as AcademicCategory[]).map(catKey => {
              const cat = CATEGORY_CONFIG[catKey];
              const count = works.filter(w => w.category === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                    selectedCategory === catKey
                      ? 'bg-mcu-pink text-white border-mcu-pink shadow-sm'
                      : `${cat.bg} ${cat.color} hover:opacity-90`
                  }`}
                >
                  <LucideIcon name={cat.icon} className="w-3.5 h-3.5" />
                  <span>{cat.label} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
          <div className="relative flex-1">
            <LucideIcon name="Search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อผลงาน, ชื่อผู้วิจัย/ผู้แต่ง, แหล่งเผยแพร่, DOI, คำสำคัญ..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <LucideIcon name="X" className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
            >
              <option value="all">ทุกสถานะการเผยแพร่</option>
              <option value="published">เผยแพร่แล้ว</option>
              <option value="draft">ร่าง / รอตรวจ</option>
              <option value="archived">จัดเก็บ / ซ่อน</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-white dark:bg-zinc-700 text-mcu-pink shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                }`}
                title="มุมมองตาราง"
              >
                <LucideIcon name="List" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-mcu-pink shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                }`}
                title="มุมมองการ์ด"
              >
                <LucideIcon name="LayoutGrid" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content List View */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
          <LucideIcon name="Loader2" className="w-8 h-8 animate-spin text-mcu-pink mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">กำลังโหลดรายการผลงานวิชาการ...</p>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
          <LucideIcon name="BookOpen" className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-zinc-200">ไม่พบรายการผลงานวิชาการ</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือล้างตัวกรอง'
              : 'เริ่มต้นสร้างคลังผลงานวิชาการด้วยการคลิก "เพิ่มผลงานวิชาการใหม่"'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-mcu-pink text-white rounded-xl text-xs font-medium hover:bg-mcu-pink-deep transition inline-flex items-center space-x-1.5"
          >
            <LucideIcon name="Plus" className="w-4 h-4" />
            <span>เพิ่มผลงานวิชาการ</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">ประเภท</th>
                  <th className="py-3.5 px-4">ชื่อผลงาน / ผู้เขียน</th>
                  <th className="py-3.5 px-4">แหล่งเผยแพร่ / ปี พ.ศ.</th>
                  <th className="py-3.5 px-4">ไฟล์ / ลิงก์</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                {filteredWorks.map((work) => {
                  const catConfig = CATEGORY_CONFIG[work.category] || CATEGORY_CONFIG.research;
                  const statusConfig = STATUS_CONFIG[work.status] || STATUS_CONFIG.published;
                  return (
                    <tr key={work.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition">
                      {/* Category Badge */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${catConfig.bg} ${catConfig.color}`}>
                          <LucideIcon name={catConfig.icon} className="w-3.5 h-3.5" />
                          <span>{catConfig.label}</span>
                        </span>
                      </td>

                      {/* Title & Author */}
                      <td className="py-4 px-4 align-top max-w-xs md:max-w-md">
                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-mcu-pink transition cursor-pointer" onClick={() => setPreviewWork(work)}>
                          {work.titleTh}
                        </div>
                        {work.titleEn && (
                          <div className="text-xs text-gray-500 dark:text-zinc-400 italic line-clamp-1 mt-0.5">
                            {work.titleEn}
                          </div>
                        )}
                        <div className="text-xs text-gray-600 dark:text-zinc-300 mt-1.5 flex items-center space-x-1">
                          <LucideIcon name="User" className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-800 dark:text-zinc-200">{work.authors}</span>
                          {work.projectLeader && (
                            <span className="text-xs text-mcu-pink font-normal ml-1">
                              (หัวหน้า: {work.projectLeader})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Source & Year */}
                      <td className="py-4 px-4 align-top text-xs text-gray-600 dark:text-zinc-300">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ปี พ.ศ. {work.publicationYear || '-'}
                        </div>
                        {work.publisherOrSource ? (
                          <div className="text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                            {work.publisherOrSource}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">- ไม่ได้ระบุ -</span>
                        )}
                      </td>

                      {/* File & DOI/URL */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {work.fileUrl ? (
                            <a
                              href={work.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                            >
                              <LucideIcon name="FileText" className="w-3.5 h-3.5" />
                              <span>เอกสารฉบับเต็ม</span>
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 italic">ไม่มีไฟล์</span>
                          )}

                          {work.doi && (
                            <a
                              href={`https://doi.org/${work.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <LucideIcon name="Link2" className="w-3 h-3" />
                              <span>DOI: {work.doi}</span>
                            </a>
                          )}

                          {work.url && !work.doi && (
                            <a
                              href={work.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-xs text-mcu-pink hover:underline"
                            >
                              <LucideIcon name="ExternalLink" className="w-3 h-3" />
                              <span>เข้าชมเว็บไซต์</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status Button */}
                      <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(work)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${statusConfig.bg}`}
                          title="คลิกเพื่อสลับสถานะ"
                        >
                          {statusConfig.label}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setPreviewWork(work)}
                            className="p-1.5 text-gray-500 hover:text-mcu-pink hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                            title="ดูรายละเอียด"
                          >
                            <LucideIcon name="Eye" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(work)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                            title="แก้ไขข้อมูล"
                          >
                            <LucideIcon name="Edit3" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWork(work)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                            title="ลบผลงาน"
                          >
                            <LucideIcon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorks.map((work) => {
            const catConfig = CATEGORY_CONFIG[work.category] || CATEGORY_CONFIG.research;
            const statusConfig = STATUS_CONFIG[work.status] || STATUS_CONFIG.published;
            return (
              <div
                key={work.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${catConfig.bg} ${catConfig.color}`}>
                      <LucideIcon name={catConfig.icon} className="w-3.5 h-3.5" />
                      <span>{catConfig.label}</span>
                    </span>
                    <button
                      onClick={() => handleToggleStatus(work)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg}`}
                    >
                      {statusConfig.label}
                    </button>
                  </div>

                  <h3
                    onClick={() => setPreviewWork(work)}
                    className="font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-mcu-pink transition cursor-pointer mb-1 text-base"
                  >
                    {work.titleTh}
                  </h3>
                  {work.titleEn && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 italic line-clamp-1 mb-2">
                      {work.titleEn}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-zinc-300 my-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center space-x-1.5">
                      <LucideIcon name="User" className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800 dark:text-zinc-200">{work.authors}</span>
                    </div>
                    {work.publisherOrSource && (
                      <div className="flex items-start space-x-1.5">
                        <LucideIcon name="BookOpen" className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{work.publisherOrSource} ({work.publicationYear})</span>
                      </div>
                    )}
                    {work.keywords && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {work.keywords.split(',').slice(0, 3).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-[10px] rounded-md">
                            #{kw.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {work.fileUrl && (
                      <a
                        href={work.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition"
                        title="ดาวน์โหลดไฟล์"
                      >
                        <LucideIcon name="Download" className="w-4 h-4" />
                      </a>
                    )}
                    {(work.doi || work.url) && (
                      <a
                        href={work.doi ? `https://doi.org/${work.doi}` : work.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition"
                        title="เปิดลิงก์"
                      >
                        <LucideIcon name="ExternalLink" className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewWork(work)}
                      className="p-2 text-gray-500 hover:text-mcu-pink hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                      title="ดูรายละเอียด"
                    >
                      <LucideIcon name="Eye" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(work)}
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                      title="แก้ไข"
                    >
                      <LucideIcon name="Edit3" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWork(work)}
                      className="p-2 text-gray-500 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                      title="ลบ"
                    >
                      <LucideIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/30">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-mcu-pink/10 text-mcu-pink rounded-xl">
                  <LucideIcon name={editingWork ? "Edit3" : "Plus"} className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {editingWork ? 'แก้ไขข้อมูลผลงานวิชาการ' : 'เพิ่มผลงานวิชาการใหม่'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มมร/มจร
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                <LucideIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50 px-5 pt-2">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
                  modalTab === 'basic'
                    ? 'border-mcu-pink text-mcu-pink'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="BookOpen" className="w-4 h-4" />
                <span>1. ข้อมูลหลักผลงาน</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('authors')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
                  modalTab === 'authors'
                    ? 'border-mcu-pink text-mcu-pink'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="Users" className="w-4 h-4" />
                <span>2. ผู้แต่ง / คณะผู้วิจัย</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('publication')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
                  modalTab === 'publication'
                    ? 'border-mcu-pink text-mcu-pink'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="Globe" className="w-4 h-4" />
                <span>3. แหล่งเผยแพร่ / ลิงก์</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('files')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
                  modalTab === 'files'
                    ? 'border-mcu-pink text-mcu-pink'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="Paperclip" className="w-4 h-4" />
                <span>4. ไฟล์ & ภาพปก</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveWork} className="flex-1 overflow-y-auto p-6 space-y-5">
              {modalTab === 'basic' && (
                <div className="space-y-4">
                  {/* Title Thai */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      ชื่อผลงานภาษาไทย <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titleTh || ''}
                      onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                      placeholder="เช่น การศึกษาวิเคราะห์การบูรณาการหลักพุทธธรรมเพื่อส่งเสริมความสามัคคี..."
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* Title English */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      ชื่อผลงานภาษาอังกฤษ
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn || ''}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="e.g. An Analytical Study of Integrating Buddhist Dhamma..."
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* Category & Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                        ประเภทผลงาน <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category || 'research'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as AcademicCategory })}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                      >
                        {(Object.keys(CATEGORY_CONFIG) as AcademicCategory[]).map(catKey => (
                          <option key={catKey} value={catKey}>
                            {CATEGORY_CONFIG[catKey].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                        ปีที่เผยแพร่ (พ.ศ.) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.publicationYear || ''}
                        onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                        placeholder="เช่น 2568"
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Abstract */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      บทคัดย่อ (Abstract)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.abstract || ''}
                      onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                      placeholder="สรุปความเป็นมา วัตถุประสงค์ วิธีการดำเนินงาน และผลการวิจัยโดยย่อ..."
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      คำสำคัญ (Keywords) - คั่นด้วยเครื่องหมายจุลภาค
                    </label>
                    <input
                      type="text"
                      value={formData.keywords || ''}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="เช่น พุทธธรรม, สังคหวัตถุ 4, เพชรบูรณ์"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      สถานะการเผยแพร่
                    </label>
                    <div className="flex items-center space-x-4">
                      {(['published', 'draft', 'archived'] as const).map(st => (
                        <label key={st} className="inline-flex items-center space-x-2 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            checked={formData.status === st}
                            onChange={() => setFormData({ ...formData, status: st })}
                            className="text-mcu-pink focus:ring-mcu-pink"
                          />
                          <span className="text-gray-800 dark:text-zinc-200">{STATUS_CONFIG[st].label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'authors' && (
                <div className="space-y-4">
                  {/* Primary Authors */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      ผู้แต่งหรือผู้วิจัยหลัก <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.authors || ''}
                      onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                      placeholder="เช่น พระครูศรีพัชโรทัย, ดร. / รศ.ดร.เกียรติศักดิ์ ประเสริฐยิ่ง"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* Project Leader */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      หัวหน้าโครงการ (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={formData.projectLeader || ''}
                      onChange={(e) => setFormData({ ...formData, projectLeader: e.target.value })}
                      placeholder="เช่น พระครูสังฆรักษ์วิเชียร"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* Co-Researchers */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      ผู้ร่วมโครงการ / คณะผู้ร่วมวิจัย
                    </label>
                    <textarea
                      rows={3}
                      value={formData.coResearchers || ''}
                      onChange={(e) => setFormData({ ...formData, coResearchers: e.target.value })}
                      placeholder="ระบุรายชื่อผู้ร่วมวิจัย คั่นด้วยเครื่องหมายจุลภาค"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>
                </div>
              )}

              {modalTab === 'publication' && (
                <div className="space-y-4">
                  {/* Publisher / Source */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      แหล่งเผยแพร่ / สำนักพิมพ์ / วารสาร / แหล่งทุน
                    </label>
                    <input
                      type="text"
                      value={formData.publisherOrSource || ''}
                      onChange={(e) => setFormData({ ...formData, publisherOrSource: e.target.value })}
                      placeholder="เช่น วารสารบัณฑิตศึกษามหาจุฬาปริทรรศน์ / สถาบันวิจัยพุทธศาสตร์ มจร"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* DOI */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Digital Object Identifier (DOI)
                    </label>
                    <input
                      type="text"
                      value={formData.doi || ''}
                      onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                      placeholder="เช่น 10.14456/mcu.2025.12"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      URL เว็บไซต์ผลงาน หรือลิงก์การเข้าถึง
                    </label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://so01.tci-thaijo.org/index.php/..."
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                  </div>
                </div>
              )}

              {modalTab === 'files' && (
                <div className="space-y-4">
                  {/* File Document URL */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      URL ลิงก์ไฟล์ผลงาน (PDF, DOCX, Google Drive)
                    </label>
                    <input
                      type="url"
                      value={formData.fileUrl || ''}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                      ระบุลิงก์ตรงไปยังไฟล์ PDF หรือ ลิงก์แชร์จาก Google Drive / Cloud
                    </p>
                  </div>

                  {/* Cover Image URL */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      URL รูปภาพปกผลงาน
                    </label>
                    <input
                      type="url"
                      value={formData.coverImageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink dark:text-white"
                    />
                    {formData.coverImageUrl && (
                      <div className="mt-2 w-32 h-44 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100">
                        <img src={formData.coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-mcu-pink hover:bg-mcu-pink-deep text-white text-xs font-semibold rounded-xl transition shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  {submitting && <LucideIcon name="Loader2" className="w-4 h-4 animate-spin" />}
                  <span>{editingWork ? 'บันทึกการแก้ไข' : 'เพิ่มผลงานวิชาการ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DETAIL MODAL */}
      {previewWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/30">
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium border ${CATEGORY_CONFIG[previewWork.category]?.bg} ${CATEGORY_CONFIG[previewWork.category]?.color}`}>
                <LucideIcon name={CATEGORY_CONFIG[previewWork.category]?.icon || 'BookOpen'} className="w-3.5 h-3.5" />
                <span>{CATEGORY_CONFIG[previewWork.category]?.label}</span>
              </span>
              <button
                onClick={() => setPreviewWork(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-xl transition"
              >
                <LucideIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
                {previewWork.titleTh}
              </h2>
              {previewWork.titleEn && (
                <p className="text-sm text-gray-500 dark:text-zinc-400 italic">
                  {previewWork.titleEn}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-gray-100 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-300">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white block">ผู้แต่ง/ผู้วิจัย:</span>
                  <span>{previewWork.authors}</span>
                </div>
                {previewWork.projectLeader && (
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">หัวหน้าโครงการ:</span>
                    <span>{previewWork.projectLeader}</span>
                  </div>
                )}
                {previewWork.coResearchers && (
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-gray-900 dark:text-white block">ผู้ร่วมโครงการ:</span>
                    <span>{previewWork.coResearchers}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white block">ปีที่เผยแพร่:</span>
                  <span>พ.ศ. {previewWork.publicationYear}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white block">แหล่งเผยแพร่:</span>
                  <span>{previewWork.publisherOrSource || '-'}</span>
                </div>
              </div>

              {previewWork.abstract && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-1">
                    บทคัดย่อ
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                    {previewWork.abstract}
                  </p>
                </div>
              )}

              {previewWork.keywords && (
                <div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block mb-1">คำสำคัญ:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewWork.keywords.split(',').map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-mcu-pink/10 text-mcu-pink text-xs rounded-lg font-medium">
                        #{kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="pt-3 flex flex-wrap gap-3">
                {previewWork.fileUrl && (
                  <a
                    href={previewWork.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition shadow-sm"
                  >
                    <LucideIcon name="Download" className="w-4 h-4" />
                    <span>เปิดอ่านเอกสารฉบับเต็ม</span>
                  </a>
                )}
                {previewWork.doi && (
                  <a
                    href={`https://doi.org/${previewWork.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition shadow-sm"
                  >
                    <LucideIcon name="ExternalLink" className="w-4 h-4" />
                    <span>ดู DOI: {previewWork.doi}</span>
                  </a>
                )}
                {previewWork.url && !previewWork.doi && (
                  <a
                    href={previewWork.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white rounded-xl text-xs font-medium transition shadow-sm"
                  >
                    <LucideIcon name="Globe" className="w-4 h-4" />
                    <span>เข้าชมเว็บไซต์ผลงาน</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmWork && (
        <Modal
          isOpen={!!deleteConfirmWork}
          onClose={() => setDeleteConfirmWork(null)}
          title="ยืนยันการลบผลงานทางวิชาการ"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmWork(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteWork}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <LucideIcon name="Trash2" className="w-4 h-4" />
                <span>{isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบผลงาน'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบผลงานทางวิชาการนี้? รายการวิจัยและไฟล์แนบจะถูกถอดออกจากระบบหลังบ้านและหน้าเว็บไซต์ทันที
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmWork.titleTh}"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
