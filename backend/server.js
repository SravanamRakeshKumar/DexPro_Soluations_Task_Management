import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

// Import routes
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import worklogRoutes from './routes/worklogs.js'
import reportRoutes from './routes/reports.js'
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js'  // ✅ Add this
import settingsRoutes from './routes/settings.js'; // ✅ Add this


// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("Server is working fine 🎉");
});

// Security middleware
app.use(helmet())
app.use(cors())
app.use(morgan('common'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/worklogs', worklogRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes) // ✅ Add this line
app.use('/api/settings', settingsRoutes); // ✅ Add this

// import settingsRoutes from './routes/settings.js'; // ✅ Add this


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Database connection
mongoose.connect(process.env.MONGO_URI)

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB')
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app