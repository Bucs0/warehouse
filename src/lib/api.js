const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ========== AUTH API ==========
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  signup: (userData) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getPendingUsers: () => apiCall('/users/pending'),
  getApprovedUsers: () => apiCall('/users/approved'),
  approveUser: (userId) => apiCall(`/users/${userId}/approve`, { method: 'POST' }),
  rejectUser: (userId) => apiCall(`/users/${userId}/reject`, { method: 'DELETE' }),
};

// ========== INVENTORY API ==========
export const inventoryAPI = {
  getAll: () => apiCall('/inventory'),
  getById: (id) => apiCall(`/inventory/${id}`),
  add: (item) => apiCall('/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  update: (id, item) => apiCall(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  delete: (id) => apiCall(`/inventory/${id}`, { method: 'DELETE' }),
};

// ========== CATEGORIES API ==========
export const categoriesAPI = {
  getAll: () => apiCall('/categories'),
  add: (category) => apiCall('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  }),
  update: (id, category) => apiCall(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  }),
  delete: (id) => apiCall(`/categories/${id}`, { method: 'DELETE' }),
};

// ========== LOCATIONS API ==========
export const locationsAPI = {
  getAll: () => apiCall('/locations'),
  add: (location) => apiCall('/locations', {
    method: 'POST',
    body: JSON.stringify(location),
  }),
  update: (id, location) => apiCall(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(location),
  }),
  delete: (id) => apiCall(`/locations/${id}`, { method: 'DELETE' }),
};

// ========== SUPPLIERS API ==========
export const suppliersAPI = {
  getAll: () => apiCall('/suppliers'),
  add: (supplier) => apiCall('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  }),
  update: (id, supplier) => apiCall(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(supplier),
  }),
  delete: (id) => apiCall(`/suppliers/${id}`, { method: 'DELETE' }),
};

// ========== TRANSACTIONS API ==========
export const transactionsAPI = {
  getAll: () => apiCall('/transactions'),
  add: (transaction) => apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  }),
};

// ========== APPOINTMENTS API ==========
export const appointmentsAPI = {
  getAll: () => apiCall('/appointments'),
  add: (appointment) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment),
  }),
  update: (id, appointment) => apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointment),
  }),
  complete: (id, userId) => apiCall(`/appointments/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  cancel: (id) => apiCall(`/appointments/${id}/cancel`, { method: 'POST' }),
};

// ========== DAMAGED ITEMS API ==========
export const damagedItemsAPI = {
  getAll: () => apiCall('/damaged-items'),
  update: (id, data) => apiCall(`/damaged-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/damaged-items/${id}`, { method: 'DELETE' }),
};

// ========== ACTIVITY LOGS API ==========
export const activityLogsAPI = {
  getAll: () => apiCall('/activity-logs'),
  add: (log) => apiCall('/activity-logs', {
    method: 'POST',
    body: JSON.stringify(log),
  }),
};

// ========== LOW STOCK ALERTS API ==========
export const lowStockAlertsAPI = {
  getLowStockItems: () => apiCall('/low-stock-items'),
  getPendingAlerts: () => apiCall('/low-stock-alerts/pending'),
  markAsSent: (itemId) => apiCall(`/low-stock-alerts/${itemId}`, { method: 'POST' }),
  clearAlert: (itemId) => apiCall(`/low-stock-alerts/${itemId}`, { method: 'DELETE' }),
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  getStats: () => apiCall('/dashboard/stats'),
};

// ========== REPORTS API ==========
export const reportsAPI = {
  getActivityLogs: (filters) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/reports/activity-logs?${params}`);
  },
  getInventoryReport: () => apiCall('/reports/inventory'),
  getTransactionsReport: (filters) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/reports/transactions?${params}`);
  },
};