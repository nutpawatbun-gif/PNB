/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNews } from '../../hooks/useNews';
import { NewsItem } from '../../types';
import { api } from '../../lib/api';
import LucideIcon from '../LucideIcon';
import { getEmbeddableDriveUrl } from '../../lib/driveUtils';
import { Facebook, MessageCircle, Twitter, Link as LinkIcon, Eye, Video, FileText, Download } from 'lucide-react';

interface NewsPageProps {
  lang: 'th' | 'en';
  activeCategory?: string;
}

export default function NewsPage({ lang, activeCategory = 'all' }: NewsPageProps) {
  const { news: rawNewsList, refreshNews } = useNews();
  const newsList = Array.isArray(rawNewsList) ? rawNewsList : [];
  const [filter, setFilter] = useState<string>(activeCategory || 'all');

  // Update filter if activeCategory prop changes
  React.useEffect(() => {
    if (activeCategory) {
      setFilter(activeCategory === 'landing' ? 'all' : activeCategory);
    }
  }, [activeCategory]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectNews = (news: NewsItem) => {
    setSelectedNews(news);
    api.incrementNewsView(news.id).then(() => {
      refreshNews();
    }).catch(() => {});
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

  // Auto-open news modal if URL contains ?id= or ?newsId=
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('id') || params.get('newsId');
    if (targetId && newsList.length > 0 && !selectedNews) {
      const found = newsList.find(n => String(n.id) === String(targetId) || n.id === 'anc_' + targetId);
      if (found) {
        setSelectedNews(found);
      }
    }
  }, [newsList.length]);

  // Lightbox Gallery State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxUrls, setLightboxUrls] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Flexible category matching helper
  const matchCategory = (itemCat: string = '', targetFilter: string) => {
    if (!targetFilter || targetFilter === 'all') return true;
    const cat = itemCat.toLowerCase().trim();
    const filterKey = targetFilter.toLowerCase().trim();

    if (filterKey === 'pr' || filterKey === 'general' || filterKey === 'ข่าวประชาสัมพันธ์') {
      return cat === 'pr' || cat === 'general' || cat === 'cat_pr' || cat.includes('ประชาสัมพันธ์') || cat.includes('ทั่วไป');
    }
    if (filterKey === 'academic' || filterKey === 'ข่าววิชาการ') {
      return cat === 'academic' || cat === 'cat_academic' || cat.includes('วิชาการ') || cat.includes('สัมมนา');
    }
    if (filterKey === 'activity' || filterKey === 'ข่าวกิจกรรม') {
      return cat === 'activity' || cat === 'cat_activity' || cat.includes('กิจกรรม');
    }
    if (filterKey === 'mcu_announcement' || filterKey === 'announcement' || filterKey === 'ข่าวประกาศมหาวิทยาลัย' || filterKey === 'ประกาศมหาวิทยาลัย') {
      return cat === 'mcu_announcement' || cat === 'announcement' || cat === 'cat_announcement' || cat.includes('ประกาศ');
    }
    if (filterKey === 'student_affairs' || filterKey === 'ข่าวกิจการนิสิต') {
      return cat === 'student_affairs' || cat.includes('นิสิต') || cat.includes('ทุน');
    }
    if (filterKey === 'procurement' || filterKey === 'ข่าวจัดซื้อจัดจ้าง') {
      return cat === 'procurement' || cat.includes('จัดซื้อ') || cat.includes('ประกวดราคา');
    }
    return cat === filterKey || cat.includes(filterKey);
  };

  // Dynamic search and filter
  const filteredNews = newsList.filter((news) => {
    const matchesFilter = matchCategory(news.category, filter);
    
    const titleText = lang === 'th' ? news.title : news.titleEn;
    const descText = news.excerpt || '';
    const cleanQuery = searchQuery.trim().toLowerCase();
    
    const matchesSearch = !cleanQuery || 
      titleText.toLowerCase().includes(cleanQuery) || 
      descText.toLowerCase().includes(cleanQuery);

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE) || 1;
  const paginatedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const t = {
    title: lang === 'th' ? 'ข่าวสารและกิจกรรมทั้งหมด' : 'Latest News & Events Hub',
    sub: lang === 'th' ? 'คลังข่าววิชาการ กิจกรรมสาธารณประโยชน์ และประกาศจากสำนักงานวิทยาลัยสงฆ์' : 'Stay up to date with official releases, academic research papers, and social programs.',
    all: lang === 'th' ? 'ข่าวทั้งหมด' : 'All News',
    pr: lang === 'th' ? 'ข่าวประชาสัมพันธ์' : 'PR Releases',
    academic: lang === 'th' ? 'ข่าววิชาการ' : 'Academics',
    activity: lang === 'th' ? 'ข่าวกิจกรรม' : 'Activities & Service',
    searchPlaceholder: lang === 'th' ? 'ค้นหาข่าวสารด้วยคำสำคัญ...' : 'Search news by keyword...',
    readMore: lang === 'th' ? 'อ่านรายละเอียดเพิ่มเติม' : 'Read Full Release',
    published: lang === 'th' ? 'วันที่เผยแพร่' : 'Published date',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    noResults: lang === 'th' ? 'ไม่พบหัวข้อข่าวสารที่ตรงกับคำค้นหา' : 'No news found matching your keywords.'
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
    <div className="bg-white min-h-screen py-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white rounded-2xl p-8 sm:p-12 text-center border-b-4 border-mcu-gold relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-black/15 z-0"></div>
          <div className="relative z-10 space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-mcu-gold-light">{t.title}</h1>
            <p className="text-xs sm:text-base text-mcu-pink-soft/90 font-light max-w-2xl mx-auto">{t.sub}</p>
          </div>
        </div>

        {/* Filters and Search Bar Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-mcu-pink-light/50">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'all', label: 'ทั้งหมด' },
              { key: 'general', label: '📢 ข่าวประชาสัมพันธ์' },
              { key: 'academic', label: '🎓 ข่าววิชาการ' },
              { key: 'activity', label: '🎨 ข่าวกิจกรรม' },
              { key: 'mcu_announcement', label: '🏛️ ประกาศมหาวิทยาลัย' },
              { key: 'student_affairs', label: '👤 ข่าวกิจการนิสิต' },
              { key: 'procurement', label: '📑 ข่าวจัดซื้อจัดจ้าง' }
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filter === btn.key
                    ? 'bg-mcu-pink text-white shadow-md'
                    : 'bg-mcu-pink-soft text-mcu-pink-deep hover:bg-mcu-pink-light/50 border border-mcu-pink-light/30'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Search bar inputs */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mcu-pink-deep">
              <LucideIcon name="Search" size={16} />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border-mcu rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mcu-pink bg-mcu-pink-soft/10 text-text-mcu font-light"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-text-mcu hover:text-mcu-pink cursor-pointer"
                aria-label="Clear search"
              >
                <LucideIcon name="X" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedNews.map((news) => (
            <article 
              key={news.id}
              className="bg-white rounded-xl overflow-hidden border border-border-mcu shadow-mcu-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
            >
              {/* Image with ReferrerPolicy */}
              <div className="relative h-48 overflow-hidden bg-mcu-pink-soft">
                <img
                  src={getEmbeddableDriveUrl(news.imageUrl)}
                  alt={lang === 'th' ? news.title : news.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-transform"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border shadow-sm ${getCategoryColor(news.category)}`}>
                    {lang === 'th' ? news.categoryLabel : news.category.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between text-xs text-muted-text-mcu mb-2.5">
                  <span className="flex items-center">
                    <LucideIcon name="Calendar" size={12} className="mr-1 text-mcu-gold" />
                    {news.date}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Eye size={12} />
                    {news.viewCount || 0}
                  </span>
                </div>
                <h3 className="text-base font-bold text-mcu-pink-deep mb-2 line-clamp-2 leading-snug group-hover:text-mcu-pink transition-colors">
                  {lang === 'th' ? news.title : news.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-text-mcu font-light line-clamp-3 leading-relaxed mb-4 flex-grow">
                  {news.excerpt}
                </p>
                <div className="pt-3 border-t border-mcu-pink-soft flex justify-between items-center">
                  <button
                    onClick={() => handleSelectNews(news)}
                    className="text-xs font-bold text-mcu-pink hover:text-mcu-pink-dark flex items-center transition-colors cursor-pointer group/btn"
                  >
                    <span>{t.readMore}</span>
                    <LucideIcon name="ArrowRight" size={12} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                  {news.authorName && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{news.authorName}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pt-8 border-t border-slate-100">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {lang === 'th' ? 'หน้าก่อนหน้า' : 'Previous'}
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-mcu-pink text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {lang === 'th' ? 'หน้าถัดไป' : 'Next'}
            </button>
          </div>
        )}

        {/* Empty status */}
        {filteredNews.length === 0 && (
          <div className="text-center py-16 text-muted-text-mcu space-y-3">
            <LucideIcon name="AlertCircle" className="mx-auto text-mcu-pink-deep" size={32} />
            <p className="text-sm font-light">{t.noResults}</p>
          </div>
        )}

      </div>

      {/* Full Article Details Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-mcu-pink-deep/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-mcu-gold max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-slide-up">
            
            {/* Header image and title */}
            <div 
              onClick={() => {
                const urls = [getEmbeddableDriveUrl(selectedNews.imageUrl), ...(selectedNews.galleryUrls || []).map(getEmbeddableDriveUrl)];
                setLightboxUrls(urls);
                setLightboxIndex(0);
              }}
              className="relative h-64 sm:h-80 bg-mcu-pink-soft cursor-zoom-in group"
            >
              <img
                src={getEmbeddableDriveUrl(selectedNews.imageUrl)}
                alt={selectedNews.title}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNews(null);
                }}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full cursor-pointer focus:outline-none transition-colors z-10"
                aria-label="Close article"
              >
                <LucideIcon name="X" size={20} />
              </button>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border shadow-sm ${getCategoryColor(selectedNews.category)}`}>
                  {lang === 'th' ? selectedNews.categoryLabel : selectedNews.category.toUpperCase()}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold mt-2 text-white drop-shadow leading-snug">
                  {lang === 'th' ? selectedNews.title : selectedNews.titleEn}
                </h3>
                <div className="text-[10px] text-mcu-gold-light mt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <LucideIcon name="Maximize2" size={10} className="mr-1" />
                  <span>คลิกที่ภาพเพื่อเปิดดูขนาดใหญ่ (Zoom)</span>
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center text-xs sm:text-sm text-muted-text-mcu mb-6 pb-4 border-b border-mcu-pink-light">
                <LucideIcon name="Calendar" size={14} className="mr-1.5 text-mcu-gold" />
                <span>{t.published}: {selectedNews.date}</span>
              </div>
              <p className="text-sm sm:text-base text-text-mcu leading-relaxed font-light indent-8 whitespace-pre-line">
                {selectedNews.content}
              </p>

              {/* Google Drive / PDF Attachment Section */}
              {selectedNews.attachmentUrl && (
                <div className="mt-6 p-4 rounded-xl border border-mcu-gold bg-mcu-gold/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-start space-x-3 min-w-0 flex-grow">
                    <div className="p-2.5 bg-mcu-pink-soft text-mcu-pink-deep rounded-lg border border-mcu-pink-light/30 flex-shrink-0">
                      <LucideIcon name="FileText" size={20} className="text-mcu-pink" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep leading-tight truncate">
                        {selectedNews.attachmentName || (lang === 'th' ? 'เอกสารดาวน์โหลดแนบ' : 'Attached Document')}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-muted-text-mcu mt-0.5 truncate font-mono text-gray-400">
                        {selectedNews.attachmentUrl}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedNews.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2 bg-mcu-pink hover:bg-mcu-pink-dark text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-sm border border-mcu-pink cursor-pointer flex-shrink-0"
                  >
                    <LucideIcon name="Download" size={12} />
                    <span>{lang === 'th' ? 'เปิดดาวน์โหลด' : 'Download File'}</span>
                  </a>
                </div>
              )}

              {/* Gallery Images Section */}
              {selectedNews.galleryUrls && selectedNews.galleryUrls.length > 0 && (
                <div className="mt-8 pt-6 border-t border-mcu-pink-light/40 space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep flex items-center">
                    <LucideIcon name="Image" size={16} className="mr-1.5 text-mcu-gold animate-pulse" />
                    <span>ภาพประกอบข่าวเพิ่มเติม (แกลเลอรี)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedNews.galleryUrls.map((url, index) => {
                      const embedUrl = getEmbeddableDriveUrl(url);
                      return (
                        <div 
                          key={index} 
                          onClick={() => {
                            const urls = [getEmbeddableDriveUrl(selectedNews.imageUrl), ...(selectedNews.galleryUrls || []).map(getEmbeddableDriveUrl)];
                            setLightboxUrls(urls);
                            setLightboxIndex(index + 1); // 0 is cover image, gallery starts at 1
                          }}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-150 shadow-sm cursor-zoom-in group hover:border-mcu-pink transition-all"
                        >
                          <img 
                            src={embedUrl} 
                            alt={`ภาพประกอบ ${index + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <LucideIcon name="Maximize2" size={16} className="text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Social Share Panel */}
              <div className="mt-8 pt-6 border-t border-mcu-pink-light/40 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep flex items-center">
                  <LucideIcon name="MessageCircle" size={16} className="mr-1.5 text-mcu-gold" />
                  <span>{lang === 'th' ? 'แชร์ข่าวสารนี้' : 'Share this news'}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const articleUrl = `${window.location.origin}/news?id=${selectedNews.id}`;
                    const encodedUrl = encodeURIComponent(articleUrl);
                    const encodedTitle = encodeURIComponent(lang === 'th' ? selectedNews.title : selectedNews.titleEn);
                    return (
                      <>
                        <button
                          onClick={() => {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/25 text-[#1877F2] rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-[#1877F2]/20"
                        >
                          <Facebook size={12} />
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`, '_blank');
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#06C755]/10 hover:bg-[#06C755]/25 text-[#06C755] rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-[#06C755]/20"
                        >
                          <MessageCircle size={12} />
                          <span>LINE</span>
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-slate-900/15"
                        >
                          <Twitter size={12} />
                          <span>X (Twitter)</span>
                        </button>
                        <button
                          onClick={() => {
                            copyToClipboard(articleUrl).then((success) => {
                              if (success) {
                                triggerToast(lang === 'th' ? 'คัดลอกลิงก์ข่าวไปยังคลิปบอร์ดแล้ว' : 'Copied news link to clipboard!');
                              } else {
                                triggerToast(lang === 'th' ? 'ไม่สามารถคัดลอกลิงก์ได้' : 'Failed to copy link', 'error');
                              }
                            });
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-mcu-pink-soft/25 hover:bg-mcu-pink-soft/50 text-mcu-pink-deep rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-mcu-pink-light/30 ml-auto"
                        >
                          <LinkIcon size={12} />
                          <span>{lang === 'th' ? 'คัดลอกลิงก์ข่าว' : 'Copy Link'}</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-mcu-pink-light flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="bg-mcu-pink text-white hover:bg-mcu-pink-dark px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Full-screen Lightbox Zoom Modal */}
      {lightboxIndex !== null && lightboxUrls.length > 0 && (
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-fade-in cursor-zoom-out"
        >
          {/* Top Bar with counter and Close */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-10 font-sans">
            <span className="text-xs sm:text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
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

          {/* Large image wrapper with navigation controls */}
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
              className="max-w-full max-h-[75vh] flex items-center justify-center select-none rounded-xl overflow-hidden shadow-2xl border-2 border-white/15 bg-slate-900/40"
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
    </div>
  );
}
