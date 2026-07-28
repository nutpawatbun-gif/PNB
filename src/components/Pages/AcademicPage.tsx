/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { academicStore } from '../../data/academicStore';
import { AcademicWork, AcademicCategory } from '../../types';
import { api } from '../../lib/api';
import LucideIcon from '../LucideIcon';

interface AcademicPageProps {
  lang: 'th' | 'en';
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export default function AcademicPage({ lang, selectedCategory, setSelectedCategory }: AcademicPageProps) {
  const [works, setWorks] = useState<AcademicWork[]>(() => academicStore.getWorks());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [viewingItem, setViewingItem] = useState<AcademicWork | null>(null);

  useEffect(() => {
    // 1. Fetch from server API
    const loadServerWorks = async () => {
      try {
        const res = await api.getAcademicWorks();
        if (Array.isArray(res) && res.length > 0) {
          const serverItems: AcademicWork[] = res.map((item: any) => ({
            id: item.id || 'ac_' + Math.random().toString(36).substring(2, 9),
            titleTh: item.titleTh || '',
            titleEn: item.titleEn || '',
            category: (item.category as AcademicCategory) || 'research',
            publicationYear: item.publicationYear || item.year || String(new Date().getFullYear() + 543),
            authors: item.authors || item.authorTh || '',
            projectLeader: item.projectLeader || '',
            coResearchers: item.coResearchers || item.coAuthors || '',
            publisherOrSource: item.publisherOrSource || item.journalName || item.publisher || item.fundingSource || '',
            doi: item.doi || (item.doiOrUrl && item.doiOrUrl.includes('doi') ? item.doiOrUrl : ''),
            url: item.url || (item.doiOrUrl && !item.doiOrUrl.includes('doi') ? item.doiOrUrl : ''),
            abstract: item.abstract || '',
            keywords: item.keywords || '',
            fileUrl: item.fileUrl || item.attachmentUrl || '',
            coverImageUrl: item.coverImageUrl || item.imageUrl || '',
            status: item.status || (item.isPublished !== false ? 'published' : 'draft'),
            isPublished: item.status === 'published' || item.isPublished !== false,
            year: item.publicationYear || item.year || String(new Date().getFullYear() + 543),
            authorTh: item.authors || item.authorTh || '',
            createdAt: item.createdAt || new Date().toISOString()
          }));

          // Merge with local works
          const local = academicStore.getWorks();
          const mergedMap = new Map<string, AcademicWork>();
          local.forEach(w => mergedMap.set(w.id, w));
          serverItems.forEach(w => mergedMap.set(w.id, w));
          setWorks(Array.from(mergedMap.values()));
        }
      } catch (err) {
        console.error('Error loading academic works from server:', err);
      }
    };

    loadServerWorks();

    // Subscribe to store updates
    return academicStore.subscribe(() => {
      setWorks(academicStore.getWorks());
    });
  }, []);

  // Sync state if someone clicked outside
  useEffect(() => {
    if (viewingItem) {
      const current = works.find(w => w.id === viewingItem.id);
      if (current) {
        setViewingItem(current);
      } else {
        setViewingItem(null);
      }
    }
  }, [works, viewingItem]);

  // Translate category codes to human-readable text
  const getCategoryLabel = (cat: AcademicCategory) => {
    switch (cat) {
      case 'research':
        return lang === 'th' ? 'งานวิจัย' : 'Research Project';
      case 'research_article':
        return lang === 'th' ? 'บทความวิจัย' : 'Research Article';
      case 'academic_article':
        return lang === 'th' ? 'บทความวิชาการ' : 'Academic Article';
      case 'book':
        return lang === 'th' ? 'หนังสือ' : 'Book';
      case 'textbook':
        return lang === 'th' ? 'ตำรา' : 'Textbook';
      case 'teaching_material':
        return lang === 'th' ? 'เอกสารประกอบการสอน' : 'Teaching Material';
      case 'lecture_notes':
        return lang === 'th' ? 'เอกสารคำสอน' : 'Lecture Notes';
      case 'research_report':
        return lang === 'th' ? 'รายงานวิจัย' : 'Research Report';
      case 'innovation':
        return lang === 'th' ? 'ผลงานนวัตกรรม' : 'Innovation Work';
      case 'academic_service':
        return lang === 'th' ? 'ผลงานบริการวิชาการ' : 'Academic Service';
      case 'culture_preservation':
        return lang === 'th' ? 'ผลงานทำนุบำรุงศิลปวัฒนธรรม' : 'Arts & Culture Preservation';
      default:
        return cat;
    }
  };

  // Get color-coded tags for categories
  const getCategoryColor = (cat: AcademicCategory) => {
    switch (cat) {
      case 'research':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'research_article':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'academic_article':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'book':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'textbook':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'teaching_material':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'lecture_notes':
        return 'bg-orange-50 text-orange-700 border-orange-200/60';
      case 'research_report':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/60';
      case 'innovation':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200/60';
      case 'academic_service':
        return 'bg-rose-50 text-rose-800 border-rose-200/60';
      case 'culture_preservation':
        return 'bg-pink-50 text-pink-700 border-pink-200/60';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200/60';
    }
  };

  // Helper for item year
  const getItemYear = (w: AcademicWork) => w.publicationYear || w.year || '2568';

  // Extract unique years
  const availableYears = Array.from(
    new Set(works.filter(w => w.status === 'published' || w.isPublished !== false).map(getItemYear))
  ).map(String).sort((a, b) => b.localeCompare(a));

  // Filter items
  const filteredWorks = works
    .filter(w => w.status === 'published' || w.isPublished !== false) // published only for public view
    .filter((w) => {
      const itemYear = getItemYear(w);
      const authors = w.authors || w.authorTh || '';
      const coAuthors = w.coResearchers || w.coAuthors || '';

      // 1. Filter by category
      if (selectedCategory !== 'all' && w.category !== selectedCategory) {
        return false;
      }
      // 2. Filter by publication year
      if (selectedYear !== 'all' && itemYear !== selectedYear) {
        return false;
      }
      // 3. Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = w.titleTh?.toLowerCase().includes(query) || (w.titleEn && w.titleEn.toLowerCase().includes(query));
        const authorMatch = authors.toLowerCase().includes(query) || coAuthors.toLowerCase().includes(query);
        const abstractMatch = w.abstract && w.abstract.toLowerCase().includes(query);
        const keywordsMatch = w.keywords && w.keywords.toLowerCase().includes(query);
        const yearMatch = itemYear.toLowerCase().includes(query);
        const categoryMatch = getCategoryLabel(w.category).toLowerCase().includes(query);

        return titleMatch || authorMatch || abstractMatch || keywordsMatch || yearMatch || categoryMatch;
      }
      return true;
    })
    .sort((a, b) => {
      const yearA = getItemYear(a);
      const yearB = getItemYear(b);
      if (yearB !== yearA) {
        return yearB.localeCompare(yearA);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const categoriesList: { key: string; labelTh: string; labelEn: string; icon: string }[] = [
    { key: 'all', labelTh: 'ทั้งหมด', labelEn: 'All Works', icon: 'Library' },
    { key: 'research', labelTh: 'งานวิจัย', labelEn: 'Research', icon: 'GraduationCap' },
    { key: 'research_article', labelTh: 'บทความวิจัย', labelEn: 'Research Articles', icon: 'FileCheck' },
    { key: 'academic_article', labelTh: 'บทความวิชาการ', labelEn: 'Academic Articles', icon: 'FileText' },
    { key: 'book', labelTh: 'หนังสือ', labelEn: 'Books', icon: 'BookOpen' },
    { key: 'textbook', labelTh: 'ตำรา', labelEn: 'Textbooks', icon: 'Book' },
    { key: 'teaching_material', labelTh: 'เอกสารประกอบการสอน', labelEn: 'Teaching Materials', icon: 'Files' },
    { key: 'lecture_notes', labelTh: 'เอกสารคำสอน', labelEn: 'Lecture Notes', icon: 'NotebookPen' },
    { key: 'research_report', labelTh: 'รายงานวิจัย', labelEn: 'Research Reports', icon: 'ClipboardList' },
    { key: 'innovation', labelTh: 'ผลงานนวัตกรรม', labelEn: 'Innovation Works', icon: 'Lightbulb' },
    { key: 'academic_service', labelTh: 'ผลงานบริการวิชาการ', labelEn: 'Academic Services', icon: 'Users' },
    { key: 'culture_preservation', labelTh: 'ผลงานทำนุบำรุงศิลปวัฒนธรรม', labelEn: 'Culture Preservation', icon: 'Flower2' }
  ];

  const t = {
    title: lang === 'th' ? 'ผลงานวิชาการของบุคลากรสายวิชาการ' : 'Academic Works & Research Publications',
    titleSub: lang === 'th' ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์' : 'Phokhun Phamuang Buddhist College, Phetchabun',
    desc: lang === 'th' 
      ? 'รวบรวมและเผยแพร่ผลงานวิจัย บทความวิจัย บทความวิชาการ หนังสือ ตำรา และเอกสารประกอบการสอนของบุคลากรสายวิชาการ เพื่อส่งเสริมการศึกษา การวิจัย และการพัฒนาองค์ความรู้เพื่อประโยชน์ต่อสังคมและพระพุทธศาสนา'
      : 'Gathering and disseminating research projects, research articles, academic papers, books, textbooks, and instructional materials authored by our esteemed academic staff to support education, research, and wisdom development for society and Buddhism.',
    searchPlaceholder: lang === 'th' ? 'ค้นหาจากชื่อผลงาน, ชื่อผู้แต่ง, คำสำคัญ, ปี...' : 'Search by title, author, keyword, year...',
    allYears: lang === 'th' ? 'ทุกปีเผยแพร่ / ปีงบประมาณ' : 'All Years / Budget Years',
    yearLabel: lang === 'th' ? 'ปีงบประมาณ / ปีพิมพ์' : 'Year',
    noResults: lang === 'th' ? 'ไม่พบข้อมูลผลงานวิชาการที่ค้นหา' : 'No academic works found matching your search.',
    ownerLabel: lang === 'th' ? 'ผู้ดำเนินงาน / ผู้เขียนหลัก' : 'Author / Main Author',
    publishedYear: lang === 'th' ? 'ปีที่เผยแพร่ / ปีงบประมาณ' : 'Year Published',
    viewDetails: lang === 'th' ? 'ดูรายละเอียด' : 'View Details',
    downloadPdf: lang === 'th' ? 'ดาวน์โหลดไฟล์' : 'Download PDF',
    backToList: lang === 'th' ? 'ย้อนกลับไปหน้ารวมผลงาน' : 'Back to Publications list',
    publishedIn: lang === 'th' ? 'การเผยแพร่' : 'Publication & Venue',
    academicInfo: lang === 'th' ? 'ข้อมูลวิชาการเพิ่มเติม' : 'Academic Information',
    coAuthors: lang === 'th' ? 'ผู้แต่งร่วม / ผู้ร่วมวิจัย' : 'Co-Authors / Co-Researchers',
    fundingSource: lang === 'th' ? 'แหล่งทุนวิจัย' : 'Research Funding',
    abstract: lang === 'th' ? 'บทคัดย่อ / สาระสำคัญ' : 'Abstract / Executive Summary',
    keywords: lang === 'th' ? 'คำสำคัญ' : 'Keywords',
    doiOrUrl: lang === 'th' ? 'ลิงก์สืบค้นภายนอก / DOI' : 'External Link / DOI',
    isbn: lang === 'th' ? 'เลขมาตรฐานสากลประจำหนังสือ (ISBN)' : 'ISBN Number',
    edition: lang === 'th' ? 'ครั้งที่พิมพ์' : 'Edition',
    publisher: lang === 'th' ? 'สำนักพิมพ์' : 'Publisher',
    courseDetails: lang === 'th' ? 'ข้อมูลหลักสูตรและรายวิชา' : 'Course & Curriculum Details',
    courseName: lang === 'th' ? 'ชื่อรายวิชา' : 'Course Name',
    courseCode: lang === 'th' ? 'รหัสวิชา' : 'Course Code',
    curriculum: lang === 'th' ? 'หลักสูตร' : 'Curriculum',
    semesterAndYear: lang === 'th' ? 'ภาคการศึกษาและปีการศึกษา' : 'Semester & Academic Year'
  };

  return (
    <div className="bg-white min-h-screen py-10 animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Detail Modal/View Overriding List */}
        {viewingItem ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Back to list button */}
            <button
              onClick={() => setViewingItem(null)}
              className="flex items-center space-x-2 text-mcu-pink hover:text-mcu-pink-dark transition-colors text-xs sm:text-sm font-bold cursor-pointer group"
            >
              <LucideIcon name="ArrowLeft" size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t.backToList}</span>
            </button>

            {/* Main Details Card Layout */}
            <div className="bg-white rounded-2xl border border-mcu-pink-light/30 shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8 md:p-10 space-y-8">
                
                {/* Header Information Row */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  
                  {/* Book / Report Cover Image */}
                  <div className="w-full md:w-52 h-72 rounded-xl bg-slate-50 border border-border-mcu flex-shrink-0 relative overflow-hidden shadow-mcu-card group">
                    <img
                      src={viewingItem.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'}
                      alt={viewingItem.titleTh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full border shadow-sm ${getCategoryColor(viewingItem.category)}`}>
                        {getCategoryLabel(viewingItem.category)}
                      </span>
                    </div>
                  </div>

                  {/* High level info */}
                  <div className="flex-grow space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-lg sm:text-2xl font-bold text-mcu-pink-deep leading-tight">
                        {viewingItem.titleTh}
                      </h2>
                      {viewingItem.titleEn && (
                        <h3 className="text-sm sm:text-lg font-medium text-muted-text-mcu italic leading-snug">
                          {viewingItem.titleEn}
                        </h3>
                      )}
                    </div>

                    {/* Meta values list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm">
                      <div className="space-y-0.5">
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">{t.ownerLabel}</span>
                        <span className="font-bold text-mcu-pink-deep">{viewingItem.authorTh}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">{t.publishedYear}</span>
                        <span className="font-sans font-bold text-mcu-gold-dark">{viewingItem.year}</span>
                      </div>
                      {viewingItem.coAuthors && (
                        <div className="space-y-0.5 sm:col-span-2 border-t border-slate-100 pt-2 mt-1">
                          <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">{t.coAuthors}</span>
                          <span className="text-gray-700 text-xs sm:text-sm font-medium">{viewingItem.coAuthors}</span>
                        </div>
                      )}
                    </div>

                    {/* PDF Actions & DOI links */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {viewingItem.attachmentUrl && (
                        <a
                          href={viewingItem.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-mcu-pink hover:bg-mcu-pink-dark text-white rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 shadow-md cursor-pointer border border-mcu-pink hover:scale-[1.01]"
                        >
                          <LucideIcon name="Download" size={16} />
                          <span>{t.downloadPdf}</span>
                        </a>
                      )}
                      {viewingItem.doiOrUrl && (
                        <a
                          href={viewingItem.doiOrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-mcu-pink-deep rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 shadow-sm border border-mcu-pink-light/60 cursor-pointer"
                        >
                          <LucideIcon name="ExternalLink" size={16} className="text-mcu-gold" />
                          <span>{t.doiOrUrl}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specific details according to categorization */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  
                  {/* Journal Articles Metadata */}
                  {(viewingItem.category === 'research_article' || viewingItem.category === 'academic_article') && (viewingItem.journalName || viewingItem.databaseIndex) && (
                    <div className="bg-mcu-pink-soft/10 border border-mcu-pink-light/20 rounded-xl p-4 sm:p-5 space-y-3">
                      <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep border-b border-mcu-pink-light/30 pb-1.5 flex items-center">
                        <LucideIcon name="Bookmark" size={16} className="mr-1.5 text-mcu-gold" />
                        <span>{t.publishedIn}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        {viewingItem.journalName && (
                          <div>
                            <span className="text-gray-400 block font-semibold text-[11px]">ชื่อวารสาร / แหล่งที่มา</span>
                            <span className="font-bold text-gray-700">{viewingItem.journalName}</span>
                          </div>
                        )}
                        {viewingItem.journalDetails && (
                          <div>
                            <span className="text-gray-400 block font-semibold text-[11px]">ปีที่ ฉบับที่ เลขหน้า</span>
                            <span className="text-gray-700 font-medium">{viewingItem.journalDetails}</span>
                          </div>
                        )}
                        {viewingItem.category === 'research_article' && viewingItem.databaseIndex && (
                          <div className="sm:col-span-2">
                            <span className="text-gray-400 block font-semibold text-[11px]">ฐานข้อมูลวารสารที่รองรับ</span>
                            <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-sans text-xs border border-emerald-200">
                              {viewingItem.databaseIndex}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Research Funding Sources Metadata */}
                  {viewingItem.category === 'research' && viewingItem.fundingSource && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 sm:p-5 space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-amber-800 flex items-center">
                        <LucideIcon name="DollarSign" size={16} className="mr-1 text-amber-600" />
                        <span>{t.fundingSource}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 font-semibold">{viewingItem.fundingSource}</p>
                    </div>
                  )}

                  {/* Books Metadata */}
                  {viewingItem.category === 'book' && (viewingItem.publisher || viewingItem.isbn) && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 sm:p-5 space-y-3">
                      <h4 className="text-xs sm:text-sm font-bold text-purple-800 flex items-center border-b border-purple-500/10 pb-1.5">
                        <LucideIcon name="BookOpen" size={16} className="mr-1.5 text-purple-600" />
                        <span>{t.academicInfo}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                        {viewingItem.publisher && (
                          <div>
                            <span className="text-gray-400 block font-semibold text-[11px]">{t.publisher}</span>
                            <span className="font-bold text-gray-700">{viewingItem.publisher}</span>
                          </div>
                        )}
                        {viewingItem.edition && (
                          <div>
                            <span className="text-gray-400 block font-semibold text-[11px]">{t.edition}</span>
                            <span className="text-gray-700 font-semibold">{viewingItem.edition}</span>
                          </div>
                        )}
                        {viewingItem.isbn && (
                          <div>
                            <span className="text-gray-400 block font-semibold text-[11px]">{t.isbn}</span>
                            <span className="text-gray-700 font-mono text-xs">{viewingItem.isbn}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Textbook and Materials Metadata */}
                  {(viewingItem.category === 'textbook' || viewingItem.category === 'teaching_material') && (viewingItem.courseName || viewingItem.curriculum) && (
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 sm:p-5 space-y-3">
                      <h4 className="text-xs sm:text-sm font-bold text-rose-800 flex items-center border-b border-rose-500/10 pb-1.5">
                        <LucideIcon name="BookOpen" size={16} className="mr-1.5 text-rose-600" />
                        <span>{t.courseDetails}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        {viewingItem.courseName && (
                          <div>
                            <span className="text-gray-400 block font-semibold text-[11px]">{t.courseName}</span>
                            <span className="font-bold text-gray-700">
                              {viewingItem.courseCode ? `[${viewingItem.courseCode}] ` : ''}
                              {viewingItem.courseName}
                            </span>
                          </div>
                        )}
                        {viewingItem.curriculum && (
                          <div>
                            <span className="text-gray-400 block font-semibold text-[11px]">{t.curriculum}</span>
                            <span className="text-gray-700 font-medium">{viewingItem.curriculum}</span>
                          </div>
                        )}
                        {viewingItem.category === 'teaching_material' && viewingItem.semesterAndYear && (
                          <div className="sm:col-span-2 border-t border-rose-500/10 pt-2 mt-1">
                            <span className="text-gray-400 block font-semibold text-[11px]">{t.semesterAndYear}</span>
                            <span className="text-gray-700 font-bold">{viewingItem.semesterAndYear}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Abstract Section */}
                  {viewingItem.abstract && (
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-bold text-mcu-pink-deep flex items-center">
                        <LucideIcon name="AlignLeft" size={16} className="mr-1.5 text-mcu-gold" />
                        <span>{t.abstract}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light text-justify bg-slate-50 p-5 rounded-xl border border-slate-100 whitespace-pre-line">
                        {viewingItem.abstract}
                      </p>
                    </div>
                  )}

                  {/* Keywords section */}
                  {viewingItem.keywords && (
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 block uppercase tracking-wider">{t.keywords}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewingItem.keywords.split(',').map((word, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded border border-slate-200/50">
                            #{word.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* Normal List / landing view */
          <div className="space-y-10">
            {/* 2. Banner Header */}
            <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white rounded-2xl p-8 sm:p-12 text-center border-b-4 border-mcu-gold relative overflow-hidden shadow-lg animate-fade-in">
              <div className="absolute inset-0 bg-black/15 z-0"></div>
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-mcu-gold uppercase block bg-mcu-pink-dark/50 px-3 py-1 rounded-full w-max mx-auto border border-mcu-gold/20 mb-2">
                  Academic Directory
                </span>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold font-sans text-mcu-gold-light leading-tight">{t.title}</h1>
                <p className="text-sm sm:text-lg font-medium text-white/95 max-w-2xl mx-auto">{t.titleSub}</p>
                <p className="text-xs sm:text-sm text-mcu-pink-soft/90 font-light max-w-2xl mx-auto mt-2 leading-relaxed">{t.desc}</p>
              </div>
            </div>

            {/* 2. Sub Category Cards/Buttons Selection (6 items) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      setSearchQuery('');
                      setSelectedYear('all');
                    }}
                    className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer select-none group ${
                      isActive
                        ? 'bg-mcu-pink border-mcu-pink text-white shadow-mcu-header scale-[1.03]'
                        : 'bg-white border-mcu-pink-light/50 text-text-mcu hover:border-mcu-pink hover:bg-mcu-pink-soft/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      isActive ? 'bg-mcu-pink-dark text-mcu-gold' : 'bg-mcu-pink-soft text-mcu-pink group-hover:bg-mcu-pink group-hover:text-white'
                    }`}>
                      <LucideIcon name={cat.icon} size={18} />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold leading-tight block w-full truncate">
                      {lang === 'th' ? cat.labelTh : cat.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 10. Search and Filter Component */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search text box */}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-mcu-pink transition-colors"
                  />
                  <LucideIcon name="Search" size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-mcu-pink cursor-pointer"
                    >
                      <LucideIcon name="X" size={14} />
                    </button>
                  )}
                </div>

                {/* Academic publication year dropdown */}
                <div className="w-full sm:w-64">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-600 focus:outline-none focus:border-mcu-pink transition-colors font-sans cursor-pointer font-bold"
                  >
                    <option value="all">{t.allYears}</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {lang === 'th' ? `ปี ${yr}` : `Year ${yr}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtering metadata row status */}
              {(selectedCategory !== 'all' || selectedYear !== 'all' || searchQuery) && (
                <div className="mt-3.5 pt-3 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-1.5 items-center text-gray-400 font-medium">
                    <span>ตักกรองแล้ว:</span>
                    {selectedCategory !== 'all' && (
                      <span className="bg-mcu-pink-soft text-mcu-pink-deep px-2.5 py-0.5 rounded font-bold">
                        {getCategoryLabel(selectedCategory as AcademicCategory)}
                      </span>
                    )}
                    {selectedYear !== 'all' && (
                      <span className="bg-mcu-gold-soft text-mcu-pink-deep px-2.5 py-0.5 rounded font-bold">
                        ปี {selectedYear}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-bold italic">
                        "{searchQuery}"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedYear('all');
                      setSearchQuery('');
                    }}
                    className="text-mcu-pink hover:text-mcu-pink-dark font-bold cursor-pointer underline underline-offset-2 flex items-center space-x-1"
                  >
                    <LucideIcon name="RefreshCw" size={11} />
                    <span>ล้างค่าตัวกรอง</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Publication list (Card Grid) */}
            {filteredWorks.length === 0 ? (
              <div className="text-center py-14 bg-slate-50 border border-slate-100/50 rounded-2xl max-w-lg mx-auto p-8 space-y-3">
                <div className="p-4 bg-slate-100 text-slate-400 rounded-full w-max mx-auto">
                  <LucideIcon name="Library" size={32} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-600">{t.noResults}</h3>
                <p className="text-xs text-gray-400 font-light">สามารถเพิ่มผลงานใหม่ หรือลองค้นหาด้วยคำสำคัญอื่นๆ ผ่านปุ่มตักกรองด้านบน</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {filteredWorks.map((work) => (
                  <div
                    key={work.id}
                    className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col justify-between shadow-mcu-card hover:shadow-md hover:border-mcu-pink/40 transition-all duration-300"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Document Cover Thumbnail */}
                      <div className="w-20 h-28 sm:w-24 sm:h-34 rounded-lg bg-slate-100 border border-slate-200/50 flex-shrink-0 relative overflow-hidden shadow-sm">
                        <img
                          src={work.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'}
                          alt={work.titleTh}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Summary Data */}
                      <div className="min-w-0 flex-grow space-y-1.5">
                        {/* Categorization Badge */}
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide rounded-full border ${getCategoryColor(work.category)}`}>
                          {getCategoryLabel(work.category)}
                        </span>

                        <h3 className="text-xs sm:text-sm font-bold text-mcu-pink-deep leading-snug line-clamp-2 hover:text-mcu-pink transition-colors cursor-pointer" onClick={() => setViewingItem(work)}>
                          {work.titleTh}
                        </h3>

                        {/* Author */}
                        <div className="flex items-center space-x-1 text-[11px] text-gray-400">
                          <LucideIcon name="User" size={11} className="text-mcu-gold flex-shrink-0" />
                          <span className="truncate font-semibold text-gray-500">{work.authorTh}</span>
                        </div>

                        {/* Year */}
                        <div className="flex items-center space-x-1 text-[11px] text-gray-400">
                          <LucideIcon name="Calendar" size={11} className="text-mcu-pink flex-shrink-0" />
                          <span>{t.yearLabel}: <strong className="font-sans font-bold text-mcu-pink-deep">{work.year}</strong></span>
                        </div>

                        {/* Excerpt */}
                        {work.abstract && (
                          <p className="text-[11px] text-gray-400 leading-normal line-clamp-2 font-light">
                            {work.abstract}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Buttons Grid */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setViewingItem(work)}
                        className="px-4 py-1.5 border border-mcu-pink-light/80 text-mcu-pink-deep hover:bg-mcu-pink-soft/20 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <LucideIcon name="Eye" size={12} />
                        <span>{t.viewDetails}</span>
                      </button>

                      {work.attachmentUrl && (
                        <a
                          href={work.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 bg-mcu-pink hover:bg-mcu-pink-dark text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-mcu-pink"
                        >
                          <LucideIcon name="Download" size={11} />
                          <span>{t.downloadPdf}</span>
                        </a>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
