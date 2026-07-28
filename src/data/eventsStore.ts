/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarEvent } from '../types';
import { eventsData as initialEventsData } from './index';

let cachedEvents: CalendarEvent[] = [...initialEventsData];
let listeners: (() => void)[] = [];

export const eventsStore = {
  getEvents(): CalendarEvent[] {
    return cachedEvents;
  },

  setEvents(events: CalendarEvent[]) {
    if (Array.isArray(events)) {
      cachedEvents = events;
      listeners.forEach(l => l());
    }
  },

  saveEvents(events: CalendarEvent[]) {
    this.setEvents(events);
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
