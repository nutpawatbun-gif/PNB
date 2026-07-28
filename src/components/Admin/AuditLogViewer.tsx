/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AUDIT LOG VIEWER & SECURITY AUDIT COMPONENT
 * MCU PKPM CMS Systematic Immutable Audit Architecture
 */

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Eye, 
  X, 
  FileText, 
  Globe, 
  Smartphone, 
  Laptop, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Database,
  Key
} from 'lucide-react';
import { api } from '../../lib/api';

interface AuditLogEntry {
  id: string;
  username: string;
  userFullname?: string;
  userRole?: string;
  timestamp: string;
  ip: string;
  device?: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'PUBLISH' | 'UNPUBLISH' | 'LOGIN' | 'ROLE_CHANGE' | string;
  action: string;
  module: string;
  recordId?: string | null;
  details?: string;
  beforeData?: any;
  afterData?: any;
}

interface AuditLogViewerProps {
  onToast?: (text: string, type: 'success' | 'error') => void;
}

export function AuditLogViewer({ onToast }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Snapshot Inspection Modal
  const [inspectLog, setInspectLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs({
        search: searchTerm,
        actionType: selectedActionType !== 'all' ? selectedActionType : undefined,
        module: selectedModule !== 'all' ? selectedModule : undefined,
        user: selectedUser !== 'all' ? selectedUser : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setLogs(data || []);
    } catch (err: any) {
      if (onToast) onToast('ไม่สามารถดึงข้อมูล Audit Log ได้: ' + (err.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedActionType, selectedModule, selectedUser, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedActionType('all');
    setSelectedModule('all');
    setSelectedUser('all');
    setStartDate('');
    setEndDate('');
    fetchLogs();
  };

  // Helper: Action Type Badge Styler
  const getActionTypeBadge = (type: string) => {
    switch ((type || '').toUpperCase()) {
      case 'CREATE':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">➕ การเพิ่มข้อมูล (CREATE)</span>;
      case 'UPDATE':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">✏️ การแก้ไข (UPDATE)</span>;
      case 'DELETE':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">🗑️ การลบ (DELETE)</span>;
      case 'RESTORE':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">🔄 การกู้คืน (RESTORE)</span>;
      case 'PUBLISH':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">🌐 การเผยแพร่ (PUBLISH)</span>;
      case 'UNPUBLISH':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">🙈 ยกเลิกเผยแพร่ (UNPUBLISH)</span>;
      case 'LOGIN':
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">🔑 การเข้าสู่ระบบ (LOGIN)</span>;
      case 'ROLE_CHANGE':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">🛡️ การเปลี่ยนสิทธิ์ (ROLE_CHANGE)</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 border border-gray-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">⚙️ {type}</span>;
    }
  };

  // Get distinct list of users & modules for filter options
  const uniqueUsers = Array.from(new Set(logs.map(l => l.username).filter(Boolean)));
  const uniqueModules = Array.from(new Set(logs.map(l => l.module).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header & Immutability Security Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
              <ShieldCheck size={12} /> Immutable Audit Logs Architecture
            </span>
            <span className="bg-white/10 text-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              มาตรฐานความปลอดภัยสูงสุด
            </span>
          </div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History size={24} className="text-mcu-pink-light" />
            ประวัติบันทึกการใช้งานระบบ (System Audit Trail)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            บันทึกการกระทำของผู้ใช้ ผู้ดูแลระบบ ไอพี อุปกรณ์ ข้อมูลก่อนแก้ไข และหลังแก้ไขอย่างละเอียด ข้อมูล Audit Log ถูกปกป้องเป็นแบบ อ่านได้อย่างเดียว (Immutable) ไม่สามารถแก้ไขหรือลบได้
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>อัปเดตประวัติ</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
              <Search size={12} /> ค้นหาคำสำคัญ
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ชื่อผู้ใช้, รายการ, IP, ID..."
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-mcu-pink"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Action Type Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
              <Filter size={12} /> ประเภทการกระทำ (Action)
            </label>
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-mcu-pink bg-white"
            >
              <option value="all">ทั้งหมด (All Action Types)</option>
              <option value="CREATE">➕ การเพิ่มข้อมูล (CREATE)</option>
              <option value="UPDATE">✏️ การแก้ไข (UPDATE)</option>
              <option value="DELETE">🗑️ การลบ (DELETE)</option>
              <option value="RESTORE">🔄 การกู้คืน (RESTORE)</option>
              <option value="PUBLISH">🌐 การเผยแพร่ (PUBLISH)</option>
              <option value="UNPUBLISH">🙈 ยกเลิกเผยแพร่ (UNPUBLISH)</option>
              <option value="LOGIN">🔑 การเข้าสู่ระบบ (LOGIN)</option>
              <option value="ROLE_CHANGE">🛡️ การเปลี่ยนสิทธิ์ (ROLE_CHANGE)</option>
            </select>
          </div>

          {/* Module Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
              <Layers size={12} /> โมดูลระบบ (Module)
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-mcu-pink bg-white"
            >
              <option value="all">ทุกโมดูล (All Modules)</option>
              {uniqueModules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
              <User size={12} /> ผู้ใช้งาน (User)
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-mcu-pink bg-white"
            >
              <option value="all">ผู้ใช้ทุกคน (All Users)</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
              <Calendar size={12} /> ตั้งแต่วันที่
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-mcu-pink bg-white"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
              <Calendar size={12} /> ถึงวันที่
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-mcu-pink bg-white"
            />
          </div>

          {/* Filter Action Buttons */}
          <div className="lg:col-span-2 flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Search size={14} /> ค้นหาประวัติ
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-all"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </form>
      </div>

      {/* AUDIT LOG TABLE RESULT */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600 font-medium">
          <div>
            พบประวัติทั้งหมด <strong className="text-gray-900 font-bold">{logs.length}</strong> รายการ
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Lock size={12} /> Protection Active: Logs are Immutable
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <History size={40} className="mx-auto text-gray-300" />
            <p className="font-bold text-gray-700">ไม่พบประวัติ Audit Log ตามเงื่อนไขที่ระบุ</p>
            <p className="text-xs text-gray-400">ลองเปลี่ยนหรือล้างเงื่อนไขการค้นหาเพื่อดูข้อมูลทั้งหมด</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">วันและเวลา</th>
                  <th className="p-3.5">ผู้ใช้งาน / บทบาท</th>
                  <th className="p-3.5">ประเภทการกระทำ</th>
                  <th className="p-3.5">โมดูล</th>
                  <th className="p-3.5">รหัสรายการ</th>
                  <th className="p-3.5">รายละเอียด / IP / อุปกรณ์</th>
                  <th className="p-3.5 text-center">Snapshot Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3.5 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    {/* User */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-gray-800">{log.userFullname || log.username}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        @{log.username} • <span className="text-mcu-pink font-semibold">{log.userRole || 'Admin'}</span>
                      </div>
                    </td>

                    {/* Action Type */}
                    <td className="p-3.5 whitespace-nowrap">
                      {getActionTypeBadge(log.actionType)}
                      <div className="text-[11px] font-semibold text-gray-700 mt-0.5">{log.action}</div>
                    </td>

                    {/* Module */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-bold text-[11px] border border-slate-200">
                        {log.module}
                      </span>
                    </td>

                    {/* Record ID */}
                    <td className="p-3.5 whitespace-nowrap">
                      {log.recordId ? (
                        <span className="font-mono text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                          {log.recordId}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Details / IP / Device */}
                    <td className="p-3.5 max-w-xs">
                      <div className="text-gray-800 font-medium line-clamp-2">
                        {typeof log.details === 'object' && log.details !== null ? ((log.details as any).title || (log.details as any).name || JSON.stringify(log.details)) : String(log.details || '-')}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-slate-600">
                          <Globe size={10} /> {log.ip}
                        </span>
                        {log.device && (
                          <span className="truncate max-w-[120px] text-slate-400" title={log.device}>
                            {log.device}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Snapshot Button */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {(log.beforeData || log.afterData) ? (
                        <button
                          onClick={() => setInspectLog(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-mcu-pink hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition-all border border-slate-200 inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye size={12} /> ตรวจ Snapshot
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">ไม่มีข้อมูล</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SNAPSHOT INSPECTION MODAL */}
      {inspectLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getActionTypeBadge(inspectLog.actionType)}
                  <span className="text-xs text-slate-300 font-mono">ID: {inspectLog.id}</span>
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database size={18} className="text-mcu-pink-light" />
                  ตรวจสอบ Snapshot ข้อมูลก่อนแก้ไข และ หลังแก้ไข (Before / After Comparison)
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Meta Info Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">ผู้ทำรายการ</span>
                  <strong className="text-slate-800">{inspectLog.userFullname || inspectLog.username}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">โมดูล</span>
                  <strong className="text-slate-800">{inspectLog.module}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">รหัสรายการ (Record ID)</span>
                  <strong className="text-blue-600 font-mono">{inspectLog.recordId || '-'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">IP Address</span>
                  <strong className="text-slate-800 font-mono">{inspectLog.ip}</strong>
                </div>
              </div>

              {/* Side-by-Side Before / After Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE DATA */}
                <div className="border border-red-200 bg-red-50/30 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-red-100 text-red-800 px-4 py-2 font-bold text-xs border-b border-red-200 flex items-center justify-between">
                    <span>ข้อมูลก่อนแก้ไข (Before Data)</span>
                    <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-md">Original</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] overflow-x-auto bg-slate-900 text-red-300 flex-1 min-h-[220px]">
                    {inspectLog.beforeData ? (
                      <pre>{JSON.stringify(inspectLog.beforeData, null, 2)}</pre>
                    ) : (
                      <span className="text-slate-500 italic">ไม่มีข้อมูลก่อนแก้ไข (เช่น กรณีการเพิ่มข้อมูลใหม่ CREATE)</span>
                    )}
                  </div>
                </div>

                {/* AFTER DATA */}
                <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-emerald-100 text-emerald-800 px-4 py-2 font-bold text-xs border-b border-emerald-200 flex items-center justify-between">
                    <span>ข้อมูลหลังแก้ไข (After Data)</span>
                    <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-md">Updated</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] overflow-x-auto bg-slate-900 text-emerald-300 flex-1 min-h-[220px]">
                    {inspectLog.afterData ? (
                      <pre>{JSON.stringify(inspectLog.afterData, null, 2)}</pre>
                    ) : (
                      <span className="text-slate-500 italic">ไม่มีข้อมูลหลังแก้ไข (เช่น กรณีการลบข้อมูล DELETE)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Validated by Systematic Audit Trail Engine
              </span>
              <button
                onClick={() => setInspectLog(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
