import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileArchive,
  Film,
  Music,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Trash2,
  Edit2,
  Eye,
  Check,
  AlertTriangle,
  Lock,
  ExternalLink,
  Copy,
  Info,
  Sparkles,
  Zap,
  HardDrive,
  Cloud,
  FolderOpen,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Tag,
  CheckSquare,
  Square,
  RefreshCw,
  Sliders,
  Maximize2
} from 'lucide-react';
import { api } from '../lib/api';
import { Modal } from './ui/Modal';
import { validateUploadFile, formatBytes } from '../lib/fileValidation';
import { MediaFile, MediaFolder, MediaStorageSettings, MediaUsageReference, MediaFileType, StorageProvider } from '../types';

interface MediaLibraryProps {
  onSelectFile?: (file: MediaFile) => void;
  selectionMode?: boolean;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelectFile, selectionMode = false }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [settings, setSettings] = useState<MediaStorageSettings>({
    provider: 'local',
    maxFileSizeMB: 20,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    autoWebPConversion: true,
    autoCompressImages: true,
    compressionQuality: 85,
    generateThumbnails: true
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all'); // 'all', 'root', or folderId
  const [selectedFileType, setSelectedFileType] = useState<string>('all'); // 'all', 'image', 'document', 'audio', 'video', 'archive'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');

  // Modals & Panels
  const [activeTab, setActiveTab] = useState<'files' | 'folders' | 'settings'>('files');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editFilename, setEditFilename] = useState<string>('');
  const [editAltText, setEditAltText] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');
  const [editFolderId, setEditFolderId] = useState<string | null>(null);

  // Deletion Safety Lock Modal
  const [deleteLockFile, setDeleteLockFile] = useState<{ file: MediaFile; usages: MediaUsageReference[] } | null>(null);
  const [forceDeleteConfirm, setForceDeleteConfirm] = useState<boolean>(false);

  // Batch actions
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [batchMoveFolderId, setBatchMoveFolderId] = useState<string>('');
  const [showBatchMoveModal, setShowBatchMoveModal] = useState<boolean>(false);

  // Folder creation/edit modal
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [folderNameInput, setFolderNameInput] = useState<string>('');
  const [folderColorInput, setFolderColorInput] = useState<string>('#ec4899');

  // Uploading State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgressList, setUploadProgressList] = useState<{ id: string; name: string; size: string; status: 'uploading' | 'processing' | 'done' | 'error'; error?: string; progress: number }[]>([]);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [selectedFolderId, selectedFileType, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mediaData, folderData, settingsData] = await Promise.all([
        api.getMedia({
          folderId: selectedFolderId || undefined,
          type: selectedFileType !== 'all' ? selectedFileType : undefined,
          search: searchQuery || undefined
        }),
        api.getMediaFolders(),
        api.getMediaSettings()
      ]);

      setFiles(mediaData || []);
      setFolders(folderData || []);
      if (settingsData) setSettings(settingsData as MediaStorageSettings);
    } catch (err: any) {
      console.error('Error loading media data:', err);
      showToast('error', 'ไม่สามารถโหลดข้อมูลคลังสื่อได้');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Helper for formatting file size
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Sorting
  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    if (sortBy === 'name') return a.filename.localeCompare(b.filename, 'th');
    if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
    return 0;
  });

  // Calculate totals
  const totalStorageBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalSavedBytes = files.reduce((acc, f) => acc + ((f.originalSize || f.size) - f.size), 0);

  // File Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileUploads(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileUploads(Array.from(e.target.files));
    }
  };

  const processFileUploads = async (uploadedFiles: File[]) => {
    setSecurityWarning(null);

    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    uploadedFiles.forEach((file) => {
      const maxMB = settings.maxFileSizeMB || 20;
      const validation = validateUploadFile(file, maxMB);
      if (!validation.valid) {
        errorMessages.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessages.length > 0) {
      setSecurityWarning(errorMessages.join(' | '));
    }

    if (validFiles.length === 0) return;

    // Process each valid file
    for (const file of validFiles) {
      const uploadId = 'up_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);

      setUploadProgressList((prev) => [
        {
          id: uploadId,
          name: file.name,
          size: formatBytes(file.size),
          status: 'uploading',
          progress: 30
        },
        ...prev
      ]);

      try {
        // Read file content as base64 for real persistent disk write
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        setUploadProgressList((prev) =>
          prev.map((item) => (item.id === uploadId ? { ...item, status: 'processing', progress: 75 } : item))
        );

        // Call Backend API
        const folderTarget = selectedFolderId !== 'all' ? selectedFolderId : null;
        const result = await api.uploadMedia({
          filename: file.name,
          originalFilename: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          folderId: folderTarget,
          altText: file.name.replace(/\.[^/.]+$/, ''),
          description: `อัปโหลดผ่านระบบคลังสื่อเมื่อ ${new Date().toLocaleDateString('th-TH')}`,
          tags: [file.type ? (file.type.split('/')[0] || 'file') : 'file'],
          base64Data
        });

        setUploadProgressList((prev) =>
          prev.map((item) => (item.id === uploadId ? { ...item, status: 'done', progress: 100 } : item))
        );

        showToast('success', `อัปโหลดและประมวลผลไฟล์ "${file.name}" เรียบร้อยแล้ว`);
      } catch (err: any) {
        console.error('Upload error:', err);
        const errMsg = err?.message || 'เกิดข้อผิดพลาดในการอัปโหลด';
        setUploadProgressList((prev) =>
          prev.map((item) => (item.id === uploadId ? { ...item, status: 'error', error: errMsg, progress: 0 } : item))
        );
        showToast('error', `อัปโหลดล้มเหลว: ${errMsg}`);
      }
    }

    // Refresh media list
    loadData();
  };

  // Open Edit Metadata Modal
  const handleOpenEdit = (file: MediaFile) => {
    setEditingFile(file);
    setEditFilename(file.filename || file.name || '');
    setEditAltText(file.altText || '');
    setEditDescription(file.description || '');
    setEditTags(Array.isArray(file.tags) ? file.tags.join(', ') : '');
    setEditFolderId(file.folderId || null);
  };

  const handleSaveMetadata = async () => {
    if (!editingFile) return;
    try {
      const tagArray = (editTags || '')
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const updated = await api.updateMedia(editingFile.id, {
        filename: editFilename,
        altText: editAltText,
        description: editDescription,
        tags: tagArray,
        folderId: editFolderId
      });

      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      if (previewFile?.id === updated.id) setPreviewFile(updated);
      setEditingFile(null);
      showToast('success', 'บันทึกข้อมูลไฟล์เรียบร้อยแล้ว');
    } catch (err: any) {
      showToast('error', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // Delete File Handler (with Safety Check)
  const handleDeleteClick = async (file: MediaFile) => {
    try {
      // First attempt delete without force
      await api.deleteMedia(file.id, false);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      if (previewFile?.id === file.id) setPreviewFile(null);
      showToast('success', `ลบไฟล์ "${file.filename}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      // Check if blocked by usage safety check (409)
      if (err.blocked || err.usages) {
        setDeleteLockFile({
          file: err.file || file,
          usages: err.usages || []
        });
        setForceDeleteConfirm(false);
      } else {
        showToast('error', err.error || 'ไม่สามารถลบไฟล์ได้');
      }
    }
  };

  // Force Delete Handler
  const handleForceDelete = async () => {
    if (!deleteLockFile) return;
    try {
      await api.deleteMedia(deleteLockFile.file.id, true);
      setFiles((prev) => prev.filter((f) => f.id !== deleteLockFile.file.id));
      if (previewFile?.id === deleteLockFile.file.id) setPreviewFile(null);
      setDeleteLockFile(null);
      showToast('success', `ยืนยันลบไฟล์ "${deleteLockFile.file.filename}" แม้ว่ามีการใช้งานแล้ว`);
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาดในการบังคับลบไฟล์');
    }
  };

  // Batch Selection Handlers
  const toggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map((f) => f.id));
    }
  };

  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState<boolean>(false);
  const [deleteConfirmFolder, setDeleteConfirmFolder] = useState<{ id: string; name: string } | null>(null);

  const handleBatchDelete = () => {
    if (selectedFileIds.length === 0) return;
    setShowBatchDeleteModal(true);
  };

  const confirmBatchDelete = async () => {
    setShowBatchDeleteModal(false);
    try {
      const res = await api.batchDeleteMedia(selectedFileIds, false);
      if (res.blockedFiles && res.blockedFiles.length > 0) {
        showToast('error', `พบไฟล์ ${res.blockedFiles.length} รายการกำลังถูกใช้งานในระบบ จึงถูกข้ามการลบเพื่อความปลอดภัย`);
      } else {
        showToast('success', `ลบไฟล์จำนวน ${res.deletedIds.length} รายการเรียบร้อยแล้ว`);
      }
      setSelectedFileIds([]);
      loadData();
    } catch (err) {
      showToast('error', 'เกิดข้อผิดพลาดในการลบไฟล์ชุด');
    }
  };

  const handleBatchMove = async () => {
    if (selectedFileIds.length === 0) return;
    try {
      const targetFolder = batchMoveFolderId === 'root' ? null : batchMoveFolderId;
      await api.batchMoveMedia(selectedFileIds, targetFolder);
      showToast('success', `ย้ายไฟล์จำนวน ${selectedFileIds.length} รายการไปยังโฟลเดอร์เป้าหมายแล้ว`);
      setSelectedFileIds([]);
      setShowBatchMoveModal(false);
      loadData();
    } catch (err) {
      showToast('error', 'เกิดข้อผิดพลาดในการย้ายไฟล์');
    }
  };

  // Create / Edit Folder Handlers
  const handleOpenFolderModal = (folder?: MediaFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderNameInput(folder.name);
      setFolderColorInput(folder.color || '#ec4899');
    } else {
      setEditingFolder(null);
      setFolderNameInput('');
      setFolderColorInput('#ec4899');
    }
    setShowFolderModal(true);
  };

  const handleSaveFolder = async () => {
    if (!folderNameInput.trim()) return;
    const name = folderNameInput.trim();
    const color = folderColorInput || '#ec4899';

    if (editingFolder) {
      setFolders(prev => prev.map(f => f.id === editingFolder.id ? { ...f, name, color } : f));
      showToast('success', 'แก้ไขชื่อโฟลเดอร์เรียบร้อยแล้ว');
      setShowFolderModal(false);
      try {
        await api.updateMediaFolder(editingFolder.id, name, color);
        loadData();
      } catch (err) {
        console.error('Error updating folder:', err);
      }
    } else {
      const tempId = 'f_' + Date.now();
      const newFolderItem = {
        id: tempId,
        name,
        color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setFolders(prev => [...prev, newFolderItem]);
      showToast('success', `สร้างโฟลเดอร์ "${name}" เรียบร้อยแล้ว`);
      setShowFolderModal(false);
      try {
        await api.createMediaFolder(name, null, color);
        loadData();
      } catch (err) {
        console.error('Error creating folder:', err);
      }
    }
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setDeleteConfirmFolder({ id: folderId, name: folderName });
  };

  const confirmDeleteFolder = async () => {
    if (!deleteConfirmFolder) return;
    const { id: folderId, name: folderName } = deleteConfirmFolder;
    setDeleteConfirmFolder(null);

    try {
      await api.deleteMediaFolder(folderId);
      if (selectedFolderId === folderId) setSelectedFolderId('all');
      showToast('success', `ลบโฟลเดอร์ "${folderName}" เรียบร้อยแล้ว`);
      loadData();
    } catch (err) {
      showToast('error', 'ไม่สามารถลบโฟลเดอร์ได้');
    }
  };

  // Save Settings
  const handleSaveSettings = async (updatedSettings: Partial<MediaStorageSettings>) => {
    try {
      const saved = await api.updateMediaSettings(updatedSettings);
      setSettings(saved);
      showToast('success', 'อัปเดตการตั้งค่าระบบจัดเก็บไฟล์เรียบร้อยแล้ว');
    } catch (err) {
      showToast('error', 'ไม่สามารถบันทึกการตั้งค่าได้');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('info', 'คัดลอก URL ของไฟล์ลงในคลิปบอร์ดแล้ว');
  };

  const getFileIcon = (fileType: MediaFileType) => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'document': return <FileText className="w-5 h-5 text-amber-500" />;
      case 'audio': return <Music className="w-5 h-5 text-purple-500" />;
      case 'video': return <Film className="w-5 h-5 text-rose-500" />;
      case 'archive': return <FileArchive className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 p-4 md:p-6 rounded-2xl">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-600'
              : notification.type === 'error'
              ? 'bg-rose-600'
              : 'bg-amber-600'
          }`}
        >
          {notification.type === 'success' && <Check className="w-5 h-5" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-xl text-pink-700">
                <HardDrive className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Media Library & File Manager (คลังสื่อกลาง)
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  ระบบจัดการไฟล์และสื่อดิจิทัลกลาง รองรับการอัปโหลด ปรับแต่งภาพ WebP โฟลเดอร์ ค้นหา และตรวจสอบความปลอดภัย
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Stats */}
          <div className="flex items-center gap-4 flex-wrap bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="px-3 border-r border-slate-200">
              <span className="text-xs text-slate-500 block">จำนวนไฟล์ทั้งหมด</span>
              <span className="text-base font-bold text-slate-800">{files.length} รายการ</span>
            </div>
            <div className="px-3 border-r border-slate-200">
              <span className="text-xs text-slate-500 block">พื้นที่ใช้ไป</span>
              <span className="text-base font-bold text-pink-700">{formatBytes(totalStorageBytes)}</span>
            </div>
            <div className="px-3 border-r border-slate-200">
              <span className="text-xs text-slate-500 block">ประหยัดด้วย WebP</span>
              <span className="text-base font-bold text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {formatBytes(totalSavedBytes)}
              </span>
            </div>
            <div className="px-3">
              <span className="text-xs text-slate-500 block">ผู้ให้บริการพื้นที่</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 inline-block mt-0.5 capitalize">
                {settings.provider === 'local' ? 'Local Server (/uploads)' : settings.provider}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'files'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            คลังไฟล์สื่อ ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('folders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'folders'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Folder className="w-4 h-4" />
            จัดการโฟลเดอร์ ({folders.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            ตั้งค่าระบบจัดเก็บ (Storage Provider)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Upload Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-white shadow-sm ${
              isDragging
                ? 'border-pink-500 bg-pink-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-pink-400'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 bg-pink-50 rounded-2xl text-pink-600 mb-3">
                <UploadCloud className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                ลากและวางไฟล์ลงที่นี่ หรือคลิกปุ่มเพื่อเลือกไฟล์
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                รองรับการอัปโหลดทีละหลายไฟล์พร้อมกัน (Multi-Upload), แปลงรูปภาพเป็น WebP อัตโนมัติ, สร้าง Thumbnail และจำกัดขนาดสูงสุด {settings.maxFileSizeMB} MB
              </p>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium shadow-md transition-all flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  เลือกไฟล์จากคอมพิวเตอร์
                </button>
                <button
                  onClick={() => handleOpenFolderModal()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  สร้างโฟลเดอร์ใหม่
                </button>
              </div>
            </div>
          </div>

          {/* Security Warning Notification if dangerous file detected */}
          {securityWarning && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">ระบบรักษาความปลอดภัยแจ้งเตือน!</span>
                {securityWarning}
              </div>
              <button
                onClick={() => setSecurityWarning(null)}
                className="ml-auto text-rose-500 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Live Upload Progress Cards */}
          {uploadProgressList.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b">
                <span className="font-semibold text-slate-700">สถานะการอัปโหลดและการบีบอัดไฟล์ล่าสุด</span>
                <button
                  onClick={() => setUploadProgressList([])}
                  className="text-pink-600 hover:underline"
                >
                  ล้างรายการ
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {uploadProgressList.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center gap-3">
                    {item.status === 'done' ? (
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : item.status === 'error' ? (
                      <div className="p-2 bg-rose-100 text-rose-700 rounded-full">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-2 bg-pink-100 text-pink-700 rounded-full animate-spin">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{item.name}</p>
                      <span className="text-slate-400 block">{item.size}</span>
                    </div>
                    <span className="font-semibold text-slate-600 uppercase text-[10px]">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter, Search & Action Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อไฟล์, Alt Text, คำอธิบาย หรือแท็ก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'image', label: 'รูปภาพ' },
                { id: 'document', label: 'เอกสาร' },
                { id: 'audio', label: 'เสียง' },
                { id: 'video', label: 'วิดีโอ' },
                { id: 'archive', label: 'ไฟล์บีบอัด' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFileType(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedFileType === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Folder Dropdown Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">โฟลเดอร์:</span>
              <select
                value={selectedFolderId || 'all'}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">📁 ทุกโฟลเดอร์</option>
                <option value="root">📂 หน้าหลัก (Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>

              {/* View & Sort Mode */}
              <div className="flex items-center gap-1 border-l pl-2 border-slate-200">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="newest">เรียง: ใหม่สุด</option>
                  <option value="oldest">เรียง: เก่าสุด</option>
                  <option value="name">เรียง: ก-ฮ</option>
                  <option value="size">เรียง: ขนาดใหญ่สุด</option>
                </select>

                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-slate-600 ${
                    viewMode === 'grid' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-slate-600 ${
                    viewMode === 'list' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100'
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Batch Selection Action Bar */}
          {selectedFileIds.length > 0 && (
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-pink-800 bg-pink-100 px-3 py-1 rounded-full">
                  เลือกอยู่ {selectedFileIds.length} รายการ
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-pink-700 hover:underline font-medium"
                >
                  {selectedFileIds.length === files.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBatchMoveModal(true)}
                  className="px-3 py-1.5 bg-white border border-pink-300 text-pink-800 rounded-xl text-xs font-medium hover:bg-pink-100 transition-colors flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  ย้ายไปยังโฟลเดอร์
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบไฟล์ที่เลือก
                </button>
              </div>
            </div>
          )}

          {/* Media Items Container */}
          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">กำลังโหลดคลังสื่อและวิเคราะห์การใช้งาน...</p>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-700">ไม่พบไฟล์ในเงื่อนไขที่ค้นหา</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                ลองเปลี่ยนคำค้นหา หรืออัปโหลดไฟล์ใหม่ลงในโฟลเดอร์นี้
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedFiles.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);
                const hasUsages = (file.usages?.length || 0) > 0;

                return (
                  <div
                    key={file.id}
                    className={`group relative bg-white rounded-2xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-pink-500 ring-2 ring-pink-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Select Checkbox Top Left */}
                    <button
                      onClick={() => toggleSelectFile(file.id)}
                      className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-white/80 backdrop-blur hover:bg-white text-slate-700 shadow-sm"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-pink-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 opacity-60 group-hover:opacity-100" />
                      )}
                    </button>

                    {/* WebP / Usage Badge Top Right */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                      {file.fileType === 'image' && file.isCompressed && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
                          WebP -{file.compressionRatio}%
                        </span>
                      )}
                      {hasUsages && (
                        <span
                          title={`ถูกใช้งานในระบบ ${file.usages?.length} รายการ`}
                          className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          {file.usages?.length}
                        </span>
                      )}
                    </div>

                    {/* Preview Thumbnail */}
                    <div
                      onClick={() => selectionMode ? onSelectFile?.(file) : setPreviewFile(file)}
                      className="aspect-square bg-slate-100 relative cursor-pointer overflow-hidden flex items-center justify-center group-hover:opacity-95"
                    >
                      {file.fileType === 'image' ? (
                        <img
                          src={file.thumbnailUrl || file.url}
                          alt={file.altText || file.filename}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          {getFileIcon(file.fileType)}
                          <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">
                            {file.mimeType ? (file.mimeType.split('/')[1] || file.fileType || 'file') : (file.extension || file.fileType || 'file')}
                          </span>
                        </div>
                      )}

                      {/* Overlay Action Button on Hover */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {selectionMode ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFile?.(file);
                            }}
                            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>เลือกไฟล์นี้</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewFile(file);
                              }}
                              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110"
                              title="ดูตัวอย่าง"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(file);
                              }}
                              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(file);
                              }}
                              className="p-2 rounded-xl bg-white/90 hover:bg-rose-600 text-rose-600 hover:text-white shadow-md transition-transform hover:scale-110"
                              title="ลบไฟล์"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* File Meta Info */}
                    <div className="p-3">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{file.formattedSize || formatBytes(file.size)}</span>
                        <span>{new Date(file.createdAt).toLocaleDateString('th-TH')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View Table */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedFileIds.length === files.length && files.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="p-3">ชื่อไฟล์</th>
                    <th className="p-3">ประเภท</th>
                    <th className="p-3">ขนาด</th>
                    <th className="p-3">สถานะ WebP/ใช้งาน</th>
                    <th className="p-3">วันที่อัปโหลด</th>
                    <th className="p-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    const hasUsages = (file.usages?.length || 0) > 0;

                    return (
                      <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectFile(file.id)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="p-3">
                          <div
                            onClick={() => setPreviewFile(file)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border flex items-center justify-center">
                              {file.fileType === 'image' ? (
                                <img
                                  src={file.thumbnailUrl || file.url}
                                  alt={file.filename}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getFileIcon(file.fileType)
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 group-hover:text-pink-600 truncate block">
                                {file.filename}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                Alt: {file.altText || '-'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-medium uppercase text-slate-500">{file.fileType}</td>
                        <td className="p-3 font-semibold text-slate-700">{file.formattedSize}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {file.fileType === 'image' && file.isCompressed && (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                WebP (-{file.compressionRatio}%)
                              </span>
                            )}
                            {hasUsages ? (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                ถูกใช้ ({file.usages?.length})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                                ยังไม่ถูกใช้
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(file.createdAt).toLocaleDateString('th-TH')}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 text-slate-600 hover:text-pink-600 hover:bg-slate-100 rounded-lg"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(file)}
                            className="p-1.5 text-slate-600 hover:text-pink-600 hover:bg-slate-100 rounded-lg"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(file)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="ลบไฟล์"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Folders Management Tab */}
      {activeTab === 'folders' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">การจัดการหมวดหมู่โฟลเดอร์</h2>
              <p className="text-xs text-slate-500 mt-1">
                สร้างโฟลเดอร์เพื่อจัดระเบียบไฟล์ภาพ เอกสาร และสื่อมวลชนแยกตามแผนกงาน
              </p>
            </div>
            <button
              onClick={() => handleOpenFolderModal()}
              className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium shadow-md transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              สร้างโฟลเดอร์ใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => {
              const fileCount = files.filter((f) => f.folderId === folder.id).length;

              return (
                <div
                  key={folder.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-2xl text-white shadow-sm"
                      style={{ backgroundColor: folder.color || '#ec4899' }}
                    >
                      <Folder className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{folder.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{fileCount} ไฟล์ในโฟลเดอร์นี้</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setActiveTab('files');
                      }}
                      className="p-2 text-slate-600 hover:text-pink-600 hover:bg-slate-100 rounded-xl"
                      title="เข้าชมไฟล์"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenFolderModal(folder)}
                      className="p-2 text-slate-600 hover:text-pink-600 hover:bg-slate-100 rounded-xl"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id, folder.name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Storage Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-4xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">ตั้งค่าระบบจัดเก็บไฟล์ (Storage Settings)</h2>
            <p className="text-xs text-slate-500 mt-1">
              กำหนดรูปแบบการจัดเก็บข้อมูล (Local, AWS S3 / Object Storage, Google Drive) และการบีบอัดภาพอัตโนมัติ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-800">
                ผู้ให้บริการพื้นที่จัดเก็บ (Storage Provider)
              </label>
              {[
                { id: 'local', name: 'Local Disk Storage (/uploads)', desc: 'เก็บบน ดิสก์เซิร์ฟเวอร์ Cloud Run / Node.js' },
                { id: 's3', name: 'AWS S3 / Cloudflare R2 / GCS', desc: 'Object Storage สำหรับไฟล์ขนาดใหญ่' },
                { id: 'gdrive', name: 'Google Drive API Integration', desc: 'เชื่อมต่อผ่านบัญชีองค์กร Google Workspace' }
              ].map((p) => (
                <label
                  key={p.id}
                  onClick={() => handleSaveSettings({ provider: p.id as StorageProvider })}
                  className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                    settings.provider === p.id
                      ? 'border-pink-500 bg-pink-50/40 ring-2 ring-pink-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={settings.provider === p.id}
                    onChange={() => {}}
                    className="mt-1 text-pink-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 text-sm block">{p.name}</span>
                    <span className="text-xs text-slate-500 block">{p.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Features & Size Limits */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm mb-3">การประมวลผลไฟล์อัตโนมัติ</h4>

              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <span className="font-medium text-xs text-slate-800 block">แปลงภาพเป็น WebP อัตโนมัติ</span>
                  <span className="text-[11px] text-slate-500">ลดขนาดไฟล์ลง 60-80% โดยไม่สูญเสียความคมชัด</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoWebPConversion}
                  onChange={(e) => handleSaveSettings({ autoWebPConversion: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <span className="font-medium text-xs text-slate-800 block">ย่อและบีบอัดขนาดรูปภาพ</span>
                  <span className="text-[11px] text-slate-500">ปรับแก้ภาพขนาดใหญ่เกิน 1920px โดยอัตโนมัติ</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoCompressImages}
                  onChange={(e) => handleSaveSettings({ autoCompressImages: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-xs text-slate-800 block">สร้าง Thumbnail ตัวอย่าง</span>
                  <span className="text-[11px] text-slate-500">สร้างภาพขนาดย่อแสดงผลรวดเร็ว</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.generateThumbnails}
                  onChange={(e) => handleSaveSettings({ generateThumbnails: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded"
                />
              </div>

              <div className="pt-3 border-t">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำกัดขนาดอัปโหลดสูงสุดต่อไฟล์ (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSizeMB}
                  onChange={(e) => handleSaveSettings({ maxFileSizeMB: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================================= */}

      {/* 1. Preview & Metadata Inspector Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row">
            {/* File Display Preview Left side */}
            <div className="md:w-1/2 bg-slate-950 flex items-center justify-center p-6 relative min-h-[250px]">
              {previewFile.fileType === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.altText || previewFile.filename}
                  className="max-h-[70vh] w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-300">
                  {getFileIcon(previewFile.fileType)}
                  <p className="mt-3 font-semibold text-sm">{previewFile.filename}</p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-pink-600 text-white text-xs font-medium rounded-xl hover:bg-pink-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    เปิดดูไฟล์ต้นฉบับ
                  </a>
                </div>
              )}
            </div>

            {/* Inspector Details Right side */}
            <div className="md:w-1/2 p-6 overflow-y-auto space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{previewFile.filename}</h3>
                  <span className="text-xs text-slate-400 block">{previewFile.mimeType}</span>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Compression & Optimization Info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    สถานะการประมวลผล WebP
                  </span>
                  <span>{previewFile.isCompressed ? 'บีบอัดแล้ว' : 'ต้นฉบับ'}</span>
                </div>
                {previewFile.isCompressed && (
                  <p className="text-[11px] text-emerald-700">
                    ลดขนาดจาก {formatBytes(previewFile.originalSize || previewFile.size * 2)} เหลือ{' '}
                    {previewFile.formattedSize} (ประหยัดได้ {previewFile.compressionRatio}%)
                  </p>
                )}
              </div>

              {/* File URL Copy */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  URL ไฟล์ (สำหรับนำไปใช้งาน):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={previewFile.url}
                    className="flex-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                  />
                  <button
                    onClick={() => copyToClipboard(previewFile.url)}
                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700"
                    title="คัดลอก URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Usage References (ตรวจสอบการเชื่อมโยงเนื้อหา) */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  ตรวจสอบการใช้งานในระบบ ({previewFile.usages?.length || 0} รายการ)
                </h4>

                {(!previewFile.usages || previewFile.usages.length === 0) ? (
                  <p className="text-xs text-slate-400">ไฟล์นี้ยังไม่ได้ถูกเชื่อมโยงในเนื้อหาใดๆ</p>
                ) : (
                  <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                    {previewFile.usages.map((u, i) => (
                      <li key={i} className="text-xs bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-bold text-pink-700">{u.module}:</span> {u.title}
                        <span className="text-[10px] text-slate-400 block">ตำแหน่ง: {u.field}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Edit Metadata Quick Button */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    handleOpenEdit(previewFile);
                  }}
                  className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  แก้ไขรายละเอียด (Alt Text/ชื่อ)
                </button>
                <button
                  onClick={() => handleDeleteClick(previewFile)}
                  className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-medium transition-colors"
                >
                  ลบไฟล์
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Metadata Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">แก้ไขข้อมูลไฟล์สื่อ</h3>
              <button onClick={() => setEditingFile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อไฟล์แสดงผล:</label>
                <input
                  type="text"
                  value={editFilename}
                  onChange={(e) => setEditFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alt Text (ข้อความแทนภาพ SEO & Accessibility):</label>
                <input
                  type="text"
                  placeholder="อธิบายรูปภาพสั้นๆ สำหรับคนตาบอดและ SEO..."
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">คำอธิบายเพิ่มเติม (Description):</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">แท็ก / คำสำคัญ (คั่นด้วยจุลภาค ,):</label>
                <input
                  type="text"
                  placeholder="ข่าว, กิจกรรม, มจร..."
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">โฟลเดอร์ที่จัดเก็บ:</label>
                <select
                  value={editFolderId || 'root'}
                  onChange={(e) => setEditFolderId(e.target.value === 'root' ? null : e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="root">📂 หน้าหลัก (Root)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingFile(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveMetadata}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-medium shadow-md"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Safety Lock Delete Confirmation Modal */}
      {deleteLockFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  ล็อคความปลอดภัย: ไม่สามารถลบไฟล์ได้ทันที
                </h3>
                <p className="text-xs text-slate-500">
                  ไฟล์นี้ถูกตรวจพบว่ากำลังถูกใช้งานอยู่ในเนื้อหาเว็บไซต์
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 space-y-2">
              <p className="font-semibold">
                รายการเนื้อหาที่เชื่อมโยงกับไฟล์ "{deleteLockFile.file.filename}":
              </p>
              <ul className="space-y-1.5 max-h-36 overflow-y-auto">
                {deleteLockFile.usages.map((u, idx) => (
                  <li key={idx} className="bg-white p-2 rounded-lg border border-rose-100 text-slate-700">
                    <span className="font-bold text-pink-700">{u.module}:</span> {u.title}
                    <span className="text-[10px] text-slate-400 block">ฟิลด์: {u.field}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-rose-700 italic">
                * หากลบไฟล์นี้ ลิงก์หรือรูปภาพในเนื้อหาข้างต้นอาจแสดงผลผิดพลาด (Link Broken)
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={forceDeleteConfirm}
                  onChange={(e) => setForceDeleteConfirm(e.target.checked)}
                  className="rounded text-rose-600"
                />
                ยืนยันการบังคับลบไฟล์ (Force Delete) และยอมรับความเสี่ยง
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setDeleteLockFile(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                ยกเลิกการลบ
              </button>
              <button
                disabled={!forceDeleteConfirm}
                onClick={handleForceDelete}
                className={`px-5 py-2 text-white rounded-xl text-xs font-medium transition-all ${
                  forceDeleteConfirm
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-md'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                บังคับลบไฟล์ทันที
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Folder Creation / Editing Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveFolder();
            }}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="font-bold text-slate-900 text-base">
              {editingFolder ? 'แก้ไขชื่อโฟลเดอร์' : 'สร้างโฟลเดอร์ใหม่'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อโฟลเดอร์:</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="เช่น ภาพข่าว PR 2569..."
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">สีสัญลักษณ์โฟลเดอร์:</label>
                <div className="flex items-center gap-2">
                  {['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFolderColorInput(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        folderColorInput === c ? 'ring-2 ring-slate-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-medium shadow-md cursor-pointer"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Batch Move Modal */}
      {showBatchMoveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">ย้ายไฟล์ {selectedFileIds.length} รายการ</h3>

            <div className="text-xs space-y-2">
              <label className="font-semibold text-slate-700 block">เลือกโฟลเดอร์ปลายทาง:</label>
              <select
                value={batchMoveFolderId}
                onChange={(e) => setBatchMoveFolderId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              >
                <option value="root">📂 หน้าหลัก (Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowBatchMoveModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBatchMove}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-medium shadow-md"
              >
                ย้ายไฟล์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {showBatchDeleteModal && (
        <Modal
          isOpen={showBatchDeleteModal}
          onClose={() => setShowBatchDeleteModal(false)}
          title="ยืนยันการลบไฟล์สื่อหลายรายการ"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmBatchDelete}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบไฟล์ที่เลือก ({selectedFileIds.length})</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณต้องการลบไฟล์ที่เลือกทั้งหมดจำนวน <strong className="text-rose-600">{selectedFileIds.length}</strong> รายการใช่หรือไม่?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "ลบไฟล์สื่อจำนวน {selectedFileIds.length} รายการออกจากคลัง"
            </div>
          </div>
        </Modal>
      )}

      {/* FOLDER DELETE CONFIRMATION MODAL */}
      {deleteConfirmFolder && (
        <Modal
          isOpen={!!deleteConfirmFolder}
          onClose={() => setDeleteConfirmFolder(null)}
          title="ยืนยันการลบโฟลเดอร์สื่อ"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmFolder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteFolder}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบโฟลเดอร์</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณต้องการลบโฟลเดอร์นี้หรือไม่? (ไฟล์ภายในโฟลเดอร์จะถูกย้ายออกไปยังหน้าหลัก)
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmFolder.name}"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
