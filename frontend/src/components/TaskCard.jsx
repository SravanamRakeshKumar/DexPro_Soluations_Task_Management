import React from 'react'
import { Calendar, User, MessageCircle, Paperclip } from 'lucide-react'

const TaskCard = ({ task, onClick }) => {
  const statusColors = {
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }

  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500'
  }

  return (
    <div 
      className={`card p-4 hover:shadow-md cursor-pointer transition-all duration-200 border-l-4 ${priorityColors[task.priority]} fade-in`}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {task.title}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{task.assignedTo?.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{task.comments.length}</span>
            </div>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="h-4 w-4" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard