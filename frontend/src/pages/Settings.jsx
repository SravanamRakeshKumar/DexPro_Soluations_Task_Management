import React, { useEffect, useState } from 'react';
import settingsService from '../services/settingsService';
// import { toast } from 'react-toastify';
import { toast } from 'react-toastify';


const Settings = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await settingsService.getProfile();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        qualification: userData.qualification || '',
        gender: userData.gender || ''
      });
    } catch (err) {
      console.error('Failed to load user:', err);
      toast.error('Failed to load user data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (field) => {
    setLoading(true);
    try {
      await settingsService.updateProfile({ [field]: formData[field] });
      toast.success(`${field} updated successfully`);
      setEditingField(null);
      loadUser();
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(`Failed to update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-7">
      {/* <h2 className="text-3xl font-bold text-blue-900 mb-6">Settings</h2> */}

      {/* Personal Section */}
        {/* <h2 className="text-xl font-semibold text-blue-700 mb-4">Personal Details</h2> */}
      <h2 className="text-3xl font-bold text-blue-700 -ml-10">Personal Details</h2>

      <section className="bg-white border shadow rounded-lg p-6 space-y-6">
        {/* <h3 className="text-xl font-semibold text-blue-700 mb-4">Personal Details</h3> */}
        {['name', 'email', 'phone', 'address', 'qualification', 'gender'].map((field) => (
          <div key={field} className="flex items-center justify-between">
            <div className="w-2/3">
              <label className="block font-medium text-gray-700 capitalize">{field}</label>
              {editingField === field ? (
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 mt-1">{formData[field]}</p>
              )}
            </div>
            <div className="text-right">
              {editingField === field ? (
                <button
                  onClick={() => handleSave(field)}
                  className="bg-blue-600 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              ) : (
                <button
                  onClick={() => setEditingField(field)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Password Row */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block font-medium text-gray-700">Password</label>
          </div>
          <div>
            <button
              onClick={() => toast.info('Redirecting to change password...')}
              className="text-blue-600 hover:underline"
            >
              Change Password
            </button>
          </div>
        </div>
      </section>

      {/* Professional Section */}
        {/* <h1 className="text-xl font-semibold text-blue-700 mb-4">Professional Details</h1> */}
      <h2 className="text-3xl font-bold text-blue-700 -ml-10">Professional Details</h2>

      <section className="bg-white border shadow rounded-lg p-6 space-y-6">
        {/* <h3 className="text-xl font-semibold text-blue-700 mb-4">Professional Details</h3> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="Role" value={user.role} />
          <Info label="Experience" value={user.experience || 'N/A'} />
          <Info label="Salary" value={user.role === 'Admin' ? user.salary || 'Confidential' : 'Restricted'} />
          <Info label="Joined Date" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>

        {/* Responsibilities */}
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Responsibilities</h4>
          {user.role === 'Admin' && (
            <>
              <ToolCard title="Manage Users">Create, update, or deactivate users.</ToolCard>
              <ToolCard title="Oversee Projects">View all team progress & deadlines.</ToolCard>
              <ToolCard title="Audit Logs">Track system activities and usage.</ToolCard>
            </>
          )}
          {user.role === 'Team Lead' && (
            <>
              <ToolCard title="Assigned Projects">Monitor task progress and deadlines.</ToolCard>
              <ToolCard title="Team Management">Help team resolve blockers.</ToolCard>
            </>
          )}
          {user.role === 'Coordinator' && (
            <>
              <ToolCard title="Project Coordination">Assist with task follow-ups.</ToolCard>
              <ToolCard title="Status Communication">Share updates via Email/SMS.</ToolCard>
            </>
          )}
          {user.role === 'Employee' && (
            <>
              <ToolCard title="Assigned Tasks">Work on daily assigned tasks.</ToolCard>
              <ToolCard title="Worklogs">Track and log task hours daily.</ToolCard>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <label className="block font-medium text-gray-700 mb-1">{label}</label>
    <p className="text-gray-800">{value}</p>
  </div>
);

const ToolCard = ({ title, children }) => (
  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
    <h5 className="text-blue-800 font-semibold mb-1">{title}</h5>
    <p className="text-sm text-blue-700">{children}</p>
  </div>
);

export default Settings;
