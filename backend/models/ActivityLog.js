import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'project_created',
      'project_updated',
      'project_deleted',
      'task_created',
      'task_updated',
      'task_deleted',
      'task_assigned',
      'task_completed',
      'worklog_created',
      'worklog_updated',
      'worklog_deleted',
      'comment_added',
      'file_uploaded'
    ]
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    // Reference to the affected entity (project, task, etc.)
  },
  targetType: {
    type: String,
    enum: ['Project', 'Task', 'Worklog', 'User']
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

// Index for better query performance
activityLogSchema.index({ userId: 1, timestamp: -1 })
activityLogSchema.index({ targetId: 1, timestamp: -1 })

export default mongoose.model('ActivityLog', activityLogSchema)