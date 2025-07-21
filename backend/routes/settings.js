import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// ✅ Get current user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error fetching profile' })
  }
})

// ✅ Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error updating profile' })
  }
})

// ✅ Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error changing password' })
  }
})

// ✅ Deactivate account
router.post('/deactivate', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false })
    res.json({ message: 'Account deactivated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error deactivating account' })
  }
})

export default router