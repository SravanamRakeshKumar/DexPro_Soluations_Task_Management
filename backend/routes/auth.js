import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}




// router.get('/stats', authenticateToken, async (req, res) => {
//   try {
//     const role = req.user?.role?.toLowerCase();
//     const userId = req.user?._id;

//     // Common data
//     const [
//       totalUsers,
//       totalProjects,
//       activeProjects,
//       pendingProjects,
//       completedTasks,
//       tasksInProgress,
//       tasksAssigned,
//       tasksCompleted,
//       tasksPending,
//       userTasksInProgress,
//       userTasksCompleted
//     ] = await Promise.all([
//       User.countDocuments(),
//       Project.countDocuments(),
//       Project.countDocuments({ status: 'active' }),
//       Project.countDocuments({ status: 'onhold' }),
//       Task.countDocuments({ status: 'completed' }),
//       Task.countDocuments({ status: 'in-progress' }),
//       Task.countDocuments(),
//       Task.countDocuments({ status: 'completed' }),
//       Task.countDocuments({ status: { $in: ['todo', 'in-progress', 'review'] } }),
//       Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
//       Task.countDocuments({ assignedTo: userId, status: 'completed' }),
//     ]);

//     // 👤 Pie Chart: Role Distribution (Admin)
//     const roleCounts = await User.aggregate([
//       { $group: { _id: "$role", count: { $sum: 1 } } }
//     ]);
//     const roleDistribution = {};
//     roleCounts.forEach(r => {
//       roleDistribution[r._id] = r.count;
//     });

//     // 📊 Bar Chart: Project Status Overview (Admin)
//     const projectStatusAggregation = await Project.aggregate([
//       { $group: { _id: "$status", count: { $sum: 1 } } }
//     ]);
//     const projectStatus = {};
//     projectStatusAggregation.forEach(p => {
//       projectStatus[p._id] = p.count;
//     });

//     // 📉 Team Lead Chart: Task Progress
//     let taskProgress = {};
//     if (role === 'team lead') {
//       const progressAgg = await Task.aggregate([
//         { $group: { _id: "$status", count: { $sum: 1 } } }
//       ]);
//       progressAgg.forEach(p => {
//         taskProgress[p._id] = p.count;
//       });
//     }

//     // 🕒 Employee Chart: Weekly Hours
//     let weeklyHours = {};
//     if (role === 'employee') {
//       const startOfWeek = new Date();
//       startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);

//       const tasks = await Task.find({
//         assignedTo: userId,
//         updatedAt: { $gte: startOfWeek }
//       });

//       tasks.forEach(task => {
//         const day = new Date(task.updatedAt).toLocaleDateString('en-US', { weekday: 'short' });
//         weeklyHours[day] = (weeklyHours[day] || 0) + (task.actualHours || 0);
//       });
//     }

//     // 🧮 Time calculations
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const todayTasks = await Task.find({ assignedTo: userId, updatedAt: { $gte: todayStart, $lte: todayEnd } });
//     const todayHours = todayTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);

//     const allTasks = await Task.find({ assignedTo: userId });
//     const totalHours = allTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);

//     res.status(200).json({
//       totalUsers,
//       totalProjects,
//       activeProjects,
//       pendingProjects,
//       completedTasks,
//       tasksInProgress,
//       tasksAssigned,
//       tasksCompleted,
//       tasksPending,
//       userTasksInProgress,
//       userTasksCompleted,
//       todayHours,
//       totalHours,
//       roleDistribution,
//       projectStatus,
//       taskProgress,
//       weeklyHours
//     });

//   } catch (err) {
//     console.error('Error in /api/dashboard/stats:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is inactive' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    // Generate token
    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Verify token
// router.get('/verify', authenticateToken, async (req, res) => {
//   try {
//     res.json({
//       id: req.user._id,
//       name: req.user.name,
//       email: req.user.email,
//       role: req.user.role
//     })
//   } catch (error) {
//     console.error('Token verification error:', error)
//     res.status(500).json({ message: 'Token verification failed' })
//   }
// })

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Always wrap user details in a `user` key for frontend consistency
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Token verification failed' });
  }
});


// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'logout',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Logout failed' })
  }
})

export default router