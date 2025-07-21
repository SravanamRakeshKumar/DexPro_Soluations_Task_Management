import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Copy, Plus, Edit, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';

const roleColors = {
  Admin: 'bg-red-100 text-red-800',
  'Team Lead': 'bg-purple-100 text-purple-800',
  Coordinator: 'bg-blue-100 text-blue-800',
  Employee: 'bg-green-100 text-green-800',
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    isActive: true,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [copiedUserId, setCopiedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
const [selectedRole, setSelectedRole] = useState('');
const [selectedStatus, setSelectedStatus] = useState('');


  const fetchUsers = async () => {
    const res = await axios.get('/api/users');
    setUsers(res.data);
  };



  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
  const fetchFilteredUsers = async () => {
    let res = await axios.get('/api/users');
    let filtered = res.data;

    if (searchQuery) {
      filtered = filtered.filter(
        u =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    if (selectedStatus) {
      filtered = filtered.filter(u =>
        selectedStatus === 'active' ? u.isActive : !u.isActive
      );
    }

    setUsers(filtered);
  };

  fetchFilteredUsers();
}, [searchQuery, selectedRole, selectedStatus]);


  const handleAddUser = async () => {
    const res = await axios.post('/api/users', newUser);
    setUsers([...users, res.data]);
    setIsAdding(false);
    resetForm();
  };

  const handleEditUser = async () => {
    const res = await axios.put(`/api/users/${editingUser._id}`, editingUser);
    setUsers(users.map(user => user._id === editingUser._id ? res.data : user));
    setIsEditing(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete this user?')) {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    }
  };

  const handleCopy = (email, id) => {
    navigator.clipboard.writeText(`Email: ${email}`);
    setCopiedUserId(id);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const resetForm = () => {
    setNewUser({ name: '', email: '', password: '', role: 'Employee', isActive: true });
  };

  return (
    <div className="space-y-6 text-gray-800">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card title="Total Users(including you)" count={users.length} color="text-gray-800" />
        {/* <Card title="Coordinators" count={users.filter(u => u.isActive).length} color="text-green-600" /> */}
        <Card title="Coordinators" count={users.filter(u => u.role === 'Coordinator').length} color="text-green-600" />
        <Card title="Team Leads" count={users.filter(u => u.role === 'Team Lead').length} color="text-red-600" />
        <Card title="Employees" count={users.filter(u => u.role === 'Employee').length} color="text-blue-600" />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">

  {/* Left Section: Search + Add User (60%) */}
  <div className="w-full lg:w-[45%] flex flex-col sm:flex-row items-center gap-2">
    <input
      type="text"
      placeholder="Search by name or email"
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <button
      onClick={() => setIsAdding(true)}
      className="btn-primary whitespace-nowrap px-4 py-2 rounded-lg"
    >
      <Plus className="inline-block mr-1" size={16} />
      Add User
    </button>
  </div>

  {/* Right Section: Filter by Role + Status (40%) */}
  <div className="w-full lg:w-[35%] flex flex-col sm:flex-row items-center gap-4 ml-auto">
    <select
      value={selectedRole}
      onChange={(e) => setSelectedRole(e.target.value)}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg w-full"
    >
      <option value="">Filter by Role</option>
      <option value="Employee">Employee</option>
      <option value="Coordinator">Coordinator</option>
      <option value="Team Lead">Team Lead</option>
    </select>

    <select
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg w-full"
    >
      <option value="">Filter by Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>
</div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Created</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <button
                    onClick={() => handleCopy(user.email, user._id)}
                    className="text-blue-600 text-xs mt-1 flex items-center"
                  >
                    <Copy size={16} className="mr-1" /> Copy Email
                  </button>
                  {copiedUserId === user._id && <p className="text-green-500 text-xs">Copied!</p>}
                </td>
                <td className="px-6 py-4">
                  <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', roleColors[user.role])}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx('text-xs font-medium', user.isActive ? 'text-green-600' : 'text-red-600')}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => { setEditingUser(user); setIsEditing(true); }} className="text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteUser(user._id)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(isAdding || isEditing) && (
        <UserModal
          user={isAdding ? newUser : editingUser}
          setUser={isAdding ? setNewUser : setEditingUser}
          onClose={() => {
            setIsAdding(false);
            setIsEditing(false);
            setEditingUser(null);
          }}
          onSave={isAdding ? handleAddUser : handleEditUser}
        />
      )}
    </div>
  );
};

const Card = ({ title, count, color }) => (
  <div className="bg-white p-4 rounded shadow border border-gray-200">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{count}</p>
  </div>
);

const UserModal = ({ user, setUser, onClose, onSave }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{user?._id ? 'Edit User' : 'Add New User'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} className="input w-full" placeholder="Full Name" />
        <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} className="input w-full" placeholder="Email" />
        <input type="text" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} className="input w-full" placeholder="Password" />
        <select value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })} className="input w-full">
          <option value="Admin">Admin</option>
          <option value="Team Lead">Team Lead</option>
          <option value="Coordinator">Coordinator</option>
          <option value="Employee">Employee</option>
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={user.isActive} onChange={(e) => setUser({ ...user, isActive: e.target.checked })} />
          <span>Active</span>
        </label>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onSave} className="btn-primary">{user?._id ? 'Save' : 'Add User'}</button>
      </div>
    </div>
  </div>
);

export default UsersPage;