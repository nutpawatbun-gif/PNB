/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ContentRevision, ContentType } from '../../types';
import {
  History,
  Search,
  Filter,
  Clock,
  User,
  Calendar,
  Eye,
  GitCompare,
  RotateCcw,
  FileText,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Tag,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import VersionHistoryModal from './VersionHistoryModal';

interface VersionHistoryViewerProps {
  onNotify?: (msg: string, type: 'success' | 'error') => void;
}

const CONTENT_TYPES: { key: string; label: string; bg: string; text: string }[] = [
  { key: 'all', label: 'ทุกประเภทเนื้อหา', bg: 'bg-slate-100', text: 'text-slate-700' },
  { key: 'news', label: 'ข่าวสารและบทความ (News)', bg: 'bg-blue-100', text: 'text-blue-800' },
  { key: 'announcement', label: 'ประกาศสถาบัน (Announcements)', bg: 'bg-amber-100', text: 'text-amber-800' },
  { key: 'page', label: 'หน้าเว็บไซต์ (Pages)', bg: 'bg-purple-100', text: 'text-purple-800' },
  { key: 'academic_work', label: 'ผลงานวิชาการ (Academic Works)', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { key: 'curriculum', label: 'หลักสูตรสถานศึกษา (Curricula)', bg: 'bg-rose-100', text: 'text-rose-800' },
  { key: 'admission_project', label: 'โครงการรับสมัคร (Admissions)', bg: 'bg-teal-100', text: 'text-teal-800' }
];

export default function VersionHistoryViewer({ onNotify }: VersionHistoryViewerProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal detail trigger
  const [activeModalItem, setActiveModalItem] = useState<{ contentType: string; contentId: string; title: string } | null>(null);

  useEffect(() => {
    fetchRevisions();
  }, [selectedCategory]);

  const fetchRevisions = async () => {
    setLoading(true);
    try {
      const data = await api.getRevisions(
        selectedCategory === 'all' ? undefined : selectedCategory,
        undefined,
        searchQuery || undefined
      );
      setRevisions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching revisions:', err);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติเวอร์ชัน: ' + err.message, 'error');
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRevisions();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-inner">
              <History className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  ศูนย์ควบคุมประวัติเวอร์ชันระบบ (Version History Central)
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                  {revisions.length} เวอร์ชันในระบบ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                ระบบสแนปชอตบันทึกข้อมูลย้อนหลังสำหรับการแก้ไขข่าว ประกาศ หน้าเว็บไซต์ ผลงานวิชาการ และหลักสูตร เพื่อรองรับการเปรียบเทียบและการกู้คืนข้อมูลอย่างปลอดภัยไร้ความเสี่ยง
              </p>
            </div>
          </div>

          <button
            onClick={fetchRevisions}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2 shadow-sm shrink-0 self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>กรองตามประเภท:</span>
          </span>
          {CONTENT_TYPES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามหัวข้อข่าว, เหตุผลการแก้ไข, ผู้แก้ไข, หรือหมายเลขเวอร์ชัน..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>ค้นหา</span>
          </button>
        </form>
      </div>

      {/* Main Revisions Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600">กำลังโหลดประวัติเวอร์ชัน...</p>
          </div>
        ) : revisions.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700">ไม่พบข้อมูลประวัติเวอร์ชันตามเงื่อนไขที่ระบุ</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ลองเปลี่ยนประเภทเนื้อหาหรือค้นหาด้วยคำอื่น ระบบจะบันทึกสแนปชอตให้อัตโนมัติเมื่อมีการบันทึกข้อมูลใหม่
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">เวอร์ชัน & โมดูล</th>
                  <th className="px-5 py-3.5">หัวข้อรายการ (Snapshot Title)</th>
                  <th className="px-5 py-3.5">เหตุผลการแก้ไข (Edit Reason)</th>
                  <th className="px-5 py-3.5">ผู้บันทึก/แก้ไข</th>
                  <th className="px-5 py-3.5">วันและเวลา</th>
                  <th className="px-5 py-3.5 text-right">เครื่องมือจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {revisions.map((rev) => {
                  const typeObj = CONTENT_TYPES.find((c) => c.key === rev.contentType) || {
                    key: rev.contentType,
                    label: rev.contentType,
                    bg: 'bg-slate-100',
                    text: 'text-slate-700'
                  };

                  return (
                    <tr key={rev.id} className="hover:bg-amber-50/50 transition-colors">
                      
                      {/* Version & Module Pill */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 text-xs font-black bg-slate-900 text-amber-400 rounded-lg shadow-sm border border-slate-800">
                            v{rev.revisionNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${typeObj.bg} ${typeObj.text}`}>
                            {typeObj.label.split(' ')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Snapshot Title */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{rev.title}</div>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {rev.contentId}</span>
                      </td>

                      {/* Change Summary */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold line-clamp-2">
                          {rev.changeSummary || 'ไม่มีระบุเหตุผล'}
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">{rev.createdByName || rev.createdBy}</span>
                          {rev.createdByRole && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-200 text-slate-700 rounded">
                              {rev.createdByRole}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(rev.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() =>
                            setActiveModalItem({
                              contentType: rev.contentType,
                              contentId: rev.contentId,
                              title: rev.title
                            })
                          }
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 ml-auto"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>ดู/เปรียบเทียบประวัติ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {activeModalItem && (
        <VersionHistoryModal
          isOpen={!!activeModalItem}
          onClose={() => setActiveModalItem(null)}
          contentType={activeModalItem.contentType}
          contentId={activeModalItem.contentId}
          contentTitle={activeModalItem.title}
          onNotify={onNotify}
          onRestored={() => {
            fetchRevisions();
          }}
        />
      )}
    </div>
  );
}
