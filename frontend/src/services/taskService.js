import axios from 'axios'

const API_URL = '/api/tasks'

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

class TaskService {
  async getTasks() {
    const res = await axios.get(API_URL, getAuthHeader())
    return res.data
  }

  async createTask(task) {
    const res = await axios.post(API_URL, task, getAuthHeader())
    return res.data
  }

  async updateTask(id, updatedTask) {
    const res = await axios.put(`${API_URL}/${id}`, updatedTask, getAuthHeader())
    return res.data
  }

  async deleteTask(id) {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader())
    return res.data
  }
}

export const taskService = new TaskService()








// import axios from 'axios';

// const getAuthHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// });

// export const taskService = {
//   getTasks: async () => {
//     const res = await axios.get('/api/tasks', getAuthHeader());
//     return res.data;
//   },

//   createTask: async (task) => {
//     const res = await axios.post('/api/tasks', task, getAuthHeader());
//     return res.data;
//   },

//   updateTask: async (id, updates) => {
//     const res = await axios.put(`/api/tasks/${id}`, updates, getAuthHeader());
//     return res.data;
//   },

//   deleteTask: async (id) => {
//     const res = await axios.delete(`/api/tasks/${id}`, getAuthHeader());
//     return res.data;
//   },
// };


// export const taskService = {
//   getTasks: async () => {
//     const res = await axios.get('/api/tasks');
//     return res.data;
//   },

//   createTask: async (task) => {
//     const res = await axios.post('/api/tasks', task);
//     return res.data;
//   },

//   updateTask: async (id, updates) => {
//     const res = await axios.put(`/api/tasks/${id}`, updates);
//     return res.data;
//   },

//   deleteTask: async (id) => {
//     const res = await axios.delete(`/api/tasks/${id}`);
//     return res.data;
//   },
// };


// import axios from 'axios'

// const API_URL = '/api/tasks'

// const getAuthHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// })

// class TaskService {
//   async getTasks(filters = {}) {
//     const response = await axios.get(API_URL, { 
//       ...getAuthHeader(),
//       params: filters 
//     })
//     return response.data
//   }

//   async createTask(taskData) {
//     const response = await axios.post(API_URL, taskData, getAuthHeader())
//     return response.data
//   }

//   async updateTask(id, taskData) {
//     const response = await axios.put(`${API_URL}/${id}`, taskData, getAuthHeader())
//     return response.data
//   }

//   async addComment(id, comment) {
//     // const response = await axios.post(`${API_URL}/${id}/comment`, { comment }, getAuthHeader())
//     return response.data
//   }

//   async uploadAttachment(id, formData) {
//     const response = await axios.post(`${API_URL}/${id}/upload`, formData, {
//       ...getAuthHeader(),
//       headers: {
//         ...getAuthHeader().headers,
//         'Content-Type': 'multipart/form-data'
//       }
//     })
//     return response.data
//   }
// }

// export const taskService = new TaskService()