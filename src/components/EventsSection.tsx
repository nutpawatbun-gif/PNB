/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { CalendarEvent } from '../types';
import LucideIcon from './LucideIcon';

interface EventsSectionProps {
  lang: 'th' | 'en';
  onViewAll?: () => void;
  title?: string;
  subtitle?: string;
  badge?: string;
  variant?: 'monthly' | 'annual';
}

export default function EventsSection({ lang, onViewAll, title, subtitle, badge, variant = 'monthly' }: EventsSectionProps) {
  const { events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const filteredEvents = React.useMemo(() => {
    return events.map(evt => {
      let dateNum = evt.date;
      let monthStr = evt.month;
      let yearStr = evt.year;
      let timeStr = evt.time || (evt.isAllDay ? 'ตลอดวัน' : (evt.startTime ? `${evt.startTime} น. - ${evt.endTime || ''}` : 'ตลอดวัน'));

      if (evt.startDate && (!dateNum || !monthStr || !yearStr)) {
        const dObj = new Date(evt.startDate);
        if (!isNaN(dObj.getTime())) {
          dateNum = dObj.getDate().toString().padStart(2, '0');
          const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
          monthStr = thaiMonths[dObj.getMonth()];
          yearStr = (dObj.getFullYear() + 543).toString();
        }
      }

      return {
        ...evt,
        date: dateNum || '01',
        month: monthStr || 'ม.ค.',
        year: yearStr || '2569',
        time: timeStr
      };
    });
  }, [events]);

  const t = {
    title: title || (lang === 'th' ? 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์' : 'College Activity Calendar'),
    sub: subtitle || (lang === 'th' ? 'ติดตามกำหนดการ วันสำคัญทางพระพุทธศาสนา และพิธีการทางวิชาการประจำปี' : 'Stay updated with ecclesiastical days, monastic assemblies, and academic programs.'),
    time: lang === 'th' ? 'เวลา' : 'Time',
    location: lang === 'th' ? 'สถานที่' : 'Location',
    viewDetails: lang === 'th' ? 'ดูรายละเอียด' : 'View Details',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    details: lang === 'th' ? 'รายละเอียดกิจกรรม' : 'Event Information',
    agenda: badge || (variant === 'annual' 
      ? (lang === 'th' ? 'กำหนดการประจำปีการศึกษา 2569' : 'Academic Year 2026 Schedule')
      : (lang === 'th' ? 'กำหนดการเด่นประจำเดือน' : 'Ecclesiastical Agenda'))
  };

  return (
    <section className="py-16 bg-white border-b border-mcu-pink-light" id="events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">{t.agenda}</span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep mb-3 font-sans thai-gold-border pb-2 inline-block">
            {t.title}
          </h2>
          <p className="text-sm text-muted-text-mcu max-w-2xl mx-auto font-light mt-3">
            {t.sub}
          </p>
        </div>

        {/* 4.8 Calendar Items Layout */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs max-w-5xl mx-auto space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">ยังไม่มีกำหนดการหรือกิจกรรมประจำเดือนในระบบขณะนี้</p>
            <p className="text-[11px]">ข้อมูลปฏิทินกิจกรรมจะได้รับการอัปเดตแบบเรียลไทม์จากระบบจัดการหลังบ้าน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                className="bg-mcu-pink-soft/25 rounded-2xl p-5 border border-mcu-pink-light/60 flex items-start space-x-4 shadow-sm hover:shadow-md hover:border-mcu-pink transition-all duration-300 group"
              >
                {/* High-Contrast Date Badge */}
                <div className="flex-shrink-0 w-16 h-18 bg-gradient-to-b from-mcu-pink-deep to-mcu-pink text-white rounded-xl flex flex-col items-center justify-center border-2 border-mcu-gold shadow-sm group-hover:scale-105 duration-300 transition-transform">
                  <span className="text-xl font-bold tracking-tight leading-none pt-1">
                    {event.date}
                  </span>
                  <span className="text-[10px] text-mcu-gold-light font-bold uppercase tracking-wider mt-0.5">
                    {event.month}
                  </span>
                  <span className="text-[8px] opacity-75 leading-none mb-1">
                    {event.year}
                  </span>
                </div>

                {/* Event Details info */}
                <div className="flex-grow space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-mcu-pink-deep line-clamp-2 leading-snug group-hover:text-mcu-pink transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-muted-text-mcu space-y-1 sm:space-y-0">
                    <span className="flex items-center">
                      <LucideIcon name="Clock" size={12} className="mr-1 text-mcu-gold" />
                      <span>{event.time}</span>
                    </span>
                    <span className="flex items-center">
                      <LucideIcon name="MapPin" size={12} className="mr-1 text-mcu-gold" />
                      <span className="line-clamp-1">{event.location}</span>
                    </span>
                  </div>

                  <div className="pt-2 flex justify-start">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-xs font-bold text-mcu-pink hover:text-mcu-pink-dark flex items-center transition-colors cursor-pointer"
                    >
                      <span>{t.viewDetails}</span>
                      <LucideIcon name="ChevronRight" size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Calendar Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              if (onViewAll) {
                onViewAll();
              } else {
                window.history.pushState(null, '', '/calendar');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="inline-flex items-center space-x-2 bg-mcu-pink-deep hover:bg-mcu-pink text-white font-bold text-xs px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <LucideIcon name="Calendar" size={16} />
            <span>{lang === 'th' ? 'ดูปฏิทินกิจกรรมทั้งหมด (เปิดหน้ารายเดือน/สัปดาห์)' : 'View Full Activity Calendar'}</span>
            <LucideIcon name="ArrowRight" size={14} />
          </button>
        </div>

      </div>

      {/* Event Details Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-mcu-pink-deep/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-mcu-gold max-w-md w-full animate-slide-up overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white px-5 py-4 flex justify-between items-center border-b border-mcu-gold">
              <div className="flex items-center space-x-2">
                <LucideIcon name="Calendar" className="text-mcu-gold" size={18} />
                <h3 className="text-sm sm:text-base font-bold text-mcu-gold-light">{t.details}</h3>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full cursor-pointer focus:outline-none"
                aria-label="Close dialog"
              >
                <LucideIcon name="X" size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-3 mb-2 bg-mcu-pink-soft/40 p-3 rounded-lg border border-mcu-pink-light">
                <div className="w-12 h-12 bg-mcu-pink text-white rounded-lg flex flex-col items-center justify-center font-sans border border-mcu-gold">
                  <span className="text-lg font-bold leading-none">{selectedEvent.date}</span>
                  <span className="text-[9px] text-mcu-gold-light font-bold uppercase">{selectedEvent.month}</span>
                </div>
                <div>
                  <h4 className="font-bold text-mcu-pink-deep leading-tight">
                    {selectedEvent.title}
                  </h4>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 pl-1">
                <div className="flex items-start">
                  <LucideIcon name="Clock" className="text-mcu-gold mr-2.5 mt-0.5 flex-shrink-0" size={14} />
                  <div>
                    <span className="text-muted-text-mcu block text-[10px] uppercase font-bold tracking-wider">{t.time}</span>
                    <strong className="text-text-mcu font-semibold">{selectedEvent.time}</strong>
                  </div>
                </div>

                <div className="flex items-start">
                  <LucideIcon name="MapPin" className="text-mcu-gold mr-2.5 mt-0.5 flex-shrink-0" size={14} />
                  <div>
                    <span className="text-muted-text-mcu block text-[10px] uppercase font-bold tracking-wider">{t.location}</span>
                    <span className="text-text-mcu font-light">{selectedEvent.location}</span>
                  </div>
                </div>

                {selectedEvent.details && (
                  <div className="pt-3 border-t border-mcu-pink-light/40">
                    <span className="text-muted-text-mcu block text-[10px] uppercase font-bold tracking-wider mb-1">{lang === 'th' ? 'คำอธิบายกิจกรรม' : 'Description'}</span>
                    <p className="text-text-mcu font-light leading-relaxed">
                      {selectedEvent.details}
                    </p>
                  </div>
                )}

                {selectedEvent.attachmentUrl && (
                  <div className="pt-3 border-t border-mcu-pink-light/40">
                    <span className="text-muted-text-mcu block text-[10px] uppercase font-bold tracking-wider mb-1.5">{lang === 'th' ? 'เอกสารแนบ / กำหนดการ' : 'Attachments / Agenda'}</span>
                    <div className="p-3 rounded-lg border border-mcu-gold bg-mcu-gold/5 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <LucideIcon name="FileText" size={14} className="text-mcu-pink flex-shrink-0" />
                        <span className="text-xs font-bold text-mcu-pink-deep truncate">
                          {selectedEvent.attachmentName || (lang === 'th' ? 'ไฟล์แนบกำหนดการ' : 'Agenda Attachment')}
                        </span>
                      </div>
                      <a
                        href={selectedEvent.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-mcu-pink hover:bg-mcu-pink-dark text-white rounded text-[10px] font-bold transition-colors flex items-center space-x-1 cursor-pointer flex-shrink-0"
                      >
                        <LucideIcon name="Download" size={10} />
                        <span>{lang === 'th' ? 'เปิดดู' : 'View'}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-mcu-pink-light/40 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-mcu-pink text-white hover:bg-mcu-pink-dark px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  {t.close}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
