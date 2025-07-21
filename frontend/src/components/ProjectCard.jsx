import React from 'react'
import { Calendar, Users, CheckSquare, MoreVertical } from 'lucide-react'

const ProjectCard = ({ project, onEdit, onDelete }) => {
  // console.log("project is:",project)

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    onhold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }

  const progress = project.totalTasks > 0 ? (project.completedTasks / project.totalTasks) * 100 : 0
  console.log(project)

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {project.name}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{project.teamMembers?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckSquare className="h-4 w-4" />
            <span>{project.completedTasks}/{project.totalTasks}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <button 
          onClick={() => onEdit(project)}
          className="btn-primary text-xs px-3 py-1"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(project._id)}
          className="btn-secondary text-xs px-3 py-1 text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default ProjectCard