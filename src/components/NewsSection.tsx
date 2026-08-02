/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNews } from '../hooks/useNews';
import { api } from '../lib/api';
import { NewsItem, AnnouncementItem } from '../types';
import LucideIcon from './LucideIcon';
import { getEmbeddableDriveUrl } from '../lib/driveUtils';
import { Facebook, MessageCircle, Twitter, Link as LinkIcon, Eye, Video, FileText, Download } from 'lucide-react';

interface NewsSectionProps {
  lang: 'th' | 'en';
  title?: string;
  subtitle?: string;
  categoryFilter?: 'all' | 'pr' | 'academic' | 'activity' | 'announcement';
  showFilterBar?: boolean;
  limit?: number;
}

export default function NewsSection({ 
  lang, 
  title, 
  subtitle, 
  categoryFilter = 'all', 
  showFilterBar = true, 
  limit 
}: NewsSectionProps) {
  const { news: rawNewsList, refreshNews } = useNews();
  const newsList = Array.isArray(rawNewsList) ? rawNewsList : [];
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pr' | 'academic' | 'activity' | 'announcement'>(categoryFilter);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Lightbox Gallery State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxUrls, setLightboxUrls] = useState<string[]>([]);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Robust clipboard copy function with fallback for all browser security contexts
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        return fallbackCopy(text);
      }
    } else {
      return fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string): boolean => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      return false;
    }
  };

  // Fetch official announcements from API
  useEffect(() => {
    api.getAnnouncements()
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Auto-open news modal if URL contains ?id= or ?newsId=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('id') || params.get('newsId');
    if (targetId && combinedList.length > 0 && !selectedNews) {
      const found = combinedList.find(n => String(n.id) === String(targetId) || n.id === 'anc_' + targetId);
      if (found) {
        setSelectedNews(found);
      }
    }
  }, [newsList.length, announcements.length]);

  const handleOpenNews = (news: NewsItem) => {
    setSelectedNews(news);
    api.incrementNewsView(news.id).then(() => {
      refreshNews();
    }).catch(() => {});
  };

  // Map announcements to NewsItem format for unified grid display
  const announcementItems: NewsItem[] = announcements.map(anc => ({
    id: 'anc_' + anc.id,
    title: anc.title,
    titleEn: anc.titleEn || anc.title,
    category: 'announcement',
    categoryLabel: anc.categoryLabel || (lang === 'th' ? 'ประกาศมหาวิทยาลัย' : 'Announcement'),
    date: anc.startDate || anc.createdAt?.split('T')[0] || '2569',
    excerpt: anc.excerpt || anc.title,
    content: anc.content || anc.excerpt || 'ประกาศอย่างเป็นทางการจากมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    viewCount: anc.viewCount || 0,
    status: 'Published',
    attachments: anc.attachments as any
  }));

  // Flexible category matching helper (Supports both Thai & English category strings)
  const matchCategory = (itemCat: string = '', targetFilter: string) => {
    if (!targetFilter || targetFilter === 'all') return true;
    const cat = itemCat.toLowerCase().trim();
    const filterKey = targetFilter.toLowerCase().trim();

    if (filterKey === 'pr' || filterKey === 'ข่าวประชาสัมพันธ์') {
      return cat === 'pr' || cat === 'cat_pr' || cat === 'cat_admission' || cat.includes('ประชาสัมพันธ์') || cat.includes('รับสมัคร');
    }
    if (filterKey === 'academic' || filterKey === 'ข่าววิชาการ') {
      return cat === 'academic' || cat === 'cat_academic' || cat.includes('วิชาการ') || cat.includes('สัมมนา');
    }
    if (filterKey === 'activity' || filterKey === 'ข่าวกิจกรรม') {
      return cat === 'activity' || cat === 'cat_activity' || cat.includes('กิจกรรม') || cat.includes('นิสิต');
    }
    if (filterKey === 'announcement' || filterKey === 'ประกาศมหาวิทยาลัย') {
      return cat === 'announcement' || cat === 'cat_announcement' || cat.includes('ประกาศ');
    }
    return cat === filterKey;
  };

  // Combine news items and announcements
  const combinedList = [...newsList, ...announcementItems];

  // Apply category filter and limit if specified
  const filteredNewsList = combinedList.filter(item => matchCategory(item.category, filter));
  const filteredNews = limit ? filteredNewsList.slice(0, limit) : filteredNewsList;

  const t = {
    title: title || (lang === 'th' ? 'ข่าวสารและกิจกรรมล่าสุด' : 'Latest News & Activities'),
    sub: subtitle || (lang === 'th' ? 'ข่าวประชาสัมพันธ์ ข่าววิชาการ ข่าวกิจกรรม และประกาศมหาวิทยาลัย' : 'Keep up with our announcements, academic news, and campus highlights.'),
    all: lang === 'th' ? 'ข่าวทั้งหมด' : 'All News',
    pr: lang === 'th' ? 'ข่าวประชาสัมพันธ์' : 'Public Relations',
    academic: lang === 'th' ? 'ข่าววิชาการ' : 'Academics',
    activity: lang === 'th' ? 'ข่าวกิจกรรม' : 'Activities',
    announcement: lang === 'th' ? 'ประกาศมหาวิทยาลัย' : 'Announcements',
    readMore: lang === 'th' ? 'อ่านเพิ่มเติม' : 'Read More',
    published: lang === 'th' ? 'วันที่เผยแพร่' : 'Published on',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    share: lang === 'th' ? 'แชร์ข่าวสารนี้' : 'Share Article'
  };

  const getCategoryColor = (category: string) => {
    const cat = (category || '').toLowerCase().trim();
    if (cat === 'pr' || cat === 'general' || cat === 'cat_pr' || cat.includes('ประชาสัมพันธ์')) return 'bg-sky-100 text-sky-800 border-sky-300 font-semibold';
    if (cat === 'academic' || cat === 'cat_academic' || cat.includes('วิชาการ')) return 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
    if (cat === 'activity' || cat === 'cat_activity' || cat.includes('กิจกรรม')) return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    if (cat === 'mcu_announcement' || cat === 'announcement' || cat.includes('ประกาศ')) return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    if (cat === 'student_affairs' || cat.includes('นิสิต')) return 'bg-purple-100 text-purple-800 border-purple-300 font-semibold';
    if (cat === 'procurement' || cat.includes('จัดซื้อ')) return 'bg-stone-100 text-stone-800 border-stone-300 font-semibold';
    return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
  };

  return (
    <section className="py-16 bg-white dark:bg-slate-950" id="news">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">{lang === 'th' ? 'ข่าวสารรอบรั้ว มจร' : 'News & Announcements'}</span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep dark:text-mcu-gold-light mb-3 font-sans thai-gold-border pb-2 inline-block">
            {t.title}
          </h2>
          <p className="text-sm text-muted-text-mcu dark:text-slate-400 max-w-2xl mx-auto font-light mt-3">
            {t.sub}
          </p>
        </div>

        {/* Filter Bar */}
        {showFilterBar && (
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-10">
            {[
              { key: 'all', label: t.all },
              { key: 'pr', label: t.pr },
              { key: 'academic', label: t.academic },
              { key: 'activity', label: t.activity },
              { key: 'announcement', label: t.announcement }
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key as any)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  filter === btn.key
                    ? 'bg-mcu-pink text-white shadow-md'
                    : 'bg-mcu-pink-soft/60 text-mcu-pink-deep hover:bg-mcu-pink-light/50 border border-mcu-pink-light/30'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* News & Announcement Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((news) => (
            <article 
              key={news.id}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-border-mcu dark:border-slate-800 shadow-mcu-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-mcu-pink-soft">
                <img
                  src={getEmbeddableDriveUrl(news.imageUrl)}
                  alt={lang === 'th' ? news.title : news.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-transform"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border shadow-sm ${getCategoryColor(news.category)}`}>
                    {lang === 'th' ? news.categoryLabel : news.category.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between text-xs text-muted-text-mcu dark:text-slate-400 mb-2.5">
                  <div className="flex items-center">
                    <LucideIcon name="Calendar" size={12} className="mr-1 text-mcu-gold" />
                    <span>{news.date}</span>
                  </div>
                  {news.viewCount !== undefined && (
                    <div className="flex items-center text-[11px] text-slate-400">
                      <Eye size={12} className="mr-1" />
                      <span>{news.viewCount} ครั้ง</span>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-mcu-pink-deep dark:text-slate-100 mb-2 line-clamp-2 leading-snug group-hover:text-mcu-pink transition-colors">
                  {lang === 'th' ? news.title : news.titleEn}
                </h3>

                <p className="text-xs sm:text-sm text-text-mcu dark:text-slate-400 font-light line-clamp-3 leading-relaxed mb-4 flex-grow">
                  {news.excerpt}
                </p>

                <div className="pt-3 border-t border-mcu-pink-soft dark:border-slate-800 flex justify-start">
                  <button
                    onClick={() => handleOpenNews(news)}
                    className="text-xs font-bold text-mcu-pink hover:text-mcu-pink-dark flex items-center transition-colors cursor-pointer group/btn"
                  >
                    <span>{t.readMore}</span>
                    <LucideIcon name="ArrowRight" size={12} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state if news category has none */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12 text-muted-text-mcu">
            {lang === 'th' ? 'ไม่มีรายการในหมวดหมู่นี้' : 'No items found in this category.'}
          </div>
        )}

      </div>

      {/* 100% COMPLETE ARTICLE & GALLERY POPUP MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 bg-mcu-pink-deep/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-mcu-gold max-w-3xl w-full max-h-[90vh] overflow-y-auto my-6 animate-slide-up">
            
            {/* Cover Image & Overlay */}
            <div className="relative h-64 sm:h-80 bg-mcu-pink-soft shrink-0">
              <img
                src={getEmbeddableDriveUrl(selectedNews.imageUrl)}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
              
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full cursor-pointer focus:outline-none transition-all shadow-md"
                aria-label="Close article"
              >
                <LucideIcon name="X" size={20} />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border shadow-sm ${getCategoryColor(selectedNews.category)}`}>
                    {lang === 'th' ? selectedNews.categoryLabel : selectedNews.category.toUpperCase()}
                  </span>
                  {selectedNews.viewCount !== undefined && (
                    <span className="text-[11px] font-bold text-amber-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                      <Eye size={12} />
                      <span>{selectedNews.viewCount} เข้าชม</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white drop-shadow leading-snug">
                  {lang === 'th' ? selectedNews.title : selectedNews.titleEn}
                </h3>
              </div>
            </div>

            {/* Article Content & Complete Details */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Meta Info Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-mcu-pink-light/50 dark:border-slate-800 gap-2">
                <div className="flex items-center space-x-2">
                  <LucideIcon name="Calendar" size={14} className="text-mcu-gold" />
                  <span>{t.published}: <strong>{selectedNews.date}</strong></span>
                </div>
                {selectedNews.authorName && (
                  <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                    <LucideIcon name="User" size={14} className="text-mcu-pink" />
                    <span>ผู้บันทึก: <strong>{selectedNews.authorName}</strong> {selectedNews.authorRole && `(${selectedNews.authorRole})`}</span>
                  </div>
                )}
              </div>

              {/* Main Text Content */}
              <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-light space-y-4 whitespace-pre-line">
                {selectedNews.content}
              </div>

              {/* Video Embed Section if present */}
              {selectedNews.videoUrl && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep dark:text-mcu-gold-light flex items-center gap-1.5">
                    <Video size={16} className="text-rose-600" />
                    <span>วิดีโอคลิปข่าวสารกิจกรรม</span>
                  </h4>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-md">
                    <iframe
                      src={selectedNews.videoUrl.replace('watch?v=', 'embed/')}
                      title="News Video"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Attachment Downloads Section */}
              {((selectedNews.attachments && selectedNews.attachments.length > 0) || selectedNews.attachmentUrl) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <FileText size={16} className="text-mcu-pink" />
                    <span>เอกสารแนบประกอบข่าวสาร/ประกาศ</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedNews.attachmentUrl && (
                      <a
                        href={selectedNews.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-mcu-pink text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-mcu-pink transition-colors shadow-xs"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={16} className="text-mcu-pink" />
                          <span>{selectedNews.attachmentName || 'ดาวน์โหลดเอกสารประกอบ (PDF)'}</span>
                        </span>
                        <Download size={15} />
                      </a>
                    )}
                    {selectedNews.attachments?.map((att: any, i: number) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-mcu-pink text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-mcu-pink transition-colors shadow-xs"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={16} className="text-mcu-pink" />
                          <span>{att.name} ({att.size || 'PDF'})</span>
                        </span>
                        <Download size={15} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Gallery / Album Section (อัลบั้มภาพ 6+ รูป) */}
              {selectedNews.galleryUrls && selectedNews.galleryUrls.length > 0 && (
                <div className="pt-4 border-t border-mcu-pink-light/40 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep dark:text-mcu-gold-light flex items-center gap-1.5">
                      <LucideIcon name="Image" size={16} className="text-mcu-gold" />
                      <span>{selectedNews.albumTitle || 'อัลบั้มภาพข่าวสารกิจกรรมเพิ่มเติม'} ({selectedNews.galleryUrls.length} รูป)</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">คลิกภาพเพื่อขยายใหญ่</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedNews.galleryUrls.map((url, index) => {
                      const embedUrl = getEmbeddableDriveUrl(url);
                      return (
                        <div 
                          key={index} 
                          onClick={() => {
                            const urls = [getEmbeddableDriveUrl(selectedNews.imageUrl), ...(selectedNews.galleryUrls || []).map(getEmbeddableDriveUrl)];
                            setLightboxUrls(urls);
                            setLightboxIndex(index + 1);
                          }}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm cursor-zoom-in group hover:border-mcu-pink transition-all bg-slate-100"
                        >
                          <img 
                            src={embedUrl} 
                            alt={`ภาพอัลบั้ม ${index + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <LucideIcon name="Maximize2" size={18} className="text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 drop-shadow" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Social Media Sharing Panel */}
              <div className="pt-4 border-t border-mcu-pink-light/40 dark:border-slate-800 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep dark:text-mcu-gold-light flex items-center gap-1.5">
                  <MessageCircle size={16} className="text-mcu-gold" />
                  <span>{t.share}</span>
                </h4>

                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const articleUrl = `${window.location.origin}/news?id=${selectedNews.id}`;
                    const encodedUrl = encodeURIComponent(articleUrl);
                    const encodedTitle = encodeURIComponent(lang === 'th' ? selectedNews.title : selectedNews.titleEn);
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
                          }}
                          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#1877F2]/20"
                        >
                          <Facebook size={14} />
                          <span>Facebook</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`, '_blank');
                          }}
                          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#06C755]/10 hover:bg-[#06C755]/20 text-[#06C755] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#06C755]/20"
                        >
                          <MessageCircle size={14} />
                          <span>LINE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
                          }}
                          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-900/15 dark:border-white/15"
                        >
                          <Twitter size={14} />
                          <span>X (Twitter)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            copyToClipboard(articleUrl).then((success) => {
                              if (success) {
                                triggerToast(lang === 'th' ? 'คัดลอกลิงก์ข่าวสารเรียบร้อยแล้ว!' : 'Copied news link to clipboard!');
                              } else {
                                triggerToast(lang === 'th' ? 'ไม่สามารถคัดลอกลิงก์ได้' : 'Failed to copy link', 'error');
                              }
                            });
                          }}
                          className="flex items-center space-x-1.5 px-3.5 py-2 bg-mcu-pink-soft hover:bg-mcu-pink-light/60 text-mcu-pink-deep rounded-xl text-xs font-bold transition-all cursor-pointer border border-mcu-pink-light/40 sm:ml-auto"
                        >
                          <LinkIcon size={14} />
                          <span>{lang === 'th' ? 'คัดลอกลิงก์ข่าว' : 'Copy Link'}</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="bg-mcu-pink text-white hover:bg-mcu-pink-dark px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  {t.close}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Full-screen Lightbox Gallery Zoom Modal */}
      {lightboxIndex !== null && lightboxUrls.length > 0 && (
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-fade-in cursor-zoom-out"
        >
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-10 font-sans">
            <span className="text-xs sm:text-sm font-bold bg-black/50 px-3 py-1.5 rounded-full border border-white/20">
              ภาพที่ {lightboxIndex + 1} จาก {lightboxUrls.length}
            </span>
            <button 
              onClick={() => setLightboxIndex(null)}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-colors"
              aria-label="Close lightbox"
            >
              <LucideIcon name="X" size={20} />
            </button>
          </div>

          <div className="relative w-full max-w-5xl px-4 flex items-center justify-center">
            {lightboxUrls.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! - 1 + lightboxUrls.length) % lightboxUrls.length);
                }}
                className="absolute left-6 z-10 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full cursor-pointer border border-white/10 transition-colors"
                aria-label="Previous image"
              >
                <LucideIcon name="ChevronLeft" size={24} />
              </button>
            )}

            <div 
              onClick={(e) => e.stopPropagation()} 
              className="max-w-full max-h-[75vh] flex items-center justify-center select-none rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 bg-slate-900/40"
            >
              <img 
                src={lightboxUrls[lightboxIndex]} 
                alt={`ภาพประกอบขนาดใหญ่ ${lightboxIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {lightboxUrls.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! + 1) % lightboxUrls.length);
                }}
                className="absolute right-6 z-10 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full cursor-pointer border border-white/10 transition-colors"
                aria-label="Next image"
              >
                <LucideIcon name="ChevronRight" size={24} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white font-sans text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-white/10 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toast.text}</span>
        </div>
      )}

    </section>
  );
}
