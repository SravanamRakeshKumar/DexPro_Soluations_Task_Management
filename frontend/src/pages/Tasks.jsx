import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
// import { toast } from 'react-hot-toast'
import { toast } from 'react-toastify';
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'todo',
    projectId: '',
    assignedTo: ''
  })

  useEffect(() => {
    loadProjects()
    loadTasks()
  }, [])

  const loadProjects = async () => {
  try {
    const data = await projectService.getProjects()
    console.log(data)
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
    setLoading(false)
  }
}


  const loadTasks = async () => {
  try {
    const data = await taskService.getTasks();
    setTasks(Array.isArray(data) ? data : []); // FIX: handle array directly
  } catch (e) {
    toast.error('Failed to load tasks');
  } finally {
    setLoading(false);
  }
};


  const handleProjectChange = (projectId) => {
    const project = projects.find((p) => p._id === projectId)
    setFormData({ ...formData, projectId, assignedTo: '' })
    setTeamMembers(project?.teamMembers || [])
  }

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      status: 'todo',
      projectId: '',
      assignedTo: ''
    })
    setEditingTask(null)
    setTeamMembers([])
    setShowModal(true)
  }

  const openEditModal = (task) => {
    const project = projects.find((p) => p._id === task.projectId)
    setTeamMembers(project?.teamMembers || [])
    setFormData({ ...task })
    setEditingTask(task)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, formData)
        toast.success('Task updated')
      } else {
        await taskService.createTask(formData)
        toast.success('Task created')
      }
      setShowModal(false)
      loadTasks()
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskService.deleteTask(id)
      toast.success('Task deleted')
      loadTasks()
    } catch {
      toast.error('Delete failed')
    }
  }


  const filteredTasks = tasks.filter((task) => {
  return (
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === '' || task.status === filterStatus) &&
    (filterProjectId === '' || task.projectId === filterProjectId)
  )
})


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Task
        </button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          className="input"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
  className="input text-black bg-white" // or text-gray-800
  value={filterProjectId}
  onChange={(e) => setFilterProjectId(e.target.value)}
>
  <option value="">All Projects</option>
  {projects.map(project => (
    <option key={project._id} value={project._id}>
      {project.name || project.title || 'Untitled'}
    </option>
  ))}
</select>


        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
        </div>

      {/* Task Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full  rounded-lg shadow">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-3">Project</th>
              <th className="p-3">Task</th>
              <th className="p-3">User</th>
              <th className="p-3">Deadline</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => {
              const project = projects.find((p) => p._id === task.projectId)
              const assignedUser = project?.teamMembers?.find((u) => u._id === task.assignedTo)
              return (
                <tr key={task._id} className="border-t">
                  <td className="p-3">{project?.name || 'N/A'}</td>
                  <td className="p-3">{task.title}</td>
                  <td className="p-3">{assignedUser?.name || 'N/A'}</td>
                  {/* <td className="p-3">{task.deadline}</td> */}
                  <td className="p-3">{new Date(task.deadline).toLocaleDateString()}</td>

                  <td className="p-3 capitalize">{task.status}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => openEditModal(task)} className="btn btn-sm btn-outline">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="btn btn-sm btn-danger">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <p className="text-center text-gray-500 py-4">No tasks available</p>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                required
                className="input w-full"
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>

              <select
                required
                className="input w-full"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Assign to</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Task Title"
                className="input w-full"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <input
                type="date"
                className="input w-full"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />

            
              <textarea
  placeholder="Task Description"
  className="input w-full"
  value={formData.description}
  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
/>


              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary w-full">
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-full">
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
