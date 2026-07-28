/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ContentRevision } from '../../types';
import {
  History,
  GitCompare,
  RotateCcw,
  Clock,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ArrowLeftRight,
  ShieldCheck,
  Eye,
  Sparkles,
  Tag,
  ChevronRight,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType?: string;
  contentId?: string;
  contentTitle?: string;
  onRestored?: (restoredItem: any) => void;
  onRestoreSuccess?: () => void;
  onNotify?: (msg: string, type: 'success' | 'error') => void;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle,
  onRestored,
  onNotify
}: VersionHistoryModalProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRevA, setSelectedRevA] = useState<ContentRevision | null>(null);
  const [selectedRevB, setSelectedRevB] = useState<ContentRevision | null>(null);
  const [viewingRev, setViewingRev] = useState<ContentRevision | null>(null);
  
  // Modes
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare' | 'detail'>('timeline');

  // Restore Modal State
  const [restoringRev, setRestoringRev] = useState<ContentRevision | null>(null);
  const [restoreReason, setRestoreReason] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadRevisions();
    } else {
      setSelectedRevA(null);
      setSelectedRevB(null);
      setViewingRev(null);
      setRestoringRev(null);
      setRestoreReason('');
    }
  }, [isOpen, contentType, contentId]);

  const loadRevisions = async () => {
    setLoading(true);
    try {
      const data = await api.getRevisions(contentType, contentId);
      const list = Array.isArray(data) ? data : [];
      setRevisions(list);
      if (list.length > 0) {
        setViewingRev(list[0]); // newest revision by default
        if (list.length >= 2) {
          setSelectedRevA(list[1]); // previous version
          setSelectedRevB(list[0]); // latest version
        } else {
          setSelectedRevA(list[0]);
          setSelectedRevB(list[0]);
        }
      }
    } catch (err: any) {
      console.error('Error loading revisions:', err);
      if (onNotify) onNotify('ไม่สามารถโหลดประวัติเวอร์ชันได้: ' + err.message, 'error');
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoringRev) return;
    setIsRestoring(true);
    try {
      const res = await api.restoreRevision(
        restoringRev.id,
        restoreReason || `กู้คืนจากเวอร์ชันที่ #${restoringRev.revisionNumber}`
      );
      if (onNotify) onNotify(res.message || 'กู้คืนเวอร์ชันสำเร็จเรียบร้อยแล้ว', 'success');
      if (onRestored && res.restoredItem) {
        onRestored(res.restoredItem);
      }
      setRestoringRev(null);
      setRestoreReason('');
      await loadRevisions();
    } catch (err: any) {
      console.error('Error restoring revision:', err);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการกู้คืนเวอร์ชัน: ' + err.message, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  // Render Diff line highlighter helper
  const renderTextDiff = (textA: string = '', textB: string = '') => {
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');
    const maxLines = Math.max(linesA.length, linesB.length);

    return (
      <div className="font-mono text-xs overflow-x-auto space-y-1 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800">
        {Array.from({ length: maxLines }).map((_, idx) => {
          const lineA = linesA[idx] ?? '';
          const lineB = linesB[idx] ?? '';
          const isSame = lineA === lineB;
          const isAdded = !lineA && lineB;
          const isDeleted = lineA && !lineB;
          const isModified = lineA !== lineB && lineA && lineB;

          if (isSame) {
            return (
              <div key={idx} className="flex py-0.5 text-slate-400 opacity-70 hover:opacity-100">
                <span className="w-8 select-none text-slate-600 text-right pr-3">{idx + 1}</span>
                <span className="pl-2 border-l border-slate-700">{lineA || ' '}</span>
              </div>
            );
          }

          if (isModified) {
            return (
              <div key={idx} className="space-y-0.5 my-1">
                <div className="flex bg-rose-950/60 text-rose-300 py-0.5 rounded px-1">
                  <span className="w-8 select-none text-rose-500 text-right pr-3">-</span>
                  <span className="pl-2 border-l border-rose-700 font-semibold">{lineA}</span>
                </div>
                <div className="flex bg-emerald-950/60 text-emerald-300 py-0.5 rounded px-1">
                  <span className="w-8 select-none text-emerald-500 text-right pr-3">+</span>
                  <span className="pl-2 border-l border-emerald-700 font-semibold">{lineB}</span>
                </div>
              </div>
            );
          }

          if (isDeleted) {
            return (
              <div key={idx} className="flex bg-rose-950/60 text-rose-300 py-0.5 rounded px-1 my-0.5">
                <span className="w-8 select-none text-rose-500 text-right pr-3">-</span>
                <span className="pl-2 border-l border-rose-700 line-through opacity-80">{lineA}</span>
              </div>
            );
          }

          if (isAdded) {
            return (
              <div key={idx} className="flex bg-emerald-950/60 text-emerald-300 py-0.5 rounded px-1 my-0.5">
                <span className="w-8 select-none text-emerald-500 text-right pr-3">+</span>
                <span className="pl-2 border-l border-emerald-700 font-semibold">{lineB}</span>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">ประวัติเวอร์ชันและการเปรียบเทียบ (Version History)</h3>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {revisions.length} เวอร์ชัน
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {contentTitle || contentId ? `รายการ: ${contentTitle || contentId}` : 'บันทึกประวัติการเปลี่ยนแปลงทั้งหมด'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Navigation Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1.5 ${
                  activeTab === 'timeline'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>ไทม์ไลน์ (Timeline)</span>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                disabled={revisions.length < 2}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1.5 ${
                  activeTab === 'compare'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>เปรียบเทียบ (Diff)</span>
              </button>

              <button
                onClick={() => setActiveTab('detail')}
                disabled={!viewingRev}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1.5 ${
                  activeTab === 'detail'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ดูข้อมูลฉบับเต็ม</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-600">กำลังดึงประวัติเวอร์ชัน...</p>
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <History className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-700">ยังไม่มีประวัติเวอร์ชันที่ถูกบันทึก</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เมื่อผู้ดูแลระบบสร้างหรือแก้ไขข้อมูล เนื้อหาเดิมจะถูกบันทึกไว้ในประวัติเวอร์ชันโดยอัตโนมัติเพื่อป้องกันข้อมูลสูญหาย
              </p>
            </div>
          ) : activeTab === 'timeline' ? (
            /* TAB 1: TIMELINE VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Timeline Items List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>รายการเวอร์ชันย้อนหลัง (เรียงจากล่าสุด)</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    คลิกเลือกเวอร์ชันเพื่อดูรายละเอียดหรือกู้คืน
                  </span>
                </div>

                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {revisions.map((rev, idx) => {
                    const isLatest = idx === 0;
                    const isSelected = viewingRev?.id === rev.id;

                    return (
                      <div
                        key={rev.id}
                        onClick={() => setViewingRev(rev)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                                isLatest
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-100'
                              }`}
                            >
                              v{rev.revisionNumber} {isLatest && '(ปัจจุบัน)'}
                            </span>

                            <span className="text-xs font-semibold text-slate-500 capitalize">
                              [{rev.contentType}]
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingRev(rev);
                                setActiveTab('detail');
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ดูฉบับเต็ม</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRestoringRev(rev);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors flex items-center space-x-1 border border-amber-300"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                              <span>กู้คืนเวอร์ชันนี้</span>
                            </button>
                          </div>
                        </div>

                        {/* Revision Title */}
                        <h5 className="mt-2 text-sm font-bold text-slate-900 line-clamp-1">
                          {rev.title}
                        </h5>

                        {/* Edit Reason / Summary */}
                        <div className="mt-2 p-2.5 bg-slate-100/90 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium flex items-start space-x-2">
                          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800">เหตุผลการแก้ไข: </span>
                            <span>{rev.changeSummary || 'ไม่มีระบุเหตุผล'}</span>
                          </div>
                        </div>

                        {/* User & Date Info */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center space-x-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700">
                              {rev.createdByName || rev.createdBy}
                            </span>
                            {rev.createdByRole && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded">
                                {rev.createdByRole}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revision Snapshot Quick Preview Panel */}
              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                {viewingRev ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                          ตัวอย่างพรีวิวเวอร์ชัน v{viewingRev.revisionNumber}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {viewingRev.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => setRestoringRev(viewingRev)}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>กู้คืนเวอร์ชันนี้</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-700">ผู้แก้ไข: </span>
                        {viewingRev.createdByName || viewingRev.createdBy} ({viewingRev.createdByRole || 'Admin'})
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">วันและเวลา: </span>
                        {new Date(viewingRev.createdAt).toLocaleString('th-TH')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">เหตุผล: </span>
                        {viewingRev.changeSummary}
                      </div>
                    </div>

                    {/* Snapshot Content Preview */}
                    <div className="flex-1 overflow-y-auto max-h-[360px] p-4 bg-slate-900 text-slate-200 text-xs rounded-xl font-mono leading-relaxed space-y-2 border border-slate-800">
                      <div className="text-amber-400 font-bold border-b border-slate-800 pb-1">
                        // Snapshot JSON Schema (v{viewingRev.revisionNumber})
                      </div>
                      <div>
                        <span className="text-emerald-400">Title: </span>
                        {viewingRev.snapshot?.title || viewingRev.snapshot?.titleTh || '-'}
                      </div>
                      {viewingRev.snapshot?.category && (
                        <div>
                          <span className="text-emerald-400">Category: </span>
                          {viewingRev.snapshot?.categoryLabel || viewingRev.snapshot?.category}
                        </div>
                      )}
                      {viewingRev.snapshot?.status && (
                        <div>
                          <span className="text-emerald-400">Status: </span>
                          {viewingRev.snapshot?.status}
                        </div>
                      )}
                      <div>
                        <span className="text-emerald-400">Content Length: </span>
                        {viewingRev.snapshot?.content?.length || 0} ตัวอักษร
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800 text-slate-300 whitespace-pre-wrap font-sans">
                        {viewingRev.snapshot?.content || viewingRev.snapshot?.excerpt || JSON.stringify(viewingRev.snapshot, null, 2)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                    <Info className="w-10 h-10 mb-2" />
                    <p className="text-xs">คลิกเลือกรายการเวอร์ชันฝั่งซ้ายเพื่อดูตัวอย่าง</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'compare' ? (
            /* TAB 2: DIFF COMPARISON VIEW */
            <div className="space-y-6">
              {/* Select Versions Toolbar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Version A Selector */}
                <div className="md:col-span-5 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>เวอร์ชันเปรียบเทียบ A (ต้นทาง):</span>
                  </label>
                  <select
                    value={selectedRevA?.id || ''}
                    onChange={(e) => {
                      const rev = revisions.find((r) => r.id === e.target.value);
                      if (rev) setSelectedRevA(rev);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {revisions.map((r) => (
                      <option key={r.id} value={r.id}>
                        v{r.revisionNumber} - {r.title.substring(0, 30)}... ({new Date(r.createdAt).toLocaleDateString('th-TH')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 text-center flex justify-center items-center">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Version B Selector */}
                <div className="md:col-span-5 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>เวอร์ชันเปรียบเทียบ B (ปลายทาง):</span>
                  </label>
                  <select
                    value={selectedRevB?.id || ''}
                    onChange={(e) => {
                      const rev = revisions.find((r) => r.id === e.target.value);
                      if (rev) setSelectedRevB(rev);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {revisions.map((r) => (
                      <option key={r.id} value={r.id}>
                        v{r.revisionNumber} - {r.title.substring(0, 30)}... ({new Date(r.createdAt).toLocaleDateString('th-TH')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side by Side Metadata & Title Diff */}
              {selectedRevA && selectedRevB && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Version A Panel */}
                  <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-md">
                        เวอร์ชัน A (v{selectedRevA.revisionNumber})
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(selectedRevA.createdAt).toLocaleString('th-TH')}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">{selectedRevA.title}</h5>
                    <p className="text-xs text-slate-600">
                      <strong>ผู้แก้ไข:</strong> {selectedRevA.createdByName || selectedRevA.createdBy}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong>เหตุผล:</strong> {selectedRevA.changeSummary}
                    </p>
                  </div>

                  {/* Version B Panel */}
                  <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded-md">
                        เวอร์ชัน B (v{selectedRevB.revisionNumber})
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(selectedRevB.createdAt).toLocaleString('th-TH')}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">{selectedRevB.title}</h5>
                    <p className="text-xs text-slate-600">
                      <strong>ผู้แก้ไข:</strong> {selectedRevB.createdByName || selectedRevB.createdBy}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong>เหตุผล:</strong> {selectedRevB.changeSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Text / Content Visual Diff */}
              {selectedRevA && selectedRevB && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <GitCompare className="w-4 h-4 text-amber-600" />
                    <span>ผลการเปรียบเทียบข้อความเนื้อหา (Content Line-by-Line Diff)</span>
                  </h4>
                  {renderTextDiff(
                    selectedRevA.snapshot?.content || selectedRevA.snapshot?.excerpt || JSON.stringify(selectedRevA.snapshot, null, 2),
                    selectedRevB.snapshot?.content || selectedRevB.snapshot?.excerpt || JSON.stringify(selectedRevB.snapshot, null, 2)
                  )}
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: FULL DETAIL VIEW */
            viewingRev && (
              <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-md">
                      เวอร์ชัน v{viewingRev.revisionNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{viewingRev.title}</h3>
                  </div>

                  <button
                    onClick={() => setRestoringRev(viewingRev)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>กู้คืนเวอร์ชันนี้เป็นข้อมูลปัจจุบัน</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block">ผู้บันทึก/แก้ไข:</span>
                    <span className="font-bold text-slate-800">
                      {viewingRev.createdByName || viewingRev.createdBy} ({viewingRev.createdByRole || 'Admin'})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block">วันและเวลา:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(viewingRev.createdAt).toLocaleString('th-TH')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block">เหตุผลการแก้ไข:</span>
                    <span className="font-bold text-amber-700">
                      {viewingRev.changeSummary}
                    </span>
                  </div>
                </div>

                {/* Main Content Body */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    รายละเอียดเนื้อหาที่บันทึกไว้ใน Snapshot
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {viewingRev.snapshot?.content || viewingRev.snapshot?.excerpt || 'ไม่มีเนื้อหาความยาว'}
                  </div>
                </div>

                {/* Raw JSON Snapshot Inspection */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ข้อมูลเทคนิคดิบ (Raw JSON Snapshot)
                  </h4>
                  <pre className="p-4 bg-slate-900 text-emerald-400 text-xs rounded-xl overflow-x-auto max-h-80 font-mono">
                    {JSON.stringify(viewingRev.snapshot, null, 2)}
                  </pre>
                </div>
              </div>
            )
          )}
        </div>

        {/* Restore Confirmation Dialog Overlay */}
        {restoringRev && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
              <div className="flex items-center space-x-3 text-amber-600">
                <div className="p-3 bg-amber-100 rounded-full border border-amber-200">
                  <RotateCcw className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">ยืนยันการกู้คืนเวอร์ชัน</h4>
                  <span className="text-xs text-slate-500">
                    กู้คืนข้อมูลเป็นเวอร์ชัน v{restoringRev.revisionNumber}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>ระบบรับประกันความปลอดภัยข้อมูล (No Data Loss)</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  ระบบจะทำการสแนปชอตสำรองข้อมูลเวอร์ชันปัจจุบันโดยอัตโนมัติก่อนที่จะกู้คืน ท่านสามารถย้อนกลับมาที่เวอร์ชันปัจจุบันได้ตลอดเวลา
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  เหตุผลในการกู้คืน (จะถูกบันทึกใน Audit Log และ Version History):
                </label>
                <input
                  type="text"
                  value={restoreReason}
                  onChange={(e) => setRestoreReason(e.target.value)}
                  placeholder={`เช่น กู้คืนข้อมูลเวอร์ชันที่ #${restoringRev.revisionNumber} เนื่องจากเนื้อหาปัจจุบันมีความซ้ำซ้อน`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestoringRev(null)}
                  disabled={isRestoring}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {isRestoring ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังกู้คืน...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>ยืนยันกู้คืนเวอร์ชัน</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
