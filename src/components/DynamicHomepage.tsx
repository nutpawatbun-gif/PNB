/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { downloadsStore } from '../data/downloadsStore';
import { HomepageSection, DownloadableFile } from '../types';

import HeroSlider from './HeroSlider';
import DirectorMessage from './DirectorMessage';
import NewsSection from './NewsSection';
import CourseGrid from './CourseGrid';
import EventsSection from './EventsSection';
import StatsCounter from './StatsCounter';
import ContactSection from './ContactSection';
import AcademicWorksSection from './AcademicWorksSection';

import { 
  Bell, 
  Download, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  UserPlus, 
  Facebook, 
  Youtube, 
  MessageSquare, 
  Award, 
  Building2,
  ChevronRight
} from 'lucide-react';

interface DynamicHomepageProps {
  lang: 'th' | 'en';
  navigateTo: (page: string, subPage?: string, search?: string) => void;
}

export default function DynamicHomepage({ lang, navigateTo }: DynamicHomepageProps) {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloads, setDownloads] = useState<DownloadableFile[]>([]);

  const fetchDownloads = async () => {
    try {
      const downData = await api.getDownloads();
      if (Array.isArray(downData)) {
        setDownloads(downData);
      } else {
        setDownloads(downloadsStore.getDownloads());
      }
    } catch {
      setDownloads(downloadsStore.getDownloads());
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [secData] = await Promise.all([
          api.getHomepageSections().catch(() => [])
        ]);
        if (Array.isArray(secData) && secData.length > 0) {
          setSections(secData.sort((a, b) => a.order - b.order));
        } else {
          setSections([
            { id: 'sec_hero_slider', key: 'hero_slider', titleTh: 'ภาพสไลด์ประชาสัมพันธ์', isVisible: true, order: 1 },
            { id: 'sec_announcements', key: 'announcements', titleTh: 'แถบประกาศสำคัญประจำวัน', isVisible: true, order: 2 },
            { id: 'sec_welcome_message', key: 'welcome_message', titleTh: 'สารจากผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง', isVisible: true, order: 3 },
            { id: 'sec_quick_links', key: 'quick_links', titleTh: 'บริการและลิงก์ด่วน', isVisible: true, order: 4 },
            { id: 'sec_featured_courses', key: 'recommended_courses', titleTh: 'หลักสูตรที่เปิดสอน', isVisible: true, order: 5 },
            { id: 'sec_featured_news', key: 'featured_news', titleTh: 'ข่าวสารรอบรั้ว มจร', isVisible: true, order: 6 },
            { id: 'sec_academic_highlights', key: 'academic_news', titleTh: 'ผลงานทางวิชาการ', isVisible: true, order: 7 },
            { id: 'sec_upcoming_events', key: 'upcoming_events', titleTh: 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์', isVisible: true, order: 8 },
            { id: 'sec_document_downloads', key: 'document_downloads', titleTh: 'เอกสารดาวน์โหลดสำหรับนิสิตและบุคลากร', isVisible: true, order: 9 },
            { id: 'sec_key_stats', key: 'key_stats', titleTh: 'สรุปสถิติสถาบัน', isVisible: true, order: 10 },
            { id: 'sec_org_logo', key: 'org_logo', titleTh: 'ปรัชญาและสัญลักษณ์สถาบัน', isVisible: true, order: 11 },
            { id: 'sec_contact_channels', key: 'contact_channels', titleTh: 'ติดต่อวิทยาลัยสงฆ์และช่องทางออนไลน์', isVisible: true, order: 12 }
          ]);
        }
        await fetchDownloads();
      } catch (err) {
        console.warn('Failed to load homepage sections, using defaults:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const unsub = downloadsStore.subscribe(() => {
      fetchDownloads();
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-mcu-pink border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">กำลังโหลดโครงสร้างหน้าแรก...</p>
        </div>
      </div>
    );
  }

  // Filter only visible sections
  const activeSections = sections.filter(s => s.isVisible);

  return (
    <div className="space-y-0">
      {activeSections.map((sec, idx) => {
        const config = sec.config || {};
        const secKey = `${sec.id}_${idx}`;

        switch (sec.key) {
          // 1. Hero Slider
          case 'hero_slider':
            return (
              <div key={secKey}>
                <HeroSlider 
                  lang={lang} 
                  onViewDetails={() => navigateTo('courses')} 
                  onApplyNow={() => navigateTo('admission', 'apply')} 
                />
              </div>
            );

          // 2. Welcome Message
          case 'welcome_message':
            return (
              <div key={secKey}>
                <DirectorMessage lang={lang} />
              </div>
            );

          // 3. Important Announcements
          case 'announcements':
            return (
              <div key={secKey}>
                <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-mcu-pink py-3 px-4 text-white shadow-md">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <span className="bg-white text-orange-600 font-extrabold px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider flex items-center shadow-xs flex-shrink-0">
                        <Bell size={12} className="mr-1 animate-bounce" />
                        {config.badgeText || (lang === 'th' ? 'ประกาศสำคัญ' : 'Announcement')}
                      </span>
                      <p className="font-semibold text-white/95 truncate">
                        {config.announcementText || (lang === 'th' 
                          ? 'เปิดรับสมัครนิสิตใหม่ ประจำปีการศึกษา 2569 ระดับปริญญาตรี โท เอก' 
                          : 'New student admissions open for Academic Year 2026')}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigateTo('admission')} 
                      className="flex items-center space-x-1 text-xs font-bold bg-white/20 hover:bg-white text-white hover:text-orange-600 px-3 py-1 rounded-full transition-all flex-shrink-0 cursor-pointer"
                    >
                      <span>{lang === 'th' ? 'อ่านรายละเอียดเพิ่มเติม' : 'Read More'}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </section>
              </div>
            );

          // 4. Quick Links
          case 'quick_links':
            return (
              <div key={secKey}>
                <section className="py-8 bg-slate-50 border-b border-gray-200/80">
                  <div className="max-w-7xl mx-auto px-4">
                    {sec.titleTh && (
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">{lang === 'th' ? sec.titleTh : sec.titleEn}</h3>
                        <p className="text-xs text-gray-500 mt-1">{sec.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <button 
                        onClick={() => navigateTo('admission', 'apply')}
                        className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3 group cursor-pointer"
                      >
                        <div className="p-3 rounded-lg bg-pink-100 text-mcu-pink group-hover:bg-mcu-pink group-hover:text-white transition-colors">
                          <UserPlus size={22} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800 group-hover:text-mcu-pink transition-colors">
                            {lang === 'th' ? 'สมัครเรียนออนไลน์' : 'Online Admission'}
                          </div>
                          <div className="text-[11px] text-gray-400">เข้าสู่ระบบรับสมัคร</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => navigateTo('services')}
                        className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3 group cursor-pointer"
                      >
                        <div className="p-3 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                          <GraduationCap size={22} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800 group-hover:text-amber-600 transition-colors">
                            {lang === 'th' ? 'ระบบทะเบียนนิสิต' : 'Student Registrar'}
                          </div>
                          <div className="text-[11px] text-gray-400">ผลการเรียนและลงทะเบียน</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => navigateTo('academic')}
                        className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3 group cursor-pointer"
                      >
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">
                            {lang === 'th' ? 'ผลงานวิชาการ' : 'Academic Hub'}
                          </div>
                          <div className="text-[11px] text-gray-400">ห้องสมุดและงานวิจัย</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => navigateTo('downloads')}
                        className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3 group cursor-pointer"
                      >
                        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Download size={22} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800 group-hover:text-emerald-600 transition-colors">
                            {lang === 'th' ? 'ดาวน์โหลดเอกสาร' : 'Downloads'}
                          </div>
                          <div className="text-[11px] text-gray-400">แบบฟอร์มและระเบียบการ</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            );

          // 5. Promotional Banner
          case 'banner':
            return (
              <div key={secKey}>
                <section className="py-12 px-4 bg-slate-900 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 max-w-xl text-center md:text-left">
                      <span className="bg-mcu-pink/20 border border-mcu-pink/40 text-mcu-pink-soft px-3 py-1 rounded-full text-xs font-semibold">
                        {lang === 'th' ? 'แคมเปญการศึกษาพิเศษ' : 'Educational Campaign'}
                      </span>
                      <h2 className="text-3xl font-extrabold tracking-tight">
                        {config.title || (lang === 'th' ? sec.titleTh : sec.titleEn)}
                      </h2>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {config.subtitle || sec.description}
                      </p>
                      <div className="pt-2">
                        <button 
                          onClick={() => navigateTo('admission', 'apply')}
                          className="px-6 py-3 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-bold rounded-xl shadow-lg hover:shadow-pink-500/30 transition-all cursor-pointer inline-flex items-center space-x-2"
                        >
                          <span>{config.buttonText || (lang === 'th' ? 'สมัครเรียนเลย' : 'Apply Now')}</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                      <img 
                        src={config.bannerImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200"} 
                        alt="Banner" 
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </section>
              </div>
            );

          // 6. News Section 1: Featured & General News
          case 'featured_news':
            return (
              <div key={secKey}>
                <NewsSection 
                  lang={lang} 
                  title={config.title || (lang === 'th' ? 'ข่าวสารและกิจกรรมล่าสุด' : 'Latest News & Activities')}
                  subtitle={config.subtitle || (lang === 'th' ? 'ไฮไลท์ข่าวสารรอบรั้ว มจร ข่าวประชาสัมพันธ์ และกิจกรรมสถาบัน' : 'Keep up with our announcements and campus highlights')}
                  showFilterBar={true}
                  limit={config.limit || 6}
                />
              </div>
            );

          // 7. Academic Works Section (คลังผลงานทางวิชาการโดยเฉพาะ)
          case 'latest_news':
          case 'academic_news':
          case 'academic_highlights':
            return (
              <div key={secKey}>
                <AcademicWorksSection 
                  lang={lang} 
                  title={config.title || (lang === 'th' ? 'ผลงานทางวิชาการ' : 'Academic Works')}
                  subtitle={config.subtitle || (lang === 'th' ? 'รวบรวมผลงานวิจัย บทความวิชาการ หนังสือ ตำรา และนวัตกรรมทางปัญญา' : 'Academic research, books, and publications')}
                  limit={config.limit || 6}
                  navigateTo={navigateTo}
                />
              </div>
            );

          // 8. Recommended Courses
          case 'recommended_courses':
            return (
              <div key={secKey}>
                <CourseGrid 
                  lang={lang} 
                  onApplyCourse={(courseId) => navigateTo('admission', 'apply', `?program=${courseId}`)} 
                />
              </div>
            );

          // 9. Calendar Section 1: Upcoming Events Agenda
          case 'upcoming_events':
            return (
              <div key={secKey}>
                <EventsSection 
                  lang={lang} 
                  onViewAll={() => navigateTo('calendar')} 
                  title={config.title || (lang === 'th' ? 'ปฏิทินกิจกรรมวิทยาลัยสงฆ์' : 'College Activity Calendar')}
                  subtitle={config.subtitle || (lang === 'th' ? 'ติดตามกำหนดการ วันสำคัญทางพระพุทธศาสนา และพิธีการทางวิชาการประจำเดือน' : 'Stay updated with ecclesiastical days and monthly events')}
                  badge={lang === 'th' ? 'กำหนดการเด่นประจำเดือน' : 'Monthly Agenda'}
                  variant="monthly"
                />
              </div>
            );

          // 10. Calendar Section 2: Annual Academic Schedule & Key Projects
          case 'event_calendar':
          case 'academic_schedule':
            return (
              <div key={secKey}>
                <EventsSection 
                  lang={lang} 
                  onViewAll={() => navigateTo('calendar')} 
                  title={config.title || (lang === 'th' ? 'กำหนดการและโครงการสำคัญประจำปีการศึกษา 2569' : 'Annual Academic & Monastic Schedule')}
                  subtitle={config.subtitle || (lang === 'th' ? 'กำหนดการลงทะเบียน สอบวัดผล พิธีพระราชทานปริญญาบัตร และโครงการอบรมพระธรรมวิทยากร' : 'Key annual academic milestones, enrollment dates, and major ceremonies')}
                  badge={lang === 'th' ? 'แผนงานและโครงการประจำปี 2569' : 'Academic Year 2026 Milestones'}
                  variant="annual"
                />
              </div>
            );

          // 11. Featured Personnel / Staff
          case 'featured_staff':
            const staffList = config.staffList || [
              {
                name: "พระครูศรีพัชโรทัย, ดร.",
                position: "ผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
                degree: "พธ.ด. (พระพุทธศาสนา)"
              },
              {
                name: "ผศ.ดร.อัครเดช บุนนาค",
                position: "รองผู้อำนวยการฝ่ายวิชาการ",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
                degree: "ปร.ด. (การบริหารการศึกษา)"
              },
              {
                name: "พระมหาสมชาย สุขจิตฺโต",
                position: "อาจารย์ประจำหลักสูตรพุทธศาสตร์",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
                degree: "พธ.ม. (ปรัชญา)"
              }
            ];
            return (
              <div key={secKey}>
                <section className="py-12 bg-white">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                      <span className="text-mcu-pink font-bold text-xs uppercase tracking-widest">Faculty & Leadership</span>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-1">
                        {lang === 'th' ? sec.titleTh : sec.titleEn}
                      </h2>
                      <p className="text-gray-500 text-sm mt-2">{sec.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {staffList.map((st: any, i: number) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all text-center space-y-3">
                          <img 
                            src={st.image} 
                            alt={st.name} 
                            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-sm"
                          />
                          <div>
                            <h4 className="font-bold text-gray-800 text-base">{st.name}</h4>
                            <p className="text-xs font-medium text-mcu-pink mt-0.5">{st.position}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{st.degree}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            );

          // 12. Document Downloads
          case 'document_downloads':
            return (
              <div key={secKey}>
                <section className="py-12 bg-slate-50 border-t border-b border-gray-200/80">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                      <div>
                        <span className="text-mcu-pink font-bold text-xs uppercase tracking-widest">Resources</span>
                        <h2 className="text-2xl font-extrabold text-gray-800 mt-1">
                          {lang === 'th' ? sec.titleTh : sec.titleEn}
                        </h2>
                        <p className="text-gray-500 text-xs mt-1">{sec.description}</p>
                      </div>
                      <button 
                        onClick={() => navigateTo('downloads')}
                        className="mt-4 md:mt-0 inline-flex items-center space-x-1 text-xs font-bold text-mcu-pink hover:text-mcu-pink-deep"
                      >
                        <span>{lang === 'th' ? 'ดูเอกสารทั้งหมด' : 'View All Files'}</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(downloads && downloads.length > 0) ? (
                        downloads.slice(0, 4).map((file: any, fileIdx: number) => (
                          <div key={file.id ? `${file.id}_${fileIdx}` : `file_${fileIdx}`} className="bg-white p-4 rounded-xl border border-gray-200/70 flex items-center justify-between hover:border-mcu-pink/50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="p-2.5 bg-mcu-pink-soft text-mcu-pink-deep rounded-lg">
                                <Download size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800 line-clamp-1">{file.name}</p>
                                <span className="text-[10px] text-gray-400">{file.format || file.fileType || 'FILE'} • {file.size || file.fileSize || '1.0 MB'}</span>
                              </div>
                            </div>
                            <a 
                              href={file.url || file.fileUrl || '#'} 
                              target="_blank" 
                              rel="noreferrer"
                              download={file.name ? `${file.name}.${(file.format || 'pdf').toLowerCase()}` : undefined}
                              onClick={() => {
                                if (file.id) api.incrementDownload(file.id).catch(() => {});
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-mcu-pink hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <span>ดาวน์โหลด</span>
                              <Download size={12} />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full bg-white p-8 rounded-xl border border-gray-200/70 text-center text-gray-500 space-y-2">
                          <Download className="w-8 h-8 mx-auto text-gray-400 opacity-60" />
                          <p className="text-xs font-semibold">{lang === 'th' ? 'ยังไม่มีเอกสารดาวน์โหลดในระบบขณะนี้' : 'No downloadable documents available at this time.'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            );

          // 13. PR Video
          case 'pr_video':
            return (
              <div key={secKey}>
                <section className="py-12 bg-white">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                      <span className="text-mcu-pink font-bold text-xs uppercase tracking-widest">Video Gallery</span>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-1">
                        {config.videoTitle || (lang === 'th' ? sec.titleTh : sec.titleEn)}
                      </h2>
                      <p className="text-gray-500 text-sm mt-2">{config.description || sec.description}</p>
                    </div>

                    <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-gray-200 aspect-video bg-black">
                      <iframe 
                        src={config.videoEmbedUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                        title="PR Video" 
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </section>
              </div>
            );

          // 14. Event Gallery
          case 'event_gallery':
            const galleryImages = config.galleryImages || [
              { title: "พิธีไหว้ครูและประธานปฐมนิเทศ", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600" },
              { title: "โครงการสัมมนาพระพุทธศาสนา", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600" },
              { title: "กิจกรรมทำบุญและธรรมสากัจฉา", url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600" },
              { title: "บรรยากาศการเรียนการสอนห้องปฏิบัติการ", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600" }
            ];
            return (
              <div key={secKey}>
                <section className="py-12 bg-slate-50">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                      <span className="text-mcu-pink font-bold text-xs uppercase tracking-widest">Photo Album</span>
                      <h2 className="text-2xl font-extrabold text-gray-800 mt-1">
                        {lang === 'th' ? sec.titleTh : sec.titleEn}
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">{sec.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map((img: any, idx: number) => (
                        <div key={idx} className="group relative rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all aspect-4/3 bg-gray-200">
                          <img 
                            src={img.url} 
                            alt={img.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                            <p className="text-xs font-bold">{img.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            );

          // 15. Key Stats Counter
          case 'key_stats':
            return (
              <div key={secKey}>
                <StatsCounter lang={lang} />
              </div>
            );

          // 16. Organization Branding & Logo
          case 'org_logo':
            return (
              <div key={secKey}>
                <section className="py-10 bg-gradient-to-b from-white to-slate-50 border-t border-b border-gray-100">
                  <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-full bg-mcu-pink/10 border-2 border-mcu-gold/60 p-2 shadow-inner flex items-center justify-center">
                      <Building2 size={40} className="text-mcu-pink-deep" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {config.subText || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'}
                    </h3>
                    <p className="text-mcu-pink-deep font-serif italic text-sm font-semibold">
                      "{config.mottoTh || 'ปัญญา โลกสฺมิ ปชฺโชโต (ปัญญาเป็นแสงสว่างในโลก)'}"
                    </p>
                  </div>
                </section>
              </div>
            );

          // 17. Affiliate Agencies / Partners
          case 'affiliate_agencies':
            const partners = config.partners || [
              { name: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย", logo: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=200", url: "https://www.mcu.ac.th" },
              { name: "สำนักงานพระพุทธศาสนาแห่งชาติ", logo: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=200", url: "https://www.onab.go.th" },
              { name: "จังหวัดเพชรบูรณ์", logo: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=200", url: "http://www.phetchabun.go.th" },
              { name: "สมาคมสภาการศึกษาพระพุทธศาสนา", logo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=200", url: "#" }
            ];
            return (
              <div key={secKey}>
                <section className="py-8 bg-white border-b border-gray-100">
                  <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                      {lang === 'th' ? sec.titleTh : sec.titleEn}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 opacity-80 hover:opacity-100 transition-opacity">
                      {partners.map((p: any, i: number) => (
                        <a 
                          key={i} 
                          href={p.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all text-xs font-semibold text-gray-600 hover:text-mcu-pink"
                        >
                          <Award size={18} className="text-mcu-pink" />
                          <span>{p.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            );

          // 18. Contact Channels
          case 'contact_channels':
            return (
              <div key={secKey}>
                <ContactSection lang={lang} />
              </div>
            );

          // 19. Google Map Location (Removed per request)
          case 'google_map':
            return null;

          // 20. Social Media
          case 'social_media':
            return (
              <div key={secKey}>
                <section className="py-8 bg-slate-950 text-white border-t border-slate-900">
                  <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-mcu-pink">
                      {lang === 'th' ? 'ช่องทางติดตามข่าวสารออนไลน์' : 'Connect With Us'}
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <a href={config.facebook || "https://facebook.com/mcuphetchabun"} target="_blank" rel="noreferrer" className="p-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all">
                        <Facebook size={20} />
                      </a>
                      <a href={config.youtube || "https://youtube.com"} target="_blank" rel="noreferrer" className="p-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-all">
                        <Youtube size={20} />
                      </a>
                      <a href={config.line || "#"} target="_blank" rel="noreferrer" className="p-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition-all">
                        <MessageSquare size={20} />
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
