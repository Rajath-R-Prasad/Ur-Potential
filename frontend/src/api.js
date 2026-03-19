export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) { }
    throw new Error(errorMsg);
  }

  return response.json();
};

export const api = {
  login: (email, password) => request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  signup: (email, password) => request('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getTasks: () => request('/tasks'),
  createTask: (title) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  }),
  updateTask: (id, updates) => request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteTask: (id) => request(`/tasks/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => request('/stats'),
  logSession: (taskId, duration, completed) => request('/sessions', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, duration, completed }),
  })
};
