/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LucideIcon from '../LucideIcon';
import { StaffMember, PersonnelStatus, StaffAcademicWorkItem } from '../../types';
import { api } from '../../lib/api';

interface PersonnelPageProps {
  initialSlug?: string;
  navigateTo?: (page: string, subPage?: string, search?: string) => void;
}

const STATUS_BADGES: Record<PersonnelStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'ปฏิบัติงานอยู่', bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-800 dark:text-emerald-300' },
  on_leave: { label: 'ลาศึกษาต่อ / ดูงาน', bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-300' },
  transferred: { label: 'ย้ายสังกัด', bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-800 dark:text-blue-300' },
  retired: { label: 'เกษียณอายุ', bg: 'bg-gray-100 dark:bg-zinc-800', text: 'text-gray-700 dark:text-zinc-300' }
};

const WORK_CAT_TITLE: Record<StaffAcademicWorkItem['category'], { label: string; icon: string; color: string }> = {
  research: { label: 'งานวิจัย', icon: 'Search', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
  article: { label: 'บทความวิชาการ/วิจัย', icon: 'FileText', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' },
  book: { label: 'หนังสือ', icon: 'Book', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60' },
  textbook: { label: 'ตำรา', icon: 'BookOpen', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
  teaching_material: { label: 'เอกสารประกอบการสอน', icon: 'FolderDown', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' }
};

export default function PersonnelPage({ initialSlug, navigateTo }: PersonnelPageProps) {
  const [personnelList, setPersonnelList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug || null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Academic Work Subtab in Detail
  const [activeWorkCat, setActiveWorkCat] = useState<StaffAcademicWorkItem['category'] | 'all'>('all');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug]);

  useEffect(() => {
    if (selectedSlug && personnelList.length > 0) {
      const found = personnelList.find((p) => p.profileSlug === selectedSlug || p.id === selectedSlug);
      if (found) {
        setSelectedStaff(found);
      } else {
        // Fetch by slug directly if not in list
        api.getPersonnelBySlug(selectedSlug)
          .then((data) => setSelectedStaff(data))
          .catch(() => setSelectedStaff(null));
      }
    } else {
      setSelectedStaff(null);
    }
  }, [selectedSlug, personnelList]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getPersonnel();
      setPersonnelList(data || []);
    } catch (err) {
      console.error('Error fetching personnel list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = (staff: StaffMember) => {
    setSelectedSlug(staff.profileSlug);
    setSelectedStaff(staff);
    if (navigateTo) {
      navigateTo('personnel', staff.profileSlug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedSlug(null);
    setSelectedStaff(null);
    if (navigateTo) {
      navigateTo('personnel');
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/personnel/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Groups present in data
  const availableGroups = Array.from(new Set(personnelList.map((p) => p.workgroup).filter(Boolean)));

  // Filtered List
  const filteredList = personnelList.filter((p) => {
    const fullName = `${p.prefixTh} ${p.firstNameTh} ${p.lastNameTh} ${p.firstNameEn} ${p.lastNameEn} ${p.position} ${p.academicPosition}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || (p.expertise || []).some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGroup = selectedGroup === 'all' || p.workgroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* VIEW 1: INDIVIDUAL STAFF PROFILE DETAIL */}
        {/* ========================================================================= */}
        {selectedStaff ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 transition shadow-sm"
              >
                <LucideIcon name="ArrowLeft" className="w-4 h-4" />
                กลับสู่รายนามบุคลากรทั้งหมด
              </button>

              <button
                onClick={() => handleCopyLink(selectedStaff.profileSlug)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-sm font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition"
              >
                <LucideIcon name={copiedLink ? 'Check' : 'Share2'} className="w-4 h-4 text-amber-600" />
                {copiedLink ? 'คัดลอก URL แล้ว!' : 'แชร์โปรไฟล์นี้'}
              </button>
            </div>

            {/* Profile Main Banner Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                {/* Avatar */}
                <div className="relative group">
                  <img
                    src={selectedStaff.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={selectedStaff.firstNameTh}
                    className="w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-amber-500/30 shadow-xl"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                        STATUS_BADGES[selectedStaff.status]?.bg || 'bg-emerald-100'
                      } ${STATUS_BADGES[selectedStaff.status]?.text || 'text-emerald-800'}`}
                    >
                      {STATUS_BADGES[selectedStaff.status]?.label || 'ปฏิบัติงานอยู่'}
                    </span>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedStaff.prefixTh} {selectedStaff.firstNameTh} {selectedStaff.lastNameTh}
                    </h1>
                    {(selectedStaff.firstNameEn || selectedStaff.lastNameEn) && (
                      <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        {selectedStaff.prefixEn} {selectedStaff.firstNameEn} {selectedStaff.lastNameEn}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 text-sm font-bold border border-amber-200 dark:border-amber-800">
                      {selectedStaff.position}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                      วิชาการ: {selectedStaff.academicPosition}
                    </span>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 pt-1">
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <LucideIcon name="Building2" className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>{selectedStaff.workgroup} • {selectedStaff.department}</span>
                    </p>
                    {selectedStaff.phone && (
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <LucideIcon name="Phone" className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <a href={`tel:${selectedStaff.phone}`} className="hover:underline text-emerald-700 dark:text-emerald-400 font-medium">
                          {selectedStaff.phone}
                        </a>
                      </p>
                    )}
                    {selectedStaff.email && (
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <LucideIcon name="Mail" className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <a href={`mailto:${selectedStaff.email}`} className="hover:underline text-blue-700 dark:text-blue-400 font-medium">
                          {selectedStaff.email}
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Permalink Box */}
                  <div className="pt-2">
                    <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 inline-flex items-center gap-2">
                      <LucideIcon name="Link2" className="w-3.5 h-3.5 text-amber-500" />
                      URL โปรไฟล์: {window.location.origin}/personnel/{selectedStaff.profileSlug}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Education & Expertise */}
              <div className="space-y-8">
                {/* Education Credentials Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <LucideIcon name="GraduationCap" className="w-5 h-5 text-amber-600" />
                    ประวัติการศึกษา (Education)
                  </h3>

                  {(selectedStaff.educationHistory || []).length === 0 ? (
                    <p className="text-sm text-zinc-400 italic">ไม่มีข้อมูลประวัติการศึกษา</p>
                  ) : (
                    <div className="space-y-4 relative pl-4 border-l-2 border-amber-500/30">
                      {selectedStaff.educationHistory.map((edu, idx) => (
                        <div key={idx} className="relative group">
                          <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-900" />
                          <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {edu.degreeName}
                          </div>
                          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                            {edu.degreeLevel} {edu.major && `• ${edu.major}`}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {edu.institution} {edu.yearGraduated && `(พ.ศ. ${edu.yearGraduated})`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expertise Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <LucideIcon name="Award" className="w-5 h-5 text-amber-600" />
                    ความเชี่ยวชาญ (Expertise)
                  </h3>

                  {(selectedStaff.expertise || []).length === 0 ? (
                    <p className="text-sm text-zinc-400 italic">ไม่มีข้อมูลความเชี่ยวชาญ</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.expertise.map((exp, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 text-xs font-semibold border border-amber-200 dark:border-amber-800/80"
                        >
                          # {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Academic Publications (5 Categories) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <LucideIcon name="BookOpen" className="w-5 h-5 text-amber-600" />
                      ผลงานวิชาการ (Academic Works)
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                        {(selectedStaff.academicWorks || []).length}
                      </span>
                    </h3>
                  </div>

                  {/* Subtabs for Academic Work Categories */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => setActiveWorkCat('all')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                        activeWorkCat === 'all'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      ทั้งหมด ({(selectedStaff.academicWorks || []).length})
                    </button>
                    {(Object.keys(WORK_CAT_TITLE) as Array<StaffAcademicWorkItem['category']>).map((catKey) => {
                      const count = (selectedStaff.academicWorks || []).filter((w) => w.category === catKey).length;
                      return (
                        <button
                          key={catKey}
                          onClick={() => setActiveWorkCat(catKey)}
                          className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                            activeWorkCat === catKey
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                          }`}
                        >
                          <span>{WORK_CAT_TITLE[catKey].label}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* List of Works */}
                  {(() => {
                    const works = (selectedStaff.academicWorks || []).filter(
                      (w) => activeWorkCat === 'all' || w.category === activeWorkCat
                    );

                    if (works.length === 0) {
                      return (
                        <div className="p-8 text-center text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                          ยังไม่มีผลงานในหมวดหมู่นี้
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {works.map((work, idx) => {
                          const catInfo = WORK_CAT_TITLE[work.category] || WORK_CAT_TITLE.research;
                          return (
                            <div
                              key={work.id || idx}
                              className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition space-y-2 group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${catInfo.color}`}>
                                  {catInfo.label}
                                </span>
                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                  ปี พ.ศ. {work.year}
                                </span>
                              </div>

                              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                                {work.titleTh}
                              </h4>

                              {work.titleEn && (
                                <p className="text-xs text-zinc-500 italic">{work.titleEn}</p>
                              )}

                              {work.publisherOrSource && (
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                  <span className="font-semibold">ตีพิมพ์/แหล่งที่มา:</span> {work.publisherOrSource}
                                </p>
                              )}

                              {work.isbnOrDoi && (
                                <p className="text-xs text-zinc-500">
                                  <span className="font-semibold">อ้างอิง:</span> {work.isbnOrDoi}
                                </p>
                              )}

                              {work.description && (
                                <p className="text-xs text-zinc-600 dark:text-zinc-300 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                                  {work.description}
                                </p>
                              )}

                              {work.url && (
                                <div className="pt-2">
                                  <a
                                    href={work.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                  >
                                    <LucideIcon name="ExternalLink" className="w-3.5 h-3.5" />
                                    อ่าน/ดาวน์โหลดผลงาน
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: PERSONNEL DIRECTORY LIST / GRID */
          /* ========================================================================= */
          <div className="space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold tracking-wider mb-3 uppercase border border-amber-400/30">
                  ทำเนียบบุคลากร (Personnel Directory)
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  คณะผู้บริหาร อาจารย์ และเจ้าหน้าที่
                </h1>
                <p className="text-amber-100/90 text-sm sm:text-base mt-2">
                  วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                </p>
              </div>
            </div>

            {/* Filter & Toolbar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <LucideIcon name="Search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, ตำแหน่ง, หรือความเชี่ยวชาญ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Group Filter */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="all">ทุกกลุ่มงาน/ฝ่าย ({personnelList.length})</option>
                  {availableGroups.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp} ({personnelList.filter((p) => p.workgroup === grp).length})
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-zinc-900 text-amber-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="Grid View"
                  >
                    <LucideIcon name="LayoutGrid" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-zinc-900 text-amber-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="List View"
                  >
                    <LucideIcon name="List" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Personnel Content */}
            {loading ? (
              <div className="py-20 text-center">
                <LucideIcon name="Loader2" className="w-10 h-10 animate-spin mx-auto text-amber-600 mb-4" />
                <p className="text-zinc-500 font-medium">กำลังโหลดทำเนียบบุคลากร...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <LucideIcon name="UserX" className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">ไม่พบข้อมูลบุคลากร</h3>
                <p className="text-sm text-zinc-500 mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกกลุ่มงานอื่น</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectStaff(item)}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Avatar & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <img
                          src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                          alt={item.firstNameTh}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/20 group-hover:scale-105 transition-transform"
                        />
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            STATUS_BADGES[item.status]?.bg || 'bg-emerald-100'
                          } ${STATUS_BADGES[item.status]?.text || 'text-emerald-800'}`}
                        >
                          {STATUS_BADGES[item.status]?.label || 'ปฏิบัติงานอยู่'}
                        </span>
                      </div>

                      {/* Name & Title */}
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                          {item.prefixTh} {item.firstNameTh} {item.lastNameTh}
                        </h3>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1">
                          {item.position}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          วิชาการ: {item.academicPosition}
                        </p>
                      </div>

                      {/* Department */}
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex items-center gap-1.5">
                        <LucideIcon name="Building2" className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{item.workgroup}</span>
                      </div>

                      {/* Expertise Badges */}
                      {(item.expertise || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.expertise.slice(0, 3).map((exp, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px]"
                            >
                              {exp}
                            </span>
                          ))}
                          {item.expertise.length > 3 && (
                            <span className="text-[10px] text-zinc-400 py-0.5">
                              +{item.expertise.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <span>ดูประวัติและผลงาน</span>
                      <LucideIcon name="ChevronRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectStaff(item)}
                      className="p-5 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                          alt={item.firstNameTh}
                          className="w-14 h-14 rounded-2xl object-cover border border-amber-500/20 flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                            {item.prefixTh} {item.firstNameTh} {item.lastNameTh}
                          </h3>
                          <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                            {item.position} • <span className="text-zinc-500 font-normal">วิชาการ: {item.academicPosition}</span>
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {item.workgroup} • {item.department}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            STATUS_BADGES[item.status]?.bg || 'bg-emerald-100'
                          } ${STATUS_BADGES[item.status]?.text || 'text-emerald-800'}`}
                        >
                          {STATUS_BADGES[item.status]?.label || 'ปฏิบัติงานอยู่'}
                        </span>
                        <LucideIcon name="ChevronRight" className="w-5 h-5 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
