import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import LucideIcon from './LucideIcon';

interface StatsCounterProps {
  lang: 'th' | 'en';
}

export default function StatsCounter({ lang }: StatsCounterProps) {
  const [statsObj, setStatsObj] = useState<any>({
    academicYear: '2569',
    mode: 'manual',
    items: [
      { id: 'stat_students', key: 'students', value: 1250, suffix: '+ รูป/คน', labelTh: 'นิสิตปัจจุบันปีการศึกษา 2569', labelEn: 'Active Students (A.Y. 2569)', iconName: 'Users' },
      { id: 'stat_graduates', key: 'graduates', value: 4500, suffix: '+ รูป/คน', labelTh: 'บัณฑิตผู้สำเร็จการศึกษาสะสม', labelEn: 'Total Graduates', iconName: 'GraduationCap' },
      { id: 'stat_courses', key: 'courses', value: 12, suffix: ' หลักสูตร', labelTh: 'หลักสูตรที่เปิดสอน', labelEn: 'Academic Programs Offered', iconName: 'BookOpen' },
      { id: 'stat_personnel', key: 'personnel', value: 85, suffix: ' ท่าน', labelTh: 'คณาจารย์ประจำและบุคลากร', labelEn: 'Faculty & Staff Members', iconName: 'UserCheck' }
    ]
  });

  const [counts, setCounts] = useState<number[]>([]);

  useEffect(() => {
    api.getAcademicStats().then((data) => {
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        setStatsObj(data);
      }
    }).catch(() => {});
  }, []);

  const itemsToDisplay = (statsObj.items || []).filter((item: any) => item.isVisible !== false);

  useEffect(() => {
    if (itemsToDisplay.length === 0) return;
    setCounts(itemsToDisplay.map(() => 0));

    const duration = 2000;
    const steps = 50;
    const stepDuration = duration / steps;

    const timers = itemsToDisplay.map((stat: any, idx: number) => {
      let step = 0;
      const targetValue = stat.value || 0;
      const incrementValue = targetValue / steps;

      const timer = setInterval(() => {
        step++;
        setCounts((prev) => {
          const next = [...prev];
          if (step >= steps) {
            next[idx] = targetValue;
            clearInterval(timer);
          } else {
            next[idx] = Math.round(incrementValue * step);
          }
          return next;
        });
      }, stepDuration);

      return timer;
    });

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
  }, [statsObj]);

  const yearLabel = statsObj.academicYear || '2569';
  const t = {
    title: lang === 'th' ? `สถิติประจำปีการศึกษา ${yearLabel}` : `Phokhun Phamuang in Figures (${yearLabel})`,
    sub: lang === 'th' ? `วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ ประจำปีการศึกษา ${yearLabel}` : `Phokhun Phamuang Buddhist College Key Statistics`
  };

  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1 max-w-sm mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto';
    if (count === 4) return 'grid-cols-2 lg:grid-cols-4';
    if (count === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
  };

  if (itemsToDisplay.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-r from-mcu-pink-deep via-mcu-pink-dark to-slate-950 text-white border-y-4 border-mcu-gold relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mcu-gold/20 text-mcu-gold-light border border-mcu-gold/40 text-xs font-bold font-mono shadow-xs">
            <span>✨</span>
            <span>ปีการศึกษา {yearLabel}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-mcu-gold-light tracking-tight font-sans thai-gold-border pb-1.5 inline-block">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-mcu-pink-soft font-light max-w-xl mx-auto">
            {t.sub}
          </p>
        </div>

        {/* Dynamic Count animation indicators with Adaptive Grid */}
        <div className={`grid gap-4 md:gap-6 ${getGridClass(itemsToDisplay.length)}`}>
          {itemsToDisplay.map((stat: any, idx: number) => (
            <div 
              key={stat.id || idx}
              className="flex flex-col items-center justify-center p-5 text-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-mcu-gold/40 transition-all duration-300 shadow-md group"
            >
              <div className="w-13 h-13 rounded-2xl bg-mcu-pink/30 group-hover:scale-110 flex items-center justify-center text-mcu-gold-light mb-3 border border-mcu-gold/30 shadow-inner transition-transform">
                <LucideIcon name={stat.iconName || 'Users'} size={24} />
              </div>
              
              {/* Animated number */}
              <div className="text-2xl sm:text-4xl font-extrabold text-mcu-gold-light tracking-tight flex items-baseline font-mono">
                <span>{counts[idx] !== undefined ? counts[idx].toLocaleString('th-TH') : (stat.value || 0)}</span>
                <span className="text-[10px] sm:text-xs text-white/80 font-normal ml-1 font-sans">
                  {stat.suffix}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-mcu-pink-soft font-medium mt-1.5 leading-snug">
                {lang === 'th' ? stat.labelTh || stat.label : stat.labelEn || stat.labelTh}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
