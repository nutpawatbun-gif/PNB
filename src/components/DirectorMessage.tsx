/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { directorData } from '../data';
import LucideIcon from './LucideIcon';
// @ts-ignore
import directorImg from '../assets/images/regenerated_image_1784399392918.jpg';

interface DirectorMessageProps {
  lang: 'th' | 'en';
}

export default function DirectorMessage({ lang }: DirectorMessageProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Monk illustration fallback if photo is not loaded, stylized with a beautiful yellow-orange aura
  const portraitUrl = directorImg;

  const t = {
    readMore: lang === 'th' ? 'อ่านสารจากผู้อำนวยการวิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์' : 'Read Full Welcome Message',
    close: lang === 'th' ? 'ปิดหน้าต่าง' : 'Close',
    greet: lang === 'th' ? 'สารต้อนรับจากผู้อำนวยการ' : 'Welcome Address from Director',
    institution: lang === 'th' ? 'วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์' : 'Phokhun Phamuang Buddhist College, Phetchabun'
  };

  return (
    <section className="py-16 bg-gradient-to-b from-mcu-pink-soft to-white border-b border-mcu-pink-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-mcu-card border border-mcu-pink-light overflow-hidden flex flex-col md:flex-row items-center">
          
          {/* Portrait Image Block */}
          <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col items-center justify-center bg-gradient-to-br from-mcu-pink-deep to-mcu-pink-dark text-white relative">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-mcu-gold overflow-hidden shadow-lg mb-6 group">
              <img
                src={portraitUrl}
                alt={directorData.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 duration-300 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-mcu-pink-deep/10"></div>
            </div>
            
            {/* Traditional Thai Golden Accents */}
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold text-mcu-gold-light leading-tight">
                {directorData.name}
              </h3>
              <p className="text-xs text-mcu-pink-soft/90 mt-1 font-medium">
                {directorData.position}
              </p>
            </div>
          </div>

          {/* Text Greeting Block */}
          <div className="w-full md:w-3/5 p-8 sm:p-10 md:p-12">
            <div className="flex items-center space-x-2 text-mcu-pink mb-3">
              <LucideIcon name="Compass" className="text-mcu-gold" size={18} />
              <span className="text-xs font-bold tracking-wider uppercase text-mcu-gold">{t.greet}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-mcu-pink-deep mb-4 leading-tight font-sans">
              “พุทธธรรม นำปัญญา พัฒนาสังคม”
            </h2>
            <p className="text-sm sm:text-base text-text-mcu leading-relaxed mb-6 font-light italic">
              “{directorData.messageText}”
            </p>
            
            <div className="flex justify-start">
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center space-x-2 bg-mcu-pink hover:bg-mcu-pink-dark text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-md border-2 border-transparent hover:border-mcu-gold"
              >
                <LucideIcon name="BookOpen" size={16} />
                <span>{t.readMore}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4.4 Modal Dialog containing full message */}
      {isOpen && (
        <div className="fixed inset-0 bg-mcu-pink-deep/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-mcu-gold max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-mcu-pink-deep to-mcu-pink-dark text-white px-6 py-4 flex justify-between items-center border-b border-mcu-gold">
              <div className="flex items-center space-x-2">
                <LucideIcon name="Award" className="text-mcu-gold" size={20} />
                <h3 className="text-base sm:text-lg font-bold text-mcu-gold-light">{t.greet}</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full cursor-pointer focus:outline-none"
                aria-label="Close dialog"
              >
                <LucideIcon name="X" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <img
                  src={portraitUrl}
                  alt={directorData.name}
                  className="w-24 h-24 rounded-full border-2 border-mcu-gold object-cover mb-3 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <h4 className="text-base sm:text-lg font-bold text-mcu-pink-deep">{directorData.name}</h4>
                <p className="text-xs text-muted-text-mcu">{directorData.position}</p>
                <div className="w-16 h-0.5 bg-mcu-gold mt-2"></div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-text-mcu leading-relaxed font-light">
                {directorData.fullMessageText.map((paragraph, idx) => (
                  <p key={idx} className={idx === 0 ? "font-medium text-mcu-pink-dark" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-mcu-pink-light flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-mcu-gold-soft text-mcu-pink-deep border border-mcu-gold hover:bg-mcu-gold hover:text-white px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
