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

export interface PatternTime {
  time: string;
  sound: string;
  volume: number;
  gradual_increase: boolean;
  snooze_duration: number;
}

export interface Pattern {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  times: PatternTime[];
  created_at: string;
  updated_at: string;
}

export interface CreatePatternRequest {
  name: string;
  description?: string;
  color: string;
  times: PatternTime[];
}

export const getPatterns = async (): Promise<Pattern[]> => {
  const response = await api.get(`/patterns`);
  return response.data.patterns || [];
};

// 後方互換性のために残す
export const fetchPatterns = async () => {
  const patterns = await getPatterns();
  return { patterns };
};

export const createPattern = async (pattern: CreatePatternRequest): Promise<Pattern> => {
  const response = await api.post(`/patterns`, pattern);
  return response.data;
};

export const updatePattern = async (id: string, pattern: CreatePatternRequest): Promise<Pattern> => {
  const response = await api.put(`/patterns/${id}`, pattern);
  return response.data;
};

export const deletePattern = async (id: string): Promise<void> => {
  await api.delete(`/patterns/${id}`);
}; 