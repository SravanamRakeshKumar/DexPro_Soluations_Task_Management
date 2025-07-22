import express from 'express'
import { body, validationResult } from 'express-validator'
import Project from '../models/Project.js'
import ActivityLog from '../models/ActivityLog.js'
import { authenticateToken, authorize } from '../middleware/auth.js'

const router = express.Router()

// GET: All Projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, createdBy, page = 1, limit = 10 } = req.query

    const filter = {}
    if (status) filter.status = status
    if (createdBy) filter.createdBy = createdBy

//     if (req.user.role === 'Employee') {
//   filter.teamMembers = req.user._id
// }

if (req.user.role === 'Employee') {
  filter.teamMembers = req.user._id;
} else if (req.user.role === 'Team Lead') {
  filter.createdBy = req.user._id; // 👈 Only fetch team lead's own projects
}



    const projects = await Project.find(filter)
  .populate('createdBy', 'name email')
  .populate('teamLead', 'name email')
  .populate('teamCoordinators', 'name email')
  .populate('teamMembers', 'name email')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .exec(); // ✅ ensures all fields are populated

    const total = await Project.countDocuments(filter)

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    })
  } catch (err) {
    console.error('Get projects error:', err)
    res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

// GET: Single Project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamLead', 'name email')
      .populate('teamCoordinators', 'name email')
      .populate('teamMembers', 'name email')

    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    console.error('Get project error:', err)
    res.status(500).json({ message: 'Failed to fetch project' })
  }
})

// POST: Create Project
router.post('/', [
  authenticateToken,
  authorize(['Admin', 'Team Lead']),
  body('name').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const {
      name, description, startDate, endDate,
      teamLead = [], teamCoordinators = [], teamMembers = [],
      totalTasks = 0, completedTasks = 0
    } = req.body

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      createdBy: req.user._id,
      teamLead,
      teamCoordinators,
      teamMembers,
      totalTasks,
      completedTasks
    })

    // await project.save()
    const savedProject = await project.save()

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'project_created',
      targetId: project._id,
      targetType: 'Project',
      details: { name: project.name }
    })

   const populatedProject = await Project.findById(savedProject._id)
  .populate('createdBy', 'name email')
  .populate('teamLead', 'name email')
  .populate('teamCoordinators', 'name email')
  .populate('teamMembers', 'name email')

    res.status(201).json(populatedProject)
  } catch (err) {
    console.error('Create project error:', err)
    res.status(500).json({ message: 'Failed to create project' })
  }
})

// PUT: Update Project
router.put('/:id', [
  authenticateToken,
  authorize(['Admin', 'Team Lead']),
  body('name').optional().trim().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (
      req.user.role === 'Team Lead' &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Unauthorized to update this project' })
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('teamLead', 'name email')
      .populate('teamCoordinators', 'name email')
      .populate('teamMembers', 'name email')

    await ActivityLog.create({
      userId: req.user._id,
      action: 'project_updated',
      targetId: project._id,
      targetType: 'Project',
      details: { name: project.name }
    })

    res.json(updatedProject)
  } catch (err) {
    console.error('Update project error:', err)
    res.status(500).json({ message: 'Failed to update project' })
  }
})

// DELETE: Delete Project
router.delete('/:id', [
  authenticateToken,
  authorize(['Admin', 'Team Lead'])
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (
      req.user.role === 'Team Lead' &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Unauthorized to delete this project' })
    }

    await Project.findByIdAndDelete(req.params.id)

    await ActivityLog.create({
      userId: req.user._id,
      action: 'project_deleted',
      targetId: project._id,
      targetType: 'Project',
      details: { name: project.name }
    })

    res.json({ message: 'Project deleted successfully' })
  } catch (err) {
    console.error('Delete project error:', err)
    res.status(500).json({ message: 'Failed to delete project' })
  }
})

export default router