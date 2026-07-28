/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsItem } from '../types';
import { newsData as initialNewsData } from './index';

const STORAGE_KEY = 'mcu_news_data';

// Initialize local storage if not present
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNewsData));
  } else {
    try {
      const parsed = JSON.parse(stored);
      const n1Item = parsed.find((item: any) => item.id === 'n1');
      if (n1Item && !n1Item.attachmentUrl) {
        n1Item.attachmentUrl = "https://drive.google.com/file/d/10e8W8J9rRFM3Yh5-4AHlww-HyQRzuFaV/view?usp=drive_link";
        n1Item.attachmentName = "คู่มือการสมัครเรียนประจำปีการศึกษา_2569.pdf";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNewsData));
    }
  }
}

let listeners: (() => void)[] = [];

export const newsStore = {
  getNews(): NewsItem[] {
    if (typeof window === 'undefined') return initialNewsData;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialNewsData;
  },
  
  saveNews(news: NewsItem[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
      listeners.forEach(listener => listener());
    }
  },
  
  addNews(item: Omit<NewsItem, 'id'>) {
    const news = this.getNews();
    const newItem: NewsItem = {
      ...item,
      id: 'news_' + Date.now(),
    };
    news.unshift(newItem); // Add to beginning
    this.saveNews(news);
    return newItem;
  },
  
  updateNews(id: string, updatedFields: Partial<Omit<NewsItem, 'id'>>) {
    const news = this.getNews();
    const index = news.findIndex(item => item.id === id);
    if (index !== -1) {
      news[index] = { ...news[index], ...updatedFields };
      this.saveNews(news);
    }
  },
  
  deleteNews(id: string) {
    const news = this.getNews();
    const filtered = news.filter(item => item.id !== id);
    this.saveNews(filtered);
  },
  
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
