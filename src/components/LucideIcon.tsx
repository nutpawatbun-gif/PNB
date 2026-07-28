import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function LucideIcon({ name, size = 18, className = '' }: IconProps) {
  // ดึง Component ไอคอนตามชื่อ name หากไม่พบจะใช้ HelpCircle เป็น Fallback
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
}
