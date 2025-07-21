import axios from 'axios'

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/projects`

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

class ProjectService {
  async getProjects() {
    const response = await axios.get(API_URL, getAuthHeader())
    return response.data
  }
  

  async createProject(projectData) {
    const response = await axios.post(API_URL, projectData, getAuthHeader())
    return response.data
  }

  async updateProject(id, projectData) {
    const response = await axios.put(`${API_URL}/${id}`, projectData, getAuthHeader())
    return response.data
  }

  async deleteProject(id) {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader())
    return response.data
  }
}

export const projectService = new ProjectService()