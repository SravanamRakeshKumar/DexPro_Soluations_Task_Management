import express from 'express'
import { Parser } from 'json2csv'
import Worklog from '../models/Worklog.js'
import Task from '../models/Task.js'
import Project from '../models/Project.js'
import User from '../models/User.js'
import ActivityLog from '../models/ActivityLog.js'
import { authenticateToken, authorize } from '../middleware/auth.js'

const router = express.Router()

// Get reports data
router.get('/', [
  authenticateToken,
  authorize(['admin', 'teamlead'])
], async (req, res) => {
  try {
    const { startDate, endDate, userId, taskId, page = 1, limit = 10 } = req.query
    
    const filter = {}
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }
    if (userId) filter.userId = userId
    if (taskId) filter.taskId = taskId

    const reports = await Worklog.find(filter)
      .populate('userId', 'name email role')
      .populate('taskId', 'title status priority')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Worklog.countDocuments(filter)

    // Calculate summary statistics
    const summary = await Worklog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$timeSpent' },
          totalLogs: { $sum: 1 },
          avgHours: { $avg: '$timeSpent' }
        }
      }
    ])

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      summary: summary[0] || { totalHours: 0, totalLogs: 0, avgHours: 0 }
    })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ message: 'Failed to fetch reports' })
  }
})

// Export reports
router.get('/export', [
  authenticateToken,
  authorize(['admin', 'teamlead'])
], async (req, res) => {
  try {
    const { startDate, endDate, userId, taskId, format = 'csv' } = req.query
    
    const filter = {}
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }
    if (userId) filter.userId = userId
    if (taskId) filter.taskId = taskId

    const reports = await Worklog.find(filter)
      .populate('userId', 'name email role')
      .populate('taskId', 'title status priority')
      .sort({ date: -1 })
      .lean()

    if (format === 'csv') {
      const fields = [
        { label: 'Date', value: 'date' },
        { label: 'User Name', value: 'userId.name' },
        { label: 'User Email', value: 'userId.email' },
        { label: 'Task Title', value: 'taskId.title' },
        { label: 'Task Status', value: 'taskId.status' },
        { label: 'Task Priority', value: 'taskId.priority' },
        { label: 'Time Spent (hours)', value: 'timeSpent' },
        { label: 'Notes', value: 'notes' },
        { label: 'Approved', value: 'isApproved' }
      ]

      const json2csvParser = new Parser({ fields })
      const csv = json2csvParser.parse(reports)

      res.header('Content-Type', 'text/csv')
      res.attachment(`worklog-report-${new Date().toISOString().split('T')[0]}.csv`)
      res.send(csv)
    } else {
      // JSON format
      res.json({
        exportDate: new Date().toISOString(),
        filters: { startDate, endDate, userId, taskId },
        data: reports
      })
    }
  } catch (error) {
    console.error('Export reports error:', error)
    res.status(500).json({ message: 'Failed to export reports' })
  }
})

// Get activity logs
router.get('/activity', [
  authenticateToken,
  authorize(['admin', 'teamlead'])
], async (req, res) => {
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 10 } = req.query
    
    const filter = {}
    if (userId) filter.userId = userId
    if (action) filter.action = action
    if (startDate || endDate) {
      filter.timestamp = {}
      if (startDate) filter.timestamp.$gte = new Date(startDate)
      if (endDate) filter.timestamp.$lte = new Date(endDate)
    }

    const activities = await ActivityLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await ActivityLog.countDocuments(filter)

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get activity logs error:', error)
    res.status(500).json({ message: 'Failed to fetch activity logs' })
  }
})

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
    }

    // Get basic counts
    const [
      totalUsers,
      totalProjects,
      totalTasks,
      totalWorklogs
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Project.countDocuments(dateFilter),
      Task.countDocuments(dateFilter),
      Worklog.countDocuments(dateFilter)
    ])

    // Get task status breakdown
    const taskStatusBreakdown = await Task.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get project status breakdown
    const projectStatusBreakdown = await Project.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get total hours worked
    const totalHours = await Worklog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$timeSpent' }
        }
      }
    ])

    // Get most active users
    const mostActiveUsers = await Worklog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$userId',
          totalHours: { $sum: '$timeSpent' },
          totalLogs: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalHours: 1,
          totalLogs: 1
        }
      },
      { $sort: { totalHours: -1 } },
      { $limit: 5 }
    ])

    res.json({
      overview: {
        totalUsers,
        totalProjects,
        totalTasks,
        totalWorklogs,
        totalHours: totalHours[0]?.totalHours || 0
      },
      taskStatusBreakdown,
      projectStatusBreakdown,
      mostActiveUsers
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' })
  }
})

export default router