/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Save, 
  X, 
  ListOrdered,
  Layout,
  Menu as MenuIcon
} from 'lucide-react';

interface Menu {
  id: string;
  labelTh: string;
  labelEn: string;
  url: string;
  target: '_self' | '_blank';
  isVisible: boolean;
  order: number;
  icon: string;
  submenus?: Submenu[];
}

interface Submenu {
  id: string;
  labelTh: string;
  labelEn: string;
  url: string;
}

export default function MenuManager() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Form states
  const [labelTh, setLabelTh] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<'_self' | '_blank'>('_self');
  const [isVisible, setIsVisible] = useState(true);
  const [icon, setIcon] = useState('Home');
  const [submenusInput, setSubmenusInput] = useState<Submenu[]>([]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await api.getMenus();
      // Sort by order asc
      const sorted = data.sort((a: any, b: any) => a.order - b.order);
      setMenus(sorted);
    } catch (e) {
      console.error('Error fetching menus:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingMenu(null);
    setLabelTh('');
    setLabelEn('');
    setUrl('');
    setTarget('_self');
    setIsVisible(true);
    setIcon('Home');
    setSubmenusInput([]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (menu: Menu) => {
    setEditingMenu(menu);
    setLabelTh(menu.labelTh);
    setLabelEn(menu.labelEn);
    setUrl(menu.url);
    setTarget(menu.target || '_self');
    setIsVisible(menu.isVisible !== false);
    setIcon(menu.icon || 'Home');
    setSubmenusInput(menu.submenus || []);
    setIsFormOpen(true);
  };

  const handleAddSubmenuItem = () => {
    setSubmenusInput([
      ...submenusInput,
      { id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), labelTh: '', labelEn: '', url: '' }
    ]);
  };

  const handleRemoveSubmenuItem = (idx: number) => {
    setSubmenusInput(submenusInput.filter((_, i) => i !== idx));
  };

  const handleSubmenuChange = (idx: number, field: keyof Submenu, value: string) => {
    const updated = [...submenusInput];
    updated[idx] = { ...updated[idx], [field]: value };
    setSubmenusInput(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelTh || !url) {
      alert('กรุณากรอกชื่อเมนู (ภาษาไทย) และลิงก์ปลายทาง');
      return;
    }

    const payload = {
      labelTh,
      labelEn: labelEn || labelTh,
      url,
      target,
      isVisible,
      icon,
      submenus: submenusInput.filter(sm => sm.labelTh && sm.url) // keep valid items
    };

    try {
      if (editingMenu) {
        await api.updateMenu(editingMenu.id, payload);
      } else {
        await api.createMenu(payload);
      }
      setIsFormOpen(false);
      fetchMenus();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกเมนู');
    }
  };

  const [deleteConfirmMenu, setDeleteConfirmMenu] = useState<Menu | null>(null);

  const handleDelete = (menu: Menu) => {
    setDeleteConfirmMenu(menu);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmMenu) return;
    const targetMenu = deleteConfirmMenu;
    setDeleteConfirmMenu(null);
    try {
      await api.deleteMenu(targetMenu.id);
      fetchMenus();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleToggleVisibility = async (menu: Menu) => {
    try {
      await api.updateMenu(menu.id, { ...menu, isVisible: !menu.isVisible });
      fetchMenus();
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const moveMenu = async (index: number, direction: 'up' | 'down') => {
    const newMenus = [...menus];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newMenus.length) return;

    // Swap items
    const temp = newMenus[index];
    newMenus[index] = newMenus[targetIndex];
    newMenus[targetIndex] = temp;

    // Re-index order property
    const reordered = newMenus.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    setMenus(reordered);

    try {
      await api.reorderMenus(reordered);
    } catch (err) {
      console.error('Failed to sync reordered menus to backend', err);
      // Revert if failed
      fetchMenus();
    }
  };

  return (
    <div className="space-y-6" id="menu_manager_module">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-mcu-pink-deep flex items-center">
            <MenuIcon className="mr-2" size={20} />
            จัดการเมนูหลักและเมนูย่อยของเว็บไซต์
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            ปรับเปลี่ยน เพิ่ม ลด หรือสลับลำดับเมนูเพื่อแสดงในแถบนำทาง (Navbar) ได้ทันที
          </p>
        </div>
        <button
          onClick={handleOpenCreateForm}
          className="flex items-center space-x-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>เพิ่มเมนูใหม่</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mcu-pink-deep"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold">
                  <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">ชื่อเมนู (ไทย / EN)</th>
                  <th className="py-3 px-4">ไอคอน</th>
                  <th className="py-3 px-4">URL</th>
                  <th className="py-3 px-4">เมนูย่อย (จำนวน)</th>
                  <th className="py-3 px-4 text-center">การแสดงผล</th>
                  <th className="py-3 px-4 text-center">จัดลำดับ</th>
                  <th className="py-3 px-4 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu, idx) => (
                  <tr key={menu.id} className="border-b border-gray-50 hover:bg-gray-50/40 text-gray-700">
                    <td className="py-3 px-4 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold">
                      <div>{menu.labelTh}</div>
                      <div className="text-xs text-gray-400 font-light">{menu.labelEn}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {menu.icon || 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs max-w-xs truncate">{menu.url}</td>
                    <td className="py-3 px-4">
                      {menu.submenus && menu.submenus.length > 0 ? (
                        <span className="bg-mcu-pink-light/20 text-mcu-pink-deep px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          มี {menu.submenus.length} รายการ
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleVisibility(menu)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          menu.isVisible !== false
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {menu.isVisible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{menu.isVisible !== false ? 'แสดง' : 'ซ่อน'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center items-center space-x-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveMenu(idx, 'up')}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          disabled={idx === menus.length - 1}
                          onClick={() => moveMenu(idx, 'down')}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditForm(menu)}
                          className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(menu)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over / Modal Form Panel */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slide-left overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-mcu-pink-deep text-white">
              <h3 className="font-bold text-lg">
                {editingMenu ? `แก้ไขข้อมูลเมนู: ${editingMenu.labelTh}` : 'สร้างเมนูใหม่'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex-grow space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    ชื่อเมนู (ภาษาไทย) *
                  </label>
                  <input
                    type="text"
                    required
                    value={labelTh}
                    onChange={(e) => setLabelTh(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-mcu-pink-deep outline-hidden"
                    placeholder="เช่น ข่าวประชาสัมพันธ์"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    ชื่อเมนู (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={labelEn}
                    onChange={(e) => setLabelEn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-mcu-pink-deep outline-hidden"
                    placeholder="เช่น Press Releases"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    ไอคอน Lucide *
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-mcu-pink-deep outline-hidden"
                  >
                    <option value="Home">Home (หน้าแรก)</option>
                    <option value="Info">Info (เกี่ยวกับเรา)</option>
                    <option value="GraduationCap">GraduationCap (หลักสูตร)</option>
                    <option value="BookOpen">BookOpen (ผลงานวิชาการ)</option>
                    <option value="Newspaper">Newspaper (ข่าวสาร)</option>
                    <option value="Calendar">Calendar (กิจกรรม)</option>
                    <option value="Download">Download (ดาวน์โหลด)</option>
                    <option value="Users">Users (นิสิต/ผู้ใช้)</option>
                    <option value="Contact">Mail (ติดต่อเรา)</option>
                    <option value="Settings">Settings (ระบบหลังบ้าน)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    การเปิดลิงก์ปลายทาง
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as '_self' | '_blank')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-mcu-pink-deep outline-hidden"
                  >
                    <option value="_self">เปิดในหน้าเดิม (_self)</option>
                    <option value="_blank">เปิดในแท็บใหม่ (_blank)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  ลิงก์ปลายทาง (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-mcu-pink-deep outline-hidden font-mono"
                  placeholder="เช่น /news หรือ https://www.google.com"
                />
              </div>

              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="isVisibleInput"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 text-mcu-pink border-gray-300 rounded focus:ring-mcu-pink"
                />
                <label htmlFor="isVisibleInput" className="text-sm text-gray-600 font-semibold select-none cursor-pointer">
                  แสดงแถบเมนูนี้บนเว็บไซต์ (Visible to everyone)
                </label>
              </div>

              {/* Submenus section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-700">รายการเมนูย่อย (Submenus)</h4>
                  <button
                    type="button"
                    onClick={handleAddSubmenuItem}
                    className="flex items-center space-x-1 text-xs font-bold text-mcu-pink-deep hover:text-mcu-pink hover:underline"
                  >
                    <Plus size={14} />
                    <span>เพิ่มเมนูย่อย</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {submenusInput.length === 0 ? (
                    <div className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-lg text-center">
                      ไม่มีเมนูย่อยสำหรับเมนูนี้
                    </div>
                  ) : (
                    submenusInput.map((sm, index) => (
                      <div key={sm.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 flex flex-col space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubmenuItem(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-2 pr-6">
                          <div>
                            <input
                              type="text"
                              value={sm.labelTh}
                              onChange={(e) => handleSubmenuChange(index, 'labelTh', e.target.value)}
                              placeholder="ชื่อเมนูย่อย (ไทย)"
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-mcu-pink"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={sm.labelEn || ''}
                              onChange={(e) => handleSubmenuChange(index, 'labelEn', e.target.value)}
                              placeholder="ชื่อเมนูย่อย (English)"
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-mcu-pink"
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={sm.url}
                            onChange={(e) => handleSubmenuChange(index, 'url', e.target.value)}
                            placeholder="ลิงก์ปลายทาง (URL) เช่น /about#history"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-mcu-pink"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white rounded-lg text-sm font-semibold flex items-center space-x-1 shadow-sm"
                >
                  <Save size={16} />
                  <span>บันทึกเมนู</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmMenu && (
        <Modal
          isOpen={!!deleteConfirmMenu}
          onClose={() => setDeleteConfirmMenu(null)}
          title="ยืนยันการลบรายการเมนู"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmMenu(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบเมนู</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการเมนูนี้ออกจากโครงสร้างเมนูเว็บไซต์?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold">
              "{deleteConfirmMenu.labelTh}" ({deleteConfirmMenu.url})
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
