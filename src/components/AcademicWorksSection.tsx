/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { academicStore } from '../data/academicStore';
import { AcademicWork } from '../types';
import LucideIcon from './LucideIcon';
import { getEmbeddableDriveUrl } from '../lib/driveUtils';

interface AcademicWorksSectionProps {
  lang: 'th' | 'en';
  title?: string;
  subtitle?: string;
  limit?: number;
  navigateTo?: (page: string, subPage?: string, search?: string) => void;
}

const CATEGORY_LABELS: Record<string, { th: string; en: string; color: string }> = {
  research: { th: 'งานวิจัย', en: 'Research Work', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  research_article: { th: 'บทความวิจัย', en: 'Research Article', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  academic_article: { th: 'บทความวิชาการ', en: 'Academic Article', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  book: { th: 'หนังสือ', en: 'Book', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  textbook: { th: 'ตำรา', en: 'Textbook', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  teaching_material: { th: 'เอกสารประกอบการสอน', en: 'Teaching Material', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  default: { th: 'ผลงานวิชาการ', en: 'Academic Work', color: 'bg-slate-50 text-slate-700 border-slate-200' }
};

export default function AcademicWorksSection({
  lang,
  title,
  subtitle,
  limit = 6,
  navigateTo
}: AcademicWorksSectionProps) {
  const [works, setWorks] = useState<AcademicWork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedWork, setSelectedWork] = useState<AcademicWork | null>(null);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const data = await api.getAcademicWorks();
      if (Array.isArray(data) && data.length > 0) {
        setWorks(data);
      } else {
        setWorks(academicStore.getWorks());
      }
    } catch (e) {
      setWorks(academicStore.getWorks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
    const unsub = academicStore.subscribe(() => {
      setWorks(academicStore.getWorks());
    });
    return () => unsub();
  }, []);

  const filteredWorks = works.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'research') return item.category === 'research' || item.category === 'research_article';
    if (filter === 'article') return item.category === 'academic_article';
    if (filter === 'book') return item.category === 'book' || item.category === 'textbook' || item.category === 'teaching_material';
    return item.category === filter;
  });

  const displayList = limit ? filteredWorks.slice(0, limit) : filteredWorks;

  return (
    <section className="py-16 bg-slate-50 border-t border-b border-slate-200/70" id="academic-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">
              {lang === 'th' ? 'ผลงานทางวิชาการและงานวิจัย' : 'Academic Repository'}
            </span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep mb-3 font-sans thai-gold-border pb-2 inline-block">
            {title || (lang === 'th' ? 'ผลงานทางวิชาการ' : 'Academic Works')}
          </h2>
          <p className="text-sm text-muted-text-mcu max-w-2xl mx-auto font-light mt-3">
            {subtitle || (lang === 'th' ? 'รวบรวมผลงานวิจัย บทความวิจัย บทความวิชาการ หนังสือ และตำราทรงคุณค่าของคณาจารย์และนักวิจัย' : 'Research papers, articles, books, and educational innovations.')}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-10">
          {[
            { key: 'all', label: lang === 'th' ? 'ผลงานทั้งหมด' : 'All Works' },
            { key: 'research', label: lang === 'th' ? 'งานวิจัย / บทความวิจัย' : 'Research Papers' },
            { key: 'article', label: lang === 'th' ? 'บทความวิชาการ' : 'Academic Articles' },
            { key: 'book', label: lang === 'th' ? 'หนังสือ / ตำรา' : 'Books & Textbooks' }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                filter === btn.key
                  ? 'bg-mcu-pink text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <LucideIcon name="RefreshCw" size={24} className="animate-spin mx-auto mb-2 text-mcu-pink" />
            <span className="text-xs">กำลังโหลดคลังผลงานวิชาการ...</span>
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <LucideIcon name="BookOpen" size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">ยังไม่มีรายการผลงานทางวิชาการในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayList.map(item => {
              const catMeta = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.default;
              const authorStr = item.authorTh || item.authors || item.projectLeader || 'คณาจารย์วิทยาลัยสงฆ์';
              const yearStr = item.year || item.publicationYear || '2568';
              const publisherStr = item.publisherOrSource || item.journalName || item.fundingSource || 'สถาบันวิจัยพุทธศาสตร์';
              const fileLink = item.attachmentUrl || item.fileUrl || item.doiOrUrl;

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Card Cover */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={getEmbeddableDriveUrl(item.imageUrl || item.coverImageUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800')}
                      alt={item.titleTh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-xs ${catMeta.color}`}>
                        {lang === 'th' ? catMeta.th : catMeta.en}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                      พ.ศ. {yearStr}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-mcu-pink transition-colors">
                      {item.titleTh}
                    </h3>

                    {item.titleEn && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-3">
                        {item.titleEn}
                      </p>
                    )}

                    <div className="space-y-1 text-xs text-slate-500 mb-4 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <LucideIcon name="User" size={13} className="text-mcu-pink shrink-0" />
                        <span className="truncate">{authorStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <LucideIcon name="FileText" size={12} className="shrink-0" />
                        <span className="truncate">{publisherStr}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedWork(item)}
                        className="text-xs font-bold text-mcu-pink hover:text-mcu-pink-dark flex items-center gap-1 cursor-pointer"
                      >
                        <span>อ่านบทคัดย่อ</span>
                        <LucideIcon name="ArrowRight" size={12} />
                      </button>

                      {fileLink && (
                        <a
                          href={fileLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <LucideIcon name="Download" size={12} />
                          <span>PDF</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        {navigateTo && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigateTo('academic')}
              className="inline-flex items-center space-x-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
            >
              <span>{lang === 'th' ? 'ดูคลังผลงานวิชาการทั้งหมด' : 'Browse All Academic Works'}</span>
              <LucideIcon name="ArrowRight" size={16} />
            </button>
          </div>
        )}

      </div>

      {/* Abstract & Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                  {CATEGORY_LABELS[selectedWork.category]?.th || 'ผลงานทางวิชาการ'} • พ.ศ. {selectedWork.year || selectedWork.publicationYear || '2568'}
                </span>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <LucideIcon name="X" size={20} />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedWork.titleTh}
                </h3>
                {selectedWork.titleEn && (
                  <p className="text-xs text-slate-400 italic mt-1">{selectedWork.titleEn}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                <p><strong>ผู้แต่ง / ผู้วิจัย:</strong> {selectedWork.authorTh || selectedWork.authors || selectedWork.projectLeader || '-'}</p>
                {selectedWork.coAuthors && <p><strong>ผู้ร่วมงาน:</strong> {selectedWork.coAuthors}</p>}
                <p><strong>แหล่งเผยแพร่ / วารสาร / ทุน:</strong> {selectedWork.publisherOrSource || selectedWork.journalName || selectedWork.fundingSource || '-'}</p>
                {selectedWork.journalDetails && <p><strong>รายละเอียดวารสาร:</strong> {selectedWork.journalDetails}</p>}
                {selectedWork.databaseIndex && <p><strong>การรับรองฐานข้อมูล:</strong> {selectedWork.databaseIndex}</p>}
              </div>

              {selectedWork.abstract && (
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-800">บทคัดย่อ (Abstract):</h4>
                  <p className="text-xs text-slate-600 leading-relaxed indent-6 whitespace-pre-line bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                    {selectedWork.abstract}
                  </p>
                </div>
              )}

              {selectedWork.keywords && (
                <div className="text-xs text-slate-500">
                  <strong>คำสำคัญ:</strong> {selectedWork.keywords}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedWork(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  ปิด
                </button>

                {(selectedWork.attachmentUrl || selectedWork.fileUrl || selectedWork.doiOrUrl) && (
                  <a
                    href={selectedWork.attachmentUrl || selectedWork.fileUrl || selectedWork.doiOrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                  >
                    <LucideIcon name="Download" size={14} />
                    <span>ดาวน์โหลดไฟล์ผลงานฉบับเต็ม</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
