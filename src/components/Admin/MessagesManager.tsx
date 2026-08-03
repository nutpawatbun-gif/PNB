/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Mail,
  Search,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  Clock,
  User,
  Phone,
  Tag,
  RefreshCw,
  Inbox,
  Filter,
  FileSpreadsheet,
  MessageSquare,
  AlertCircle,
  Building,
  Plus,
  Edit3,
  X,
  GraduationCap,
  FileCheck,
  Users,
  Building2,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  department?: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
  replyContent?: string;
  repliedAt?: string;
}

interface ContactDepartment {
  id: string;
  nameTh: string;
  nameEn?: string;
  phone: string;
  email: string;
  officerName?: string;
  officerRole?: string;
  iconName?: string;
  imageUrl?: string;
}

interface MessagesManagerProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

export default function MessagesManager({ onNotify }: MessagesManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'departments'>('inbox');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [departments, setDepartments] = useState<ContactDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<ContactDepartment | null>(null);
  const [deptForm, setDeptForm] = useState<Omit<ContactDepartment, 'id'>>({
    nameTh: '',
    nameEn: '',
    phone: '081-462-5663',
    email: '',
    officerName: '',
    officerRole: '',
    iconName: 'Building',
    imageUrl: ''
  });

  // Reply Composer State
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e: any) {
      if (onNotify) onNotify('ไม่สามารถดึงข้อมูลข้อความติดต่อได้: ' + (e.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await api.getContactDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.warn('Failed to fetch departments:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchDepartments();
  }, []);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplySubject(`ตอบกลับ: ${msg.subject}`);
    setReplyBody(`เรียนคุณ ${msg.name},\n\nตามที่ท่านได้ติดต่อสอบถามเรื่อง "${msg.subject}" มายังฝ่ายบริการประสานงาน วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย นั้น\n\nทางวิทยาลัยสงฆ์ขอเรียนชี้แจงดังนี้:\n\n[พิมพ์คำตอบกลับที่นี่]\n\nด้วยความเคารพอย่างสูง,\nเจ้าหน้าที่ฝ่ายบริการประสานงาน\nวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ มจร\nโทร. 081-462-5663`);
    setReplySuccess(false);

    if (msg.status === 'unread') {
      try {
        await api.markMessageRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
        setSelectedMessage(prev => prev ? { ...prev, status: prev.status === 'replied' ? 'replied' : 'read' } : null);
      } catch (err) {
        console.warn('Failed to mark message as read:', err);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyBody.trim()) return;

    try {
      setIsReplying(true);
      await api.replyContactMessage(selectedMessage.id, replyBody);

      setReplySuccess(true);
      if (onNotify) onNotify(`ส่งอีเมลตอบกลับไปยังคุณ ${selectedMessage.name} (${selectedMessage.email}) เรียบร้อยแล้ว`, 'success');

      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied', replyContent: replyBody, repliedAt: new Date().toISOString() } : m));
      setSelectedMessage(prev => prev ? { ...prev, status: 'replied', replyContent: replyBody, repliedAt: new Date().toISOString() } : null);

      setTimeout(() => {
        setReplySuccess(false);
      }, 4000);
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการส่งอีเมล: ' + (err.message || ''), 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('คุณต้องการลบข้อความติดต่อนี้ใช่หรือไม่?')) return;
    try {
      await api.deleteMessage(id);
      if (onNotify) onNotify('ลบข้อความติดต่อเรียบร้อยแล้ว', 'success');
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการลบข้อความ: ' + (err.message || ''), 'error');
    }
  };

  // Department CRUD Handlers
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptForm({
      nameTh: '',
      nameEn: '',
      phone: '081-462-5663',
      email: '',
      officerName: '',
      officerRole: '',
      iconName: 'Building',
      imageUrl: ''
    });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: ContactDepartment) => {
    setEditingDept(dept);
    setDeptForm({
      nameTh: dept.nameTh,
      nameEn: dept.nameEn || '',
      phone: dept.phone || '081-462-5663',
      email: dept.email || '',
      officerName: dept.officerName || '',
      officerRole: dept.officerRole || '',
      iconName: dept.iconName || 'Building',
      imageUrl: dept.imageUrl || ''
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.nameTh.trim()) return;

    try {
      if (editingDept) {
        const updated = await api.updateContactDepartment(editingDept.id, deptForm);
        setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, ...deptForm } : d));
        if (onNotify) onNotify('อัปเดตข้อมูลฝ่ายเรียบร้อยแล้ว', 'success');
      } else {
        const created = await api.createContactDepartment(deptForm);
        setDepartments(prev => [...prev, created || { ...deptForm, id: 'dept_' + Date.now() }]);
        if (onNotify) onNotify('เพิ่มฝ่ายการติดต่อใหม่เรียบร้อยแล้ว', 'success');
      }
      setIsDeptModalOpen(false);
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการบันทึกฝ่าย: ' + (err.message || ''), 'error');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm('คุณต้องการลบฝ่ายการติดต่อนักศึกษานี้ใช่หรือไม่?')) return;
    try {
      await api.deleteContactDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      if (onNotify) onNotify('ลบฝ่ายการติดต่อเรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการลบฝ่าย: ' + (err.message || ''), 'error');
    }
  };

  const handleExportCSV = () => {
    if (messages.length === 0) return;
    const headers = ['ID', 'ชื่อ-นามสกุล', 'อีเมล', 'เบอร์โทรศัพท์', 'หัวข้อ', 'ข้อความสาระสำคัญ', 'แผนกที่ติดต่อ', 'วันที่ส่ง', 'สถานะ'];
    const rows = messages.map(m => [
      m.id,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.email.replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${m.subject.replace(/"/g, '""')}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      `"${(m.department || '').replace(/"/g, '""')}"`,
      m.createdAt,
      m.status
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contact_Messages_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMessages = messages.filter(m => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-2xl p-6 shadow-md border border-amber-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Inbox className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold text-white">ศูนย์รับข้อความ & จัดการช่องทางติดต่อเรา (Contact & Mailbox Center)</h2>
          </div>
          <p className="text-xs text-amber-100/90 font-light">
            อ่านข้อความสอบถามจากผู้เข้าชม ตอบกลับอีเมล และจัดการเพิ่ม/ลด/แก้ไข รายชื่อฝ่ายและเบอร์สายตรงที่แสดงบนหน้าเว็บ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchMessages(); fetchDepartments(); }}
            className="px-3.5 py-2 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-600 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>รีเฟรชข้อมูล</span>
          </button>

          {activeSubTab === 'inbox' && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              <span>ส่งออก CSV</span>
            </button>
          )}

          {activeSubTab === 'departments' && (
            <button
              onClick={handleOpenAddDept}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>เพิ่มฝ่าย/แผนกใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('inbox')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeSubTab === 'inbox'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-slate-800'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Mail size={16} />
          <span>กล่องข้อความสอบถาม</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeSubTab === 'departments'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-slate-800'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Building size={16} />
          <span>จัดการฝ่าย/แผนก & เบอร์สายตรง ({departments.length})</span>
        </button>
      </div>

      {/* TAB 1: INBOX MESSAGES */}
      {activeSubTab === 'inbox' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อผู้ส่ง, อีเมล, หัวข้อข้อความ..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter size={14} /> สถานะ:
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                {[
                  { id: 'all', label: `ทั้งหมด (${messages.length})` },
                  { id: 'unread', label: `ยังไม่ได้อ่าน (${unreadCount})` },
                  { id: 'read', label: `อ่านแล้ว (${messages.filter(m => m.status === 'read').length})` },
                  { id: 'replied', label: `ตอบกลับแล้ว (${messages.filter(m => m.status === 'replied').length})` }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-amber-600" />
                <p className="text-xs font-semibold">กำลังโหลดข้อความติดต่อสอบถาม...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Inbox size={32} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">ไม่พบข้อความสอบถามตรงตามเงื่อนไข</p>
                <p className="text-xs text-slate-400">ยังไม่มีผู้เข้าชมส่งข้อความสอบถาม หรือลองเปลี่ยนคำค้นหาใหม่</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">สถานะ</th>
                      <th className="py-3 px-4">ผู้ส่ง / อีเมล</th>
                      <th className="py-3 px-4">หัวข้อข้อความ</th>
                      <th className="py-3 px-4">แผนกที่ติดต่อ</th>
                      <th className="py-3 px-4">วันที่ส่ง</th>
                      <th className="py-3 px-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMessages.map((msg) => (
                      <tr
                        key={msg.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          msg.status === 'unread' ? 'bg-amber-50/40 dark:bg-amber-950/20 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          {msg.status === 'unread' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1 animate-ping"></span>
                              ยังไม่อ่าน
                            </span>
                          ) : msg.status === 'replied' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle size={10} className="mr-1 text-emerald-600" />
                              ตอบกลับแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              อ่านแล้ว
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{msg.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{msg.email}</div>
                          {msg.phone && <div className="text-[10px] text-slate-400 font-mono">📞 {msg.phone}</div>}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{msg.subject}</div>
                          <div className="text-[11px] text-slate-500 truncate font-light">{msg.message}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium">
                            {msg.department || 'ฝ่ายบริการประสานงาน'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString('th-TH') : '-'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenMessage(msg)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="เปิดอ่านข้อความและตอบกลับ"
                            >
                              <Eye size={13} />
                              <span>เปิดอ่าน / ตอบ</span>
                            </button>

                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="ลบข้อความ"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS & PERSONNEL MANAGER */}
      {activeSubTab === 'departments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Building size={16} className="text-amber-600" />
                <span>รายชื่อฝ่าย/แผนกประจำสถาบันที่แสดงบนหน้าเว็บ Contact Us</span>
              </h3>
              <p className="text-xs text-slate-500 font-light">
                เพิ่ม ลบ หรือแก้ไขชื่อฝ่าย เบอร์โทรสายตรง อีเมลประจำแผนก และเจ้าหน้าที่ผู้รับผิดชอบ เพื่อให้แสดงผลตรงกับหน้าเว็บหน้าบ้าน
              </p>
            </div>

            <button
              onClick={handleOpenAddDept}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>เพิ่มฝ่าย/แผนกใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400/60 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0 overflow-hidden border border-amber-200/50">
                      {dept.imageUrl ? (
                        <img src={dept.imageUrl} alt={dept.nameTh} className="w-full h-full object-cover" />
                      ) : (
                        <Building size={22} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sans">{dept.nameTh}</h4>
                      {dept.nameEn && <p className="text-xs text-slate-400 font-mono">{dept.nameEn}</p>}
                      {dept.officerName && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
                          👤 {dept.officerName} {dept.officerRole ? `(${dept.officerRole})` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditDept(dept)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขข้อมูลฝ่าย"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(dept.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="ลบฝ่าย"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-slate-700 dark:text-slate-300">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">เบอร์สายตรง</span>
                    <span>📞 {dept.phone}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-slate-700 dark:text-slate-300 truncate">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">อีเมลแผนก</span>
                    <span className="truncate">✉️ {dept.email || 'ยังไม่ได้ระบุ'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENT ADD/EDIT MODAL */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="text-amber-600" size={20} />
                <span>{editingDept ? 'แก้ไขข้อมูลฝ่ายการติดต่อ' : 'เพิ่มฝ่ายการติดต่อใหม่'}</span>
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ชื่อฝ่าย / แผนก (ภาษาไทย) *</label>
                <input
                  type="text"
                  value={deptForm.nameTh}
                  onChange={(e) => setDeptForm({ ...deptForm, nameTh: e.target.value })}
                  required
                  placeholder="เช่น ฝ่ายวิชาการและงานวิจัย"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ชื่อฝ่าย / แผนก (ภาษาอังกฤษ)</label>
                <input
                  type="text"
                  value={deptForm.nameEn}
                  onChange={(e) => setDeptForm({ ...deptForm, nameEn: e.target.value })}
                  placeholder="เช่น Academic & Research Division"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">เบอร์สายตรง *</label>
                  <input
                    type="text"
                    value={deptForm.phone}
                    onChange={(e) => setDeptForm({ ...deptForm, phone: e.target.value })}
                    required
                    placeholder="เช่น 056-711-450 ต่อ 101"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">อีเมลประจำแผนก</label>
                  <input
                    type="email"
                    value={deptForm.email}
                    onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })}
                    placeholder="เช่น academic@mcu-pkpm.ac.th"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">ชื่อเจ้าหน้าที่ผู้รับผิดชอบ</label>
                  <input
                    type="text"
                    value={deptForm.officerName}
                    onChange={(e) => setDeptForm({ ...deptForm, officerName: e.target.value })}
                    placeholder="เช่น ผศ.ดร.อัครเดช บุนนาค"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">ตำแหน่งเจ้าหน้าที่</label>
                  <input
                    type="text"
                    value={deptForm.officerRole}
                    onChange={(e) => setDeptForm({ ...deptForm, officerRole: e.target.value })}
                    placeholder="เช่น รองผู้อำนวยการฝ่ายวิชาการ"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Officer Avatar Image Upload & URL input */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">รูปภาพประจำตัวเจ้าหน้าที่ / รูปตราสัญลักษณ์แผนก</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/40 bg-white shrink-0 flex items-center justify-center shadow-xs">
                    {deptForm.imageUrl ? (
                      <img src={deptForm.imageUrl} alt="Officer Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-colors shadow-xs">
                        📷 อัปโหลดรูปภาพเจ้าหน้าที่
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setDeptForm({ ...deptForm, imageUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {deptForm.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setDeptForm({ ...deptForm, imageUrl: '' })}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold transition-colors"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={deptForm.imageUrl}
                      onChange={(e) => setDeptForm({ ...deptForm, imageUrl: e.target.value })}
                      placeholder="หรือวาง URL รูปภาพที่นี่ (https://...)"
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-[11px] font-mono focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  บันทึกข้อมูลฝ่าย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READ & REPLY MESSAGE MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">รายละเอียดข้อความสอบถาม</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  {selectedMessage.subject}
                </h3>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sender Info Details */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block text-[10px]">ผู้ส่งข้อความ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User size={13} className="text-amber-600" /> {selectedMessage.name}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block text-[10px]">อีเมลสำหรับตอบกลับ:</span>
                <span className="font-mono text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                  <Mail size={13} /> {selectedMessage.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block text-[10px]">เบอร์โทรศัพท์:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone size={13} /> {selectedMessage.phone || 'ไม่ระบุ'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block text-[10px]">วันที่ส่งข้อความ:</span>
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={13} /> {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString('th-TH') : '-'}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">เนื้อหาข้อความสอบถาม:</label>
              <div className="p-4 bg-amber-50/50 dark:bg-slate-800/60 rounded-2xl border border-amber-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Reply Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <form onSubmit={handleSendReply} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Send size={14} className="text-amber-600" />
                    <span>ตอบกลับอีเมลถึงผู้ส่ง ({selectedMessage.email})</span>
                  </h4>
                  {selectedMessage.status === 'replied' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ เคยตอบกลับแล้ว
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">หัวข้ออีเมลตอบกลับ</label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">เนื้อหาอีเมลตอบกลับ</label>
                  <textarea
                    rows={6}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                  />
                </div>

                {replySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <span>ส่งอีเมลตอบกลับไปยัง {selectedMessage.email} เรียบร้อยแล้ว!</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>

                  <button
                    type="submit"
                    disabled={isReplying || !replyBody.trim()}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={14} className={isReplying ? 'animate-bounce' : ''} />
                    <span>{isReplying ? 'กำลังส่งอีเมล...' : 'ส่งอีเมลตอบกลับทันที'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
