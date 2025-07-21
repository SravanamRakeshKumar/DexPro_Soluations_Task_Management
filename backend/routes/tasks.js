// In tasks.js router file
import express from 'express';
import Task from '../models/Task.js';
import { authenticateToken } from '../middleware/auth.js'; // make sure it's imported

const router = express.Router();

// GET all tasks
router.get('/', authenticateToken, async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// ✅ POST create task with createdBy field
router.post('/', authenticateToken, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user._id // 👈 attach logged-in user
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Task creation failed:', error);
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

// PUT: Update Task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' })
    res.json(updatedTask)
  } catch (err) {
    console.error('Update task error:', err)
    res.status(500).json({ message: 'Failed to update task' })
  }
})

// DELETE: Delete Task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id)
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted successfully' })
  } catch (err) {
    console.error('Delete task error:', err)
    res.status(500).json({ message: 'Failed to delete task' })
  }
})


export default router;