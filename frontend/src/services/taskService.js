import axios from 'axios'

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/tasks`

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