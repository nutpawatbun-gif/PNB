/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { statsData } from '../data';
import LucideIcon from './LucideIcon';

interface StatsCounterProps {
  lang: 'th' | 'en';
}

export default function StatsCounter({ lang }: StatsCounterProps) {
  const [counts, setCounts] = useState<number[]>(statsData.map(() => 0));

  useEffect(() => {
    const duration = 2000; // Animation duration in ms
    const steps = 50; // Total steps for smooth refresh
    const stepDuration = duration / steps;

    const timers = statsData.map((stat, idx) => {
      let step = 0;
      const targetValue = stat.value;
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
  }, []);

  const t = {
    title: lang === 'th' ? 'สถิติประจำปีการศึกษา 2569' : 'Phokhun Phamuang in Figures',
    disclaimer: lang === 'th' ? '* สถิติตัวอย่าง จำลองเพื่อประกอบการทำงานของระบบเว็บไซต์' : '* Demonstration statistics prepared for representation purposes.'
  };

  return (
    <section className="py-12 bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white border-y-4 border-mcu-gold relative">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-mcu-gold-light tracking-tight font-sans">
            {t.title}
          </h2>
        </div>

        {/* 4.9 Count animation indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {statsData.map((stat, idx) => (
            <div 
              key={stat.id}
              className="flex flex-col items-center justify-center p-4 text-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-mcu-gold/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-mcu-pink/30 flex items-center justify-center text-mcu-gold-light mb-3 border border-mcu-gold/20 shadow-inner">
                <LucideIcon name={stat.iconName} size={22} />
              </div>
              
              {/* Animated number */}
              <div className="text-2xl sm:text-4xl font-extrabold text-mcu-gold-light tracking-tight flex items-baseline">
                <span>{counts[idx]}</span>
                <span className="text-[10px] sm:text-xs text-white/80 font-normal ml-1">
                  {stat.suffix}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-mcu-pink-soft font-light mt-1.5 leading-snug">
                {lang === 'th' ? stat.label : stat.labelEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
