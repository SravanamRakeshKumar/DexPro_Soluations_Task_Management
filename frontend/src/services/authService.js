import axios from 'axios'

// const API_URL = '/api/auth'
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth`; 

class AuthService {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, { email, password })
    return response.data
  }

  async verifyToken(token) {
    const res = await axios.get(`${API_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.user; // assumes your backend returns { user }
  }
}



export const authService = new AuthService()