import mongoose from 'mongoose'

const worklogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  todayTimeSpent: {
    type: [Number],  // Store multiple session durations (in minutes)
    default: []
  },
  date: {
    type: Date,
    default: () => new Date()
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  },
  updatedAt: {
    type: Date,
    default: () => new Date()
  }
})

// Auto update timestamp before save
worklogSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Indexes for performance
worklogSchema.index({ userId: 1, date: -1 })
worklogSchema.index({ projectId: 1 })
worklogSchema.index({ taskId: 1 })

export default mongoose.model('Worklog', worklogSchema)