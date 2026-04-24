import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 账本 API
export const ledgerAPI = {
  getAll: () => api.get('/ledgers'),
  getById: (id) => api.get(`/ledgers/${id}`),
  create: (data) => api.post('/ledgers', data),
  update: (id, data) => api.put(`/ledgers/${id}`, data),
  delete: (id) => api.delete(`/ledgers/${id}`),
  getAccounts: (id) => api.get(`/ledgers/${id}/accounts`),
  getTransactions: (id) => api.get(`/ledgers/${id}/transactions`),
  getBudgets: (id) => api.get(`/ledgers/${id}/budgets`),
};

// 账户 API
export const accountAPI = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
};

// 分类 API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// 交易 API
export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// 重复交易 API
export const recurringTransactionAPI = {
  getAll: () => api.get('/recurring'),
  getById: (id) => api.get(`/recurring/${id}`),
  create: (data) => api.post('/recurring', data),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  delete: (id) => api.delete(`/recurring/${id}`),
};

// 标签 API
export const tagAPI = {
  getAll: () => api.get('/tags'),
  getById: (id) => api.get(`/tags/${id}`),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`),
};

// 预算 API
export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// 附件 API
export const attachmentAPI = {
  getAll: () => api.get('/attachments'),
  getById: (id) => api.get(`/attachments/${id}`),
  create: (data) => api.post('/attachments', data),
  delete: (id) => api.delete(`/attachments/${id}`),
};

// 统计分析API
export const statisticsAPI = {
	getStatistics: (params) => api.get("/statistics", { params }),
};

// 用户认证API
export const authAPI = {
	register: (data) => api.post("/auth/register", data),
	login: (data) => api.post("/auth/login", data),
};

// 用户API
export const userAPI = {
	getMe: () => api.get("/user/me"),
	updateMe: (data) => api.put("/user/me", data),
};

// 提醒系统API
export const reminderAPI = {
	getAll: () => api.get("/reminders"),
	getPending: () => api.get("/reminders/pending"),
	create: (data) => api.post("/reminders", data),
	update: (id, data) => api.put(`/reminders/${id}`, data),
	delete: (id) => api.delete(`/reminders/${id}`),
	markNotified: (id) => api.put(`/reminders/${id}/mark-notified`),
};

// 智能记账API
export const smartAPI = {
	classify: (data) => api.post("/smart/classify", data),
	learn: (data) => api.post("/smart/learn", data),
	getPatterns: () => api.get("/smart/patterns"),
	deletePattern: (id) => api.delete(`/smart/patterns/${id}`),
};

// 工具函数：设置认证token
export const setAuthToken = (token) => {
	if (token) {
		api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common["Authorization"];
	}
};

export default api;
