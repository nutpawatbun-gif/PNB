/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BannerItem } from '../types';

const STORAGE_KEY = 'mcu_banners_data';

const initialBanners: BannerItem[] = [
  {
    id: 'banner_1',
    titleTh: 'ยินดีต้อนรับสู่วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์',
    titleEn: 'Welcome to Phokhun Phamuang Buddhist College, Phetchabun',
    subTh: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    subEn: 'Mahachulalongkornrajavidyalaya University',
    descTh: 'สถาบันอุดมศึกษาพระพุทธศาสนาชั้นนำของไทย มุ่งเน้นสร้างศาสนทายาทและพัฒนาระบบสังคมด้วยหลักพุทธธรรมและนวัตกรรมสร้างสรรค์',
    descEn: 'Thailand’s premier Buddhist university, dedicated to developing spiritual leaders and modern professionals with wisdom and ethics.',
    image: 'https://s.imgz.io/2026/07/19/ChatGPT-Image-9-..-2569-19_54_52-1c1a9e17891136e0a.jpg?auto=format&fit=crop&q=80&w=1600',
    bgClass: 'bg-mcu-pink-deep/75',
    onlyImage: false,
    linkType: 'viewDetails'
  },
  {
    id: 'banner_2',
    titleTh: 'เปิดรับสมัครนิสิตใหม่ ประจำปีการศึกษา 2569',
    titleEn: 'Student Admission Open for Academic Year 2026',
    subTh: 'รับสมัครทั้งบรรพชิต (พระภิกษุ-สามเณร) และคฤหัสถ์',
    subEn: 'Open for Monks, Novices, and Laypersons',
    descTh: 'เปิดรับสมัครระดับปริญญาตรี ปริญญาโท ปริญญาเอก และหลักสูตรประกาศนียบัตร พร้อมโอกาสรับทุนการศึกษาพิเศษและบริการภัตตาหารเพล',
    descEn: 'Apply now for Undergraduate, Master, Doctoral, and Certificate programs with complete scholarships and academic facilities.',
    image: 'https://s.imgz.io/2026/07/19/ChatGPT-Image-9-..-2569-19_54_52-1c1a9e17891136e0a.jpg?auto=format&fit=crop&q=80&w=1600',
    bgClass: 'bg-mcu-pink-deep/80',
    onlyImage: false,
    linkType: 'applyNow'
  },
  {
    id: 'banner_3',
    titleTh: 'พุทธศาสตร์บูรณาการ ร่วมขับเคลื่อนศาสตร์สมัยใหม่',
    titleEn: 'Buddhist Studies Integrated with Modern Disciplines',
    subTh: 'พัฒนาจิตวิญญาณ ควบคู่การบริหารงานและสังคมคุณธรรม',
    subEn: 'Spiritual Growth Coupled with Public Administration and Social Morals',
    descTh: 'หลอมรวมหลักพุทธธรรม ปรัชญา สันติภาพ เข้ากับการรัฐประศาสนศาสตร์สมัยใหม่ เพื่อสร้างผู้นำยุคใหม่ที่มีคุณภาพทั้งทางโลกและทางธรรม',
    descEn: 'Blending classical Buddhist virtues with modern public management to cultivate mindful, ethical governance and community leaders.',
    image: 'https://s.imgz.io/2026/07/19/ChatGPT-Image-9-..-2569-19_54_52-1c1a9e17891136e0a.jpg?auto=format&fit=crop&q=80&w=1600',
    bgClass: 'bg-mcu-pink-deep/75',
    onlyImage: false,
    linkType: 'viewDetails'
  }
];

// Initialize local storage if not present
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBanners));
  }
}

let listeners: (() => void)[] = [];

export const bannersStore = {
  getBanners(): BannerItem[] {
    if (typeof window === 'undefined') return initialBanners;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialBanners;
  },
  
  saveBanners(banners: BannerItem[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
      listeners.forEach(listener => listener());
    }
  },
  
  addBanner(item: Omit<BannerItem, 'id'>) {
    const banners = this.getBanners();
    const newItem: BannerItem = {
      ...item,
      id: 'banner_' + Date.now(),
    };
    banners.push(newItem); // Add to end
    this.saveBanners(banners);
    return newItem;
  },
  
  updateBanner(id: string, updatedFields: Partial<Omit<BannerItem, 'id'>>) {
    const banners = this.getBanners();
    const index = banners.findIndex(item => item.id === id);
    if (index !== -1) {
      banners[index] = { ...banners[index], ...updatedFields };
      this.saveBanners(banners);
    }
  },
  
  deleteBanner(id: string) {
    const banners = this.getBanners();
    const filtered = banners.filter(item => item.id !== id);
    this.saveBanners(filtered);
  },
  
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
