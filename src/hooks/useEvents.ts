/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { eventsStore } from '../data/eventsStore';
import { CalendarEvent } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => eventsStore.getEvents());
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      if (Array.isArray(data)) {
        setEvents(data);
        eventsStore.saveEvents(data);
      }
    } catch (e) {
      console.error('Error fetching events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const unsubscribe = eventsStore.subscribe(() => {
      setEvents(eventsStore.getEvents());
    });

    return () => unsubscribe();
  }, []);

  return {
    events,
    loading,
    refreshEvents: fetchEvents,
    addEvent: async (item: Omit<CalendarEvent, 'id'>) => {
      const created = await api.createEvent(item);
      await fetchEvents();
      return created;
    },
    updateEvent: async (id: string, updatedFields: Partial<Omit<CalendarEvent, 'id'>>) => {
      const updated = await api.updateEvent(id, updatedFields);
      await fetchEvents();
      return updated;
    },
    deleteEvent: async (id: string) => {
      await api.deleteEvent(id);
      await fetchEvents();
    },
  };
}
