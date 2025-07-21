import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'completed'],
    default: 'todo'
  },
  deadline: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update timestamp on save
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Task', taskSchema)

// const TaskSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   projectId: String,
//   assignedTo: String,
//   createdBy: String,
//   status: String,
//   priority: String,
//   deadline: String,
//   estimatedHours: Number,
//   actualHours: Number,
// }, { timestamps: true });

// export default mongoose.model('Task', TaskSchema);





// import mongoose from 'mongoose'

// const commentSchema = new mongoose.Schema({
//   text: {
//     type: String,
//     required: true
//   },
//   author: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// })

// const attachmentSchema = new mongoose.Schema({
//   filename: {
//     type: String,
//     required: true
//   },
//   originalName: {
//     type: String,
//     required: true
//   },
//   mimeType: {
//     type: String,
//     required: true
//   },
//   size: {
//     type: Number,
//     required: true
//   },
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   uploadedAt: {
//     type: Date,
//     default: Date.now
//   }
// })

// import mongoose from 'mongoose'

// const taskSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   assignedTo: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['todo', 'in-progress', 'review', 'completed'],
//     default: 'todo'
//   },
//   // priority: {
//   //   type: String,
//   //   enum: ['low', 'medium', 'high'],
//   //   default: 'medium'
//   // },
//   deadline: {
//     type: Date
//   },
//   // estimatedHours: {
//   //   type: Number,
//   //   default: 0
//   // },
//   // actualHours: {
//   //   type: Number,
//   //   default: 0
//   // },
//   // comments: [commentSchema],
//   // attachments: [attachmentSchema],
//   // tags: [String],
//   // createdAt: {
//   //   type: Date,
//   //   default: Date.now
//   // },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// })

// // Update timestamp on save
// taskSchema.pre('save', function(next) {
//   this.updatedAt = Date.now()
//   next()
// })

// export default mongoose.model('Task', taskSchema)