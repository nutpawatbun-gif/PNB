/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DownloadableFile, DocumentCategory } from '../types';
import { downloadCategoriesData as initialCategoriesData } from './index';

const STORAGE_KEY_FILES = 'mcu_downloads_data';
const STORAGE_KEY_CATS = 'mcu_download_categories_data';

if (typeof window !== 'undefined') {
  if (localStorage.getItem(STORAGE_KEY_FILES) === null) {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEY_CATS) === null) {
    localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(initialCategoriesData));
  }
}

let listeners: (() => void)[] = [];

export const downloadsStore = {
  // --- Categories Management ---
  getCategories(): DocumentCategory[] {
    if (typeof window === 'undefined') return initialCategoriesData;
    const stored = localStorage.getItem(STORAGE_KEY_CATS);
    return stored ? JSON.parse(stored) : initialCategoriesData;
  },

  saveCategories(categories: DocumentCategory[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(categories));
      listeners.forEach(l => l());
    }
  },

  addCategory(item: Omit<DocumentCategory, 'id'>): DocumentCategory {
    const categories = this.getCategories();
    const newCat: DocumentCategory = {
      ...item,
      id: 'cat_' + Date.now(),
    };
    categories.push(newCat);
    this.saveCategories(categories);
    return newCat;
  },

  updateCategory(id: string, updatedFields: Partial<DocumentCategory>) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updatedFields };
      this.saveCategories(categories);
    }
  },

  deleteCategory(id: string) {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    this.saveCategories(filtered);
  },

  // --- Files Management ---
  getDownloads(): DownloadableFile[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_FILES);
    return stored ? JSON.parse(stored) : [];
  },
  
  saveDownloads(downloads: DownloadableFile[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(downloads));
      listeners.forEach(listener => listener());
    }
  },
  
  addDownload(item: Omit<DownloadableFile, 'id'>): DownloadableFile {
    const downloads = this.getDownloads();
    const newItem: DownloadableFile = {
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item,
      id: 'download_' + Date.now(),
    };
    downloads.unshift(newItem);
    this.saveDownloads(downloads);
    return newItem;
  },
  
  updateDownload(id: string, updatedFields: Partial<Omit<DownloadableFile, 'id'>>) {
    const downloads = this.getDownloads();
    const index = downloads.findIndex(item => item.id === id);
    if (index !== -1) {
      downloads[index] = { 
        ...downloads[index], 
        ...updatedFields, 
        updatedAt: new Date().toISOString() 
      };
      this.saveDownloads(downloads);
    }
  },

  replaceFile(id: string, newFile: { url: string; size: string; format: string; version?: string; changeNote?: string }) {
    const downloads = this.getDownloads();
    const index = downloads.findIndex(item => item.id === id);
    if (index !== -1) {
      const existing = downloads[index];
      downloads[index] = {
        ...existing,
        url: newFile.url || existing.url,
        size: newFile.size || existing.size,
        format: newFile.format || existing.format,
        version: newFile.version || existing.version,
        replacedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.saveDownloads(downloads);
    }
  },

  incrementDownloadCount(id: string): number {
    const downloads = this.getDownloads();
    const index = downloads.findIndex(item => item.id === id);
    let newCount = 1;
    if (index !== -1) {
      newCount = (downloads[index].downloadCount || 0) + 1;
      downloads[index].downloadCount = newCount;
      this.saveDownloads(downloads);
    }
    return newCount;
  },
  
  deleteDownload(id: string) {
    const downloads = this.getDownloads();
    const filtered = downloads.filter(item => item.id !== id);
    this.saveDownloads(filtered);
  },
  
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
