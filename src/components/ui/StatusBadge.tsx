import React from 'react';

export type StatusType = 
  | 'active' | 'inactive' | 'pending' | 'draft' | 'published' 
  | 'approved' | 'rejected' | 'urgent' | 'info' | 'completed' | 'canceled';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  customClass?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  customClass = ''
}) => {
  const normalizedStatus = status.toLowerCase();

  const getStyle = (): string => {
    switch (normalizedStatus) {
      case 'active':
      case 'published':
      case 'approved':
      case 'completed':
      case 'ใช้งาน':
      case 'อนุมัติแล้ว':
      case 'เผยแพร่':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      
      case 'pending':
      case 'draft':
      case 'รอดำเนินการ':
      case 'ร่าง':
      case 'รออนุมัติ':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';

      case 'inactive':
      case 'rejected':
      case 'canceled':
      case 'ปิดใช้งาน':
      case 'ไม่อนุมัติ':
      case 'ยกเลิก':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';

      case 'urgent':
      case 'ด่วนที่สุด':
      case 'ด่วน':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse dark:bg-red-950/60 dark:text-red-300 dark:border-red-700';

      case 'info':
      case 'ทั่วไป':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3.5 py-1.5 font-semibold';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1 font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs transition-colors ${getStyle()} ${getSizeClass()} ${customClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      <span>{label || status}</span>
    </span>
  );
};
