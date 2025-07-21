import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
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

              {/* <select
                className="input w-full"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select> */}

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








// // ✅ IMPORTS
// import React, { useState, useEffect } from 'react'
// import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react'
// import { toast } from 'react-hot-toast'
// import { taskService } from '../services/taskService'
// import { projectService } from '../services/projectService'

// const Tasks = () => {
//   const [tasks, setTasks] = useState([])
//   const [projects, setProjects] = useState([])
//   const [loading, setLoading] = useState(true)
  // const [searchTerm, setSearchTerm] = useState('')
  // const [statusFilter, setStatusFilter] = useState('')
  // const [projectFilter, setProjectFilter] = useState('')
//   const [editingTask, setEditingTask] = useState(null)
//   const [showModal, setShowModal] = useState(false)

//   const emptyTask = {
//     title: '',
//     description: '',
//     deadline: '',
//     priority: 'medium',
//     status: 'todo',
//     projectId: ''
//   }

//   const [formData, setFormData] = useState(emptyTask)

//   useEffect(() => {
//     loadTasks()
//     loadProjects()
//   }, [])

//   // const loadTasks = async () => {
//   //   try {
//   //     const res = await taskService.getTasks()
//   //     setTasks(res.tasks || [])
//   //   } catch (err) {
//   //     toast.error('Failed to fetch tasks')
//   //   } finally {
//   //     setLoading(false)
//   //   }
//   // }


//     const loadTasks = async () => {
//   try {
//     const data = await taskService.getTasks()
//     console.log("Loaded task data:", data)
//     // setTasks([data.tasks])
//     // ✅ Corrected handling
//     if (Array.isArray(data.tasks)) {
//       setTasks(data)
//     } else {
//       setTasks([]) // fallback
//     }
//   } catch (error) {
//     toast.error('Failed to load tasks')
//     console.error('loadTasks error:', error.response?.data || error.message)
//     setTasks([])
//   } finally {
//     setLoading(false)
//   }
// }


//   const loadProjects = async () => {
//     try {
//       const res = await projectService.getProjects()
//       setProjects(res.projects || [])
//     } catch (err) {
//       toast.error('Failed to fetch projects')
//     }
//   }

//   const openEditModal = (task) => {
//     setEditingTask(task)
//     setFormData({ ...task })
//     setShowModal(true)
//   }

//   const openCreateModal = () => {
//     setEditingTask(null)
//     setFormData(emptyTask)
//     setShowModal(true)
//   }

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure to delete this task?')) return
//     try {
//       await taskService.deleteTask(id)
//       toast.success('Task deleted!')
//       loadTasks()
//     } catch {
//       toast.error('Failed to delete task')
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       if (editingTask) {
//         await taskService.updateTask(editingTask._id, formData)
//         toast.success('Task updated!')
//       } else {
//         await taskService.createTask(formData)
//         toast.success('Task created!')
//       }
//       setShowModal(false)
//       loadTasks()
//     } catch {
//       toast.error('Failed to save task')
//     }
//   }

  // const filteredTasks = tasks.filter((task) => {
  //   return (
  //     task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
  //     (statusFilter === '' || task.status === statusFilter) &&
  //     (projectFilter === '' || task.projectId === projectFilter)
  //   )
  // })

//   return (
//     <div className="p-4 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-bold text-gray-800">Tasks Management</h1>
//         <button onClick={openCreateModal} className="btn btn-primary flex items-center space-x-2">
//           <Plus size={18} /> <span>Add Task</span>
//         </button>
//       </div>

//       {/* Search + Filters */}
//       <div className="flex gap-4">
//         <input
//           type="text"
//           placeholder="Search tasks..."
//           className="input"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="">Status</option>
//           <option value="todo">To Do</option>
//           <option value="in-progress">In Progress</option>
//           <option value="review">Review</option>
//           <option value="completed">Completed</option>
//         </select>
//         <select className="input" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
//           <option value="">Projects</option>
//           {projects.map((proj) => (
//             <option key={proj._id} value={proj._id}>
//               {proj.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Task Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white shadow rounded-lg">
//           <thead className="bg-gray-100 text-gray-700 text-left">
//             <tr>
//               <th className="p-3">Title</th>
//               <th className="p-3">Deadline</th>
//               <th className="p-3">Priority</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Project</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTasks.map((task) => (
//               <tr key={task._id} className="border-t">
//                 <td className="p-3">{task.title}</td>
//                 <td className="p-3">{task.deadline}</td>
//                 <td className="p-3 capitalize">{task.priority}</td>
//                 <td className="p-3 capitalize">{task.status}</td>
//                 <td className="p-3">{projects.find((p) => p._id === task.projectId)?.name || 'N/A'}</td>
//                 <td className="p-3 space-x-2">
//                   <button onClick={() => openEditModal(task)} className="btn btn-sm btn-outline">
//                     <Edit2 size={16} />
//                   </button>
//                   <button onClick={() => handleDelete(task._id)} className="btn btn-sm btn-danger">
//                     <Trash2 size={16} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {filteredTasks.length === 0 && (
//           <p className="text-center text-gray-400 py-6">No tasks found</p>
//         )}
//       </div>

//       {/* Create / Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-xl w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <input
//                 type="text"
//                 className="input w-full"
//                 placeholder="Title"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 required
//               />
//               <textarea
//                 className="input w-full"
//                 placeholder="Description"
//                 rows={3}
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               />
//               <input
//                 type="date"
//                 className="input w-full"
//                 value={formData.deadline}
//                 onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
//               />
//               <select
//                 className="input w-full"
//                 value={formData.priority}
//                 onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//               <select
//                 className="input w-full"
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//               >
//                 <option value="todo">To Do</option>
//                 <option value="in-progress">In Progress</option>
//                 <option value="review">Review</option>
//                 <option value="completed">Completed</option>
//               </select>
//               <select
//                 className="input w-full"
//                 value={formData.projectId}
//                 onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
//               >
//                 <option value="">Select Project</option>
//                 {projects.map((proj) => (
//                   <option key={proj._id} value={proj._id}>
//                     {proj.name}
//                   </option>
//                 ))}
//               </select>

//               <div className="flex space-x-3">
//                 <button type="button" className="btn-secondary w-full" onClick={() => setShowModal(false)}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn-primary w-full">
//                   {editingTask ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Tasks













// // ==== tasks.jsx (Frontend React Page) ====
// import React, { useState, useEffect } from 'react';
// import { Plus, Search, Filter, Trash2, Edit3 } from 'lucide-react';
// import { taskService } from '../services/taskService';
// import { projectService } from '../services/projectService';
// import toast from 'react-hot-toast';

// const Tasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
  // const [filterProjectId, setFilterProjectId] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [newTask, setNewTask] = useState({
//     title: '', description: '', projectId: '', assignedTo: '',
//     status: 'todo', priority: 'medium', deadline: '', estimatedHours: '', actualHours: ''
//   });
//   const [editingTaskId, setEditingTaskId] = useState(null);

//   useEffect(() => {
//     loadTasks();
//     loadProjects();
//   }, []);

//   const loadTasks = async () => {
//     try {
//       const res = await taskService.getTasks();
//       setTasks(res.tasks || []);
//     } catch (e) {
//       toast.error('Failed to fetch tasks');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const loadProjects = async () => {
//   //   try {
//   //     const res = await projectService.getProjects();
//   //     console.log(res.projects)
//   //     setProjects(res.projects || []);
//   //   } catch (e) {
//   //     toast.error('Failed to fetch projects');
//   //   }
//   // };

// //   const loadProjects = async () => {
// //   try {
// //     const res = await projectService.getProjects();

// //     // ✅ extract only the array part
// //     if (Array.isArray(res.projects)) {
// //       console.log(res.projects)
// //       setProjects(res.projects);
// //     } else {
// //       console.error('Unexpected project response format:', res);
// //       setProjects([]);
// //       toast.error('Unexpected project data format');
// //     }

// //   } catch (e) {
// //     console.error('Project fetch error:', e);
// //     toast.error('Failed to fetch projects');
// //   }
// // };


// const loadProjects = async () => {
//   try {
//     const res = await projectService.getProjects(); // 👈 will be an array now
//     setProjects(res);
//   } catch (e) {
//     toast.error('Failed to fetch projects');
//   }
// };


//   const handleSave = async () => {
//     if (!newTask.title || !newTask.projectId) return toast.error('Title and Project are required');
//     try {
//       if (editingTaskId) {
//         await taskService.updateTask(editingTaskId, newTask);
//         toast.success('Task updated');
//       } else {
//         await taskService.createTask(newTask);
//         toast.success('Task created');
//       }
//       setNewTask({ title: '', description: '', projectId: '', assignedTo: '', status: 'todo', priority: 'medium', deadline: '', estimatedHours: '', actualHours: '' });
//       setEditingTaskId(null);
//       loadTasks();
//     } catch (e) {
//       toast.error('Error saving task');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await taskService.deleteTask(id);
//       toast.success('Task deleted');
//       loadTasks();
//     } catch (e) {
//       toast.error('Failed to delete');
//     }
//   };

//   const filteredTasks = tasks.filter(task => {
//     const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesProject = !filterProjectId || task.projectId === filterProjectId;
//     const matchesStatus = !filterStatus || task.status === filterStatus;
//     return matchesSearch && matchesProject && matchesStatus;
//   });

//   return (
//     <div className="p-6 space-y-6 fade-in">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Manage Team Tasks</h2>
//       </div>

//       {/* Filters */}
      // <div className="flex flex-wrap gap-4">
      //   <input
      //     type="text"
      //     className="input"
      //     placeholder="Search tasks..."
      //     value={searchTerm}
      //     onChange={(e) => setSearchTerm(e.target.value)}
      //   />

      //   <select className="input" value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)}>
      //     <option value="">All Projects</option>
      //     {projects.map(project => (
      //       <option key={project._id} value={project._id}>{project.title}</option>
      //     ))}
      //   </select>

      //   <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
      //     <option value="">All Statuses</option>
      //     <option value="todo">To Do</option>
      //     <option value="in-progress">In Progress</option>
      //     <option value="review">Review</option>
      //     <option value="completed">Completed</option>
      //   </select>

//         <button className="btn-primary" onClick={handleSave}>
//           {editingTaskId ? 'Update Task' : 'Add Task'}
//         </button>
//       </div>

//       {/* Form */}
//       <div className="grid md:grid-cols-3 gap-4">
//         <input className="input" placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
//         <input className="input" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
//         <input className="input" type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
//         <input className="input" placeholder="Estimated Hours" type="number" value={newTask.estimatedHours} onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })} />
//         <input className="input" placeholder="Actual Hours" type="number" value={newTask.actualHours} onChange={(e) => setNewTask({ ...newTask, actualHours: e.target.value })} />
//         <select className="input" value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}>
//           <option value="">Select Project</option>
//           {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
//         </select>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full border text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2">Title</th>
//               <th className="border px-3 py-2">Project</th>
//               <th className="border px-3 py-2">Status</th>
//               <th className="border px-3 py-2">Deadline</th>
//               <th className="border px-3 py-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTasks.map(task => (
//               <tr key={task._id}>
//                 <td className="border px-3 py-2">{task.title}</td>
//                 <td className="border px-3 py-2">{projects.find(p => p._id === task.projectId)?.title || '-'}</td>
//                 <td className="border px-3 py-2">{task.status}</td>
//                 <td className="border px-3 py-2">{task.deadline}</td>
//                 <td className="border px-3 py-2 space-x-2">
//                   <button onClick={() => { setNewTask(task); setEditingTaskId(task._id); }} className="text-blue-600 hover:underline"><Edit3 size={16} /></button>
//                   <button onClick={() => handleDelete(task._id)} className="text-red-600 hover:underline"><Trash2 size={16} /></button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Tasks;














// // ==== tasks.jsx (Frontend React Page) ====
// import React, { useState, useEffect } from 'react';
// import { Plus, Search, Filter, Trash2, Edit3 } from 'lucide-react';
// import { taskService } from '../services/taskService';
// import { projectService } from '../services/projectService';
// import toast from 'react-hot-toast';

// const Tasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterProjectId, setFilterProjectId] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [newTask, setNewTask] = useState({
//     title: '', description: '', projectId: '', assignedTo: '',
//     status: 'todo', priority: 'medium', deadline: '', estimatedHours: 0, actualHours: 0,
//   });
//   const [editingTaskId, setEditingTaskId] = useState(null);

//   useEffect(() => {
//     loadTasks();
//     loadProjects();
//   }, []);

//   const loadTasks = async () => {
//     try {
//       const res = await taskService.getTasks();
//       setTasks(res);
//     } catch (e) {
//       toast.error('Failed to fetch tasks');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const loadProjects = async () => {
//   //   try {
//   //     const res = await projectService.getProjects();
//   //     setProjects(res);
//   //   } catch (e) {
//   //     toast.error('Failed to fetch projects');
//   //   }
//   // };


//   const loadProjects = async () => {
//   try {
//     const res = await projectService.getProjects();

//     // 👇 Check if it's wrapped in an object
//     if (Array.isArray(res)) {
//       setProjects(res); // correct
//     } else if (Array.isArray(res.projects)) {
//       setProjects(res.projects); // correct if API returns { projects: [...] }
//     } else {
//       toast.error('Unexpected project data format');
//       console.error('Unexpected projects data:', res);
//       setProjects([]);
//     }

//   } catch (e) {
//     toast.error('Failed to fetch projects');
//     console.error('Error loading projects:', e);
//     setProjects([]);
//   }
// };


//   const handleSave = async () => {
//     try {
//       if (editingTaskId) {
//         await taskService.updateTask(editingTaskId, newTask);
//         toast.success('Task updated');
//       } else {
//         await taskService.createTask(newTask);
//         toast.success('Task created');
//       }
//       setNewTask({ title: '', description: '', projectId: '', assignedTo: '', status: 'todo', priority: 'medium', deadline: '', estimatedHours: 0, actualHours: 0 });
//       setEditingTaskId(null);
//       loadTasks();
//     } catch (e) {
//       toast.error('Error saving task');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await taskService.deleteTask(id);
//       toast.success('Task deleted');
//       loadTasks();
//     } catch (e) {
//       toast.error('Failed to delete');
//     }
//   };

//   const filteredTasks = tasks.filter(task => {
//     const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesProject = !filterProjectId || task.projectId === filterProjectId;
//     const matchesStatus = !filterStatus || task.status === filterStatus;
//     return matchesSearch && matchesProject && matchesStatus;
//   });

//   return (
//     <div className="p-6 space-y-4">
//       <h2 className="text-xl font-bold">Team Tasks</h2>

//       {/* Filters */}
//       <div className="flex gap-4 items-center">
//         <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input" />

//         <select className="input" value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)}>
//           <option value="">All Projects</option>
//           {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
//         </select>

//         <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//           <option value="">All Statuses</option>
//           <option value="todo">To Do</option>
//           <option value="in-progress">In Progress</option>
//           <option value="review">Review</option>
//           <option value="completed">Completed</option>
//         </select>

//         <button className="btn-primary" onClick={handleSave}>{editingTaskId ? 'Update' : 'Add'} Task</button>
//       </div>

//       {/* Task Form */}
//       <div className="grid grid-cols-3 gap-4">
//         <input className="input" placeholder="Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
//         <input className="input" placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
//         <input className="input" type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
//         <input className="input" placeholder="Estimated Hours" type="number" value={newTask.estimatedHours} onChange={e => setNewTask({ ...newTask, estimatedHours: e.target.value })} />
//         <input className="input" placeholder="Actual Hours" type="number" value={newTask.actualHours} onChange={e => setNewTask({ ...newTask, actualHours: e.target.value })} />
//         <select className="input" value={newTask.projectId} onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}>
//           <option value="">Select Project</option>
//           {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
//         </select>
//       </div>

//       {/* Tasks Table */}
//       <table className="w-full table-auto mt-6 border">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 border">Title</th>
//             <th className="p-2 border">Project</th>
//             <th className="p-2 border">Status</th>
//             <th className="p-2 border">Deadline</th>
//             <th className="p-2 border">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredTasks.map(task => (
//             <tr key={task._id} className="border">
//               <td className="p-2 border">{task.title}</td>
//               <td className="p-2 border">{projects.find(p => p._id === task.projectId)?.title || '-'}</td>
//               <td className="p-2 border">{task.status}</td>
//               <td className="p-2 border">{task.deadline}</td>
//               <td className="p-2 border space-x-2">
//                 <button onClick={() => {
//                   setNewTask(task);
//                   setEditingTaskId(task._id);
//                 }} className="text-blue-500"><Edit3 size={16} /></button>
//                 <button onClick={() => handleDelete(task._id)} className="text-red-500"><Trash2 size={16} /></button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Tasks;



// // === Updated Task Page for Team Lead ===
// // Features: 
// // - Search bar ✅
// // - Filter by project ✅
// // - Filter by status ✅
// // - Show project title in table ✅
// // - Edit/Delete buttons in each card ✅

// import React, { useState, useEffect } from 'react';
// import { Plus, Search, Filter, CheckSquare, Edit2, Trash2 } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import TaskCard from '../components/TaskCard';
// import LoadingSpinner from '../components/LoadingSpinner';
// import { taskService } from '../services/taskService';

// const Tasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [projectFilter, setProjectFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [projects, setProjects] = useState([]);

//   useEffect(() => {
//     loadTasks();
//   }, []);

//   const loadTasks = async () => {
//     try {
//       const data = await taskService.getTasks();
//       setTasks(data.tasks || []);
//       setProjects([...new Set(data.tasks.map(t => t.projectTitle))]);
//     } catch (error) {
//       toast.error('Failed to load tasks');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteTask = async (taskId) => {
//     try {
//       await taskService.deleteTask(taskId);
//       toast.success('Task deleted');
//       loadTasks();
//     } catch (error) {
//       toast.error('Failed to delete task');
//     }
//   };

//   const filteredTasks = tasks.filter(task => {
//     const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchProject = projectFilter ? task.projectTitle === projectFilter : true;
//     const matchStatus = statusFilter ? task.status === statusFilter : true;
//     return matchSearch && matchProject && matchStatus;
//   });

//   if (loading) {
//     return <div className="flex items-center justify-center h-64"><LoadingSpinner size="xl" /></div>;
//   }

//   return (
//     <div className="space-y-6 fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Updates</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">Create, update, and manage tasks</p>
//         </div>
//         <button className="btn-primary flex items-center space-x-2">
//           <Plus className="h-5 w-5" />
//           <span>New Task</span>
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//           <input
//             type="text"
//             placeholder="Search tasks..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="input pl-10"
//           />
//         </div>

//         <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="input">
//           <option value="">All Projects</option>
//           {projects.map((proj, idx) => (
//             <option key={idx} value={proj}>{proj}</option>
//           ))}
//         </select>

//         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
//           <option value="">All Statuses</option>
//           <option value="todo">To Do</option>
//           <option value="in-progress">In Progress</option>
//           <option value="review">Review</option>
//           <option value="completed">Completed</option>
//         </select>
//       </div>

//       {/* Tasks Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full table-auto mt-6 border rounded-lg overflow-hidden">
//           <thead className="bg-gray-100 dark:bg-gray-700">
//             <tr>
//               <th className="text-left p-3">Title</th>
//               <th className="text-left p-3">Project</th>
//               <th className="text-left p-3">Deadline</th>
//               <th className="text-left p-3">Priority</th>
//               <th className="text-left p-3">Status</th>
//               <th className="text-left p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTasks.map((task) => (
//               <tr key={task._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
//                 <td className="p-3 text-sm font-medium text-gray-800 dark:text-white">{task.title}</td>
//                 <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{task.projectTitle}</td>
//                 <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{new Date(task.deadline).toLocaleDateString()}</td>
//                 <td className="p-3 text-sm capitalize text-gray-700 dark:text-gray-300">{task.priority}</td>
//                 <td className="p-3 text-sm capitalize text-gray-700 dark:text-gray-300">{task.status}</td>
//                 <td className="p-3 space-x-3">
//                   <button className="btn-icon text-blue-600 hover:text-blue-800">
//                     <Edit2 className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => handleDeleteTask(task._id)}
//                     className="btn-icon text-red-600 hover:text-red-800"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {filteredTasks.length === 0 && (
//               <tr>
//                 <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
//                   No tasks match your filters.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Tasks;










// import React, { useState, useEffect } from 'react'
// import { Plus, Search, Filter, MessageCircle, Paperclip, CheckSquare } from 'lucide-react'
// import { toast } from 'react-hot-toast'
// import TaskCard from '../components/TaskCard'
// import LoadingSpinner from '../components/LoadingSpinner'
// import { taskService } from '../services/taskService'

// const Tasks = () => {
//   const [tasks, setTasks] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedTask, setSelectedTask] = useState(null)
//   const [showCreateModal, setShowCreateModal] = useState(false)
//   const [newTask, setNewTask] = useState({
//     title: '',
//     description: '',
//     deadline: '',
//     priority: 'medium',
//     status: 'todo'
//   })

//   useEffect(() => {
//     loadTasks()
//   }, [])


//   const loadTasks = async () => {
//   try {
//     const data = await taskService.getTasks()
//     console.log("Loaded task data:", data)

//     // ✅ Corrected handling
//     if (Array.isArray(data.tasks)) {
//       setTasks(data.tasks)
//     } else {
//       setTasks([]) // fallback
//     }
//   } catch (error) {
//     toast.error('Failed to load tasks')
//     console.error('loadTasks error:', error.response?.data || error.message)
//     setTasks([])
//   } finally {
//     setLoading(false)
//   }
// }

//   const handleCreateTask = async (e) => {
//     e.preventDefault()
//     try {
//       await taskService.createTask(newTask)
//       toast.success('Task created successfully!')
//       setShowCreateModal(false)
//       setNewTask({ title: '', description: '', deadline: '', priority: 'medium', status: 'todo' })
//       loadTasks()
//     } catch (error) {
//       toast.error('Failed to create task')
//     }
//   }

//   const handleTaskClick = (task) => {
//     setSelectedTask(task)
//   }

//   const handleStatusUpdate = async (taskId, newStatus) => {
//     try {
//       await taskService.updateTask(taskId, { status: newStatus })
//       toast.success('Task status updated!')
//       loadTasks()
//     } catch (error) {
//       toast.error('Failed to update task status')
//     }
//   }

//   const filteredTasks = tasks.filter(task =>
//     task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     task.description.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="xl" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Tasks
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Manage and track your team's tasks
//           </p>
//         </div>
        
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="btn-primary flex items-center space-x-2"
//         >
//           <Plus className="h-5 w-5" />
//           <span>New Task</span>
//         </button>
//       </div>

//       {/* Search and Filters */}
//       <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//           <input
//             type="text"
//             placeholder="Search tasks..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="input pl-10"
//           />
//         </div>
//         <button className="btn-secondary flex items-center space-x-2">
//           <Filter className="h-5 w-5" />
//           <span>Filter</span>
//         </button>
//       </div>

//       {/* Tasks Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredTasks.map((task, index) => (
//           <div key={task._id} style={{ animationDelay: `${index * 0.1}s` }}>
//             <TaskCard
//               task={task}
//               onClick={handleTaskClick}
//             />
//           </div>
//         ))}
//       </div>

//       {filteredTasks.length === 0 && (
//         <div className="text-center py-12">
//           <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//             No tasks found
//           </h3>
//           <p className="text-gray-600 dark:text-gray-400">
//             {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first task.'}
//           </p>
//         </div>
//       )}

//       {/* Create Task Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
//               Create New Task
//             </h2>
            
//             <form onSubmit={handleCreateTask} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Task Title
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={newTask.title}
//                   onChange={(e) => setNewTask({...newTask, title: e.target.value})}
//                   className="input"
//                   placeholder="Enter task title"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   rows="3"
//                   value={newTask.description}
//                   onChange={(e) => setNewTask({...newTask, description: e.target.value})}
//                   className="input"
//                   placeholder="Enter task description"
//                 />
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Deadline
//                   </label>
//                   <input
//                     type="date"
//                     value={newTask.deadline}
//                     onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
//                     className="input"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Priority
//                   </label>
//                   <select
//                     value={newTask.priority}
//                     onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
//                     className="input"
//                   >
//                     <option value="low">Low</option>
//                     <option value="medium">Medium</option>
//                     <option value="high">High</option>
//                   </select>
//                 </div>
//               </div>
              
//               <div className="flex space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateModal(false)}
//                   className="btn-secondary flex-1"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="btn-primary flex-1"
//                 >
//                   Create Task
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Task Detail Modal */}
//       {selectedTask && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-start justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                 {selectedTask.title}
//               </h2>
//               <button
//                 onClick={() => setSelectedTask(null)}
//                 className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Status
//                 </label>
//                 <select
//                   value={selectedTask.status}
//                   onChange={(e) => {
//                     handleStatusUpdate(selectedTask._id, e.target.value)
//                     setSelectedTask({...selectedTask, status: e.target.value})
//                   }}
//                   className="input"
//                 >
//                   <option value="todo">To Do</option>
//                   <option value="in-progress">In Progress</option>
//                   <option value="review">Review</option>
//                   <option value="completed">Completed</option>
//                 </select>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Description
//                 </h3>
//                 <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
//                   {selectedTask.description}
//                 </p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Comments
//                 </h3>
//                 <div className="space-y-2">
//                   {selectedTask.comments?.map((comment, index) => (
//                     <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
//                       <p className="text-sm text-gray-900 dark:text-white">{comment.text}</p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                         {comment.author} - {new Date(comment.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Tasks