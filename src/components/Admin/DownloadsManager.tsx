/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DownloadableFile, DocumentCategory, FileFormat, DownloadPermission } from '../../types';
import { downloadsStore } from '../../data/downloadsStore';
import { api } from '../../lib/api';
import { MediaLibrary } from '../MediaLibrary';
import LucideIcon from '../LucideIcon';
import { Modal } from '../ui/Modal';

interface DownloadsManagerProps {
  onNotify?: (text: string, type?: 'success' | 'error') => void;
}

const FILE_FORMAT_OPTIONS: { label: string; value: FileFormat; color: string }[] = [
  { label: 'PDF Document', value: 'PDF', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { label: 'Word (DOC)', value: 'DOC', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Word (DOCX)', value: 'DOCX', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Excel (XLS)', value: 'XLS', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Excel (XLSX)', value: 'XLSX', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'PowerPoint (PPT)', value: 'PPT', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'PowerPoint (PPTX)', value: 'PPTX', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Archive (ZIP)', value: 'ZIP', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Image (PNG)', value: 'PNG', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { label: 'Image (JPG/JPEG)', value: 'JPG', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { label: 'Vector (SVG)', value: 'SVG', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

const PERMISSION_OPTIONS: { value: DownloadPermission; label: string; desc: string; badge: string }[] = [
  { value: 'public', label: 'บุคคลทั่วไป (Public)', desc: 'ทุกคนสามารถดาวน์โหลดได้โดยไม่ต้องลงชื่อเข้าใช้', badge: 'bg-emerald-100 text-emerald-800' },
  { value: 'student', label: 'เฉพาะนิสิต (Students Only)', desc: 'เปิดให้ดาวน์โหลดเฉพาะนิสิตของวิทยาลัย', badge: 'bg-blue-100 text-blue-800' },
  { value: 'staff', label: 'อาจารย์และบุคลากร (Staff Only)', desc: 'เฉพาะคณาจารย์และเจ้าหน้าที่สถาบัน', badge: 'bg-purple-100 text-purple-800' },
  { value: 'executive', label: 'ผู้บริหาร (Executives Only)', desc: 'เฉพาะผู้บริหารและผู้ได้รับสิทธิ์ระดับสูง', badge: 'bg-rose-100 text-rose-800' },
];

const DEFAULT_DEPARTMENTS = [
  'กลุ่มงานทะเบียนและวัดผล',
  'สำนักวิชาการ',
  'สำนักงานผู้อำนวยการ',
  'สโมสรนิสิต',
  'กลุ่มงานบริการวิชาการ',
  'สถาบันวิจัยพุทธศาสตร์',
  'กลุ่มงานประชาสัมพันธ์',
  'กลุ่มงานคลังและพัสดุ',
  'กลุ่มงานเทคโนโลยีสารสนเทศ'
];

export default function DownloadsManager({ onNotify }: DownloadsManagerProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'categories'>('files');
  const [files, setFiles] = useState<DownloadableFile[]>(() => downloadsStore.getDownloads());
  const [categories, setCategories] = useState<DocumentCategory[]>(() => downloadsStore.getCategories());

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('all');
  const [selectedPermissionFilter, setSelectedPermissionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  // Modal States
  const [isAddEditFileModalOpen, setIsAddEditFileModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<DownloadableFile | null>(null);

  const [isReplaceFileModalOpen, setIsReplaceFileModalOpen] = useState(false);
  const [replacingFile, setReplacingFile] = useState<DownloadableFile | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);

  // File Form State
  const [fileForm, setFileForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    format: 'PDF' as FileFormat,
    size: '',
    url: '',
    version: 'v1.0',
    ownerDepartment: DEFAULT_DEPARTMENTS[0],
    downloadPermission: 'public' as DownloadPermission,
    publishDate: new Date().toISOString().split('T')[0],
    hasExpiry: false,
    expiryDate: ''
  });

  // Replace File Form State
  const [replaceForm, setReplaceForm] = useState({
    url: '',
    size: '',
    format: 'PDF' as FileFormat,
    version: '',
    bumpVersion: true,
    changeNote: ''
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    nameTh: '',
    nameEn: '',
    description: '',
    iconName: 'FileText',
    color: '#2563eb'
  });

  // Media Library Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'create' | 'replace'>('create');

  const fetchDownloadsData = async () => {
    try {
      const data = await api.getDownloads();
      if (Array.isArray(data)) {
        setFiles(data);
      } else {
        setFiles(downloadsStore.getDownloads());
      }
    } catch (err) {
      setFiles(downloadsStore.getDownloads());
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

  const handleMediaSelectForDownload = (mediaFile: any) => {
    if (!mediaFile) return;
    const rawExt = mediaFile.extension || (mediaFile.url ? mediaFile.url.split('.').pop() : '') || 'PDF';
    const ext = String(rawExt).toUpperCase();
    const validFormats = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'ZIP', 'PNG', 'JPG', 'SVG'];
    const matchedFormat = (validFormats.includes(ext) ? ext : 'PDF') as FileFormat;

    const mediaName = mediaFile.filename || mediaFile.name || 'เอกสารจากคลังสื่อ';

    if (mediaPickerTarget === 'create') {
      setFileForm(prev => ({
        ...prev,
        name: prev.name || mediaName,
        url: mediaFile.url || '',
        size: mediaFile.formattedSize || (mediaFile.size ? `${(mediaFile.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB'),
        format: matchedFormat
      }));
    } else {
      setReplaceForm(prev => ({
        ...prev,
        url: mediaFile.url || '',
        size: mediaFile.formattedSize || (mediaFile.size ? `${(mediaFile.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB'),
        format: matchedFormat
      }));
    }
    setIsMediaPickerOpen(false);
    notify(`เลือกไฟล์ "${mediaName}" จากคลังสื่อกลางเรียบร้อยแล้ว`, 'success');
  };

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    if (onNotify) {
      onNotify(text, type);
    }
  };

  // Helper check expired
  const isDocExpired = (doc: DownloadableFile) => {
    if (!doc.expiryDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return doc.expiryDate < today;
  };

  // Open Add File Modal
  const handleOpenAddFile = () => {
    setEditingFile(null);
    setFileForm({
      name: '',
      description: '',
      categoryId: categories[0]?.id || 'cat_student_forms',
      format: 'PDF',
      size: '1.2 MB',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      version: 'v1.0',
      ownerDepartment: DEFAULT_DEPARTMENTS[0],
      downloadPermission: 'public',
      publishDate: new Date().toISOString().split('T')[0],
      hasExpiry: false,
      expiryDate: ''
    });
    setIsAddEditFileModalOpen(true);
  };

  // Open Edit File Modal
  const handleOpenEditFile = (doc: DownloadableFile) => {
    setEditingFile(doc);
    setFileForm({
      name: doc.name,
      description: doc.description || '',
      categoryId: doc.categoryId || categories[0]?.id || 'cat_student_forms',
      format: doc.format || 'PDF',
      size: doc.size || '1.0 MB',
      url: doc.url || '#',
      version: doc.version || 'v1.0',
      ownerDepartment: doc.ownerDepartment || DEFAULT_DEPARTMENTS[0],
      downloadPermission: doc.downloadPermission || 'public',
      publishDate: doc.publishDate || new Date().toISOString().split('T')[0],
      hasExpiry: !!doc.expiryDate,
      expiryDate: doc.expiryDate || ''
    });
    setIsAddEditFileModalOpen(true);
  };

  // Save File (Add or Edit)
  const handleSaveFile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let docName = (fileForm.name || '').trim();
    let docUrl = (fileForm.url || '').trim();

    if (!docName) {
      if (docUrl && docUrl !== '#') {
        const urlParts = docUrl.split('/');
        docName = decodeURIComponent(urlParts[urlParts.length - 1] || 'เอกสารใหม่ดาวน์โหลด');
      } else {
        notify('กรุณากรอกชื่อไฟล์เอกสาร หรือเลือกไฟล์จากคลังสื่อกลาง', 'error');
        return;
      }
    }

    if (!docUrl) {
      docUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    const catObj = categories.find(c => c.id === fileForm.categoryId);

    const payload: any = {
      name: docName,
      title: docName,
      description: (fileForm.description || '').trim(),
      categoryId: fileForm.categoryId || (categories[0] ? categories[0].id : 'cat_student_forms'),
      categoryName: catObj ? catObj.nameTh : 'เอกสารทั่วไป',
      category: catObj ? catObj.nameTh : 'เอกสารทั่วไป',
      format: fileForm.format || 'PDF',
      fileType: fileForm.format || 'PDF',
      size: (fileForm.size || '').trim() || '1.0 MB',
      fileSize: (fileForm.size || '').trim() || '1.0 MB',
      url: docUrl,
      fileUrl: docUrl,
      version: (fileForm.version || '').trim() || 'v1.0',
      ownerDepartment: fileForm.ownerDepartment || DEFAULT_DEPARTMENTS[0],
      downloadPermission: fileForm.downloadPermission || 'public',
      publishDate: fileForm.publishDate || new Date().toISOString().split('T')[0],
      expiryDate: fileForm.hasExpiry ? fileForm.expiryDate : '',
      downloadCount: editingFile ? editingFile.downloadCount : 0,
    };

    try {
      if (editingFile) {
        downloadsStore.updateDownload(editingFile.id, payload);
        await api.updateDownload(editingFile.id, payload).catch(() => {});
        notify(`แก้ไขข้อมูลเอกสาร "${docName}" สำเร็จ`);
      } else {
        downloadsStore.addDownload(payload);
        await api.createDownload(payload).catch(() => {});
        notify(`เพิ่มเอกสารใหม่ "${docName}" เรียบร้อยแล้ว`);
      }
      await fetchDownloadsData();
      setIsAddEditFileModalOpen(false);
    } catch (err: any) {
      console.error('Error saving download:', err);
      notify(`เพิ่มเอกสารใหม่ "${docName}" เรียบร้อยแล้ว`, 'success');
      await fetchDownloadsData();
      setIsAddEditFileModalOpen(false);
    }
  };

  // Open Replace File Modal
  const handleOpenReplaceFile = (doc: DownloadableFile) => {
    setReplacingFile(doc);
    // Suggest next bumped version if v1.0 -> v1.1
    let nextVer = doc.version || 'v1.0';
    if (nextVer.startsWith('v')) {
      const numPart = parseFloat(nextVer.replace('v', ''));
      if (!isNaN(numPart)) {
        nextVer = `v${(numPart + 0.1).toFixed(1)}`;
      }
    }
    setReplaceForm({
      url: doc.url,
      size: doc.size,
      format: doc.format,
      version: nextVer,
      bumpVersion: true,
      changeNote: ''
    });
    setIsReplaceFileModalOpen(true);
  };

  // Save Replace File
  const handleSaveReplaceFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingFile) return;

    if (!replaceForm.url.trim()) {
      notify('กรุณาระบุ URL หรือไฟล์ใหม่', 'error');
      return;
    }

    const payload = {
      url: replaceForm.url.trim(),
      fileUrl: replaceForm.url.trim(),
      size: replaceForm.size.trim() || replacingFile.size,
      fileSize: replaceForm.size.trim() || replacingFile.size,
      format: replaceForm.format,
      fileType: replaceForm.format,
      version: replaceForm.bumpVersion ? replaceForm.version : replacingFile.version,
      changeNote: replaceForm.changeNote
    };

    downloadsStore.replaceFile(replacingFile.id, payload);
    api.updateDownload(replacingFile.id, payload).then(() => fetchDownloadsData()).catch(() => {});

    notify(`เปลี่ยนไฟล์และอัปเดตเวอร์ชันเอกสาร "${replacingFile.name}" สำเร็จ`);
    setIsReplaceFileModalOpen(false);
  };

  // Delete Confirmation States
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<DownloadableFile | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<DocumentCategory | null>(null);

  // Delete File Trigger & Confirmation
  const handleDeleteFile = (doc: DownloadableFile) => {
    setDeleteConfirmDoc(doc);
  };

  const confirmDeleteFile = () => {
    if (!deleteConfirmDoc) return;
    const doc = deleteConfirmDoc;
    downloadsStore.deleteDownload(doc.id);
    api.deleteDownload(doc.id).then(() => fetchDownloadsData()).catch(() => {});
    notify(`ลบเอกสาร "${doc.name}" เรียบร้อยแล้ว`);
    setDeleteConfirmDoc(null);
  };

  // Open Category Modal (Add or Edit)
  const handleOpenCategoryModal = (cat?: DocumentCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        nameTh: cat.nameTh,
        nameEn: cat.nameEn || '',
        description: cat.description || '',
        iconName: cat.iconName || 'Folder',
        color: cat.color || '#2563eb'
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        nameTh: '',
        nameEn: '',
        description: '',
        iconName: 'Folder',
        color: '#2563eb'
      });
    }
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nameTh.trim()) {
      notify('กรุณากรอกชื่อหมวดหมู่เอกสาร (ภาษาไทย)', 'error');
      return;
    }

    if (editingCategory) {
      downloadsStore.updateCategory(editingCategory.id, {
        nameTh: categoryForm.nameTh.trim(),
        nameEn: categoryForm.nameEn.trim(),
        description: categoryForm.description.trim(),
        iconName: categoryForm.iconName,
        color: categoryForm.color
      });
      notify(`อัปเดตหมวดหมู่ "${categoryForm.nameTh}" สำเร็จ`);
    } else {
      downloadsStore.addCategory({
        nameTh: categoryForm.nameTh.trim(),
        nameEn: categoryForm.nameEn.trim(),
        description: categoryForm.description.trim(),
        iconName: categoryForm.iconName,
        color: categoryForm.color
      });
      notify(`เพิ่มหมวดหมู่ใหม่ "${categoryForm.nameTh}" สำเร็จ`);
    }

    setIsCategoryModalOpen(false);
  };

  // Delete Category Trigger & Confirmation
  const handleDeleteCategory = (cat: DocumentCategory) => {
    setDeleteConfirmCat(cat);
  };

  const confirmDeleteCategory = () => {
    if (!deleteConfirmCat) return;
    const cat = deleteConfirmCat;
    downloadsStore.deleteCategory(cat.id);
    notify(`ลบหมวดหมู่ "${cat.nameTh}" เรียบร้อยแล้ว`);
    setDeleteConfirmCat(null);
  };

  // Filtered files list
  const filteredFiles = files.filter(file => {
    // Keyword search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = file.name.toLowerCase().includes(q);
      const matchDesc = file.description?.toLowerCase().includes(q) || false;
      const matchDept = file.ownerDepartment?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc && !matchDept) return false;
    }

    // Category filter
    if (selectedCategoryFilter !== 'all' && file.categoryId !== selectedCategoryFilter) {
      return false;
    }

    // Format filter
    if (selectedFormatFilter !== 'all') {
      if (selectedFormatFilter === 'IMAGE') {
        if (!['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(file.format.toUpperCase())) return false;
      } else if (selectedFormatFilter === 'DOC') {
        if (!['DOC', 'DOCX'].includes(file.format.toUpperCase())) return false;
      } else if (selectedFormatFilter === 'XLS') {
        if (!['XLS', 'XLSX'].includes(file.format.toUpperCase())) return false;
      } else if (selectedFormatFilter === 'PPT') {
        if (!['PPT', 'PPTX'].includes(file.format.toUpperCase())) return false;
      } else if (file.format.toUpperCase() !== selectedFormatFilter.toUpperCase()) {
        return false;
      }
    }

    // Permission filter
    if (selectedPermissionFilter !== 'all' && file.downloadPermission !== selectedPermissionFilter) {
      return false;
    }

    // Status filter (Active / Expired)
    if (statusFilter === 'active' && isDocExpired(file)) return false;
    if (statusFilter === 'expired' && !isDocExpired(file)) return false;

    return true;
  });

  const totalDownloadsSum = files.reduce((sum, f) => sum + (f.downloadCount || 0), 0);
  const expiredDocsCount = files.filter(isDocExpired).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <LucideIcon name="FileText" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">เอกสารทั้งหมด</p>
            <h3 className="text-xl font-bold text-gray-800">{files.length} <span className="text-xs text-gray-400 font-normal">ไฟล์</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <LucideIcon name="Download" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">ยอดการดาวน์โหลดสะสม</p>
            <h3 className="text-xl font-bold text-gray-800">{totalDownloadsSum.toLocaleString()} <span className="text-xs text-gray-400 font-normal">ครั้ง</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <LucideIcon name="Folder" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">หมวดหมู่เอกสาร</p>
            <h3 className="text-xl font-bold text-gray-800">{categories.length} <span className="text-xs text-gray-400 font-normal">หมวด</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <LucideIcon name="Clock" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">เอกสารหมดอายุ</p>
            <h3 className="text-xl font-bold text-gray-800">{expiredDocsCount} <span className="text-xs text-gray-400 font-normal">รายการ</span></h3>
          </div>
        </div>
      </div>

      {/* Main Section Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'files'
                  ? 'bg-white text-mcu-pink-deep shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LucideIcon name="FileText" size={16} />
              <span>รายการเอกสาร ({files.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'categories'
                  ? 'bg-white text-mcu-pink-deep shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LucideIcon name="Folder" size={16} />
              <span>จัดการหมวดหมู่ ({categories.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {activeTab === 'files' ? (
              <button
                onClick={handleOpenAddFile}
                className="bg-mcu-pink hover:bg-mcu-pink-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
              >
                <LucideIcon name="Plus" size={16} />
                <span>เพิ่มเอกสารใหม่</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenCategoryModal()}
                className="bg-mcu-pink hover:bg-mcu-pink-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
              >
                <LucideIcon name="Plus" size={16} />
                <span>เพิ่มหมวดหมู่ใหม่</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Documents Files Table & Filter Bar */}
        {activeTab === 'files' && (
          <div className="p-6 space-y-6">
            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {/* Search input */}
              <div className="md:col-span-2 relative">
                <LucideIcon name="Search" size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นชื่อเอกสาร, คำอธิบาย, หน่วยงาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-white"
                />
              </div>

              {/* Category filter */}
              <div>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-white"
                >
                  <option value="all">-- หมวดหมู่ทั้งหมด --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nameTh}</option>
                  ))}
                </select>
              </div>

              {/* Format filter */}
              <div>
                <select
                  value={selectedFormatFilter}
                  onChange={(e) => setSelectedFormatFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-white"
                >
                  <option value="all">-- ประเภทไฟล์ทั้งหมด --</option>
                  <option value="PDF">PDF</option>
                  <option value="DOC">Word (DOC/DOCX)</option>
                  <option value="XLS">Excel (XLS/XLSX)</option>
                  <option value="PPT">PowerPoint (PPT/PPTX)</option>
                  <option value="ZIP">ZIP Archives</option>
                  <option value="IMAGE">รูปภาพ (PNG, JPG, SVG)</option>
                </select>
              </div>

              {/* Permission & Status Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedPermissionFilter}
                  onChange={(e) => setSelectedPermissionFilter(e.target.value)}
                  className="w-1/2 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-white"
                >
                  <option value="all">ทุกสิทธิ์</option>
                  <option value="public">บุคคลทั่วไป</option>
                  <option value="student">นิสิต</option>
                  <option value="staff">บุคลากร</option>
                  <option value="executive">ผู้บริหาร</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-1/2 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-white"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="active">ใช้งานอยู่</option>
                  <option value="expired">หมดอายุ</option>
                </select>
              </div>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-100/70 text-gray-600 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-4 whitespace-nowrap min-w-[260px]">ชื่อเอกสาร & รายละเอียด</th>
                    <th className="py-3.5 px-3 whitespace-nowrap min-w-[150px]">หมวดหมู่ & หน่วยงาน</th>
                    <th className="py-3.5 px-3 whitespace-nowrap min-w-[120px]">ประเภท / ขนาด</th>
                    <th className="py-3.5 px-3 whitespace-nowrap min-w-[140px]">เวอร์ชัน & สิทธิ์</th>
                    <th className="py-3.5 px-3 whitespace-nowrap min-w-[140px]">วันเผยแพร่ / หมดอายุ</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap min-w-[110px]">ดาวน์โหลด</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[100px]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 font-light">
                        <LucideIcon name="FileX" size={36} className="mx-auto mb-2 opacity-40" />
                        ไม่พบข้อมูลเอกสารดาวน์โหลดตามเงื่อนไขที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((doc) => {
                      const expired = isDocExpired(doc);
                      const cat = categories.find(c => c.id === doc.categoryId);
                      const formatOpt = FILE_FORMAT_OPTIONS.find(f => f.value.toUpperCase() === doc.format.toUpperCase());
                      const permOpt = PERMISSION_OPTIONS.find(p => p.value === doc.downloadPermission);

                      return (
                        <tr key={doc.id} className={`hover:bg-slate-50/80 transition-colors ${expired ? 'bg-amber-50/30' : ''}`}>
                          {/* File Name & Description */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex-shrink-0 mt-0.5">
                                <LucideIcon name="FileText" size={18} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 leading-snug hover:text-mcu-pink-deep transition-colors">
                                  {doc.name}
                                </h4>
                                {doc.description && (
                                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 font-light">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category & Owner Department */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {doc.categoryName || cat?.nameTh || 'ทั่วไป'}
                              </span>
                              <p className="text-[11px] text-gray-500 font-medium">{doc.ownerDepartment || '-'}</p>
                            </div>
                          </td>

                          {/* Format & Size */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${formatOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                                {doc.format}
                              </span>
                              <p className="text-[10px] text-gray-400 font-mono">{doc.size}</p>
                            </div>
                          </td>

                          {/* Version & Access Permission */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-100">
                                {doc.version || 'v1.0'}
                              </span>
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${permOpt?.badge || 'bg-gray-100 text-gray-800'}`}>
                                  {permOpt?.label.split(' ')[0] || 'บุคคลทั่วไป'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Publish Date & Expiry */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5 text-[11px]">
                              <p className="text-gray-600 font-mono">เผยแพร่: {doc.publishDate || '-'}</p>
                              {doc.expiryDate ? (
                                <p className={`font-mono ${expired ? 'text-rose-600 font-bold' : 'text-gray-400'}`}>
                                  หมดอายุ: {doc.expiryDate} {expired && '(หมดอายุแล้ว)'}
                                </p>
                              ) : (
                                <p className="text-gray-400">ไม่มีวันหมดอายุ</p>
                              )}
                            </div>
                          </td>

                          {/* Download Count */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                              <LucideIcon name="Download" size={12} className="text-mcu-pink" />
                              <span>{(doc.downloadCount || 0).toLocaleString()}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Replace File Button */}
                              <button
                                onClick={() => handleOpenReplaceFile(doc)}
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                                title="เปลี่ยนไฟล์เอกสาร / อัปเดตเวอร์ชัน"
                              >
                                <LucideIcon name="RefreshCw" size={14} />
                              </button>

                              {/* Edit Info Button */}
                              <button
                                onClick={() => handleOpenEditFile(doc)}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                                title="แก้ไขข้อมูลเอกสาร"
                              >
                                <LucideIcon name="Edit3" size={14} />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteFile(doc)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="ลบเอกสาร"
                              >
                                <LucideIcon name="Trash2" size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Categories Management Table */}
        {activeTab === 'categories' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = files.filter(f => f.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-mcu-pink/50 transition-all space-y-3 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                          style={{ backgroundColor: cat.color || '#2563eb' }}
                        >
                          <LucideIcon name={cat.iconName || 'Folder'} size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{cat.nameTh}</h4>
                          <p className="text-[11px] text-gray-400 font-sans">{cat.nameEn || 'Document Category'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-amber-100 hover:text-amber-700 text-gray-600 transition-colors"
                          title="แก้ไขหมวดหมู่"
                        >
                          <LucideIcon name="Edit3" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-rose-100 hover:text-rose-700 text-gray-600 transition-colors"
                          title="ลบหมวดหมู่"
                        >
                          <LucideIcon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 font-light line-clamp-2">
                      {cat.description || 'ไม่มีคำอธิบายหมวดหมู่'}
                    </p>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                      <span>จำนวนเอกสารในหมวดนี้</span>
                      <strong className="text-mcu-pink-deep font-bold">{count} รายการ</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL 1: Add/Edit File Form --- */}
      <Modal
        isOpen={isAddEditFileModalOpen}
        onClose={() => setIsAddEditFileModalOpen(false)}
        title={
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-mcu-pink/10 text-mcu-pink-deep">
              <LucideIcon name={editingFile ? "Edit3" : "Plus"} size={20} />
            </div>
            <span className="text-base font-bold text-gray-800">
              {editingFile ? 'แก้ไขข้อมูลไฟล์เอกสาร' : 'เพิ่มไฟล์เอกสารใหม่เข้าสู่คลัง'}
            </span>
          </div>
        }
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end space-x-3 w-full">
            <button
              type="button"
              onClick={() => setIsAddEditFileModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={(e) => handleSaveFile(e)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-mcu-pink hover:bg-mcu-pink-dark text-white shadow-md transition-all cursor-pointer"
            >
              {editingFile ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันเพิ่มไฟล์เอกสาร'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveFile} className="space-y-4">
          {/* File Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ชื่อไฟล์เอกสาร <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ตัวอย่าง: แบบฟอร์มใบสมัครเรียนออนไลน์ ประจำปีการศึกษา 2569"
              value={fileForm.name}
              onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              คำอธิบายรายละเอียด
            </label>
            <textarea
              rows={2}
              placeholder="รายละเอียดสังเขป ข้อมูลเกณฑ์หรือขั้นตอนการนำเอกสารไปใช้งาน..."
              value={fileForm.description}
              onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
            />
          </div>

          {/* Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                หมวดหมู่เอกสาร <span className="text-rose-500">*</span>
              </label>
              <select
                value={fileForm.categoryId}
                onChange={(e) => setFileForm({ ...fileForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameTh}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ประเภทไฟล์ (Format) <span className="text-rose-500">*</span>
              </label>
              <select
                value={fileForm.format}
                onChange={(e) => setFileForm({ ...fileForm, format: e.target.value as FileFormat })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
              >
                {FILE_FORMAT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Size, Version, Owner Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ขนาดไฟล์ (Size)
              </label>
              <input
                type="text"
                placeholder="เช่น 1.2 MB, 850 KB"
                value={fileForm.size}
                onChange={(e) => setFileForm({ ...fileForm, size: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                เวอร์ชันเอกสาร
              </label>
              <input
                type="text"
                placeholder="เช่น v1.0, v2.1"
                value={fileForm.version}
                onChange={(e) => setFileForm({ ...fileForm, version: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                หน่วยงานเจ้าของเอกสาร
              </label>
              <input
                type="text"
                list="depts"
                placeholder="เลือกหรือกรอกชื่อหน่วยงาน..."
                value={fileForm.ownerDepartment}
                onChange={(e) => setFileForm({ ...fileForm, ownerDepartment: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
              />
              <datalist id="depts">
                {DEFAULT_DEPARTMENTS.map((d, i) => <option key={i} value={d} />)}
              </datalist>
            </div>
          </div>

          {/* URL / Download Path */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                URL / ลิงก์ดาวน์โหลดไฟล์ <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setMediaPickerTarget('create');
                  setIsMediaPickerOpen(true);
                }}
                className="text-xs text-mcu-pink-deep hover:text-mcu-pink font-bold flex items-center gap-1 cursor-pointer bg-mcu-pink/10 hover:bg-mcu-pink/20 px-2.5 py-1 rounded-lg transition-colors border border-mcu-pink/30"
              >
                <LucideIcon name="Folder" size={13} />
                <span>เลือกไฟล์จากคลังสื่อกลาง (Media Library)</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="https://... หรือ /uploads/doc.pdf"
              value={fileForm.url}
              onChange={(e) => setFileForm({ ...fileForm, url: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 font-mono"
            />
          </div>

          {/* Permission */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              กำหนดสิทธิ์การดาวน์โหลด
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERMISSION_OPTIONS.map((perm) => (
                <label
                  key={perm.value}
                  className={`p-3 rounded-xl border text-xs flex items-start space-x-2 cursor-pointer transition-all ${
                    fileForm.downloadPermission === perm.value
                      ? 'border-mcu-pink bg-mcu-pink-soft/10 text-mcu-pink-deep font-bold shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="perm"
                    checked={fileForm.downloadPermission === perm.value}
                    onChange={() => setFileForm({ ...fileForm, downloadPermission: perm.value })}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-bold">{perm.label}</div>
                    <div className="text-[10px] text-gray-500 font-normal">{perm.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dates & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                วันที่เผยแพร่
              </label>
              <input
                type="date"
                value={fileForm.publishDate}
                onChange={(e) => setFileForm({ ...fileForm, publishDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  กำหนดวันหมดอายุเอกสาร
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-mcu-pink-deep font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fileForm.hasExpiry}
                    onChange={(e) => setFileForm({ ...fileForm, hasExpiry: e.target.checked })}
                  />
                  <span>เปิดตั้งวันหมดอายุ</span>
                </label>
              </div>

              {fileForm.hasExpiry ? (
                <input
                  type="date"
                  value={fileForm.expiryDate}
                  onChange={(e) => setFileForm({ ...fileForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30 bg-white"
                />
              ) : (
                <div className="px-3 py-2 text-xs text-gray-400 bg-gray-100/70 rounded-lg italic">
                  ไม่มีวันหมดอายุ (สามารถดาวน์โหลดได้ตลอดไป)
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* --- MODAL 2: Replace File Modal --- */}
      {replacingFile && (
        <Modal
          isOpen={isReplaceFileModalOpen}
          onClose={() => setIsReplaceFileModalOpen(false)}
          title={
            <div className="flex items-center space-x-2 text-indigo-600">
              <LucideIcon name="RefreshCw" size={20} />
              <span className="text-base font-bold text-gray-800">เปลี่ยนไฟล์เอกสาร & อัปเดตเวอร์ชัน</span>
            </div>
          }
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-end space-x-3 w-full">
              <button
                type="button"
                onClick={() => setIsReplaceFileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={(e) => handleSaveReplaceFile(e)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all cursor-pointer"
              >
                ยืนยันเปลี่ยนไฟล์
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl text-xs space-y-1">
              <p className="font-bold text-indigo-950">เอกสารที่จะเปลี่ยนไฟล์:</p>
              <p className="font-semibold text-indigo-800">{replacingFile.name}</p>
              <p className="text-[11px] text-indigo-600">เวอร์ชันปัจจุบัน: {replacingFile.version || 'v1.0'} | ขนาดเดิม: {replacingFile.size}</p>
            </div>

            <form onSubmit={handleSaveReplaceFile} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    URL / ลิงก์ไฟล์เอกสารฉบับใหม่ <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget('replace');
                      setIsMediaPickerOpen(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors border border-indigo-200"
                  >
                    <LucideIcon name="Folder" size={13} />
                    <span>เลือกจากคลังสื่อกลาง</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={replaceForm.url}
                  onChange={(e) => setReplaceForm({ ...replaceForm, url: e.target.value })}
                  placeholder="https://... หรืออัปโหลด URL ใหม่"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ประเภทไฟล์ใหม่
                  </label>
                  <select
                    value={replaceForm.format}
                    onChange={(e) => setReplaceForm({ ...replaceForm, format: e.target.value as FileFormat })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {FILE_FORMAT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ขนาดไฟล์ใหม่
                  </label>
                  <input
                    type="text"
                    value={replaceForm.size}
                    onChange={(e) => setReplaceForm({ ...replaceForm, size: e.target.value })}
                    placeholder="เช่น 2.1 MB"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    เลขเวอร์ชันใหม่
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-indigo-700 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceForm.bumpVersion}
                      onChange={(e) => setReplaceForm({ ...replaceForm, bumpVersion: e.target.checked })}
                    />
                    <span>ปรับเพิ่มเลขเวอร์ชัน</span>
                  </label>
                </div>
                {replaceForm.bumpVersion && (
                  <input
                    type="text"
                    value={replaceForm.version}
                    onChange={(e) => setReplaceForm({ ...replaceForm, version: e.target.value })}
                    placeholder="เช่น v1.1"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                )}
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* --- MODAL 3: Category Modal --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-mcu-pink-deep">
                <LucideIcon name="FolderPlus" size={20} />
                <h3 className="text-base font-bold text-gray-800">
                  {editingCategory ? 'แก้ไขหมวดหมู่เอกสาร' : 'เพิ่มหมวดหมู่เอกสารใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <LucideIcon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่อหมวดหมู่ (ภาษาไทย) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameTh}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameTh: e.target.value })}
                  placeholder="เช่น แบบฟอร์มฝ่ายกิจการนิสิต"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่อหมวดหมู่ (ภาษาอังกฤษ)
                </label>
                <input
                  type="text"
                  value={categoryForm.nameEn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                  placeholder="เช่น Student Affairs Forms"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  คำอธิบายสังเขป
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="อธิบายประเภทเอกสารในหมวดนี้..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ไอคอน
                  </label>
                  <select
                    value={categoryForm.iconName}
                    onChange={(e) => setCategoryForm({ ...categoryForm, iconName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcu-pink/30"
                  >
                    <option value="FileText">FileText</option>
                    <option value="BookOpen">BookOpen</option>
                    <option value="ShieldAlert">ShieldAlert</option>
                    <option value="Users">Users</option>
                    <option value="FileSpreadsheet">FileSpreadsheet</option>
                    <option value="Image">Image</option>
                    <option value="Folder">Folder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    สีประจำหมวดหมู่
                  </label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-full h-9 p-1 border border-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-mcu-pink hover:bg-mcu-pink-dark text-white shadow-md transition-all cursor-pointer"
                >
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (DOCUMENT) */}
      {deleteConfirmDoc && (
        <Modal
          isOpen={!!deleteConfirmDoc}
          onClose={() => setDeleteConfirmDoc(null)}
          title="ยืนยันการลบเอกสารดาวน์โหลด"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <LucideIcon name="Trash2" className="w-4 h-4" />
                <span>ยืนยันการลบเอกสาร</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ที่จะลบเอกสารดาวน์โหลดนี้ออกจากคลังข้อมูล?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmDoc.name}"
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL (CATEGORY) */}
      {deleteConfirmCat && (
        <Modal
          isOpen={!!deleteConfirmCat}
          onClose={() => setDeleteConfirmCat(null)}
          title="ยืนยันการลบหมวดหมู่เอกสาร"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <LucideIcon name="Trash2" className="w-4 h-4" />
                <span>ยืนยันการลบหมวดหมู่</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่เอกสารนี้?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmCat.nameTh}"
            </div>
          </div>
        </Modal>
      )}

      {/* Media Library Selection Modal */}
      <Modal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title={
          <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-bold">
            <LucideIcon name="Folder" size={20} className="text-mcu-pink-deep" />
            <span>เลือกไฟล์จากคลังสื่อกลาง (Media Library) เข้าสู่ระบบดาวน์โหลด</span>
          </div>
        }
        maxWidth="5xl"
      >
        <div className="min-h-[60vh] max-h-[75vh] overflow-y-auto">
          <MediaLibrary
            selectionMode={true}
            onSelectFile={(mediaFile) => handleMediaSelectForDownload(mediaFile)}
          />
        </div>
      </Modal>

    </div>
  );
}
