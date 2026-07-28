/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course } from '../types';
import { coursesData as initialCoursesData } from './index';

let cachedCourses: Course[] = [...initialCoursesData];
let listeners: (() => void)[] = [];

export const coursesStore = {
  getCourses(): Course[] {
    return cachedCourses;
  },

  setCourses(courses: Course[]) {
    if (Array.isArray(courses) && courses.length > 0) {
      cachedCourses = courses;
      listeners.forEach(l => l());
    }
  },

  saveCourses(courses: Course[]) {
    this.setCourses(courses);
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
