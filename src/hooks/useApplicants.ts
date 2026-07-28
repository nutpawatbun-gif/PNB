/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Applicant } from '../data/admissionStore';

export function useApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const data = await api.getApplicants();
      setApplicants(data);
    } catch (e) {
      console.error('Error fetching applicants:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  return {
    applicants,
    loading,
    refreshApplicants: fetchApplicants,
    addApplicant: async (item: Omit<Applicant, 'id' | 'timestamp' | 'status'>) => {
      const created = await api.createApplicant(item);
      setApplicants(prev => [created, ...prev]);
      return created;
    },
    updateApplicant: async (id: string, updatedFields: Partial<Applicant>) => {
      const updated = await api.updateApplicant(id, updatedFields);
      setApplicants(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    },
    deleteApplicant: async (id: string) => {
      await api.deleteApplicant(id);
      setApplicants(prev => prev.filter(item => item.id !== id));
    },
  };
}
