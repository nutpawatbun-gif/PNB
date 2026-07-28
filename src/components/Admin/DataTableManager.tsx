import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Square,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  Edit3,
  Globe,
  FileText,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  FileSpreadsheet,
  FileCode,
  Layers,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { api } from '../../lib/api';

interface DataTableItem {
  id: string;
  title: string;
  category?: string;
  categoryLabel?: string;
  status: string;
  authorName?: string;
  publisher?: string;
  views?: number;
  viewCount?: number;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  excerpt?: string;
  content?: string;
  [key: string]: any;
}

interface DataTableManagerProps {
  onNotify?: (text: string, type: 'success' | 'error') => void;
}

export const DataTableManager: React.FC<DataTableManagerProps> = ({ onNotify }) => {
  // Collection selector state
  const [currentCollection, setCurrentCollection] = useState<'news' | 'announcements' | 'academic' | 'events' | 'downloads'>('news');

  // Core Data States
  const [data, setData] = useState<DataTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');

  // 3. Sorting State
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 4. Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // 5. Multi-select States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [viewingItem, setViewingItem] = useState<DataTableItem | null>(null);
  const [editingItem, setEditingItem] = useState<DataTableItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; ids: string[]; isBulk: boolean }>({
    isOpen: false,
    ids: [],
    isBulk: false
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Item Form State
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    category: 'ข่าวประชาสัมพันธ์',
    status: 'Published',
    authorName: 'ผู้ดูแลระบบ',
    excerpt: '',
    content: ''
  });

  // Fetch Data according to selected collection
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let result: any[] = [];
      if (currentCollection === 'news') {
        const res = await api.getNews();
        result = res;
      } else if (currentCollection === 'announcements') {
        const res = await api.getAnnouncements();
        result = res;
      } else if (currentCollection === 'academic') {
        const res = await api.getAcademicWorks();
        result = res;
      } else if (currentCollection === 'events') {
        const res = await api.getEvents();
        result = res;
      } else if (currentCollection === 'downloads') {
        const res = await api.getDownloads();
        result = res;
      }
      setData(result || []);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to fetch table data:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [currentCollection]);

  // Extract unique categories for filtering
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    data.forEach(item => {
      const cat = item.categoryLabel || item.category;
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [data]);

  // Filtered & Sorted Data Calculation
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        return (
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
          (item.authorName && item.authorName.toLowerCase().includes(q)) ||
          (item.publisher && item.publisher.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.id && item.id.toLowerCase().includes(q))
        );
      });
    }

    // 2. Status Filter
    if (selectedStatus !== 'all') {
      result = result.filter(item => item.status === selectedStatus);
    }

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => (item.categoryLabel || item.category) === selectedCategory);
    }

    // Date Range Filter
    if (dateStart) {
      result = result.filter(item => {
        const itemDate = item.date || item.createdAt;
        return itemDate ? new Date(itemDate) >= new Date(dateStart) : true;
      });
    }
    if (dateEnd) {
      result = result.filter(item => {
        const itemDate = item.date || item.createdAt;
        return itemDate ? new Date(itemDate) <= new Date(dateEnd + 'T23:59:59') : true;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchQuery, selectedStatus, selectedCategory, dateStart, dateEnd, sortField, sortDirection]);

  // 4. Pagination Calculation
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, validCurrentPage, itemsPerPage]);

  // Handle Select All on current page
  const isAllOnPageSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(item.id));

  const toggleSelectAllPage = () => {
    if (isAllOnPageSelected) {
      const pageIds = paginatedData.map(i => i.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedData.map(i => i.id);
      const newSelected = new Set([...selectedIds, ...pageIds]);
      setSelectedIds(Array.from(newSelected));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 12. Single Status Toggle (Publish / Unpublish)
  const handleTogglePublishStatus = async (item: DataTableItem) => {
    let newStatus = 'Published';
    if (currentCollection === 'news') {
      newStatus = item.status === 'Published' ? 'Draft' : 'Published';
    } else if (currentCollection === 'announcements') {
      newStatus = item.status === 'active' ? 'draft' : 'active';
    }

    try {
      if (currentCollection === 'news') {
        await api.updateNews(item.id, { status: newStatus as any });
      } else if (currentCollection === 'announcements') {
        await api.updateAnnouncement(item.id, { status: newStatus as any });
      }
      setData(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
      if (onNotify) onNotify(`เปลี่ยนสถานะรายการ "${item.title}" เป็น ${newStatus} สำเร็จ`, 'success');
    } catch (err: any) {
      if (onNotify) onNotify('ไม่สามารถเปลี่ยนสถานะรายการได้', 'error');
    }
  };

  // 7. Bulk Status Change Execution
  const handleApplyBulkStatus = async (targetStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      if (currentCollection === 'news') {
        const newsStat = (targetStatus === 'active' ? 'Published' : targetStatus === 'draft' ? 'Draft' : targetStatus) as any;
        await Promise.all(selectedIds.map(id => api.updateNews(id, { status: newsStat })));
      } else if (currentCollection === 'announcements') {
        const annStat = (targetStatus === 'Published' ? 'active' : targetStatus === 'Draft' ? 'draft' : targetStatus) as any;
        await Promise.all(selectedIds.map(id => api.updateAnnouncement(id, { status: annStat })));
      }
      setData(prev => prev.map(i => selectedIds.includes(i.id) ? { ...i, status: targetStatus } : i));
      if (onNotify) onNotify(`ปรับสถานะเป็น "${targetStatus}" สำหรับ ${selectedIds.length} รายการเรียบร้อย`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการเปลี่ยนสถานะหลายรายการ', 'error');
    }
  };

  // 14. Delete Execution (Single / Bulk)
  const handleConfirmDelete = async () => {
    const idsToDelete = deleteConfirm.ids;
    if (idsToDelete.length === 0) return;

    try {
      if (currentCollection === 'news') {
        await Promise.all(idsToDelete.map(id => api.deleteNews(id)));
      } else if (currentCollection === 'announcements') {
        await Promise.all(idsToDelete.map(id => api.deleteAnnouncement(id)));
      }
      setData(prev => prev.filter(i => !idsToDelete.includes(i.id)));
      setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));
      if (onNotify) onNotify(`ลบรายการสำเร็จจำนวน ${idsToDelete.length} รายการ`, 'success');
    } catch (err: any) {
      if (onNotify) onNotify('ไม่สามารถลบรายการได้', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, ids: [], isBulk: false });
    }
  };

  // 8. Export Data to CSV / JSON
  const handleExportCSV = () => {
    const exportItems = selectedIds.length > 0 
      ? filteredAndSortedData.filter(i => selectedIds.includes(i.id))
      : filteredAndSortedData;

    if (exportItems.length === 0) {
      if (onNotify) onNotify('ไม่มีข้อมูลสำหรับ Export', 'error');
      return;
    }

    const headers = ['ID', 'Title', 'Category', 'Status', 'Author/Publisher', 'Views', 'Date'];
    const csvRows = [headers.join(',')];

    exportItems.forEach(item => {
      const row = [
        `"${item.id}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${item.categoryLabel || item.category || ''}"`,
        `"${item.status || ''}"`,
        `"${item.authorName || item.publisher || ''}"`,
        item.viewCount || item.views || 0,
        `"${item.date || item.createdAt || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Thai text in Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentCollection}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onNotify) onNotify(`Export ข้อมูล CSV จำนวน ${exportItems.length} รายการเรียบร้อย`, 'success');
  };

  const handleExportJSON = () => {
    const exportItems = selectedIds.length > 0 
      ? filteredAndSortedData.filter(i => selectedIds.includes(i.id))
      : filteredAndSortedData;

    const jsonStr = JSON.stringify(exportItems, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentCollection}_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onNotify) onNotify(`Export ข้อมูล JSON จำนวน ${exportItems.length} รายการเรียบร้อย`, 'success');
  };

  // Create Item Handler
  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.title.trim()) return;

    try {
      if (currentCollection === 'news') {
        const created = await api.createNews({
          title: newItemForm.title,
          category: newItemForm.category,
          categoryLabel: newItemForm.category,
          status: (newItemForm.status === 'Published' ? 'Published' : 'Draft') as any,
          authorName: newItemForm.authorName,
          excerpt: newItemForm.excerpt,
          content: newItemForm.content,
          date: new Date().toISOString().split('T')[0]
        });
        setData(prev => [created, ...prev]);
      } else if (currentCollection === 'announcements') {
        const created = await api.createAnnouncement({
          title: newItemForm.title,
          category: 'general',
          categoryLabel: newItemForm.category,
          publisher: newItemForm.authorName,
          isPinned: false,
          startDate: new Date().toISOString().split('T')[0],
          yearTh: '2569',
          excerpt: newItemForm.excerpt,
          content: newItemForm.content,
          attachments: [],
          allowDownload: true,
          totalDownloads: 0,
          viewCount: 0,
          status: newItemForm.status === 'Published' ? 'active' : 'draft'
        });
        setData(prev => [created, ...prev]);
      }
      setIsCreateModalOpen(false);
      setNewItemForm({ title: '', category: 'ข่าวประชาสัมพันธ์', status: 'Published', authorName: 'ผู้ดูแลระบบ', excerpt: '', content: '' });
      if (onNotify) onNotify('สร้างรายการใหม่เรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      if (onNotify) onNotify('ไม่สามารถสร้างรายการใหม่ได้', 'error');
    }
  };

  // Sort Toggle Helper
  const handleHeaderSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 13. Status Badge Color Mapper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
      case 'active':
      case 'เผยแพร่แล้ว':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle size={12} className="mr-1" /> เผยแพร่แล้ว</span>;
      case 'Draft':
      case 'draft':
      case 'แบบร่าง':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300"><FileText size={12} className="mr-1" /> แบบร่าง</span>;
      case 'Pending Review':
      case 'รอตรวจทาน':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300"><Clock size={12} className="mr-1" /> รอตรวจทาน</span>;
      case 'Scheduled':
      case 'scheduled':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300"><Calendar size={12} className="mr-1" /> ตั้งเวลา</span>;
      case 'Expired':
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300"><AlertTriangle size={12} className="mr-1" /> หมดอายุ</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="data_table_manager_view">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-mcu-pink rounded-xl text-white shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">ศูนย์จัดการตารางข้อมูล Dashboard (Data Table Management)</h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  ระบบบริหารจัดการข้อมูลตารางสมบูรณ์แบบ รองรับการค้นหา กรอง เรียงลำดับ แบ่งหน้า เลือกหลายรายการ ลบ/เปลี่ยนสถานะแบบกลุ่ม และ Export
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>เพิ่มรายการใหม่</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-1"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Collection Selector Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800 text-xs">
          {[
            { key: 'news', label: 'ข่าวสารประชาสัมพันธ์' },
            { key: 'announcements', label: 'ประกาศวิทยาลัย' },
            { key: 'academic', label: 'ผลงานวิชาการ' },
            { key: 'events', label: 'กิจกรรมสถาบัน' },
            { key: 'downloads', label: 'เอกสารดาวน์โหลด' },
          ].map(col => (
            <button
              key={col.key}
              onClick={() => setCurrentCollection(col.key as any)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                currentCollection === col.key
                  ? 'bg-mcu-pink text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-5">
        
        {/* 1 & 2. Search, Filters & Export Controls Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          
          {/* Left: Search Box */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาชื่อเรื่อง, ผู้สร้าง, ID หรือหมวดหมู่..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-mcu-pink outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Middle: Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <Filter size={14} className="text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-semibold text-gray-700 outline-hidden cursor-pointer"
              >
                <option value="all">ทุกสถานะ (All Status)</option>
                <option value="Published">เผยแพร่แล้ว (Published / Active)</option>
                <option value="Draft">แบบร่าง (Draft)</option>
                <option value="Pending Review">รอตรวจทาน (Pending)</option>
                <option value="Scheduled">ตั้งเวลา (Scheduled)</option>
                <option value="Expired">หมดอายุ (Expired)</option>
              </select>
            </div>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
                <Tag size={14} className="text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-gray-700 outline-hidden cursor-pointer"
                >
                  <option value="all">ทุกหมวดหมู่ (All Categories)</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            {(selectedStatus !== 'all' || selectedCategory !== 'all' || searchQuery || dateStart || dateEnd) && (
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setDateStart('');
                  setDateEnd('');
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-200"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* Right: 8. Export Buttons */}
          <div className="flex items-center space-x-2 border-l border-gray-100 pl-4">
            <span className="text-[11px] font-bold text-gray-400">Export:</span>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-all flex items-center space-x-1"
              title="ส่งออกไฟล์ CSV สำหรับ Microsoft Excel"
            >
              <FileSpreadsheet size={14} />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-all flex items-center space-x-1"
              title="ส่งออกไฟล์ JSON โครงสร้างข้อมูล"
            >
              <FileCode size={14} />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* 5, 6 & 7. Multi-Select Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                เลือกแล้ว {selectedIds.length} รายการ
              </span>
              <span className="text-xs text-indigo-900 font-medium hidden sm:inline">
                เลือกการดำเนินการสำหรับรายการที่เลือก:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk Status Update Dropdown */}
              <div className="flex items-center space-x-1 bg-white border border-indigo-200 rounded-lg px-2 py-1 text-xs">
                <span className="text-gray-500 font-bold">ปรับสถานะ:</span>
                <button
                  onClick={() => handleApplyBulkStatus('Published')}
                  className="px-2 py-0.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-bold transition-all"
                >
                  เผยแพร่
                </button>
                <button
                  onClick={() => handleApplyBulkStatus('Draft')}
                  className="px-2 py-0.5 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded font-bold transition-all"
                >
                  แบบร่าง
                </button>
                <button
                  onClick={() => handleApplyBulkStatus('Pending Review')}
                  className="px-2 py-0.5 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded font-bold transition-all"
                >
                  รอตรวจทาน
                </button>
              </div>

              {/* Bulk Delete Button */}
              <button
                onClick={() => setDeleteConfirm({ isOpen: true, ids: selectedIds, isBulk: true })}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-xs"
              >
                <Trash2 size={14} />
                <span>ลบรายการที่เลือก ({selectedIds.length})</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="p-1.5 text-gray-500 hover:text-gray-700"
                title="ยกเลิกการเลือก"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 16. Loading State */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-mcu-pink animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-600">กำลังโหลดข้อมูลตาราง...</p>
          </div>
        )}

        {/* 17. Error State */}
        {!loading && error && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-rose-900">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-rose-700"
            >
              ลองใหม่อีกครั้ง (Retry)
            </button>
          </div>
        )}

        {/* 15. Empty State */}
        {!loading && !error && filteredAndSortedData.length === 0 && (
          <div className="py-16 text-center space-y-3 border-2 border-dashed border-gray-200 rounded-2xl">
            <Layers className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-xs text-gray-400">ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองข้อมูล</p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                ล้างตัวกรอง
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-mcu-pink text-white rounded-xl text-xs font-bold shadow-sm hover:bg-mcu-pink-deep"
              >
                + เพิ่มรายการใหม่
              </button>
            </div>
          </div>
        )}

        {/* Main Data Table */}
        {!loading && !error && filteredAndSortedData.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              {/* Header Columns */}
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800">
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={toggleSelectAllPage}
                      className="text-slate-300 hover:text-white"
                      title={isAllOnPageSelected ? 'ยกเลิกเลือกทั้งหมดในหน้านี้' : 'เลือกทั้งหมดในหน้านี้'}
                    >
                      {isAllOnPageSelected ? <CheckSquare size={16} className="text-mcu-pink" /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-mcu-pink transition-colors" onClick={() => handleHeaderSort('title')}>
                    <div className="flex items-center space-x-1">
                      <span>ชื่อรายการ / หัวข้อ</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-mcu-pink transition-colors" onClick={() => handleHeaderSort('category')}>
                    <div className="flex items-center space-x-1">
                      <span>หมวดหมู่</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-mcu-pink transition-colors" onClick={() => handleHeaderSort('status')}>
                    <div className="flex items-center space-x-1">
                      <span>สถานะ</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-mcu-pink transition-colors" onClick={() => handleHeaderSort('authorName')}>
                    <div className="flex items-center space-x-1">
                      <span>ผู้สร้าง/หน่วยงาน</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-mcu-pink transition-colors" onClick={() => handleHeaderSort('date')}>
                    <div className="flex items-center space-x-1">
                      <span>วันที่บันทึก</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleSelectOne(item.id)}
                          className="text-gray-400 hover:text-mcu-pink"
                        >
                          {isSelected ? <CheckSquare size={16} className="text-mcu-pink" /> : <Square size={16} />}
                        </button>
                      </td>

                      {/* Title & Excerpt */}
                      <td className="p-3 font-semibold text-gray-900 max-w-xs">
                        <div className="line-clamp-1 text-sm">{item.title}</div>
                        {item.excerpt && (
                          <div className="line-clamp-1 text-[11px] text-gray-400 font-normal">{item.excerpt}</div>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">ID: {item.id}</span>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200">
                          {item.categoryLabel || item.category || 'ทั่วไป'}
                        </span>
                      </td>

                      {/* 13. Status Badge */}
                      <td className="p-3">{renderStatusBadge(item.status)}</td>

                      {/* Author */}
                      <td className="p-3 text-gray-600 font-medium">
                        <div className="flex items-center space-x-1">
                          <User size={12} className="text-gray-400" />
                          <span>{item.authorName || item.publisher || 'สถาบัน'}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3 text-gray-500 font-mono text-[11px]">
                        {item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : '-')}
                      </td>

                      {/* Action Buttons (9, 10, 11, 12) */}
                      <td className="p-3 text-right space-x-1">
                        {/* 12. Toggle Publish Button */}
                        <button
                          onClick={() => handleTogglePublishStatus(item)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all border ${
                            item.status === 'Published' || item.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={item.status === 'Published' || item.status === 'active' ? 'เปลี่ยนเป็นแบบร่าง' : 'เผยแพร่ทันที'}
                        >
                          <Globe size={13} />
                        </button>

                        {/* 9. View Button */}
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all"
                          title="ดูรายละเอียดข้อมูล"
                        >
                          <Eye size={13} />
                        </button>

                        {/* 10. Edit Button */}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg transition-all"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* 11. Delete Button */}
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, ids: [item.id], isBulk: false })}
                          className="p-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg transition-all"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination Toolbar */}
        {!loading && !error && filteredAndSortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs">
            {/* Info Range */}
            <div className="text-gray-500 font-medium">
              แสดงรายการที่ <span className="font-bold text-gray-800">{(validCurrentPage - 1) * itemsPerPage + 1}</span> ถึง{' '}
              <span className="font-bold text-gray-800">{Math.min(validCurrentPage * itemsPerPage, totalItems)}</span> จากทั้งหมด{' '}
              <span className="font-bold text-gray-900">{totalItems}</span> รายการ
            </div>

            {/* Pagination Controls & Items Per Page Selector */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Items per page selector */}
              <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl">
                <span className="text-gray-400">แสดงหน้าละ:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-bold text-gray-800 outline-hidden cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage === 1}
                  className="p-1.5 border rounded-lg text-gray-600 disabled:opacity-30 hover:bg-gray-100"
                  title="หน้าแรกสุด"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={validCurrentPage === 1}
                  className="p-1.5 border rounded-lg text-gray-600 disabled:opacity-30 hover:bg-gray-100"
                  title="หน้าถัดไปทางซ้าย"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 bg-mcu-pink text-white font-bold rounded-lg shadow-xs">
                  หน้า {validCurrentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="p-1.5 border rounded-lg text-gray-600 disabled:opacity-30 hover:bg-gray-100"
                  title="หน้าถัดไปทางขวา"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="p-1.5 border rounded-lg text-gray-600 disabled:opacity-30 hover:bg-gray-100"
                  title="หน้าสุดท้าย"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. View Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Eye className="text-mcu-pink" size={20} />
                รายละเอียดข้อมูลรายการ
              </h2>
              <button onClick={() => setViewingItem(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-bold block">หัวข้อ/ชื่อรายการ:</span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{viewingItem.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-400 block font-semibold">สถานะ:</span>
                  {renderStatusBadge(viewingItem.status)}
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">หมวดหมู่:</span>
                  <span className="font-bold text-gray-800">{viewingItem.categoryLabel || viewingItem.category || 'ทั่วไป'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">ผู้บันทึก:</span>
                  <span className="font-bold text-gray-800">{viewingItem.authorName || viewingItem.publisher || 'ระบบ'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">วันที่:</span>
                  <span className="font-mono text-gray-800">{viewingItem.date || viewingItem.createdAt || '-'}</span>
                </div>
              </div>

              {viewingItem.excerpt && (
                <div>
                  <span className="text-gray-400 font-bold block">บทย่อ (Excerpt):</span>
                  <p className="p-3 bg-gray-50 rounded-xl text-gray-700 leading-relaxed mt-1">{viewingItem.excerpt}</p>
                </div>
              )}

              {viewingItem.content && (
                <div>
                  <span className="text-gray-400 font-bold block">เนื้อหา (Content Preview):</span>
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-700 max-h-48 overflow-y-auto leading-relaxed mt-1 font-mono text-[11px]">
                    {viewingItem.content}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="text-amber-500" size={20} />
                แก้ไขข้อมูลรายการ
              </h2>
              <button onClick={() => setEditingItem(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ชื่อรายการ:</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">สถานะ:</label>
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium focus:bg-white outline-hidden"
                >
                  <option value="Published">เผยแพร่แล้ว (Published / Active)</option>
                  <option value="Draft">แบบร่าง (Draft)</option>
                  <option value="Pending Review">รอตรวจทาน (Pending Review)</option>
                  <option value="Scheduled">ตั้งเวลาเผยแพร่ (Scheduled)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">บทย่อ:</label>
                <textarea
                  value={editingItem.excerpt || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  try {
                    if (currentCollection === 'news') {
                      await api.updateNews(editingItem.id, editingItem as any);
                    } else if (currentCollection === 'announcements') {
                      await api.updateAnnouncement(editingItem.id, editingItem as any);
                    }
                    setData(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
                    setEditingItem(null);
                    if (onNotify) onNotify('บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
                  } catch (err) {
                    if (onNotify) onNotify('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
                  }
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                บันทึกการปรับปรุง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. Confirmation Delete Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                ยืนยันการลบข้อมูล{deleteConfirm.isBulk ? ` ${deleteConfirm.ids.length} รายการ` : ''}
              </h3>
              <p className="text-xs text-gray-500">
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการที่เลือก? การดำเนินการนี้ไม่สามารถยกเลิกได้
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, ids: [], isBulk: false })}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                ยืนยันลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Item Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleCreateNewItem} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="text-mcu-pink" size={20} />
                สร้างรายการข้อมูลใหม่ ({currentCollection})
              </h2>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ชื่อรายการ / หัวข้อ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                  placeholder="ระบุชื่อรายการ..."
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">หมวดหมู่</label>
                <input
                  type="text"
                  value={newItemForm.category}
                  onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">สถานะ</label>
                <select
                  value={newItemForm.status}
                  onChange={(e) => setNewItemForm({ ...newItemForm, status: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium focus:bg-white outline-hidden"
                >
                  <option value="Published">เผยแพร่แล้ว (Published)</option>
                  <option value="Draft">แบบร่าง (Draft)</option>
                  <option value="Pending Review">รอตรวจทาน (Pending Review)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">บทย่อ</label>
                <textarea
                  value={newItemForm.excerpt}
                  onChange={(e) => setNewItemForm({ ...newItemForm, excerpt: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-mcu-pink hover:bg-mcu-pink-deep text-white font-bold rounded-xl text-xs shadow-md"
              >
                บันทึกสร้างใหม่
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
