import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;


const API = axios.create({ baseURL: `${backendUrl}/api` });

const userService = {
  // Get all users
  // const userService = {
  getUsers: async () => {
    const res = await API.get('/users');
    return res.data;  // ✅ return only data
  },
  // Add a user
  addUser: (userData) => API.post('/users', userData),

  // Update a user by ID
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),

  // Delete a user by ID
  deleteUser: (id) => API.delete(`/users/${id}`)
};

export default userService;
