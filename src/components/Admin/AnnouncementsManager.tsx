/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  FileText, 
  Calendar, 
  Building2, 
  Tag, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Save, 
  X,
  FileSpreadsheet,
  File,
  Archive,
  UploadCloud,
  FolderDown
} from 'lucide-react';
import { AnnouncementItem, AnnouncementCategory, AnnouncementAttachment } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import VersionHistoryModal from './VersionHistoryModal';

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  // Delete Confirm Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Version History Modal State
  const [historyModalItem, setHistoryModalItem] = useState<{ id: string; title: string } | null>(null);
  const [changeSummary, setChangeSummary] = useState<string>('');

  // Form Fields
  const [formData, setFormData] = useState<{
    title: string;
    titleEn: string;
    category: AnnouncementCategory;
    announcementNo: string;
    publisher: string;
    isPinned: boolean;
    isUrgent: boolean;
    startDate: string;
    endDate: string;
    yearTh: string;
    excerpt: string;
    content: string;
    allowDownload: boolean;
    status: 'active' | 'scheduled' | 'expired' | 'draft';
    attachments: AnnouncementAttachment[];
  }>({
    title: '',
    titleEn: '',
    category: 'general',
    announcementNo: '',
    publisher: 'งานสารบรรณและวิทยาลัย',
    isPinned: false,
    isUrgent: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    yearTh: '2569',
    excerpt: '',
    content: '',
    allowDownload: true,
    status: 'active',
    attachments: []
  });

  // Temporary attachment input state
  const [newAttName, setNewAttName] = useState<string>('');
  const [newAttUrl, setNewAttUrl] = useState<string>('');
  const [newAttType, setNewAttType] = useState<'pdf' | 'doc' | 'xls' | 'zip' | 'img' | 'other'>('pdf');
  const [newAttSize, setNewAttSize] = useState<string>('1.5 MB');

  // Load announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load announcements for admin:', e);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Open modal for new announcement
  const handleOpenNewModal = () => {
    setEditingItem(null);
    setChangeSummary('สร้างประกาศใหม่');
    setFormData({
      title: '',
      titleEn: '',
      category: 'general',
      announcementNo: `วส.พม. ทป ${Math.floor(Math.random() * 90 + 10)}/2569`,
      publisher: 'งานสารบรรณและวิทยาลัย',
      isPinned: false,
      isUrgent: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      yearTh: '2569',
      excerpt: '',
      content: '',
      allowDownload: true,
      status: 'active',
      attachments: []
    });
    setIsModalOpen(true);
  };

  // Open modal for editing announcement
  const handleOpenEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setChangeSummary(`แก้ไขและปรับปรุงรายละเอียดประกาศ "${item.title}"`);
    setFormData({
      title: item.title,
      titleEn: item.titleEn || '',
      category: item.category,
      announcementNo: item.announcementNo || '',
      publisher: item.publisher || 'งานสารบรรณและวิทยาลัย',
      isPinned: item.isPinned || false,
      isUrgent: item.isUrgent || false,
      startDate: item.startDate || new Date().toISOString().split('T')[0],
      endDate: item.endDate || '',
      yearTh: item.yearTh || '2569',
      excerpt: item.excerpt || '',
      content: item.content || '',
      allowDownload: item.allowDownload ?? true,
      status: item.status || 'active',
      attachments: item.attachments ? [...item.attachments] : []
    });
    setIsModalOpen(true);
  };

  // Add attachment to form list
  const handleAddAttachment = () => {
    if (!newAttName.trim() || !newAttUrl.trim()) {
      alert('กรุณากรอกชื่อไฟล์และ URL ดาวน์โหลด');
      return;
    }
    const newAtt: AnnouncementAttachment = {
      id: 'att_' + Date.now(),
      name: newAttName.trim(),
      url: newAttUrl.trim(),
      fileType: newAttType,
      size: newAttSize.trim() || '1.0 MB',
      downloadCount: 0
    };
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAtt] }));
    setNewAttName('');
    setNewAttUrl('');
  };

  // Remove attachment from form list
  const handleRemoveAttachment = (attId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }));
  };

  // Save (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('กรุณากรอกชื่อประกาศ');
      return;
    }

    try {
      const payload = {
        ...formData,
        changeSummary: changeSummary || (editingItem ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่')
      };

      if (editingItem) {
        await api.updateAnnouncement(editingItem.id, payload);
      } else {
        await api.createAnnouncement(payload);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกประกาศ: ' + (err.message || 'Unknown error'));
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id: string) => {
    try {
      await api.togglePinAnnouncement(id);
      fetchAnnouncements();
    } catch (e) {
      console.error('Failed to toggle pin:', e);
    }
  };

  // Open Delete Confirmation Modal
  const handleDelete = (id: string, title: string) => {
    setDeleteConfirmItem({ id, title });
  };

  // Perform Delete Action
  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const targetId = deleteConfirmItem.id;
    setIsDeleting(true);

    // Optimistic UI state removal
    setAnnouncements(prev => prev.filter(a => {
      const aId = String(a.id || '').trim();
      const tId = String(targetId || '').trim();
      return aId !== tId && aId.replace(/^anc_/, '') !== tId.replace(/^anc_/, '');
    }));

    try {
      await api.deleteAnnouncement(targetId);
    } catch (e) {
      console.error('Failed to delete announcement:', e);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmItem(null);
      fetchAnnouncements();
    }
  };

  // Filtered list
  const filteredList = announcements.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNo = item.announcementNo?.toLowerCase().includes(q);
      const matchPub = item.publisher?.toLowerCase().includes(q);
      return matchTitle || matchNo || matchPub;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-mcu-teal" />
            <span>ระบบจัดการประกาศวิทยาลัย (Announcements CMS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            เพิ่ม แก้ไข ปักหมุด และจัดการเอกสารแนบดาวน์โหลดสำหรับประกาศทางวิชาการ จัดซื้อจัดจ้าง และรับสมัคร
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2.5 bg-mcu-deep-teal hover:bg-mcu-teal text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างประกาศใหม่</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อประกาศ, เลขที่ประกาศ..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-teal"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-teal"
          >
            <option value="all">ทุกหมวดหมู่</option>
            <option value="general">ประกาศทั่วไป</option>
            <option value="academic">ประกาศทางวิชาการ</option>
            <option value="admission">ประกาศรับสมัคร</option>
            <option value="procurement">ประกาศจัดซื้อจัดจ้าง</option>
            <option value="results">ประกาศผลการคัดเลือก</option>
            <option value="documents">ประกาศดาวน์โหลดเอกสาร</option>
            <option value="urgent">ประกาศเร่งด่วน</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-teal"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">กำลังแสดงผล (Active)</option>
            <option value="scheduled">รอดำเนินการ (Scheduled)</option>
            <option value="expired">หมดอายุ (Expired)</option>
            <option value="draft">ร่างประกาศ (Draft)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-mcu-teal" />
            <p className="text-xs">กำลังโหลดข้อมูลประกาศ...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">ไม่พบรายการประกาศตามเงื่อนไข</p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (< sm: 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
              {filteredList.map((item) => (
                <div key={item.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Top Header: Pin, Title, Urgent & Status */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTogglePin(item.id)}
                          title={item.isPinned ? 'ถอนการปักหมุด' : 'ปักหมุดประกาศนี้'}
                          className={`p-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                            item.isPinned 
                              ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-600' : ''}`} />
                          <span>{item.isPinned ? 'ปักหมุดแล้ว' : 'ปักหมุด'}</span>
                        </button>

                        {item.isUrgent && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 whitespace-nowrap">
                            เร่งด่วน
                          </span>
                        )}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                        item.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        item.status === 'scheduled' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        item.status === 'expired' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {item.status === 'active' ? 'กำลังแสดงผล' :
                         item.status === 'scheduled' ? 'รอดำเนินการ' :
                         item.status === 'expired' ? 'หมดอายุ' : 'ร่าง'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  {/* Metadata Card Info */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                      <span className="inline-block px-2 py-0.5 rounded font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
                        📁 {item.categoryLabel}
                      </span>
                      <span className="font-mono text-slate-600 font-semibold">
                        {item.announcementNo ? `เลขที่: ${item.announcementNo}` : 'ไม่มีเลขที่'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <div>หน่วยงาน: {item.publisher || '-'}</div>
                      <div>เริ่ม: {item.startDate}</div>
                    </div>
                  </div>

                  {/* Mobile Action Buttons Bar */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setHistoryModalItem({ id: item.id, title: item.title })}
                      className="py-1.5 px-3 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-amber-200/60"
                    >
                      <Clock className="w-3.5 h-3.5" /> ประวัติ
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="py-1.5 px-3 bg-teal-50 text-mcu-teal hover:bg-teal-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-teal-200/60"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                    </button>
                    <button
                      onClick={() => setDeleteConfirmItem({ id: item.id, title: item.title })}
                      className="py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-rose-200/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. DESKTOP TABLE VIEW (≥ sm: 640px) */}
            <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="py-3 px-4 w-12 text-center whitespace-nowrap">ปักหมุด</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[260px]">หัวข้อประกาศ</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[130px]">หมวดหมู่</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[160px]">เลขที่ประกาศ / หน่วยงาน</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[130px]">ระยะเวลาแสดงผล</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap min-w-[120px]">ดาวน์โหลด</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap min-w-[110px]">สถานะ</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap min-w-[110px]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePin(item.id)}
                          title={item.isPinned ? 'ถอนการปักหมุด' : 'ปักหมุดประกาศนี้'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isPinned 
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          <Pin className={`w-4 h-4 ${item.isPinned ? 'fill-amber-600' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.isUrgent && (
                              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap">
                                เร่งด่วน
                              </span>
                            )}
                            <span className="line-clamp-2">{item.title}</span>
                          </div>
                          {item.attachments && item.attachments.length > 0 && (
                            <div className="text-[11px] text-mcu-teal font-medium flex items-center gap-1 whitespace-nowrap">
                              <FileText className="w-3 h-3 shrink-0" />
                              <span>{item.attachments.length} ไฟล์แนบ ({item.totalDownloads || 0} ดาวน์โหลด)</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap">
                          {item.categoryLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs space-y-0.5 whitespace-nowrap">
                        <div className="font-mono text-slate-700 font-semibold">{item.announcementNo || '-'}</div>
                        <div className="text-slate-400">{item.publisher || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                        <div>เริ่ม: {item.startDate}</div>
                        {item.endDate && <div className="text-slate-400">สิ้นสุด: {item.endDate}</div>}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          item.allowDownload ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.allowDownload ? <Unlock className="w-3 h-3 shrink-0" /> : <Lock className="w-3 h-3 shrink-0" />}
                          {item.allowDownload ? 'อนุญาต' : 'ปิดดาวน์โหลด'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                          item.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          item.status === 'scheduled' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          item.status === 'expired' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {item.status === 'active' ? 'กำลังแสดงผล' :
                           item.status === 'scheduled' ? 'รอดำเนินการ' :
                           item.status === 'expired' ? 'หมดอายุ' : 'ร่าง'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setHistoryModalItem({ id: item.id, title: item.title })}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="ประวัติเวอร์ชัน (Version History)"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-mcu-teal hover:bg-mcu-teal/10 rounded-lg transition-colors"
                          title="แก้ไขประกาศ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ id: item.id, title: item.title })}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบประกาศ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* ADD / EDIT ANNOUNCEMENT MODAL */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderDown className="w-5 h-5 text-mcu-gold" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {editingItem ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
                  </h3>
                  {editingItem && (
                    <span className="text-xs text-slate-400 font-mono">ID: {editingItem.id}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => setHistoryModalItem({ id: editingItem.id, title: editingItem.title })}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>ดูประวัติเวอร์ชัน</span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Revision Reason Banner */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-bold shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>เหตุผลการบันทึก/แก้ไข (Revision Summary):</span>
                </div>
                <input
                  type="text"
                  required
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="เช่น แก้ไขคำผิดในเนื้อหาประกาศ, แนบไฟล์คำสั่งใหม่, อัปเดตวันหมดอายุ..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
              
              {/* Title Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อประกาศ (ภาษาไทย) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="เช่น ประกาศประกวดราคาจ้างก่อสร้างอาคาร..."
                    className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    ชื่อประกาศ (ภาษาอังกฤษ / English Title)
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Announcement Title in English..."
                    className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal focus:bg-white"
                  />
                </div>
              </div>

              {/* Category & Announcement No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    หมวดหมู่ประกาศ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                    className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal font-medium"
                  >
                    <option value="general">ประกาศทั่วไป (General)</option>
                    <option value="academic">ประกาศทางวิชาการ (Academic)</option>
                    <option value="admission">ประกาศรับสมัคร (Admissions)</option>
                    <option value="procurement">ประกาศจัดซื้อจัดจ้าง (Procurement)</option>
                    <option value="results">ประกาศผลการคัดเลือก (Selection Results)</option>
                    <option value="documents">ประกาศดาวน์โหลดเอกสาร (Document Downloads)</option>
                    <option value="urgent">ประกาศเร่งด่วน (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เลขที่ประกาศ
                  </label>
                  <input
                    type="text"
                    value={formData.announcementNo}
                    onChange={(e) => setFormData({ ...formData, announcementNo: e.target.value })}
                    placeholder="เช่น วส.พม. 018/2569"
                    className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal font-mono"
                  />
                </div>
              </div>

              {/* Publisher & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    หน่วยงานเจ้าของประกาศ
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="เช่น ฝ่ายวิชาการ, งานพัสดุ"
                    className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ปี พ.ศ. ของประกาศ
                  </label>
                  <input
                    type="text"
                    value={formData.yearTh}
                    onChange={(e) => setFormData({ ...formData, yearTh: e.target.value })}
                    placeholder="2569"
                    className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal font-medium"
                  />
                </div>
              </div>

              {/* Dates & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันเริ่มแสดงผล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full py-2 px-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันสิ้นสุดแสดงผล (ไม่ระบุ = ไม่มีกำหนด)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full py-2 px-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สถานะการเผยแพร่
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full py-2 px-2 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="active">กำลังแสดงผล (Active)</option>
                    <option value="scheduled">รอดำเนินการ (Scheduled)</option>
                    <option value="expired">หมดอายุ (Expired)</option>
                    <option value="draft">ร่างประกาศ (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Switches: Pin, Urgent, Allow Download */}
              <div className="flex flex-wrap items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 text-mcu-teal rounded focus:ring-mcu-teal"
                  />
                  <Pin className="w-3.5 h-3.5 text-amber-600" />
                  <span>ปักหมุดประกาศ (Pinned)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>ประกาศเร่งด่วน (Urgent)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowDownload}
                    onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เปิดปุ่มดาวน์โหลดเอกสาร (Allow Download)</span>
                </label>
              </div>

              {/* Excerpt & Content */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    บทย่อ/สรุปสั้นๆ (Excerpt)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="สรุปย่อของประกาศเพื่อแสดงในหน้ารวม..."
                    className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รายละเอียดประกาศฉบับเต็ม (Full Content)
                  </label>
                  <textarea
                    rows={5}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="รายละเอียดเต็มของประกาศ ข้อความ คำสั่ง หรือเงื่อนไข..."
                    className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-teal"
                  />
                </div>
              </div>

              {/* Attachment File Manager */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FolderDown className="w-4 h-4 text-mcu-teal" />
                    <span>จัดการไฟล์เอกสารแนบ (Attachments - PDF, Word, Excel, ZIP)</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {formData.attachments.length} ไฟล์แนบ
                  </span>
                </div>

                {/* Existing Attachments */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-mcu-teal shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">{att.name}</span>
                          <span className="text-slate-400">({att.fileType.toUpperCase()} - {att.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-medium px-2 py-1 bg-rose-50 rounded"
                        >
                          ลบไฟล์
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Attachment Form Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-600">แนบไฟล์เอกสารใหม่:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={newAttName}
                        onChange={(e) => setNewAttName(e.target.value)}
                        placeholder="ชื่อไฟล์ เช่น ประกาศ_e_bidding.pdf"
                        className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={newAttUrl}
                        onChange={(e) => setNewAttUrl(e.target.value)}
                        placeholder="URL หรือลิงก์ไฟล์ PDF, Doc..."
                        className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={newAttType}
                        onChange={(e) => setNewAttType(e.target.value as any)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                      >
                        <option value="pdf">PDF (.pdf)</option>
                        <option value="doc">Word (.docx)</option>
                        <option value="xls">Excel (.xlsx)</option>
                        <option value="zip">ZIP Archive (.zip)</option>
                        <option value="img">Image (.jpg/.png)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มไฟล์แนบนี้เข้าประกาศ</span>
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-mcu-deep-teal hover:bg-mcu-teal text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกประกาศ</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {historyModalItem && (
        <VersionHistoryModal
          isOpen={!!historyModalItem}
          onClose={() => setHistoryModalItem(null)}
          contentType="announcement"
          contentId={historyModalItem.id}
          contentTitle={historyModalItem.title}
          onRestored={(restoredData) => {
            fetchAnnouncements();
            if (editingItem && editingItem.id === restoredData.id) {
              setFormData({
                title: restoredData.title,
                titleEn: restoredData.titleEn || '',
                category: restoredData.category,
                announcementNo: restoredData.announcementNo || '',
                publisher: restoredData.publisher || 'งานสารบรรณและวิทยาลัย',
                isPinned: restoredData.isPinned || false,
                isUrgent: restoredData.isUrgent || false,
                startDate: restoredData.startDate || new Date().toISOString().split('T')[0],
                endDate: restoredData.endDate || '',
                yearTh: restoredData.yearTh || '2569',
                excerpt: restoredData.excerpt || '',
                content: restoredData.content || '',
                allowDownload: restoredData.allowDownload ?? true,
                status: restoredData.status || 'active',
                attachments: restoredData.attachments ? [...restoredData.attachments] : []
              });
            }
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <Modal
          isOpen={!!deleteConfirmItem}
          onClose={() => setDeleteConfirmItem(null)}
          title="ยืนยันการลบรายการประกาศ"
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
                <span>{isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบประกาศ'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้? ข้อมูลประกาศและเอกสารแนบที่เกี่ยวข้องจะถูกลบออกจากระบบทันที
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
