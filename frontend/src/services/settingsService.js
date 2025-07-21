import axios from 'axios'

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/settings`

class SettingsService {
  async getProfile() {
    const token = localStorage.getItem('token')
    const res = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  }

  async updateProfile(updatedData) {
    const token = localStorage.getItem('token')
    const res = await axios.put(`${API_URL}/profile`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  }

  async changePassword(data) {
    const token = localStorage.getItem('token')
    const res = await axios.post(`${API_URL}/change-password`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  }

  async deactivateAccount() {
    const token = localStorage.getItem('token')
    const res = await axios.post(`${API_URL}/deactivate`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  }
}

export default new SettingsService()