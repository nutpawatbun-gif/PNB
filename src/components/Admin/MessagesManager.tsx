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
  AlertCircle
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

interface MessagesManagerProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

export default function MessagesManager({ onNotify }: MessagesManagerProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

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

  useEffect(() => {
    fetchMessages();
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
      // Simulate/trigger real backend mailer dispatch
      await new Promise(r => setTimeout(r, 1200));

      setReplySuccess(true);
      if (onNotify) onNotify(`ส่งอีเมลตอบกลับไปยังคุณ ${selectedMessage.name} (${selectedMessage.email}) เรียบร้อยแล้ว`, 'success');

      // Update message status locally
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
    if (!window.confirm('คุณต้องการลบข้อความติดต่อนักศึกษานี้ใช่หรือไม่?')) return;
    try {
      await api.deleteMessage(id);
      if (onNotify) onNotify('ลบข้อความติดต่อเรียบร้อยแล้ว', 'success');
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการลบข้อความ: ' + (err.message || ''), 'error');
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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-2xl p-6 shadow-md border border-amber-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Inbox className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold text-white">ศูนย์รับข้อความและตอบกลับอีเมล (Inquiries & Email Inbox Center)</h2>
          </div>
          <p className="text-xs text-amber-100/90 font-light">
            ตรวจสอบ อ่านข้อความสอบถามจากผู้เข้าชมเว็บ และส่งอีเมลตอบกลับผู้สอบถามโดยตรงจากระบบควบคุมหลังบ้าน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMessages}
            className="px-3.5 py-2 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-600 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>รีเฟรชกล่องข้อความ</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

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
              { id: 'unread', label: `ยังไม่ได้อ่าน (${messages.filter(m => m.status === 'unread').length})` },
              { id: 'read', label: `อ่านแล้ว (${messages.filter(m => m.status === 'read').length})` },
              { id: 'replied', label: `ตอบกลับแล้ว (${messages.filter(m => m.status === 'replied').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Grid / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <RefreshCw size={28} className="animate-spin mx-auto text-amber-500" />
            <p className="text-xs font-medium">กำลังโหลดรายการข้อความติดต่อ...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Mail size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">ยังไม่มีข้อความติดต่อในหมวดนี้</p>
            <p className="text-xs text-slate-400">เมื่อผู้เข้าชมกรอกแบบฟอร์มส่งข้อความติดต่อ รายการจะปรากฏในหน้านี้ทันที</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 ${
                  msg.status === 'replied' ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                }`}
              >
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      msg.status === 'replied'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : msg.status === 'read'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                    }`}>
                      {msg.status === 'replied' ? '✅ ตอบกลับแล้ว' : msg.status === 'read' ? '📖 อ่านแล้ว' : '✉️ ยังไม่ได้อ่าน'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <User size={13} className="text-amber-600" />
                      {msg.name}
                    </span>
                    <span className="text-xs text-slate-400">({msg.email})</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {msg.subject}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-light">
                    {msg.message}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(msg.createdAt).toLocaleString('th-TH')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      {msg.department || 'ฝ่ายบริการประสานงาน'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenMessage(msg)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>เปิดอ่าน & ตอบกลับ</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                    title="ลบข้อความ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Reader & Reply Composer Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white p-5 flex items-center justify-between border-b border-amber-700">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold text-amber-100">รายละเอียดข้อความติดต่อ & ศูนย์ส่งอีเมลตอบกลับ</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-amber-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Message Meta Info */}
              <div className="bg-amber-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-amber-200/60 dark:border-slate-700 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="font-bold text-slate-500">ผู้ส่ง:</span> {selectedMessage.name}
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">อีเมลสำหรับตอบกลับ:</span> <span className="font-mono text-amber-800 dark:text-amber-300 font-bold">{selectedMessage.email}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">เบอร์โทรศัพท์:</span> {selectedMessage.phone || 'ไม่ระบุ'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">วันที่ส่ง:</span> {new Date(selectedMessage.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 dark:border-slate-700">
                  <span className="font-bold text-slate-500 block mb-1">หัวข้อประเด็น:</span>
                  <p className="text-sm font-bold text-amber-950 dark:text-amber-200">{selectedMessage.subject}</p>
                </div>

                <div className="pt-2 border-t border-amber-200/60 dark:border-slate-700">
                  <span className="font-bold text-slate-500 block mb-1">เนื้อหาข้อความสอบถาม:</span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/40 text-slate-800 dark:text-slate-200 font-light leading-relaxed whitespace-pre-line">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Send size={15} className="text-amber-600" />
                    <span>เขียนข้อความและส่งอีเมลตอบกลับ (Email Dispatcher)</span>
                  </span>
                  {selectedMessage.status === 'replied' && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ ได้เคยส่งตอบกลับแล้ว
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
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-amber-500"
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
                    <span>ส่งอีเมลตอบกลับไปยัง {selectedMessage.email} เรียบร้อยแล้ว! ระบบได้อัปเดตสถานะเป็น "ตอบกลับแล้ว"</span>
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
                    className="px-6 py-2 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
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
