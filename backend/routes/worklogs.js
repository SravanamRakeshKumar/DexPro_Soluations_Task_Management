import express from 'express';
import Worklog from '../models/Worklog.js';
import User from '../models/User.js';
import { authenticateToken as protect } from '../middleware/auth.js';

const router = express.Router();

// 1. Get current user's logs (Employee)
router.get('/my', protect, async (req, res) => {
  try {
    const logs = await Worklog.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your logs' });
  }
});

// 2. Get all logs for Admin, Coordinator, TeamLead
router.get('/', protect, async (req, res) => {
  try {
    let logs = [];

    console.log('Logged in user:', req.user.role);

  
    if (req.user.role === 'Admin' || req.user.role === 'Coordinator') {
      logs = await Worklog.find().sort({ date: -1 });
    } else if (req.user.role === 'Team Lead') {
      const teamMembers = await User.find({ teamLead: req.user._id }, '_id');
      const memberIds = teamMembers.map(m => m._id);
      logs = await Worklog.find({ userId: { $in: memberIds } }).sort({ date: -1 });
    } else {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

// 3. Log work
router.post('/', protect, async (req, res) => {
  try {
    const { projectId, taskId, startDate, endDate, todayTimeSpent, notes } = req.body;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let existingLog = await Worklog.findOne({
      userId: req.user._id,
      projectId,
      taskId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    if (existingLog) {
      existingLog.todayTimeSpent.push(...todayTimeSpent);
      existingLog.endDate = new Date(endDate);
      if (notes) existingLog.notes = notes;
      await existingLog.save();
      return res.status(200).json(existingLog);
    }

    const newLog = new Worklog({
      userId: req.user._id,
      projectId,
      taskId,
      startDate,
      endDate,
      todayTimeSpent,
      date: new Date(),
      notes
    });

    const saved = await newLog.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log work' });
  }
});

// 4. Update log
router.put('/:id', protect, async (req, res) => {
  try {
    const { todayTimeSpent, endDate, notes } = req.body;
    const log = await Worklog.findById(req.params.id);

    if (!log) return res.status(404).json({ message: 'Log not found' });
    if (log.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (typeof todayTimeSpent === 'number') {
      log.todayTimeSpent.push(todayTimeSpent);
    }

    if (endDate) log.endDate = endDate;
    if (notes) log.notes = notes;

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update log' });
  }
});

export default router;