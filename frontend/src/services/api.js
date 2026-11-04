const API_BASE = '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  async get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}${endpoint}${queryString}`, {
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
  },

  async post(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  async put(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  async patch(endpoint, body = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  async delete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
  }
};

