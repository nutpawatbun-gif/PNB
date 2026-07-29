/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LucideIcon from '../LucideIcon';
import { StaffMember, StaffEducation, StaffAcademicWorkItem, PersonnelStatus } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';

const STATUS_LABELS: Record<PersonnelStatus, { label: string; color: string }> = {
  active: { label: 'ปฏิบัติงานอยู่', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  on_leave: { label: 'ลาศึกษาต่อ / ดูงาน', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  transferred: { label: 'ย้ายสังกัด', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  retired: { label: 'เกษียณอายุ', color: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700' }
};

const WORKGROUP_OPTIONS = [
  'กลุ่มงานบริหาร',
  'กลุ่มงานวิชาการ',
  'งานทะเบียนและวัดผล',
  'งานพัสดุและอาคารสถานที่',
  'งานกิจการนิสิตและสารสนเทศ',
  'งานแผนและประกันคุณภาพ'
];

const DEGREE_LEVEL_OPTIONS = ['ปริญญาเอก', 'ปริญญาโท', 'ปริญญาตรี', 'อนุปริญญา', 'เปรียญธรรม', 'มัธยมศึกษา/อื่นๆ'];

const WORK_CATEGORY_OPTIONS: { key: StaffAcademicWorkItem['category']; label: string }[] = [
  { key: 'research', label: 'งานวิจัย' },
  { key: 'article', label: 'บทความวิชาการ/วิจัย' },
  { key: 'book', label: 'หนังสือ' },
  { key: 'textbook', label: 'ตำรา' },
  { key: 'teaching_material', label: 'เอกสารประกอบการสอน' }
];

export default function PersonnelManager() {
  const [personnelList, setPersonnelList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'education' | 'expertise' | 'academicWorks'>('info');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    prefixTh: 'นาย',
    firstNameTh: '',
    lastNameTh: '',
    prefixEn: 'Mr.',
    firstNameEn: '',
    lastNameEn: '',
    position: 'อาจารย์ประจำหลักสูตร',
    academicPosition: 'อาจารย์',
    department: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
    workgroup: 'กลุ่มงานวิชาการ',
    phone: '',
    email: '',
    avatarUrl: '',
    sortOrder: 1,
    status: 'active',
    profileSlug: '',
    expertise: [],
    educationHistory: [],
    academicWorks: []
  });

  // Temporary inputs for repeaters
  const [newExpertiseInput, setNewExpertiseInput] = useState<string>('');
  
  // Edu form state
  const [newEdu, setNewEdu] = useState<StaffEducation>({
    degreeLevel: 'ปริญญาเอก',
    degreeName: '',
    major: '',
    institution: '',
    yearGraduated: ''
  });

  // Academic Work form state
  const [newWork, setNewWork] = useState<StaffAcademicWorkItem>({
    category: 'research',
    titleTh: '',
    titleEn: '',
    year: String(new Date().getFullYear() + 543),
    publisherOrSource: '',
    isbnOrDoi: '',
    url: '',
    description: ''
  });

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const data = await api.getPersonnel();
      setPersonnelList(data || []);
    } catch (err) {
      console.error('Error loading personnel:', err);
      showNotification('error', 'ไม่สามารถโหลดข้อมูลบุคลากรได้');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      prefixTh: 'นาย',
      firstNameTh: '',
      lastNameTh: '',
      prefixEn: 'Mr.',
      firstNameEn: '',
      lastNameEn: '',
      position: 'อาจารย์ประจำหลักสูตร',
      academicPosition: 'อาจารย์',
      department: 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
      workgroup: 'กลุ่มงานวิชาการ',
      phone: '',
      email: '',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      sortOrder: personnelList.length + 1,
      status: 'active',
      profileSlug: '',
      expertise: ['การสอนและวิจัย'],
      educationHistory: [],
      academicWorks: []
    });
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StaffMember) => {
    setEditingItem(item);
    setFormData({
      ...item,
      expertise: item.expertise || [],
      educationHistory: item.educationHistory || [],
      academicWorks: item.academicWorks || []
    });
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: PersonnelStatus) => {
    // Optimistic UI update
    setPersonnelList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    showNotification('success', 'ปรับเปลี่ยนสถานะการทำงานของบุคลากรเรียบร้อยแล้ว');

    try {
      await api.updatePersonnelStatus(id, newStatus);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const [deleteConfirmPersonnel, setDeleteConfirmPersonnel] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmPersonnel({ id, name });
  };

  const confirmDeletePersonnel = async () => {
    if (!deleteConfirmPersonnel) return;
    const { id, name } = deleteConfirmPersonnel;
    setDeleteConfirmPersonnel(null);

    // Immediately remove from UI state
    setPersonnelList(prev => prev.filter(item => item.id !== id && item.profileSlug !== id));
    showNotification('success', `ลบข้อมูล ${name} เรียบร้อยแล้ว`);

    try {
      await api.deletePersonnel(id);
    } catch (err: any) {
      console.error('Error deleting personnel:', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstNameTh) {
      showNotification('error', 'กรุณาระบุชื่อภาษาไทย');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await api.updatePersonnel(editingItem.id, formData);
        showNotification('success', 'ปรับปรุงข้อมูลบุคลากรเรียบร้อยแล้ว');
      } else {
        await api.createPersonnel(formData);
        showNotification('success', 'เพิ่มบุคลากรใหม่เรียบร้อยแล้ว');
      }
      setIsModalOpen(false);
      fetchPersonnel();
    } catch (err: any) {
      showNotification('error', err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSubmitting(false);
    }
  };

  // Expertise Tag Helpers
  const handleAddExpertise = () => {
    if (!newExpertiseInput.trim()) return;
    const updated = [...(formData.expertise || []), newExpertiseInput.trim()];
    setFormData({ ...formData, expertise: updated });
    setNewExpertiseInput('');
  };

  const handleRemoveExpertise = (index: number) => {
    const updated = (formData.expertise || []).filter((_, i) => i !== index);
    setFormData({ ...formData, expertise: updated });
  };

  // Education Helpers
  const handleAddEducation = () => {
    if (!newEdu.degreeName || !newEdu.institution) {
      alert('กรุณากรอกชื่อวุฒิการศึกษา และชื่อสถาบัน');
      return;
    }
    const item: StaffEducation = {
      ...newEdu,
      id: 'edu_' + Date.now()
    };
    setFormData({
      ...formData,
      educationHistory: [...(formData.educationHistory || []), item]
    });
    setNewEdu({
      degreeLevel: 'ปริญญาเอก',
      degreeName: '',
      major: '',
      institution: '',
      yearGraduated: ''
    });
  };

  const handleRemoveEducation = (index: number) => {
    const updated = (formData.educationHistory || []).filter((_, i) => i !== index);
    setFormData({ ...formData, educationHistory: updated });
  };

  // Academic Work Helpers
  const handleAddAcademicWork = () => {
    if (!newWork.titleTh) {
      alert('กรุณากรอกชื่อผลงานวิชาการ');
      return;
    }
    const item: StaffAcademicWorkItem = {
      ...newWork,
      id: 'pw_' + Date.now()
    };
    setFormData({
      ...formData,
      academicWorks: [...(formData.academicWorks || []), item]
    });
    setNewWork({
      category: 'research',
      titleTh: '',
      titleEn: '',
      year: String(new Date().getFullYear() + 543),
      publisherOrSource: '',
      isbnOrDoi: '',
      url: '',
      description: ''
    });
  };

  const handleRemoveAcademicWork = (index: number) => {
    const updated = (formData.academicWorks || []).filter((_, i) => i !== index);
    setFormData({ ...formData, academicWorks: updated });
  };

  // Move Sort Order
  const handleReorder = async (item: StaffMember, direction: 'up' | 'down') => {
    const sorted = [...personnelList].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((p) => p.id === item.id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetItem = sorted[targetIndex];
    const tempOrder = item.sortOrder;

    try {
      await api.updatePersonnel(item.id, { sortOrder: targetItem.sortOrder });
      await api.updatePersonnel(targetItem.id, { sortOrder: tempOrder });
      fetchPersonnel();
    } catch (err) {
      showNotification('error', 'ไม่สามารถเปลี่ยนลำดับได้');
    }
  };

  // Filter List
  const filteredList = personnelList.filter((item) => {
    const nameMatch = `${item.prefixTh} ${item.firstNameTh} ${item.lastNameTh} ${item.firstNameEn} ${item.lastNameEn} ${item.position} ${item.academicPosition}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const groupMatch = selectedGroup === 'all' || item.workgroup === selectedGroup;
    const statusMatch = selectedStatusFilter === 'all' || item.status === selectedStatusFilter;
    return nameMatch && groupMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          <LucideIcon name={notification.type === 'success' ? 'CheckCircle2' : 'AlertTriangle'} className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{notification.message}</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <LucideIcon name="Users" className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            ระบบจัดการบุคลากร (Personnel Management)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            จัดการข้อมูลผู้บริหาร อาจารย์ และเจ้าหน้าที่ ประวัติการศึกษา และผลงานวิชาการ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition shadow-md hover:shadow-amber-600/20 active:scale-95"
        >
          <LucideIcon name="UserPlus" className="w-4 h-4" />
          เพิ่มบุคลากรใหม่
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative">
          <LucideIcon name="Search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ตำแหน่ง, ความเชี่ยวชาญ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">ทุกกลุ่มงาน/ฝ่าย</option>
            {WORKGROUP_OPTIONS.map((wg) => (
              <option key={wg} value={wg}>
                {wg}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">ทุกสถานะการทำงาน</option>
            <option value="active">ปฏิบัติงานอยู่</option>
            <option value="on_leave">ลาศึกษาต่อ/ดูงาน</option>
            <option value="transferred">ย้ายสังกัด</option>
            <option value="retired">เกษียณอายุ</option>
          </select>
        </div>
      </div>

      {/* Personnel Table / Cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <LucideIcon name="Loader2" className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-600" />
            <p>กำลังโหลดข้อมูลบุคลากร...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <LucideIcon name="UserX" className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="font-medium text-base text-zinc-700 dark:text-zinc-300">ไม่พบรายการบุคลากร</p>
            <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มบุคลากรใหม่"</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-sm min-w-[850px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4 text-center w-12 whitespace-nowrap">ลำดับ</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[220px]">บุคลากร</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[180px]">ตำแหน่งบริหาร/วิชาการ</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">กลุ่มงาน / สังกัด</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">การติดต่อ</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[130px]">ผลงาน/การศึกษา</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[110px]">สถานะ</th>
                  <th className="py-3.5 px-4 text-right pr-6 whitespace-nowrap min-w-[100px]">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredList.map((item, idx) => {
                  const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.active;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition-colors group"
                    >
                      {/* Order Control */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-semibold text-xs text-zinc-500 dark:text-zinc-400">{item.sortOrder}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleReorder(item, 'up')}
                              disabled={idx === 0}
                              title="ขยับขึ้น"
                              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30"
                            >
                              <LucideIcon name="ChevronUp" className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReorder(item, 'down')}
                              disabled={idx === filteredList.length - 1}
                              title="ขยับลง"
                              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30"
                            >
                              <LucideIcon name="ChevronDown" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Staff Identity */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                            alt={item.firstNameTh}
                            className="w-11 h-11 rounded-full object-cover border border-amber-500/30 shadow-sm flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                              {item.prefixTh} {item.firstNameTh} {item.lastNameTh}
                            </div>
                            {(item.firstNameEn || item.lastNameEn) && (
                              <div className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                                {item.prefixEn} {item.firstNameEn} {item.lastNameEn}
                              </div>
                            )}
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                              Slug: /{item.profileSlug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Positions */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{item.position}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          วิชาการ: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.academicPosition}</span>
                        </div>
                      </td>

                      {/* Department / Workgroup */}
                      <td className="py-4 px-4">
                        <div className="text-zinc-800 dark:text-zinc-200 font-medium">{item.workgroup}</div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]" title={item.department}>
                          {item.department}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 text-xs space-y-1">
                        {item.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                            <LucideIcon name="Phone" className="w-3.5 h-3.5 text-amber-500" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                        {item.email && (
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                            <LucideIcon name="Mail" className="w-3.5 h-3.5 text-blue-500" />
                            <span className="truncate max-w-[140px]" title={item.email}>{item.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Counts */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col gap-1 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                            วุฒิการศึกษา ({item.educationHistory?.length || 0})
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                            ผลงาน ({item.academicWorks?.length || 0})
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as PersonnelStatus)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs transition-all ${statusInfo.color}`}
                        >
                          <option value="active">ปฏิบัติงานอยู่</option>
                          <option value="on_leave">ลาศึกษาต่อ / ดูงาน</option>
                          <option value="transferred">ย้ายสังกัด</option>
                          <option value="retired">เกษียณอายุ</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="แก้ไขข้อมูล"
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/40 dark:hover:text-amber-300 text-zinc-600 dark:text-zinc-300 transition"
                          >
                            <LucideIcon name="Edit3" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, `${item.prefixTh} ${item.firstNameTh} ${item.lastNameTh}`)}
                            title="ลบข้อมูล"
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/40 dark:hover:text-rose-300 text-zinc-600 dark:text-zinc-300 transition"
                          >
                            <LucideIcon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT PERSONNEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <LucideIcon name={editingItem ? 'UserCheck' : 'UserPlus'} className="w-5 h-5" />
                  {editingItem ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}
                </h3>
                <p className="text-xs text-amber-100 mt-1">
                  กรอกข้อมูลบุคลากร ประวัติการศึกษา และผลงานวิชาการเพื่อแสดงในเว็บไซต์
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition"
              >
                <LucideIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-6 gap-2 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'info'
                    ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="User" className="w-4 h-4" />
                1. ข้อมูลส่วนตัว & ตำแหน่ง
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('education')}
                className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'education'
                    ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="GraduationCap" className="w-4 h-4" />
                2. ประวัติการศึกษา ({(formData.educationHistory || []).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('expertise')}
                className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'expertise'
                    ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="Award" className="w-4 h-4" />
                3. ความเชี่ยวชาญ ({(formData.expertise || []).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('academicWorks')}
                className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'academicWorks'
                    ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                <LucideIcon name="BookOpen" className="w-4 h-4" />
                4. ผลงานวิชาการ ({(formData.academicWorks || []).length})
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: PERSONAL & POSITION INFO */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Thai Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        คำนำหน้าชื่อ (ภาษาไทย) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น พระครูศรีพัชโรทัย, ดร. / ผศ.ดร. / นาย"
                        value={formData.prefixTh || ''}
                        onChange={(e) => setFormData({ ...formData, prefixTh: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        ชื่อ (ภาษาไทย) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ชื่อ"
                        value={formData.firstNameTh || ''}
                        onChange={(e) => setFormData({ ...formData, firstNameTh: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        นามสกุล (ภาษาไทย)
                      </label>
                      <input
                        type="text"
                        placeholder="นามสกุล"
                        value={formData.lastNameTh || ''}
                        onChange={(e) => setFormData({ ...formData, lastNameTh: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* English Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        คำนำหน้าชื่อ (English)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Phrakru / Asst. Prof. Dr. / Mr."
                        value={formData.prefixEn || ''}
                        onChange={(e) => setFormData({ ...formData, prefixEn: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        First Name (English)
                      </label>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.firstNameEn || ''}
                        onChange={(e) => setFormData({ ...formData, firstNameEn: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Last Name (English)
                      </label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastNameEn || ''}
                        onChange={(e) => setFormData({ ...formData, lastNameEn: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Position & Workgroup */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        ตำแหน่งบริหาร
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ผู้อำนวยการวิทยาลัย / หัวหน้ากลุ่มงานวิชาการ"
                        value={formData.position || ''}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        ตำแหน่งทางวิชาการ
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น อาจารย์ / ผู้ช่วยศาสตราจารย์ / รองศาสตราจารย์"
                        value={formData.academicPosition || ''}
                        onChange={(e) => setFormData({ ...formData, academicPosition: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        กลุ่มงาน / ฝ่าย *
                      </label>
                      <select
                        value={formData.workgroup || 'กลุ่มงานวิชาการ'}
                        onChange={(e) => setFormData({ ...formData, workgroup: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      >
                        {WORKGROUP_OPTIONS.map((wg) => (
                          <option key={wg} value={wg}>
                            {wg}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        หน่วยงาน / สังกัด
                      </label>
                      <input
                        type="text"
                        value={formData.department || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์'}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 081-462-5663"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        อีเมลองค์กร (Email)
                      </label>
                      <input
                        type="email"
                        placeholder="เช่น name.sur@mcu.ac.th"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Avatar URL & Profile Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        URL รูปประจำตัว (Avatar Image)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={formData.avatarUrl || ''}
                          onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                          className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                        />
                        {formData.avatarUrl && (
                          <img
                            src={formData.avatarUrl}
                            alt="Avatar preview"
                            className="w-9 h-9 rounded-full object-cover border border-amber-500 flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        URL โปรไฟล์เฉพาะบุคคล (Profile Slug)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">/personnel/</span>
                        <input
                          type="text"
                          placeholder="akkharadet-bunnag"
                          value={formData.profileSlug || ''}
                          onChange={(e) => setFormData({ ...formData, profileSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          className="w-full pl-24 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        ปล่อยว่างไว้ได้ ระบบจะสร้าง Slug จากชื่อและนามสกุลโดยอัตโนมัติ
                      </p>
                    </div>
                  </div>

                  {/* Status & Display Order */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        สถานะการปฏิบัติงาน
                      </label>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as PersonnelStatus })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      >
                        <option value="active">ปฏิบัติงานอยู่ (Active)</option>
                        <option value="on_leave">ลาศึกษาต่อ / ดูงาน (On Leave)</option>
                        <option value="transferred">ย้ายสังกัด (Transferred)</option>
                        <option value="retired">เกษียณอายุ (Retired)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        ลำดับการแสดงผล (Sort Order)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.sortOrder ?? 1}
                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EDUCATION HISTORY */}
              {activeTab === 'education' && (
                <div className="space-y-6">
                  {/* Edu Form Adder */}
                  <div className="p-4 bg-amber-50/60 dark:bg-zinc-800/80 rounded-xl border border-amber-200 dark:border-zinc-700 space-y-4">
                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <LucideIcon name="PlusCircle" className="w-4 h-4 text-amber-600" />
                      เพิ่มวุฒิการศึกษา
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">ระดับวุฒิ</label>
                        <select
                          value={newEdu.degreeLevel}
                          onChange={(e) => setNewEdu({ ...newEdu, degreeLevel: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        >
                          {DEGREE_LEVEL_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">ชื่อวุฒิการศึกษา *</label>
                        <input
                          type="text"
                          placeholder="เช่น พุทธศาสตรดุษฎีบัณฑิต (พธ.ด.)"
                          value={newEdu.degreeName}
                          onChange={(e) => setNewEdu({ ...newEdu, degreeName: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">สาขาวิชา / วิชาเอก</label>
                        <input
                          type="text"
                          placeholder="เช่น สาขาวิชาพระพุทธศาสนา"
                          value={newEdu.major}
                          onChange={(e) => setNewEdu({ ...newEdu, major: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">สถาบันการศึกษา *</label>
                        <input
                          type="text"
                          placeholder="เช่น มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                          value={newEdu.institution}
                          onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">ปี พ.ศ. ที่สำเร็จ</label>
                          <input
                            type="text"
                            placeholder="เช่น 2562"
                            value={newEdu.yearGraduated || ''}
                            onChange={(e) => setNewEdu({ ...newEdu, yearGraduated: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddEducation}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition h-[38px] mt-auto flex items-center justify-center gap-1 flex-shrink-0"
                        >
                          <LucideIcon name="Plus" className="w-4 h-4" />
                          เพิ่มรายการ
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Edu History */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      รายการประวัติการศึกษา ({ (formData.educationHistory || []).length })
                    </h5>
                    {(formData.educationHistory || []).length === 0 ? (
                      <p className="text-sm text-zinc-400 italic text-center py-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                        ยังไม่มีรายการประวัติการศึกษา สามารถกรอกข้อมูลด้านบนแล้วกด "เพิ่มรายการ"
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(formData.educationHistory || []).map((edu, idx) => (
                          <div
                            key={edu.id || idx}
                            className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                                <LucideIcon name="GraduationCap" className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                  {edu.degreeName} <span className="text-xs text-amber-600 font-normal">({edu.degreeLevel})</span>
                                </div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                                  {edu.major && <span>สาขา: {edu.major} • </span>}
                                  {edu.institution} {edu.yearGraduated && `(พ.ศ. ${edu.yearGraduated})`}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEducation(idx)}
                              className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="ลบ"
                            >
                              <LucideIcon name="Trash2" className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: EXPERTISE */}
              {activeTab === 'expertise' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      ความเชี่ยวชาญ / สาขาความสนใจ
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="กรอกความเชี่ยวชาญ เช่น ปรัชญาพระพุทธศาสนา, การบริหารการศึกษา..."
                        value={newExpertiseInput}
                        onChange={(e) => setNewExpertiseInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddExpertise();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddExpertise}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition"
                      >
                        เพิ่มแท็ก
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-3">
                      รายการความเชี่ยวชาญ ({(formData.expertise || []).length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(formData.expertise || []).map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 text-xs font-medium border border-amber-300 dark:border-amber-800"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveExpertise(idx)}
                            className="hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full p-0.5"
                          >
                            <LucideIcon name="X" className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ACADEMIC WORKS */}
              {activeTab === 'academicWorks' && (
                <div className="space-y-6">
                  {/* Academic Work Adder */}
                  <div className="p-4 bg-purple-50/60 dark:bg-zinc-800/80 rounded-xl border border-purple-200 dark:border-zinc-700 space-y-4">
                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <LucideIcon name="PlusCircle" className="w-4 h-4 text-purple-600" />
                      เพิ่มผลงานวิชาการ
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">ประเภทผลงาน *</label>
                        <select
                          value={newWork.category}
                          onChange={(e) => setNewWork({ ...newWork, category: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium"
                        >
                          {WORK_CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">ชื่อผลงาน (ภาษาไทย) *</label>
                        <input
                          type="text"
                          placeholder="ชื่อผลงานวิจัย / บทความ / หนังสือ / ตำรา / เอกสาร"
                          value={newWork.titleTh}
                          onChange={(e) => setNewWork({ ...newWork, titleTh: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">ปี พ.ศ. เผยแพร่</label>
                        <input
                          type="text"
                          placeholder="เช่น 2567"
                          value={newWork.year}
                          onChange={(e) => setNewWork({ ...newWork, year: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">สำนักพิมพ์ / วารสาร / แหล่งทุน / รหัสวิชา</label>
                        <input
                          type="text"
                          placeholder="เช่น วารสาร มจร พุทธปัญญาปริทรรศน์"
                          value={newWork.publisherOrSource || ''}
                          onChange={(e) => setNewWork({ ...newWork, publisherOrSource: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">ISBN / DOI / ISSN</label>
                        <input
                          type="text"
                          placeholder="เช่น DOI: 10.1234/..."
                          value={newWork.isbnOrDoi || ''}
                          onChange={(e) => setNewWork({ ...newWork, isbnOrDoi: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">ลิงก์แนบ / ดาวน์โหลด (URL)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={newWork.url || ''}
                          onChange={(e) => setNewWork({ ...newWork, url: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAcademicWork}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-lg transition h-[38px] flex items-center justify-center gap-1"
                      >
                        <LucideIcon name="Plus" className="w-4 h-4" />
                        บันทึกผลงาน
                      </button>
                    </div>
                  </div>

                  {/* List of Academic Works */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      รายการผลงานวิชาการทั้งหมด ({(formData.academicWorks || []).length})
                    </h5>

                    {(formData.academicWorks || []).length === 0 ? (
                      <p className="text-sm text-zinc-400 italic text-center py-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                        ยังไม่มีรายการผลงานวิชาการ
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(formData.academicWorks || []).map((work, idx) => {
                          const catObj = WORK_CATEGORY_OPTIONS.find((c) => c.key === work.category) || WORK_CATEGORY_OPTIONS[0];
                          return (
                            <div
                              key={work.id || idx}
                              className="flex items-start justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                    {catObj.label}
                                  </span>
                                  <span className="text-xs font-semibold text-zinc-500">พ.ศ. {work.year}</span>
                                </div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{work.titleTh}</div>
                                {work.publisherOrSource && (
                                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                    เผยแพร่ที่: {work.publisherOrSource} {work.isbnOrDoi && `• ${work.isbnOrDoi}`}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAcademicWork(idx)}
                                className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              >
                                <LucideIcon name="Trash2" className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <LucideIcon name="Loader2" className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'บันทึกการแก้ไข' : 'บันทึกการเพิ่มบุคลากร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmPersonnel && (
        <Modal
          isOpen={!!deleteConfirmPersonnel}
          onClose={() => setDeleteConfirmPersonnel(null)}
          title="ยืนยันการลบข้อมูลบุคลากร"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmPersonnel(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeletePersonnel}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <LucideIcon name="Trash2" className="w-4 h-4" />
                <span>ยืนยันการลบบุคลากร</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลบุคลากรท่านนี้ออกจากระบบ? ข้อมูลประวัติการศึกษาและผลงานวิชาการจะถูกถอดออกทันที
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmPersonnel.name}"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
