import React, { useEffect, useState } from 'react'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import {
  ClipboardCheck, UserCircle, Calendar, CheckCircle, Users, Briefcase
} from 'lucide-react'

const MyTasks = () => {
  const { user, loading: userLoading } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState({})
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  useEffect(() => {
    if (!user || userLoading) return
    loadData()
  }, [user, userLoading])

  const loadData = async () => {
    try {
      const [allTasks, projectRes] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects()
      ])

      const myTasks = allTasks.filter(
        task => task.assignedTo?.toString() === user.id?.toString()
      )

      // Convert project list or object into consistent map
      let projectMap = {}
      if (Array.isArray(projectRes)) {
        projectMap = Object.fromEntries(
          projectRes.map(p => [p._id || p.id, p])
        )
      } else if (projectRes.projects && Array.isArray(projectRes.projects)) {
        projectMap = Object.fromEntries(
          projectRes.projects.map(p => [p._id || p.id, p])
        )
      } else {
        projectMap = projectRes // if already in key-value format
      }

      setTasks(myTasks)
      setProjects(projectMap)
      console.log(projectMap)
    } catch (err) {
      console.error('❌ Error loading data:', err)
      toast.error('Failed to load your tasks')
    }
  }

  const getProjectDetails = (projectId) => {
    const project = projects[projectId]
    return {
      title: project?.title || project?.name || 'N/A',
      teamLead: project?.teamLead?.name || 'N/A',
      coordinator: project?.coordinator?.name || 'N/A',
      teamMembers: project?.teamMembers || []
    }
  }

  return (
    <div className="p-6 fade-in">
      <h1 className="text-3xl font-bold mb-8 text-indigo-700">🧑‍💻 My Assigned Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">You don’t have any tasks assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, index) => {
            const {
              title,
              // teamLead,
              // coordinator,
              teamMembers
            } = getProjectDetails(task.projectId)

            return (
              <div
                key={task._id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  <ClipboardCheck className="inline w-5 h-5 text-indigo-500 mr-2" />
                  Task-{index + 1}
                </h2>

                <div className="text-sm text-gray-700 space-y-1 leading-6">
                  <p><strong>📌 Task:</strong> {task.title}</p>
                  <p><Briefcase className="inline w-4 h-4 mr-1" /> <strong>Project:</strong> {title}</p>
                  {/* <p><UserCircle className="inline w-4 h-4 mr-1" /> <strong>Team Lead:</strong> {teamLead.name}</p> */}
                  {/* <p><UserCircle className="inline w-4 h-4 mr-1" /> <strong>Coordinator:</strong> {coordinator.name}</p> */}
                  <p><Calendar className="inline w-4 h-4 mr-1" /> <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                  <p><CheckCircle className="inline w-4 h-4 mr-1 text-green-500" /> <strong>Status:</strong> <span className="capitalize text-blue-600">{task.status}</span></p>

                  <p className="pt-2"><Users className="inline w-4 h-4 mr-1" /> <strong>Team Members:</strong></p>
                  {teamMembers.length > 0 ? (
                    <ul className="list-disc list-inside text-sm pl-4 text-gray-600">
                      {teamMembers.map((member, i) => (
                        <li key={i}>{member.name || member.username || member.email || 'Unknown'}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm italic pl-2">No members found</p>
                  )}
                </div>

                {/* Description Toggle */}
                {expandedTaskId === task._id ? (
                  <>
                    <p className="mt-3 text-gray-700 text-sm">
                      {task.description || 'No description provided.'}
                    </p>
                    <button
                      onClick={() => setExpandedTaskId(null)}
                      className="text-indigo-600 mt-3 text-sm underline"
                    >
                      Hide Details
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setExpandedTaskId(task._id)}
                    className="text-indigo-600 mt-3 text-sm underline"
                  >
                    View More
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyTasks