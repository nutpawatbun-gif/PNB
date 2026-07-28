/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { 
  Newspaper, 
  Calendar, 
  GraduationCap, 
  Download, 
  BookOpen, 
  Users, 
  ShieldAlert, 
  FileEdit, 
  CheckCircle, 
  History, 
  PlusCircle,
  FileText,
  Clock
} from 'lucide-react';

interface DashboardHomeProps {
  onShortcutClick: (module: string) => void;
}

export default function DashboardHome({ onShortcutClick }: DashboardHomeProps) {
  const defaultStats = {
    newsCount: 0,
    eventsCount: 0,
    coursesCount: 0,
    downloadsCount: 0,
    academicWorksCount: 0,
    applicantsCount: 0,
    usersCount: 0,
    publishedCount: 0,
    draftCount: 0,
    recentLogs: []
  };

  const [stats, setStats] = useState<any>(defaultStats);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      if (data && typeof data === 'object') {
        setStats({
          ...defaultStats,
          ...data
        });
      } else {
        setStats(defaultStats);
      }
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mcu-pink-deep"></div>
        <span className="ml-3 text-mcu-pink-deep font-medium">กำลังโหลดข้อมูลสถิติ...</span>
      </div>
    );
  }

  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  const handleResetStats = () => {
    setShowResetConfirmModal(true);
  };

  const confirmResetStats = async () => {
    setShowResetConfirmModal(false);
    try {
      await fetch('/api/stats/reset', { method: 'POST' });
      fetchStats();
    } catch (e) {
      console.error('Error resetting stats:', e);
    }
  };

  const statCards = [
    { label: 'ข่าวสารทั้งหมด', count: stats?.newsCount ?? 0, icon: Newspaper, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'จำนวนผู้เข้าชมข่าวรวม', count: stats?.totalNewsViews ?? 0, icon: Clock, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { label: 'บุคลากรสถาบัน', count: stats?.personnelCount ?? 0, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { label: 'หลักสูตรทั้งหมด', count: stats?.coursesCount ?? 0, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'เอกสารดาวน์โหลด', count: stats?.downloadsCount ?? 0, icon: Download, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'ผลงานวิชาการ', count: stats?.academicWorksCount ?? 0, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'ผู้สมัครเรียนออนไลน์', count: stats?.applicantsCount ?? 0, icon: Users, color: 'text-pink-600 bg-pink-50 border-pink-100' },
    { label: 'ผู้ใช้งานระบบ', count: stats?.usersCount ?? 0, icon: ShieldAlert, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { label: 'ข่าวเผยแพร่แล้ว', count: stats?.publishedCount ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-100' },
    { label: 'ข่าวแบบร่าง / ซ่อน', count: stats?.draftCount ?? 0, icon: FileEdit, color: 'text-gray-600 bg-gray-50 border-gray-100' },
  ];

  return (
    <div className="space-y-8" id="dashboard_home_module">
      {/* 1. สรุปสถิติ (Statistics Cards Grid) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-mcu-pink-deep flex items-center">
            <Clock className="mr-2 text-mcu-pink" size={20} />
            สรุปสถิติระบบและเนื้อหาตามจริง (Real-time Database Stats)
          </h2>
          <button
            onClick={handleResetStats}
            className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1.5 w-fit"
            title="รีเซ็ตสถิติตัวนับจำนวนเข้าชมกลับเป็น 0"
          >
            <Clock size={14} className="text-amber-600" />
            <span>รีเซ็ตสถิติตัวนับเป็น 0</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div 
                key={i} 
                id={`stat_card_${i}`}
                className={`p-5 rounded-xl border flex items-center justify-between shadow-sm bg-white hover:shadow-md transition-shadow`}
              >
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. ทางลัดสำหรับเพิ่มข้อมูล (Shortcuts Panel) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm col-span-1" id="shortcuts_panel">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PlusCircle className="mr-2 text-mcu-pink" size={18} />
            ทางลัดเพิ่มข้อมูลด่วน
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => onShortcutClick('news')} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-mcu-pink-light/10 text-gray-700 hover:text-mcu-pink-deep border border-gray-50 hover:border-mcu-pink/20 transition-all text-left text-sm"
            >
              <span className="flex items-center font-medium">
                <Newspaper className="mr-2 text-blue-500" size={16} />
                เขียนข่าวประชาสัมพันธ์ใหม่
              </span>
              <span className="text-xs text-gray-400">เพิ่มใหม่</span>
            </button>
            <button 
              onClick={() => onShortcutClick('events')} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-mcu-pink-light/10 text-gray-700 hover:text-mcu-pink-deep border border-gray-50 hover:border-mcu-pink/20 transition-all text-left text-sm"
            >
              <span className="flex items-center font-medium">
                <Calendar className="mr-2 text-purple-500" size={16} />
                สร้างปฏิทินกิจกรรมใหม่
              </span>
              <span className="text-xs text-gray-400">เพิ่มใหม่</span>
            </button>
            <button 
              onClick={() => onShortcutClick('courses')} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-mcu-pink-light/10 text-gray-700 hover:text-mcu-pink-deep border border-gray-50 hover:border-mcu-pink/20 transition-all text-left text-sm"
            >
              <span className="flex items-center font-medium">
                <GraduationCap className="mr-2 text-emerald-500" size={16} />
                เพิ่มหลักสูตรการศึกษา
              </span>
              <span className="text-xs text-gray-400">เพิ่มใหม่</span>
            </button>
            <button 
              onClick={() => onShortcutClick('downloads')} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-mcu-pink-light/10 text-gray-700 hover:text-mcu-pink-deep border border-gray-50 hover:border-mcu-pink/20 transition-all text-left text-sm"
            >
              <span className="flex items-center font-medium">
                <Download className="mr-2 text-amber-500" size={16} />
                อัปโหลดไฟล์ดาวน์โหลด
              </span>
              <span className="text-xs text-gray-400">เพิ่มใหม่</span>
            </button>
            <button 
              onClick={() => onShortcutClick('academic')} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-mcu-pink-light/10 text-gray-700 hover:text-mcu-pink-deep border border-gray-50 hover:border-mcu-pink/20 transition-all text-left text-sm"
            >
              <span className="flex items-center font-medium">
                <BookOpen className="mr-2 text-indigo-500" size={16} />
                เผยแพร่ผลงานวิชาการ
              </span>
              <span className="text-xs text-gray-400">เพิ่มใหม่</span>
            </button>
            <button 
              onClick={() => onShortcutClick('media')} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-mcu-pink-light/10 text-gray-700 hover:text-mcu-pink-deep border border-gray-50 hover:border-mcu-pink/20 transition-all text-left text-sm"
            >
              <span className="flex items-center font-medium">
                <FileText className="mr-2 text-pink-500" size={16} />
                คลังสื่อและระบบจัดการไฟล์กลาง (Media)
              </span>
              <span className="text-xs text-gray-400">อัปโหลด</span>
            </button>
            <button 
              onClick={() => onShortcutClick('backup_manager')} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-mcu-pink-light/10 text-gray-700 hover:text-mcu-pink-deep border border-gray-50 hover:border-mcu-pink/20 transition-all text-left text-sm"
            >
              <span className="flex items-center font-medium">
                <ShieldAlert className="mr-2 text-purple-600" size={16} />
                ระบบสำรองและกู้คืนข้อมูล (Backup System)
              </span>
              <span className="text-xs text-purple-600 font-bold">สำรองด่วน</span>
            </button>
          </div>
        </div>

        {/* 3. ประวัติการแก้ไขและการทำงาน (Audit Log) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm col-span-2" id="recent_activities_panel">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <History className="mr-2 text-mcu-pink" size={18} />
            ประวัติการแก้ไขและประวัติเข้าระบบล่าสุด
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-semibold bg-gray-50/50">
                  <th className="py-2.5 px-3">วันเวลา</th>
                  <th className="py-2.5 px-3">ผู้ดำเนินการ</th>
                  <th className="py-2.5 px-3">โมดูล</th>
                  <th className="py-2.5 px-3">การกระทำ</th>
                  <th className="py-2.5 px-3">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {!stats?.recentLogs || stats.recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400 italic">ไม่มีข้อมูลการทำรายการในระบบ</td>
                  </tr>
                ) : (
                  (stats.recentLogs || []).map((log: any) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 text-gray-600 text-xs">
                      <td className="py-2 px-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('th-TH')}</td>
                      <td className="py-2 px-3 font-semibold text-mcu-pink-deep">{log.username}</td>
                      <td className="py-2 px-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-gray-700">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium">{log.action}</td>
                      <td className="py-2 px-3 max-w-xs truncate" title={typeof log.details === 'object' && log.details !== null ? JSON.stringify(log.details) : String(log.details || '')}>
                        {typeof log.details === 'object' && log.details !== null ? (log.details.title || log.details.name || JSON.stringify(log.details)) : String(log.details || '-')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RESET STATS CONFIRMATION MODAL */}
      {showResetConfirmModal && (
        <Modal
          isOpen={showResetConfirmModal}
          onClose={() => setShowResetConfirmModal(false)}
          title="ยืนยันการรีเซ็ตสถิติผู้เข้าชม"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmResetStats}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>ยืนยันการรีเซ็ตสถิติเป็น 0</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสถิติตัวนับจำนวนผู้เข้าชมข่าวสารและดาวน์โหลดทั้งหมดเป็น 0?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "รีเซ็ตสถิติเข้าชมข่าวสารและดาวน์โหลดทั้งหมด"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
