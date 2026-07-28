/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LucideIcon from './LucideIcon';
import { bannersStore } from '../data/bannersStore';
import { api } from '../lib/api';
import { BannerItem } from '../types';
import { getEmbeddableDriveUrl } from '../lib/driveUtils';

interface HeroSliderProps {
  lang: 'th' | 'en';
  onViewDetails: () => void;
  onApplyNow: () => void;
}

export default function HeroSlider({ lang, onViewDetails, onApplyNow }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<BannerItem[]>(() => bannersStore.getBanners());

  // Fetch banners from API & subscribe to store updates
  useEffect(() => {
    api.getBanners()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
          bannersStore.saveBanners(data);
        }
      })
      .catch(err => console.warn('Failed to load banners from API:', err));

    const unsubscribe = bannersStore.subscribe(() => {
      const updated = bannersStore.getBanners();
      setSlides(updated);
      if (currentSlide >= updated.length) {
        setCurrentSlide(Math.max(0, updated.length - 1));
      }
    });
    return () => unsubscribe();
  }, [currentSlide]);

  // Auto-play timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[580px] flex flex-col items-center justify-center bg-mcu-pink-deep text-white">
        <LucideIcon name="Image" size={48} className="text-mcu-pink-soft/40 mb-3" />
        <p className="text-sm font-light font-sans text-mcu-pink-soft">
          {lang === 'th' ? 'ไม่มีข้อมูลแบนเนอร์ประชาสัมพันธ์' : 'No banner slides configured.'}
        </p>
      </div>
    );
  }

  const handleSlideClick = (slide: BannerItem) => {
    if (slide.linkType === 'viewDetails') {
      onViewDetails();
    } else if (slide.linkType === 'applyNow') {
      onApplyNow();
    } else if (slide.linkType === 'external' && slide.externalUrl) {
      window.open(slide.externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] md:h-[580px] overflow-hidden bg-mcu-pink-deep group">
      {/* Slides Wrapper */}
      {slides.map((slide, index) => {
        const isCurrent = index === currentSlide;
        const hasClickableLink = slide.linkType !== 'none';

        return (
          <div
            key={slide.id}
            onClick={() => hasClickableLink && handleSlideClick(slide)}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            } ${hasClickableLink ? 'cursor-pointer' : ''}`}
          >
            {/* Background Image with ReferrerPolicy */}
            <img
              src={getEmbeddableDriveUrl(slide.image)}
              alt={lang === 'th' ? slide.titleTh : slide.titleEn}
              className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-[1.02] duration-[4000ms] transition-transform"
              referrerPolicy="no-referrer"
              loading={index === 0 ? 'eager' : 'lazy'}
            />

            {/* If ONLY image is requested, do not render overlay text/gradient */}
            {slide.onlyImage ? (
              // Add a very subtle hover overlay only if clickable
              hasClickableLink && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4">
                  {slide.externalUrl && (
                    <span className="bg-black/60 text-white text-[11px] font-sans px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {lang === 'th' ? 'คลิกเพื่อเปิดลิงก์ภายนอก' : 'Click to open link'}
                    </span>
                  )}
                </div>
              )
            ) : (
              /* Color Overlay with Content */
              <div className={`absolute inset-0 ${slide.bgClass || 'bg-mcu-pink-deep/70'} flex items-center justify-center`}>
                {/* Slide Content */}
                <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12 text-center text-white z-20">
                  {(slide.subTh || slide.subEn) && (
                    <div className="inline-block bg-mcu-gold text-mcu-pink-deep font-bold text-[10px] sm:text-xs tracking-widest px-3 py-1 rounded-full uppercase mb-4 shadow-sm border border-mcu-gold-light/40">
                      {lang === 'th' ? slide.subTh : slide.subEn}
                    </div>
                  )}
                  {(slide.titleTh || slide.titleEn) && (
                    <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md font-sans">
                      {lang === 'th' ? slide.titleTh : slide.titleEn}
                    </h2>
                  )}
                  {(slide.descTh || slide.descEn) && (
                    <p className="text-xs sm:text-sm md:text-base text-mcu-pink-soft max-w-3xl mx-auto leading-relaxed mb-8 font-light drop-shadow">
                      {lang === 'th' ? slide.descTh : slide.descEn}
                    </p>
                  )}
                  
                  {slide.linkType !== 'none' && (
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      {slide.linkType === 'viewDetails' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-mcu-pink-deep hover:bg-mcu-gold-soft hover:text-mcu-pink-dark transition-all font-semibold text-sm shadow-md cursor-pointer flex items-center justify-center border border-transparent"
                        >
                          <span>{lang === 'th' ? 'ดูรายละเอียดหลักสูตร' : 'View Programs'}</span>
                          <LucideIcon name="ArrowRight" size={14} className="ml-1.5" />
                        </button>
                      )}
                      {slide.linkType === 'applyNow' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onApplyNow(); }}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-mcu-pink hover:bg-mcu-pink-dark border-2 border-mcu-gold text-white font-semibold text-sm shadow-md cursor-pointer transition-all flex items-center justify-center"
                        >
                          <LucideIcon name="GraduationCap" size={16} className="mr-1.5" />
                          <span>{lang === 'th' ? 'สมัครเรียนออนไลน์' : 'Apply Online'}</span>
                        </button>
                      )}
                      {slide.linkType === 'external' && slide.externalUrl && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            window.open(slide.externalUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-mcu-gold hover:bg-mcu-gold-light text-mcu-pink-deep font-semibold text-sm shadow-md cursor-pointer transition-all flex items-center justify-center"
                        >
                          <LucideIcon name="ExternalLink" size={14} className="mr-1.5" />
                          <span>{lang === 'th' ? 'เปิดลิงก์รายละเอียด' : 'Open Link'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 focus:outline-none z-30 cursor-pointer hidden sm:block border border-white/20"
            aria-label="Previous Slide"
          >
            <LucideIcon name="ChevronDown" size={24} className="rotate-90" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 focus:outline-none z-30 cursor-pointer hidden sm:block border border-white/20"
            aria-label="Next Slide"
          >
            <LucideIcon name="ChevronDown" size={24} className="-rotate-90" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2.5 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide ? 'w-8 bg-mcu-gold' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
