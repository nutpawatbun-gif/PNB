import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Key, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Database, 
  Download, 
  Upload, 
  Clock, 
  Activity, 
  Layers, 
  CheckSquare, 
  Square,
  HelpCircle,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { User, RoleName, Permission, ROLE_DEFINITIONS, PERMISSION_LABELS } from '../../types';
import { api } from '../../lib/api';
import { AuditLogViewer } from './AuditLogViewer';
import { Modal } from '../ui/Modal';

interface UserManagerProps {
  currentUser?: User | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const UserManager: React.FC<UserManagerProps> = ({ currentUser, onNotify }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'matrix' | 'logs' | 'database'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [approvalRoleMap, setApprovalRoleMap] = useState<Record<string, RoleName>>({});

  const handleApproveUser = async (user: User) => {
    try {
      const assignedRole = approvalRoleMap[user.id] || user.role || 'Editor';
      await api.approveUser(user.id, assignedRole);
      if (onNotify) onNotify(`อนุมัติสิทธิ์ให้ ${user.name} (${user.email}) เป็น ${assignedRole} เรียบร้อยแล้ว`, 'success');
      fetchUsers();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'เกิดข้อผิดพลาดในการอนุมัติผู้ใช้งาน', 'error');
    }
  };

  const handleRejectUser = async (user: User) => {
    try {
      await api.rejectUser(user.id, 'Super Admin ปฏิเสธคำขอเข้าใช้งาน');
      if (onNotify) onNotify(`ปฏิเสธคำขอเข้าใช้งานของ ${user.name} เรียบร้อยแล้ว`, 'success');
      fetchUsers();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ', 'error');
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    email: '',
    department: '',
    role: 'Editor' as RoleName,
    status: 'active' as 'active' | 'inactive' | 'pending' | 'rejected',
    customPermissions: [] as Permission[]
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  // Database backup state
  const [backupJsonText, setBackupJsonText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else if (activeTab === 'database') {
      fetchDbBackupStats();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const data = await api.getAuditLogs({ search: logSearch });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (onNotify) onNotify('ไม่สามารถโหลดประวัติ Audit Logs ได้', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchDbBackupStats = async () => {
    try {
      const backup = await api.getDatabaseBackup();
      if (backup && backup.stats) {
        setDbStats(backup.stats);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      name: '',
      password: '',
      email: '',
      department: '',
      role: 'Editor',
      status: 'active',
      customPermissions: [...ROLE_DEFINITIONS['Editor'].defaultPermissions]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    const defaultPerms = ROLE_DEFINITIONS[user.role]?.defaultPermissions || [];
    const currentCustom = user.customPermissions || defaultPerms;
    setFormData({
      username: user.username,
      name: user.name,
      password: '', // leave empty unless resetting
      email: user.email,
      department: user.department || '',
      role: user.role,
      status: user.status,
      customPermissions: Array.from(new Set([...defaultPerms, ...currentCustom]))
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: RoleName) => {
    const defaults = ROLE_DEFINITIONS[newRole]?.defaultPermissions || [];
    setFormData(prev => ({
      ...prev,
      role: newRole,
      customPermissions: [...defaults]
    }));
  };

  const handleTogglePermission = (perm: Permission) => {
    setFormData(prev => {
      const exists = prev.customPermissions.includes(perm);
      if (exists) {
        return { ...prev, customPermissions: prev.customPermissions.filter(p => p !== perm) };
      } else {
        return { ...prev, customPermissions: [...prev.customPermissions, perm] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        await api.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          role: formData.role,
          status: formData.status,
          password: formData.password || undefined,
          customPermissions: formData.customPermissions
        });
        if (onNotify) onNotify(`อัปเดตข้อมูลและสิทธิ์ของ ${formData.name} เรียบร้อยแล้ว`, 'success');
      } else {
        // Create user
        await api.createUser({
          username: formData.username,
          name: formData.name,
          password: formData.password || '123456',
          email: formData.email,
          department: formData.department,
          role: formData.role,
          customPermissions: formData.customPermissions
        });
        if (onNotify) onNotify(`สร้างผู้ใช้ใหม่ ${formData.name} (${formData.role}) เรียบร้อยแล้ว`, 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'เกิดข้อผิดพลาดในการบันทึกผู้ใช้', 'error');
    }
  };

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [showRestoreDbModal, setShowRestoreDbModal] = useState<boolean>(false);

  const handleDeleteUser = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const targetUser = deleteConfirmUser;
    setDeleteConfirmUser(null);
    try {
      await api.deleteUser(targetUser.id);
      if (onNotify) onNotify(`ลบบัญชีผู้ใช้ ${targetUser.username} เรียบร้อยแล้ว`, 'success');
      fetchUsers();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'ไม่สามารถลบผู้ใช้งานได้', 'error');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const backup = await api.getDatabaseBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mcu_cms_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (onNotify) onNotify('ดาวน์โหลดไฟล์สำรองข้อมูลฐานข้อมูล (.json) เรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'เกิดข้อผิดพลาดในการดาวน์โหลดสำรองข้อมูล', 'error');
    }
  };

  const handleRestoreDatabase = () => {
    if (!backupJsonText.trim()) {
      if (onNotify) onNotify('กรุณาเลือกหรือวางโค้ด JSON ข้อมูลสำรองก่อนทำรายการ', 'error');
      return;
    }
    setShowRestoreDbModal(true);
  };

  const confirmRestoreDatabase = async () => {
    setShowRestoreDbModal(false);
    try {
      setIsRestoring(true);
      const parsed = JSON.parse(backupJsonText);
      const res = await api.restoreDatabase(parsed);
      if (onNotify) onNotify(res.message || 'ฟื้นฟูคืนค่าฐานข้อมูลสำเร็จ', 'success');
      setBackupJsonText('');
      fetchUsers();
      fetchDbBackupStats();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'ไฟล์ JSON สำรองข้อมูลไม่ถูกต้อง', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // Filtering users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const allPermissionsList: Permission[] = [
    'view', 'create', 'edit_own', 'edit_all', 'delete', 'publish', 'approve', 'export', 'manage_users', 'manage_settings'
  ];

  return (
    <div className="space-y-6" id="user_rbac_manager">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-mcu-pink h-6 w-6" />
            <h2 className="text-xl font-bold tracking-tight">ระบบ Authentication และ Role-Based Access Control (RBAC)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 font-light">
            กำหนดสิทธิ์การใช้งาน 5 บทบาทหลัก ควบคุมสิทธิ์การใช้งานแบบละเอียด (Granular Permissions) และตรวจสอบซ้ำทุก API ที่ Backend
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-xs">
          <Lock className="text-amber-400 h-4 w-4" />
          <span>บัญชีปัจจุบัน: <strong className="text-mcu-pink font-semibold">{currentUser?.name || 'Admin'}</strong> ({currentUser?.role || 'Super Admin'})</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-mcu-pink text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Users size={16} />
          <span>ผู้ใช้งานระบบ ({users.filter(u => u.status !== 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Clock size={16} />
          <span>รอการอนุมัติสิทธิ์ (@mcu.ac.th)</span>
          {users.filter(u => u.status === 'pending').length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded-full animate-pulse">
              {users.filter(u => u.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'matrix' ? 'bg-mcu-pink text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers size={16} />
          <span>ตารางบทบาทและสิทธิ์ (Role Matrix)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logs' ? 'bg-mcu-pink text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Activity size={16} />
          <span>ประวัติการใช้งาน (Audit Logs)</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'database' ? 'bg-mcu-pink text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Database size={16} />
          <span>จัดการและสำรองข้อมูล (Database & Backup)</span>
        </button>
      </div>

      {/* TAB 1: USERS & PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.keys(ROLE_DEFINITIONS) as RoleName[]).map(roleKey => {
              const count = users.filter(u => u.role === roleKey).length;
              const def = ROLE_DEFINITIONS[roleKey];
              return (
                <div 
                  key={roleKey}
                  onClick={() => setRoleFilter(roleFilter === roleKey ? 'all' : roleKey)}
                  className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                    roleFilter === roleKey ? 'border-mcu-pink ring-2 ring-mcu-pink/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${def.badgeBg}`}>
                      {def.name}
                    </span>
                    <span className="text-lg font-bold text-gray-800">{count}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 truncate">{def.labelTh}</p>
                </div>
              );
            })}
          </div>

          {/* Action Header */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาตามชื่อ, Username, อีเมล..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-mcu-pink outline-hidden"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:ring-1 focus:ring-mcu-pink outline-hidden"
              >
                <option value="all">ทุกบทบาท (All Roles)</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Author">Author</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <UserPlus size={16} />
              <span>เพิ่มผู้ใช้งานใหม่</span>
            </button>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <RefreshCw className="animate-spin h-6 w-6 mx-auto mb-2 text-mcu-pink" />
                <span className="text-xs">กำลังโหลดผู้ใช้งาน...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-light">
                ไม่พบผู้ใช้งานที่ตรงตามเงื่อนไขการค้นหา
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 whitespace-nowrap min-w-[240px]">ผู้ใช้งาน / สังกัด</th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">บทบาทหลัก</th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[200px]">สิทธิ์ที่ได้รับ (Permissions)</th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">สถานะ</th>
                      <th className="py-3 px-4 text-right whitespace-nowrap min-w-[100px]">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredUsers.map((user, idx) => {
                      const roleDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS['Viewer'];
                      const activePerms = user.permissions || user.customPermissions || roleDef.defaultPermissions;

                      return (
                        <tr key={user.id ? `${user.id}_${user.username}` : `user_${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                {user.username.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{user.name}</p>
                                <p className="text-[10px] text-gray-400 font-mono">@{user.username} • {user.email}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{user.department || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleDef.badgeBg}`}>
                              <Shield size={12} className="mr-1" />
                              {roleDef.name}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {activePerms.map(p => (
                                <span key={p} className="bg-slate-100 text-slate-700 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status === 'active' ? 'ใช้งานปกติ' : 'ปิดใช้งาน'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 text-gray-500 hover:text-mcu-pink hover:bg-pink-50 rounded-lg transition-colors"
                                title="แก้ไขสิทธิ์และข้อมูล"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.role === 'Super Admin' || user.username === 'admin' || user.id === currentUser?.id}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  user.role === 'Super Admin' || user.username === 'admin' || user.id === currentUser?.id
                                    ? 'text-gray-200 cursor-not-allowed opacity-40'
                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                                title={
                                  user.role === 'Super Admin' || user.username === 'admin'
                                    ? '🔒 ไม่อนุญาตให้ลบบัญชี Super Admin เพื่อความปลอดภัย'
                                    : user.id === currentUser?.id
                                    ? 'ไม่สามารถลบบัญชีของตนเองได้'
                                    : 'ลบผู้ใช้งาน'
                                }
                              >
                                <Trash2 size={16} />
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
        </div>
      )}

      {/* TAB: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white p-5 rounded-2xl shadow-sm space-y-1">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <Clock size={18} />
              <span>พิจารณาอนุมัติสิทธิ์และบทบาทผู้สมัครใช้งานใหม่ (Pending Registrations)</span>
            </div>
            <p className="text-xs font-light text-amber-100 leading-relaxed">
              ผู้สมัครทุกคนต้องลงทะเบียนด้วยอีเมลสถาบัน <strong className="text-white">@mcu.ac.th</strong> เท่านั้น Super Admin สามารถเลือกกำหนดบทบาท (Role) และกดอนุมัติเพื่ออนุญาตให้เข้าใช้งานได้
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            {users.filter(u => u.status === 'pending').length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <CheckCircle size={36} className="mx-auto text-emerald-500" />
                <p className="font-bold text-gray-700 text-sm">ไม่มีคำขอลงทะเบียนที่รอการอนุมัติ</p>
                <p className="text-xs text-gray-400">เมื่อมีบุคลากรใช้อีเมล @mcu.ac.th สมัครสมาชิก รายการจะแสดงที่นี่เพื่อรอการพิจารณา</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">ผู้ขอสมัคร / อีเมลสถาบัน</th>
                      <th className="py-3 px-4">หน่วยงาน / สังกัด</th>
                      <th className="py-3 px-4">สิทธิ์ที่ระบุขอ</th>
                      <th className="py-3 px-4">เลือกสิทธิ์ที่จะมอบให้</th>
                      <th className="py-3 px-4 text-right">การอนุมัติ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {users.filter(u => u.status === 'pending').map((user) => {
                      const selectedRole = approvalRoleMap[user.id] || user.role || 'Editor';

                      return (
                        <tr key={user.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-9 w-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 shadow-xs">
                                {user.name.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{user.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="bg-amber-100 text-amber-900 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200">
                                    📧 {user.email}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  สมัครเมื่อ: {user.createdAt ? new Date(user.createdAt).toLocaleString('th-TH') : 'ไม่ระบุ'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-gray-800">
                            {user.department || 'วิทยาลัยสงฆ์พ่อขุนผาเมือง'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              <Shield size={11} className="mr-1 text-slate-500" />
                              {user.requestedRole || user.role || 'Editor'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={selectedRole}
                              onChange={(e) => setApprovalRoleMap({ ...approvalRoleMap, [user.id]: e.target.value as RoleName })}
                              className="px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 focus:ring-1 focus:ring-amber-500 outline-hidden"
                            >
                              <option value="Super Admin">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                              <option value="Admin">Admin (ผู้ดูแลระบบ)</option>
                              <option value="Editor">Editor (บรรณาธิการข่าว/เนื้อหา)</option>
                              <option value="Author">Author (ผู้เขียนบทความ/ประชาสัมพันธ์)</option>
                              <option value="Viewer">Viewer (ผู้เข้าชมระบบหลังบ้าน)</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApproveUser(user)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                              >
                                <CheckCircle size={14} />
                                <span>อนุมัติ (Approve)</span>
                              </button>
                              <button
                                onClick={() => handleRejectUser(user)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                              >
                                <X size={14} />
                                <span>ปฏิเสธ (Reject)</span>
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
        </div>
      )}

      {/* TAB 2: ROLE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center space-x-2">
              <Layers className="text-mcu-pink" size={18} />
              <span>ตารางเปรียบเทียบสิทธิ์ตามบทบาท (Role-Based Permissions Matrix)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              ระบบสิทธิ์การใช้งานของวิทยาลัย แบ่งเป็น 5 บทบาทหลักโดยสมบูรณ์ และมีระบบตรวจสอบสิทธิ์แบบละเอียด (Granular Enforcement) ทั้งใน Frontend และ Backend
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="p-3 rounded-tl-lg">สิทธิ์การทำงาน (Permission)</th>
                    {(Object.keys(ROLE_DEFINITIONS) as RoleName[]).map(roleKey => (
                      <th key={roleKey} className="p-3 text-center">
                        <div>{roleKey}</div>
                        <div className="text-[10px] font-normal text-slate-400">{ROLE_DEFINITIONS[roleKey].labelTh}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allPermissionsList.map(perm => {
                    const info = PERMISSION_LABELS[perm];
                    return (
                      <tr key={perm} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-gray-900">{info.labelTh}</p>
                          <p className="text-[10px] text-gray-400">{info.descriptionTh}</p>
                        </td>
                        {(Object.keys(ROLE_DEFINITIONS) as RoleName[]).map(roleKey => {
                          const hasPerm = ROLE_DEFINITIONS[roleKey].defaultPermissions.includes(perm);
                          return (
                            <td key={roleKey} className="p-3 text-center">
                              {hasPerm ? (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-300">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Explanations Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(ROLE_DEFINITIONS) as RoleName[]).map(roleKey => {
              const def = ROLE_DEFINITIONS[roleKey];
              return (
                <div key={roleKey} className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${def.badgeBg}`}>
                      {def.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{def.defaultPermissions.length} สิทธิ์</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{def.labelTh}</h4>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">{def.descriptionTh}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <AuditLogViewer onToast={onNotify} />
      )}

      {/* TAB 4: DATABASE & BACKUP */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Download Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 text-mcu-pink-deep">
              <Database size={24} />
              <h3 className="text-base font-bold">สำรองข้อมูลฐานข้อมูล (Export Backup)</h3>
            </div>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              ส่งออกและดาวน์โหลดข้อมูลทั้งหมดของเว็บไซต์ในรูปแบบไฟล์มาตรฐาน JSON เพื่อนำไปสำรองข้อมูลหรือย้ายไประบบอื่น
            </p>

            {dbStats && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-400">ผู้ใช้งาน:</span> <strong className="text-gray-800">{dbStats.usersCount}</strong></div>
                <div><span className="text-gray-400">ข่าวสาร:</span> <strong className="text-gray-800">{dbStats.newsCount}</strong></div>
                <div><span className="text-gray-400">ประกาศ:</span> <strong className="text-gray-800">{dbStats.announcementsCount}</strong></div>
                <div><span className="text-gray-400">หลักสูตร:</span> <strong className="text-gray-800">{dbStats.coursesCount}</strong></div>
              </div>
            )}

            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center space-x-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Download size={16} />
              <span>ดาวน์โหลดไฟล์สำรองข้อมูล (.json)</span>
            </button>
          </div>

          {/* Restore Backup Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 text-purple-700">
              <Upload size={24} />
              <h3 className="text-base font-bold">ฟื้นฟูคืนค่าฐานข้อมูล (Restore Backup)</h3>
            </div>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              วางโค้ด JSON ข้อมูลสำรองเพื่อกู้คืนฐานข้อมูลเดิม (เฉพาะ Super Admin เท่านั้น)
            </p>

            <textarea
              rows={4}
              value={backupJsonText}
              onChange={(e) => setBackupJsonText(e.target.value)}
              placeholder="วางโครงสร้างไฟล์ JSON สำรองข้อมูลที่นี่..."
              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-purple-500 outline-hidden"
            />

            <button
              onClick={handleRestoreDatabase}
              disabled={isRestoring || !backupJsonText.trim()}
              className="w-full flex items-center justify-center space-x-2 bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRestoring ? 'animate-spin' : ''} />
              <span>{isRestoring ? 'กำลังฟื้นฟูคืนค่า...' : 'ฟื้นฟูคืนค่าฐานข้อมูล'}</span>
            </button>
          </div>
        </div>
      )}

      {/* USER MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2 text-mcu-pink-deep">
                <ShieldCheck size={22} />
                <h3 className="text-base font-bold">
                  {editingUser ? `แก้ไขผู้ใช้งาน: ${editingUser.name}` : 'เพิ่มผู้ใช้งานใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ชื่อผู้ใช้งาน (Username) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="เช่น surasak"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-mcu-pink outline-hidden disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น ดร.สุรศักดิ์ ใจดี"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-mcu-pink outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    อีเมล (Email)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@mcu.ac.th"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-mcu-pink outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    หน่วยงาน / สังกัด
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="เช่น สำนักวิชาการ"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-mcu-pink outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    รหัสผ่าน {editingUser ? '(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)' : '<span className="text-red-500">*</span>'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-mcu-pink outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    บทบาทหลัก (Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as RoleName)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-mcu-pink outline-hidden bg-white"
                  >
                    <option value="Super Admin">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                    <option value="Admin">Admin (ผู้ดูแลระบบ)</option>
                    <option value="Editor">Editor (บรรณาธิการ)</option>
                    <option value="Author">Author (ผู้เขียนเนื้อหา)</option>
                    <option value="Viewer">Viewer (ผู้เข้าชมหลังบ้าน)</option>
                  </select>
                </div>
              </div>

              {/* Granular Custom Permissions Checkboxes */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-gray-800 text-xs">
                    กำหนดสิทธิ์ใช้งานแบบละเอียดเฉพาะบุคคล (Granular Permissions)
                  </label>
                  <span className="text-[10px] text-mcu-pink font-semibold">
                    เลือกสิทธิ์ย่อยเพิ่มเติมจากบทบาทหลัก
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                  {allPermissionsList.map(perm => {
                    const isChecked = formData.customPermissions.includes(perm);
                    const labelInfo = PERMISSION_LABELS[perm];
                    return (
                      <label 
                        key={perm} 
                        className={`flex items-start space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-white border border-mcu-pink/30 shadow-2xs' : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm)}
                          className="mt-0.5 rounded text-mcu-pink focus:ring-mcu-pink"
                        />
                        <div>
                          <p className="font-bold text-gray-800 text-[11px]">{labelInfo.labelTh}</p>
                          <p className="text-[10px] text-gray-500 font-light">{labelInfo.descriptionTh}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  บันทึกข้อมูลและสิทธิ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (USER ACCOUNT) */}
      {deleteConfirmUser && (
        <Modal
          isOpen={!!deleteConfirmUser}
          onClose={() => setDeleteConfirmUser(null)}
          title="ยืนยันการลบบัญชีผู้ใช้งาน"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบบัญชี</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้งานท่านนี้ออกจากระบบ CMS?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmUser.name}" ({deleteConfirmUser.username})
            </div>
          </div>
        </Modal>
      )}

      {/* RESTORE DATABASE CONFIRMATION MODAL */}
      {showRestoreDbModal && (
        <Modal
          isOpen={showRestoreDbModal}
          onClose={() => setShowRestoreDbModal(false)}
          title="ยืนยันการฟื้นฟูคืนค่าฐานข้อมูล"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setShowRestoreDbModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmRestoreDatabase}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Database className="w-4 h-4" />
                <span>ยืนยันฟื้นฟูคืนค่า</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คำเตือน: การฟื้นฟูคืนค่าฐานข้อมูลจะทดแทนข้อมูลปัจจุบันทั้งหมดด้วยไฟล์ JSON สำรองข้อมูล คุณแน่ใจหรือไม่?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "ฟื้นฟูคืนค่าฐานข้อมูลจากไฟล์สำรอง"
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default UserManager;
