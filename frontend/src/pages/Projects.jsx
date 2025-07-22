import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, FolderOpen, Edit2, Trash2 } from 'lucide-react'
// import { toast } from 'react-hot-toast'
import { toast } from 'react-toastify';
import ProjectCard from '../components/ProjectCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { projectService } from '../services/projectService'
import   userService  from '../services/userService'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [employees, setEmployees] = useState([])

 

  const emptyProject = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'active',
  teamLead: [],
  teamCoordinators: [],
  teamMembers: [],
  tempTeamLead: '',
  tempCoordinator: '',
  tempMember: ''
}

  const [formData, setFormData] = useState(emptyProject)

  useEffect(() => {
    loadProjects()
    loadUsers()
  }, [])



const loadProjects = async () => {
  try {
    const data = await projectService.getProjects()
       console.log(data.projects)
    if (data?.projects) {
      setProjects(data.projects)
    } else {
      console.error("Unexpected response:", data)
      toast.error("Failed to load projects: unexpected response")
    }
  } catch (error) {
    console.error("Error loading projects:", error)
    toast.error("Error loading projects")
  } finally {
    setLoading(false)  // ✅ This line is missing
  }
}






const loadUsers = async () => {
  try {
    const users = await userService.getUsers();
    console.log("Loaded users:", users);  // Should be an array
    setEmployees(users);
  } catch (error) {
    console.error("Failed to load users:", error);
    toast.error('Failed to load users');
  }
}


  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        await projectService.updateProject(editingId, formData)
        toast.success('Project updated!')
      } else {
        await projectService.createProject(formData)
        toast.success('Project created!')
      }
      setShowModal(false)
      setFormData(emptyProject)
      setIsEditing(false)
      setEditingId(null)
      loadProjects()
    } catch (error) {
      toast.error('Failed to save project')
    }
  }

  const handleEdit = (project) => {
  setIsEditing(true)
  setEditingId(project._id)

  setFormData({
    ...emptyProject,
    ...project,
    teamLead: project.teamLead || [],
    teamCoordinators: project.teamCoordinators || [],
    teamMembers: project.teamMembers || [],
    tempTeamLead: '',
    tempCoordinator: '',
    tempMember: ''
  })

  setShowModal(true)
}



  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      try {
        await projectService.deleteProject(id)
        toast.success('Project deleted')
        loadProjects()
      } catch (error) {
        toast.error('Failed to delete project')
      }
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter ? project.status === statusFilter : true
    return matchSearch && matchStatus
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="xl" /></div>
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-500">Manage and assign team projects</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
          <Plus className="mr-2" size={18} /> New Project
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
  {/* Search Bar - 60% on md+ */}
  <div className="relative w-full md:w-[60%]">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
    <input
      type="text"
      placeholder="Search projects..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="input pl-10 w-full"
    />
  </div>

  {/* Filter Dropdown - 40% on md+ */}
  <div className="w-full md:w-[40%]">
    <select
      className="input w-full"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="onhold">On Hold</option>
      <option value="completed">Completed</option>
    </select>
  </div>
</div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project._id}
            project={project}
            onEdit={() => handleEdit(project)}
            onDelete={() => handleDelete(project._id)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-gray-500">Try changing filters or create a new project.</p>
        </div>
      )}


      

      {showModal && (
  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {isEditing ? 'Edit' : 'Create'} Project
      </h2>

      <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-gray-800">

        {/* Project Name */}
        <input
          type="text"
          required
          placeholder="Project Name"
          className="input w-full text-black"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        {/* Description */}
        <textarea
          rows="3"
          placeholder="Description"
          className="input w-full text-black"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            className="input text-black"
            value={formData.startDate?.slice(0, 10)}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <input
            type="date"
            className="input text-black"
            value={formData.endDate?.slice(0, 10)}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        {/* Status */}
        <select
          className="input w-full text-black"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="onhold">On Hold</option>
        </select>

        {/* Team Lead */}
        <div>
          <label className="text-sm font-medium">Select Team Lead</label>
          <div className="flex gap-2 items-center">
            <select
              className="input text-black flex-1"
              value={formData.tempTeamLead || ''}
              onChange={(e) => setFormData({ ...formData, tempTeamLead: e.target.value })}
            >
              <option value="">Select Team Lead</option>
              {employees.filter(emp => emp.role === 'Team Lead').map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (formData.tempTeamLead && !formData.teamLead.includes(formData.tempTeamLead)) {
                  setFormData({
                    ...formData,
                    teamLead: [...formData.teamLead, formData.tempTeamLead],
                    tempTeamLead: ''
                  })
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>


          <div className="mt-2 flex flex-wrap gap-2">
  {formData.teamLead.map((entry) => {
    // Determine if it's an ID or full user object
    const user = typeof entry === 'string'
      ? employees.find((e) => e._id === entry)
      : entry

    return (
      <span
        key={user?._id || entry}
        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
      >
        {user?.name || 'Unknown'}
        <button
          type="button"
          onClick={() =>
            setFormData({
              ...formData,
              teamLead: formData.teamLead.filter((u) =>
                typeof u === 'string' ? u !== entry : u._id !== user._id
              )
            })
          }
          className="ml-1 text-red-600 hover:text-red-800 font-bold"
        >
          ×
        </button>
      </span>
    )
  })}
</div>

        </div>

        {/* Coordinators */}
        <div>
          <label className="text-sm font-medium">Select Coordinators</label>
          <div className="flex gap-2 items-center">
            <select
              className="input text-black flex-1"
              value={formData.tempCoordinator || ''}
              onChange={(e) => setFormData({ ...formData, tempCoordinator: e.target.value })}
            >
              <option value="">Select Coordinator</option>
              {employees.filter(emp => emp.role === 'Coordinator').map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (formData.tempCoordinator && !formData.teamCoordinators.includes(formData.tempCoordinator)) {
                  setFormData({
                    ...formData,
                    teamCoordinators: [...formData.teamCoordinators, formData.tempCoordinator],
                    tempCoordinator: ''
                  })
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
  {formData.teamCoordinators.map((entry) => {
    const user = typeof entry === 'string'
      ? employees.find((e) => e._id === entry)
      : entry

    return (
      <span
        key={user?._id || entry}
        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
      >
        {user?.name || 'Unknown'}
        <button
          type="button"
          onClick={() =>
            setFormData({
              ...formData,
              teamCoordinators: formData.teamCoordinators.filter((u) =>
                typeof u === 'string' ? u !== entry : u._id !== user._id
              )
            })
          }
          className="ml-1 text-red-600 hover:text-red-800 font-bold"
        >
          ×
        </button>
      </span>
    )
  })}
</div>
        </div>

        {/* Team Members */}
        <div>
          <label className="text-sm font-medium">Select Team Members</label>
          <div className="flex gap-2 items-center">
            <select
              className="input text-black flex-1"
              value={formData.tempMember || ''}
              onChange={(e) => setFormData({ ...formData, tempMember: e.target.value })}
            >
              <option value="">Select Member</option>
              {employees.filter(emp => emp.role === 'Employee').map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (formData.tempMember && !formData.teamMembers.includes(formData.tempMember)) {
                  setFormData({
                    ...formData,
                    teamMembers: [...formData.teamMembers, formData.tempMember],
                    tempMember: ''
                  })
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {/* Display added members */}
          <div className="mt-2 flex flex-wrap gap-2">
  {formData.teamMembers.map((entry) => {
    const user = typeof entry === 'string'
      ? employees.find((e) => e._id === entry)
      : entry

    return (
      <span
        key={user?._id || entry}
        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
      >
        {user?.name || 'Unknown'}
        <button
          type="button"
          onClick={() =>
            setFormData({
              ...formData,
              teamMembers: formData.teamMembers.filter((u) =>
                typeof u === 'string' ? u !== entry : u._id !== user._id
              )
            })
          }
          className="ml-1 text-red-600 hover:text-red-800 font-bold"
        >
          ×
        </button>
      </span>
    )
  })}
</div>

        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => {
              setShowModal(false)
              setIsEditing(false)
              setEditingId(null)
              setFormData(emptyProject)
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? 'Update' : 'Create'} Project
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </div>
  )
}

export default Projects
