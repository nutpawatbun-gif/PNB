/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Applicant {
  id: string; // 5-digit string e.g., "69001"
  personType: 'clergy' | 'layperson';
  prefix: string;
  firstName: string;
  lastName: string;
  ordinationName?: string;
  templeName?: string;
  templeDistrict?: string;
  templeProvince?: string;
  nationalId: string;
  birthDate: string;
  phone: string;
  email: string;
  programId: string;
  educationalBackground: string;
  uploadedFiles: {
    nationalIdCopy: string;
    transcriptCopy: string;
    photoCopy: string;
  };
  status: 'pending' | 'interview' | 'approved' | 'rejected';
  statusText?: string;
  adminNotes?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  createdAt: string;
}

let listeners: (() => void)[] = [];

export const admissionStore = {
  getApplicants(): Applicant[] {
    return [];
  },

  saveApplicants(applicants: Applicant[]) {
    listeners.forEach(listener => listener());
  },

  addApplicant(item: Omit<Applicant, 'id' | 'createdAt' | 'status'>) {
    const today = new Date();
    const thaiYear = today.getFullYear() + 543;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${thaiYear}-${month}-${day}`;

    const newApplicant: Applicant = {
      ...item,
      id: String(Math.floor(69003 + Math.random() * 1000)),
      status: 'pending',
      statusText: 'ส่งใบสมัครสำเร็จ (รอการตรวจเอกสาร)',
      adminNotes: 'เจ้าหน้าที่ได้รับข้อมูลของท่านในระบบเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบความถูกต้อง',
      createdAt: formattedDate
    };

    listeners.forEach(listener => listener());
    return newApplicant;
  },

  updateApplicant(id: string, updatedFields: Partial<Applicant>) {
    listeners.forEach(listener => listener());
  },

  deleteApplicant(id: string) {
    listeners.forEach(listener => listener());
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
