/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { eventsStore } from '../../data/eventsStore';
import { CalendarEvent, EventCategory } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Clock,
  MapPin,
  User,
  ExternalLink,
  Video,
  FileText,
  Download,
  Share2,
  Bell,
  CheckCircle,
  X,
  Plus,
  BookOpen,
  CalendarDays,
  CalendarRange,
  Paperclip,
  Check
} from 'lucide-react';

interface CalendarPageProps {
  lang: 'th' | 'en';
}

type ViewMode = 'month' | 'week' | 'list';

const CATEGORIES: { id: string; labelTh: string; labelEn: string; color: string }[] = [
  { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All Events', color: '#475569' },
  { id: 'academic', labelTh: 'วิชาการ / สัมมนา', labelEn: 'Academic', color: '#2563eb' },
  { id: 'activity', labelTh: 'กิจกรรมนิสิต', labelEn: 'Student Activity', color: '#0284c7' },
  { id: 'buddhism', labelTh: 'ศาสนพิธี / บุญกุศล', labelEn: 'Buddhism & Ceremony', color: '#d97706' },
  { id: 'admission', labelTh: 'รับสมัคร / แนะแนว', labelEn: 'Admission', color: '#e11d48' },
  { id: 'meeting', labelTh: 'การประชุม / สภา', labelEn: 'Meeting', color: '#059669' },
  { id: 'ceremony', labelTh: 'พิธีการ / รัฐพิธี', labelEn: 'Official Ceremony', color: '#9333ea' }
];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function CalendarPage({ lang }: CalendarPageProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Calendar Navigation Date (defaults to current date e.g., July 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 1)); // July 2026

  // Reminder notification toast
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    const unsubscribe = eventsStore.subscribe(() => {
      setEvents(eventsStore.getEvents());
    });

    return () => unsubscribe();
  }, []);

  // Filter events by Category and Search
  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.location && evt.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.organizer && evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Date Navigation Helpers
  const handlePrevDate = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const handleNextDate = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 6, 21));
  };

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = (evt: CalendarEvent) => {
    if (evt.googleCalendarUrl) return evt.googleCalendarUrl;

    const start = evt.startDate ? evt.startDate.replace(/-/g, '') : '20260725';
    const end = evt.endDate ? evt.endDate.replace(/-/g, '') : start;
    
    const startTimeFormatted = evt.startTime ? evt.startTime.replace(':', '') + '00' : '090000';
    const endTimeFormatted = evt.endTime ? evt.endTime.replace(':', '') + '00' : '170000';

    const dates = `${start}T${startTimeFormatted}/${end}T${endTimeFormatted}`;
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: evt.title,
      dates: dates,
      details: `${evt.details || ''}\n\nผู้รับผิดชอบ: ${evt.organizer || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'}`,
      location: evt.location || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // iCal (.ics) File Generator
  const downloadICSFile = (evt: CalendarEvent) => {
    const start = (evt.startDate || '2026-07-25').replace(/-/g, '');
    const end = (evt.endDate || evt.startDate || '2026-07-25').replace(/-/g, '');
    const startTimeStr = (evt.startTime || '09:00').replace(':', '') + '00';
    const endTimeStr = (evt.endTime || '17:00').replace(':', '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MCU Phakhoan Phamuang//NONSGML Calendar//TH',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${(evt.details || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${evt.location || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'}`,
      `DTSTART:${start}T${startTimeStr}`,
      `DTEND:${end}T${endTimeStr}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${evt.title.slice(0, 20)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Notification Reminder
  const handleSetReminder = (evt: CalendarEvent) => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setReminderToast(`ตั้งค่าแจ้งเตือนสำหรับ "${evt.title.slice(0, 25)}..." เรียบร้อยแล้ว`);
          setTimeout(() => setReminderToast(null), 3500);
        } else {
          setReminderToast('กรุณายินยอมให้การแจ้งเตือนในเบราว์เซอร์เพื่อรับการแจ้งเตือนกิจกรรม');
          setTimeout(() => setReminderToast(null), 3500);
        }
      });
    } else {
      setReminderToast('เบราว์เซอร์ของท่านรองรับการแจ้งเตือนกิจกรรมแล้ว');
      setTimeout(() => setReminderToast(null), 3500);
    }
  };

  // Render Days for Month View Grid
  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];

    // Blank cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }

    // Days of month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      daysArray.push(day);
    }

    // Format current month string e.g. "2026-07"
    const currentYearMonthStr = `${year}-${(month + 1).toString().padStart(2, '0')}`;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Day Header */}
        <div className="grid grid-cols-7 bg-slate-100/80 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600 uppercase">
          <div className="text-rose-600">อา. (Sun)</div>
          <div>จ. (Mon)</div>
          <div>อ. (Tue)</div>
          <div>พ. (Wed)</div>
          <div>พฤ. (Thu)</div>
          <div>ศ. (Fri)</div>
          <div className="text-blue-600">ส. (Sat)</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[500px]">
          {daysArray.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={`empty-${index}`} className="bg-slate-50/50 p-2 min-h-[100px]" />;
            }

            const dayDateStr = `${currentYearMonthStr}-${dayNum.toString().padStart(2, '0')}`;
            
            // Find events on this day
            const dayEvents = filteredEvents.filter(evt => {
              if (evt.startDate && evt.endDate) {
                return dayDateStr >= evt.startDate && dayDateStr <= evt.endDate;
              }
              // Fallback match date string
              return evt.startDate === dayDateStr || evt.date === dayNum.toString();
            });

            const isToday = dayNum === 21 && month === 6 && year === 2026;

            return (
              <div 
                key={dayDateStr} 
                className={`p-2 min-h-[110px] transition-colors relative flex flex-col justify-between group ${
                  isToday ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-mcu-pink text-white shadow' : 'text-slate-700'
                  }`}>
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayEvents.length} กิจกรรม
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayEvents.map(evt => {
                    const catObj = CATEGORIES.find(c => c.id === evt.category);
                    const isMulti = evt.isMultiDay || (evt.startDate && evt.endDate && evt.startDate !== evt.endDate);

                    return (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className="w-full text-left p-1.5 rounded-lg text-[10px] font-bold text-white transition-transform hover:scale-[1.02] shadow-sm truncate block cursor-pointer"
                        style={{ backgroundColor: evt.color || catObj?.color || '#2563eb' }}
                        title={evt.title}
                      >
                        <div className="truncate flex items-center space-x-1">
                          {isMulti && <CalendarRange size={10} className="shrink-0" />}
                          <span className="truncate">{evt.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Sun

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-center py-3 text-xs font-bold text-slate-700">
          {days.map((d, i) => {
            const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
            const dateStr = d.toISOString().split('T')[0];
            const isToday = d.getDate() === 21 && d.getMonth() === 6 && d.getFullYear() === 2026;

            return (
              <div key={i} className={`p-2 ${isToday ? 'bg-mcu-pink-soft/30' : ''}`}>
                <div className="text-[10px] text-slate-400">{dayNames[i]}</div>
                <div className={`text-sm font-bold mt-0.5 ${isToday ? 'text-mcu-pink' : 'text-slate-800'}`}>
                  {d.getDate()} {THAI_MONTHS[d.getMonth()].slice(0, 3)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[450px]">
          {days.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0];
            const dayEvents = filteredEvents.filter(evt => {
              if (evt.startDate && evt.endDate) {
                return dateStr >= evt.startDate && dateStr <= evt.endDate;
              }
              return evt.startDate === dateStr;
            });

            return (
              <div key={i} className="p-2 space-y-2 bg-white hover:bg-slate-50/50">
                {dayEvents.map(evt => {
                  const catObj = CATEGORIES.find(c => c.id === evt.category);
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="p-2 rounded-xl text-white text-[11px] font-bold shadow-sm cursor-pointer hover:opacity-90 space-y-1"
                      style={{ backgroundColor: evt.color || catObj?.color || '#2563eb' }}
                    >
                      <div className="text-[9px] opacity-80">{evt.startTime ? `${evt.startTime} น.` : 'ตลอดวัน'}</div>
                      <div className="line-clamp-2 leading-snug">{evt.title}</div>
                      {evt.location && (
                        <div className="text-[9px] opacity-90 truncate flex items-center space-x-1 pt-0.5">
                          <MapPin size={9} />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render List Agenda View
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 font-light">
            ไม่พบกิจกรรมตรงตามเงื่อนไขที่ค้นหา
          </div>
        ) : (
          filteredEvents.map(evt => {
            const catObj = CATEGORIES.find(c => c.id === evt.category);
            const isMulti = evt.startDate && evt.endDate && evt.startDate !== evt.endDate;

            return (
              <div
                key={evt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-mcu-pink-light transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-4 flex-1">
                  {/* Date Badge */}
                  <div 
                    className="w-16 h-18 rounded-2xl text-white flex flex-col items-center justify-center shrink-0 shadow-md"
                    style={{ backgroundColor: evt.color || catObj?.color || '#2563eb' }}
                  >
                    <span className="text-xl font-bold leading-none">
                      {evt.startDate ? evt.startDate.split('-')[2] : evt.date || '01'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-90">
                      {evt.month || 'ก.ค.'}
                    </span>
                    <span className="text-[8px] opacity-75 mt-0.5">{evt.year || '2569'}</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: evt.color || catObj?.color || '#2563eb' }}
                      >
                        {evt.categoryLabel || catObj?.labelTh || 'กิจกรรม'}
                      </span>
                      {isMulti && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center space-x-1">
                          <CalendarRange size={11} />
                          <span>หลายวัน (ถึง {evt.endDate})</span>
                        </span>
                      )}
                      {evt.recurrence && evt.recurrence !== 'none' && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                          กิจกรรมประจำ ({evt.recurrence})
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-800 group-hover:text-mcu-pink transition-colors">
                      {evt.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center space-x-1">
                        <Clock size={13} className="text-mcu-gold" />
                        <span>{evt.isAllDay ? 'ตลอดวัน' : (evt.startTime ? `${evt.startTime} น. - ${evt.endTime || ''} น.` : evt.time || '09:00 น.')}</span>
                      </span>

                      <span className="flex items-center space-x-1">
                        <MapPin size={13} className="text-mcu-gold" />
                        <span>{evt.location || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'}</span>
                      </span>

                      {evt.organizer && (
                        <span className="flex items-center space-x-1">
                          <User size={13} className="text-mcu-gold" />
                          <span>{evt.organizer}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    onClick={() => setSelectedEvent(evt)}
                    className="px-4 py-2 bg-mcu-pink-soft text-mcu-pink-deep hover:bg-mcu-pink hover:text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>รายละเอียด</span>
                    <ChevronRight size={14} />
                  </button>

                  <a
                    href={generateGoogleCalendarUrl(evt)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-xl transition-colors"
                    title="เพิ่มลง Google Calendar"
                  >
                    <CalendarDays size={16} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Reminder Toast */}
        {reminderToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold border border-slate-700 animate-bounce">
            <Bell size={18} className="text-amber-400" />
            <span>{reminderToast}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-gradient-to-r from-mcu-pink-deep via-mcu-pink to-amber-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
            <CalendarIcon size={320} />
          </div>

          <div className="relative z-10 space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-mcu-gold border border-white/20">
              <CalendarDays size={14} />
              <span>ปฏิทินวิชาการและศาสนพิธีสถาบัน</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {lang === 'th' ? 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์พ่อขุนผาเมือง' : 'Academic & Ecclesiastical Calendar'}
            </h1>
            <p className="text-xs md:text-sm text-slate-200 font-light leading-relaxed">
              ติดตามกำหนดการสัมมนาวิชาการ วันสำคัญทางพระพุทธศาสนา วาระการประชุมสภาวิทยาลัย และกำหนดการรับสมัครนิสิตใหม่
            </p>
          </div>
        </div>

        {/* Controls Bar: Search, Category Pills, View Mode Switcher */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full lg:w-auto">
              <button
                onClick={() => setViewMode('month')}
                className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  viewMode === 'month' ? 'bg-white text-mcu-pink-deep shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid size={15} />
                <span>รายเดือน</span>
              </button>

              <button
                onClick={() => setViewMode('week')}
                className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  viewMode === 'week' ? 'bg-white text-mcu-pink-deep shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarRange size={15} />
                <span>รายสัปดาห์</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-mcu-pink-deep shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListIcon size={15} />
                <span>รายการ (Agenda)</span>
              </button>
            </div>

            {/* Date Navigator */}
            {viewMode !== 'list' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevDate}
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="text-center font-bold text-slate-800 text-sm sm:text-base min-w-[180px]">
                  {THAI_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
                </div>

                <button
                  onClick={handleNextDate}
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 border border-mcu-pink text-mcu-pink hover:bg-mcu-pink hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  วันนี้
                </button>
              </div>
            )}

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหากิจกรรมหรือสถานที่..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-mcu-pink/20 focus:border-mcu-pink outline-none"
              />
            </div>
          </div>

          {/* Category Filter Badges */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.id ? cat.color : undefined
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: cat.color }}
                />
                <span>{lang === 'th' ? cat.labelTh : cat.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Main View Area */}
        {loading ? (
          <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400">
            กำลังโหลดปฏิทิน...
          </div>
        ) : (
          <div>
            {viewMode === 'month' && renderMonthGrid()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'list' && renderListView()}
          </div>
        )}

      </div>

      {/* EVENT DETAIL POPUP MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Header / Cover Image */}
            <div className="relative h-48 w-full bg-slate-900 shrink-0">
              <img
                src={selectedEvent.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white inline-block uppercase"
                  style={{ backgroundColor: selectedEvent.color || '#2563eb' }}
                >
                  {selectedEvent.categoryLabel || 'กิจกรรมวิทยาลัย'}
                </span>
                <h2 className="text-lg md:text-xl font-bold leading-snug line-clamp-2">
                  {selectedEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 text-xs">
              
              {/* Key Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] font-bold">กำหนดการวันที่</span>
                  <div className="font-bold text-slate-900 flex items-center space-x-1">
                    <CalendarDays size={14} className="text-mcu-pink" />
                    <span>{selectedEvent.startDate || selectedEvent.date}</span>
                    {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate && (
                      <span>ถึง {selectedEvent.endDate}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] font-bold">เวลา</span>
                  <div className="font-bold text-slate-900 flex items-center space-x-1">
                    <Clock size={14} className="text-mcu-gold" />
                    <span>{selectedEvent.isAllDay ? 'ตลอดวัน' : (selectedEvent.startTime ? `${selectedEvent.startTime} น. - ${selectedEvent.endTime || ''} น.` : selectedEvent.time || '09:00 น.')}</span>
                  </div>
                </div>

                <div className="space-y-1 col-span-1 sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] font-bold">สถานที่จัดกิจกรรม</span>
                  <div className="font-bold text-slate-900 flex items-center space-x-1">
                    <MapPin size={14} className="text-amber-600" />
                    <span>{selectedEvent.location || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'}</span>
                  </div>
                </div>

                {selectedEvent.organizer && (
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <span className="text-slate-400 block text-[10px] font-bold">ผู้รับผิดชอบโครงการ</span>
                    <div className="font-bold text-slate-800 flex items-center space-x-1">
                      <User size={14} className="text-blue-600" />
                      <span>{selectedEvent.organizer}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Online Meeting Link (Zoom / Meet) */}
              {selectedEvent.onlineLink && (
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                      <Video size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 text-xs">เข้าร่วมประชุมออนไลน์</div>
                      <div className="text-[10px] text-blue-700">
                        {selectedEvent.meetingPlatform === 'zoom' ? 'Zoom Cloud Meetings' : 'Google Meet Platform'}
                      </div>
                    </div>
                  </div>

                  <a
                    href={selectedEvent.onlineLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center space-x-1"
                  >
                    <span>เข้าร่วมประชุม</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Description */}
              {selectedEvent.details && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">รายละเอียดกิจกรรม</h4>
                  <p className="leading-relaxed text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {selectedEvent.details}
                  </p>
                </div>
              )}

              {/* Registration Link */}
              {selectedEvent.registrationUrl && (
                <div>
                  <a
                    href={selectedEvent.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-colors"
                  >
                    <CheckCircle size={16} />
                    <span>ลงทะเบียนเข้าร่วมกิจกรรมล่วงหน้า</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Attachments */}
              {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center space-x-1">
                    <Paperclip size={14} className="text-mcu-pink" />
                    <span>เอกสารแนบประจำกิจกรรม</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedEvent.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors font-medium text-slate-700"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText size={16} className="text-mcu-pink shrink-0" />
                          <span className="truncate">{att.name}</span>
                        </div>
                        <Download size={14} className="text-slate-400 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Export & Reminders Options */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={generateGoogleCalendarUrl(selectedEvent)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 font-bold rounded-xl text-center transition-colors flex items-center justify-center space-x-1.5"
                >
                  <CalendarDays size={14} className="text-amber-600" />
                  <span>เพิ่ม Google Calendar</span>
                </a>

                <button
                  onClick={() => downloadICSFile(selectedEvent)}
                  className="px-3 py-2 bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-900 font-bold rounded-xl text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download size={14} className="text-blue-600" />
                  <span>ดาวน์โหลด .ics</span>
                </button>

                <button
                  onClick={() => handleSetReminder(selectedEvent)}
                  className="px-3 py-2 bg-slate-100 hover:bg-purple-100 text-slate-800 hover:text-purple-900 font-bold rounded-xl text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Bell size={14} className="text-purple-600" />
                  <span>ตั้งแจ้งเตือน</span>
                </button>
              </div>

            </div>

            {/* Footer Close */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
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
