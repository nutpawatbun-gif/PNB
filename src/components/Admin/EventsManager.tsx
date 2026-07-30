/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { CalendarEvent, EventAttachment, EventCategory, RecurrenceType, OnlinePlatform } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle,
  X,
  Clock,
  MapPin,
  User,
  Link,
  Video,
  FileText,
  Image as ImageIcon,
  Bell,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Paperclip,
  Share2,
  Download
} from 'lucide-react';

import { eventsStore } from '../../data/eventsStore';

interface EventsManagerProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

const CATEGORY_OPTIONS: { value: EventCategory; label: string; color: string }[] = [
  { value: 'academic', label: 'วิชาการ / สัมมนา', color: '#2563eb' },
  { value: 'activity', label: 'กิจกรรมนิสิต', color: '#0284c7' },
  { value: 'buddhism', label: 'ศาสนพิธี / บุญกุศล', color: '#d97706' },
  { value: 'admission', label: 'รับสมัคร / แนะแนว', color: '#e11d48' },
  { value: 'meeting', label: 'การประชุม / สภา', color: '#059669' },
  { value: 'ceremony', label: 'พิธีการ / รัฐพิธี', color: '#9333ea' },
  { value: 'other', label: 'อื่นๆ', color: '#64748b' }
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'กิจกรรมวันเดียว / จัดครั้งเดียว' },
  { value: 'daily', label: 'กิจกรรมประจำทุกวัน (Daily)' },
  { value: 'weekly', label: 'กิจกรรมประจำทุกสัปดาห์ (Weekly)' },
  { value: 'monthly', label: 'กิจกรรมประจำทุกเดือน (Monthly)' },
  { value: 'yearly', label: 'กิจกรรมประจำทุกปี (Yearly)' }
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'ไม่เปิดแจ้งเตือน' },
  { value: 15, label: '15 นาทีก่อนเริ่มกิจกรรม' },
  { value: 30, label: '30 นาทีก่อนเริ่มกิจกรรม' },
  { value: 60, label: '1 ชั่วโมงก่อนเริ่มกิจกรรม' },
  { value: 1440, label: '1 วันก่อนเริ่มกิจกรรม' }
];

export default function EventsManager({ onNotify }: EventsManagerProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [details, setDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [onlineLink, setOnlineLink] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState<OnlinePlatform>('zoom');
  const [category, setCategory] = useState<EventCategory>('academic');
  const [color, setColor] = useState('#2563eb');
  const [reminderMinutes, setReminderMinutes] = useState<number>(60);
  const [attachments, setAttachments] = useState<EventAttachment[]>([]);
  const [newAttName, setNewAttName] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      if (Array.isArray(data)) {
        setEvents(data);
        eventsStore.saveEvents(data);
      }
    } catch (err) {
      console.error('Error loading events:', err);
      if (onNotify) onNotify('ไม่สามารถโหลดข้อมูลปฏิทินได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingEvent(null);
    setTitle('');
    setStartDate(today);
    setEndDate(today);
    setStartTime('09:00');
    setEndTime('12:00');
    setIsAllDay(false);
    setRecurrence('none');
    setLocation('');
    setOrganizer('');
    setDetails('');
    setImageUrl('');
    setRegistrationUrl('');
    setOnlineLink('');
    setMeetingPlatform('zoom');
    setCategory('academic');
    setColor('#2563eb');
    setReminderMinutes(60);
    setAttachments([]);
    setNewAttName('');
    setNewAttUrl('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setTitle(event.title || '');
    setStartDate(event.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(event.endDate || event.startDate || new Date().toISOString().split('T')[0]);
    setStartTime(event.startTime || '09:00');
    setEndTime(event.endTime || '12:00');
    setIsAllDay(event.isAllDay || false);
    setRecurrence(event.recurrence || 'none');
    setLocation(event.location || '');
    setOrganizer(event.organizer || '');
    setDetails(event.details || '');
    setImageUrl(event.imageUrl || '');
    setRegistrationUrl(event.registrationUrl || '');
    setOnlineLink(event.onlineLink || '');
    setMeetingPlatform(event.meetingPlatform || (event.onlineLink?.includes('zoom') ? 'zoom' : event.onlineLink?.includes('meet') ? 'google_meet' : 'other'));
    setCategory(event.category || 'academic');
    setColor(event.color || CATEGORY_OPTIONS.find(c => c.value === event.category)?.color || '#2563eb');
    setReminderMinutes(event.reminderMinutes ?? 60);
    setAttachments(event.attachments || []);
    setIsModalOpen(true);
  };

  const handleAddAttachment = () => {
    if (!newAttName || !newAttUrl) return;
    setAttachments(prev => [
      ...prev,
      { id: 'att_' + Date.now(), name: newAttName, url: newAttUrl }
    ]);
    setNewAttName('');
    setNewAttUrl('');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      if (onNotify) onNotify('กรุณาระบุชื่อกิจกรรมและวันเริ่มต้น', 'error');
      return;
    }

    // Auto-detect multi-day
    const isMultiDay = startDate !== endDate;
    
    // Format backward compatibility month / date / year
    const dObj = new Date(startDate);
    const dateNum = dObj.getDate().toString().padStart(2, '0');
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthStr = thaiMonths[dObj.getMonth()];
    const yearStr = (dObj.getFullYear() + 543).toString();
    const formattedTimeStr = isAllDay ? 'ตลอดวัน' : `${startTime} น. - ${endTime} น.`;

    const catObj = CATEGORY_OPTIONS.find(c => c.value === category);

    const payload: Partial<CalendarEvent> = {
      title,
      startDate,
      endDate: endDate || startDate,
      startTime: isAllDay ? '' : startTime,
      endTime: isAllDay ? '' : endTime,
      isAllDay,
      isMultiDay,
      recurrence,
      location,
      organizer,
      details,
      imageUrl,
      registrationUrl,
      onlineLink,
      meetingPlatform,
      category,
      categoryLabel: catObj?.label || 'กิจกรรมทั่วไป',
      color: color || catObj?.color || '#2563eb',
      reminderMinutes,
      attachments,
      // Backward compatibility
      date: dateNum,
      month: monthStr,
      year: yearStr,
      time: formattedTimeStr
    };

    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, payload);
        if (onNotify) onNotify('อัปเดตกิจกรรมในปฏิทินเรียบร้อยแล้ว', 'success');
      } else {
        await api.createEvent(payload as any);
        if (onNotify) onNotify('เพิ่มกิจกรรมใหม่ในปฏิทินเรียบร้อยแล้ว', 'success');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการบันทึกกิจกรรม', 'error');
    }
  };

  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<CalendarEvent | null>(null);

  const handleDelete = (evt: CalendarEvent) => {
    setDeleteConfirmEvent(evt);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteConfirmEvent) return;
    const target = deleteConfirmEvent;
    setIsDeleting(target.id);
    try {
      await api.deleteEvent(target.id);
      if (onNotify) onNotify(`ลบกิจกรรม "${target.title}" เรียบร้อยแล้ว`, 'success');
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการลบกิจกรรม', 'error');
    } finally {
      setIsDeleting(null);
      setDeleteConfirmEvent(null);
    }
  };

  const filteredEvents = events.filter(evt => {
    const matchesSearch = searchQuery === '' || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.location && evt.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.organizer && evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-mcu-pink-deep flex items-center space-x-2">
            <CalendarIcon className="text-mcu-pink" size={24} />
            <span>ระบบจัดการปฏิทินกิจกรรม (Calendar CMS)</span>
          </h2>
          <p className="text-xs text-slate-500 font-light mt-1">
            เพิ่ม แก้ไข ลบกิจกรรม วันเริ่มต้น-สิ้นสุด ลิงก์ออนไลน์ Zoom/Meet และเอกสารแนบ
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-mcu-pink hover:bg-mcu-pink-dark text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>เพิ่มกิจกรรมใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อกิจกรรม สถานที่ หรือผู้รับผิดชอบ..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-pink/20 focus:border-mcu-pink outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-pink/20 focus:border-mcu-pink outline-none bg-white font-medium text-slate-700"
        >
          <option value="all">ทุกหมวดหมู่กิจกรรม</option>
          {CATEGORY_OPTIONS.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Events List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center space-y-2">
            <RefreshCw size={24} className="animate-spin text-mcu-pink" />
            <span>กำลังโหลดปฏิทินกิจกรรม...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-light space-y-2">
            <CalendarIcon size={32} className="mx-auto text-slate-300" />
            <p className="text-xs">ไม่พบข้อมูลกิจกรรมในปฏิทิน</p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (< sm: 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
              {filteredEvents.map((evt) => {
                const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === evt.category);
                const isMulti = evt.startDate && evt.endDate && evt.startDate !== evt.endDate;

                return (
                  <div key={evt.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                    {/* Top Header: Date, Color Tag, Title & Category */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: evt.color || categoryInfo?.color || '#2563eb' }}
                          />
                          <span className="font-bold text-slate-900">{evt.startDate || evt.date}</span>
                          {isMulti && <span className="text-[10px] text-mcu-pink font-semibold">ถึง {evt.endDate}</span>}
                        </div>

                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs"
                          style={{ backgroundColor: evt.color || categoryInfo?.color || '#2563eb' }}
                        >
                          {evt.categoryLabel || categoryInfo?.label || 'กิจกรรม'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {evt.title}
                      </h4>
                    </div>

                    {/* Metadata Card Info */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                        <div className="flex items-center space-x-1">
                          <MapPin size={12} className="text-mcu-gold shrink-0" />
                          <span className="font-medium text-slate-700">{evt.location || 'ไม่ระบุสถานที่'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {evt.isAllDay ? 'ตลอดวัน' : (evt.startTime ? `${evt.startTime} - ${evt.endTime || ''}` : evt.time || '-')}
                        </span>
                      </div>

                      {evt.organizer && (
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                          ผู้รับผิดชอบ: {evt.organizer}
                        </div>
                      )}
                    </div>

                    {/* Mobile Action Buttons Bar */}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenEditModal(evt)}
                        className="py-1.5 px-3 bg-pink-50 text-mcu-pink hover:bg-pink-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-pink-200/60"
                      >
                        <Edit3 size={14} /> แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(evt)}
                        disabled={isDeleting === evt.id}
                        className="py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-rose-200/60"
                      >
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP TABLE VIEW (≥ sm: 640px) */}
            <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap min-w-[150px]">วันที่ & เวลา</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[260px]">ชื่อกิจกรรม / หมวดหมู่</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[180px]">สถานที่ / ลิงก์ออนไลน์</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[150px]">ผู้รับผิดชอบ</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap min-w-[110px]">ประเภท</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap min-w-[100px]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredEvents.map((evt) => {
                    const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === evt.category);
                    const isMulti = evt.startDate && evt.endDate && evt.startDate !== evt.endDate;

                    return (
                      <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: evt.color || categoryInfo?.color || '#2563eb' }}
                            />
                            <div>
                              <div className="font-bold text-slate-900">{evt.startDate || evt.date}</div>
                              {isMulti && <div className="text-[10px] text-mcu-pink font-semibold">ถึง {evt.endDate}</div>}
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {evt.isAllDay ? 'ตลอดวัน' : (evt.startTime ? `${evt.startTime} - ${evt.endTime || ''}` : evt.time || '-')}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-800 line-clamp-1">{evt.title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span 
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: evt.color || categoryInfo?.color || '#2563eb' }}
                            >
                              {evt.categoryLabel || categoryInfo?.label || 'กิจกรรม'}
                            </span>
                            {evt.recurrence && evt.recurrence !== 'none' && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                ประจำ ({evt.recurrence})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center space-x-1 text-slate-600 line-clamp-1">
                            <MapPin size={12} className="text-mcu-gold shrink-0" />
                            <span className="truncate">{evt.location || 'ไม่ระบุสถานที่'}</span>
                          </div>
                          {evt.onlineLink && (
                            <div className="flex items-center space-x-1 text-[10px] text-blue-600 font-medium mt-1">
                              <Video size={11} className="shrink-0" />
                              <a href={evt.onlineLink} target="_blank" rel="noreferrer" className="hover:underline truncate">
                                {evt.meetingPlatform === 'zoom' ? 'Zoom Meeting' : evt.meetingPlatform === 'google_meet' ? 'Google Meet' : 'ประชุมออนไลน์'}
                              </a>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {evt.organizer || '-'}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isMulti 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isMulti ? 'หลายวัน' : 'วันเดียว'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(evt)}
                            className="p-1.5 bg-slate-100 hover:bg-mcu-pink-soft text-slate-600 hover:text-mcu-pink-deep rounded-lg transition-colors"
                            title="แก้ไขกิจกรรม"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(evt)}
                            disabled={isDeleting === evt.id}
                            className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="ลบกิจกรรม"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <CalendarIcon size={20} className="text-mcu-gold" />
                <h3 className="font-bold text-base">
                  {editingEvent ? 'แก้ไขกิจกรรมปฏิทิน' : 'เพิ่มกิจกรรมใหม่ในปฏิทิน'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Event Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ชื่อกิจกรรม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น โครงการสัมมนาเชิงปฏิบัติการวิชาการพระพุทธศาสนา"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-pink/20 focus:border-mcu-pink outline-none font-medium"
                />
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">วันเริ่มต้น (Start Date) *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate) setEndDate(e.target.value);
                    }}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">วันสิ้นสุด (End Date)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                  />
                </div>

                {/* Times & All Day Toggle */}
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAllDay"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="w-4 h-4 text-mcu-pink rounded border-slate-300 focus:ring-mcu-pink"
                    />
                    <label htmlFor="isAllDay" className="font-bold text-slate-800 cursor-pointer">
                      กิจกรรมตลอดวัน (All-day Event)
                    </label>
                  </div>

                  {!isAllDay && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                      />
                      <span>ถึง</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Recurrence & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">หมวดหมู่กิจกรรม</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as EventCategory;
                      setCategory(val);
                      const opt = CATEGORY_OPTIONS.find(c => c.value === val);
                      if (opt) setColor(opt.color);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium bg-white"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">รูปแบบกิจกรรมซ้ำ (Recurrence)</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium bg-white"
                  >
                    {RECURRENCE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Color Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">สีประจำกิจกรรม (Category Color)</label>
                <div className="flex items-center space-x-3">
                  {CATEGORY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setCategory(opt.value);
                        setColor(opt.color);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === opt.color ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: opt.color }}
                      title={opt.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                </div>
              </div>

              {/* Location & Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">สถานที่จัดกิจกรรม</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น อาคารเรียนรวม ห้องประชุมผาเมือง ชั้น 2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">ผู้รับผิดชอบ / หน่วยงาน</label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="เช่น สโมสรนิสิต / สำนักงานผู้อำนวยการ"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                  />
                </div>
              </div>

              {/* Online Links & Registration */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                  <Video size={14} className="text-blue-600" />
                  <span>ระบบประชุมออนไลน์ & ลิงก์ลงทะเบียน</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ลิงก์ประชุม (Zoom / Google Meet)</label>
                    <input
                      type="url"
                      value={onlineLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOnlineLink(val);
                        if (val.includes('zoom')) setMeetingPlatform('zoom');
                        else if (val.includes('meet')) setMeetingPlatform('google_meet');
                      }}
                      placeholder="https://zoom.us/j/... หรือ https://meet.google.com/..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ลิงก์ลงทะเบียนเข้าร่วม</label>
                    <input
                      type="url"
                      value={registrationUrl}
                      onChange={(e) => setRegistrationUrl(e.target.value)}
                      placeholder="https://forms.google.com/..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">รูปภาพกิจกรรม / ภาพปก (Cover Image URL)</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                  />
                  {imageUrl && (
                    <img src={imageUrl} alt="preview" className="w-10 h-10 object-cover rounded-lg border" />
                  )}
                </div>
              </div>

              {/* Details / Description */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">รายละเอียดกิจกรรม</label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="ระบุกำหนดการ วัตถุประสงค์ หรือกลุ่มเป้าหมายผู้เข้าร่วม..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>

              {/* Attachments (เอกสารแนบ) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                  <Paperclip size={14} className="text-mcu-pink" />
                  <span>เอกสารแนบประจำกิจกรรม</span>
                </h4>

                {attachments.length > 0 && (
                  <div className="space-y-1.5">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText size={14} className="text-slate-400 shrink-0" />
                          <span className="font-medium truncate">{att.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(i)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={newAttName}
                    onChange={(e) => setNewAttName(e.target.value)}
                    placeholder="ชื่อเอกสาร (เช่น กำหนดการโครงการ.pdf)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={newAttUrl}
                      onChange={(e) => setNewAttUrl(e.target.value)}
                      placeholder="URL เอกสาร"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification / Reminder Setting */}
              <div className="flex items-center justify-between bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                <div className="flex items-center space-x-2 text-amber-900">
                  <Bell size={16} className="text-amber-600" />
                  <span className="font-bold">การแจ้งเตือนเตือนความจำ</span>
                </div>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg outline-none font-bold text-slate-800 text-xs"
                >
                  {REMINDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-mcu-pink hover:bg-mcu-pink-dark text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-md transition-colors"
                >
                  <CheckCircle size={16} />
                  <span>บันทึกกิจกรรม</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmEvent && (
        <Modal
          isOpen={!!deleteConfirmEvent}
          onClose={() => setDeleteConfirmEvent(null)}
          title="ยืนยันการลบกิจกรรมปฏิทิน"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                disabled={!!isDeleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบกิจกรรม'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้ออกจากปฏิทินกิจกรรมของวิทยาลัย?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmEvent.title}"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
