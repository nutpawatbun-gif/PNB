/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { coursesStore } from '../../data/coursesStore';
import { Course } from '../../types';
import { api } from '../../lib/api';
import LucideIcon from '../LucideIcon';
import { Modal } from '../ui/Modal';

interface CoursesPageProps {
  lang: 'th' | 'en';
  selectedLevel?: string;
  onApplyCourse: (courseId?: string) => void;
}

export default function CoursesPage({ lang, selectedLevel = 'bachelor', onApplyCourse }: CoursesPageProps) {
  const initialLevel = ['bachelor', 'master', 'doctor', 'certificate'].includes(selectedLevel)
    ? (selectedLevel as 'bachelor' | 'master' | 'doctor' | 'certificate')
    : 'bachelor';

  const [activeTab, setActiveTab] = useState<'bachelor' | 'master' | 'doctor' | 'certificate'>(initialLevel);

  useEffect(() => {
    if (['bachelor', 'master', 'doctor', 'certificate'].includes(selectedLevel)) {
      setActiveTab(selectedLevel as any);
    }
  }, [selectedLevel]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>(() => coursesStore.getCourses());

  useEffect(() => {
    // Fetch courses dynamically from Backend API CMS
    api.getCourses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch((err) => console.warn('Failed to load courses from API:', err));

    const unsubscribe = coursesStore.subscribe(() => {
      const updated = coursesStore.getCourses();
      if (Array.isArray(updated) && updated.length > 0) {
        setCourses(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredCourses = courses.filter((c) => (c.degreeLevel || c.level) === activeTab);

  const t = {
    title: lang === 'th' ? 'ข้อมูลหลักสูตรที่เปิดสอนทั้งหมด' : 'Academic Programs Catalog',
    sub: lang === 'th' ? 'ข้อมูลหลักสูตรการศึกษา โครงสร้างหน่วยกิต และเกณฑ์การสมัครเรียนทุกระดับปริญญา' : 'Explore curriculum credits, qualification rules, and details for each program tier.',
    bachelor: lang === 'th' ? 'ปริญญาตรี (Undergraduate)' : 'Bachelor Degrees',
    master: lang === 'th' ? 'ปริญญาโท (Master Degrees)' : 'Master Degrees',
    doctor: lang === 'th' ? 'ปริญญาเอก (Doctoral)' : 'Doctoral Degrees',
    cert: lang === 'th' ? 'หลักสูตรระยะสั้น / ประกาศนียบัตร' : 'Certificate Programs',
    code: lang === 'th' ? 'รหัสหลักสูตร' : 'Program Code',
    duration: lang === 'th' ? 'ระยะเวลาศึกษา' : 'Study Duration',
    mode: lang === 'th' ? 'รูปแบบการเรียนการสอน' : 'Instruction Mode',
    qualification: lang === 'th' ? 'เกณฑ์และคุณสมบัติผู้สมัครเรียน' : 'Admission Qualifications',
    costs: lang === 'th' ? 'ค่าธรรมเนียมการศึกษา' : 'Estimated Tuition Fees',
    career: lang === 'th' ? 'แนวทางสายอาชีพและโอกาสทำงาน' : 'Career Opportunities',
    viewDetails: lang === 'th' ? 'ศึกษารายละเอียดหลักสูตร' : 'View Course Details',
    applyNow: lang === 'th' ? 'สมัครเรียนออนไลน์' : 'Apply Online',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    degree: lang === 'th' ? 'วุฒิการศึกษา' : 'Degree Title',
    credits: lang === 'th' ? 'จำนวนหน่วยกิตรวม' : 'Total Credits',
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bachelor':
        return 'GraduationCap';
      case 'master':
        return 'Award';
      case 'doctor':
        return 'ShieldCheck';
      default:
        return 'BookOpen';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white rounded-3xl p-8 sm:p-12 text-center border-b-4 border-mcu-gold relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-black/15 z-0"></div>
          <div className="relative z-10 space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-mcu-gold-light">{t.title}</h1>
            <p className="text-xs sm:text-base text-mcu-pink-soft/90 font-light max-w-2xl mx-auto">{t.sub}</p>
          </div>
        </div>

        {/* Level Tabs selector */}
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mb-10 border-b border-mcu-pink-light/60 pb-4 max-w-3xl mx-auto">
          {[
            { key: 'bachelor', label: t.bachelor },
            { key: 'master', label: t.master },
            { key: 'doctor', label: t.doctor },
            { key: 'certificate', label: t.cert },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-mcu-gold text-mcu-pink bg-mcu-pink-soft/10 rounded-t-lg'
                  : 'border-transparent text-muted-text-mcu hover:text-mcu-pink hover:bg-mcu-pink-soft/40'
              }`}
            >
              <LucideIcon name={getLevelIcon(tab.key)} size={14} className={activeTab === tab.key ? 'text-mcu-gold' : 'text-muted-text-mcu'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Clean Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const courseName = lang === 'th' ? course.nameTh || course.name : course.nameEn || course.name;
            const degreeTitle = lang === 'th' ? course.degree : course.degreeEn || course.degree;
            const feeText = course.tuitionFee || course.estimatedFee || 'ฟรีค่าธรรมเนียมการศึกษา';
            const isClosed = course.status === 'inactive' || (course as any).isActive === false;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-mcu-pink transition-all duration-300 flex flex-col justify-between"
              >
                {/* Header card info */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-tr from-mcu-pink-soft/20 to-white dark:to-slate-900 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-mcu-pink text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs">
                      {course.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isClosed ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-md border border-rose-200">
                          🔴 ปิดรับสมัครออนไลน์
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          ✅ เปิดรับสมัครออนไลน์
                        </span>
                      )}
                      <div className="hidden sm:flex items-center text-xs text-mcu-gold font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-200/50">
                        <LucideIcon name="Clock" size={12} className="mr-1" />
                        <span>{course.duration || '4 ปี (8 ภาคการศึกษา)'}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-mcu-pink-deep dark:text-mcu-gold-light line-clamp-2 min-h-[48px] leading-snug">
                    {courseName}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light line-clamp-1">
                    <strong className="font-semibold text-slate-700 dark:text-slate-300">{t.degree}:</strong> {degreeTitle}
                  </p>
                </div>

                {/* Course Quick Summary Info */}
                <div className="p-6 space-y-2.5 flex-grow text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-400">{t.mode}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{course.studyMode || 'ภาคปกติ / ภาคพิเศษ'}</span>
                  </div>

                  {course.totalCredits && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-400">{t.credits}:</span>
                      <span className="font-extrabold text-mcu-pink">{course.totalCredits} หน่วยกิต</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-400">{t.costs}:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{feeText}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className="w-full text-center px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <LucideIcon name="BookOpen" size={14} />
                    <span>{t.viewDetails}</span>
                  </button>

                  {isClosed ? (
                    <button
                      type="button"
                      disabled
                      className="w-full text-center px-3 py-2.5 bg-rose-100 text-rose-800 border border-rose-200 font-extrabold rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <LucideIcon name="Lock" size={14} />
                      <span>🔒 ปิดรับสมัครออนไลน์</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApplyCourse && onApplyCourse(course.id)}
                      className="w-full text-center px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <LucideIcon name="Send" size={14} />
                      <span>เปิดรับสมัครออนไลน์ 🚀</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC BACKEND COURSE DETAILS POPUP MODAL */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={`รายละเอียดหลักสูตร: ${selectedCourse.code}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {t.close}
              </button>
              {selectedCourse.status === 'inactive' || (selectedCourse as any).isActive === false ? (
                <button
                  type="button"
                  disabled
                  className="px-6 py-2.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  <LucideIcon name="Lock" size={16} />
                  <span>🔒 ปิดรับสมัครออนไลน์</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedCourse?.id;
                    setSelectedCourse(null);
                    if (onApplyCourse) onApplyCourse(id);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <LucideIcon name="Send" size={16} />
                  <span>เปิดรับสมัครออนไลน์ (ยื่นสมัครเรียน 🚀)</span>
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-6 py-2 text-xs sm:text-sm">
            {/* Header info card */}
            <div className="p-5 bg-gradient-to-br from-mcu-pink-soft/40 via-white to-amber-50/30 rounded-2xl border border-mcu-pink-light/60 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-mcu-pink text-white text-xs font-extrabold px-3 py-1 rounded-full">
                  รหัสหลักสูตร: {selectedCourse.code}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  {selectedCourse.duration || '4 ปี (8 ภาคการศึกษา)'}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-mcu-pink-deep leading-snug">
                {lang === 'th' ? selectedCourse.nameTh || selectedCourse.name : selectedCourse.nameEn || selectedCourse.name}
              </h3>

              {selectedCourse.nameEn && (
                <p className="text-xs text-slate-400 italic">
                  {selectedCourse.nameEn}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-mcu-pink-light/50 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.degree}</span>
                  <strong className="text-mcu-pink font-extrabold">
                    {lang === 'th' ? selectedCourse.degree : selectedCourse.degreeEn || selectedCourse.degree}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.credits}</span>
                  <strong className="text-slate-800 font-extrabold">
                    {selectedCourse.totalCredits ? `${selectedCourse.totalCredits} หน่วยกิต` : 'ตามโครงสร้างหลักสูตร มจร'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Description if present */}
            {selectedCourse.description && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <LucideIcon name="Info" size={15} className="text-mcu-pink" />
                  <span>รายละเอียดและวัตถุประสงค์หลักสูตร</span>
                </h5>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>
            )}

            {/* Qualifications list */}
            {((selectedCourse.qualifications && selectedCourse.qualifications.length > 0) ||
              (selectedCourse.qualification && selectedCourse.qualification.length > 0)) && (
              <div className="space-y-2.5">
                <h5 className="text-sm font-bold text-mcu-pink-deep flex items-center gap-1.5">
                  <LucideIcon name="CheckCircle" size={16} className="text-emerald-600" />
                  <span>{t.qualification}</span>
                </h5>
                <div className="space-y-2 pl-1">
                  {(selectedCourse.qualifications || selectedCourse.qualification || []).map((qual, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium">
                      <LucideIcon name="Check" size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{qual}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Structure breakdown if provided */}
            {Array.isArray(selectedCourse.structure) && selectedCourse.structure.length > 0 && (
              <div className="space-y-2.5">
                <h5 className="text-sm font-bold text-mcu-pink-deep flex items-center gap-1.5">
                  <LucideIcon name="BookOpen" size={16} className="text-amber-600" />
                  <span>โครงสร้างหมวดวิชาหลักสูตร</span>
                </h5>
                <div className="space-y-2">
                  {selectedCourse.structure.map((cat, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{cat.categoryName}</span>
                        <span className="font-extrabold text-amber-700 text-xs">{(cat as any).requiredCredits || cat.creditAmount} หน่วยกิต</span>
                      </div>
                      {cat.description && <p className="text-[11px] text-slate-500">{cat.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode & Tuition Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <LucideIcon name="Clock" size={13} className="text-amber-600" />
                  <span>{t.mode}</span>
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {selectedCourse.studyMode || 'ภาคปกติ (จันทร์-ศุกร์) และ ภาคพิเศษ (เสาร์-อาทิตย์)'}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                  <LucideIcon name="ShieldCheck" size={13} className="text-emerald-600" />
                  <span>{t.costs}</span>
                </span>
                <p className="text-xs font-bold text-emerald-800">
                  {selectedCourse.tuitionFee || selectedCourse.estimatedFee || 'ฟรีค่าธรรมเนียมการศึกษา'}
                </p>
              </div>
            </div>

            {/* Career Opportunities */}
            {((selectedCourse.careerOpportunities && selectedCourse.careerOpportunities.length > 0) ||
              (selectedCourse.careerPath && selectedCourse.careerPath.length > 0)) && (
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-mcu-pink-deep flex items-center gap-1.5">
                  <LucideIcon name="Award" size={16} className="text-mcu-gold" />
                  <span>{t.career}</span>
                </h5>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(selectedCourse.careerOpportunities || selectedCourse.careerPath || []).map((path, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold px-3 py-1 rounded-full text-xs">
                      💼 {path}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
