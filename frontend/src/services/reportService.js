import axios from 'axios'

const API_URL = '/api/reports'

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

class ReportService {
  async getReports(filters = {}) {
    const response = await axios.get(API_URL, { 
      ...getAuthHeader(),
      params: filters 
    })
    return response.data
  }

  async exportReport(filters = {}, format = 'csv') {
    const response = await axios.get(`${API_URL}/export`, {
      ...getAuthHeader(),
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  }

  async getActivityLogs(filters = {}) {
    const response = await axios.get(`${API_URL}/activity`, {
      ...getAuthHeader(),
      params: filters
    })
    return response.data
  }
}

export const reportService = new ReportService()