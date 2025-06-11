import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

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

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const response = await axios.post(`${API_URL}/token`, formData);
  const data = response.data;
  
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    setAuthToken(data.access_token);
  }
  
  return data;
};

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  await api.post(`/register`, data);
  // 登録後に自動的にログイン
  return login(data.username, data.password);
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const logout = () => {
  setAuthToken(null);
};

// トークンの有効性を確認する関数
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // バックエンドのトークン検証エンドポイントを呼び出す
    await api.get('/validate-token');
    return true;
  } catch (error) {
    logout();
    return false;
  }
}; 