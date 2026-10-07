import { useState, useEffect } from 'react';
import { StudentContextData } from '../types/student';

const STORAGE_KEY = 'yorvoca_student_context';

const defaultContext: StudentContextData = {
  currentLocation: null,
  targetLocation: null,
  locationFlexibility: null,
  preferredModality: null,
  preferredInstitutionType: null,
  isComplete: false,
};

export function useStudentStore() {
  const [data, setData] = useState<StudentContextData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultContext;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return defaultContext;
    }
  });

  const updateData = (updates: Partial<StudentContextData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearData = () => {
    setData(defaultContext);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { data, updateData, clearData };
}
