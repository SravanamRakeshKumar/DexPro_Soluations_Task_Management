import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Worklog from '../models/Worklog.js'

dotenv.config()

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dexproDB')
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})
    await Worklog.deleteMany({})

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@dexpro.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin'
      },
      {
        name: 'Team Lead',
        email: 'teamlead@dexpro.com',
        password: await bcrypt.hash('teamlead123', 12),
        role: 'teamlead'
      },
      {
        name: 'Project Coordinator',
        email: 'coordinator@dexpro.com',
        password: await bcrypt.hash('coordinator123', 12),
        role: 'coordinator'
      },
      {
        name: 'John Employee',
        email: 'emp@dexpro.com',
        password: await bcrypt.hash('emp123', 12),
        role: 'employee'
      },
      {
        name: 'Jane Developer',
        email: 'jane@dexpro.com',
        password: await bcrypt.hash('jane123', 12),
        role: 'employee'
      }
    ])

    console.log('Users created')

    // Create projects
    const projects = await Project.create([
      {
        name: 'Website Redesign',
        description: 'Complete redesign of the company website',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        createdBy: users[1]._id, // Team Lead
        teamMembers: [users[3]._id, users[4]._id],
        status: 'active'
      },
      {
        name: 'Mobile App Development',
        description: 'Develop a new mobile application',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        createdBy: users[1]._id, // Team Lead
        teamMembers: [users[3]._id, users[4]._id],
        status: 'active'
      },
      {
        name: 'Database Migration',
        description: 'Migrate legacy database to new system',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        createdBy: users[1]._id, // Team Lead
        teamMembers: [users[3]._id],
        status: 'completed'
      }
    ])

    console.log('Projects created')

    // Create tasks
    const tasks = await Task.create([
      {
        title: 'Design Homepage Layout',
        description: 'Create wireframes and mockups for the new homepage',
        projectId: projects[0]._id,
        assignedTo: users[3]._id,
        createdBy: users[1]._id,
        status: 'completed',
        priority: 'high',
        deadline: new Date('2024-02-15'),
        estimatedHours: 20
      },
      {
        title: 'Implement User Authentication',
        description: 'Set up login and registration functionality',
        projectId: projects[0]._id,
        assignedTo: users[4]._id,
        createdBy: users[1]._id,
        status: 'in-progress',
        priority: 'high',
        deadline: new Date('2024-03-01'),
        estimatedHours: 30
      },
      {
        title: 'Create Contact Form',
        description: 'Build a responsive contact form with validation',
        projectId: projects[0]._id,
        assignedTo: users[3]._id,
        createdBy: users[1]._id,
        status: 'todo',
        priority: 'medium',
        deadline: new Date('2024-03-15'),
        estimatedHours: 15
      },
      {
        title: 'Mobile App UI Design',
        description: 'Design the user interface for the mobile application',
        projectId: projects[1]._id,
        assignedTo: users[4]._id,
        createdBy: users[1]._id,
        status: 'in-progress',
        priority: 'high',
        deadline: new Date('2024-04-01'),
        estimatedHours: 40
      },
      {
        title: 'Database Schema Design',
        description: 'Design the database schema for the new system',
        projectId: projects[2]._id,
        assignedTo: users[3]._id,
        createdBy: users[1]._id,
        status: 'completed',
        priority: 'high',
        deadline: new Date('2024-02-01'),
        estimatedHours: 25
      }
    ])

    console.log('Tasks created')

    // Update project task counts
    for (const project of projects) {
      const projectTasks = tasks.filter(task => task.projectId.toString() === project._id.toString())
      const completedTasks = projectTasks.filter(task => task.status === 'completed')
      
      await Project.findByIdAndUpdate(project._id, {
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length
      })
    }

    // Create worklogs
    const worklogs = await Worklog.create([
      {
        taskId: tasks[0]._id,
        userId: users[3]._id,
        timeSpent: 8,
        date: new Date('2024-01-20'),
        notes: 'Created initial wireframes and gathered requirements'
      },
      {
        taskId: tasks[0]._id,
        userId: users[3]._id,
        timeSpent: 6,
        date: new Date('2024-01-21'),
        notes: 'Refined designs based on feedback'
      },
      {
        taskId: tasks[1]._id,
        userId: users[4]._id,
        timeSpent: 7,
        date: new Date('2024-02-01'),
        notes: 'Set up authentication middleware and routes'
      },
      {
        taskId: tasks[1]._id,
        userId: users[4]._id,
        timeSpent: 5,
        date: new Date('2024-02-02'),
        notes: 'Implemented login and registration forms'
      },
      {
        taskId: tasks[4]._id,
        userId: users[3]._id,
        timeSpent: 8,
        date: new Date('2024-01-25'),
        notes: 'Analyzed existing database structure'
      },
      {
        taskId: tasks[4]._id,
        userId: users[3]._id,
        timeSpent: 9,
        date: new Date('2024-01-26'),
        notes: 'Designed new database schema with optimizations'
      }
    ])

    console.log('Worklogs created')

    // Update task actual hours
    for (const task of tasks) {
      const taskWorklogs = worklogs.filter(log => log.taskId.toString() === task._id.toString())
      const totalHours = taskWorklogs.reduce((sum, log) => sum + log.timeSpent, 0)
      
      await Task.findByIdAndUpdate(task._id, {
        actualHours: totalHours
      })
    }

    console.log('Seed data created successfully!')
    console.log('\nDemo accounts:')
    console.log('Admin: admin@dexpro.com / admin123')
    console.log('Team Lead: teamlead@dexpro.com / teamlead123')
    console.log('Coordinator: coordinator@dexpro.com / coordinator123')
    console.log('Employee: emp@dexpro.com / emp123')
    console.log('Employee: jane@dexpro.com / jane123')

    mongoose.connection.close()
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()