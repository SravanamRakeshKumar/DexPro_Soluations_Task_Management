import nodemailer from 'nodemailer'
import User from '../models/User.js'

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Email templates
const emailTemplates = {
  task_assigned: {
    subject: 'New Task Assigned: {taskTitle}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Task Assigned</h2>
        <p>Hello,</p>
        <p>You have been assigned a new task: <strong>{taskTitle}</strong></p>
        <p>Assigned by: {assignedBy}</p>
        <p>Please log in to DexPro to view the task details.</p>
        <br>
        <p>Best regards,<br>DexPro Team</p>
      </div>
    `
  },
  task_status_changed: {
    subject: 'Task Status Updated: {taskTitle}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Task Status Updated</h2>
        <p>Hello,</p>
        <p>The status of your task <strong>{taskTitle}</strong> has been updated to: <strong>{newStatus}</strong></p>
        <p>Updated by: {changedBy}</p>
        <p>Please log in to DexPro to view the task details.</p>
        <br>
        <p>Best regards,<br>DexPro Team</p>
      </div>
    `
  },
  worklog_submitted: {
    subject: 'Work Log Submitted: {taskTitle}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Work Log Submitted</h2>
        <p>Hello,</p>
        <p><strong>{employeeName}</strong> has submitted a work log for task: <strong>{taskTitle}</strong></p>
        <p>Time logged: {timeSpent} hours</p>
        <p>Please log in to DexPro to review the work log.</p>
        <br>
        <p>Best regards,<br>DexPro Team</p>
      </div>
    `
  }
}

export const sendNotificationEmail = async (userId, templateName, variables) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      console.error('User not found for email notification:', userId)
      return
    }

    const template = emailTemplates[templateName]
    if (!template) {
      console.error('Email template not found:', templateName)
      return
    }

    let subject = template.subject
    let html = template.html

    // Replace variables in subject and html
    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), variables[key])
      html = html.replace(new RegExp(placeholder, 'g'), variables[key])
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject,
      html
    }

    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${user.email}: ${subject}`)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export const sendBulkEmail = async (userIds, templateName, variables) => {
  try {
    const promises = userIds.map(userId => 
      sendNotificationEmail(userId, templateName, variables)
    )
    await Promise.all(promises)
  } catch (error) {
    console.error('Error sending bulk emails:', error)
  }
}