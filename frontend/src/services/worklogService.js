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











// // src/services/worklogService.js
// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('token')}`,
//   },
// });

// export const worklogService = {
//   // Get logs for current user (Employee)
//   getUserLogs: async () => {
//     const res = await API.get('/worklogs/my');
//     return res.data;
//   },

//   // Get all logs (Admin, Coordinator, Team Lead)
//   getAllWorkLogs: async () => {
//     const res = await API.get('/worklogs');
//     return res.data;
//   },

//   // Create a worklog
//   logWork: async (data) => {
//     const res = await API.post('/worklogs', data);
//     return res.data;
//   },

//   // Update worklog
//   updateWorkLog: async (id, data) => {
//     const res = await API.put(`/worklogs/${id}`, data);
//     return res.data;
//   },

//   // (Optional) Filtered logs by project, task, user, date
//   getFilteredLogs: async ({ projectId, taskId, userId, from, to }) => {
//     const params = new URLSearchParams();
//     if (projectId) params.append('projectId', projectId);
//     if (taskId) params.append('taskId', taskId);
//     if (userId) params.append('userId', userId);
//     if (from) params.append('from', from);
//     if (to) params.append('to', to);

//     const res = await API.get(`/worklogs/filter?${params.toString()}`);
//     return res.data;
//   }
// };












// // src/services/worklogService.js
// import axios from 'axios'

// const API = axios.create({
//   baseURL: '/api/worklogs',
// })

// // Attach Authorization header for each request
// API.interceptors.request.use(config => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// const worklogService = {
//   getAllWorkLogs: () => API.get('/').then(res => res.data),
//   getUserLogs: () => API.get('/my').then(res => res.data),
//   logWork: (data) => API.post('/', data).then(res => res.data),
//   updateWorkLog: (id, data) => API.put(`/${id}`, data).then(res => res.data),
//   getFilteredLogs: (filters) => {
//     const params = new URLSearchParams()
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value) params.append(key, value)
//     })
//     return API.get(`/filter?${params}`).then(res => res.data)
//   }
// }

// export { worklogService }













// // src/services/worklogService.js
// import axios from 'axios'

// const API_URL = '/api/worklogs'

// const getAuthHeader = () => ({
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   }
// })

// class WorklogService {
//   // 🟢 1. Get all logs (for admin, team lead, coordinator)
//   async getAllWorkLogs() {
//     const res = await axios.get(API_URL, getAuthHeader())
//     return res.data
//   }

//   // 🟢 2. Get only current user's logs (for employee)
//   async getUserLogs() {
//     const res = await axios.get(`${API_URL}/my`, getAuthHeader())
//     return res.data
//   }

//   // 🟢 3. Create a new worklog
//   async logWork(worklogData) {
//     const res = await axios.post(API_URL, worklogData, getAuthHeader())
//     return res.data
//   }

//   // 🟢 4. Update a worklog (e.g., add new time)
//   async updateWorkLog(worklogId, updatedData) {
//     const res = await axios.put(`${API_URL}/${worklogId}`, updatedData, getAuthHeader())
//     return res.data
//   }

//   // 🟡 5. Optional: Get logs with filters (future enhancement)
//   async getFilteredLogs({ projectId, taskId, userId, from, to }) {
//     const params = new URLSearchParams()
//     if (projectId) params.append('projectId', projectId)
//     if (taskId) params.append('taskId', taskId)
//     if (userId) params.append('userId', userId)
//     if (from) params.append('from', from)
//     if (to) params.append('to', to)

//     const res = await axios.get(`${API_URL}/filter?${params.toString()}`, getAuthHeader())
//     return res.data
//   }
// }

// export const worklogService = new WorklogService()






// // src/services/worklogService.js
// import axios from 'axios'

// const API_URL = '/api/worklogs'

// const getAuthHeader = () => ({
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   }
// })

// class WorklogService {
//   // Fetch current user's logs
//   async getUserLogs() {
//     const res = await axios.get(`${API_URL}/my`, getAuthHeader())
//     return res.data
//   }

//   // Create a new worklog
//   async logWork(worklogData) {
//     const res = await axios.post(API_URL, worklogData, getAuthHeader())
//     return res.data
//   }

//   // Update an existing worklog (e.g., append to todayTimeSpent)
//   async updateWorkLog(worklogId, updatedData) {
//     const res = await axios.put(`${API_URL}/${worklogId}`, updatedData, getAuthHeader())
//     return res.data
//   }
// }

// export const worklogService = new WorklogService()
