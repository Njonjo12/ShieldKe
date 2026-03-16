const API_BASE = 'http://localhost:5000/api';

export const loginRequest = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const fetchLawyerProfile = async (token) => {
  const res = await fetch(`${API_BASE}/lawyers/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
