/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Pin, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileSpreadsheet, 
  File, 
  Archive, 
  Building2, 
  Tag, 
  ChevronRight, 
  Sparkles, 
  RefreshCw,
  Lock,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Award,
  FolderDown,
  Layers
} from 'lucide-react';
import { AnnouncementItem, AnnouncementCategory } from '../../types';
import { api } from '../../lib/api';

interface AnnouncementsPageProps {
  lang: 'th' | 'en';
}

export default function AnnouncementsPage({ lang }: AnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected Announcement Modal Lightbox
  const [activeModalItem, setActiveModalItem] = useState<AnnouncementItem | null>(null);
  
  // Track downloading state for feedback animation
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Category Configuration
  const categories: { id: string; labelTh: string; labelEn: string; icon: any; color: string; bgLight: string }[] = [
    { id: 'all', labelTh: 'ประกาศทั้งหมด', labelEn: 'All Announcements', icon: Layers, color: 'text-mcu-deep-teal', bgLight: 'bg-slate-100 text-slate-800' },
    { id: 'general', labelTh: 'ประกาศทั่วไป', labelEn: 'General Notice', icon: Tag, color: 'text-blue-600', bgLight: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'academic', labelTh: 'ประกาศทางวิชาการ', labelEn: 'Academic Notice', icon: GraduationCap, color: 'text-indigo-600', bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'admission', labelTh: 'ประกาศรับสมัคร', labelEn: 'Recruitment Notice', icon: Award, color: 'text-emerald-600', bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'procurement', labelTh: 'ประกาศจัดซื้อจัดจ้าง', labelEn: 'Procurement Notice', icon: Briefcase, color: 'text-amber-600', bgLight: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'results', labelTh: 'ประกาศผลการคัดเลือก', labelEn: 'Selection Results', icon: CheckCircle2, color: 'text-purple-600', bgLight: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'documents', labelTh: 'ประกาศดาวน์โหลดเอกสาร', labelEn: 'Document Downloads', icon: FolderDown, color: 'text-teal-600', bgLight: 'bg-teal-50 text-teal-700 border-teal-200' },
    { id: 'urgent', labelTh: 'ประกาศเร่งด่วน', labelEn: 'Urgent Notice', icon: AlertTriangle, color: 'text-rose-600', bgLight: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  // Load Announcements from backend API
  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnnouncements({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        year: selectedYear !== 'all' ? selectedYear : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery.trim() !== '' ? searchQuery : undefined
      });
      setAnnouncements(data);
    } catch (err: any) {
      console.error('Failed to fetch announcements:', err);
      setError('ไม่สามารถโหลดข้อมูลประกาศได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory, selectedYear, selectedStatus, searchQuery]);

  // Compute urgent notices for prominent warning banner
  const urgentNotices = useMemo(() => {
    return announcements.filter(a => a.isUrgent && a.status === 'active');
  }, [announcements]);

  // Compute pinned notices
  const pinnedNotices = useMemo(() => {
    return announcements.filter(a => a.isPinned);
  }, [announcements]);

  // Compute regular notices
  const regularNotices = useMemo(() => {
    return announcements.filter(a => !a.isPinned);
  }, [announcements]);

  // Available Years in dataset
  const availableYears = useMemo(() => {
    const yearsSet = new Set(announcements.map(a => a.yearTh).filter(Boolean));
    yearsSet.add('2569');
    yearsSet.add('2568');
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [announcements]);

  // Download Handler with Live Increment API
  const handleDownloadFile = async (announcementId: string, attachmentId: string, url: string, fileName: string, allowDownload: boolean) => {
    if (!allowDownload) {
      alert('ขออภัย ประกาศนี้ถูกปิดการดาวน์โหลดเอกสารโดยผู้ดูแลระบบ');
      return;
    }

    setDownloadingId(attachmentId);
    try {
      // Call backend API to track and increment download counter
      const res = await api.trackDownload(announcementId, attachmentId);
      
      // Update local state instantly so download counter updates in UI
      setAnnouncements(prev => prev.map(item => {
        if (item.id === announcementId) {
          return {
            ...item,
            totalDownloads: res.totalDownloads,
            attachments: item.attachments.map(att => att.id === attachmentId ? { ...att, downloadCount: (att.downloadCount || 0) + 1 } : att)
          };
        }
        return item;
      }));

      if (activeModalItem && activeModalItem.id === announcementId) {
        setActiveModalItem(prev => prev ? {
          ...prev,
          totalDownloads: res.totalDownloads,
          attachments: prev.attachments.map(att => att.id === attachmentId ? { ...att, downloadCount: (att.downloadCount || 0) + 1 } : att)
        } : null);
      }

      // Trigger download or open link
      window.open(url, '_blank');
    } catch (e) {
      console.error('Download tracking failed:', e);
      window.open(url, '_blank');
    } finally {
      setTimeout(() => setDownloadingId(null), 600);
    }
  };

  // Helper to format File Icon & Badge
  const getFileBadge = (type?: string) => {
    switch (type) {
      case 'pdf':
        return { label: 'PDF', bg: 'bg-rose-100 text-rose-700 border-rose-200', icon: FileText };
      case 'doc':
        return { label: 'WORD', bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText };
      case 'xls':
        return { label: 'EXCEL', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FileSpreadsheet };
      case 'zip':
        return { label: 'ZIP', bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: Archive };
      default:
        return { label: 'FILE', bg: 'bg-gray-100 text-gray-700 border-gray-200', icon: File };
    }
  };

  // Helper to render Status Badge
  const renderStatusBadge = (status: string, startDate?: string, endDate?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            กำลังแสดงผล
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            รอดำเนินการ (กำหนดเวลา)
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <XCircle className="w-3 h-3 text-gray-500" />
            หมดอายุ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            ร่างประกาศ
          </span>
        );
    }
  };

  // Category Badge lookup
  const getCategoryBadge = (catId: string) => {
    const matched = categories.find(c => c.id === catId);
    if (!matched) return { label: 'ประกาศ', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    return { label: matched.labelTh, bg: matched.bgLight };
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ==================================================================== */}
        {/* HERO BANNER & HEADER */}
        {/* ==================================================================== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mcu-deep-teal via-mcu-teal to-mcu-pink-deep text-white p-8 md:p-10 shadow-xl border border-mcu-pink/20">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-mcu-gold" />
              <span>ระบบประกาศและสารบรรณวิทยาลัยสงฆ์พ่อขุนผาเมือง</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              ศูนย์รวมประกาศและเอกสารราชการ
            </h1>
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed opacity-95">
              ค้นหา ประกาศทั่วไป วิชาการ รับสมัครนิสิต จัดซื้อจัดจ้าง ประกาศผลการคัดเลือก และดาวน์โหลดเอกสารประกอบอย่างเป็นทางการ
            </p>

            {/* Quick Stats Summary Pills */}
            <div className="pt-2 flex flex-wrap gap-3 text-xs sm:text-sm">
              <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-2">
                <FileText className="w-4 h-4 text-mcu-gold" />
                <span>ประกาศทั้งหมด: <strong className="font-semibold text-white">{announcements.length}</strong></span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-300" />
                <span>ปักหมุดสำคัญ: <strong className="font-semibold text-white">{pinnedNotices.length}</strong></span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-300 animate-pulse" />
                <span>ประกาศเร่งด่วน: <strong className="font-semibold text-white">{urgentNotices.length}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* URGENT ANNOUNCEMENTS ALERT BANNER */}
        {/* ==================================================================== */}
        {urgentNotices.length > 0 && (
          <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white rounded-xl shadow-lg p-5 border border-rose-300 relative overflow-hidden animate-fade-in">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shrink-0">
                <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white text-rose-700 font-bold px-2.5 py-0.5 rounded text-xs tracking-wide uppercase">
                    ประกาศเร่งด่วน (Urgent)
                  </span>
                  <span className="text-xs text-rose-100">อัปเดตล่าสุด</span>
                </div>
                {urgentNotices.map((urg) => (
                  <div key={urg.id} className="pt-1">
                    <h2 
                      onClick={() => setActiveModalItem(urg)}
                      className="font-semibold text-base sm:text-lg hover:underline cursor-pointer flex items-center gap-2 text-white"
                    >
                      {urg.title}
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </h2>
                    <p className="text-xs sm:text-sm text-rose-100 line-clamp-2 mt-0.5">
                      {urg.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* CATEGORIES TABS */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-mcu-teal" />
            <span>หมวดหมู่ประกาศ (Category Tabs)</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-mcu-deep-teal text-white border-mcu-deep-teal shadow-md shadow-mcu-deep-teal/20 scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-mcu-gold' : cat.color}`} />
                  <span>{cat.labelTh}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SEARCH & FILTERS BAR */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            
            {/* Search Box */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อประกาศ เลขที่ประกาศ หรือหน่วยงาน..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-teal focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Year Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-teal text-slate-700 font-medium"
              >
                <option value="all">ปี พ.ศ. ทั้งหมด</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>ปี พ.ศ. {yr}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcu-teal text-slate-700 font-medium"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="active">🟢 กำลังแสดงผล (Active)</option>
                <option value="scheduled">🟡 รอดำเนินการ (Scheduled)</option>
                <option value="expired">🔴 หมดอายุ (Expired)</option>
              </select>
            </div>

          </div>

          {/* Active Filters Summary & Reset */}
          {(selectedCategory !== 'all' || selectedYear !== 'all' || selectedStatus !== 'all' || searchQuery !== '') && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-400">ตัวกรองที่เลือก:</span>
                {selectedCategory !== 'all' && (
                  <span className="bg-mcu-teal/10 text-mcu-deep-teal px-2 py-0.5 rounded-md font-medium">
                    หมวด: {categories.find(c => c.id === selectedCategory)?.labelTh}
                  </span>
                )}
                {selectedYear !== 'all' && (
                  <span className="bg-mcu-teal/10 text-mcu-deep-teal px-2 py-0.5 rounded-md font-medium">
                    ปี: {selectedYear}
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="bg-mcu-teal/10 text-mcu-deep-teal px-2 py-0.5 rounded-md font-medium">
                    สถานะ: {selectedStatus}
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-mcu-teal/10 text-mcu-deep-teal px-2 py-0.5 rounded-md font-medium">
                    คำค้น: "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedYear('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="text-mcu-pink-deep hover:underline font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* PINNED ANNOUNCEMENTS SECTION */}
        {/* ==================================================================== */}
        {pinnedNotices.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-lg">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                <Pin className="w-5 h-5 fill-amber-500" />
              </div>
              <span>ประกาศปักหมุดสำคัญ (Pinned Announcements)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {pinnedNotices.map((anc) => (
                <div
                  key={anc.id}
                  className="bg-gradient-to-b from-amber-50/40 via-white to-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Pin ribbon corner */}
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-white" />
                    ปักหมุด
                  </div>

                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center gap-2 flex-wrap pr-16">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getCategoryBadge(anc.category).bg}`}>
                        {anc.categoryLabel}
                      </span>
                      {renderStatusBadge(anc.status)}
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setActiveModalItem(anc)}
                      className="font-bold text-slate-800 text-base sm:text-lg line-clamp-2 group-hover:text-mcu-deep-teal cursor-pointer transition-colors leading-snug"
                    >
                      {anc.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {anc.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                      {anc.announcementNo && (
                        <div className="flex items-center gap-1 font-mono font-medium text-slate-600">
                          <Tag className="w-3.5 h-3.5 text-mcu-teal" />
                          <span>{anc.announcementNo}</span>
                        </div>
                      )}
                      {anc.publisher && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{anc.publisher}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>เริ่ม: {anc.startDate}</span>
                        {anc.endDate && <span> - ถึง: {anc.endDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Attachments & Download Area */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{anc.viewCount || 0} ครั้ง</span>
                      <span className="text-slate-300">•</span>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>ดาวน์โหลด {anc.totalDownloads || 0} ครั้ง</span>
                    </div>

                    <button
                      onClick={() => setActiveModalItem(anc)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <span>อ่านประกาศ & ดาวน์โหลด</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MAIN ANNOUNCEMENTS LISTING */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-mcu-teal" />
              <span>รายการประกาศทั้งหมด ({announcements.length} รายการ)</span>
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-mcu-teal animate-spin mx-auto" />
              <p className="text-sm text-slate-500">กำลังโหลดรายการประกาศ...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 p-6 space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto" />
              <p className="font-semibold">{error}</p>
              <button 
                onClick={fetchAnnouncements} 
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-700"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-semibold text-slate-700">ไม่พบรายการประกาศตามเงื่อนไขที่เลือก</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ลองปรับเปลี่ยนคำค้นหา หมวดหมู่ หรือปี พ.ศ. เพื่อดูรายการประกาศอื่นๆ
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedYear('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 bg-mcu-teal text-white rounded-xl text-xs font-medium hover:bg-mcu-deep-teal transition-colors"
              >
                รีเซ็ตการค้นหา
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((anc) => (
                <div
                  key={anc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-mcu-teal/50 p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {anc.isPinned && (
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                            <Pin className="w-3 h-3 fill-amber-600" />
                            ปักหมุด
                          </span>
                        )}
                        {anc.isUrgent && (
                          <span className="bg-rose-100 text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            เร่งด่วน
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getCategoryBadge(anc.category).bg}`}>
                          {anc.categoryLabel}
                        </span>
                        {renderStatusBadge(anc.status)}
                      </div>

                      <h3 
                        onClick={() => setActiveModalItem(anc)}
                        className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-mcu-deep-teal cursor-pointer transition-colors leading-snug"
                      >
                        {anc.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        {anc.announcementNo && (
                          <div className="flex items-center gap-1 font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            <Tag className="w-3 h-3 text-mcu-teal" />
                            <span>{anc.announcementNo}</span>
                          </div>
                        )}
                        {anc.publisher && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{anc.publisher}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>วันที่ประกาศ: {anc.startDate}</span>
                          {anc.endDate && <span> - หมดเขต: {anc.endDate}</span>}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-3.5 h-3.5" />
                          <span>เข้าชม {anc.viewCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action & Attachments summary */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      
                      {/* Attachments preview pill */}
                      {anc.attachments && anc.attachments.length > 0 && (
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          <FileText className="w-4 h-4 text-mcu-teal" />
                          <span>มีเอกสารแนบ ({anc.attachments.length} ไฟล์)</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500">ดาวน์โหลด {anc.totalDownloads || 0} ครั้ง</span>
                        </div>
                      )}

                      <button
                        onClick={() => setActiveModalItem(anc)}
                        className="w-full sm:w-auto px-4 py-2 bg-mcu-deep-teal hover:bg-mcu-teal text-white font-medium text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span>ดูรายละเอียด & ดาวน์โหลด</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==================================================================== */}
      {/* FULL ANNOUNCEMENT LIGHTBOX MODAL */}
      {/* ==================================================================== */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden relative space-y-0">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-mcu-deep-teal to-mcu-teal text-white p-6 relative">
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
              
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold bg-white/20 text-white backdrop-blur-md`}>
                    {activeModalItem.categoryLabel}
                  </span>
                  {activeModalItem.isPinned && (
                    <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-950" />
                      ปักหมุด
                    </span>
                  )}
                  {activeModalItem.isUrgent && (
                    <span className="bg-rose-500 text-white font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      เร่งด่วน
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                  {activeModalItem.title}
                </h2>

                {activeModalItem.titleEn && (
                  <p className="text-xs sm:text-sm text-slate-200 font-light">
                    {activeModalItem.titleEn}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Metadata details block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">เลขที่ประกาศ:</span>
                  <span className="text-slate-800 font-semibold font-mono">{activeModalItem.announcementNo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">หน่วยงานออกประกาศ:</span>
                  <span className="text-slate-800 font-semibold">{activeModalItem.publisher || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">ระยะเวลาแสดงผลประกาศ:</span>
                  <span className="text-slate-800 font-medium">
                    {activeModalItem.startDate} {activeModalItem.endDate ? `ถึง ${activeModalItem.endDate}` : '(ไม่มีกำหนดหมดอายุ)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">สถานะการดาวน์โหลด:</span>
                  <span className="font-semibold text-emerald-600">
                    {activeModalItem.allowDownload ? 'เปิดให้ดาวน์โหลดเอกสาร' : 'ปิดการดาวน์โหลด'}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-mcu-teal" />
                  <span>เนื้อหาประกาศอย่างเป็นทางการ</span>
                </h4>
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {activeModalItem.content || activeModalItem.excerpt}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FolderDown className="w-4 h-4 text-mcu-teal" />
                    <span>เอกสารแนบดาวน์โหลด ({activeModalItem.attachments?.length || 0} ไฟล์)</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    ดาวน์โหลดรวม: <strong>{activeModalItem.totalDownloads || 0}</strong> ครั้ง
                  </span>
                </div>

                {(!activeModalItem.attachments || activeModalItem.attachments.length === 0) ? (
                  <div className="p-4 bg-slate-50 text-slate-500 rounded-xl text-xs text-center border border-slate-200">
                    ไม่มีไฟล์เอกสารแนบในประกาศนี้
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeModalItem.attachments.map((att) => {
                      const badgeInfo = getFileBadge(att.fileType);
                      const BadgeIcon = badgeInfo.icon;
                      const isDownloading = downloadingId === att.id;

                      return (
                        <div
                          key={att.id}
                          className="bg-white border border-slate-200 hover:border-mcu-teal rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg border shrink-0 ${badgeInfo.bg}`}>
                              <BadgeIcon className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug">
                                {att.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>ขนาด: {att.size || 'N/A'}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-mcu-teal font-medium">ดาวน์โหลดแล้ว: {att.downloadCount || 0} ครั้ง</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownloadFile(activeModalItem.id, att.id, att.url, att.name, activeModalItem.allowDownload)}
                            disabled={!activeModalItem.allowDownload || isDownloading}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 ${
                              !activeModalItem.allowDownload
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : isDownloading
                                ? 'bg-emerald-600 text-white animate-pulse'
                                : 'bg-mcu-teal hover:bg-mcu-deep-teal text-white shadow-sm'
                            }`}
                          >
                            {!activeModalItem.allowDownload ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>ไม่อนุญาตให้ดาวน์โหลด</span>
                              </>
                            ) : (
                              <>
                                <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                                <span>{isDownloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลดไฟล์'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              </span>
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-xl transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
