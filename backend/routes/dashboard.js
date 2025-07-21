import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    const userId = req.user?._id;

    // 📊 Common project/task/user stats
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      onHoldProjects,
      completedProjects,
      inProgressProjects,
      completedTasks,
      tasksInProgress,
      tasksAssigned,
      tasksCompleted,
      tasksPending,
      userTasksInProgress,
      userTasksCompleted
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'onhold' }),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'in-progress' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'in-progress' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: { $in: ['todo', 'in-progress', 'review'] } }),
      Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' })
    ]);

    // 👤 Role Distribution
    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const roleDistribution = {};
    roleCounts.forEach(r => {
      roleDistribution[r._id] = r.count;
    });

    // 📊 Project Status Bar Chart
    const projectStatusAggregation = await Project.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const projectStatus = {};
    projectStatusAggregation.forEach(p => {
      projectStatus[p._id] = p.count;
    });

    // 📈 Team Lead Task Progress
    let taskProgress = {};
    if (role === 'team lead') {
      const progressAgg = await Task.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);
      progressAgg.forEach(p => {
        taskProgress[p._id] = p.count;
      });
    }

    // 🕒 Weekly Hours (for employee)
    let weeklyHours = {};
    if (role === 'employee') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const tasks = await Task.find({
        assignedTo: userId,
        updatedAt: { $gte: startOfWeek }
      });

      tasks.forEach(task => {
        const day = new Date(task.updatedAt).toLocaleDateString('en-US', { weekday: 'short' });
        weeklyHours[day] = (weeklyHours[day] || 0) + (task.actualHours || 0);
      });
    }

    // 🧮 Time Calculations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayTasks = await Task.find({
      assignedTo: userId,
      updatedAt: { $gte: todayStart, $lte: todayEnd }
    });
    const todayHours = todayTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);

    const allTasks = await Task.find({ assignedTo: userId });
    const totalHours = allTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);

    // 🧾 Employee Project Overview
    let userProjects = [];
    let userTotalProjects = 0;
    let userCompletedProjects = 0;
    let userInProgressProjects = 0;

    if (role === 'employee') {
      userProjects = await Project.find({ teamMembers: userId });
      userTotalProjects = userProjects.length;
      userCompletedProjects = userProjects.filter(p => p.status === 'completed').length;
      userInProgressProjects = userProjects.filter(p =>
        ['in-progress', 'active'].includes(p.status)
      ).length;
    }

    // ✅ Final Response
    res.status(200).json({
      // Admin Cards
      totalProjects,
      activeProjects,
      pendingProjects: onHoldProjects,
      completedProjects,
      inProgressProjects,
      holdProjects: onHoldProjects,

      // Additional stats
      totalUsers,
      completedTasks,
      tasksInProgress,
      tasksAssigned,
      tasksCompleted,
      tasksPending,
      userTasksInProgress,
      userTasksCompleted,
      todayHours,
      totalHours,
      roleDistribution,
      projectStatus,
      taskProgress,
      weeklyHours,
      userTotalProjects,
      userCompletedProjects,
      userInProgressProjects
    });

  } catch (err) {
    console.error('Error in /api/dashboard/stats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;






























// import express from 'express';
// import { authenticateToken } from '../middleware/auth.js';
// import User from '../models/User.js';
// import Project from '../models/Project.js';
// import Task from '../models/Task.js';

// const router = express.Router();

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
//       completedProjects,
//       inProgressProjects,
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
//       Project.countDocuments({ status: 'completed' }),
//       Project.countDocuments({ status: 'in-progress' }),
//       Task.countDocuments({ status: 'completed' }),
//       Task.countDocuments({ status: 'in-progress' }),
//       Task.countDocuments(),
//       Task.countDocuments({ status: 'completed' }),
//       Task.countDocuments({ status: { $in: ['todo', 'in-progress', 'review'] } }),
//       Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
//       Task.countDocuments({ assignedTo: userId, status: 'completed' })
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

//     // ✅ Employee-specific project stats
//     let userProjects = [];
//     let userTotalProjects = 0;
//     let userCompletedProjects = 0;
//     let userInProgressProjects = 0;

//     if (role === 'employee') {
//       userProjects = await Project.find({ teamMembers: userId });

//       userTotalProjects = userProjects.length;
//       userCompletedProjects = userProjects.filter(p => p.status === 'completed').length;
//       userInProgressProjects = userProjects.filter(p =>
//         ['in-progress', 'active'].includes(p.status)
//       ).length;
//     }

//     // ✅ Final Response
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
//       weeklyHours,

//       // ✅ employee stats
//       userTotalProjects,
//       userCompletedProjects,
//       userInProgressProjects
//     });

//   } catch (err) {
//     console.error('Error in /api/dashboard/stats:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// export default router;
















// import express from 'express';
// import { authenticateToken } from '../middleware/auth.js';
// import User from '../models/User.js';
// import Project from '../models/Project.js';
// import Task from '../models/Task.js';

// const router = express.Router();

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


// export default router;
