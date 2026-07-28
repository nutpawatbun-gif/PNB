/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { coursesStore } from '../data/coursesStore';
import { Course } from '../types';
import { api } from '../lib/api';
import LucideIcon from './LucideIcon';
import { Modal } from './ui/Modal';

interface CourseGridProps {
  lang: 'th' | 'en';
  onApplyCourse: (courseId?: string) => void;
}

export default function CourseGrid({ lang, onApplyCourse }: CourseGridProps) {
  const [activeTab, setActiveTab] = useState<'bachelor' | 'master' | 'doctor' | 'certificate'>('bachelor');
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
    title: lang === 'th' ? 'หลักสูตรที่เปิดสอน' : 'Offered Academic Programs',
    sub: lang === 'th' ? 'หลักสูตรบูรณาการพุทธศาสตร์ ยกระดับปัญญา เสริมวิชาการ คุณวุฒิระดับสากล' : 'Curricula integrating Buddhist philosophy with modern public governance standards.',
    bachelor: lang === 'th' ? 'ปริญญาตรี' : 'Bachelor',
    master: lang === 'th' ? 'ปริญญาโท' : 'Master',
    doctor: lang === 'th' ? 'ปริญญาเอก' : 'Doctoral',
    cert: lang === 'th' ? 'ประกาศนียบัตร' : 'Certificates',
    code: lang === 'th' ? 'รหัสหลักสูตร' : 'Program Code',
    duration: lang === 'th' ? 'ระยะเวลาศึกษา' : 'Duration of Study',
    mode: lang === 'th' ? 'รูปแบบการเรียน' : 'Study Mode',
    qualification: lang === 'th' ? 'เกณฑ์และคุณสมบัติผู้สมัครเรียน' : 'Admission Requirements',
    costs: lang === 'th' ? 'ค่าธรรมเนียมการศึกษา' : 'Estimated Tuition Fees',
    career: lang === 'th' ? 'แนวทางประกอบอาชีพหลังสำเร็จการศึกษา' : 'Career Opportunities',
    viewDetails: lang === 'th' ? 'ศึกษารายละเอียดหลักสูตร' : 'View Course Details',
    applyNow: lang === 'th' ? 'สมัครเรียนออนไลน์' : 'Apply Online',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    degree: lang === 'th' ? 'ชื่อคุณวุฒิ' : 'Degree Awarded',
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
    <section className="py-16 bg-mcu-pink-soft/40 border-b border-mcu-pink-light" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-1.5 text-mcu-pink mb-2">
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-mcu-gold">{lang === 'th' ? 'ข้อมูลหลักสูตร มจร' : 'Curricula Directory'}</span>
            <span className="h-0.5 w-6 bg-mcu-gold"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-mcu-pink-deep mb-3 font-sans thai-gold-border pb-2 inline-block">
            {t.title}
          </h2>
          <p className="text-sm text-muted-text-mcu max-w-2xl mx-auto font-light mt-3">
            {t.sub}
          </p>
        </div>

        {/* Level Tabs selector */}
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mb-10 border-b border-mcu-pink-light/60 pb-4 max-w-2xl mx-auto">
          {[
            { key: 'bachelor', label: t.bachelor },
            { key: 'master', label: t.master },
            { key: 'doctor', label: t.doctor },
            { key: 'certificate', label: t.cert },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-mcu-gold text-mcu-pink bg-white/60 rounded-t-lg'
                  : 'border-transparent text-muted-text-mcu hover:text-mcu-pink hover:bg-mcu-pink-soft/50'
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
                className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border shadow-mcu-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  isClosed ? 'border-rose-300 dark:border-rose-900/60' : 'border-border-mcu hover:border-mcu-pink'
                }`}
              >
                {/* Header card info */}
                <div className="p-6 border-b border-mcu-pink-soft bg-gradient-to-tr from-mcu-pink-soft/30 to-white dark:to-slate-900 space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="bg-mcu-pink text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs shrink-0">
                      {course.code}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {isClosed ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-md border border-rose-200">
                          🔴 ปิดรับสมัครออนไลน์
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          ✅ เปิดรับสมัครออนไลน์
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-mcu-pink-deep dark:text-mcu-gold-light line-clamp-2 min-h-[50px] leading-snug">
                    {courseName}
                  </h3>

                  <p className="text-xs text-slate-500 font-light line-clamp-1">
                    <strong className="font-semibold text-slate-700 dark:text-slate-300">{t.degree}:</strong> {degreeTitle}
                  </p>
                </div>

                {/* Course Quick Summary Info */}
                <div className="p-6 space-y-2.5 flex-grow text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-400">{t.duration}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{course.duration || '4 ปี (8 ภาคการศึกษา)'}</span>
                  </div>

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
                <div className="p-6 pt-0 border-t border-mcu-pink-soft/40 flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className="w-full text-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <LucideIcon name="BookOpen" size={14} />
                    <span>{t.viewDetails}</span>
                  </button>

                  {isClosed ? (
                    <button
                      type="button"
                      disabled
                      className="w-full text-center px-4 py-2.5 bg-rose-100 text-rose-800 border border-rose-200 font-extrabold rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <LucideIcon name="Lock" size={14} />
                      <span>🔒 ปิดรับสมัครออนไลน์</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApplyCourse && onApplyCourse(course.id)}
                      className="w-full text-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
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
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
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
    </section>
  );
}
