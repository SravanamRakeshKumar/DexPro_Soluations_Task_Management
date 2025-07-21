// src/services/worklogService.js
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL:  `${backendUrl}/api`,
});

// Token should be fresh per request
const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const worklogService = {
  getUserLogs: async () => {
    const res = await API.get('/worklogs/my', getAuthHeader());
    return res.data;
  },

  getAllWorkLogs: async () => {
    const res = await API.get('/worklogs', getAuthHeader());
    return res.data;
  },

  logWork: async (data) => {
    const res = await API.post('/worklogs', data, getAuthHeader());
    return res.data;
  },

  updateWorkLog: async (id, data) => {
    const res = await API.put(`/worklogs/${id}`, data, getAuthHeader());
    return res.data;
  },

  getFilteredLogs: async ({ projectId, taskId, userId, from, to }) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (taskId) params.append('taskId', taskId);
    if (userId) params.append('userId', userId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const res = await API.get(`/worklogs/filter?${params.toString()}`, getAuthHeader());
    return res.data;
  },
};
