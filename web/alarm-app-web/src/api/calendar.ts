import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CalendarEvent {
  id: string;
  user_id: string;
  pattern_id: string;
  date: string;
  note?: string;
}

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const response = await api.get('/calendar');
  return response.data;
};

export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'user_id'>): Promise<CalendarEvent> => {
  const response = await api.post('/calendar', event);
  return response.data;
};

export const updateCalendarEvent = async (id: string, event: Omit<CalendarEvent, 'id' | 'user_id'>): Promise<CalendarEvent> => {
  const response = await api.put(`/calendar/${id}`, event);
  return response.data;
};

export const deleteCalendarEvent = async (id: string): Promise<void> => {
  await api.delete(`/calendar/${id}`);
}; 