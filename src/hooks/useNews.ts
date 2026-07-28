/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { NewsItem } from '../types';

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await api.getNews();
      const list = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as any).data) ? (data as any).data : []);
      setNews(list);
    } catch (e) {
      console.error('Error fetching news:', e);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return {
    news,
    loading,
    refreshNews: fetchNews,
    addNews: async (item: Omit<NewsItem, 'id'>) => {
      const created = await api.createNews(item);
      setNews(prev => [created, ...prev]);
      return created;
    },
    updateNews: async (id: string, updatedFields: Partial<Omit<NewsItem, 'id'>>) => {
      const updated = await api.updateNews(id, updatedFields);
      setNews(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    },
    deleteNews: async (id: string) => {
      await api.deleteNews(id);
      setNews(prev => prev.filter(item => item.id !== id));
    },
  };
}
