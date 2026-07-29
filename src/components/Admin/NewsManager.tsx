/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { NewsItem, NewsStatus, NewsAttachment } from '../../types';
import { AdminHeader } from '../ui/AdminHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { InputField, SelectField, TextareaField } from '../ui/FormControls';
import VersionHistoryModal from './VersionHistoryModal';
import {
  FileText,
  Edit3,
  Trash2,
  Eye,
  History,
  CheckCircle2,
  Calendar,
  Tag,
  Plus,
  Search,
  Sparkles,
  Image as ImageIcon,
  Video,
  Download,
  Globe,
  User,
  Clock,
  AlertTriangle,
  X,
  RefreshCw,
  FolderDown,
  Paperclip,
  Share2,
  Layers,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';
import { getEmbeddableDriveUrl } from '../../lib/driveUtils';

interface NewsManagerProps {
  onNotify: (text: string, type: 'success' | 'error') => void;
}

const POPULAR_TAGS = [
  '#รับสมัคร2569',
  '#วิชาการ',
  '#สัมมนา',
  '#กิจกรรมนิสิต',
  '#เพชรบูรณ์',
  '#ทุนการศึกษา',
  '#พุทธศาสน์ศึกษา',
  '#รัฐประศาสนศาสตร์'
];

const STATUS_CONFIG: Record<NewsStatus, { labelTh: string; bgClass: string; borderClass: string; textClass: string }> = {
  Draft: { labelTh: 'แบบร่าง (Draft)', bgClass: 'bg-slate-100', borderClass: 'border-slate-200', textClass: 'text-slate-700' },
  'Pending Review': { labelTh: 'รอตรวจทาน (Review)', bgClass: 'bg-amber-50', borderClass: 'border-amber-200', textClass: 'text-amber-800' },
  Scheduled: { labelTh: 'ตั้งเวลาเผยแพร่ (Scheduled)', bgClass: 'bg-indigo-50', borderClass: 'border-indigo-200', textClass: 'text-indigo-800' },
  Published: { labelTh: 'เผยแพร่แล้ว (Published)', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200', textClass: 'text-emerald-800' },
  Archived: { labelTh: 'จัดเก็บแล้ว (Archived)', bgClass: 'bg-purple-50', borderClass: 'border-purple-200', textClass: 'text-purple-800' },
  Expired: { labelTh: 'หมดอายุ (Expired)', bgClass: 'bg-rose-50', borderClass: 'border-rose-200', textClass: 'text-rose-800' },
  Hidden: { labelTh: 'ซ่อนการแสดงผล (Hidden)', bgClass: 'bg-gray-100', borderClass: 'border-gray-200', textClass: 'text-gray-600' },
  Flagged: { labelTh: 'ต้องแก้ไข (Flagged)', bgClass: 'bg-orange-50', borderClass: 'border-orange-200', textClass: 'text-orange-800' }
};

export default function NewsManager({ onNotify }: NewsManagerProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);
  const [historyModalItem, setHistoryModalItem] = useState<{ id: string; title: string } | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form Fields State
  const [formData, setFormData] = useState<{
    changeSummary: string;
    isFeatured: boolean;
    title: string;
    titleEn: string;
    category: string;
    categoryLabel: string;
    status: NewsStatus;
    slug: string;
    tags: string[];
    customTagInput: string;
    date: string;
    scheduledAt: string;
    expiredAt: string;
    authorName: string;
    authorRole: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    galleryUrls: string[];
    newGalleryInput: string;
    videoUrl: string;
    attachments: NewsAttachment[];
    newAttName: string;
    newAttUrl: string;
    newAttSize: string;
    newAttFormat: string;
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
  }>({
    changeSummary: 'สร้างข่าวสาร / กิจกรรมใหม่',
    isFeatured: false,
    title: '',
    titleEn: '',
    category: 'ข่าวประชาสัมพันธ์',
    categoryLabel: 'ข่าวประชาสัมพันธ์',
    status: 'Published',
    slug: '',
    tags: ['#รับสมัคร2569', '#วิชาการ'],
    customTagInput: '',
    date: new Date().toISOString().split('T')[0],
    scheduledAt: '',
    expiredAt: '',
    authorName: 'งานประชาสัมพันธ์ วิทยาลัยสงฆ์พ่อขุนผาเมือง',
    authorRole: 'เจ้าหน้าที่ประชาสัมพันธ์',
    excerpt: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800'
    ],
    newGalleryInput: '',
    videoUrl: '',
    attachments: [
      { id: 'att_1', name: 'เอกสารประชาสัมพันธ์_2569.pdf', url: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view', size: '1.5 MB', format: 'PDF' }
    ],
    newAttName: '',
    newAttUrl: '',
    newAttSize: '1.2 MB',
    newAttFormat: 'PDF',
    seoTitle: '',
    seoKeywords: 'มจร, รับสมัครนิสิต, ปริญญาตรี, เพชรบูรณ์',
    seoDescription: ''
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await api.getNews();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (e: any) {
      onNotify('ไม่สามารถโหลดข้อมูลข่าวสารได้: ' + (e.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Helper to generate URL slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `news-${Date.now()}`;
  };

  const handleOpenForm = (item?: NewsItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        changeSummary: `แก้ไขปรับปรุงรายละเอียดข่าวสาร "${item.title}"`,
        isFeatured: item.isFeatured || false,
        title: item.title || '',
        titleEn: item.titleEn || '',
        category: item.category || 'ข่าวประชาสัมพันธ์',
        categoryLabel: item.categoryLabel || item.category || 'ข่าวประชาสัมพันธ์',
        status: item.status || 'Published',
        slug: item.slug || generateSlug(item.title || ''),
        tags: item.tags && item.tags.length > 0 ? item.tags : ['#รับสมัคร2569', '#วิชาการ'],
        customTagInput: '',
        date: item.date || new Date().toISOString().split('T')[0],
        scheduledAt: item.scheduledAt || '',
        expiredAt: item.expiredAt || '',
        authorName: item.authorName || 'งานประชาสัมพันธ์ วิทยาลัยสงฆ์พ่อขุนผาเมือง',
        authorRole: item.authorRole || 'เจ้าหน้าที่ประชาสัมพันธ์',
        excerpt: item.excerpt || '',
        content: item.content || '',
        imageUrl: item.imageUrl || '',
        galleryUrls: item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : [],
        newGalleryInput: '',
        videoUrl: item.videoUrl || '',
        attachments: item.attachments || [],
        newAttName: '',
        newAttUrl: '',
        newAttSize: '1.5 MB',
        newAttFormat: 'PDF',
        seoTitle: item.seoTitle || item.title || '',
        seoKeywords: item.seoKeywords || 'มจร, รับสมัครนิสิต, ปริญญาตรี, เพชรบูรณ์',
        seoDescription: item.seoDescription || item.excerpt || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        changeSummary: 'สร้างข่าวสาร / กิจกรรมใหม่',
        isFeatured: false,
        title: '',
        titleEn: '',
        category: 'ข่าวประชาสัมพันธ์',
        categoryLabel: 'ข่าวประชาสัมพันธ์',
        status: 'Published',
        slug: '',
        tags: ['#รับสมัคร2569', '#วิชาการ'],
        customTagInput: '',
        date: new Date().toISOString().split('T')[0],
        scheduledAt: '',
        expiredAt: '',
        authorName: 'งานประชาสัมพันธ์ วิทยาลัยสงฆ์พ่อขุนผาเมือง',
        authorRole: 'เจ้าหน้าที่ประชาสัมพันธ์',
        excerpt: '',
        content: '',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        galleryUrls: [
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800'
        ],
        newGalleryInput: '',
        videoUrl: '',
        attachments: [
          { id: 'att_1', name: 'เอกสารประชาสัมพันธ์_2569.pdf', url: 'https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view', size: '1.5 MB', format: 'PDF' }
        ],
        newAttName: '',
        newAttUrl: '',
        newAttSize: '1.2 MB',
        newAttFormat: 'PDF',
        seoTitle: '',
        seoKeywords: 'มจร, รับสมัครนิสิต, ปริญญาตรี, เพชรบูรณ์',
        seoDescription: ''
      });
    }
    setIsFormOpen(true);
  };

  // Add tag helper
  const handleAddTag = (tagToAdd: string) => {
    if (!tagToAdd.trim()) return;
    const cleanTag = tagToAdd.trim().startsWith('#') ? tagToAdd.trim() : `#${tagToAdd.trim()}`;
    if (!formData.tags.includes(cleanTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanTag], customTagInput: '' }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  // Add gallery image helper
  const handleAddGalleryUrl = () => {
    if (!formData.newGalleryInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      galleryUrls: [...prev.galleryUrls, prev.newGalleryInput.trim()],
      newGalleryInput: ''
    }));
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, idx) => idx !== index)
    }));
  };

  // Add attachment helper
  const handleAddAttachment = () => {
    if (!formData.newAttName.trim() || !formData.newAttUrl.trim()) {
      alert('กรุณากรอกชื่อไฟล์และ URL เอกสารดาวน์โหลด');
      return;
    }
    const newAtt: NewsAttachment = {
      id: 'att_' + Date.now(),
      name: formData.newAttName.trim(),
      url: formData.newAttUrl.trim(),
      size: formData.newAttSize.trim() || '1.0 MB',
      format: formData.newAttFormat || 'PDF'
    };
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, newAtt],
      newAttName: '',
      newAttUrl: ''
    }));
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }));
  };

  // Form Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      onNotify('กรุณากรอกหัวข้อข่าวและเนื้อหาข่าวให้ครบถ้วน', 'error');
      return;
    }

    const payload: Partial<NewsItem> = {
      title: formData.title.trim(),
      titleEn: formData.titleEn.trim(),
      category: formData.category,
      categoryLabel: formData.category,
      isFeatured: formData.isFeatured,
      status: formData.status,
      slug: formData.slug || generateSlug(formData.title),
      tags: formData.tags,
      date: formData.date,
      scheduledAt: formData.scheduledAt,
      expiredAt: formData.expiredAt,
      authorName: formData.authorName,
      authorRole: formData.authorRole,
      excerpt: formData.excerpt.trim() || formData.title.trim(),
      content: formData.content.trim(),
      imageUrl: formData.imageUrl.trim(),
      galleryUrls: formData.galleryUrls,
      videoUrl: formData.videoUrl.trim(),
      attachments: formData.attachments,
      seoTitle: formData.seoTitle || formData.title,
      seoKeywords: formData.seoKeywords,
      seoDescription: formData.seoDescription || formData.excerpt,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingItem) {
        await api.updateNews(editingItem.id, payload);
        onNotify('บันทึกการแก้ไขข่าวสารเรียบร้อยแล้ว', 'success');
      } else {
        await api.createNews(payload as any);
        onNotify('สร้างข่าวสาร / กิจกรรมใหม่เรียบร้อยแล้ว', 'success');
      }
      setIsFormOpen(false);
      fetchNews();
    } catch (e: any) {
      onNotify('ไม่สามารถบันทึกข้อมูลข่าวสารได้: ' + (e.message || ''), 'error');
    }
  };

  // Confirm Delete Handler
  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const targetId = deleteConfirmItem.id;
    setIsDeleting(true);

    // Optimistic UI state removal
    setNewsList(prev => prev.filter(n => String(n.id) !== String(targetId)));

    try {
      await api.deleteNews(targetId);
      onNotify(`ลบข่าวสาร "${deleteConfirmItem.title}" เรียบร้อยแล้ว`, 'success');
    } catch (e: any) {
      onNotify('ไม่สามารถลบข่าวสารได้: ' + (e.message || ''), 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmItem(null);
      fetchNews();
    }
  };

  // Filtered News Items
  const filteredNews = newsList.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchEn = item.titleEn?.toLowerCase().includes(q);
      const matchAuthor = item.authorName?.toLowerCase().includes(q);
      return matchTitle || matchEn || matchAuthor;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <AdminHeader
        title="ระบบจัดการข่าวสารและกิจกรรม (News & Events CMS)"
        subtitle="รองรับวงจรสถานะข้อมูล 8 ขั้นตอน การตั้งเวลาเผยแพร่ อัลบั้มภาพประกอบ (6+ รูป) และ SEO รายบทความ"
        icon={<FileText className="w-6 h-6 text-mcu-pink font-bold" />}
        onRefresh={fetchNews}
        onAddNew={() => handleOpenForm()}
        addNewLabel="สร้างข่าวสาร / กิจกรรมใหม่"
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อข่าวสาร, หัวข้อภาษาอังกฤษ, ชื่อผู้เขียน..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink"
          >
            <option value="all">ทุกหมวดหมู่ข่าว</option>
            <option value="ข่าวประชาสัมพันธ์">ข่าวประชาสัมพันธ์</option>
            <option value="ข่าววิชาการ">ข่าววิชาการ</option>
            <option value="ข่าวกิจกรรม">ข่าวกิจกรรม</option>
            <option value="ประกาศมหาวิทยาลัย">ประกาศมหาวิทยาลัย</option>
            <option value="ข่าวกิจการนิสิต">ข่าวกิจการนิสิต</option>
            <option value="ข่าวจัดซื้อจัดจ้าง">ข่าวจัดซื้อจัดจ้าง</option>
          </select>
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-pink"
          >
            <option value="all">ทุกสถานะ (8 ขั้นตอน)</option>
            {Object.entries(STATUS_CONFIG).map(([stKey, stMeta]) => (
              <option key={stKey} value={stKey}>{stMeta.labelTh}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-mcu-pink" />
            <p className="text-xs">กำลังโหลดคลังข่าวสารและกิจกรรม...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">ไม่พบรายการข่าวสารตามเงื่อนไขที่เลือก</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-4 whitespace-nowrap min-w-[280px]">ภาพปก & หัวข้อข่าวสาร</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">หมวดหมู่ & แท็ก</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[160px]">ผู้เขียน / ผู้จัดการ</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[120px]">วันที่เผยแพร่</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap min-w-[140px]">สถานะ (8 Lifecycles)</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap min-w-[110px]">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNews.map((item) => {
                  const stMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.Published;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Image & Title */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <img
                            src={getEmbeddableDriveUrl(item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400')}
                            alt={item.title}
                            className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.isFeatured && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-200 whitespace-nowrap">
                                  ★ ข่าวเด่น
                                </span>
                              )}
                              <span className="font-bold text-slate-800 line-clamp-2">{item.title}</span>
                            </div>
                            {item.titleEn && (
                              <p className="text-[11px] text-slate-400 italic line-clamp-1">{item.titleEn}</p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 whitespace-nowrap">
                              {item.galleryUrls && item.galleryUrls.length > 0 && (
                                <span className="flex items-center gap-1 text-mcu-pink font-medium">
                                  <ImageIcon size={12} /> {item.galleryUrls.length} ภาพในอัลบั้ม
                                </span>
                              )}
                              {item.attachments && item.attachments.length > 0 && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                  <Paperclip size={12} /> {item.attachments.length} เอกสารแนบ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Tags */}
                      <td className="py-3.5 px-4 space-y-1 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                          {item.categoryLabel || item.category}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tg, i) => (
                              <span key={i} className="text-[10px] text-slate-500 font-mono bg-slate-50 px-1.5 py-0.2 rounded whitespace-nowrap">
                                {tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 text-xs space-y-0.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <User size={12} className="text-slate-400 shrink-0" />
                          <span>{item.authorName || 'ฝ่ายประชาสัมพันธ์'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{item.authorRole || 'เจ้าหน้าที่'}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 space-y-0.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-mcu-gold shrink-0" />
                          <span>{item.date}</span>
                        </div>
                        {item.scheduledAt && (
                          <div className="text-[10px] text-indigo-600 font-mono">
                            ตั้งเวลา: {item.scheduledAt.replace('T', ' ')}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${stMeta.bgClass} ${stMeta.borderClass} ${stMeta.textClass}`}>
                          {stMeta.labelTh}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="ดูตัวอย่างข่าวสาร"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryModalItem({ id: item.id, title: item.title })}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="ประวัติการแก้ไข (Revision History)"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenForm(item)}
                          className="p-1.5 text-mcu-pink hover:bg-mcu-pink-soft rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขข่าวสาร"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem({ id: item.id, title: item.title })}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบข่าวสาร"
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

      {/* FORM MODAL (CREATE / EDIT NEWS) */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingItem ? `แก้ไขข่าวสาร / กิจกรรม: "${editingItem.title}"` : 'สร้างข่าวสาร / กิจกรรมใหม่'}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                * กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนบันทึก
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-mcu-pink hover:bg-mcu-pink-deep rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editingItem ? 'บันทึกการแก้ไข' : 'สร้างข่าวสาร / เผยแพร่'}</span>
                </button>
              </div>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-6 text-xs sm:text-sm py-2">
            
            {/* 0. เหตุผลการบันทึก/แก้ไข */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
              <label className="block font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                <History className="w-4 h-4 text-amber-700" />
                <span>เหตุผลการบันทึก/แก้ไข (Revision Summary) *</span>
              </label>
              <input
                type="text"
                value={formData.changeSummary}
                onChange={(e) => setFormData({ ...formData, changeSummary: e.target.value })}
                placeholder="ระบุเหตุผลในการบันทึก เช่น สร้างข่าวสารใหม่, แก้ไขวันเวลาจัดงาน..."
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 font-medium"
              />
            </div>

            {/* 1. ข้อมูลหลักของข่าวสาร (Basic Info) */}
            <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Bookmark className="w-4 h-4 text-mcu-pink" />
                  <span>1. ข้อมูลหลักของข่าวสาร (Basic Info)</span>
                </h3>

                {/* Featured Switch */}
                <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-amber-900">★ เลือกเป็นข่าวเด่นหน้าแรก (Featured News)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField
                    label="หัวข้อข่าว (ภาษาไทย) *"
                    value={formData.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        title: val,
                        slug: prev.slug ? prev.slug : generateSlug(val),
                        seoTitle: prev.seoTitle ? prev.seoTitle : val
                      }));
                    }}
                    placeholder="ระบุหัวข้อข่าวหรือชื่อกิจกรรม..."
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <InputField
                    label="หัวข้อข่าว (ภาษาอังกฤษ / English Title)"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="News title in English..."
                  />
                </div>

                <div>
                  <SelectField
                    label="หมวดหมู่ข่าวสาร *"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, categoryLabel: e.target.value })}
                    options={[
                      { value: 'ข่าวประชาสัมพันธ์', label: 'ข่าวประชาสัมพันธ์' },
                      { value: 'ข่าววิชาการ', label: 'ข่าววิชาการ' },
                      { value: 'ข่าวกิจกรรม', label: 'ข่าวกิจกรรม' },
                      { value: 'ประกาศมหาวิทยาลัย', label: 'ประกาศมหาวิทยาลัย' },
                      { value: 'ข่าวกิจการนิสิต', label: 'ข่าวกิจการนิสิต' },
                      { value: 'ข่าวจัดซื้อจัดจ้าง', label: 'ข่าวจัดซื้อจัดจ้าง' }
                    ]}
                  />
                </div>

                <div>
                  <SelectField
                    label="สถานะข้อมูล (8 Status Lifecycle) *"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as NewsStatus })}
                    options={Object.entries(STATUS_CONFIG).map(([stKey, stMeta]) => ({
                      value: stKey,
                      label: stMeta.labelTh
                    }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">URL Slug อัตโนมัติ</label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                      className="text-[11px] font-bold text-mcu-pink hover:underline flex items-center gap-1"
                    >
                      <span>สร้างจากชื่อข่าว</span>
                    </button>
                  </div>
                  <InputField
                    label=""
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. admissions-2569"
                  />
                </div>

                {/* Tags Picker */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">เลือกแท็กประกอบ (Tags)</label>
                  
                  {/* Selected Tags list */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200 min-h-[38px] items-center">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-mcu-pink-soft text-mcu-pink-deep text-xs font-bold border border-mcu-pink-light">
                        <span>{tag}</span>
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-rose-600">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick Tag Recommendations */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 self-center">แท็กยอดนิยม:</span>
                    {POPULAR_TAGS.map((popTag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddTag(popTag)}
                        className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 hover:bg-mcu-pink-soft hover:text-mcu-pink text-slate-600 border border-slate-200 transition-colors"
                      >
                        + {popTag}
                      </button>
                    ))}
                  </div>

                  {/* Add Custom Tag */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={formData.customTagInput}
                      onChange={(e) => setFormData({ ...formData, customTagInput: e.target.value })}
                      placeholder="พิมพ์แท็กใหม่..."
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs flex-grow focus:outline-none focus:ring-2 focus:ring-mcu-pink"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(formData.customTagInput)}
                      className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                    >
                      เพิ่มแท็ก
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. การเผยแพร่ ผู้เขียน และการตั้งเวลา (Publishing & Schedule) */}
            <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-200 pb-3">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>2. การเผยแพร่ ผู้เขียน และการตั้งเวลา (Publishing & Schedule)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <InputField
                    label="วันที่แสดงผลหลัก *"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <InputField
                    label="วัน/เวลาตั้งเวลาเผยแพร่ (Scheduled Date)"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>

                <div>
                  <InputField
                    label="วันหมดอายุการแสดงผล (Expiration Date)"
                    type="datetime-local"
                    value={formData.expiredAt}
                    onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <InputField
                    label="ชื่อผู้เขียน/เจ้าของบทความ"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="งานประชาสัมพันธ์ วิทยาลัยสงฆ์พ่อขุนผาเมือง"
                  />
                </div>

                <div>
                  <InputField
                    label="ตำแหน่งผู้เขียน"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    placeholder="เจ้าหน้าที่ประชาสัมพันธ์"
                  />
                </div>
              </div>
            </div>

            {/* 3. เนื้อหาข่าวสารและเนื้อหาย่อ (Content & Excerpt) */}
            <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-200 pb-3">
                <FileText className="w-4 h-4 text-mcu-pink" />
                <span>3. เนื้อหาข่าวสารและเนื้อหาย่อ (Content & Excerpt)</span>
              </h3>

              <div className="space-y-4">
                <TextareaField
                  label="ข้อความย่อสรุปความ (Excerpt)"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  placeholder="สรุปเนื้อหาข่าวสั้นๆ 2-3 บรรทัด สำหรับแสดงบนการ์ดข่าว..."
                />

                <TextareaField
                  label="เนื้อหาข่าวฉบับเต็ม (Full Content) *"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="รายละเอียดเนื้อหาข่าวสาร โครงการ กิจกรรม..."
                  required
                />
              </div>
            </div>

            {/* 4. สื่อประกอบ: รูปปก อัลบั้มภาพ (6+ รูป) และวิดีโอ (Media Assets) */}
            <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-200 pb-3">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>4. สื่อประกอบ: รูปปก อัลบั้มภาพ (6+ รูป) และวิดีโอ (Media Assets)</span>
              </h3>

              <div className="space-y-4">
                {/* Cover Image */}
                <div>
                  <InputField
                    label="URL รูปภาพปกหลัก (Cover Image)"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 relative h-32 w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={getEmbeddableDriveUrl(formData.imageUrl)}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">ภาพปกหลัก</span>
                    </div>
                  )}
                </div>

                {/* Album Gallery (6+ Images) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>อัลบั้มภาพประกอบข่าวสาร (Gallery Album - รองรับอย่างน้อย 6 ภาพ)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {formData.galleryUrls.length} ภาพ
                      </span>
                    </label>
                  </div>

                  {/* Gallery Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.newGalleryInput}
                      onChange={(e) => setFormData({ ...formData, newGalleryInput: e.target.value })}
                      placeholder="วาง URL รูปภาพแล้วกดบวกเพิ่มในอัลบั้ม..."
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs flex-grow focus:outline-none focus:ring-2 focus:ring-mcu-pink"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>เพิ่มภาพ</span>
                    </button>
                  </div>

                  {/* Gallery Grid (At least 6 Image Cards) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                    {formData.galleryUrls.map((url, idx) => (
                      <div key={idx} className="relative group h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                        <img
                          src={getEmbeddableDriveUrl(url)}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryUrl(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="ลบรูปนี้"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <InputField
                    label="URL ฝังวิดีโอ (YouTube / Vimeo Embed URL)"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
              </div>
            </div>

            {/* 5. การแนบไฟล์ดาวน์โหลด (Downloadable Attachments) */}
            <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-200 pb-3">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span>5. การแนบไฟล์ดาวน์โหลด (Downloadable Attachments)</span>
              </h3>

              <div className="space-y-3">
                {/* Input Add Attachment */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={formData.newAttName}
                      onChange={(e) => setFormData({ ...formData, newAttName: e.target.value })}
                      placeholder="ชื่อเอกสาร e.g. คู่มือสมัครเรียน.pdf"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={formData.newAttUrl}
                      onChange={(e) => setFormData({ ...formData, newAttUrl: e.target.value })}
                      placeholder="URL เอกสาร หรือ Google Drive link"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={formData.newAttSize}
                      onChange={(e) => setFormData({ ...formData, newAttSize: e.target.value })}
                      placeholder="ขนาด e.g. 1.5 MB"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="w-full h-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>แนบ</span>
                    </button>
                  </div>
                </div>

                {/* Attachments List */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    {formData.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip size={14} className="text-blue-600" />
                          <span className="font-bold text-slate-800">{att.name}</span>
                          <span className="text-[10px] text-slate-400">({att.size || 'PDF'})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 6. การกำหนด SEO แยกเฉพาะข่าว (Custom SEO per Article) */}
            <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-200 pb-3">
                <Globe className="w-4 h-4 text-purple-600" />
                <span>6. การกำหนด SEO แยกเฉพาะข่าว (Custom SEO per Article)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputField
                    label="SEO Title Tag"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="e.g. รับสมัครนิสิตใหม่ 2569 | วิทยาลัยสงฆ์พ่อขุนผาเมือง"
                  />
                </div>

                <div>
                  <InputField
                    label="SEO Keywords (คั่นด้วยจุลภาค)"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="e.g. มจร, รับสมัครนิสิต, ปริญญาตรี, เพชรบูรณ์"
                  />
                </div>

                <div className="sm:col-span-2">
                  <TextareaField
                    label="SEO Meta Description"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    rows={2}
                    placeholder="รายละเอียดสำหรับแสดงผลบน Google Search engine..."
                  />
                </div>
              </div>
            </div>

          </form>
        </Modal>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={`ดูตัวอย่างข่าวสาร: "${previewItem.title}"`}
          maxWidth="4xl"
        >
          <div className="space-y-4 text-xs sm:text-sm py-2">
            <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={getEmbeddableDriveUrl(previewItem.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800')}
                alt={previewItem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded bg-slate-900/80 text-white font-bold text-xs shadow-md">
                  {previewItem.categoryLabel || previewItem.category}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{previewItem.title}</h2>
              {previewItem.titleEn && <p className="text-xs text-slate-400 italic mt-0.5">{previewItem.titleEn}</p>}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <span>📅 วันที่: {previewItem.date}</span>
              <span>👤 โดย: {previewItem.authorName || 'งานประชาสัมพันธ์'}</span>
            </div>

            <p className="text-slate-700 leading-relaxed indent-6 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
              {previewItem.content}
            </p>

            {/* Gallery Preview Grid */}
            {previewItem.galleryUrls && previewItem.galleryUrls.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-xs text-slate-800">🖼️ อัลบั้มภาพประกอบ ({previewItem.galleryUrls.length} ภาพ)</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {previewItem.galleryUrls.map((gUrl, i) => (
                    <div key={i} className="h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={getEmbeddableDriveUrl(gUrl)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* VERSION HISTORY MODAL */}
      {historyModalItem && (
        <VersionHistoryModal
          isOpen={!!historyModalItem}
          onClose={() => setHistoryModalItem(null)}
          contentType="news"
          contentId={historyModalItem.id}
          contentTitle={historyModalItem.title}
          onRestored={() => fetchNews()}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <Modal
          isOpen={!!deleteConfirmItem}
          onClose={() => setDeleteConfirmItem(null)}
          title="ยืนยันการลบข่าวสาร / กิจกรรม"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบข่าวสาร'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการข่าวสารนี้? ข้อมูลและอัลบั้มภาพประกอบจะถูกถอดออกจากระบบทันที
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmItem.title}"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
