import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'onhold', 'cancelled','in-progress'],
    default: 'active'
  },

  // ✅ This is the missing field causing the error
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  teamLead: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teamCoordinators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalTasks: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update timestamp on save
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Project', projectSchema)